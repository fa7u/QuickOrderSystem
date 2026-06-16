import React, { useState, useEffect } from "react";
import Footer from "./Footer";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, onSnapshot, doc, updateDoc, query, where, documentId } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { Send, CheckCircle2, ShoppingBag, User, Phone, AlertCircle, Clock, Utensils, Bell, ArrowRight, Loader2, XCircle, Trash2, Pencil, Truck, MapPin, Store, Coffee, Pizza, Sparkles, Pill, Croissant, ShoppingCart, Shirt, Gift, Flower, Smartphone, Apple, Landmark, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { subscribeUserToPush } from "../lib/pushSubscription";

const COLOR_THEMES: Record<string, {
  bgGlow: string;
  heroBg: string;
  heroSkewBg: string;
  iconBg: string;
  textAccent: string;
  focusRing: string;
  badgeBg: string;
  buttonBg: string;
  tabActive: string;
  gradientText: string;
  timelinePointActive: string;
  systemOnlineBullet: string;
}> = {
  emerald: {
    bgGlow: "bg-emerald-500/20",
    heroBg: "bg-emerald-600",
    heroSkewBg: "bg-emerald-700/20",
    iconBg: "bg-white/20",
    textAccent: "text-emerald-500",
    focusRing: "focus:ring-emerald-500",
    badgeBg: "bg-emerald-500/10 border-emerald-500/10 text-emerald-400",
    buttonBg: "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
    tabActive: "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/5",
    gradientText: "from-emerald-500",
    timelinePointActive: "border-indigo-500 text-indigo-400",
    systemOnlineBullet: "bg-emerald-400"
  },
  blue: {
    bgGlow: "bg-blue-500/20",
    heroBg: "bg-blue-600",
    heroSkewBg: "bg-blue-700/20",
    iconBg: "bg-white/20",
    textAccent: "text-blue-500",
    focusRing: "focus:ring-blue-500",
    badgeBg: "bg-blue-500/10 border-blue-500/10 text-blue-400",
    buttonBg: "bg-blue-500 hover:bg-blue-400 text-slate-950",
    tabActive: "bg-blue-500/10 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/5",
    gradientText: "from-blue-500",
    timelinePointActive: "border-blue-500 text-blue-400",
    systemOnlineBullet: "bg-blue-400"
  },
  indigo: {
    bgGlow: "bg-indigo-500/20",
    heroBg: "bg-indigo-600",
    heroSkewBg: "bg-indigo-700/20",
    iconBg: "bg-white/20",
    textAccent: "text-indigo-505",
    focusRing: "focus:ring-indigo-500",
    badgeBg: "bg-indigo-500/10 border-indigo-500/10 text-indigo-400",
    buttonBg: "bg-indigo-500 hover:bg-indigo-400 text-slate-950",
    tabActive: "bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/5",
    gradientText: "from-indigo-500",
    timelinePointActive: "border-indigo-500 text-indigo-400",
    systemOnlineBullet: "bg-indigo-400"
  },
  rose: {
    bgGlow: "bg-rose-500/20",
    heroBg: "bg-rose-600",
    heroSkewBg: "bg-rose-700/20",
    iconBg: "bg-white/20",
    textAccent: "text-rose-500",
    focusRing: "focus:ring-rose-500",
    badgeBg: "bg-rose-500/10 border-rose-500/10 text-rose-400",
    buttonBg: "bg-rose-500 hover:bg-rose-400 text-slate-950",
    tabActive: "bg-rose-500/10 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/5",
    gradientText: "from-rose-500",
    timelinePointActive: "border-rose-500 text-rose-400",
    systemOnlineBullet: "bg-rose-400"
  },
  amber: {
    bgGlow: "bg-amber-500/20",
    heroBg: "bg-amber-600",
    heroSkewBg: "bg-amber-700/20",
    iconBg: "bg-white/20",
    textAccent: "text-amber-500",
    focusRing: "focus:ring-amber-500",
    badgeBg: "bg-amber-500/10 border-amber-500/10 text-amber-400",
    buttonBg: "bg-amber-500 hover:bg-amber-400 text-slate-950",
    tabActive: "bg-amber-500/10 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/5",
    gradientText: "from-amber-500",
    timelinePointActive: "border-amber-500 text-amber-400",
    systemOnlineBullet: "bg-amber-400"
  },
  violet: {
    bgGlow: "bg-violet-500/20",
    heroBg: "bg-violet-600",
    heroSkewBg: "bg-violet-700/20",
    iconBg: "bg-white/20",
    textAccent: "text-violet-500",
    focusRing: "focus:ring-violet-500",
    badgeBg: "bg-violet-500/10 border-violet-500/10 text-violet-400",
    buttonBg: "bg-violet-500 hover:bg-violet-400 text-slate-950",
    tabActive: "bg-violet-500/10 border-violet-500 text-violet-400 shadow-lg shadow-violet-500/5",
    gradientText: "from-violet-500",
    timelinePointActive: "border-violet-500 text-violet-400",
    systemOnlineBullet: "bg-violet-400"
  },
  teal: {
    bgGlow: "bg-teal-500/20",
    heroBg: "bg-teal-600",
    heroSkewBg: "bg-teal-700/20",
    iconBg: "bg-white/20",
    textAccent: "text-teal-500",
    focusRing: "focus:ring-teal-500",
    badgeBg: "bg-teal-500/10 border-teal-500/10 text-teal-400",
    buttonBg: "bg-teal-500 hover:bg-teal-400 text-slate-950",
    tabActive: "bg-teal-500/10 border-teal-500 text-teal-400 shadow-lg shadow-teal-500/5",
    gradientText: "from-teal-500",
    timelinePointActive: "border-teal-500 text-teal-400",
    systemOnlineBullet: "bg-teal-400"
  }
};

export default function CustomerView({ orgId }: { orgId: string }) {
  const [name, setName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`customer_name_${orgId}`) || localStorage.getItem("customer_name") || "";
    }
    return "";
  });
  const [countryPrefix, setCountryPrefix] = useState(() => {
    if (typeof window !== "undefined") {
      const savedPhone = (localStorage.getItem(`customer_phone_${orgId}`) || localStorage.getItem("customer_phone") || "").replace(/\D/g, "");
      if (savedPhone.startsWith("966")) return "966";
      if (savedPhone.startsWith("967")) return "967";
    }
    return "967"; // default
  });

  const [rawPhone, setRawPhone] = useState(() => {
    if (typeof window !== "undefined") {
      const savedPhone = (localStorage.getItem(`customer_phone_${orgId}`) || localStorage.getItem("customer_phone") || "").replace(/\D/g, "");
      if (savedPhone.startsWith("966")) return savedPhone.substring(3);
      if (savedPhone.startsWith("967")) return savedPhone.substring(3);
      return savedPhone;
    }
    return "";
  });

  const [items, setItems] = useState("");
  const [deliveryOption, setDeliveryOption] = useState<"today" | "custom">("today");
  const [customDeliveryDate, setCustomDeliveryDate] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  // Re-populate from localStorage when status switches back to idle (or a new order is requested)
  useEffect(() => {
    if (status === "idle") {
      const savedName = localStorage.getItem(`customer_name_${orgId}`) || localStorage.getItem("customer_name") || "";
      const savedPhone = (localStorage.getItem(`customer_phone_${orgId}`) || localStorage.getItem("customer_phone") || "").replace(/\D/g, "");
      if (savedName && !name) setName(savedName);
      if (savedPhone) {
        if (savedPhone.startsWith("966")) {
          setCountryPrefix("966");
          setRawPhone(savedPhone.substring(3));
        } else if (savedPhone.startsWith("967")) {
          setCountryPrefix("967");
          setRawPhone(savedPhone.substring(3));
        } else {
          setRawPhone(savedPhone);
        }
      }
    }
  }, [status, orgId]);
  const [errorMessage, setErrorMessage] = useState("");
  const [subscriptionTier, setSubscriptionTier] = useState<string>("tier1");
  const [merchantWhatsApp, setMerchantWhatsApp] = useState("");
  const [restaurantName, setRestaurantName] = useState("بوابة الطلب السريع");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("emerald");
  const [welcomeMessage, setWelcomeMessage] = useState("أهلاً بك في نظام الطلبات المتطور. اطلب الآن وتابع حالة طلبك مباشرة.");
  const [chosenIcon, setChosenIcon] = useState("shopping-bag");
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [currency, setCurrency] = useState<string>("ريال يمني");

  const getCurrencyLabel = (cur: string) => {
    if (cur === "ريال سعودي") return "ر.س";
    if (cur === "دولار") return "دولار";
    return "ر.ي";
  };
  const [fulfillmentType, setFulfillmentType] = useState<"pickup" | "delivery">("pickup");
  const [addressManual, setAddressManual] = useState("");
  const [addressLocation, setAddressLocation] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"idle" | "success" | "error" | "denied">("idle");

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    setIsLocating(true);
    setLocationStatus("idle");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const gmapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setAddressLocation(gmapsLink);
        setIsLocating(false);
        setLocationStatus("success");
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("denied");
        } else {
          setLocationStatus("error");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Custom step fields for Order Tracking page settings (with default Arabic strings)
  const [stepPendingLabel, setStepPendingLabel] = useState("تم استلام الطلب بنجاح");
  const [stepPendingDesc, setStepPendingDesc] = useState("تم تسجيل طلبك بنجاح في النظام وفريق العمل يراجعه الآن.");
  const [stepPendingIcon, setStepPendingIcon] = useState("clock");

  const [stepAcceptedLabel, setStepAcceptedLabel] = useState("جاري التحضير والتجهيز");
  const [stepAcceptedDesc, setStepAcceptedDesc] = useState("بدأ الموظفون المباشرة في العمل على تجهيز محتويات طلبك بكل دقة.");
  const [stepAcceptedIcon, setStepAcceptedIcon] = useState("utensils");

  const [stepReadyLabel, setStepReadyLabel] = useState("الطلب جاهز للتوصيل! 🎉");
  const [stepReadyDesc, setStepReadyDesc] = useState("اكتمل تجهيز طلبك بالكامل وجاري تحضيره للتسليم لخط التوصيل.");
  const [stepReadyIcon, setStepReadyIcon] = useState("bell");

  const [stepDeliveringLabel, setStepDeliveringLabel] = useState("جاري توصيل الطلب للموقع! 🚚");
  const [stepDeliveringDesc, setStepDeliveringDesc] = useState("الطلب حالياً مع مندوب التوصيل وهو في طريقه إليك الآن.");
  const [stepDeliveringIcon, setStepDeliveringIcon] = useState("truck");

  const [stepCompletedLabel, setStepCompletedLabel] = useState("تم تسليم الطلب بنجاح");
  const [stepCompletedDesc, setStepCompletedDesc] = useState("نشكرك كثيراً لثقتك بنا، وجاهزون لخدمتك دائماً ونأمل رؤيتك قريباً!");
  const [stepCompletedIcon, setStepCompletedIcon] = useState("check-circle-2");

  const [stepPickupReadyLabel, setStepPickupReadyLabel] = useState("الطلب جاهز للاستلام! 🎉");
  const [stepPickupReadyDesc, setStepPickupReadyDesc] = useState("اكتمل تجهيز طلبك بالكامل وبإمكانك استلامه الآن من نقطة التسليم.");
  const [stepPickupReadyIcon, setStepPickupReadyIcon] = useState("bell");

  const [stepPickupCompletedLabel, setStepPickupCompletedLabel] = useState("تم الاستلام والمغادرة");
  const [stepPickupCompletedDesc, setStepPickupCompletedDesc] = useState("نشكرك كثيراً لثقتك بنا، وجاهزون لخدمتك دائماً ونأمل رؤيتك قريباً!");
  const [stepPickupCompletedIcon, setStepPickupCompletedIcon] = useState("check-circle-2");

  const [fieldNameLabel, setFieldNameLabel] = useState("اسم العميل");
  const [fieldPhoneLabel, setFieldPhoneLabel] = useState("رقم الجوال");
  const [fieldItemsLabel, setFieldItemsLabel] = useState("تفاصيل الطلب");

  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`last_order_id_${orgId}`) || null;
    }
    return null;
  });

  const [savedOrderIds, setSavedOrderIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`customer_order_ids_${orgId}`);
        if (stored) {
          return JSON.parse(stored);
        }
        const old = localStorage.getItem(`last_order_id_${orgId}`);
        return old ? [old] : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [myOrdersData, setMyOrdersData] = useState<any[]>([]);
  const [liveOrder, setLiveOrder] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [expandedBankAccountId, setExpandedBankAccountId] = useState<string | null>(null);
  const [copiedAccountId, setCopiedAccountId] = useState<string | null>(null);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  const [isEditingItems, setIsEditingItems] = useState(false);
  const [editItemsValue, setEditItemsValue] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const isDeliveryOrder = liveOrder?.fulfillmentType === "delivery" && deliveryEnabled;

  const getStatusIdx = () => {
    if (!liveOrder) return 0;
    if (liveOrder.status === "pending") return 0;
    if (isDeliveryOrder) {
      if (liveOrder.status === "accepted" && liveOrder.totalPrice === undefined) return 1;
      if ((liveOrder.status === "accepted" || liveOrder.status === "ready") && liveOrder.paymentStatus !== "paid") return 2;
      if (liveOrder.status === "delivering" || ((liveOrder.status === "ready" || liveOrder.status === "accepted") && liveOrder.paymentStatus === "paid")) return 3;
      if (liveOrder.status === "completed") return 4;
    } else {
      if (liveOrder.status === "accepted") return 1;
      if (liveOrder.status === "ready") return 2;
      if (liveOrder.status === "completed") return 3;
    }
    return 0;
  };

  const currentStatusIdx = getStatusIdx();

  const handleCopyAccountNumber = (accountId: string, accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedAccountId(accountId);
    setTimeout(() => {
      setCopiedAccountId(null);
    }, 2000);
  };

  // Message notifications tracker (using Service Worker registrations for maximum sleep-mode/background delivery)
  const lastChatLengthRef = React.useRef(0);
  const isFirstChatLoad = React.useRef(true);
  const lastStatusRef = React.useRef<string>("");
  const isFirstStatusLoad = React.useRef(true);

  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });

  const [pushStatusMsg, setPushStatusMsg] = useState<{ type: "idle" | "loading" | "success" | "error"; text: string }>({ type: "idle", text: "" });

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      setPushStatusMsg({
        type: "error",
        text: "التنبيهات غير مدعومة في متصفحك الحالي. إذا كنت تستخدم آيفون، يرجى إضافة الموقع للشاشة الرئيسية (PWA) أولاً لتفعيل التنبيهات."
      });
      return;
    }

    setPushStatusMsg({ type: "loading", text: "جاري طلب إذن عرض التنبيهات..." });

    try {
      let perm;
      try {
        perm = await Notification.requestPermission();
      } catch (e) {
        perm = await new Promise<NotificationPermission>((resolve) => {
          Notification.requestPermission(resolve);
        });
      }

      setNotificationPermission(perm);

      if (perm === "granted") {
        if (trackingOrderId) {
          setPushStatusMsg({ type: "loading", text: "جاري ربط هاتفك بخادم التنبيهات الفورية..." });
          const res = await subscribeUserToPush({
            orgId,
            userType: "customer",
            orderId: trackingOrderId
          });
          if (res) {
            setPushStatusMsg({
              type: "success",
              text: "تم تفعيل التنبيهات الفورية بنجاح! ستصلك التحديثات حتى لو قمت بإغلاق المتصفح."
            });
          } else {
            setPushStatusMsg({
              type: "error",
              text: "تم منح الإذن ولكن حدث خطأ أثناء التسجيل السحابي بالخلقية. يرجى التحقق من اتصال الإنترنت."
            });
          }
        } else {
          setPushStatusMsg({
            type: "success",
            text: "تم تفعيل إذن التنبيهات بنجاح في المتصفح!"
          });
        }
      } else if (perm === "denied") {
        setPushStatusMsg({
          type: "error",
          text: "تم رفض التنبيهات. يرجى السماح بها يدوياً من إعدادات المتصفح (أيقونة القفل في شريط العنوان أعلى الصفحة) لتصلك التحديثات."
        });
      } else {
        setPushStatusMsg({
          type: "idle",
          text: ""
        });
      }
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      setPushStatusMsg({
        type: "error",
        text: "حدث خطأ أثناء تفعيل التنبيهات. يرجى المحاولة مرة أخرى."
      });
    }
  };

  const triggerWebNotification = (title: string, body: string) => {
    // 1. Play native fallback audio
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play();
    } catch (err) {
      console.warn("Audio play blocked:", err);
    }

    // 2. To avoid double notifications when the user is already inside the active application tab,
    // we should NOT trigger any notification popups if the document is active and visible.
    // The user already sees the updates on their screen in real-time.
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      console.log("App is in foreground and focused. Suppressing duplicate notification popups:", title);
      return;
    }

    // Otherwise, let the background Service Worker push event handle the notifications
    // to avoid any duplicate chimes or popups.
  };

  const fallbackDesktopNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: logoUrl || undefined,
          requireInteraction: true
        });
      } catch (err) {
        console.error("Failed standard desktop notification:", err);
      }
    }
  };

  useEffect(() => {
    // Reset refs on order tracking change
    lastChatLengthRef.current = 0;
    isFirstChatLoad.current = true;
    lastStatusRef.current = "";
    isFirstStatusLoad.current = true;
  }, [trackingOrderId]);

  useEffect(() => {
    if (orgId && trackingOrderId && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      subscribeUserToPush({
        orgId,
        userType: "customer",
        orderId: trackingOrderId
      }).catch(err => console.error("Error subscribing tracking customer to push:", err));
    }
  }, [trackingOrderId, orgId]);

  useEffect(() => {
    if (!liveOrder) return;
    const currentChat = liveOrder.chat || [];
    const len = currentChat.length;

    if (isFirstChatLoad.current) {
      lastChatLengthRef.current = len;
      isFirstChatLoad.current = false;
      return;
    }

    if (len > lastChatLengthRef.current) {
      const newMessages = currentChat.slice(lastChatLengthRef.current);
      const staffMessage = newMessages.find((m: any) => m.sender === "staff");
      
      if (staffMessage) {
        triggerWebNotification(
          `💬 رسالة من المندوب/الكادر - ${restaurantName}`,
          staffMessage.text
        );
      }
      lastChatLengthRef.current = len;
    }
  }, [liveOrder?.chat, restaurantName]);

  useEffect(() => {
    if (!liveOrder) return;
    const currentStatus = liveOrder.status;

    if (isFirstStatusLoad.current) {
      lastStatusRef.current = currentStatus;
      isFirstStatusLoad.current = false;
      return;
    }

    if (currentStatus && currentStatus !== lastStatusRef.current) {
      const isPickup = liveOrder.fulfillmentType === "pickup";
      const statusTitle = `🔔 تحديث حالة طلبك - ${restaurantName}`;
      let statusBody = "";

      switch (currentStatus) {
        case "pending":
          statusBody = stepPendingLabel || "تم استلام الطلب وبانتظار المراجعة";
          break;
        case "accepted":
          statusBody = stepAcceptedLabel || "تم قبول الطلب وبدأ التحضير 👨‍🍳";
          break;
        case "ready":
          statusBody = isPickup 
            ? (stepPickupReadyLabel || "الطلب جاهز للاستلام! 🎉") 
            : (stepReadyLabel || "اكتمل تجهيز الطلب وهو جاهز للتوصيل! 🎉");
          break;
        case "delivering":
          statusBody = stepDeliveringLabel || "الطلب مع مندوب التوصيل وهو في طريقه إليك 🚚";
          break;
        case "completed":
          statusBody = isPickup 
            ? (stepPickupCompletedLabel || "تم الاستلام بنجاح، شكراً لزيارتكم! ❤️") 
            : (stepCompletedLabel || "تم تسليم الطلب بنجاح، شكراً لثقتكم! ❤️");
          break;
        case "cancelled":
          statusBody = "عذراً، تم إلغاء طلبك من قبل المتجر أو لظروف طارئة ❌";
          break;
        default:
          statusBody = `تغيرت حالة الطلب إلى: ${currentStatus}`;
      }

      triggerWebNotification(statusTitle, statusBody);
      lastStatusRef.current = currentStatus;
    }
  }, [
    liveOrder?.status,
    liveOrder?.fulfillmentType,
    restaurantName,
    stepPendingLabel,
    stepAcceptedLabel,
    stepReadyLabel,
    stepDeliveringLabel,
    stepCompletedLabel,
    stepPickupReadyLabel,
    stepPickupCompletedLabel
  ]);




  const handleSaveEdit = async () => {
    if (!db || !orgId || !trackingOrderId || !editItemsValue.trim()) return;
    setSavingEdit(true);
    try {
      const orderRef = doc(db, "organizations", orgId, "orders", trackingOrderId);
      const existingChat = liveOrder?.chat || [];
      await updateDoc(orderRef, {
        items: editItemsValue,
        chat: [...existingChat, {
          sender: "system",
          senderName: "النظام",
          text: "📝 تم تحديث تفاصيل محتويات الطلب من العميل",
          createdAt: new Date().toISOString()
        }],
        updatedAt: serverTimestamp()
      });
      setIsEditingItems(false);
    } catch (err) {
      console.error("Error updating order items:", err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!db || !orgId || !trackingOrderId) return;
    setCancelling(true);
    try {
      const orderRef = doc(db, "organizations", orgId, "orders", trackingOrderId);
      const existingChat = liveOrder?.chat || [];
      await updateDoc(orderRef, {
        status: "cancelled",
        cancelledBy: "customer",
        chat: [...existingChat, {
          sender: "system",
          senderName: "النظام",
          text: "❌ قام العميل بإلغاء الطلب",
          createdAt: new Date().toISOString()
        }],
        updatedAt: serverTimestamp()
      });
      setShowCancelConfirm(false);
    } catch (err) {
      console.error("Error cancelling order:", err);
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!db || !orgId || !trackingOrderId) return;
    setIsUpdatingPayment(true);
    try {
      const orderRef = doc(db, "organizations", orgId, "orders", trackingOrderId);
      const existingChat = liveOrder?.chat || [];
      await updateDoc(orderRef, {
        paymentStatus: "checking",
        chat: [...existingChat, {
          sender: "system",
          senderName: "النظام",
          text: "💳 قام العميل بتحويل المبلغ ويطلب تأكيد عملية الدفع. يرجى التحقق وتأكيد استلام المبلغ.",
          createdAt: new Date().toISOString()
        }],
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error setting payment checking:", err);
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!db || !orgId || !trackingOrderId) return;
    setIsUpdatingPayment(true);
    try {
      const orderRef = doc(db, "organizations", orgId, "orders", trackingOrderId);
      await updateDoc(orderRef, {
        paymentStatus: "unpaid",
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error resetting payment status:", err);
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  useEffect(() => {
    if (!db || !orgId || !trackingOrderId) {
      setLiveOrder(null);
      return;
    }
    setTrackingLoading(true);
    const unsub = onSnapshot(
      doc(db, "organizations", orgId, "orders", trackingOrderId),
      (docSnap) => {
        setTrackingLoading(false);
        if (docSnap.exists()) {
          setLiveOrder({ id: docSnap.id, ...docSnap.data() });
        } else {
          setLiveOrder(null);
          localStorage.removeItem(`last_order_id_${orgId}`);
          setTrackingOrderId(null);
        }
      },
      (err) => {
        console.error("Error listening to order status:", err);
        setTrackingLoading(false);
      }
    );
    return () => unsub();
  }, [orgId, trackingOrderId]);

  useEffect(() => {
    if (!db || !orgId || savedOrderIds.length === 0) {
      setMyOrdersData([]);
      return;
    }
    
    const slicedIds = savedOrderIds.slice(0, 10);
    
    try {
      const q = query(
        collection(db, "organizations", orgId, "orders"),
        where(documentId(), "in", slicedIds)
      );
      
      const unsub = onSnapshot(q, (snapshot) => {
        const ordersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const sortedList = ordersList.sort((a: any, b: any) => {
          const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
          const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
          return bTime - aTime;
        });
        
        setMyOrdersData(sortedList);
      }, (err) => {
        console.error("Error listening to multiple orders:", err);
      });
      
      return () => unsub();
    } catch (e) {
      console.error("Query setup error for multi-orders:", e);
    }
  }, [orgId, savedOrderIds]);

  useEffect(() => {
    if (!db || !orgId) return;
    const unsub = onSnapshot(collection(db, "organizations", orgId, "bank_accounts"), (snap) => {
      setBankAccounts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [db, orgId]);

  useEffect(() => {
    if (!db || !orgId) return;
    const unsub = onSnapshot(doc(db, "organizations", orgId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSubscriptionTier(data.subscriptionTier || "tier1");
      }
    }, (err) => {
      console.error("Error loading org subscription status:", err);
    });
    return () => unsub();
  }, [db, orgId]);

  useEffect(() => {
    if (!db || !orgId) return;
    const unsub = onSnapshot(doc(db, "organizations", orgId, "settings", "branding"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRestaurantName(data.restaurantName || "بوابة الطلب السريع");
        setDeliveryEnabled(data.deliveryEnabled !== false);
        setCurrency(data.currency || "ريال يمني");
        setLogoUrl(data.logoUrl || "");
        setPrimaryColor(data.primaryColor || "emerald");
        setWelcomeMessage(data.welcomeMessage || "أهلاً بك في نظام الطلبات المتطور. اطلب الآن وتابع حالة طلبك مباشرة.");
        setChosenIcon(data.chosenIcon || "shopping-bag");
        if (data.merchantWhatsApp) {
          setMerchantWhatsApp(data.merchantWhatsApp);
        } else {
          setMerchantWhatsApp("");
        }

        // Load custom steps if set
        if (data.stepPendingLabel) setStepPendingLabel(data.stepPendingLabel);
        if (data.stepPendingDesc) setStepPendingDesc(data.stepPendingDesc);
        if (data.stepPendingIcon) setStepPendingIcon(data.stepPendingIcon);

        if (data.stepAcceptedLabel) setStepAcceptedLabel(data.stepAcceptedLabel);
        if (data.stepAcceptedDesc) setStepAcceptedDesc(data.stepAcceptedDesc);
        if (data.stepAcceptedIcon) setStepAcceptedIcon(data.stepAcceptedIcon);

        if (data.stepReadyLabel) setStepReadyLabel(data.stepReadyLabel);
        if (data.stepReadyDesc) setStepReadyDesc(data.stepReadyDesc);
        if (data.stepReadyIcon) setStepReadyIcon(data.stepReadyIcon);

        if (data.stepDeliveringLabel) setStepDeliveringLabel(data.stepDeliveringLabel);
        if (data.stepDeliveringDesc) setStepDeliveringDesc(data.stepDeliveringDesc);
        if (data.stepDeliveringIcon) setStepDeliveringIcon(data.stepDeliveringIcon);

        if (data.stepCompletedLabel) setStepCompletedLabel(data.stepCompletedLabel);
        if (data.stepCompletedDesc) setStepCompletedDesc(data.stepCompletedDesc);
        if (data.stepCompletedIcon) setStepCompletedIcon(data.stepCompletedIcon);

        if (data.stepPickupReadyLabel) setStepPickupReadyLabel(data.stepPickupReadyLabel);
        if (data.stepPickupReadyDesc) setStepPickupReadyDesc(data.stepPickupReadyDesc);
        if (data.stepPickupReadyIcon) setStepPickupReadyIcon(data.stepPickupReadyIcon);

        if (data.stepPickupCompletedLabel) setStepPickupCompletedLabel(data.stepPickupCompletedLabel);
        if (data.stepPickupCompletedDesc) setStepPickupCompletedDesc(data.stepPickupCompletedDesc);
        if (data.stepPickupCompletedIcon) setStepPickupCompletedIcon(data.stepPickupCompletedIcon);
      }
    });
    return () => unsub();
  }, [orgId]);

  useEffect(() => {
    // If the user hasn't typed anything yet, let's pre-fill the countryPrefix matching the currency!
    if (!rawPhone) {
      if (currency === "ريال سعودي") {
        setCountryPrefix("966");
      } else {
        setCountryPrefix("967");
      }
    }
  }, [currency]);

  // Enforce SaaS Subscription Gating for Customer Interface
  const finalRestaurantName = (subscriptionTier === "tier1" || subscriptionTier === "tier2") 
    ? "quick order @ الطلب السريع" 
    : restaurantName;

  const finalLogoUrl = (subscriptionTier === "tier1") 
    ? "" 
    : logoUrl;

  const finalPrimaryColor = (subscriptionTier === "tier1") 
    ? "emerald" 
    : primaryColor;

  const theme = COLOR_THEMES[finalPrimaryColor] || COLOR_THEMES.emerald;

  const finalWelcomeMessage = (subscriptionTier === "tier1" || subscriptionTier === "tier2") 
    ? "أهلاً بك في نظام الطلبات المتطور (quick order). اطلب الآن وتابع حالة طلبك مباشرة." 
    : welcomeMessage;

  const finalChosenIcon = (subscriptionTier === "tier1") 
    ? "shopping-bag" 
    : chosenIcon;

  // Custom step labels restriction based on tier
  const finalStepPendingLabel = (subscriptionTier === "tier3") ? stepPendingLabel : "تم استلام الطلب وبانتظار المراجعة";
  const finalStepPendingDesc = (subscriptionTier === "tier3") ? stepPendingDesc : "تفاصيل طلبك قيد المراجعة والاعتماد الفوري من قبل الإدارة";
  const finalStepPendingIcon = (subscriptionTier === "tier3") ? stepPendingIcon : "clock";

  const finalStepAcceptedLabel = (subscriptionTier === "tier3") ? stepAcceptedLabel : "جاري تحضير طلبك";
  const finalStepAcceptedDesc = (subscriptionTier === "tier3") ? stepAcceptedDesc : "طلبك قيد التحضير الفعلي وتجهيز المحتويات الآن";
  const finalStepAcceptedIcon = (subscriptionTier === "tier3") ? stepAcceptedIcon : "package";

  const finalStepReadyLabel = (subscriptionTier === "tier3") ? stepReadyLabel : "طلبك جاهز للتسليم";
  const finalStepReadyDesc = (subscriptionTier === "tier3") ? stepReadyDesc : "تم الانتهاء من تجهيز طلبك بالكامل وهو بانتظار مندوب التوصيل";
  const finalStepReadyIcon = (subscriptionTier === "tier3") ? stepReadyIcon : "check-circle";

  const finalStepDeliveringLabel = (subscriptionTier === "tier3") ? stepDeliveringLabel : "جاري توصيل طلبك";
  const finalStepDeliveringDesc = (subscriptionTier === "tier3") ? stepDeliveringDesc : "المندوب في طريقه إليك الآن لتسليم الشحنة، يرجى الاستعداد";
  const finalStepDeliveringIcon = (subscriptionTier === "tier3") ? stepDeliveringIcon : "truck";

  const finalStepCompletedLabel = (subscriptionTier === "tier3") ? stepCompletedLabel : "تم التوصيل والتسليم بنجاح";
  const finalStepCompletedDesc = (subscriptionTier === "tier3") ? stepCompletedDesc : "شكرًا لتعاملك معنا وثقتك بخدماتنا! نتمنى لك يومًا طيبًا";
  const finalStepCompletedIcon = (subscriptionTier === "tier3") ? stepCompletedIcon : "heart";

  const finalStepPickupReadyLabel = (subscriptionTier === "tier3") ? stepPickupReadyLabel : "جاهز للتسلم من الفرع";
  const finalStepPickupReadyDesc = (subscriptionTier === "tier3") ? stepPickupReadyDesc : "طلبك جاهز تمامًا وبانتظار تشريفك لاستلامه من الفرع الخاص بنا";
  const finalStepPickupReadyIcon = (subscriptionTier === "tier3") ? stepPickupReadyIcon : "shopping-bag";

  const finalStepPickupCompletedLabel = (subscriptionTier === "tier3") ? stepPickupCompletedLabel : "تم تسليم الطلب من الفرع";
  const finalStepPickupCompletedDesc = (subscriptionTier === "tier3") ? stepPickupCompletedDesc : "سعدنا بتشريفك لنا وتم تسليمك الطلب بنجاح. بالهناء والشفاء!";
  const finalStepPickupCompletedIcon = (subscriptionTier === "tier3") ? stepPickupCompletedIcon : "smile";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !orgId) {
      setErrorMessage("جاري تهيئة النظام، يرجى المحاولة بعد قليل.");
      setStatus("error");
      return;
    }

    if (fulfillmentType === "delivery" && !addressManual.trim() && !addressLocation.trim()) {
      setErrorMessage("يرجى تعبئة أحد الحقلين على الأقل لتحديد موقع التوصيل: العنوان اليدوي، أو الموقع الجغرافي (GPS).");
      setStatus("error");
      return;
    }

    if (!rawPhone || rawPhone.trim().length < 5) {
      setErrorMessage("يرجى إدخال رقم جوال صحيح.");
      setStatus("error");
      return;
    }
    
    setStatus("sending");
    setErrorMessage("");
    try {
      const fullPhone = `${countryPrefix}${rawPhone.trim()}`;
      // Save name and phone to localStorage so they are pre-filled on subsequent orders
      if (typeof window !== "undefined") {
        localStorage.setItem(`customer_name_${orgId}`, name);
        localStorage.setItem(`customer_phone_${orgId}`, fullPhone);
        localStorage.setItem("customer_name", name);
        localStorage.setItem("customer_phone", fullPhone);
      }

      const docRef = await addDoc(collection(db, "organizations", orgId, "orders"), {
        customerName: name,
        customerPhone: fullPhone,
        items: items,
        status: "pending",
        deliveryDate: deliveryOption === "today" ? "اليوم" : customDeliveryDate,
        fulfillmentType: fulfillmentType,
        addressManual: fulfillmentType === "delivery" ? addressManual : "",
        addressLocation: fulfillmentType === "delivery" ? addressLocation : "",
        chat: [{
          sender: "system",
          senderName: "النظام",
          text: "🆕 تم إرسال طلبك بنجاح وهو قيد الانتظار لمراجعته وقبوله",
          createdAt: new Date().toISOString()
        }],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Subscribe customer to push notifications for background alerts
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        subscribeUserToPush({
          orgId,
          userType: "customer",
          orderId: docRef.id
        }).catch(err => console.error("Immediate push subscribe failed:", err));
      }

      // Notify staff/admin of new order
      fetch("/api/notify-new-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          orderId: docRef.id,
          customerName: name,
          items: items,
          restaurantName
        })
      }).catch(err => console.error("Error calling notify-new-order API:", err));

      const updatedIds = [docRef.id, ...savedOrderIds.filter(id => id !== docRef.id)];
      localStorage.setItem(`customer_order_ids_${orgId}`, JSON.stringify(updatedIds));
      localStorage.setItem(`last_order_id_${orgId}`, docRef.id);
      setSavedOrderIds(updatedIds);
      setTrackingOrderId(docRef.id);
      setStatus("success");
      setName("");
      setRawPhone("");
      setItems("");
      setDeliveryOption("today");
      setCustomDeliveryDate("");
      setFulfillmentType("pickup");
      setAddressManual("");
      setAddressLocation("");
      setLocationStatus("idle");
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      if (error.message?.toLowerCase().includes("offline")) {
        setErrorMessage("عذراً، النظام حالياً غير متصل بالإنترنت. يرجى التأكد من اتصالك.");
      } else if (error.message?.toLowerCase().includes("permission")) {
        setErrorMessage("عذراً، لا نملك صلاحيات لإرسال الطلب حالياً. اتصل بالمسؤول.");
      } else {
        setErrorMessage("عذراً، حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Human-crafted ambient background blur gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 hidden lg:block">
        <div className={cn("absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[130px] transition-all", theme.bgGlow)}></div>
        <div className="absolute top-[60%] -right-[5%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_24px_60px_rgba(0,0,0,0.6)] border border-slate-800/80 overflow-hidden z-10"
      >
        <div className="p-5 sm:p-8 space-y-6">
          {/* Brand/Hero Section - Custom minimalist luxury brand banner */}
          <div className={cn("p-6 text-white flex flex-col items-center text-center relative overflow-hidden rounded-3xl shrink-0 shadow-md group", theme.heroBg)}>
            <div className={cn("absolute top-0 left-0 w-full h-full skew-x-12 translate-x-1/2", theme.heroSkewBg)}></div>
            
            {/* Elegant logo wrapper */}
            <div className={cn(
              "w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-4 relative z-10 shadow-lg border overflow-hidden p-1.5 transition-all duration-500 group-hover:scale-[1.03]",
              finalLogoUrl ? "bg-white border-white/40" : "bg-white/10 backdrop-blur-md border-white/20"
            )}>
              {finalLogoUrl ? (
                <img src={finalLogoUrl} alt="الشعار" className="w-full h-full object-contain rounded-lg" referrerPolicy="no-referrer" />
              ) : (
                (() => {
                  const IconCompName = (() => {
                    switch (finalChosenIcon) {
                      case "shopping-bag": return ShoppingBag;
                      case "utensils": return Utensils;
                      case "store": return Store;
                      case "coffee": return Coffee;
                      case "pizza": return Pizza;
                      case "sparkles": return Sparkles;
                      case "pill": return Pill;
                      case "croissant": return Croissant;
                      case "shopping-cart": return ShoppingCart;
                      case "shirt": return Shirt;
                      case "gift": return Gift;
                      case "flower": return Flower;
                      case "smartphone": return Smartphone;
                      case "apple": return Apple;
                      default: return ShoppingBag;
                    }
                  })();
                  return <IconCompName className="w-6 h-6 text-white" />;
                })()
              )}
            </div>
            
            {/* Online Status Label */}
            <div className="mb-2.5 z-10 flex items-center gap-1.5 px-3 py-1 bg-black/20 backdrop-blur-md border border-white/10 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[9px] font-bold text-white tracking-wide">نظام فوري مفعّل</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black relative z-10 leading-tight mb-2 text-white font-sans tracking-tight" dir="rtl">
               {finalRestaurantName}
            </h1>
            <p className="text-white/90 text-[11px] font-bold leading-normal relative z-10 max-w-[340px] text-center" dir="rtl">{finalWelcomeMessage}</p>
          </div>

          {/* Form and info details stack */}
          <div className="flex flex-col justify-start">
            {/* Multi-Order Live Tracking Switcher */}
            {myOrdersData.length > 0 && (
              <div className="mb-6 p-4 bg-slate-900 border border-slate-800 rounded-3xl text-right shrink-0" dir="rtl">
                <span className="text-[10px] text-slate-500 font-extrabold block mb-2 px-1">📋 طلباتك النشطة والسابقة ({myOrdersData.length})</span>
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {/* Option 1: Back to new order form */}
                  <button
                    type="button"
                    onClick={() => {
                      setTrackingOrderId(null);
                      setStatus("idle");
                    }}
                    className={cn(
                      "px-3 py-2 rounded-xl border text-[11px] font-black transition-all flex items-center gap-1 shrink-0 select-none",
                      !trackingOrderId 
                        ? cn(theme.buttonBg, "font-bold border-transparent") 
                        : "bg-slate-950/60 text-slate-400 border-slate-900 hover:border-slate-805 active:scale-95"
                    )}
                  >
                    <span>+ طلب جديد</span>
                  </button>

                  {/* Other saved active orders */}
                  {myOrdersData.map((ord: any) => {
                    const isActive = trackingOrderId === ord.id;
                    return (
                      <button
                        key={ord.id}
                        type="button"
                        onClick={() => {
                          setTrackingOrderId(ord.id);
                          localStorage.setItem(`last_order_id_${orgId}`, ord.id);
                        }}
                        className={cn(
                          "px-3 py-2 rounded-xl border text-[11px] font-black transition-all flex items-center gap-2 shrink-0 select-none active:scale-95",
                          isActive 
                            ? "bg-indigo-600 text-white border-indigo-505 font-extrabold shadow-md shadow-indigo-500/20" 
                            : "bg-slate-950/60 text-slate-300 border-slate-900 hover:border-slate-800"
                        )}
                      >
                        <span className="font-mono">#ORD-{ord.id.slice(-6).toUpperCase()}</span>
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-md font-extrabold",
                          isActive 
                            ? "bg-white/10 text-white" 
                            : (
                              ord.status === "pending" ? "text-amber-400 bg-amber-400/10 border border-amber-500/10" :
                              ord.status === "accepted" ? "text-blue-400 bg-blue-400/10 border border-blue-500/10" :
                              ord.status === "ready" ? "text-emerald-400 bg-emerald-400/10 border border-emerald-500/10" :
                              ord.status === "delivering" ? "text-teal-400 bg-teal-400/10 border border-teal-500/10" :
                              ord.status === "completed" ? "text-slate-400 bg-slate-800" : "text-red-400 bg-red-400/10"
                            )
                        )}>
                          {ord.status === "pending" && "جاري الانتظار"}
                          {ord.status === "accepted" && "جاري التحضير"}
                          {ord.status === "ready" && "جاهز للتسليم! 🎉"}
                          {ord.status === "delivering" && "جاري التوصيل... 🚚"}
                          {ord.status === "completed" && "تم التسليم"}
                          {ord.status === "cancelled" && "ملغى"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
            {trackingOrderId && liveOrder ? (
              <motion.div 
                key="tracking"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full text-right flex flex-col justify-between h-full"
                dir="rtl"
              >
                <div>
                  {/* Dynamic Status Tracking Title */}
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <span>حالة الطلب المباشرة</span>
                      <span className="flex h-2 w-2 relative">
                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", theme.systemOnlineBullet)}></span>
                        <span className={cn("relative inline-flex rounded-full h-2 w-2", theme.systemOnlineBullet)}></span>
                      </span>
                    </h2>
                    <span className={cn("text-[9px] font-bold tracking-widest font-mono px-2.5 py-1 rounded-full uppercase", theme.badgeBg)}>LIVE Tracking</span>
                  </div>
                  
                  <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
                    يتم تحديث هذه الصفحة تلقائياً بالتزامن مع معالجة طلبك أولاً بأول.
                  </p>

                  {/* Micro Global Tracking Header */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">رقم طلبك</span>
                      <span className="text-xs font-black text-white font-mono uppercase">#ORD-{trackingOrderId.slice(-6).toUpperCase()}</span>
                    </div>
                    {liveOrder.customerName && (
                      <div className="text-center">
                        <span className="text-[10px] text-slate-500 font-bold block">الاسم</span>
                        <span className="text-xs font-black text-slate-300 leading-none">{liveOrder.customerName}</span>
                      </div>
                    )}
                    <div className="text-left">
                      <span className="text-[10px] text-slate-500 font-bold block">الحالة</span>
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-lg inline-block mt-0.5",
                        liveOrder?.status === "pending" && "text-amber-400 bg-amber-400/10 border border-amber-500/10",
                        liveOrder?.status === "accepted" && "text-blue-400 bg-blue-400/10 border border-blue-500/10 animate-pulse",
                        liveOrder?.status === "ready" && cn("animate-bounce border", theme.badgeBg),
                        liveOrder?.status === "delivering" && "text-teal-400 bg-teal-400/10 border border-teal-500/10 animate-pulse",
                        liveOrder?.status === "completed" && "text-indigo-400 bg-indigo-400/10 border border-indigo-500/10",
                        liveOrder?.status === "cancelled" && "text-red-400 bg-red-400/10 border border-red-500/10"
                      )}>
                        {liveOrder?.status === "pending" && "قيد الانتظار"}
                        {liveOrder?.status === "accepted" && "جاري التحضير"}
                        {liveOrder?.status === "ready" && "جاهز للتسليم"}
                        {liveOrder?.status === "delivering" && "جاري التوصيل"}
                        {liveOrder?.status === "completed" && "تم التسليم"}
                        {liveOrder?.status === "cancelled" && "تم إلغاء الطلب"}
                      </span>
                    </div>
                  </div>

                  {/* Push Notifications Management Center inside Status View */}
                  <div className="mb-6 rounded-2xl border p-4 bg-slate-900 border-indigo-950/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    {notificationPermission === "granted" ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                          <div>
                            <h4 className="text-[11px] font-black text-emerald-400">التنبيهات الفورية منشطة ومفعّة! 📱</h4>
                            <p className="text-[9px] text-slate-400 font-bold mt-0.5">ستصلك الإشعارات وأصوات التنبيه على هذا الجهاز حتى لو قمت بإغلاق الصفحة.</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-black text-emerald-500/80 bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded-lg shrink-0">نشط الآن</span>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-2.5">
                          <span className="text-xl animate-bounce mt-0.5">🔔</span>
                          <div>
                            <h4 className="text-[11px] font-black text-indigo-300">هل ترغب بتنشيط التنبيهات الفورية لحالة الطلب؟</h4>
                            <p className="text-[9px] text-slate-400 font-bold mt-0.5">لتصلك تحديثات الطلب ورسائل المحادثة مباشرة للشاشة حتى لو كان المتصفح مغلقاً.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={requestNotificationPermission}
                          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl transition-all shadow-lg shadow-indigo-600/25 active:scale-95 text-center shrink-0"
                        >
                          تفعيل التنبيهات الفورية
                        </button>
                      </div>
                    )}

                    {/* Feedback Messages for dynamic operations */}
                    {pushStatusMsg.type !== "idle" && (
                      <div className={cn(
                        "mt-3 p-2.5 rounded-xl border text-[10px] font-bold text-right flex items-center gap-2 animate-fadeIn",
                        pushStatusMsg.type === "loading" && "bg-blue-500/10 text-blue-400 border-blue-500/15",
                        pushStatusMsg.type === "success" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
                        pushStatusMsg.type === "error" && "bg-red-500/10 text-red-400 border-red-500/15"
                      )}>
                        {pushStatusMsg.type === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" />}
                        {pushStatusMsg.type === "success" && <span className="text-emerald-400 shrink-0">✓</span>}
                        {pushStatusMsg.type === "error" && <span className="text-red-400 shrink-0">⚠️</span>}
                        <span>{pushStatusMsg.text}</span>
                      </div>
                    )}
                  </div>

                  {/* Progressive Horizontal Loading Bar Indicator */}
                  <div className="relative w-full h-1.5 bg-slate-900 border border-slate-800/80 rounded-full mb-8 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${
                          liveOrder?.status === "cancelled" 
                            ? 100 
                            : (currentStatusIdx / ((isDeliveryOrder ? 5 : 4) - 1)) * 100
                        }%` 
                      }}
                      className={cn(
                        "absolute top-0 right-0 h-full rounded-full",
                        liveOrder?.status === "cancelled" 
                          ? "bg-red-600" 
                          : cn("bg-gradient-to-l via-indigo-500 to-blue-600", theme.gradientText)
                      )}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>

                  {liveOrder?.status === "cancelled" ? (
                    <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl text-center my-6">
                      <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-6 h-6 animate-pulse" />
                      </div>
                      <h3 className="text-sm font-black text-red-500 mb-2">تم إلغاء الطلب ❌</h3>
                      <p className="text-slate-400 text-[11px] font-semibold leading-relaxed">
                        {liveOrder?.cancelledBy === "customer" && "بناءً على طلبك، تم إلغاء طلبك."}
                        {liveOrder?.cancelledBy === "manager" && "تم رفض أو إلغاء الطلب من قبل الإدارة (المدير)."}
                        {liveOrder?.cancelledBy === "staff" && "تم إلغاء الطلب بواسطة الموظف المختص مسبقاً."}
                        {!liveOrder?.cancelledBy && "تم إلغاء هذا الطلب من النظام."}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Vertical Interactive Timeline Stepper */}
                      <div className="relative pr-6 border-r-2 border-slate-900 mr-4 space-y-6 my-6 pb-2">
                    {/* Glowing Connection Progress Overlay */}
                    <div className="absolute right-[-2px] top-0 bottom-0 w-[2px] origin-top bg-gradient-to-b from-emerald-500 via-teal-500 to-indigo-600 pointer-events-none" style={{ height: `${(currentStatusIdx / ((isDeliveryOrder ? 5 : 4) - 1)) * 100}%`, transition: 'height 0.8s ease-out' }} />

                    {(() => {
                      const getIconComponent = (iconName: string) => {
                        switch (iconName || "clock") {
                          case "clock": return Clock;
                          case "utensils": return Utensils;
                          case "bell": return Bell;
                          case "truck": return Truck;
                          case "check-circle-2":
                          case "check-circle":
                            return CheckCircle2;
                          case "store": return Store;
                          case "coffee": return Coffee;
                          case "pizza": return Pizza;
                          case "sparkles": return Sparkles;
                          case "map-pin": return MapPin;
                          case "shopping-bag": return ShoppingBag;
                          case "pill": return Pill;
                          case "croissant": return Croissant;
                          case "shopping-cart": return ShoppingCart;
                          case "shirt": return Shirt;
                          case "gift": return Gift;
                          case "flower": return Flower;
                          case "smartphone": return Smartphone;
                          case "apple": return Apple;
                          default: return Clock;
                        }
                      };

                      const steps = isDeliveryOrder ? [
                        {
                          key: "pending",
                          label: finalStepPendingLabel || "قيد الانتظار",
                          desc: finalStepPendingDesc || "بانتظار مراجعة وقبول الطلب من قِبل كادر المطعم.",
                          icon: getIconComponent(finalStepPendingIcon),
                        },
                        {
                          key: "accepted",
                          label: "تجهيز السلع والتسعير",
                          desc: liveOrder?.totalPrice === undefined 
                            ? "جاري احتساب وتجهيز الفاتورة بدقة من قبل الكادر 👨‍🍳" 
                            : "تم تجهيز وتحديد قيمة السلع بنجاح.",
                          icon: getIconComponent(finalStepAcceptedIcon),
                        },
                        {
                          key: "payment",
                          label: "سداد الفاتورة البنكية",
                          desc: liveOrder?.paymentStatus === "paid"
                            ? "✅ تم استلام وسداد الدفعة بنجاح! شكراً لك."
                            : liveOrder?.paymentStatus === "checking"
                            ? "⏳ جاري مراجعة وتدقيق الحوالة البنكية من قِبل المدير/المشرف."
                            : "⚠️ يرجى تحويل قيمة الفاتورة عبر الحساب البنكي بالأسفل لتلقي طلبك والبدء بالتوصيل 💳",
                          icon: Landmark,
                        },
                        {
                          key: "delivering",
                          label: finalStepDeliveringLabel || "جاري التوصيل",
                          desc: finalStepDeliveringDesc || "طلبك حالياً في طريقه إليك مع مندوب التوصيل المختص 🚚",
                          icon: getIconComponent(finalStepDeliveringIcon),
                        },
                        {
                          key: "completed",
                          label: finalStepCompletedLabel || "تم التسليم",
                          desc: finalStepCompletedDesc || "تم إكمال وتسليم الطلب بنجاح. بالعافية والهناء! ❤️",
                          icon: getIconComponent(finalStepCompletedIcon),
                        }
                      ] : [
                        {
                          key: "pending",
                          label: finalStepPendingLabel || "قيد الانتظار",
                          desc: finalStepPendingDesc || "بانتظار موافقة وقبول الطلب.",
                          icon: getIconComponent(finalStepPendingIcon),
                        },
                        {
                          key: "accepted",
                          label: finalStepAcceptedLabel || "جاري التحضير",
                          desc: finalStepAcceptedDesc || "جاري تجهيز وتحضير الوجبات بكل حب.",
                          icon: getIconComponent(finalStepAcceptedIcon),
                        },
                        {
                          key: "ready",
                          label: finalStepPickupReadyLabel || "جاهز للاستلام",
                          desc: finalStepPickupReadyDesc || "الطلب جاهز ولذيذ، تفضل بزيارتنا لاستلامه!",
                          icon: getIconComponent(finalStepPickupReadyIcon),
                        },
                        {
                          key: "completed",
                          label: finalStepPickupCompletedLabel || "تم الاستلام",
                          desc: finalStepPickupCompletedDesc || "تم تسليم الطلب بنجاح، نسعد بخدمتكم مجدداً!",
                          icon: getIconComponent(finalStepPickupCompletedIcon),
                        }
                      ];
                      const getThemeColorClass = (color: string) => {
                        switch (color) {
                          case "emerald": return { text: "text-emerald-400", border: "border-emerald-500", bg: "bg-emerald-500", badge: "bg-emerald-500/10 border-emerald-500/15 text-emerald-400", glow: "shadow-emerald-500/20" };
                          case "blue": return { text: "text-blue-400", border: "border-blue-500", bg: "bg-blue-500", badge: "bg-blue-500/10 border-blue-500/15 text-blue-400", glow: "shadow-blue-500/20" };
                          case "indigo": return { text: "text-indigo-400", border: "border-indigo-500", bg: "bg-indigo-500", badge: "bg-indigo-500/10 border-indigo-500/15 text-indigo-400", glow: "shadow-indigo-500/20" };
                          case "rose": return { text: "text-rose-400", border: "border-rose-500", bg: "bg-rose-500", badge: "bg-rose-500/10 border-rose-500/15 text-rose-400", glow: "shadow-rose-500/20" };
                          case "amber": return { text: "text-amber-400", border: "border-amber-500", bg: "bg-amber-500", badge: "bg-amber-500/10 border-amber-500/15 text-amber-400", glow: "shadow-amber-500/20" };
                          case "violet": return { text: "text-violet-400", border: "border-violet-500", bg: "bg-violet-500", badge: "bg-violet-500/10 border-violet-500/15 text-violet-400", glow: "shadow-violet-500/20" };
                          case "teal": return { text: "text-teal-400", border: "border-teal-500", bg: "bg-teal-500", badge: "bg-teal-500/10 border-teal-500/15 text-teal-400", glow: "shadow-teal-500/20" };
                          default: return { text: "text-emerald-400", border: "border-emerald-500", bg: "bg-emerald-500", badge: "bg-emerald-500/10 border-emerald-500/15 text-emerald-400", glow: "shadow-emerald-500/20" };
                        }
                      };
                      const cColor = getThemeColorClass(finalPrimaryColor);

                      return steps.map((step, idx) => {
                        const isPast = idx < currentStatusIdx;
                        const isCurrent = idx === currentStatusIdx;
                        const isFuture = idx > currentStatusIdx;
                        const StepIcon = step.icon;

                      return (
                        <div key={step.key} className="relative flex gap-4 text-right">
                          {/* Anchor Node circle on direct vertical guide bar */}
                          <div className="absolute right-[-33px] top-0.5 z-15">
                            {isCurrent ? (
                              <motion.div 
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center border-2 bg-slate-950",
                                  cColor.border,
                                  cColor.text,
                                  cColor.glow
                                )}
                              >
                                <div className={cn("w-1.5 h-1.5 rounded-full", cColor.bg)} />
                              </motion.div>
                            ) : (
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs",
                                isPast ? cn(cColor.bg, cColor.border, "text-white") : "bg-slate-950 border-slate-900 text-slate-800"
                              )}>
                                {isPast ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white animate-fade-in" />
                                ) : (
                                  <div className="w-1 h-1 rounded-full bg-slate-800" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Content Step Card Container with Visual feedback */}
                          <div className={cn(
                            "flex-1 transition-all duration-300 p-3.5 rounded-2xl border",
                            isCurrent ? "bg-slate-900/90 border-slate-800/80 shadow-lg shadow-slate-950/40" : "border-transparent opacity-50",
                            isPast ? "opacity-85" : ""
                          )}>
                            <div className="flex items-center gap-2.5 mb-1.5">
                              <span className={cn(
                                "p-1.5 rounded-xl border flex items-center justify-center shrink-0",
                                isPast ? cColor.badge : "",
                                isCurrent ? cColor.badge : "",
                                isFuture ? "bg-slate-950 border-slate-900 text-slate-700" : ""
                              )}>
                                <StepIcon className="w-3.5 h-3.5" />
                              </span>
                              <h4 className={cn(
                                "font-black text-xs transition-all",
                                isPast && cColor.text,
                                isCurrent && "text-white text-sm",
                                isFuture && "text-slate-500"
                              )}>
                                {step.label}
                              </h4>
                            </div>
                            
                            <p className={cn(
                              "text-[11px] font-semibold leading-relaxed pr-8",
                              isCurrent ? "text-slate-300" : "text-slate-500"
                            )}>
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  })()}
                  </div>
                    </>
                  )}

                  {/* Customer Order Details Details box footer with Edit capability */}
                  <div className="bg-slate-900/45 border border-slate-800/60 p-4.5 rounded-2rem mb-4 relative">
                    {liveOrder?.fulfillmentType && (
                      <div className="flex items-center gap-2 mb-3 bg-emerald-500/10 border border-emerald-500/15 p-2 px-3 rounded-xl text-emerald-400">
                        {liveOrder.fulfillmentType === "delivery" ? (
                          <>
                            <Truck className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] uppercase font-bold text-slate-400">طريقة الاستلام:</span>
                            <span className="text-xs font-black">طلب توصيل للموقع</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] uppercase font-bold text-slate-400">طريقة الاستلام:</span>
                            <span className="text-xs font-black">الاستلام بنفسي من الفرع</span>
                          </>
                        )}
                      </div>
                    )}
                    {liveOrder?.deliveryDate && (
                      <div className="flex items-center gap-2 mb-3 bg-indigo-500/10 border border-indigo-500/15 p-2 px-3 rounded-xl text-indigo-400 select-all font-sans">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[10px] uppercase font-bold text-slate-400">موعد الاستلام المطلوب:</span>
                        <span className="text-xs font-black font-mono">
                          {liveOrder.deliveryDate === "اليوم" 
                            ? "اليوم (تجهيز فوري)" 
                            : (() => {
                                try {
                                  return format(new Date(liveOrder.deliveryDate), "yyyy-MM-dd hh:mm a", { locale: ar });
                                } catch (e) {
                                  return liveOrder.deliveryDate;
                                }
                              })()}
                        </span>
                      </div>
                    )}

                    {liveOrder?.fulfillmentType === "delivery" && (
                      <div className="space-y-2 mb-3 p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl text-right">
                        {liveOrder.addressManual && (
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">العنوان المكتوب:</span>
                            <span className="text-xs text-slate-200 font-bold leading-relaxed">{liveOrder.addressManual}</span>
                          </div>
                        )}
                        {liveOrder.addressLocation && (
                          <div className="text-right pt-2 border-t border-slate-800/20 mt-2 flex flex-col sm:flex-row-reverse sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">الموقع الجغرافي (GPS):</span>
                              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px] inline-block text-left" dir="ltr">{liveOrder.addressLocation}</span>
                            </div>
                            <a 
                              href={liveOrder.addressLocation} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-center gap-1 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/15 w-full sm:w-auto"
                            >
                              📍 فتح الموقع بالخريطة
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-2 border-b border-slate-800/30 pb-2">
                      <span className="text-[10px] text-slate-500 font-bold">تفاصيل أصناف وجباتك</span>
                      {liveOrder?.status === "pending" && !isEditingItems && (
                        <button
                          onClick={() => {
                            setEditItemsValue(liveOrder?.items || "");
                            setIsEditingItems(true);
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-all bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/15 hover:border-amber-400/30 active:scale-95"
                        >
                          <Pencil className="w-3 h-3 text-amber-400" />
                          <span>تعديل الطلب</span>
                        </button>
                      )}
                    </div>

                    {isEditingItems ? (
                      <div className="space-y-3 mt-2">
                        <textarea
                          rows={3}
                          value={editItemsValue}
                          onChange={(e) => setEditItemsValue(e.target.value)}
                          className="w-full text-xs p-3 rounded-xl border border-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-650 resize-none"
                          placeholder="اكتب هنا التفاصيل المعدلة..."
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            disabled={savingEdit}
                            onClick={handleSaveEdit}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl transition-all text-xs active:scale-95 flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                          >
                            {savingEdit ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <span>حفظ التعديلات</span>
                            )}
                          </button>
                          <button
                            onClick={() => setIsEditingItems(false)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-350 font-bold px-4 py-2 rounded-xl border border-slate-700 transition-all active:scale-95 text-xs"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-slate-300 whitespace-pre-line leading-relaxed">{liveOrder?.items}</p>
                    )}
                  </div>

                  {/* Inform & Proceed Dynamic Cost Invoice */}
                  {liveOrder?.totalPrice !== undefined && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mt-4 text-right animate-fadeIn" dir="rtl">
                      <div className="flex items-center gap-1.5 mb-3 border-b border-slate-800/60 pb-2.5">
                        <span className="p-1 px-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs">💸</span>
                        <h3 className="text-xs font-black text-white">تفاصيل كشف الحساب والأسعار الفورية</h3>
                      </div>
                      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-2.5 text-xs font-semibold font-mono" dir="rtl">
                        <div className="flex justify-between text-slate-300">
                          <span className="font-bold">قيمة السلع والقطع:</span>
                          <span className="text-slate-100 font-bold">{liveOrder.totalPrice} {getCurrencyLabel(currency)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="font-bold">رسوم التوصيل والخدمة:</span>
                          <span className="text-slate-100 font-bold">{liveOrder.deliveryPrice || 0} {getCurrencyLabel(currency)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-850 pt-2.5 font-black">
                          <span className="text-indigo-400 font-black">المجموع الإجمالي للطلب:</span>
                          <span className="text-indigo-400 text-sm font-black">{(liveOrder.totalPrice || 0) + (liveOrder.deliveryPrice || 0)} {getCurrencyLabel(currency)}</span>
                        </div>
                        {liveOrder.pricingNotes && (
                          <div className="text-[10px] text-slate-450 border-t border-slate-850 pt-2.5 font-bold leading-normal">
                            <span className="text-slate-400 block font-black mb-0.5/50">توضيح بخصوص الأسعار:</span>
                            {liveOrder.pricingNotes}
                          </div>
                        )}
                      </div>
                      <div className="mt-3.5 text-center flex items-center justify-center gap-1.5 bg-indigo-500/5 p-2.5 border border-indigo-500/10 rounded-xl text-indigo-400 text-[10px] font-bold leading-relaxed">
                        <span>💡 جاري متابعة تحضير طلبك مباشرة بالتنسيق مع الكادر وسنبلغك بأي جديد فوراً! 🚀</span>
                      </div>
                    </div>
                  )}

                  {/* Bank Payment Stage Block - Shown for delivery orders with price determined only during the payment stage */}
                  {liveOrder?.fulfillmentType === "delivery" && liveOrder?.totalPrice !== undefined && currentStatusIdx === 2 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mt-4 text-right animate-fadeIn" dir="rtl">
                      <div className="flex items-center gap-1.5 mb-3 border-b border-slate-800/60 pb-2.5">
                        <span className="p-1 px-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs text-center">💳</span>
                        <h3 className="text-xs font-black text-white">مرحلة سداد الطلب البنكية</h3>
                      </div>
                      
                      {bankAccounts.length === 0 ? (
                        <div className="bg-slate-950/50 border border-slate-850 p-6 rounded-2xl text-center text-slate-500 text-xs font-bold leading-relaxed">
                          ⚠️ نعتذر، لا تتوفر حسابات بنكية مفعلة للدفع حالياً من قبل الإدارة. يرجى التواصل مع الدعم أو التنسيق للدفع عند الاستلام.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3.5 rounded-2xl text-[11px] font-black leading-relaxed mb-3 flex items-start gap-2">
                            <span className="text-sm shrink-0">⚠️</span>
                            <span><b>تنبيه هام ومستند وجوبي:</b> يتوجب عليك سداد قيمة الفاتورة وإرسال تأكيد التحويل الآن، حتى يقوم الكادر باعتماده وتمرير الطلب للتوصيل الفوري.</span>
                          </div>

                          <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                            لتسريع تسليم طلبك، يرجى اختيار أحد الحسابات المعتمدة التالية للتحويل، ثم الضغط على <b>"تم الدفع"</b> لتأكيد المعاملة:
                          </p>

                          {/* Bank Accounts Dropdown Accent Accordion List */}
                          <div className="space-y-2">
                            {bankAccounts.map((account) => {
                              const isExpanded = expandedBankAccountId === account.id;
                              return (
                                <div key={account.id} className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden transition-all duration-300">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedBankAccountId(isExpanded ? null : account.id)}
                                    className="w-full flex items-center justify-between p-4 text-right hover:bg-slate-900/60 transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="p-1 rounded-lg bg-indigo-500/10 border border-indigo-505/10 text-xs">🏛️</span>
                                      <span className="text-xs font-black text-slate-200">{account.bankName}</span>
                                    </div>
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-slate-500" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-slate-500 animate-pulse" />
                                    )}
                                  </button>
                                  
                                  <AnimatePresence initial={false}>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="border-t border-slate-900 bg-slate-900/40 p-4 pt-3.5 space-y-2.5 text-right text-xs font-sans"
                                      >
                                        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                                          <span className="text-slate-500 font-bold">اسم صاحب الحساب</span>
                                          <span className="text-slate-200 font-black">{account.accountHolder}</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4">
                                          <span className="text-slate-500 font-bold shrink-0">رقم الحساب او IBAN</span>
                                          <div className="flex items-center gap-2 text-left">
                                            <button
                                              type="button"
                                              onClick={() => handleCopyAccountNumber(account.id, account.accountNumber)}
                                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-all flex items-center justify-center border border-slate-700/60 shrink-0"
                                              title="نسخ رقم الحساب"
                                            >
                                              {copiedAccountId === account.id ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-400 animate-scaleIn" />
                                              ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                              )}
                                            </button>
                                            <span className="text-emerald-400 font-mono font-black select-all break-all">{account.accountNumber}</span>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>

                           {/* Action Buttons / Loader */}
                          <div className="mt-5 pt-4 border-t border-slate-850">
                            {liveOrder.paymentStatus === "checking" ? (
                              <div className="space-y-4">
                                <div className="flex flex-col items-center justify-center p-5 bg-amber-500/10 border border-amber-550/20 rounded-2xl text-center">
                                  <Loader2 className="w-7 h-7 text-amber-500 animate-spin mb-2.5" />
                                  <span className="text-sm font-black text-amber-400">جاري التشييك ومراجعة الدفع... ⏳</span>
                                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">بمجرد مطابقة الإيداع أو استلام التنبيه البنكي سنقوم باعتماد الفاتورة وتجهيز التوصيل فوراً.</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleCancelPayment}
                                  disabled={isUpdatingPayment}
                                  className="w-full bg-slate-850 hover:bg-slate-800 text-slate-350 font-black py-3 rounded-2xl text-xs transition-all border border-slate-800"
                                >
                                  {isUpdatingPayment ? "جاري الإلغاء..." : "الغاء العملية"}
                                </button>
                              </div>
                            ) : liveOrder.paymentStatus === "paid" ? (
                              <div className="flex flex-col items-center justify-center p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                                <CheckCircle2 className="w-7 h-7 text-emerald-500 mb-2.5" />
                                <span className="text-sm font-black text-emerald-400">تم الدفع واعتماده بنجاح! 💚</span>
                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">تم استلام الدفعة ومطابقة الحوالة. طلبك سيسلم لمندوب التوصيل فوراً.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-3.5">
                                <button
                                  type="button"
                                  onClick={() => handleConfirmPayment()}
                                  disabled={isUpdatingPayment}
                                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                                >
                                  {isUpdatingPayment ? "جاري الإرسال..." : "تم الدفع وتأكيد الحوالة"}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelPayment}
                                  disabled={isUpdatingPayment}
                                  className="bg-slate-850 hover:bg-slate-800 disabled:opacity-50 text-slate-350 font-black py-3 px-4 rounded-xl text-xs transition-all border border-slate-800"
                                >
                                  الغاء العملية
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Live Chat or WhatsApp support based on subscription tier */}
                  {subscriptionTier === "tier1" ? (
                    merchantWhatsApp && (
                      <div className="bg-emerald-950/25 border border-emerald-500/15 rounded-3xl p-5 mt-5 text-right flex flex-col gap-3 animate-fadeIn" dir="rtl">
                        <div className="flex items-center gap-1.5 border-b border-emerald-500/10 pb-2 mb-1">
                          <span className="p-1 px-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">💬</span>
                          <span className="text-xs font-black text-white">الدعم التجاري المباشر (Direct Support)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                          لتعديل الطلب، الاستفسار عن جهوزية الحوالة، أو إرسال تفاصيل التوصيل مباشرة، يرجى التواصل معنا فوراً عبر واتساب:
                        </p>
                        <a
                          href={`https://wa.me/${merchantWhatsApp.replace(/[\s+()-]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 text-xs cursor-pointer shadow-lg shadow-emerald-600/10"
                        >
                          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.51 5.284 3.509 8.486-.002 6.643-5.338 11.982-11.95 11.982-1.996-.001-3.959-.5-5.717-1.45L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.811 1.452 5.4 0 9.794-4.402 9.796-9.809a9.756 9.756 0 00-2.875-6.93 9.722 9.722 0 00-6.92-2.871C6.069 4.004 2.1 7.973 2.1 13.376c0 1.63.435 3.22 1.262 4.636l-.3 1.096c1.1.2 2.2-.1 3.25-.6l-.33-.2z"/>
                          </svg>
                          <span>تواصل مباشر مع الإدارة عبر واتساب</span>
                        </a>
                      </div>
                    )
                  ) : (
                    <>
                      {/* Live Chat with the Merchant Team - Hidden until Staff initiates for anti-spam/anti-disturbance */}
                      {liveOrder?.chat?.some((msg: any) => msg.sender === "staff") ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mt-5 text-right flex flex-col justify-between animate-fadeIn" dir="rtl">
                          <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2.5">
                            <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                              <span className="p-1 px-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">💬</span>
                              <span>دردشة مباشرة مع كادر العمل</span>
                              {/* Glow dot if last message is from staff */}
                              {liveOrder?.chat && liveOrder.chat.length > 0 && liveOrder.chat[liveOrder.chat.length - 1]?.sender === "staff" && (
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                              )}
                            </h3>
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Order Chat Live</span>
                          </div>

                          {/* Request notification authorization helper inside chat */}
                          {notificationPermission !== "granted" && (
                            <div className="mb-3 bg-indigo-950/40 border border-indigo-900/40 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
                              <div className="flex items-center gap-2">
                                <span className="text-lg animate-bounce">🔔</span>
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black text-indigo-300">هل ترغب بتنشيط التنبيهات الفورية؟</span>
                                  <span className="text-[9px] text-slate-400 font-bold">لتصلك إشعارات وتنبيهات الرسائل أثناء النوم أو قفل الشاشة</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={requestNotificationPermission}
                                className="w-full sm:w-auto px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-505 text-white text-[10px] font-black rounded-lg transition-all shadow-md shadow-indigo-600/10"
                              >
                                تحديث إذن التنبيهات
                              </button>
                            </div>
                          )}

                          {/* Chat message bubbles list */}
                          <div className="space-y-2.5 max-h-[190px] overflow-y-auto mb-3.5 bg-slate-950 rounded-2xl p-3.5 border border-slate-900/80 custom-scrollbar flex flex-col">
                            {(!liveOrder?.chat || liveOrder.chat.length === 0) ? (
                              <div className="text-center py-5 text-slate-600 text-[11px] font-bold my-auto leading-relaxed">
                                هل ترغب بتعديل أي شيء أو الاستفسار؟ تواصل مع الكادر مباشرة من هنا!
                              </div>
                            ) : (
                              liveOrder.chat.map((msg: any, idx: number) => {
                                const isCustomer = msg.sender === "customer";
                                const isSystem = msg.sender === "system";
                                return (
                                  <div
                                    key={idx}
                                    className={cn(
                                      "flex flex-col text-xs",
                                      isSystem ? "items-center" : isCustomer ? "items-start" : "items-end"
                                    )}
                                  >
                                    {isSystem ? (
                                      <span className="bg-slate-900/60 text-slate-500 text-[9px] px-2.5 py-0.5 rounded-full border border-slate-855 font-semibold my-1">
                                        {msg.text}
                                      </span>
                                    ) : (
                                      <div className="max-w-[85%]">
                                        <span className="text-[9px] text-slate-500 block mb-0.5 px-1 font-semibold leading-none text-right">
                                          {isCustomer ? "أنا" : msg.senderName || "فريق العمل"}
                                        </span>
                                        <p className={cn(
                                          "px-3 py-1.5 rounded-2xl break-words leading-relaxed text-right font-medium text-[11px]",
                                          isCustomer 
                                            ? "bg-indigo-600 text-white rounded-tr-none" 
                                            : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                                        )}>
                                          {msg.text}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Customer send form */}
                          {liveOrder?.chatMuted === true || liveOrder?.status === "completed" || liveOrder?.status === "cancelled" ? (
                            <div className="bg-slate-950/80 border border-slate-900 border-dashed rounded-xl p-3 text-center text-[10px] font-bold text-slate-450 flex items-center gap-2 justify-center" dir="rtl">
                              <span>🔒</span>
                              {liveOrder?.chatMuted === true ? (
                                <span>الدردشة مغلقة من قبل الإدارة والموظفين.</span>
                              ) : (
                                <span>تم إغلاق الدردشة تلقائياً لإتمام أو إلغاء الطلب.</span>
                              )}
                            </div>
                          ) : (
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const input = form.elements.namedItem("customerMsgText") as HTMLInputElement;
                                const text = input.value.trim();
                                if (!text) return;

                                try {
                                  const orderRef = doc(db, "organizations", orgId, "orders", liveOrder.id);
                                  const newMsg = {
                                    sender: "customer",
                                    senderName: liveOrder.customerName || "الزبون",
                                    text,
                                    createdAt: new Date().toISOString()
                                  };
                                  await updateDoc(orderRef, {
                                    chat: [...(liveOrder.chat || []), newMsg]
                                  });
                                  fetch("/api/notify-new-chat", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      orgId,
                                      orderId: liveOrder.id,
                                      sender: "customer",
                                      senderName: liveOrder.customerName || "الزبون",
                                      text,
                                      restaurantName
                                    })
                                  }).catch(err => console.error("Error triggering customer chat API:", err));
                                  input.value = "";
                                } catch (err) {
                                  console.error("Error sending client message:", err);
                                }
                              }}
                              className="flex gap-1.5"
                            >
                              <input
                                type="text"
                                name="customerMsgText"
                                required
                                placeholder="اكتب استفسارك أو تعديلك هنا للتحدث مباشرة..."
                                className="flex-1 bg-slate-950 border border-slate-855 focus:border-indigo-505 rounded-xl px-3.5 py-2 text-xs outline-none text-white font-semibold transition-all placeholder-slate-650"
                                autoComplete="off"
                              />
                              <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-indigo-600/15 flex items-center justify-center gap-1 active:scale-95 shrink-0"
                              >
                                <Send className="w-3.5 h-3.5 rotate-180" />
                                <span>إرسال</span>
                              </button>
                            </form>
                          )}
                        </div>
                      ) : (
                        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 mt-5 text-right flex flex-col gap-3 animate-fadeIn" dir="rtl">
                          <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] justify-center">
                            <span>🔒 الدردشة المباشرة مع الكادر مقفلة أو لم تبدأ بعد.</span>
                          </div>
                          
                          {liveOrder?.status !== "completed" && liveOrder?.status !== "cancelled" && (
                            liveOrder?.chatRequested ? (
                              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-2xl text-indigo-400 text-xs font-black flex items-center gap-2 justify-center animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shrink-0"></span>
                                <span>⏳ تم إرسال طلب فتح الدردشة بنجاح! سيقوم المندوب بالانضمام للحديث معك قريباً.</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!db || !orgId || !liveOrder?.id) return;
                                  try {
                                    const orderRef = doc(db, "organizations", orgId, "orders", liveOrder.id);
                                    await updateDoc(orderRef, {
                                      chatRequested: true,
                                      chatRequestedAt: new Date().toISOString()
                                    });
                                  } catch (e) {
                                    console.error("Error requesting chat:", e);
                                  }
                                }}
                                className="w-full bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/25 text-indigo-400 font-extrabold py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 text-xs cursor-pointer"
                              >
                                <span>💬 طلب فتح محادثة (لأي استفسار أو اعتراض على السعر)</span>
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </>
                  )}

                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-4 border-t border-slate-900">
                  {liveOrder?.status === "pending" && (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 order-first active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5 animate-pulse" />
                      إلغاء الطلب (Cancel Order)
                    </button>
                  )}

                  <button 
                    onClick={() => {
                      setTrackingOrderId(null);
                      setLiveOrder(null);
                      setStatus("idle");
                    }}
                    className={cn(
                      "text-slate-500 hover:text-indigo-400 font-bold text-xs transition-all flex items-center gap-1.5 justify-center group py-2",
                      liveOrder?.status === "pending" ? "w-full sm:w-auto mr-auto" : "w-full"
                    )}
                  >
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    إرسال طلب جديد مضاف
                  </button>
                </div>

                {/* Confirm Cancel Modal */}
                <AnimatePresence>
                  {showCancelConfirm && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 pb-20" dir="rtl">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-6 text-center shadow-2xl relative overflow-hidden"
                      >
                        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                          <Trash2 className="w-6 h-6 animate-bounce" />
                        </div>
                        
                        <h3 className="text-lg font-black text-white mb-2 leading-tight">هل تريد إلغاء الطلب؟</h3>
                        <p className="text-slate-400 text-xs font-semibold mb-6">Are you sure you want to cancel this order? This action cannot be undone.</p>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            disabled={cancelling}
                            onClick={handleCancelOrder}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-95 text-xs flex items-center justify-center gap-1.5"
                          >
                            {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "نعم، إلغاء الطلب"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCancelConfirm(false)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl border border-slate-700 transition-all active:scale-95 text-xs"
                          >
                            تراجع
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.form
                key="order-form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onSubmit={handleSubmit}
                className="space-y-6 pt-2 font-sans"
                dir="rtl"
              >
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-normal font-bold text-slate-500 flex items-center gap-2">
                    <User className={cn("w-3 h-3", theme.textAccent)} /> اسمك الثلاثي/الكريم
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="اكتب اسمك الثلاثي هنا للتعرف الفوري على طلبك..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border border-slate-800 focus:ring-2 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-600 text-right font-bold text-xs",
                      theme.focusRing
                    )}
                  />
                </div>

                {/* Phone Input with Country Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-normal font-bold text-slate-500 flex items-center gap-2">
                    <Phone className={cn("w-3 h-3", theme.textAccent)} /> رقم الجوال/واتساب (بدون الصفر بالبداية للتواصل الفوري)
                  </label>
                  <div className="flex gap-2" dir="ltr">
                    <select
                      value={countryPrefix}
                      onChange={(e) => setCountryPrefix(e.target.value)}
                      className="px-3 py-3 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="966">🇸🇦 +966</option>
                      <option value="967">🇾🇪 +967</option>
                    </select>
                    <input
                      required
                      type="tel"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      placeholder="7xxxxxxxx أو 5xxxxxxxx"
                      value={rawPhone}
                      onChange={(e) => setRawPhone(e.target.value.replace(/\D/g, ""))}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-xl border border-slate-800 focus:ring-2 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-600 text-left font-mono font-bold text-xs tracking-wider",
                        theme.focusRing
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-normal font-bold text-slate-500 flex items-center gap-2">
                      <Truck className={cn("w-3 h-3", theme.textAccent)} /> طريقة استلام الطلب
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFulfillmentType("pickup")}
                        className={cn(
                          "py-3.5 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col justify-center items-center gap-1.5 active:scale-95",
                          fulfillmentType === "pickup"
                            ? theme.tabActive
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900"
                        )}
                      >
                        <MapPin className={cn("w-4 h-4", theme.textAccent)} />
                        <span>الاستلام بنفسي من الفرع</span>
                      </button>
                      <button
                        type="button"
                        disabled={!deliveryEnabled}
                        onClick={() => {
                          if (deliveryEnabled) {
                            setFulfillmentType("delivery");
                          }
                        }}
                        className={cn(
                          "py-3.5 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col justify-center items-center gap-1.5 relative overflow-hidden active:scale-95 disabled:scale-100",
                          !deliveryEnabled ? "opacity-35 cursor-not-allowed bg-slate-950/40 border-slate-900 text-slate-600" : (
                            fulfillmentType === "delivery"
                              ? theme.tabActive
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900"
                          )
                        )}
                        title={!deliveryEnabled ? "خدمة التوصيل غير متوفرة حالياً" : "طلب توصيل للموقع"}
                      >
                        <Truck className={cn("w-4 h-4", theme.textAccent)} />
                        <span>طلب توصيل للموقع</span>
                        {!deliveryEnabled && (
                          <span className="absolute top-1 right-1 text-[8px] font-black bg-red-500/15 border border-red-500/20 px-1.5 py-0.5 rounded-md text-red-500 scale-90">مغلق</span>
                        )}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {fulfillmentType === "delivery" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-normal font-bold text-slate-500 flex items-center gap-2">
                            <MapPin className={cn("w-3 h-3", theme.textAccent)} /> العنوان اليدوي بالكامل (مثال: الحي، الشارع، رقم المنزل)
                          </label>
                          <textarea
                            rows={2}
                            value={addressManual}
                            onChange={(e) => setAddressManual(e.target.value)}
                            placeholder="اكتب عنوانك بالتفصيل هنا لمساعدة المندوب..."
                            className={cn(
                              "w-full px-4 py-3 rounded-xl border border-slate-800 focus:ring-2 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-600 text-right font-bold text-xs leading-relaxed",
                              theme.focusRing
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-normal font-bold text-slate-500 flex items-center gap-2 font-black">
                            📍 تحديد موقعك الجغرافي بالرابط أو الـ GPS
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={addressLocation}
                              onChange={(e) => setAddressLocation(e.target.value)}
                              placeholder="ضع رابط خرائط جوجل أو حدد تلقائياً بالزر"
                              className={cn(
                                "flex-1 px-4 py-3 rounded-xl border border-slate-800 focus:ring-2 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-600 text-right font-bold text-xs font-mono tracking-normal",
                                theme.focusRing
                              )}
                            />
                            <button
                              type="button"
                              onClick={handleGetLocation}
                              disabled={isLocating}
                              className={cn(
                                "px-3.5 rounded-xl border border-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1 shrink-0 bg-slate-950 text-slate-400 hover:bg-slate-900 active:scale-95 disabled:opacity-50",
                                isLocating && "animate-pulse"
                              )}
                            >
                              {isLocating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "تحديد موقعي 📍"
                              )}
                            </button>
                          </div>
                          
                          {locationStatus === "success" && (
                            <p className="text-[10px] text-emerald-400 font-bold text-right">✓ تم التقاط موقعك الحالي بنجاح ورسم الرابط!</p>
                          )}
                          {locationStatus === "error" && (
                            <p className="text-[10px] text-red-400 font-bold text-right flex items-center gap-1 justify-end">
                              <XCircle className="w-3 h-3" /> تعذر التقاط الموقع الجغرافي. يرجى لصق الرابط يدوياً لو رغبت.
                            </p>
                          )}
                          {locationStatus === "denied" && (
                            <p className="text-[10px] text-amber-400 font-bold text-right flex items-center gap-1 justify-end">
                              <AlertCircle className="w-3 h-3" /> يرجى السماح لمتصفحك بالوصول للـ GPS لتحديد موقعك تلقائياً.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-normal font-bold text-slate-500 flex items-center gap-2">
                      <Clock className={cn("w-3 h-3", theme.textAccent)} /> وقت جاهزية الطلب
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDeliveryOption("today")}
                        className={cn(
                          "py-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col justify-center items-center gap-1 active:scale-95",
                          deliveryOption === "today"
                            ? theme.tabActive
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900"
                        )}
                      >
                        <span>تجهيز فوري (الآن)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryOption("custom")}
                        className={cn(
                          "py-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col justify-center items-center gap-1 active:scale-95",
                          deliveryOption === "custom"
                            ? theme.tabActive
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900"
                        )}
                      >
                        <span>تحديد وقت لاحق</span>
                      </button>
                    </div>

                    {deliveryOption === "custom" && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-right pointer-events-auto"
                      >
                        <input
                          required={deliveryOption === "custom"}
                          type="datetime-local"
                          value={customDeliveryDate}
                          onChange={(e) => setCustomDeliveryDate(e.target.value)}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl border border-slate-800 focus:ring-2 focus:border-transparent outline-none transition-all bg-slate-950 text-white text-center font-bold text-xs",
                            theme.focusRing
                          )}
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-normal font-bold text-slate-500 flex items-center gap-2">
                      <ShoppingBag className={cn("w-3 h-3", theme.textAccent)} /> تفاصيل الطلب والأصناف
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={items}
                      onChange={(e) => setItems(e.target.value)}
                      placeholder="اكتب أصناف طلبك هنا..."
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border border-slate-800 focus:ring-2 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-600 resize-none font-bold text-xs leading-relaxed",
                        theme.focusRing
                      )}
                    />
                  </div>
                </div>

                  {status === "error" && (
                    <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed animate-fadeIn" dir="rtl">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMessage || "عذراً، حدث خطأ في إرسال الطلب."}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className={cn(
                      "w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-xl select-none",
                      status === "sending" 
                        ? "bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800/40" 
                        : "bg-indigo-600 hover:bg-indigo-550 text-white shadow-[0_10px_25px_-5px_rgba(99,102,241,0.30)] border border-indigo-500/30"
                    )}
                  >
                    {status === "sending" ? "جاري الإرسال والمعالجة..." : "إرسال وتأكيد الطلب الفوري"}
                    <Send className="w-4 h-4 -rotate-45" />
                  </button>
              </motion.form>
            )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      <div className="mt-8 flex flex-col items-center gap-4 relative z-10">
        <button 
          onClick={() => {
            const url = new URL(window.location.href);
            url.searchParams.set('view', 'admin');
            window.location.href = url.toString();
          }}
          className="text-slate-705 hover:text-slate-500 text-[10px] font-black uppercase tracking-wider transition-colors bg-slate-900/40 border border-slate-850 px-4 py-1.5 rounded-full backdrop-blur-md"
        >
          🔐 دخول إدارة الكادر (Owner Access)
        </button>
      </div>
      <Footer />
    </div>
  );
}
