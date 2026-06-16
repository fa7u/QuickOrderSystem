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
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Exquisite custom ambient organic blurred structures for high-end boutique finish */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30 select-none">
        <div className="absolute top-[10%] left-[10%] w-[45%] h-[45%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[45%] h-[45%] bg-emerald-600/5 rounded-full blur-[140px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-slate-900/40 backdrop-blur-3xl border border-slate-800/80 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_32px_60px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden z-10"
      >
        <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-550/45 to-transparent"></div>

        <div className="flex flex-col items-center mb-8 text-center group">
          <div className="w-20 h-20 bg-slate-950 rounded-2xl border border-slate-850 flex items-center justify-center mb-6 shadow-[0_12px_32px_rgba(0,0,0,0.5)] overflow-hidden p-1 transition-all duration-300 group-hover:scale-[1.03] group-hover:border-slate-700">
            <img src={logoUrl} alt="Quick Order Logo" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight leading-tight">
            {urlOrgId ? "بوابة إدارة المتجر" : "مركز إدارة المنصة"}
          </h1>
          <p className="text-slate-450 text-xs sm:text-sm mt-2 font-bold max-w-[280px]">
            {urlOrgId ? "أهلاً بك مجدداً، يرجى تسجيل بيانات الدخول لمتجرك" : "لوحة التحكم السحابية الموحدة للمالك والإدارة العامة"}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col gap-2 text-red-400 text-xs font-bold leading-relaxed"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <p>{error}</p>
            </div>
            {(error.includes("نافذة") || error.includes("قيود")) && (
              <button 
                onClick={openInNewTab}
                className="w-full bg-red-600 hover:bg-red-550 text-white py-2.5 rounded-xl mt-1 text-center font-black transition-all"
               >
                فتح في نافذة مستقلة الآن
              </button>
            )}
          </motion.div>
        )}

        {/* Form elements */}
        <div className="space-y-6">
          {!urlOrgId && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl text-center">
                <p className="text-[11px] text-indigo-300 font-extrabold leading-relaxed">
                  يمكنك تسجيل الدخول المباشر المعتمد عبر Google، أو استخدام حساب الإدارة اليدوي المخصص بالأسفل.
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-50 text-slate-950 font-black py-3.5 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-[0.98] shadow-lg shadow-indigo-950/20"
              >
                <Chrome className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs sm:text-[13px]">تسجيل الدخول الفوري بـ Google</span>
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-slate-800/80"></div>
                <span className="px-3.5 text-[10px] text-slate-500 font-black">أو تسجيل الدخول التقليدي</span>
                <div className="flex-1 border-t border-slate-800/80"></div>
              </div>
            </div>
          )}

          <form onSubmit={handleStoreLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-455 block pr-1">
                {urlOrgId ? "اسم مستخدم المتجر" : "البريد الإلكتروني أو اسم المستخدم المعتمد"}
              </label>
              <div className="relative group">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={urlOrgId ? "مثال: bin_saeed" : "username@example.com"}
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-2xl py-3.5 pr-11 pl-4 text-white placeholder-slate-650 focus:bg-slate-950 focus:border-indigo-550/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-xs font-bold"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-455 block pr-1">كلمة المرور الخاصة بالحساب</label>
              <div className="relative group">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-2xl py-3.5 pr-11 pl-11 text-white focus:bg-slate-950 focus:border-indigo-550/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-xs font-bold"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-550 disabled:bg-slate-850 disabled:text-slate-500 text-white font-black py-4 rounded-2xl transition-all duration-300 shadow-[0_8px_24px_-4px_rgba(99,102,241,0.3)] active:scale-[0.98] group text-xs sm:text-sm select-none"
            >
              {loading ? "جاري التحقق والمطابقة..." : (
                <span className="flex items-center justify-center gap-1.5">
                  دخول لوحة تحكم المنشأة
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-[-3px] transition-transform" />
                </span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
