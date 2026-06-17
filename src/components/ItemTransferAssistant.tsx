import React, { useState, useEffect } from "react";
import { Copy, Check, RotateCcw, Sparkles, FileText, CheckCircle2, ListTodo, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ItemTransferAssistantProps {
  orderId: string;
  itemsText: string;
  customerName?: string;
}

export function ItemTransferAssistant({ orderId, itemsText, customerName }: ItemTransferAssistantProps) {
  const [activeTab, setActiveTab] = useState<"smart" | "raw">("smart");
  const [items, setItems] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [autoCheckOnCopy, setAutoCheckOnCopy] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Parse items from the text when component loads or itemsText changes
  useEffect(() => {
    if (!itemsText) {
      setItems([]);
      return;
    }

    // Attempt to load previous transfer progress from localStorage
    const savedProgressKey = `transfer_progress_${orderId}`;
    let savedDoneTexts: string[] = [];
    try {
      const stored = localStorage.getItem(savedProgressKey);
      if (stored) {
        savedDoneTexts = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to load saved transfer progress", e);
    }

    // Parse the lines
    const lines = itemsText.split(/\r?\n/);
    const parsedItems: { id: string; text: string; done: boolean }[] = [];
    let counter = 0;

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Clean prefix indicators e.g. bullet points or list markers
      let cleaned = line
        // 1. Strip common bullets/dashes
        .replace(/^[\s-•*+○■▸✓✔]+/, "")
        // 2. Strip standard list numbering (e.g. 1-, 2., 12) or Arabic numerals ١-, ٢. with optional spaces
        .replace(/^[\d١٢٣٤٥٦٧٨٩٠a-zA-Z]+[-.)\s]*/, "")
        .trim();

      if (cleaned) {
        const itemId = `${orderId}_item_${counter++}`;
        // If this item's text was previously marked done, restore it
        const isDone = savedDoneTexts.includes(cleaned);
        parsedItems.push({
          id: itemId,
          text: cleaned,
          done: isDone
        });
      }
    }

    setItems(parsedItems);
  }, [itemsText, orderId]);

  // Save progress to localStorage whenever items state changes
  useEffect(() => {
    if (items.length === 0) return;
    const doneTexts = items.filter(item => item.done).map(item => item.text);
    try {
      localStorage.setItem(`transfer_progress_${orderId}`, JSON.stringify(doneTexts));
    } catch (e) {
      console.warn("Failed to save progress", e);
    }
  }, [items, orderId]);

  // Copy helper
  const handleCopyText = async (text: string, itemId?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (itemId) {
        setCopiedId(itemId);
        setTimeout(() => setCopiedId(null), 1500);

        if (autoCheckOnCopy) {
          toggleItemDone(itemId, true);
        }
      }
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Toggle item done status
  const toggleItemDone = (itemId: string, forceStatus?: boolean) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          return { ...item, done: forceStatus !== undefined ? forceStatus : !item.done };
        }
        return item;
      })
    );
  };

  // Reset progress
  const handleReset = () => {
    setItems(prev => prev.map(item => ({ ...item, done: false })));
  };

  // Find the next item to copy rules
  const nextItem = items.find(item => !item.done);
  
  // Stats
  const totalCount = items.length;
  const doneCount = items.filter(item => item.done).length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const allCompleted = totalCount > 0 && doneCount === totalCount;

  // Render Smart Tab
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg mb-4 text-right" dir="rtl">
      {/* Header Controller */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white">مفوّض معالجة ونقل السلع الفوري</h4>
            <p className="text-[10px] text-slate-400 font-bold">بوابة تسريع نقل الطلبات إلى نظام الكاشير والمبيعات</p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex bg-slate-905 border border-slate-800/80 p-0.5 rounded-xl text-[10px] font-black shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("smart")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "smart"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🧩 تفكيك ذكي ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("raw")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "raw"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            📄 النص الكامل
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "smart" ? (
          <motion.div
            key="smart-tab"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-4"
          >
            {/* Quick Advance Bar */}
            {nextItem ? (
              <div className="mb-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-3 flex flex-col md:flex-row justify-between items-center gap-3 shadow-sm">
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-indigo-400 block mb-0.5">الصنف التالي المتبقي للنقل:</span>
                  <span className="text-xs text-indigo-100 font-extrabold truncate max-w-sm block font-mono">
                    {nextItem.text}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(nextItem.text, nextItem.id)}
                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black px-4 py-2.5 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/15 cursor-pointer active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5 shrink-0" />
                  نسخ الصنف وتخطيه 📋
                </button>
              </div>
            ) : items.length > 0 ? (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-center flex flex-col items-center justify-center gap-1.5">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
                <h5 className="text-xs font-black text-emerald-400">رائع! تم نسخ ونقل جميع السلع بنجاح 🎉</h5>
                <p className="text-[10px] text-slate-400 font-bold">تم إدخال كافة محتويات الطلب إلى نظام مبيعات السوبرماركت.</p>
              </div>
            ) : null}

            {/* Smart progress and toggle options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-slate-800/60 leading-none">
              {/* Progress and resets */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold text-slate-400">الإنجاز:</span>
                  <span className="text-xs font-black text-indigo-400 font-mono">
                    {doneCount}/{totalCount}
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="flex-1 sm:w-24 bg-slate-950 h-2 rounded-full overflow-hidden shrink-0">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {doneCount > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1 px-2 text-[10px] font-bold text-slate-400 hover:text-red-400 transition-colors flex items-center gap-0.5 rounded bg-slate-800/45 cursor-pointer"
                    title="تفريغ التقدم والبدء من جديد"
                  >
                    <RotateCcw className="w-3 h-3" />
                    تصفير
                  </button>
                )}
              </div>

              {/* Automation Toggles */}
              <div className="flex items-center gap-2 self-end">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-350 select-none text-[10px] font-bold">
                  <input
                    type="checkbox"
                    checked={autoCheckOnCopy}
                    onChange={(e) => setAutoCheckOnCopy(e.target.checked)}
                    className="accent-indigo-500 w-3.5 h-3.5 rounded border-slate-800 bg-slate-950 cursor-pointer"
                  />
                  <span>شطب الصنف من القائمة تلقائياً عند نسخه</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="w-4 h-4 text-slate-500 hover:text-indigo-400 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Micro Help Panel */}
            {showHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-[10px] font-bold leading-relaxed text-slate-400 text-right"
              >
                💡 **كيف يعمل هذا المساعد؟** 
                <br />
                1. يقوم النظام بتقطيع قائمة طلبات العميل سطر بسطر.
                <br />
                2. عند النقر على أيقونة النسخ 📋 بجانب الصنف، يتم حفظ الاسم في الحافظة وتظليله تلقائياً كـ (تم ترحيله) لتجنب التكرار.
                <br />
                3. يمكنك استخدام ميزة **"نسخ الصنف التالي وتخطيه"** بالأعلى لتكرار نسخ العناصر المتبقية واحداً تلو الآخر والتبديل مع لوحة المبيعات (POS) بسرعة فائقة مع توفير عدد النقرات.
              </motion.div>
            )}

            {/* List of segmented elements */}
            {items.length > 0 ? (
              <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex justify-between items-center rounded-xl p-2.5 border transition-all ${
                      item.done
                        ? "bg-slate-950/40 border-slate-900/60 opacity-55"
                        : "bg-slate-950/80 hover:bg-slate-950/95 border-slate-800/60 hover:border-indigo-500/30"
                    }`}
                  >
                    {/* Item indicator status and text info */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pl-3">
                      <button
                        type="button"
                        onClick={() => toggleItemDone(item.id)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          item.done
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "border-slate-700 hover:border-indigo-400 bg-slate-900"
                        }`}
                      >
                        {item.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <span
                        className={`text-xs font-mono break-words leading-relaxed ${
                          item.done
                            ? "text-slate-500 line-through font-medium"
                            : "text-slate-200 font-extrabold"
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>

                    {/* Copy handler */}
                    <button
                      type="button"
                      onClick={() => handleCopyText(item.text, item.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 active:scale-95 border cursor-pointer shrink-0 ${
                        copiedId === item.id
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-450 hover:text-slate-200"
                      }`}
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-550 text-xs font-bold font-mono">
                محتوى فارغ أو لا توجد سلع قابلة للتفكيك حالياً.
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="raw-tab"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-4"
          >
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>النص كما أرسله العميل دون فرز تلقائي:</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopyText(itemsText, "raw-all")}
                className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                  copiedId === "raw-all"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                }`}
              >
                {copiedId === "raw-all" ? "تم نسخ النص كاملاً ✔️" : "نسخ النص كاملاً"}
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl text-xs font-mono font-bold leading-relaxed text-slate-300 min-h-[90px] select-all whitespace-pre-wrap text-right">
              {itemsText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
