import React from 'react';
import { Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const emailSubject = encodeURIComponent("طلب تفعيل نظام القائمة الذكية - Quick Order");
  const emailBody = encodeURIComponent(
    "مرحباً إدارة نظام Quick Order،\n\n" +
    "أرغب في الاستفسار عن كيفية تفعيل نظام القائمة الذكية وتلقي الطلبات لمتجري.\n\n" +
    "اسم المتجر:\n" +
    "رقم الهاتف:\n" +
    "نوع النشاط:\n\n" +
    "شكراً لكم."
  );
  
  const mailtoUrl = `mailto:fahussein79@gmail.com?subject=${emailSubject}&body=${emailBody}`;

  return (
    <footer className="w-full bg-slate-900/40 border-t border-slate-800/80 py-8 text-center relative overflow-hidden print:hidden mt-8" dir="rtl">
      {/* Absolute blurry glow element */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-96 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-4 relative z-10">
        {/* Powered by line - forced to LTR so English layouts read correctly left-to-right */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-mono tracking-wider uppercase" dir="ltr">
          <span>Powered by</span>
          <span className="font-extrabold text-indigo-400 font-sans tracking-tight hover:text-indigo-300 transition-colors">Antigravity</span>
          <span className="text-slate-700 font-bold">·</span>
          <span>Quick Order System</span>
        </div>

        {/* Call to action for store owners */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-xl text-center">
          <p className="text-[11px] sm:text-xs text-slate-400 font-semibold leading-relaxed">
            💡 هل تريد تفعيل نظام القائمة الذكية QR وتلقي الطلبات الفورية لمتجرك؟
          </p>
          <a
            href={mailtoUrl}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold text-[11px] rounded-lg border border-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] self-center shrink-0 shadow-sm"
          >
            <Mail className="w-3 h-3 text-indigo-400" />
            <span>تواصل لتفعيل متجرك</span>
          </a>
        </div>

        {/* Security / Privacy trust badges */}
        <div className="flex items-center gap-1 text-[9px] text-slate-650 font-bold pt-1 border-t border-slate-800/20 w-48 justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
          <span>سحابي آمن ومحمي بالكامل</span>
        </div>
      </div>
    </footer>
  );
}
