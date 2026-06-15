/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import CustomerView from './components/CustomerView';
import StaffDashboard from './components/StaffDashboard';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import SuperAdmin from './components/SuperAdmin';
import ProposalView from './components/ProposalView';
import Footer from './components/Footer';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Loader2, Store, ShieldCheck, FileText } from 'lucide-react';
// @ts-ignore
const logoUrl = '/logo.png';

export default function App() {
  // Synchronously parse initial values to prevent race conditions & immediate URL overwriting on load
  const getInitialValue = () => {
    if (typeof window === 'undefined') {
      return { view: 'customer' as const, orgId: null };
    }
    const params = new URLSearchParams(window.location.search);
    let v = params.get('view') as any;
    let id = params.get('orgId');
    
    // Fallback to localStorage if not specified in URL
    if (!v && !id) {
      const savedView = localStorage.getItem('quickorder_last_view');
      const savedOrgId = localStorage.getItem('quickorder_last_org_id');
      if (savedView) {
        v = savedView;
        id = savedOrgId;
      }
    }
    
    return {
      view: (v || 'customer') as 'customer' | 'staff' | 'admin' | 'superadmin' | 'proposal',
      orgId: id || null
    };
  };

  const initialVals = getInitialValue();

  const [view, setView] = useState<'customer' | 'staff' | 'admin' | 'superadmin' | 'proposal'>(initialVals.view);
  const [user, setUser] = useState<User | null>(null);
  const [customUser, setCustomUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quickorder_custom_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse custom user:", e);
        }
      }
    }
    return null;
  });
  const [orgId, setOrgId] = useState<string | null>(initialVals.orgId);
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState<any>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  const isPlatformOwner = (email: string | null | undefined) => {
    return !!email && ["langmix2@gmail.com", "fahussein79@gmail.com"].includes(email);
  };
  const activeUser = user || customUser;

  const handleSignOut = async () => {
    localStorage.removeItem('quickorder_custom_user');
    localStorage.removeItem('quickorder_last_view');
    localStorage.removeItem('quickorder_last_org_id');
    setCustomUser(null);
    if (auth) {
      setView('customer');
      setOrgId(null);
      await auth.signOut();
    }
  };

  const handleLoginSuccess = (signedInUser?: any) => {
    if (signedInUser) {
      setCustomUser(signedInUser);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('quickorder_custom_user');
    if (saved) {
      try {
        setCustomUser(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse custom user:", e);
      }
    }
  }, []);

  // Sync state changes back to localStorage and URL search parameters for PWA continuity
  useEffect(() => {
    if (view) {
      localStorage.setItem('quickorder_last_view', view);
    }
    if (orgId) {
      localStorage.setItem('quickorder_last_org_id', orgId);
    } else {
      localStorage.removeItem('quickorder_last_org_id');
    }

    const params = new URLSearchParams(window.location.search);
    const urlView = params.get('view');
    const urlOrgId = params.get('orgId');

    if (urlView !== view || urlOrgId !== orgId) {
      const newUrl = new URL(window.location.href);
      if (view) newUrl.searchParams.set('view', view);
      if (orgId) newUrl.searchParams.set('orgId', orgId);
      else newUrl.searchParams.delete('orgId');
      window.history.replaceState({}, '', newUrl.toString());
    }

    // Dynamically update the manifest query parameter in HTML head so browsers save the specific PWA redirect on "Add to Home Screen"
    const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (link) {
      const manParams = new URLSearchParams();
      if (orgId) manParams.set('orgId', orgId);
      if (view) manParams.set('view', view);
      const queryStr = manParams.toString();
      link.href = queryStr ? `/manifest.json?${queryStr}` : '/manifest.json';
    }
  }, [view, orgId]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthInitialized(true);
    });

    return () => unsub();
  }, []);

  // Handle orgId derivation from currently logged-in activeUser (Firebase or custom)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlOrgId = params.get('orgId');
    const v = params.get('view') || 'customer';

    if (!urlOrgId) {
      if (activeUser) {
        if (isPlatformOwner(activeUser.email) && v === 'superadmin') {
          setLoading(false);
        } else {
          const fetchUserOrg = async () => {
            try {
              const q = query(collection(db, "organizations"), where("ownerEmail", "==", activeUser.email));
              const snap = await getDocs(q);
              if (!snap.empty) {
                setOrgId(snap.docs[0].id);
              } else {
                setLoading(false);
              }
            } catch (err) {
              console.error("findUserOrg error:", err);
              setLoading(false);
              handleFirestoreError(err, OperationType.GET, "organizations");
            }
          };
          fetchUserOrg();
        }
      } else {
        setLoading(false);
      }
    }
  }, [user, customUser]);

  useEffect(() => {
    if (orgId && db) {
      const unsub = onSnapshot(doc(db, "organizations", orgId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() || {};
          const activePlan = data.subscriptionPlan || data.subscriptionTier || "tier1";
          setOrgData({ id: docSnap.id, ...data, subscriptionPlan: activePlan, subscriptionTier: activePlan });
        } else {
          setOrgData(null);
        }
        setLoading(false);
      }, (err) => {
        console.error("fetchOrg error:", err);
        setLoading(false);
        handleFirestoreError(err, OperationType.GET, `organizations/${orgId}`);
      });
      return () => unsub();
    } else if (!orgId) {
      setLoading(false);
    }
  }, [orgId]);

  if (loading || (!authInitialized && (view === 'admin' || view === 'superadmin'))) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Proposal specialized view
  if (view === 'proposal') {
    return (
      <ProposalView 
        onBack={() => {
          setView('customer');
        }} 
        onNavigateToView={(v, id) => {
          if (id) setOrgId(id);
          setView(v);
        }} 
      />
    );
  }

  // SuperAdmin specialized view
  if (view === 'superadmin') {
    if (!activeUser) return <Login onSuccess={handleLoginSuccess} />;
    if (isPlatformOwner(activeUser.email)) {
      return <SuperAdmin />;
    }
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
        <ShieldCheck className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-black">خطأ في الصلاحيات</h1>
        <p className="text-slate-500">ليس لديك الإذن للوصول إلى هذه الصفحة.</p>
        <button onClick={handleSignOut} className="mt-8 px-6 py-2 bg-slate-800 rounded-xl text-sm">تسجيل الخروج</button>
      </div>
    );
  }

  // Admin view (can be entered with or without orgId in the URL initially)
  if (view === 'admin') {
    if (!activeUser) return <Login onSuccess={handleLoginSuccess} />;

    // Platform Owner / Super Admin
    if (isPlatformOwner(activeUser.email)) {
      if (orgId) {
        if (!orgData) {
          return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
              <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-6">
                <Store className="w-10 h-10 text-slate-500" />
              </div>
              <h1 className="text-2xl font-black mb-2">المتجر غير موجود</h1>
              <p className="text-slate-500 max-w-md">يرجى الدخول من لوحة الإدارة الرئيسية لمراجعة المتاجر.</p>
              <button 
                onClick={() => {
                  setOrgId(null);
                  setView('superadmin');
                }}
                className="mt-8 px-8 py-3 bg-indigo-600 rounded-xl font-bold"
              >
                الذهاب للوحة الإدارة الرئيسية
              </button>
            </div>
          );
        }
        return <AdminDashboard orgId={orgId} user={activeUser} />;
      } else {
        // No specific store in URL, show SuperAdmin panel
        return <SuperAdmin />;
      }
    }

    // Standard Store Owner
    if (orgId) {
      if (!orgData) {
        return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
            <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-6">
              <Store className="w-10 h-10 text-slate-500" />
            </div>
            <h1 className="text-2xl font-black mb-2">المتجر غير موجود</h1>
            <p className="text-slate-500 max-w-md">يرجى التأكد من الرابط الصحيح للمتجر.</p>
          </div>
        );
      }
      
      const isOwner = activeUser.email === orgData.ownerEmail;
      if (isOwner) {
        return <AdminDashboard orgId={orgId} user={activeUser} />;
      } else {
        return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
            <ShieldCheck className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-black">دخول غير مصرح</h1>
            <p className="text-slate-500">ليس لديك صلاحية الوصول لإدارة هذا المتجر.</p>
            <button onClick={handleSignOut} className="mt-8 px-6 py-2 bg-slate-800 rounded-xl text-sm">تسجيل الخروج والتبديل</button>
          </div>
        );
      }
    } else {
      // Logged in as user but orgId not resolved yet (or not found)
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
          <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-6">
            <Store className="w-10 h-10 text-slate-500" />
          </div>
          <h1 className="text-2xl font-black mb-2">لم نجد متجراً مرتبطاً بحسابك</h1>
          <p className="text-slate-500 max-w-md">يرجى تسجيل الدخول باستخدام حساب المتجر الصحيح.</p>
          <button onClick={handleSignOut} className="mt-8 px-6 py-2 bg-slate-800 rounded-xl text-sm">تسجيل الخروج والتبديل</button>
        </div>
      );
    }
  }

  // If we have an orgId, check and render the functional views
  if (orgId) {
    if (!orgData) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
          <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-6">
            <Store className="w-10 h-10 text-slate-500" />
          </div>
          <h1 className="text-2xl font-black mb-2">المتجر غير موجود</h1>
          <p className="text-slate-500 max-w-md">يرجى التأكد من الرابط الصحيح للمتجر.</p>
        </div>
      );
    }

    // Evaluate subscription expiration (Platform Owner is always exempt in administration screens only)
    const expiresAtDate = orgData.expiresAt ? (orgData.expiresAt.toDate ? orgData.expiresAt.toDate() : new Date(orgData.expiresAt)) : null;
    const isExpired = (expiresAtDate ? (expiresAtDate.getTime() < Date.now()) : false) || orgData.isSuspended === true;
    const isSuperAdmin = isPlatformOwner(activeUser?.email) && (view === 'admin' || view === 'superadmin');

    if (isExpired && !isSuperAdmin) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white" dir="rtl">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl">
            <Store className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-white mb-3">المتجر مغلق مؤقتاً ⚠️</h1>
          <p className="text-slate-400 max-w-md leading-relaxed text-sm">
            نعتذر منك، لقد انتهت فترة الاشتراك أو التجربة لمتجر <strong className="text-white font-extrabold">{orgData.name}</strong>. يرجى التواصل مع إدارة المتجر لمتابعة تفعيل الخدمة.
          </p>
        </div>
      );
    }

    if (view === 'customer') return <CustomerView orgId={orgId} />;
    if (view === 'staff') return <StaffDashboard orgId={orgId} isPlatformOwner={isPlatformOwner(activeUser?.email)} />;
  }

  // Fallback for no store or unknown state
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white relative overflow-hidden" dir="rtl">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-1/3 -translate-y-1/2 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800/85 rounded-[3rem] p-8 md:p-12 shadow-2xl flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-slate-950/60 rounded-[2rem] border border-slate-800 flex items-center justify-center mb-8 shadow-2xl overflow-hidden p-0.5 group hover:border-emerald-500/30 transition-all duration-300">
          <img src={logoUrl} alt="Quick Order Logo" className="w-full h-full object-cover rounded-[1.85rem] transform group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-normal text-white">
          نظام الطلب السريع <span className="text-indigo-500 font-mono italic text-2xl md:text-3xl block md:inline mt-1 md:mt-0">Quick Order</span>
        </h1>
        <p className="text-slate-400 mt-4 leading-relaxed max-w-lg font-medium text-sm md:text-base">
          المنصة السحابية المبتكرة لتفعيل قوائم الطعام الرقمية عبر الـ QR وبث الطلبات بشكل فوري مباشر للعملاء والموظفين.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-10 text-right">
          <div className="p-5 bg-slate-950/40 rounded-2xl border border-slate-800/40">
            <h3 className="font-extrabold text-white text-sm mb-2 text-indigo-400">⚡ قائمة الـ QR الذكية</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              تصفح سريع مع تحديد وإرسال الطلبات مباشرة من طاولة العميل بكل سهولة.
            </p>
          </div>
          <div className="p-5 bg-slate-950/40 rounded-2xl border border-slate-800/40">
            <h3 className="font-extrabold text-white text-sm mb-2 text-emerald-400">📋 شاشات الموظفين</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              تحضير الطلبات ثانية بثانية مع إشعارات صوتية فورية لتجهيز وإرسال الطلبات.
            </p>
          </div>
          <div className="p-5 bg-slate-950/40 rounded-2xl border border-slate-800/40">
            <h3 className="font-extrabold text-white text-sm mb-2 text-purple-400">🛡️ لوحة تحكم الإدارة</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              تحليلات فورية، إدارة شاملة للطاولات والموظفين وعناصر القائمة بروعة.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full mt-10">
          {isPlatformOwner(activeUser?.email) ? (
            <button 
              onClick={() => {
                setOrgId(null);
                setView('superadmin');
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
            >
              إدارة المنصة الرئيسية
            </button>
          ) : (
            <button 
              onClick={() => {
                setOrgId(null);
                setView('admin');
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 px-8 rounded-2xl transition-all active:scale-[0.98]"
            >
              لوحة تحكم الإدارة
            </button>
          )}
          <button 
            onClick={() => {
              setView('proposal');
            }}
            className="w-full bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5 text-indigo-300" />
            <span>عرض دراسة الجدوى ومزايا الباقات</span>
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
