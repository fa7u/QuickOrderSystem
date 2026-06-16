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
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
            <Store className="w-10 h-10" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mb-3">المتجر مغلق مؤقتاً ⚠️</h1>
          <p className="text-slate-400 max-w-md leading-relaxed text-xs sm:text-sm">
            نعتذر منك، لقد انتهت فترة الاشتراك أو التجربة لمتجر <strong className="text-white font-extrabold">{orgData.name}</strong>. يرجى التواصل مع إدارة المتجر لمتابعة تفعيل الخدمة والوصول إلى لوحة التحكم.
          </p>
        </div>
      );
    }

    if (view === 'customer') return <CustomerView orgId={orgId} />;
    if (view === 'staff') return <StaffDashboard orgId={orgId} isPlatformOwner={isPlatformOwner(activeUser?.email)} />;
  }

  // Fallback for no store or unknown state
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden" dir="rtl">
      {/* Exquisite custom ambient organic blurred structures for high-end boutique finish */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-25 select-none md:block hidden">
        <div className="absolute top-[15%] left-[20%] w-[35%] h-[35%] bg-indigo-600/10 rounded-full blur-[110px]"></div>
        <div className="absolute bottom-[20%] right-[15%] w-[40%] h-[40%] bg-indigo-505/5 rounded-full blur-[130px]"></div>
      </div>

      <div className="max-w-3xl w-full bg-slate-900/45 backdrop-blur-3xl border border-slate-800/80 rounded-[2.5rem] p-6 sm:p-12 shadow-[0_32px_65px_-12px_rgba(0,0,0,0.85)] flex flex-col items-center text-center relative z-10">
        <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-550/30 to-transparent"></div>

        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-950 rounded-[2rem] border border-slate-850 flex items-center justify-center mb-8 shadow-2xl overflow-hidden p-1 group hover:border-slate-750 transition-all duration-300">
          <img src={logoUrl} alt="Quick Order Logo" className="w-full h-full object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
        </div>
        
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-normal text-slate-100 font-sans">
          نظام تلقي ومعالجة الطلبات الفوري <span className="text-indigo-400 font-mono italic text-xl sm:text-2xl block sm:inline mt-2 sm:mt-0">Quick Order</span>
        </h1>
        <p className="text-slate-450 mt-4 leading-relaxed max-w-lg font-bold text-xs sm:text-sm">
          المنصة السحابية الاحترافية المتكاملة لتمكين المنشآت الخدمية وعيادات الخدمات من إعداد روابط تلقي وتتبع الطلبات المباشرة، مع بث إشعارات التنبيه الصوتية بمجرد إرسال العميل لطلبه.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-10 text-right">
          <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-850 hover:border-slate-800 transition-all duration-300">
            <h3 className="font-extrabold text-[13px] text-indigo-400 mb-2.5 flex items-center gap-1.5">
              <span>⚡ تدوين الطلب فوراً</span>
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
              يستطيع العميل كتابة مواصفات طلبه ومرفقاته وتحديث وسيلة تسليمه أو موقعه بدقة مطلقة دون الحاجة للانتظار.
            </p>
          </div>
          <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-850 hover:border-slate-800 transition-all duration-300">
            <h3 className="font-extrabold text-[13px] text-emerald-400 mb-2.5 flex items-center gap-1.5">
              <span>📋 إشعار جرس مستمر</span>
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
              يصدر النظام نغمة صفارة تنبيه تفاعلية مستمرة لا تتوقف بمحطات العمل فور وصول أي طلب جديد للبدء بالتحضير.
            </p>
          </div>
          <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-850 hover:border-slate-800 transition-all duration-300">
            <h3 className="font-extrabold text-[13px] text-purple-400 mb-2.5 flex items-center gap-1.5">
              <span>🛡️ إدارة حرة موحدة</span>
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
              نظام تشغيلي متكامل لجدولة العمليات، وتصدير التقارير، وتخصيص هوية ورسائل المنشأة، وتدقيق حوالات البنك.
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
              className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-black py-4 px-8 rounded-2xl transition-all duration-300 shadow-[0_8px_24px_-4px_rgba(99,102,241,0.25)] active:scale-[0.98] text-xs sm:text-sm select-none"
            >
              إدارة المنصة الرئيسية
            </button>
          ) : (
            <button 
              onClick={() => {
                setOrgId(null);
                setView('admin');
              }}
              className="w-full bg-slate-950/80 border border-slate-850 hover:bg-slate-900 text-slate-300 hover:text-white font-black py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg active:scale-[0.98] text-xs sm:text-sm select-none"
            >
              دخول بوابة الإدارة
            </button>
          )}
          <button 
            onClick={() => {
              setView('proposal');
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-black py-4 px-8 rounded-2xl transition-all duration-300 shadow-[0_8px_24px_-4px_rgba(99,102,241,0.3)] active:scale-[0.98] flex items-center justify-center gap-2 text-xs sm:text-sm select-none"
          >
            <FileText className="w-4 h-4 text-indigo-300 shrink-0" />
            <span>دراسة الجدوى وباقات الاشتراك</span>
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
