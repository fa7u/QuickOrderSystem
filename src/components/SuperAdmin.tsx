import React, { useState, useEffect } from "react";
import Footer from "./Footer";
import { db, firebaseConfig } from "../lib/firebase";
import { collection, getDocs, serverTimestamp, setDoc, doc, deleteDoc } from "firebase/firestore";
import { Plus, Store, User, Mail, ShieldCheck, Loader2, CheckCircle, AlertCircle, Key, Pencil, Trash2, X, Monitor, ArrowRight, Ban, Power } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

export default function SuperAdmin() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrg, setNewOrg] = useState({ name: "", ownerName: "", username: "", password: "", id: "", subscriptionType: "trial", subscriptionTier: "tier1" });
  const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    if (!db) return;
    const snap = await getDocs(collection(db, "organizations"));
    setOrgs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const createAuthUser = async (email: string, pass: string) => {
    const tempAppName = `temp-app-${Date.now()}`;
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);
    try {
      await createUserWithEmailAndPassword(tempAuth, email, pass);
      await signOut(tempAuth);
    } finally {
      await deleteApp(tempApp);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setStatus("saving");
    setError("");
    try {
      const orgId = editingId || newOrg.id.trim().toLowerCase().replace(/\s+/g, "-");
      if (!orgId) throw new Error("يجب إدخال معرف المتجر");
      
      const virtualEmail = `${newOrg.username.trim().toLowerCase()}@quickorder.sys`;

      // 1. Create Auth Account if new or password changed (here we just ensure it exists)
      if (!editingId) {
        try {
          await createAuthUser(virtualEmail, newOrg.password);
        } catch (authErr: any) {
          console.warn("Auth creation skipped or failed:", authErr.code || authErr.message);
          // Do not fail store creation if auth creation fails due to console setup, network, or policy.
          // The database fallback mechanism will handle merchant logins.
        }
      }

      // Calculate expiration date
      const now = new Date();
      let days = 30;
      if (newOrg.subscriptionType === "month") days = 30;
      else if (newOrg.subscriptionType === "6months") days = 180;
      else if (newOrg.subscriptionType === "year") days = 365;

      const expirationDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      // 2. Create/Update Organization Document
      await setDoc(doc(db, "organizations", orgId), {
        name: newOrg.name.trim(),
        ownerName: newOrg.ownerName.trim(),
        username: newOrg.username.trim(),
        ownerEmail: virtualEmail,
        passwordHint: newOrg.password,
        subscriptionType: newOrg.subscriptionType || "trial",
        subscriptionTier: newOrg.subscriptionTier || "tier1",
        expiresAt: expirationDate,
        updatedAt: serverTimestamp(),
        ...(editingId ? {} : { createdAt: serverTimestamp() })
      }, { merge: true });

      // 3. Initialize/Update branding
      await setDoc(doc(db, "organizations", orgId, "settings", "branding"), {
        restaurantName: newOrg.name.trim(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      setStatus("success");
      setNewOrg({ name: "", ownerName: "", username: "", password: "", id: "", subscriptionType: "trial", subscriptionTier: "tier1" });
      setEditingId(null);
      fetchOrgs();
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("permission-denied")) {
        setError("فشل التصريح: يرجى التأكد من أنك مسجل الدخول كمسؤول المنصة.");
      } else if (err.code?.includes("auth/")) {
        setError(`خطأ في الحساب: ${err.message}`);
      } else {
        setError(err.message || "فشل معالجة الطلب.");
      }
      setStatus("idle");
    }
  };

  const handleDeleteOrg = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المتجر نهائياً؟ سيتم مسح كافة البيانات المرتبطة.")) return;
    try {
      await deleteDoc(doc(db, "organizations", id));
      fetchOrgs();
      alert("تم حذف المتجر بنجاح");
    } catch (err: any) {
      alert("خطأ في الحذف: " + err.message);
    }
  };

  const handleToggleSuspension = async (orgId: string, currentStatus: boolean) => {
    if (!db) return;
    const confirmMsg = currentStatus 
      ? "هل أنت متأكد من إلغاء تعطيل هذا المتجر وتنشيطه؟" 
      : "هل أنت متأكد من تعطيل هذا المتجر يدوياً؟ سيتم حظر لوحة التحكم وصفحة الطلبات فوراً.";
    if (!confirm(confirmMsg)) return;

    try {
      await setDoc(doc(db, "organizations", orgId), {
        isSuspended: !currentStatus,
        updatedAt: serverTimestamp()
      }, { merge: true });
      fetchOrgs();
    } catch (err: any) {
      alert("خطأ أثناء تحديث حالة الإيقاف: " + err.message);
    }
  };

  const startEdit = (org: any) => {
    setNewOrg({
      name: org.name,
      ownerName: org.ownerName,
      username: org.username,
      password: org.passwordHint || "",
      id: org.id,
      subscriptionType: org.subscriptionType || "trial",
      subscriptionTier: org.orgSubscriptionTier || org.subscriptionTier || "tier1"
    });
    setEditingId(org.id);
    setIsModalOpen(true);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-600/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter leading-none">QUICKORDER <span className="text-indigo-500 text-xs not-italic font-bold tracking-widest block mt-1 uppercase opacity-60">SaaS Command Center</span></h1>
              <p className="text-slate-500 text-sm mt-1">نظام إدارة المتاجر والمشتركين المركزي</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/50">
              <div className="px-4 py-2 bg-indigo-500/10 rounded-xl">
                <p className="text-[10px] text-indigo-400 font-black uppercase">إجمالي المتاجر</p>
                <p className="text-xl font-black">{orgs.length}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setEditingId(null);
                setNewOrg({ name: "", ownerName: "", username: "", password: "", id: "", subscriptionType: "trial", subscriptionTier: "tier1" });
                setIsModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" /> إضافة متجر جديد
            </button>
          </div>
        </header>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-500 text-sm font-bold"
          >
             <AlertCircle className="w-5 h-5 flex-shrink-0" />
             {error}
          </motion.div>
        )}

        {/* Modal for Add/Edit */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.93, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 15 }}
                className="bg-slate-900 border border-slate-800/80 w-full max-w-2xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden z-10 max-h-[90vh] overflow-y-auto"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4 text-right">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${editingId ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"}`}>
                      {editingId ? <Pencil className="w-5.5 h-5.5" /> : <Plus className="w-5.5 h-5.5" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">
                        {editingId ? "تعديل هوية واشتراك المتجر" : "تأسيس متجر جديد بالسحاب"}
                      </h2>
                      <p className="text-slate-400 text-xs mt-1 font-medium">ابدأ الآن بإدخال تفاصيل الترخيص والمشرف لتأمين ورفع الخدمة</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 hover:bg-slate-800/80 active:scale-95 bg-slate-950/40 border border-slate-800 rounded-full text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleCreateOrg(e); setIsModalOpen(false); }} className="space-y-6">
                  {/* Store Info Cards */}
                  <div className="bg-slate-950/40 p-5 rounded-3xl border border-slate-800/50 space-y-4">
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">الهوية التجارية للمشروع</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2 text-right">
                        <label className="text-[11px] font-black text-slate-400 pr-1 block">الاسم التجاري للهوية</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 right-4 flex items-center text-slate-500">
                            <Store className="w-4.5 h-4.5" />
                          </span>
                          <input
                            required
                            value={newOrg.name}
                            onChange={e => {
                              const val = e.target.value;
                              const updatedOrg = { ...newOrg, name: val };
                              if (!editingId) {
                                // Auto-slug ID from name: strip chars, replace spaces with single dash
                                updatedOrg.id = val.trim().toLowerCase()
                                  .replace(/[^a-zA-Z0-9\u0621-\u064A\s-]/g, "")
                                  .replace(/\s+/g, "-");
                              }
                              setNewOrg(updatedOrg);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3.5 pr-11 pl-5 outline-none text-xs font-black transition-all text-white placeholder-slate-600 focus:ring-1 focus:ring-indigo-500/50"
                            placeholder="مثال: مطعم قصر البرجر"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 text-right">
                        <label className="text-[11px] font-black text-slate-400 pr-1 block">رابط المتجر (Store ID)</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 right-4 flex items-center text-slate-500">
                            <Monitor className="w-4.5 h-4.5" />
                          </span>
                          <input
                            required
                            disabled={!!editingId}
                            value={newOrg.id}
                            onChange={e => setNewOrg({...newOrg, id: e.target.value.toLowerCase().replace(/\s+/g, "-")})}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3.5 pr-11 pl-5 outline-none text-xs font-black transition-all text-indigo-400 disabled:opacity-50 placeholder-slate-600 focus:ring-1 focus:ring-indigo-500/50"
                            placeholder="al-sultan-rest"
                            dir="ltr"
                          />
                        </div>
                        {newOrg.id && (
                          <div className="text-[9px] text-indigo-400 mt-1.5 flex items-center gap-1 bg-indigo-950/20 px-2.5 py-1.5 rounded-lg border border-indigo-900/10 justify-between" dir="ltr">
                            <span className="font-bold uppercase tracking-widest text-[8px] text-indigo-500">URL PATH</span>
                            <span className="truncate text-slate-400 font-mono tracking-tight text-right flex-1 select-all ml-2">
                              {window.location.host}?orgId={newOrg.id}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Merchant / Owner Area */}
                  <div className="space-y-2 text-right">
                    <label className="text-[11px] font-black text-slate-400 pr-1 block">اسم المالك / المدير</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 right-4 flex items-center text-slate-500">
                        <User className="w-4.5 h-4.5" />
                      </span>
                      <input
                        required
                        value={newOrg.ownerName}
                        onChange={e => setNewOrg({...newOrg, ownerName: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3.5 pr-11 pl-5 outline-none text-xs font-black transition-all text-white placeholder-slate-600 focus:ring-1 focus:ring-indigo-500/50"
                        placeholder="سعود بن محمد الهاشمي"
                      />
                    </div>
                  </div>

                  {/* Subscriptions Grid */}
                  <div className="space-y-3.5 text-right">
                    <label className="text-[11px] font-black text-slate-400 pr-1 block">باقة الاشتراك ومدة الترخيص</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { id: "trial", label: "شهر للتجربة المجانية", desc: "٣٠ يوم كاملة", badge: "🎁 مجاني" },
                        { id: "month", label: "باقة شهر واحد", desc: "٣٠ يوم نشط", badge: "💼 مرن" },
                        { id: "6months", label: "باقة ٦ أشهر", desc: "١٨٠ يوم خصم %١٥", badge: "⭐ مشهور" },
                        { id: "year", label: "سنة كاملة", desc: "٣٦٥ يوم تملك كامل", badge: "🚀 قيمة قصوى" }
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setNewOrg({ ...newOrg, subscriptionType: sub.id })}
                          className={`group relative flex flex-col items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 text-center cursor-pointer min-h-[95px] ${
                            newOrg.subscriptionType === sub.id
                              ? "bg-indigo-600/10 border-indigo-500 text-white shadow-xl shadow-indigo-600/5 ring-1 ring-indigo-500/50"
                              : "bg-slate-950/60 border-slate-850 text-slate-500 hover:border-slate-800 hover:bg-slate-950 hover:text-slate-300"
                          }`}
                        >
                          <span className={`absolute -top-2 bg-slate-950 border text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none scale-90 ${
                            newOrg.subscriptionType === sub.id
                              ? "border-indigo-500 text-indigo-400"
                              : "border-slate-800 text-slate-500 group-hover:border-slate-700"
                          }`}>
                            {sub.badge}
                          </span>
                          
                          <div className="pt-2 w-full">
                            <span className="text-xs font-black tracking-tight leading-none mb-1.5 block">{sub.label}</span>
                            <span className="text-[9px] opacity-60 font-medium block leading-none">{sub.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feature/Subscription Tier (Economic, Second, Third) */}
                  <div className="space-y-3.5 text-right">
                    <label className="text-[11px] font-black text-slate-400 pr-1 block">مستوى خطة الميزات والخصائص (نوع الباقة)</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { id: "tier1", label: "💼 الباقة الاقتصادية (Basic)", desc: "موظف واحد، حساب بنكي واحد، تواصل واتساب فقط، هوية وشعار Quick Order الافتراضية، حذف الطلبات كل 10 أيام مع تصدير إكسل.", badge: "اقتصادية" },
                        { id: "tier2", label: "⭐ الباقة المتقدمة (Standard)", desc: "حتى 4 موظفين، 3 حسابات بنكية، تعديل ألوان وشعار صفحة العملاء فقط، دردشة لـ 50 عميل/شهر، حذف الطلبات كل 20 يوماً مع تصدير إكسل.", badge: "متقدمة" },
                        { id: "tier3", label: "🚀 الباقة الاحترافية (Premium)", desc: "كادر موظفين غير محدود، حسابات بنكية غير محدودة، تخصيص كامل للألوان والشعار والنصوص، دردشة عملاء غير محدودة، حذف الطلبات كل 30 يوماً مع تصدير إكسل.", badge: "الاحترافية الشاملة" }
                      ].map((tier) => (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setNewOrg({ ...newOrg, subscriptionTier: tier.id })}
                          className={`group relative flex flex-col items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 text-center cursor-pointer min-h-[115px] ${
                            newOrg.subscriptionTier === tier.id
                              ? "bg-emerald-600/10 border-emerald-500 text-white shadow-xl shadow-emerald-600/5 ring-1 ring-emerald-500/50"
                              : "bg-slate-950/60 border-slate-850 text-slate-500 hover:border-slate-800 hover:bg-slate-950 hover:text-slate-300"
                          }`}
                        >
                          <span className={`absolute -top-2 bg-slate-950 border text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none scale-90 ${
                            newOrg.subscriptionTier === tier.id
                              ? "border-emerald-500 text-emerald-400"
                              : "border-slate-800 text-slate-500 group-hover:border-slate-700"
                          }`}>
                            {tier.badge}
                          </span>
                          
                          <div className="pt-2.5 w-full text-right">
                            <span className="text-xs font-black tracking-tight leading-none mb-1.5 block text-center">{tier.label}</span>
                            <span className="text-[9.5px] opacity-70 font-semibold block leading-normal text-slate-300 text-right">{tier.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Credentials / Security Check */}
                  <div className="bg-slate-950/40 p-5 rounded-3xl border border-slate-800/50 space-y-4">
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">الأمان ومعلومات حساب المشرف الرئيسي</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2 text-right">
                        <label className="text-[11px] font-black text-slate-400 pr-1 block">اسم المستخدم للدخول</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 right-4 flex items-center text-slate-500">
                            <User className="w-4.5 h-4.5" />
                          </span>
                          <input
                            required
                            value={newOrg.username}
                            onChange={e => setNewOrg({...newOrg, username: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3.5 pr-11 pl-5 outline-none text-xs font-black transition-all text-white placeholder-slate-600 focus:ring-1 focus:ring-indigo-500/50"
                            placeholder="alsultan_owner"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 text-right">
                        <label className="text-[11px] font-black text-slate-400 pr-1 block">كلمة المرور الافتراضية</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 right-4 flex items-center text-slate-500">
                            <Key className="w-4.5 h-4.5" />
                          </span>
                          <input
                            required
                            type="text"
                            value={newOrg.password}
                            onChange={e => setNewOrg({...newOrg, password: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3.5 pr-11 pl-20 outline-none text-xs font-black transition-all text-white placeholder-slate-600 focus:ring-1 focus:ring-indigo-500/50"
                            placeholder="اكتب كلمة سر"
                            dir="ltr"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              // Secure 6-digit random password
                              const randSec = Math.random().toString(36).substring(2, 8).toUpperCase();
                              setNewOrg({ ...newOrg, password: randSec });
                            }}
                            className="absolute inset-y-0 left-3 flex items-center px-2 text-[9px] font-black text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            توليد عشوائي ⚡
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submission Action Button */}
                  <button
                    disabled={status === "saving"}
                    type="submit"
                    className={`w-full ${
                      editingId 
                        ? "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-550 shadow-amber-550/10" 
                        : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-700 hover:to-indigo-500 shadow-indigo-600/15"
                    } disabled:bg-slate-800 disabled:from-slate-800 disabled:to-slate-800 text-white font-black py-4.5 rounded-2xl transition-all flex items-center justify-center gap-3 mt-4 shadow-xl active:scale-95 text-sm cursor-pointer border border-white/5`}
                  >
                    {status === "saving" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      editingId ? "حفظ وتعديل الترخيص الجاري 🔄" : "تفعيل المتجر وإطلاق خدمة السحاب 🚀"
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* List of Orgs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {orgs.map((org, index) => {
              const baseUrl = window.location.origin;
              const adminLink = `${baseUrl}?orgId=${org.id}&view=admin`;

              return (
                <motion.div 
                  key={org.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/30 rounded-[3rem] p-8 transition-all group relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-950 rounded-[1.5rem] flex items-center justify-center border border-slate-800 group-hover:border-indigo-500/20 transition-colors">
                          <Store className="w-7 h-7 text-slate-700 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-black text-white text-xl tracking-tight leading-none mb-2">{org.name}</h3>
                          <span className="text-[10px] font-mono font-black text-indigo-500/60 uppercase tracking-widest">{org.id}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800/50 space-y-4 mb-8">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-bold">المنتسب:</span>
                        <span className="text-slate-200 font-black">{org.ownerName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-bold">المستخدم:</span>
                        <span className="text-indigo-400 font-mono font-black uppercase tracking-tighter">{org.username}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-bold">التلميح:</span>
                        <span className="text-slate-500 font-mono italic">{org.passwordHint}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-800/50 flex flex-col gap-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 font-bold">باقة الاشتراك:</span>
                          <span className="text-indigo-400 font-black text-xs">
                            {org.subscriptionType === "trial" ? "شهر للتجربة المجانية 🎁" :
                             org.subscriptionType === "month" ? "باقة شهر 💼" :
                             org.subscriptionType === "6months" ? "باقة 6 أشهر ⭐" :
                             org.subscriptionType === "year" ? "باقة سنة كاملة 🚀" : "شهر للتجربة المجانية 🎁"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 font-bold">مستوى الخصائص (الباقة):</span>
                          <span className="text-emerald-400 font-black text-xs">
                            {org.subscriptionTier === "tier2" ? "⭐ الباقة المتقدمة (Standard)" :
                             org.subscriptionTier === "tier3" ? "🚀 الباقة الاحترافية (Premium)" : "💼 الباقة الاقتصادية (Basic)"}
                          </span>
                        </div>
                        {(() => {
                          const expiresAtDate = org.expiresAt ? (org.expiresAt.toDate ? org.expiresAt.toDate() : new Date(org.expiresAt)) : null;
                          if (!expiresAtDate) return null;
                          const diffTime = expiresAtDate.getTime() - Date.now();
                          const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          const isExpired = remainingDays <= 0;
                          return (
                            <>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-600 font-bold">تاريخ الانتهاء:</span>
                                <span className="text-slate-400 font-mono font-bold">
                                  {expiresAtDate.toLocaleDateString("en-US", { year: "numeric", month: "numeric", day: "numeric" })}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-600 font-bold">حالة الاشتراك:</span>
                                {org.isSuspended ? (
                                  <span className="px-2.5 py-0.5 text-[10px] font-black rounded-lg bg-orange-500/15 border border-orange-500/25 text-orange-400">
                                    معطل يدوياً 🔴
                                  </span>
                                ) : isExpired ? (
                                  <span className="px-2.5 py-0.5 text-[10px] font-black rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                                    منتهي الاشتراك ⚠️
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 text-[10px] font-black rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                    نشط (باقي {remainingDays} يوم)
                                  </span>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(adminLink);
                        alert("تم نسخ رابط دخول المدير بنجاح. أرسله إلى صاحب المتجر.");
                      }}
                      className="w-full bg-indigo-600 hover:bg-white hover:text-black text-white py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/10 active:scale-[0.98] group/btn"
                    >
                      <ShieldCheck className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                      نسخ رابط دخول المدير
                    </button>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const customerLink = `${window.location.origin}?orgId=${org.id}`;
                          navigator.clipboard.writeText(customerLink);
                          alert("تم نسخ رابط واجهة العملاء");
                        }}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Store className="w-3 h-3" /> رابط العملاء
                      </button>
                      <button 
                        onClick={() => {
                          const staffLink = `${window.location.origin}?orgId=${org.id}&view=staff`;
                          navigator.clipboard.writeText(staffLink);
                          alert("تم نسخ رابط واجهة الموظفين");
                        }}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <User className="w-3 h-3" /> رابط الموظفين
                      </button>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleSuspension(org.id, !!org.isSuspended)}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all text-[11px] font-black cursor-pointer border ${
                          org.isSuspended 
                            ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                            : "bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/30"
                        }`}
                        title={org.isSuspended ? "تنشيط يدوي" : "تعطيل مؤقت"}
                      >
                        {org.isSuspended ? (
                          <>
                            <Power className="w-3.5 h-3.5 animate-pulse" /> تنشيط المتجر
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5" /> تعطيل يدوي
                          </>
                        )}
                      </button>

                      <button 
                        onClick={() => startEdit(org)}
                        className="bg-slate-800/50 hover:bg-slate-700 text-amber-500 w-12 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                        title="تعديل"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteOrg(org.id)}
                        className="bg-slate-800/50 hover:bg-red-500/20 text-red-500 w-12 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        <Footer />
      </div>
    </div>
  );
}

