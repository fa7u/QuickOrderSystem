import React, { useState } from 'react';
import { motion } from 'motion/react';
import Footer from './Footer';
import { 
  FileText, 
  Printer, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Sliders, 
  Shield, 
  Zap, 
  Database, 
  Info, 
  Clock, 
  ChevronRight, 
  Download, 
  Store, 
  HelpCircle,
  Eye,
  Settings,
  Flame,
  Check
} from 'lucide-react';

interface ProposalViewProps {
  onBack: () => void;
  onNavigateToView?: (view: 'customer' | 'staff' | 'admin' | 'superadmin', orgId?: string) => void;
}

export default function ProposalView({ onBack, onNavigateToView }: ProposalViewProps) {
  const [activePlanTab, setActivePlanTab] = useState<'tier1' | 'tier2' | 'tier3'>('tier3');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [showPrintTip, setShowPrintTip] = useState(false);

  const handlePrint = () => {
    setShowPrintTip(true);
    try {
      window.print();
    } catch (e) {
      console.warn("Print dialogue blocked by iframe sandbox:", e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-white" dir="rtl">
      {/* Print Specific CSS Styles via React Style Element */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            font-size: 12pt;
          }
          .no-print {
            display: none !important;
          }
          .print-area {
            display: block !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-card {
            background: white !important;
            border: 1px solid #e2e8f0 !important;
            color: black !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          .print-text {
            color: #1e293b !important;
          }
          .print-muted {
            color: #64748b !important;
          }
          .print-highlight {
            color: #4f46e5 !important;
            font-weight: bold !important;
          }
          .print-force-visible {
            display: flex !important;
          }
          .print-plan-card {
            margin-bottom: 2rem !important;
          }
        }
      `}</style>

      {/* Floating Navigator (no-print) */}
      <div className="no-print sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold font-mono">PROPOSAL v1.0</span>
              <h2 className="text-sm font-extrabold text-white">دراسة الجدوى ومزايا باقات الاشتراك لأصحاب المتاجر والمنشآت</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>تحميل أو طباعة كملف PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="print-area max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-16">
        
        {/* Print Guideline Banner (no-print) */}
        {showPrintTip && (
          <div className="no-print bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-950 border border-indigo-500/20 rounded-2xl p-5 text-right relative flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="flex gap-3 text-right">
              <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-extrabold block text-white">💡 إرشادات تصدير وحفظ ملف الـ PDF بأعلى دقة:</span>
                <span className="text-slate-350 leading-relaxed block">
                  1. نظراً لمحددات بيئة المعاينة الآمنة (iframe)، يُفضّل فتح التطبيق في <strong>علامة تبويب جديدة ومستقلة</strong> من خلال خيارات المتصفح.<br />
                  2. اضغط على مفتاحي <strong className="text-white">Ctrl + P</strong> (أو <strong>Cmd + P</strong> لمستخدمي الماك) لفتح واجهة الطباعة للمتصفح.<br />
                  3. حدد وجهة الحفظ كـ <strong>"حفظ بتنسيق PDF" (Save as PDF)</strong>.<br />
                  4. تأكد من تفعيل خيار <strong className="text-white">"رسومات الخلفية" (Background graphics)</strong> في قسم الإعدادات الإضافية لضمان بقاء تصميم العرض والألوان الرائعة.
                </span>
              </div>
            </div>
            <button 
              onClick={() => setShowPrintTip(false)}
              className="text-xs px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/15 self-end md:self-center font-bold font-sans transition-all"
            >
              مفهوم، إغلاق الإرشاد ×
            </button>
          </div>
        )}

        {/* Cover / Header Section */}
        <section className="text-center space-y-6 relative py-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px] -z-10 no-print"></div>
          
          <div className="mx-auto w-24 h-24 bg-slate-900 border border-indigo-500/25 rounded-[2rem] flex items-center justify-center p-0.5 shadow-2xl overflow-hidden mb-6">
            <img src="/logo.png" alt="Quick Order Logo" className="w-full h-full object-cover rounded-[1.85rem]" referrerPolicy="no-referrer" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 no-print">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400 font-extrabold">العرض التقني والتشغيلي المتكامل للمتاجر والعلامات التجارية</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight print-text">
            نظام الطلب المتطور والذكي <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-indigo-500 to-emerald-400">Quick Order</span>
          </h1>
          <p className="max-w-3xl mx-auto text-sm sm:text-lg text-slate-400 leading-relaxed font-medium print-text print-muted">
            دراسة جدوى شاملة وحلول تفعيل وتلقي ومتابعة الطلبيات المباشرة فوراً عبر رابط الطلب الموحد الخاص بالمنشأة، والذي ينشره المسؤول في أي مكان يناسبه بمرونة فائقة، لضمان الكفاءة التشغيلية القصوى وزيادة المبيعات بنسبة تفوق الـ 35%.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 text-right">
            <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl print-card">
              <span className="text-slate-500 font-mono text-xs block mb-1">نسبة نمو المبيعات المتوقعة</span>
              <h4 className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-5 h-5" /> +35%
              </h4>
            </div>
            <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl print-card">
              <span className="text-slate-500 font-mono text-xs block mb-1">سرعة تجهيز الطلب الفعلي</span>
              <h4 className="text-xl sm:text-2xl font-black text-indigo-400">فوري ومؤتمت بالكامل</h4>
            </div>
          </div>
        </section>

          {/* نبذة تعريفية كاملة عن ميكانيكية وتكامل النظام */}
          <section className="bg-gradient-to-l from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 rounded-[2.5rem] p-6 sm:p-10 space-y-6 print-card text-right">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">نبذة تعريفية شاملة عن نظام Quick Order</h2>
                <p className="text-xs text-slate-500 font-semibold">فكرة مبتكرة ومكتملة تسهل تجربة تدوين الطلبات للزبائن وإدارتها بذكاء تشغيلي متناهٍ</p>
              </div>
            </div>
            
            <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 font-normal">
            <p className="print-text">
              يُعد نظام <strong className="text-white print-highlight">Quick Order</strong> حلاً تقنياً ثورياً وسحابياً مصمماً خصيصاً للمراكز الخدمية، المحلات التجارية، ومختلف الأنشطة والمنشآت الخدمية بمختلف أحجامها. يرتكز النظام على تبسيط تجربة العميل بالكامل وإلغاء التعقيد؛ حيث يقوم العميل بالدخول المباشر إلى رابط المتجر الموحد (الذي يقوم المسؤول بنشره وتوزيعه بمرونة فائقة في أي مكان كمنصات التواصل، ملصق تسويقي أو رمز QR)، لينتقل فوراً لصفحة تفاعلية سريعة ومبسطة كُتبت بعناية لتتيح له <strong className="text-emerald-400 print-highlight">تدوين وتحديد كافة احتياجاته وطلباته الخاصة ومواصفاتها الدقيقة بكل سهولة وسلاسة</strong> دون الحاجة لتقييده بنماذج وقوائم جامدة ومعقدة مسبقاً.
            </p>
            <p className="print-text">
              بمجرد ضغطة زر واحدة من العميل، ينتقل الطلب <strong className="text-indigo-300 print-highlight">خلال أجزاء من الثانية</strong> إلى واجهة المتابعة والتحضير الخاصة بفريق العمل، مصحوباً بصفارة تنبيه صوتية مستمرة تلفت انتباه الكوادر لضمان البدء الفوري بالتجهيز. يرافق ذلك شريط تتبع حي ومباشر يتيح للعميل رؤية تحديثات معالجة طلبه خطوة بخطوة، مع إمكانية الدردشة المباشرة والتحقق من حسابات الدفع والحوالات البنكية المعتمدة، مما يحقق للمنشأة أقصى درجات الضبط والسرعة وضمان الحفظ التلقائي للسجلات.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right pt-4">
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-300 text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> التحديات بالوسائل التقليدية والمحلية:
              </h3>
              <ul className="space-y-3 text-sm text-slate-400 leading-relaxed list-inside list-disc">
                <li><strong className="text-rose-400">تأخر خدمة وتلبية العملاء:</strong> قضاء أوقات طويلة في انتظار موظف الخدمة لتسجيل وتدوين البيانات يدوياً، مما يضر بالتجربة العامة للعميل وتدفقه والإنتاجية.</li>
                <li><strong className="text-rose-400">الوقوع في الأخطاء البشرية:</strong> حدوث أخطاء ومغالطات في تدوين الملاحظات والمواصفات المحددة للطلب، أو حدوث التباسات في تدوين متطلبات العملاء وتنسيقها.</li>
                <li><strong className="text-rose-400">هدر الوقت التشغيلي:</strong> استنزاف وقت فريق العمل في الانتقال والتسجيل للملاحظات يدوياً بدلاً من مباشرة التحضير والتسليم السريع.</li>
                <li><strong className="text-rose-400">غياب متابعة حالة الطلب:</strong> عدم معرفة المستفيد بالمرحلة التشغيلية الحالية لطلبه يحفز كثرة الاتصالات والاستفسارات المقلقة للموظفين.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-300 text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> الحلول الذكية والمزايا مع Quick Order:
              </h3>
              <ul className="space-y-3 text-sm text-slate-400 leading-relaxed list-inside list-disc">
                <li><strong className="text-emerald-400">الخدمة الذاتية الفائقة:</strong> تدوين الطلب والمواصفات من العميل مباشرة في ثوانٍ معدودة دون الاضطرار للانتظار لتسجيلها يدوياً.</li>
                <li><strong className="text-emerald-400">دقة متكاملة بالطلبات:</strong> كتابة وتأكيد الطلب بمواصفاته من العميل يمنع تماماً أي مغالطات أو أخطاء بشرية في التحضير والتنفيذ الفعلي.</li>
                <li><strong className="text-emerald-400">توفير الجهد والتركيز:</strong> تفرغ فريق المنشأة للإنتاج والتحضير الفعلي بدلاً من هدر الساعات في تلقي وتنسيق الطلبات وتأكيد المدفوعات.</li>
                <li><strong className="text-emerald-400">طمأنينة تامة وتتبع مباشر:</strong> تمكين العميل من متابعة تطور معالجة طلبه حياً يمنحه ثقة وراحة ويقلل ضغط الأسئلة على فريق العمل.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* الرحلة السلسة للعميل والمنشأة */}
        <section className="space-y-8 text-right font-sans">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">الرحلة السلسة وتناسق تدفق البيانات بالمنظومة</h2>
            <p className="text-xs text-slate-500 font-semibold">تمثيل واقعي وتفاعلي لدورة حياة المعاملة والسرعة الفائقة لمرورها بين الأطراف</p>
          </div>

          <div className="p-4 sm:p-8 bg-slate-900/20 border border-slate-800/80 rounded-[2.5rem] relative overflow-hidden print-card">
            {/* Visual Grid Graphic Mapping */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
              
              {/* Card 1: Customer View Mockup (Realistic App Screenshot) */}
              <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 relative space-y-4 shadow-xl flex flex-col justify-between print-card">
                <div className="space-y-3 text-right font-sans">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold rounded-lg font-mono">1. واجهة العميل</span>
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-bold flex items-center justify-center border border-indigo-500/20">1</div>
                  </div>
                  <h4 className="font-black text-white text-base">تدوين وتتبع الطلب</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">شاشة عمل الزبون لتسجيل مواصفات المعاملة واختيار طريقة التسليم وتأكيد الحوالة البنكية بمرونة تامة.</p>
                </div>

                <div className="border border-slate-900 bg-slate-950 rounded-2xl p-3 space-y-2.5 text-right relative shadow-2xl text-[9px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">📞 جوالك:</label>
                      <div className="w-full bg-slate-900 border border-slate-800/60 rounded px-2 py-1 text-slate-450 font-mono text-left">055XXXX492</div>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">🚚 خيار الاستلام:</label>
                      <div className="w-full bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 rounded px-1.5 py-1 text-center font-bold">توصيل للمكتب</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">💳 تأكيد الدفع والتحويل:</label>
                    <div className="bg-emerald-950/25 border border-emerald-500/25 p-2 rounded-xl text-center">
                      <span className="text-[8.5px] text-emerald-400 font-bold block">📲 إشعار مباشر لرسائل الإدارة بنجاح الحوالة</span>
                      <span className="text-[7.5px] text-slate-400 block mt-0.5">مطابقة فورية في ثوانٍ مع رسائل البنك للمدير</span>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="w-full py-1.5 bg-indigo-600 text-white text-[9px] font-black rounded-lg text-center select-none">
                    إرسال الطلب ومتابعة حالته
                  </div>
                </div>
              </div>

              {/* Card 2: Live Database & Routing (Middle Sync Broker) */}
              <div className="bg-gradient-to-b from-indigo-950/20 to-slate-950 p-5 rounded-3xl border border-indigo-500/20 relative space-y-4 shadow-xl flex flex-col justify-center items-center text-center print-card">
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-lg font-mono">نظام المزامنة الفوري</span>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
                  <Zap className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="font-black text-white text-base">السيرفر السحابي ومزامنة البيانات</h4>
                <p className="text-xs text-indigo-305 leading-relaxed max-w-xs font-semibold">تكامل عميق وفوري مع خوادمنا وربط فوري خلال 0.1 ثانية فقط! يتم بث دقات جرس التنبيه للموظفين وتحديث شريط التتبع للعميل حياً.</p>
                <div className="w-full bg-slate-950 border border-slate-850 p-3 font-mono text-[9px] text-right text-slate-400 space-y-1 rounded-xl">
                  <div className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>[تم الاستلام] استلام طلب #312 بنجاح</span>
                  </div>
                  <div className="text-indigo-400">🔔 إرسال رنين صفارة التنبيه لمحطة الإدارة</div>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden relative no-print">
                  <div className="absolute top-0 right-0 h-full w-2/3 bg-gradient-to-l from-indigo-500 to-emerald-400 animate-infinite rounded-full"></div>
                </div>
              </div>

              {/* Card 3: Staff/Admin View Mockup (Realistic Supervisor Panel) */}
              <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 relative space-y-4 shadow-xl flex flex-col justify-between print-card">
                <div className="space-y-3 text-right font-sans">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-lg font-mono">2. لوحة الموظفين</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold flex items-center justify-center border border-emerald-500/20">2</div>
                  </div>
                  <h4 className="font-black text-white text-base">لوحة المعالجة والتحضير</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">شاشة عمل فريق المنشأة لتجهيز المعاملات، والتواصل المباشر مع الزبون، وتأكيد الحوالات بذكاء عبر رسائل البنك للمدير.</p>
                </div>

                {/* Simulated Desktop Order Row from staff layout */}
                <div className="border border-slate-900 bg-slate-950 rounded-2xl p-3 space-y-2.5 text-right relative shadow-2xl text-[9px]">
                  {/* Status Indicator Row */}
                  <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                    <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold">⚠️ بانتظار التأكيد</span>
                    <span className="text-slate-500 font-mono">الطلب #312</span>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>العميل:</span>
                      <span className="text-white font-medium">صالح أحمد الغامدي</span>
                    </div>
                    <div className="text-slate-405 line-clamp-1">
                      المتطلبات: <span className="text-slate-200">تصميم وتصنيع لوحة أكريليك للمكتب...</span>
                    </div>
                    <div className="flex justify-between text-slate-450 text-[8px]">
                      <span>طريقة الاستلام: توصيل</span>
                      <span className="text-emerald-400 font-bold">بانتظار مطابقة إشعار البنك 📲</span>
                    </div>
                  </div>

                  {/* Simulated Action buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <div className="py-1 bg-indigo-600 text-white text-[8px] font-bold rounded-md text-center">قبول وتجهيز</div>
                    <div className="py-1 bg-slate-900 border border-slate-800 text-slate-400 text-[8px] font-bold rounded-md text-center font-bold font-sans">محادثة العميل</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Subscription Packages breakdown Comparison - Interactive Tiers */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">باقات الاشتراك وخصائص التفعيل التشغيلية</h2>
            <p className="text-xs text-slate-500">اختر من بين باقاتنا الثلاث ما يلائم حجم عملك، بلا قيود تذكر أو رسوم مخفية</p>
          </div>

          {/* Billing Period Switcher (no-print) */}
          <div className="no-print flex justify-center mb-2">
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${billingPeriod === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                اشتراك شهري
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${billingPeriod === 'yearly' ? 'bg-emerald-600 text-white font-extrabold shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <span>اشتراك سنوي 🧧</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md font-bold">وفر حتى 10%</span>
              </button>
            </div>
          </div>

          {/* Quick tab switch (no-print) */}
          <div className="no-print flex justify-center gap-2 max-w-md mx-auto p-1 bg-slate-900 border border-slate-800 rounded-2xl">
            <button 
              onClick={() => setActivePlanTab('tier1')}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${activePlanTab === 'tier1' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              الباقة الاقتصادية
            </button>
            <button 
              onClick={() => setActivePlanTab('tier2')}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${activePlanTab === 'tier2' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              الباقة المتقدمة
            </button>
            <button 
              onClick={() => setActivePlanTab('tier3')}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${activePlanTab === 'tier3' ? 'bg-indigo-600 text-white font-black' : 'text-slate-400 hover:text-white'}`}
            >
              الباقة الاحترافية 🔥
            </button>
          </div>

          <div className="max-w-2xl mx-auto pt-2">
            
            {/* Tier 1 / Basic Package */}
            <div className={`p-6 rounded-[2.5rem] border border-amber-500/40 bg-slate-900/40 shadow-xl shadow-amber-500/5 transition-all flex flex-col justify-between space-y-6 print-card print-plan-card ${activePlanTab === 'tier1' ? 'flex' : 'hidden'} print-force-visible`}>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold rounded-lg font-sans">البضائع والخدمات البسيطة</span>
                    <span className="text-slate-500 font-mono text-[10px]">Tier 1</span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-black text-white">💰 الباقة الاقتصادية (Basic)</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">الخيار الأمثل للمشاريع والمنشآت الناشئة، المحلات البسيطة، وعربات البيع والخدمات الفردية.</p>
                  </div>
                  
                  <div className="text-right py-2 border-y border-slate-800/60 font-black">
                    <span className="text-slate-500 text-xs">سعر الاشتراك {billingPeriod === 'monthly' ? 'الشهري' : 'السنوي'}</span>
                    <div className="text-2xl font-black text-white mt-1">
                      {billingPeriod === 'monthly' ? (
                        <>25 <span className="text-sm font-medium text-slate-400 font-sans">دولار أمريكي / شهرياً</span></>
                      ) : (
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1.5">
                            <span>270</span>
                            <span className="text-sm font-medium text-slate-400 font-sans">دولار أمريكي / سنوياً</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold mt-1 block">💡 يعادل فقط 22.50$ شهرياً (وفرت 30$ سنوياً!) 💎</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2.5 text-right text-xs text-slate-400">
                    <li className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>كوتة الموظفين:</strong> جهاز تشغيلي / شاشة موظف واحدة (1) فقط</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-350">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>واجهة ذكية لتدوين طلبات واحتياجات العملاء بدقة وسهولة متناهية</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-350">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>تلقي الطلبات الحية بنظام الإخطار الصوتي المستمر</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-350">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>حساب مصرفي واحد (1) فقط لإقرار التحويلات</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-350">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>تصدير البيانات والتقارير وتحميلها مباشرة بصيغ Excel الحسابية</span>
                    </li>
                    <li className="flex items-center gap-2 text-red-500/90 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      <span>الدردشة الحية معطلة (يستبدل برابط WhatsApp مباشر)</span>
                    </li>
                    <li className="flex items-center gap-2 text-red-500/90 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      <span>تعديلات واجهة العميل واسم المنشأة معطلة</span>
                    </li>
                  </ul>
                </div>

                {/* Auto Deletion Policy box */}
                <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-2xl text-right space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                    <Clock className="w-4 h-4" />
                    <span>سياسة الحفظ التلقائي: 10 أيام ⏱️</span>
                  </div>
                  <p className="text-[10px] text-slate-450 leading-relaxed">
                    يتم مسح الطلبات القديمة تلقائياً من نظام التخزين بمجرد مرور 10 أيام على تسليمها، للحفاظ على كفاءة خفيفة وسريعة تماماً لقواعد بيانات لوحتك التشغيلية.
                  </p>
                </div>
              </div>

            {/* Tier 2 / Standard Package */}
            <div className={`p-6 rounded-[2.5rem] border border-indigo-500/50 bg-slate-900/40 shadow-xl shadow-indigo-500/5 transition-all flex flex-col justify-between space-y-6 print-card print-plan-card ${activePlanTab === 'tier2' ? 'flex' : 'hidden'} print-force-visible`}>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold rounded-lg">الأكثر توازناً</span>
                    <span className="text-slate-500 font-mono text-[10px]">Tier 2</span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-black text-white">⭐ الباقة المتقدمة (Standard)</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">النموذج المتكامل لمختلف المتاجر والعيادات والمكاتب الاستشارية والمحلات ونقاط الخدمات المتميزة والمراكز الحيوية.</p>
                  </div>
                  
                  <div className="text-right py-2 border-y border-slate-800/60 font-black">
                    <span className="text-slate-500 text-xs">سعر الاشتراك {billingPeriod === 'monthly' ? 'الشهري' : 'السنوي'}</span>
                    <div className="text-2xl font-black text-white mt-1">
                      {billingPeriod === 'monthly' ? (
                        <>39 <span className="text-sm font-medium text-slate-400 font-sans">دولار أمريكي / شهرياً</span></>
                      ) : (
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1.5">
                            <span>445</span>
                            <span className="text-sm font-medium text-slate-400 font-sans">دولار أمريكي / سنوياً</span>
                          </div>
                          <span className="text-[10px] text-indigo-400 font-bold mt-1 block">💡 يعادل فقط 37.08$ شهرياً (وفرت 23$ سنوياً!) 💎</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2.5 text-right text-xs text-slate-400">
                    <li className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>كوتة الموظفين:</strong> حتى 4 أجهزة/شاشات للموظفين معاً</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-350">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>دعم 3 حسابات بنكية لاستقبال تأكيدات الحوالات مدمجة</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-350">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>دردشة حية داخل الصفحة لعملاء متجرك (كوتة 50/شهر) مع تواصل واتساب فوق 50 المحادثة</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-350">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>تخصيص كامل لألوان الواجهة الأساسية وهوية المنشأة والعلامة التجارية</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-350">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>تصدير البيانات والتقارير وتحميلها مباشرة بصيغ Excel الحسابية</span>
                    </li>
                    <li className="flex items-center gap-2 text-red-500/90 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      <span>تعديل رسالة الترحيب واسم المنشأة مقفل (افتراضي)</span>
                    </li>
                    <li className="flex items-center gap-2 text-red-500/90 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      <span>تخصيص عناوين ووصف خطوات الطلب الحية غير متاح</span>
                    </li>
                  </ul>
                </div>

                {/* Auto Deletion Policy box */}
                <div className="bg-indigo-500/5 border border-indigo-500/15 p-4 rounded-2xl text-right space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold">
                    <Clock className="w-4 h-4" />
                    <span>سياسة الحفظ التلقائي: 20 يوماً ⏱️</span>
                  </div>
                  <p className="text-[10px] text-slate-450 leading-relaxed">
                    تُحفظ سجلات عملائك بالتفاصيل ومحمية بنظام أمني عالٍ حتى انقضاء 20 يوماً، مما يتيح لك مرونة دراسة مبيعات وتدفقات المنشأة والتحضير للتالي.
                  </p>
                </div>
              </div>

            {/* Tier 3 / Premium Package */}
            <div className={`p-6 rounded-[2.5rem] border border-emerald-500/60 bg-gradient-to-b from-emerald-950/20 to-slate-900 shadow-2xl shadow-emerald-500/5 transition-all flex flex-col justify-between space-y-6 print-card print-plan-card relative overflow-hidden ${activePlanTab === 'tier3' ? 'flex' : 'hidden'} print-force-visible`}>
                <div className="absolute top-0 left-0 bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-br-2xl border-b border-r border-emerald-400/20 no-print">
                  الأكثر اشتراكاً 🔥
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-lg font-sans">التحكم المطلق المفتوح</span>
                    <span className="text-slate-500 font-mono text-[10px]">Tier 3</span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-black text-rose-300 md:text-white flex items-center gap-1.5">🚀 الباقة الاحترافية (Premium)</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">النموذج الشامل والكامل لمختلف الشركات، السلاسل التجارية والفروع والمخازن، ومن يسعى للريادة التقنية المطلقة.</p>
                  </div>
                  
                  <div className="text-right py-2 border-y border-slate-800/60 font-black">
                    <span className="text-slate-500 text-xs">سعر الاشتراك {billingPeriod === 'monthly' ? 'الشهري' : 'السنوي'}</span>
                    <div className="text-2xl font-black text-white mt-1">
                      {billingPeriod === 'monthly' ? (
                        <div className="flex items-baseline gap-1">
                          <span>55</span>
                          <span className="text-sm font-medium text-slate-400 font-sans">دولار أمريكي / شهرياً</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 p-1 rounded-md mr-1 font-bold no-print">وفر أكثر سنوياً!</span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1.5">
                            <span>599</span>
                            <span className="text-sm font-medium text-slate-400 font-sans">دولار أمريكي / سنوياً</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold mt-1 block">💡 يعادل فقط 49.91$ شهرياً (وفرت 61$ سنوياً!) 💎</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2.5 text-right text-xs text-slate-450">
                    <li className="flex items-center gap-2 text-emerald-400 font-extrabold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span><strong>الموظفون:</strong> شاشات للمشغلين والمعالجين بلا أي حدود تشغيلية ♾️</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-350">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>إضافة عدد متكامل وغير محدود من الحسابات البنكية للمنشأة</span>
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400 font-extrabold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>دردشة حية مجانية متواصلة بلا أي كوتة أو قيود</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-350">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>تغيير اسم المنشأة والرسائل الترحيبية والهوية اللفظية للواجهة</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-350">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>تخصيص كامل لعناوين وأوصاف ومراحل وخطوات الطلبيات الحية</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-350">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>قدرات نسخ احتياطي وتنزيل أرشيف محلي بصيغ Excel</span>
                    </li>
                  </ul>
                </div>

                {/* Auto Deletion Policy box */}
                <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-2xl text-right space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <Clock className="w-4 h-4" />
                    <span>سياسة الحفظ التلقائي: 30 يوماً ⏱️</span>
                  </div>
                  <p className="text-[10px] text-slate-450 leading-relaxed">
                    أعلى حماية للأرشفة السحابية والقدرات الإحصائية. نحفظ لك جميع المبيعات والطلبيات السابقة لمدة تصل إلى 30 يوماً للرجوع لدفاترك الحالية، وتصديرها بضغطة زر.
                  </p>
                </div>
              </div>

          </div>
        </section>

        {/* Deep Dive into Auto-Deletion Policies ( Friendly Explanation for the automatic deletion in each tier ) */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-[2.5rem] p-6 sm:p-10 space-y-8 print-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20">
              <Database className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">سياسة التطوير وتطهير قواعد البيانات الدورية (حذف البيانات التلقائي)</h2>
              <p className="text-xs text-slate-500">لماذا نعتمد مفهوم الإلغاء الدوري للطلبات المؤرشفة وكيف يحمي ذلك مصالحك؟</p>
            </div>
          </div>

          <div className="text-right space-y-6 text-sm text-slate-350 leading-relaxed">
            <p>
              نهجنا في منصة <strong className="text-white">Quick Order</strong> لا يهدف لفرض قيود على المتاجر، بل نؤمن بأن السيرفر الرشيق والسريع يعني تجربة مستخدم خالية من أي تلعثم، وإتمام الصفقات بنسب تتجاوز المتوقع. قمنا ببناء ميزة الحذف التلقائي للطلبات المسلّمة بموجب فلسفة تشغيلية رفيعة ترتكز على النقاط الأربع الكبرى التالية:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800/60 flex gap-4 text-right print-card">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0 flex items-center justify-center border border-indigo-500/20 font-bold">1</div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-sm">استجابة فائقة السرعة للمستخدم (99.9% Uptime)</h4>
                  <p className="text-xs text-slate-450 leading-relaxed">كلما قل عدد البيانات الميتة بالسيرفر البيني للمتجر، كانت استجابة صفحة تصفح الزبائن خارقة وبأقل استهلاك لحزم البيانات (Data Bundle)، وتحدّث حالات شاشات العمل ومتابعة المعاملات فورياً بلمح البصر دون أي تأخير لأجزاء من الثانية.</p>
                </div>
              </div>

              <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800/60 flex gap-4 text-right print-card">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 flex items-center justify-center border border-emerald-500/20 font-bold">2</div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-sm">أمن البيانات وصيانة خصوصية عملائك الكبرى</h4>
                  <p className="text-xs text-slate-450 leading-relaxed">التزاماً بضوابط الهيئة العامة للأمن السيبراني وقوانين الخصوصية، فإن محو الأرقام الهاتفية والدردشات القديمة يحميك كلياً من أي تتبع أو تهكير لطرف ثالث، مما يعلي ثقة الزبون في متجرك الصديق.</p>
                </div>
              </div>

              <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800/60 flex gap-4 text-right print-card">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 shrink-0 flex items-center justify-center border border-pink-500/20 font-bold">3</div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-sm">تثبيت واستقرار أسعار الاشتراك لكم دوماً</h4>
                  <p className="text-xs text-slate-450 leading-relaxed">تراكم تيرابايت من صور المعاملات والمرفقات والمستندات مع ملايين المعاملات يرفع تدريجياً من تكلفة السيرفرات السحابية. من خلال هذه الهيكلية الذكية، نستطيع ابقاء أسعار باقاتنا مخفضة دون أي زيادات تشغيلية عليكم.</p>
                </div>
              </div>

              <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800/60 flex gap-4 text-right print-card">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 flex items-center justify-center border border-blue-500/20 font-bold">4</div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-sm">تصدير بضغطة زر واحدة (Excel Backup)</h4>
                  <p className="text-xs text-slate-450 leading-relaxed">لا تقلق كلياً بشأن فقد سجلاتك! تتيح المنصة لك بأي وقت وببساطة في جميع الباقات (الاقتصادية، المتقدمة، والاحترافية) تنزيل سجلاتك الحسابية كاملة وتصديرها بملف إكسل منظم قبل زوال فترة الحفظ لتبقيك دوماً على اطلاع.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 flex gap-3 text-right text-emerald-450 mt-4">
              <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-extrabold block text-white">توضيح هام ولطيف لشركائنا:</span>
                <span>الحذف التلقائي يعامل فقط الطلبيات التي تم تأكيدها وتسليمها أو معالجتها بالكامل، بينما لن تلمس الخوارزميات أبداً أي طلب معلق أو قيد المراجعة والتحضير الفعلي للحفاظ على دقة المبيعات اليومية الجارية!</span>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid Checklist (Quick Selling Points) */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-black text-white">مقارنة سريعة وتكلفة التشغيل مقابل العائد</h2>
            <p className="text-xs text-slate-500 mt-1">جدول تلخيص المزايا الذي يثبت الأرباح الصافية وخفض النفقات</p>
          </div>

          <div className="overflow-x-auto rounded-[2.5rem] border border-slate-800/80 bg-slate-900/20 print-card">
            <table className="w-full text-right border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400">
                  <th className="p-5 font-black">المزية التشغيلية</th>
                  <th className="p-5 font-black text-amber-500">الباقة الاقتصادية (Basic)</th>
                  <th className="p-5 font-black text-indigo-400">الباقة المتقدمة (Standard)</th>
                  <th className="p-5 font-black text-emerald-400">الباقة الاحترافية (Premium)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-350">
                <tr>
                  <td className="p-5 font-bold text-white">كوتا طاقم التحضير والموظفين</td>
                  <td className="p-5 font-mono">1 جهاز فعال</td>
                  <td className="p-5 font-mono">حتى 4 أجهزة فعالة</td>
                  <td className="p-5 font-mono text-emerald-400 font-bold">بلا حدود ♾️</td>
                </tr>
                <tr>
                  <td className="p-5 font-bold text-white">تعديل الألوان وواجهة العميل</td>
                  <td className="p-5 text-slate-600">❌ غير متاح (افتراضي)</td>
                  <td className="p-5 text-emerald-400">✅ تعديل كامل للهوية</td>
                  <td className="p-5 text-emerald-400">✅ تعديل مع سمات متقدمة</td>
                </tr>
                <tr>
                  <td className="p-5 font-bold text-white">مسميات الخطوات وتعديلات الاسم</td>
                  <td className="p-5 text-slate-600">❌ مقفل تماماً</td>
                  <td className="p-5 text-slate-600">❌ مقفل تماماً</td>
                  <td className="p-5 text-emerald-400 font-bold">✅ تخصيص مفتوح بالكامل</td>
                </tr>
                <tr>
                  <td className="p-5 font-bold text-white">الدردشة الحية مباشرة على الويب</td>
                  <td className="p-5 text-slate-500">واتساب مباشر فقط</td>
                  <td className="p-5">✅ 50 محادثة/شهرية وتواصل واتساب فوق 50 المحادثة</td>
                  <td className="p-5 text-emerald-400 font-bold">✅ محادثات فورية بلا حدود</td>
                </tr>
                <tr>
                  <td className="p-5 font-bold text-white">دعم الحسابات البنكية المدمجة</td>
                  <td className="p-5 font-mono">1 حساب بنكي</td>
                  <td className="p-5 font-mono">3 حسابات بنكية</td>
                  <td className="p-5 font-mono text-emerald-400 font-bold">عدد لا نهائي</td>
                </tr>
                <tr>
                  <td className="p-5 font-bold text-white">تصدير التقارير وسجلات المبيعات كـ Excel</td>
                  <td className="p-5 text-emerald-400 font-bold">✅ متاح مجاناً كمعيار أساسي</td>
                  <td className="p-5 text-emerald-400 font-bold">✅ متاح مجاناً كمعيار أساسي</td>
                  <td className="p-5 text-emerald-400 font-bold">✅ متاح مجاناً كمعيار أساسي</td>
                </tr>
                <tr>
                  <td className="p-5 font-bold text-white">فترة تخزين والاحتفاظ بالسجلات بالخادم</td>
                  <td className="p-5 font-sans font-bold text-slate-400">10 أيام</td>
                  <td className="p-5 font-sans font-bold text-indigo-400">20 يوماً</td>
                  <td className="p-5 font-sans font-bold text-emerald-400">30 يوماً</td>
                </tr>
                <tr className="bg-slate-900/50">
                  <td className="p-5 font-black text-white">التنصيب والتوصيل والتدريب وتوليد الرابط الموحد</td>
                  <td className="p-5 font-bold text-emerald-400">مجاناً بالكامل 🎁</td>
                  <td className="p-5 font-bold text-emerald-400">مجاناً بالكامل 🎁</td>
                  <td className="p-5 font-bold text-emerald-400">مجاناً بالكامل 🎁</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Dynamic CTA & Interactive Action Block */}
        <section className="text-center bg-gradient-to-r from-indigo-900/20 via-slate-900 to-indigo-950/20 border border-indigo-500/20 rounded-[3rem] p-8 md:p-12 space-y-6 relative overflow-hidden print-card">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl no-print"></div>
          
          <h3 className="text-xl sm:text-3xl font-black text-white">ابدأ التحول الرقمي الحقيقي لمتجرك اليوم!</h3>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold block print-text">
            نحن نضمن لمتجرك الكفاءة الفورية، وتحصيل أموال الحوالات بموثوقية، وإطلاق رابط تلقي وتدوين الطلبات الرقمية المباشرة في أقل من 3 دقائق.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 no-print text-center">
            <button 
              onClick={handlePrint}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Printer className="w-5 h-5 text-white" />
              <span>تحميل أو طباعة ملف دراسة الجدوى كـ PDF وبدء التفعيل</span>
            </button>
          </div>
          
          <div className="text-slate-500 text-[10px] sm:text-xs pt-2">
            * لا يتطلب النظام أي معدات إضافية، متوافق مع كافة أجهزة الأندرويد، الآيفون، الشاشات الذكية، أجهزة الـ تابلت، وطابعات الكاشير الحرارية.
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}
