import React, { useState } from "react";
import { auth, googleProvider, db } from "../lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { ShieldCheck, Lock, AlertCircle, Chrome, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
// @ts-ignore
const logoUrl = "/logo.png";

interface LoginProps {
  onSuccess: (customUser?: any) => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStoreLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setError("");
    try {
      const isEmail = username.trim().includes("@");
      const cleanUsername = username.trim().toLowerCase();
      const finalEmail = isEmail ? cleanUsername : `${cleanUsername}@quickorder.sys`;
      
      try {
        await signInWithEmailAndPassword(auth, finalEmail, password);
        onSuccess();
      } catch (authErr: any) {
        console.warn("Firebase Auth sign-in failed, checking Firestore fallback database...", authErr);
        
        // General fail-safe lookup in organizations collection
        if (db) {
          try {
            const { collection, query, where, getDocs, doc, getDoc } = await import("firebase/firestore");
            
            let orgDoc: any = null;
            let orgData: any = null;

            // 1. Try checking by ownerEmail which is guaranteed to be lowercase in DB
            const virtualEmailCheck = isEmail ? cleanUsername : `${cleanUsername}@quickorder.sys`;
            const qEmail = query(collection(db, "organizations"), where("ownerEmail", "==", virtualEmailCheck));
            const snapEmail = await getDocs(qEmail);
            
            if (!snapEmail.empty) {
              orgDoc = snapEmail.docs[0];
              orgData = orgDoc.data();
            } else {
              // 2. Try checking if they typed the Store ID / Organization ID directly
              const docRef = doc(db, "organizations", cleanUsername);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                orgDoc = docSnap;
                orgData = docSnap.data();
              } else {
                // 3. Try to query by literal username (which might be mixed case)
                const qUsername = query(collection(db, "organizations"), where("username", "==", username.trim()));
                const snapUsername = await getDocs(qUsername);
                if (!snapUsername.empty) {
                  orgDoc = snapUsername.docs[0];
                  orgData = orgDoc.data();
                } else {
                  // 4. Case-insensitive scan over all organizations as a complete fail-safe
                  const allSnap = await getDocs(collection(db, "organizations"));
                  const matched = allSnap.docs.find(d => {
                    const data = d.data();
                    return (
                      data.username?.toLowerCase() === cleanUsername ||
                      data.ownerEmail?.toLowerCase() === cleanUsername ||
                      d.id.toLowerCase() === cleanUsername
                    );
                  });
                  if (matched) {
                    orgDoc = matched;
                    orgData = matched.data();
                  }
                }
              }
            }

            if (orgDoc && orgData) {
              if (String(orgData.passwordHint).trim() === password.trim()) {
                const dummyUser = { 
                  email: orgData.ownerEmail, 
                  username: orgData.username, 
                  isCustom: true,
                  uid: orgDoc.id 
                };
                localStorage.setItem('quickorder_custom_user', JSON.stringify(dummyUser));
                onSuccess(dummyUser);
                return;
              }
            }
          } catch (dbErr) {
            console.error("Firestore database lookup also failed:", dbErr);
          }
        }
        
        // Fallback user error display
        if (authErr.code === "auth/network-request-failed" || authErr.code === "auth/network-error") {
          setError("خطأ في الاتصال بالشبكة (Firebase network-request-failed). يرجى التحقق من اسم المستخدم للمتجر وكلمة المرور.");
        } else {
          setError("اسم المستخدم للمتجر أو كلمة المرور غير صحيحة.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("فشل تسجيل الدخول. يرجى مراجعة مدير النظام.");
    } finally {
      setLoading(false);
    }
  };

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const handleGoogleLogin = async () => {
    if (!auth || !googleProvider) return;
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if it's the admin email
      const isAdminEmail = user.email && ["langmix2@gmail.com", "fahussein79@gmail.com"].includes(user.email);
      if (isAdminEmail) {
        onSuccess();
      } else {
        // Not the admin, sign them out and show error
        await auth.signOut();
        setError("عذراً، هذا البريد غير مصرح له كمدير للمنصة.");
      }
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("تم إغلاق نافذة تسجيل الدخول من قبلك. يرجى المحاولة مرة أخرى.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError(`النطاق الحالي (${window.location.hostname}) غير مصرح له. يرجى إضافته في إعدادات Firebase.`);
      } else if (err.code === "auth/popup-blocked") {
        setError("تم حظر النافذة المنبثقة. يرجى الضغط على زر الفتح في نافذة جديدة أدناه.");
      } else if (err.code === "auth/network-request-failed") {
        setError("فشل الاتصال بسبب قيود المتصفح (IFrame). يرجى فتح التطبيق في نافذة مستقلة للمتابعة.");
      } else {
        setError(`خطأ: ${err.message || "فشل تسجيل الدخول عبر Google"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const params = new URLSearchParams(window.location.search);
  const urlOrgId = params.get("orgId");

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-24 h-24 bg-slate-940 rounded-[2rem] border border-slate-800 flex items-center justify-center mb-6 shadow-2xl overflow-hidden p-0.5 hover:border-emerald-500/20 transition-all duration-300">
            <img src={logoUrl} alt="Quick Order Logo" className="w-full h-full object-cover rounded-[1.85rem]" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {urlOrgId ? "بوابة إدارة المتجر" : "مركز إدارة المنصة"}
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            {urlOrgId ? "أهلاً بك مجدداً، سجل دخولك لإدارة متجرك" : "لوحة التحكم السحابية الموحدة للمالك"}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col gap-3 text-red-500 text-xs font-bold"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
            {(error.includes("نافذة") || error.includes("قيود")) && (
              <button 
                onClick={openInNewTab}
                className="w-full bg-red-500 text-white py-2 rounded-xl mt-1 hover:bg-red-600 transition-colors"
               >
                فتح في نافذة مستقلة الآن
              </button>
            )}
          </motion.div>
        )}

        {/* Render Form Inputs for Email & Password or Username & Password */}
        <div className="space-y-6">
          {!urlOrgId && (
            <>
              <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-center">
                <p className="text-xs text-indigo-300 font-bold leading-relaxed">
                  بإمكانك الدخول فوراً عبر حساب Google المعتمَد، أو استخدام البريد الإلكتروني وكلمة المرور أدناه.
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-100 text-slate-950 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 border border-slate-200 active:scale-[0.98] shadow-lg shadow-indigo-600/5"
              >
                <Chrome className="w-5 h-5 text-indigo-600" />
                <span>تسجيل الدخول باستخدام Google</span>
              </button>

              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-slate-800/80"></div>
                <span className="px-4 text-xs text-slate-500 font-bold">أو الدخول اليدوي بالبريد</span>
                <div className="flex-1 border-t border-slate-800/80"></div>
              </div>
            </>
          )}

          <form onSubmit={handleStoreLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 pr-1">
                {urlOrgId ? "اسم مستخدم المتجر" : "البريد الإلكتروني أو اسم المستخدم"}
              </label>
              <div className="relative group">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={urlOrgId ? "Ex: bin_saeed" : "Ex: owner@example.com"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pr-12 pl-4 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm font-bold animate-none"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 pr-1">كلمة المرور</label>
              <div className="relative group">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pr-12 pl-12 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] group"
            >
              {loading ? "جاري التحقق..." : (
                <span className="flex items-center justify-center gap-2">
                  دخول لوحة التحكم
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
                </span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
