import React, { useEffect, useState, useRef } from "react";
import Footer from "./Footer";
import { auth, db } from "../lib/firebase";
import { subscribeUserToPush } from "../lib/pushSubscription";
import useSound from "use-sound";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  deleteDoc,
  setDoc,
  doc, 
  getDoc,
  serverTimestamp,
  Timestamp,
  limit
} from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  BarChart3, 
  Plus, 
  Trash2, 
  Edit,
  Pencil,
  CheckCircle, 
  Clock, 
  TrendingUp,
  ShieldCheck,
  Search,
  UserPlus,
  Truck,
  MapPin,
  Copy,
  ExternalLink,
  Share2,
  Check,
  Bell,
  LayoutDashboard,
  Link as LinkIcon,
  LogOut,
  Menu,
  X,
  History,
  Activity,
  AlertCircle,
  Settings,
  Lock,
  User,
  Phone,
  Store,
  Coffee,
  Pizza,
  Sparkles,
  ShoppingBag,
  Utensils,
  Paintbrush,
  MessageSquare,
  Upload,
  Image as ImageIcon,
  Pill,
  Croissant,
  ShoppingCart,
  Shirt,
  Gift,
  Flower,
  Smartphone,
  Apple,
  Coins,
  FileText,
  Loader2,
  FileSpreadsheet,
  Landmark
} from "lucide-react";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { ItemTransferAssistant } from "./ItemTransferAssistant";
const defaultLogo = "/logo.png";

interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  createdAt: any;
}

interface Staff {
  id: string;
  name: string;
  passcode: string;
  role: string;
  isActive: boolean;
  createdAt: Timestamp;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  items: string;
  status: string;
  acceptedBy?: string;
  preparedBy?: string;
  dispatchedBy?: string;
  deliveredBy?: string;
  staffName?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deliveryDate?: string;
  fulfillmentType?: string;
  chat?: any[];
  totalPrice?: number;
  deliveryPrice?: number;
  pricingNotes?: string;
  chatMuted?: boolean;
}

type TabType = "live" | "history" | "stats" | "staff" | "links" | "settings" | "customer_settings" | "bank_accounts";

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

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
  sidebarActiveBg: string;
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
    systemOnlineBullet: "bg-emerald-400",
    sidebarActiveBg: "bg-emerald-600 shadow-lg shadow-emerald-500/20 text-white"
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
    systemOnlineBullet: "bg-blue-400",
    sidebarActiveBg: "bg-blue-600 shadow-lg shadow-blue-500/20 text-white"
  },
  indigo: {
    bgGlow: "bg-indigo-500/20",
    heroBg: "bg-indigo-600",
    heroSkewBg: "bg-indigo-700/20",
    iconBg: "bg-white/20",
    textAccent: "text-indigo-500",
    focusRing: "focus:ring-indigo-500",
    badgeBg: "bg-indigo-500/10 border-indigo-505/10 text-indigo-400",
    buttonBg: "bg-indigo-505 hover:bg-indigo-400 text-slate-950",
    tabActive: "bg-indigo-500/10 border-indigo-505 text-indigo-400 shadow-lg shadow-indigo-500/5",
    gradientText: "from-indigo-500",
    timelinePointActive: "border-indigo-505 text-indigo-400",
    systemOnlineBullet: "bg-indigo-400",
    sidebarActiveBg: "bg-indigo-600 shadow-lg shadow-indigo-500/20 text-white"
  },
  rose: {
    bgGlow: "bg-rose-500/20",
    heroBg: "bg-rose-600",
    heroSkewBg: "bg-rose-700/20",
    iconBg: "bg-white/20",
    textAccent: "text-rose-505",
    focusRing: "focus:ring-rose-500",
    badgeBg: "bg-rose-500/10 border-rose-500/10 text-rose-400",
    buttonBg: "bg-rose-505 hover:bg-rose-400 text-slate-950",
    tabActive: "bg-rose-500/10 border-rose-505 text-rose-400 shadow-lg shadow-rose-500/5",
    gradientText: "from-rose-500",
    timelinePointActive: "border-rose-500 text-rose-400",
    systemOnlineBullet: "bg-rose-400",
    sidebarActiveBg: "bg-rose-600 shadow-lg shadow-rose-500/20 text-white"
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
    systemOnlineBullet: "bg-amber-400",
    sidebarActiveBg: "bg-amber-600 shadow-lg shadow-amber-500/20 text-slate-950"
  },
  violet: {
    bgGlow: "bg-violet-500/20",
    heroBg: "bg-violet-600",
    heroSkewBg: "bg-violet-700/20",
    iconBg: "bg-white/20",
    textAccent: "text-violet-500",
    focusRing: "focus:ring-violet-500",
    badgeBg: "bg-violet-500/10 border-violet-505/10 text-violet-400",
    buttonBg: "bg-violet-505 hover:bg-violet-400 text-slate-950",
    tabActive: "bg-violet-500/10 border-violet-505 text-violet-400 shadow-lg shadow-violet-505/5",
    gradientText: "from-violet-500",
    timelinePointActive: "border-violet-500 text-violet-400",
    systemOnlineBullet: "bg-violet-400",
    sidebarActiveBg: "bg-violet-600 shadow-lg shadow-violet-500/20 text-white"
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
    systemOnlineBullet: "bg-teal-400",
    sidebarActiveBg: "bg-teal-600 shadow-lg shadow-teal-500/20 text-slate-950"
  }
};

export default function AdminDashboard({ orgId, user }: { orgId: string, user: any }) {
  const [activeTab, setActiveTab] = useState<TabType>("live");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedChatOrderId, setExpandedChatOrderId] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [newBankAccount, setNewBankAccount] = useState({ bankName: "", accountHolder: "", accountNumber: "" });
  const [editingBankAccount, setEditingBankAccount] = useState<BankAccount | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [newStaff, setNewStaff] = useState({ name: "", role: "موظف", passcode: "" });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState("مطعم البركة");
  const [merchantWhatsApp, setMerchantWhatsApp] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("emerald");
  const [welcomeMessage, setWelcomeMessage] = useState("أهلاً بك في نظام الطلبات المتطور. اطلب الآن وتابع حالة طلبك مباشرة.");
  const [chosenIcon, setChosenIcon] = useState("shopping-bag");

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

  // Custom customer form labels customizable by merchant
  const [fieldNameLabel, setFieldNameLabel] = useState("اسم العميل الكرام");
  const [fieldPhoneLabel, setFieldPhoneLabel] = useState("رقم الجوال النشط");
  const [fieldItemsLabel, setFieldItemsLabel] = useState("تفاصيل الطلبات والكميات");

  // Local helper states for the Live Smartphone Customizer
  const [activePreviewTab, setActivePreviewTab] = useState<"welcome" | "order_form" | "tracking_delivery" | "tracking_pickup">("welcome");
  const [simCustomerName, setSimCustomerName] = useState("عبدالرحمن الحربي");
  const [simCustomerPhone, setSimCustomerPhone] = useState("0551234567");
  const [simFulfillmentType, setSimFulfillmentType] = useState<"pickup" | "delivery">("pickup");
  const [simDeliveryOption, setSimDeliveryOption] = useState<"today" | "custom">("today");
  const [simItemsDetails, setSimItemsDetails] = useState("٢ برجر دبل بيف تشيز مع الجبنة الذائبة، ١ بطاطس كبيرة متبلة");
  const [iconSelectorTarget, setIconSelectorTarget] = useState<string | null>(null);
  const [orgUsername, setOrgUsername] = useState("");
  const [orgPassword, setOrgPassword] = useState("");
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [currency, setCurrency] = useState<string>("ريال يمني");

  const getCurrencyLabel = (cur: string) => {
    if (cur === "ريال سعودي") return "ر.س";
    if (cur === "دولار") return "دولار";
    return "ر.ي";
  };

  const [savingBranding, setSavingBranding] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [autoCleanupEnabled, setAutoCleanupEnabled] = useState(false);
  const [lastAutoCleanup, setLastAutoCleanup] = useState<any>(null);
  const [savingCleanup, setSavingCleanup] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [showClearCompletedConfirm, setShowClearCompletedConfirm] = useState(false);
  const [clearingInProgress, setClearingInProgress] = useState(false);
  const [singleOrderToDelete, setSingleOrderToDelete] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  // Inform & Proceed pricing state
  const [pricingOrder, setPricingOrder] = useState<Order | null>(null);
  const [pricingItemsPrice, setPricingItemsPrice] = useState<string>("");
  const [pricingDeliveryPrice, setPricingDeliveryPrice] = useState<string>("");
  const [pricingNotesVal, setPricingNotesVal] = useState<string>("");
  const [isSavingPrice, setIsSavingPrice] = useState<boolean>(false);
  const [orgData, setOrgData] = useState<any>(null);
  const [dismissedWarningMap, setDismissedWarningMap] = useState<Record<number, boolean>>({});
  const [showNotificationGuide, setShowNotificationGuide] = useState(false);

  const theme = COLOR_THEMES[primaryColor] || COLOR_THEMES.emerald;

  const exportCompletedOrdersToExcel = () => {
    // Filter for completed orders
    const completedOrders = orders.filter(o => o.status === "completed");
    
    if (completedOrders.length === 0) {
      setErrorMsg("لا توجد طلبات مكتملة لتصديرها حالياً");
      setTimeout(() => setErrorMsg(""), 4000);
      return;
    }
    
    // CSV Headers in Arabic
    const headers = [
      "رقم الطلب",
      "اسم العميل",
      "نوع الطلب",
      "تاريخ الطلب",
      "المسؤول الحالي (الموظف)",
      "تجهيز بواسطة",
      "توصيل بواسطة",
      "تسليم بواسطة",
      "الطلبات والكميات",
      "رسوم التوصيل",
      "سعر الطلب",
      "السعر الإجمالي",
      "ملاحظات التسعير"
    ];
    
    const csvRows = [];
    csvRows.push(headers.join(","));
    
    completedOrders.forEach(o => {
      let orderDate = "---";
      if (o.createdAt) {
        try {
          const dateObj = typeof o.createdAt.toDate === 'function' ? o.createdAt.toDate() : new Date(o.createdAt as any);
          orderDate = format(dateObj, "yyyy-MM-dd HH:mm", { locale: ar });
        } catch (e) {
          orderDate = String(o.createdAt);
        }
      }
      
      const itemPrice = o.totalPrice && o.deliveryPrice ? (o.totalPrice - o.deliveryPrice) : (o.totalPrice || 0);

      const row = [
        `"${o.id}"`,
        `"${(o.customerName || "").replace(/"/g, '""')}"`,
        `"${o.fulfillmentType === "delivery" ? "توصيل" : "استلام بنفسي"}"`,
        `"${orderDate}"`,
        `"${(o.staffName || "---").replace(/"/g, '""')}"`,
        `"${(o.preparedBy || "---").replace(/"/g, '""')}"`,
        `"${(o.dispatchedBy || "---").replace(/"/g, '""')}"`,
        `"${(o.deliveredBy || "---").replace(/"/g, '""')}"`,
        `"${(o.items || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${o.deliveryPrice || 0}"`,
        `"${itemPrice || 0}"`,
        `"${o.totalPrice || 0}"`,
        `"${(o.pricingNotes || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ];
      csvRows.push(row.join(","));
    });
    
    // Add UTF-8 BOM so Excel opens Arabic values cleanly
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `الطلبّات_المكتملة_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccessMsg(`تم تصدير ${completedOrders.length} طلب مكتمل إلى ملف Excel بنجاح!`);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && orgId) {
      setDismissedWarningMap({
        1: localStorage.getItem(`dismissed_expiry_warning_1_${orgId}`) === "true",
        2: localStorage.getItem(`dismissed_expiry_warning_2_${orgId}`) === "true",
        3: localStorage.getItem(`dismissed_expiry_warning_3_${orgId}`) === "true",
      });
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId && typeof window !== "undefined") {
      if ("Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission().then((perm) => {
            if (perm === "granted") {
              subscribeUserToPush({
                orgId,
                userType: "admin"
              }).catch(err => console.error("Error subscribing admin to push:", err));
            }
          });
        } else if (Notification.permission === "granted") {
          subscribeUserToPush({
            orgId,
            userType: "admin"
          }).catch(err => console.error("Error subscribing admin to push:", err));
        }
      }
    }
  }, [orgId]);

  // sound and native browser desktop notification states
  const [play] = useSound(NOTIFICATION_SOUND);
  const lastPendingIds = useRef<Set<string>>(new Set());
  const lastChatLengthMap = useRef<Record<string, number>>({});
  const isFirstLoad = useRef(true);

  const [enableSoundLoop, setEnableSoundLoop] = useState<boolean>(true);

  const [desktopPermission, setDesktopPermission] = useState<string>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });

  const playSoundWithFallback = () => {
    try {
      play();
    } catch (err) {
      console.warn("Audio playback blocked or failed:", err);
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      setShowNotificationGuide(true);
      showToast("عذراً، هذا المتصفح لا يدعم الإشعارات المباشرة بشكل تلقائي.", true);
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setDesktopPermission(perm);
      if (perm === "granted") {
        showToast("تم تفعيل التنبيهات المكتبية بنجاح! 🎉");
        // Immediately subscribe admin to Web Push system
        if (orgId) {
          subscribeUserToPush({
            orgId,
            userType: "admin"
          }).catch(err => console.error("Error subscribing admin to push via button click:", err));
        }
        triggerDesktopNotification("تنبيهات النظام الذكية 🔔", "ستستلم إشعارات فورية عند وصول أي طلب جديد للزبائن!");
      } else {
        setShowNotificationGuide(true);
        showToast("تم رفض أو حظر إذن الإشعارات من متصفحك.", true);
      }
    } catch (err) {
      console.error(err);
      setShowNotificationGuide(true);
      showToast("حدث خطأ أو قيود أمان أثناء تفعيل الإشعارات.", true);
    }
  };

  const triggerDesktopNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      // Use Service Worker ready registration whenever possible for optimal iOS/Android support
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon: logoUrl || "/logo.png",
            requireInteraction: true,
            data: { url: `/?orgId=${orgId}&view=staff` }
          }).catch((err) => {
            console.error("Failed to show SW notification for admin:", err);
          });
        }).catch((err) => {
          console.error("SW ready failed for admin:", err);
          try {
            new Notification(title, {
              body,
              icon: logoUrl || undefined,
              requireInteraction: true
            });
          } catch (e) {
            console.error("Fallback new Notification failed:", e);
          }
        });
      } else {
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
    }
  };



  const isPlatformOwner = (email: string | null | undefined) => {
    return !!email && ["langmix2@gmail.com", "fahussein79@gmail.com"].includes(email);
  };

  useEffect(() => {
    if (!db || !orgId || !user) return;
    
    const checkAuthAndFetchBranding = async () => {
      try {
        const orgSnap = await getDoc(doc(db, "organizations", orgId));
        if (orgSnap.exists()) {
          const data = orgSnap.data();
          if (data.ownerEmail === user.email || isPlatformOwner(user.email)) {
            setIsAuthorized(true);
            setOrgUsername(data.username || "");
            setOrgPassword(data.passwordHint || "");
            // Also fetch branding here or in another effect
            const brandingSnap = await getDoc(doc(db, "organizations", orgId, "settings", "branding"));
            if (brandingSnap.exists()) {
              const bData = brandingSnap.data();
              setRestaurantName(bData.restaurantName || "مطعم البركة");
              setMerchantWhatsApp(bData.merchantWhatsApp || "");
              setAutoCleanupEnabled(!!bData.autoCleanupEnabled);
              setLastAutoCleanup(bData.lastAutoCleanup || null);
              setDeliveryEnabled(bData.deliveryEnabled !== false);
              setCurrency(bData.currency || "ريال يمني");
              setLogoUrl(bData.logoUrl || "");
              setPrimaryColor(bData.primaryColor || "emerald");
              setWelcomeMessage(bData.welcomeMessage || "أهلاً بك في نظام الطلبات المتطور. اطلب الآن وتابع حالة طلبك مباشرة.");
              setChosenIcon(bData.chosenIcon || "shopping-bag");
              setEnableSoundLoop(bData.enableSoundLoop !== false);
              setFieldNameLabel(bData.fieldNameLabel || "اسم العميل الكرام");
              setFieldPhoneLabel(bData.fieldPhoneLabel || "رقم الجوال النشط");
              setFieldItemsLabel(bData.fieldItemsLabel || "تفاصيل الطلبات والكميات");

              // Step tracking customized values
              setStepPendingLabel(bData.stepPendingLabel || "تم استلام الطلب بنجاح");
              setStepPendingDesc(bData.stepPendingDesc || "تم تسجيل طلبك بنجاح في النظام وفريق العمل يراجعه الآن.");
              setStepPendingIcon(bData.stepPendingIcon || "clock");

              setStepAcceptedLabel(bData.stepAcceptedLabel || "جاري التحضير والتجهيز");
              setStepAcceptedDesc(bData.stepAcceptedDesc || "بدأ الموظفون المباشرة في العمل على تجهيز محتويات طلبك بكل دقة.");
              setStepAcceptedIcon(bData.stepAcceptedIcon || "utensils");

              setStepReadyLabel(bData.stepReadyLabel || "الطلب جاهز للتوصيل! 🎉");
              setStepReadyDesc(bData.stepReadyDesc || "اكتمل تجهيز طلبك بالكامل وجاري تحضيره للتسليم لخط التوصيل.");
              setStepReadyIcon(bData.stepReadyIcon || "bell");

              setStepDeliveringLabel(bData.stepDeliveringLabel || "جاري توصيل الطلب للموقع! 🚚");
              setStepDeliveringDesc(bData.stepDeliveringDesc || "الطلب حالياً مع مندوب التوصيل وهو في طريقه إليك الآن.");
              setStepDeliveringIcon(bData.stepDeliveringIcon || "truck");

              setStepCompletedLabel(bData.stepCompletedLabel || "تم تسليم الطلب بنجاح");
              setStepCompletedDesc(bData.stepCompletedDesc || "نشكرك كثيراً لثقتك بنا، وجاهزون لخدمتك دائماً ونأمل رؤيتك قريباً!");
              setStepCompletedIcon(bData.stepCompletedIcon || "check-circle-2");

              setStepPickupReadyLabel(bData.stepPickupReadyLabel || "الطلب جاهز للاستلام! 🎉");
              setStepPickupReadyDesc(bData.stepPickupReadyDesc || "اكتمل تجهيز طلبك بالكامل وبإمكانك استلامه الآن من نقطة التسليم.");
              setStepPickupReadyIcon(bData.stepPickupReadyIcon || "bell");

              setStepPickupCompletedLabel(bData.stepPickupCompletedLabel || "تم الاستلام والمغادرة");
              setStepPickupCompletedDesc(bData.stepPickupCompletedDesc || "نشكرك كثيراً لثقتك بنا، وجاهزون لخدمتك دائماً ونأمل رؤيتك قريباً!");
              setStepPickupCompletedIcon(bData.stepPickupCompletedIcon || "check-circle-2");
            }
          } else {
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuthAndFetchBranding();
  }, [orgId, user]);

  useEffect(() => {
    if (!db || !orgId || !isAuthorized) return;
    const unsub = onSnapshot(doc(db, "organizations", orgId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const activePlan = data.subscriptionPlan || data.subscriptionTier || "tier1";
        setOrgData({ id: docSnap.id, ...data, subscriptionPlan: activePlan, subscriptionTier: activePlan });
      }
    });
    return () => unsub();
  }, [db, orgId, isAuthorized]);

  useEffect(() => {
    if (!db || !orgId || !isAuthorized) return;
    const unsub = onSnapshot(doc(db, "organizations", orgId, "settings", "branding"), (docSnap) => {
      if (docSnap.exists()) {
        const bData = docSnap.data();
        setRestaurantName(bData.restaurantName || "مطعم البركة");
        setMerchantWhatsApp(bData.merchantWhatsApp || "");
        setAutoCleanupEnabled(!!bData.autoCleanupEnabled);
        setLastAutoCleanup(bData.lastAutoCleanup || null);
        setDeliveryEnabled(bData.deliveryEnabled !== false);
        setCurrency(bData.currency || "ريال يمني");
        setLogoUrl(bData.logoUrl || "");
        setPrimaryColor(bData.primaryColor || "emerald");
        setWelcomeMessage(bData.welcomeMessage || "أهلاً بك في نظام الطلبات المتطور. اطلب الآن وتابع حالة طلبك مباشرة.");
        setChosenIcon(bData.chosenIcon || "shopping-bag");
        setEnableSoundLoop(bData.enableSoundLoop !== false);
        setFieldNameLabel(bData.fieldNameLabel || "اسم العميل الكرام");
        setFieldPhoneLabel(bData.fieldPhoneLabel || "رقم الجوال النشط");
        setFieldItemsLabel(bData.fieldItemsLabel || "تفاصيل الطلبات والكميات");

        // Step tracking customized values
        setStepPendingLabel(bData.stepPendingLabel || "تم استلام الطلب بنجاح");
        setStepPendingDesc(bData.stepPendingDesc || "تم تسجيل طلبك بنجاح في النظام وفريق العمل يراجعه الآن.");
        setStepPendingIcon(bData.stepPendingIcon || "clock");

        setStepAcceptedLabel(bData.stepAcceptedLabel || "جاري التحضير والتجهيز");
        setStepAcceptedDesc(bData.stepAcceptedDesc || "بدأ الموظفون المباشرة في العمل على تجهيز محتويات طلبك بكل دقة.");
        setStepAcceptedIcon(bData.stepAcceptedIcon || "utensils");

        setStepReadyLabel(bData.stepReadyLabel || "الطلب جاهز للتوصيل! 🎉");
        setStepReadyDesc(bData.stepReadyDesc || "اكتمل تجهيز طلبك بالكامل وجاري تحضيره للتسليم لخط التوصيل.");
        setStepReadyIcon(bData.stepReadyIcon || "bell");

        setStepDeliveringLabel(bData.stepDeliveringLabel || "جاري توصيل الطلب للموقع! 🚚");
        setStepDeliveringDesc(bData.stepDeliveringDesc || "الطلب حالياً مع مندوب التوصيل وهو في طريقه إليك الآن.");
        setStepDeliveringIcon(bData.stepDeliveringIcon || "truck");

        setStepCompletedLabel(bData.stepCompletedLabel || "تم تسليم الطلب بنجاح");
        setStepCompletedDesc(bData.stepCompletedDesc || "نشكرك كثيراً لثقتك بنا، وجاهزون لخدمتك دائماً ونأمل رؤيتك قريباً!");
        setStepCompletedIcon(bData.stepCompletedIcon || "check-circle-2");

        setStepPickupReadyLabel(bData.stepPickupReadyLabel || "الطلب جاهز للاستلام! 🎉");
        setStepPickupReadyDesc(bData.stepPickupReadyDesc || "اكتمل تجهيز طلبك بالكامل وبإمكانك استلامه الآن من نقطة التسليم.");
        setStepPickupReadyIcon(bData.stepPickupReadyIcon || "bell");

        setStepPickupCompletedLabel(bData.stepPickupCompletedLabel || "تم الاستلام والمغادرة");
        setStepPickupCompletedDesc(bData.stepPickupCompletedDesc || "نشكرك كثيراً لثقتك بنا، وجاهزون لخدمتك دائماً ونأمل رؤيتك قريباً!");
        setStepPickupCompletedIcon(bData.stepPickupCompletedIcon || "check-circle-2");
      }
    });
    return () => unsub();
  }, [db, orgId, isAuthorized]);

  useEffect(() => {
    if (!db || !orgId || !isAuthorized) return;

    const unsubStaff = onSnapshot(collection(db, "organizations", orgId, "staff"), (snap) => {
      setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() } as Staff)));
    });

    const unsubBankAccounts = onSnapshot(collection(db, "organizations", orgId, "bank_accounts"), (snap) => {
      setBankAccounts(snap.docs.map(d => ({ id: d.id, ...d.data() } as BankAccount)));
    });

    const unsubOrders = onSnapshot(
      query(collection(db, "organizations", orgId, "orders"), orderBy("createdAt", "desc"), limit(150)),
      (snap) => {
        const fetchedOrders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        
        const currentPendingIds = new Set(fetchedOrders.filter(o => o.status === "pending").map(o => o.id));
        
        if (!isFirstLoad.current) {
          // 1. Detect new orders
          const newPendingIds = Array.from(currentPendingIds).filter(id => !lastPendingIds.current.has(id));
          if (newPendingIds.length > 0) {
            playSoundWithFallback();
            
            const newestOrder = fetchedOrders.find(o => o.id === newPendingIds[0]);
            if (newestOrder) {
              triggerDesktopNotification(
                "طلب جديد وارد للتحضير! 🔔",
                `الزبون: ${newestOrder.customerName || 'بدون اسم'} - محتويات: ${newestOrder.items || 'طلب فارغ'}`
              );
              showToast(`وصل طلب جديد من ${newestOrder.customerName || 'عميل'}!`);
            }
          }

          // 2. Detect if any active/recent order has new chat messages from customer
          fetchedOrders.forEach((o) => {
            const previousLen = lastChatLengthMap.current[o.id] !== undefined ? lastChatLengthMap.current[o.id] : (o.chat ? o.chat.length : 0);
            const currentChat = o.chat || [];
            const currentLen = currentChat.length;

            if (currentLen > previousLen) {
              const newMessages = currentChat.slice(previousLen);
              const customerMsg = newMessages.find((m: any) => m.sender === "customer");
              if (customerMsg) {
                // If the chat isn't explicitly muted by staff/admin
                if (!o.chatMuted) {
                  playSoundWithFallback();
                  triggerDesktopNotification(
                    `💬 رسالة جديدة من ${o.customerName || "العميل"}`,
                    customerMsg.text
                  );
                  showToast(`رسالة جديدة من ${o.customerName || "العميل"}: ${customerMsg.text}`);
                }
              }
            }
          });
        }
        
        // Update the chat lengths in our ref map
        const newChatLengthMap: Record<string, number> = {};
        fetchedOrders.forEach((o) => {
          newChatLengthMap[o.id] = o.chat ? o.chat.length : 0;
        });
        lastChatLengthMap.current = newChatLengthMap;

        setOrders(fetchedOrders);
        lastPendingIds.current = currentPendingIds;
        isFirstLoad.current = false;
        setLoading(false);
      },
      (err) => {
        console.error("Orders load failed:", err);
        setLoading(false);
      }
    );

    return () => {
      unsubStaff();
      unsubOrders();
      unsubBankAccounts();
    };
  }, [db, orgId, isAuthorized]);

  // Synchronous continuous sound loop if enabled and there are pending orders
  useEffect(() => {
    if (!enableSoundLoop) return;
    
    const hasPending = orders.some(o => o.status === "pending");
    if (!hasPending) return;

    // Repeat alarm chime every 2 minutes for pending orders
    const interval = setInterval(() => {
      playSoundWithFallback();
    }, 120000);

    return () => clearInterval(interval);
  }, [orders, enableSoundLoop]);

  const showToast = (msg: string, isError = false) => {
    if (isError) setErrorMsg(msg);
    else setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!db || !orgId) return;

    // Check if the order is delivery, price is determined, and unpaid
    if (newStatus === "ready" || newStatus === "delivering" || newStatus === "completed") {
      const orderObj = orders.find(o => o.id === orderId);
      if (orderObj && orderObj.fulfillmentType === "delivery") {
        if (orderObj.totalPrice === undefined) {
          showToast("⚠️ عذراً، يجب تحديد سعر الفاتورة أولاً ولتكن معتمدة ومدفوعة قبل نقل الطلب للمرحلة التالية", true);
          return;
        }
        if (orderObj.paymentStatus !== "paid") {
          showToast("⚠️ عذراً، لا يمكن نقل الطلب للمرحلة التالية لأن العميل لم يكمل سداد الفاتورة أو لم يتم اعتماد الدفع من قِبل الإدارة 💳", true);
          return;
        }
      }
    }

    try {
      const updates: any = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      if (newStatus === "accepted") updates.acceptedBy = "المدير";
      if (newStatus === "ready") updates.preparedBy = "المدير";
      if (newStatus === "delivering") updates.dispatchedBy = "المدير";
      if (newStatus === "completed") updates.deliveredBy = "المدير";
      if (newStatus === "cancelled") updates.cancelledBy = "manager";

      // Append system message transition to chat
      const orderObj = orders.find(o => o.id === orderId);
      const existingChat = orderObj?.chat || [];
      
      let systemText = "";
      if (newStatus === "accepted") systemText = "تم قبول الطلب وبدأ التحضير 👨‍🍳";
      if (newStatus === "ready") systemText = "اكتمل تجهيز الطلب وهو جاهز للتسليم! 🎉";
      if (newStatus === "delivering") systemText = "الطلب مع مندوب التوصيل وهو في طريقه إليك 🚚";
      if (newStatus === "completed") systemText = "تم تسليم الطلب وإنتهاء الخدمة بنجاح، شكراً لثقتكم! ❤️";
      if (newStatus === "cancelled") systemText = "تم إلغاء هذا الطلب من قبل الإدارة ❌";

      if (systemText) {
        updates.chat = [...existingChat, {
          sender: "system",
          senderName: "النظام",
          text: systemText,
          createdAt: new Date().toISOString()
        }];
      }

      await updateDoc(doc(db, "organizations", orgId, "orders", orderId), updates);

      // Trigger push notification to active registered customer
      fetch("/api/notify-order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          orderId,
          newStatus,
          statusBody: systemText,
          restaurantName
        })
      }).catch(err => console.error("Error calling notify-order-status in admin:", err));

      showToast("تم تحديث حالة الطلب");
    } catch (err) {
      console.error(err);
      showToast("فشل تحديث الطلب", true);
    }
  };

  const handleSavePricing = async () => {
    if (!pricingOrder || !orgId || !db) return;
    
    if (pricingOrder.fulfillmentType === "delivery") {
      if (!pricingItemsPrice || pricingItemsPrice.trim() === "" || parseFloat(pricingItemsPrice) <= 0) {
        showToast("عذراً، يجب إدخال قيمة السعر للمنتجات والسلع للطلبات التي تتضمن توصيلاً خارجياً 🧾", true);
        return;
      }
    }

    if (deliveryEnabled && (!pricingDeliveryPrice || pricingDeliveryPrice.trim() === "")) {
      showToast("عذراً، رسوم التوصيل والخدمة إلزامية لأن خدمة التوصيل مفعّلة حالياً", true);
      return;
    }

    setIsSavingPrice(true);
    try {
      const orderRef = doc(db, "organizations", orgId, "orders", pricingOrder.id);
      
      const itemsPrice = parseFloat(pricingItemsPrice) || 0;
      const deliveryPrice = parseFloat(pricingDeliveryPrice) || 0;
      
      const updates: any = {
        totalPrice: itemsPrice,
        deliveryPrice: deliveryPrice,
        pricingNotes: pricingNotesVal,
        updatedAt: serverTimestamp(),
      };

      const cLab = getCurrencyLabel(currency || "ريال يمني");

      // Append system message transition to chat
      const existingChat = pricingOrder.chat || [];
      const systemText = `💸 تم تحديد فاتورة طلبك بقيمة ${itemsPrice + deliveryPrice} ${cLab}. (سعر المنتجات: ${itemsPrice} ${cLab} + التوصيل/الخدمة: ${deliveryPrice} ${cLab}). جاري متابعة تحضير طلبك وتوصيله إليك دون تأخير! 🚀`;

      updates.chat = [...existingChat, {
        sender: "system",
        senderName: "النظام",
        text: systemText,
        createdAt: new Date().toISOString()
      }];

      await updateDoc(orderRef, updates);

      // Trigger push notification of pricing (Inform & Proceed)
      fetch("/api/notify-order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          orderId: pricingOrder.id,
          newStatus: pricingOrder.status,
          statusBody: systemText,
          restaurantName
        })
      }).catch(err => console.error("Error calling notify-order-status on pricing in admin:", err));

      showToast("تم تحديث الفاتورة وإصدار كشف الحساب الفوري للعميل! 🎉");
      setPricingOrder(null);
    } catch (err) {
      console.error(err);
      showToast("فشل تحديث الفاتورة", true);
    } finally {
      setIsSavingPrice(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !orgId) return;

    const tier = orgData?.subscriptionTier || "tier1";
    if (tier === "tier1" && staff.length >= 1) {
      showToast("الباقة الاقتصادية تسمح بإضافة موظف واحد فقط! يرجى ترقية باقتك لإضافة المزيد.", true);
      return;
    }
    if (tier === "tier2" && staff.length >= 4) {
      showToast("الباقة المتقدمة تسمح بإضافة حتى 4 موظفين فقط! يرجى ترقية الترخيص للباقة الاحترافية لإضافة المزيد.", true);
      return;
    }

    try {
      await addDoc(collection(db, "organizations", orgId, "staff"), {
        ...newStaff,
        isActive: true,
        createdAt: serverTimestamp()
      });
      setShowAddStaff(false);
      setNewStaff({ name: "", role: "موظف", passcode: "" });
      showToast("تم إضافة الموظف بنجاح");
    } catch (err) {
      console.error(err);
      showToast("فشل إضافة الموظف", true);
    }
  };

  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !orgId) return;
    if (!newBankAccount.bankName.trim() || !newBankAccount.accountHolder.trim() || !newBankAccount.accountNumber.trim()) {
      showToast("يرجى ملئ جميع الحقول المطلوبة", true);
      return;
    }

    const tier = orgData?.subscriptionTier || "tier1";
    if (tier === "tier1" && bankAccounts.length >= 1) {
      showToast("الباقة الاقتصادية تسمح بحساب بنكي واحد فقط! يرجى ترقية باقتك لإضافة المزيد.", true);
      return;
    }
    if (tier === "tier2" && bankAccounts.length >= 3) {
      showToast("الباقة المتقدمة تسمح بـ 3 حسابات بنكية فقط! يرجى ترقية الترخيص للباقة الاحترافية لإضافة المزيد.", true);
      return;
    }

    setIsAddingAccount(true);
    try {
      await addDoc(collection(db, "organizations", orgId, "bank_accounts"), {
        bankName: newBankAccount.bankName.trim(),
        accountHolder: newBankAccount.accountHolder.trim(),
        accountNumber: newBankAccount.accountNumber.trim(),
        createdAt: serverTimestamp()
      });
      setNewBankAccount({ bankName: "", accountHolder: "", accountNumber: "" });
      showToast("تم إضافة الحساب البنكي بنجاح");
    } catch (err: any) {
      console.error(err);
      showToast(`فشل إضافة الحساب البنكي: ${err?.message || err}`, true);
    } finally {
      setIsAddingAccount(false);
    }
  };

  const handleDeleteBankAccount = async (accountId: string) => {
    if (!db || !orgId) return;
    try {
      await deleteDoc(doc(db, "organizations", orgId, "bank_accounts", accountId));
      showToast("تم حذف الحساب البنكي بنجاح");
    } catch (err: any) {
      console.error(err);
      showToast(`فشل حذف الحساب البنكي: ${err?.message || err}`, true);
    }
  };

  const handleUpdateBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !orgId || !editingBankAccount) return;
    if (!editingBankAccount.bankName.trim() || !editingBankAccount.accountHolder.trim() || !editingBankAccount.accountNumber.trim()) {
      showToast("يرجى ملئ جميع الحقول المطلوبة للتعديل", true);
      return;
    }
    try {
      const { id, ...data } = editingBankAccount;
      await updateDoc(doc(db, "organizations", orgId, "bank_accounts", id), {
        bankName: data.bankName.trim(),
        accountHolder: data.accountHolder.trim(),
        accountNumber: data.accountNumber.trim()
      });
      setEditingBankAccount(null);
      showToast("تم تحديث الحساب البنكي بنجاح");
    } catch (err: any) {
      console.error(err);
      showToast(`فشل تحديث الحساب البنكي: ${err?.message || err}`, true);
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !editingStaff || !orgId) return;
    try {
      const { id, ...data } = editingStaff;
      await updateDoc(doc(db, "organizations", orgId, "staff", id), data);
      setEditingStaff(null);
      showToast("تم تحديث بيانات الموظف");
    } catch (err) {
      console.error(err);
      showToast("فشل تحديث البيانات", true);
    }
  };

  const handleDeleteStaff = async () => {
    if (!db || !staffToDelete || !orgId) return;
    try {
      await deleteDoc(doc(db, "organizations", orgId, "staff", staffToDelete.id));
      setStaffToDelete(null);
      showToast("تم حذف الموظف بنجاح");
    } catch (err) {
      console.error(err);
      showToast("فشل حذف الموظف", true);
    }
  };

  const copyToClipboard = (type: 'customer' | 'staff') => {
    const url = `${window.location.origin}?view=${type}&orgId=${orgId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(type);
      setTimeout(() => setCopiedLink(null), 2000);
    });
  };

  // Derived stats
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === "completed").length;
  const activeOrders = totalOrders - completedOrders;

  const staffStats = staff.map(s => {
    const staffOrders = orders.filter(o => o.staffName === s.name);
    return {
      ...s,
      acceptedCount: orders.filter(o => o.acceptedBy === s.name).length,
      preparedCount: orders.filter(o => o.preparedBy === s.name).length,
      deliveredCount: orders.filter(o => o.deliveredBy === s.name).length,
    };
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) { // keep it under 800KB to stay within standard doc limits
        showToast("حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 800 كيلوبايت", true);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setLogoUrl(reader.result);
          showToast("تم تحميل الشعار بنجاح");
        }
      };
      reader.onerror = () => {
        showToast("حدث خطأ أثناء قراءة الملف", true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGeneralSettings = async () => {
    if (!db || !orgId) return;
    if (!orgUsername.trim()) {
      showToast("يرجى إدخال اسم مستخدم صالح", true);
      return;
    }
    if (!orgPassword.trim() || orgPassword.trim().length < 4) {
      showToast("يرجى إدخال كلمة مرور مكونة من 4 أحرف أو أرقام على الأقل", true);
      return;
    }
    setSavingBranding(true);
    try {
      const cleanUsername = orgUsername.trim().toLowerCase();
      const virtualEmail = `${cleanUsername}@quickorder.sys`;

      // 1. Update organization main credentials (Username & Password)
      await setDoc(doc(db, "organizations", orgId), {
        username: cleanUsername,
        passwordHint: orgPassword.trim(),
        ownerEmail: virtualEmail,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Update general & delivery options
      await setDoc(doc(db, "organizations", orgId, "settings", "branding"), {
        restaurantName: restaurantName,
        merchantWhatsApp: merchantWhatsApp.trim(),
        deliveryEnabled: deliveryEnabled,
        enableSoundLoop: enableSoundLoop,
        currency: currency,
        updatedAt: serverTimestamp()
      }, { merge: true });

      showToast("تم حفظ الإعدادات العامة وتحديث بيانات الحساب بنجاح");
    } catch (err) {
      console.error(err);
      showToast("فشل حفظ الإعدادات", true);
    } finally {
      setSavingBranding(false);
    }
  };

  const handleSaveCustomerBranding = async () => {
    if (!db || !orgId) return;
    setSavingBranding(true);
    try {
      await setDoc(doc(db, "organizations", orgId, "settings", "branding"), {
        logoUrl: logoUrl,
        primaryColor: primaryColor,
        welcomeMessage: welcomeMessage,
        chosenIcon: chosenIcon,
        
        // Custom step titles/texts/icons
        stepPendingLabel,
        stepPendingDesc,
        stepPendingIcon,

        stepAcceptedLabel,
        stepAcceptedDesc,
        stepAcceptedIcon,

        stepReadyLabel,
        stepReadyDesc,
        stepReadyIcon,

        stepDeliveringLabel,
        stepDeliveringDesc,
        stepDeliveringIcon,

        stepCompletedLabel,
        stepCompletedDesc,
        stepCompletedIcon,

        stepPickupReadyLabel,
        stepPickupReadyDesc,
        stepPickupReadyIcon,

        stepPickupCompletedLabel,
        stepPickupCompletedDesc,
        stepPickupCompletedIcon,

        // Custom field labels
        fieldNameLabel,
        fieldPhoneLabel,
        fieldItemsLabel,

        updatedAt: serverTimestamp()
      }, { merge: true });
      showToast("تم حفظ إعدادات مظهر صفحة العملاء وتتبع الخطوات بنجاح");
    } catch (err) {
      console.error(err);
      showToast("فشل حفظ إعدادات صفحة العملاء", true);
    } finally {
      setSavingBranding(false);
    }
  };

  const handleResetToDefaults = () => {
    setStepPendingLabel("تم استلام الطلب بنجاح");
    setStepPendingDesc("تم تسجيل طلبك بنجاح في النظام وفريق العمل يراجعه الآن.");
    setStepPendingIcon("clock");

    setStepAcceptedLabel("جاري التحضير والتجهيز");
    setStepAcceptedDesc("بدأ الموظفون المباشرة في العمل على تجهيز محتويات طلبك بكل دقة.");
    setStepAcceptedIcon("utensils");

    setStepReadyLabel("الطلب جاهز للتوصيل! 🎉");
    setStepReadyDesc("اكتمل تجهيز طلبك بالكامل وجاري تحضيره للتسليم لخط التوصيل.");
    setStepReadyIcon("bell");

    setStepDeliveringLabel("جاري توصيل الطلب للموقع! 🚚");
    setStepDeliveringDesc("الطلب حالياً مع مندوب التوصيل وهو في طريقه إليك الآن.");
    setStepDeliveringIcon("truck");

    setStepCompletedLabel("تم تسليم الطلب بنجاح");
    setStepCompletedDesc("نشكرك كثيراً لثقتك بنا، وجاهزون لخدمتك دائماً ونأمل رؤيتك قريباً!");
    setStepCompletedIcon("check-circle-2");

    setStepPickupReadyLabel("الطلب جاهز للاستلام! 🎉");
    setStepPickupReadyDesc("اكتمل تجهيز طلبك بالكامل وبإمكانك استلامه الآن من نقطة التسليم.");
    setStepPickupReadyIcon("bell");

    setStepPickupCompletedLabel("تم الاستلام والمغادرة");
    setStepPickupCompletedDesc("نشكرك كثيراً لثقتك بنا، وجاهزون لخدمتك دائماً ونأمل رؤيتك قريباً!");
    setStepPickupCompletedIcon("check-circle-2");

    setFieldNameLabel("اسم العميل الكرام");
    setFieldPhoneLabel("رقم الجوال النشط");
    setFieldItemsLabel("تفاصيل الطلبات والكميات");

    showToast("تم استعادة جميع قيم ومراحل التتبع الافتراضية، اضغط حفظ للاعتماد.");
  };

  const renderIconMockup = (name: string, className?: string) => {
    const cnVal = className || "w-5 h-5";
    switch (name) {
      case "clock": return <Clock className={cnVal} />;
      case "utensils": return <Utensils className={cnVal} />;
      case "bell": return <Bell className={cnVal} />;
      case "truck": return <Truck className={cnVal} />;
      case "check-circle-2":
      case "check-circle":
        return <CheckCircle className={cnVal} />;
      case "store": return <Store className={cnVal} />;
      case "coffee": return <Coffee className={cnVal} />;
      case "pizza": return <Pizza className={cnVal} />;
      case "sparkles": return <Sparkles className={cnVal} />;
      case "map-pin": return <MapPin className={cnVal} />;
      case "shopping-bag": return <ShoppingBag className={cnVal} />;
      default: return <Clock className={cnVal} />;
    }
  };

  const handleClearAllOrders = () => {
    setShowClearAllConfirm(true);
  };

  const handleClearCompletedOrders = () => {
    const completed = orders.filter(o => o.status === "completed");
    if (completed.length === 0) {
      showToast("لا توجد طلبات مكتملة لحذفها حالياً", true);
      return;
    }
    setShowClearCompletedConfirm(true);
  };

  const executeClearAllOrders = async () => {
    if (!db || !orgId) return;
    setClearingInProgress(true);
    const ordersToDelete = [...orders];
    
    try {
      for (const order of ordersToDelete) {
        await deleteDoc(doc(db, "organizations", orgId, "orders", order.id));
      }
      showToast("تم تصفير جميع الطلبات بنجاح");
      setShowClearAllConfirm(false);
    } catch (err) {
      console.error("Clear all error:", err);
      showToast("فشل تصفير الطلبات", true);
    } finally {
      setClearingInProgress(false);
    }
  };

  const executeClearCompletedOrders = async () => {
    if (!db || !orgId) return;
    setClearingInProgress(true);
    const completed = orders.filter(o => o.status === "completed");

    try {
      for (const order of completed) {
        await deleteDoc(doc(db, "organizations", orgId, "orders", order.id));
      }
      showToast("تم حذف الطلبات المكتملة بنجاح");
      setShowClearCompletedConfirm(false);
    } catch (err) {
      console.error("Clear completed error:", err);
      showToast("فشل حذف الطلبات المكتملة", true);
    } finally {
      setClearingInProgress(false);
    }
  };

  const executeDeleteSingleOrder = async () => {
    if (!db || !orgId || !singleOrderToDelete) return;
    setClearingInProgress(true);
    try {
      await deleteDoc(doc(db, "organizations", orgId, "orders", singleOrderToDelete.id));
      showToast("تم حذف الطلب بنجاح");
      setSingleOrderToDelete(null);
    } catch (err) {
      console.error("Delete order error:", err);
      showToast("فشل حذف الطلب", true);
    } finally {
      setClearingInProgress(false);
    }
  };

  const handleToggleAutoCleanup = async () => {
    if (!db || !orgId) return;
    const tier = orgData?.subscriptionTier || "tier1";
    if (tier === "tier1" || tier === "tier2") {
      showToast("الحذف التلقائي مفعّل إلزامياً لهذه الباقة ولا يمكن تعطيله", true);
      return;
    }
    setSavingCleanup(true);
    const newValue = !autoCleanupEnabled;
    const thresholdDays = 30; // tier3 is 30 days
    try {
      await setDoc(doc(db, "organizations", orgId, "settings", "branding"), {
        autoCleanupEnabled: newValue,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setAutoCleanupEnabled(newValue);
      showToast(newValue ? `تم تفعيل الحذف التلقائي كل ${thresholdDays} يوماً` : "تم إيقاف الحذف التلقائي");
    } catch (err) {
      console.error(err);
      showToast("فشل حفظ إعدادات الحذف التلقائي", true);
    } finally {
      setSavingCleanup(false);
    }
  };

  // Automatic cleanup trigger based on subscription tier (10/20/30 days)
  useEffect(() => {
    const tier = orgData?.subscriptionTier || "tier1";
    const isCleanupActive = (tier === "tier1" || tier === "tier2") ? true : autoCleanupEnabled;
    if (!db || !orgId || !isAuthorized || !isCleanupActive || loading) return;

    const runAutoCleanup = async () => {
      const now = new Date();
      let lastCleanupDate: Date | null = null;
      if (lastAutoCleanup) {
        if (typeof lastAutoCleanup.toDate === 'function') {
          lastCleanupDate = lastAutoCleanup.toDate();
        } else {
          lastCleanupDate = new Date(lastAutoCleanup);
        }
      }

      const thresholdDays = tier === "tier1" ? 10 : tier === "tier2" ? 20 : 30;

      // If last cleanup was more than thresholdDays * hours or never done
      const shouldCleanup = !lastCleanupDate || (now.getTime() - lastCleanupDate.getTime() >= thresholdDays * 24 * 60 * 60 * 1000);

      if (shouldCleanup) {
        const completed = orders.filter(o => o.status === "completed");
        const oldCompleted = completed.filter(o => {
          if (!o.createdAt) return false;
          try {
            const orderDate = typeof o.createdAt.toDate === 'function' ? o.createdAt.toDate() : new Date(o.createdAt as any);
            const diffMs = now.getTime() - orderDate.getTime();
            return diffMs >= thresholdDays * 24 * 60 * 60 * 1000;
          } catch (e) {
            return false;
          }
        });
        
        try {
          if (oldCompleted.length > 0) {
            console.log(`Running automatic cleanup: deleting ${oldCompleted.length} completed orders older than ${thresholdDays} days.`);
            for (const order of oldCompleted) {
              await deleteDoc(doc(db, "organizations", orgId, "orders", order.id));
            }
            showToast(`تم الحذف التلقائي للطلب المكتمل الفائت عليها ${thresholdDays} يوماً`);
          }
          
          await setDoc(doc(db, "organizations", orgId, "settings", "branding"), {
            lastAutoCleanup: serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.error("Auto cleanup error:", e);
        }
      }
    };

    const timer = setTimeout(() => {
      runAutoCleanup();
    }, 2000);

    return () => clearTimeout(timer);
  }, [db, orgId, isAuthorized, autoCleanupEnabled, orgData?.subscriptionTier, lastAutoCleanup, loading, orders.length]);

  const handleSignOut = () => {
    localStorage.removeItem('quickorder_custom_user');
    auth?.signOut();
    window.location.reload();
  };

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <ShieldCheck className="w-16 h-16 text-red-500 mb-4 opacity-50" />
      <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
      <p className="text-slate-500 text-sm max-w-xs">تأكد من إعداد Firebase بشكل صحيح في واجهة AI Studio وتفعيل Firestore.</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-all"
      >
        إعادة التحميل
      </button>
    </div>
  );

  if (isAuthorized === false) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <ShieldCheck className="w-16 h-16 text-red-500 mb-4 opacity-50" />
      <h2 className="text-xl font-bold text-white mb-2">غير مصرح لك</h2>
      <p className="text-slate-500 mb-6 max-w-sm font-bold text-sm">عذراً، هذا المتجر ليس مسجلاً بإيميلك. يرجى التأكد من تسجيل الدخول بالحساب الصحيح أو التواصل مع المشرف.</p>
      <button 
        onClick={handleSignOut}
        className="px-8 py-3 bg-indigo-600 rounded-xl text-white font-bold shadow-lg shadow-indigo-500/20"
      >
        تسجيل الخروج والدخول بحساب آخر
      </button>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const userTier = orgData?.subscriptionPlan || orgData?.subscriptionTier || "tier1";

  const menuItems = [
    { id: "live", label: "مراقبة الطلبات الحية", icon: LayoutDashboard, live: true },
    { id: "history", label: "سجل الطلبات", icon: History },
    { id: "stats", label: "الإحصائيات التحليلية", icon: BarChart3 },
    { id: "staff", label: "إدارة الموظفين", icon: Users },
    { id: "links", label: "روابط النظام", icon: LinkIcon },
    { id: "settings", label: "الإعدادات العامة", icon: Settings },
    ...(userTier !== "tier1" ? [{ id: "customer_settings", label: "اعدادات صفحة العملاء", icon: Paintbrush }] : []),
    { id: "bank_accounts", label: "الحسابات المصرفية", icon: Landmark },
  ];

  const expiresAtDate = orgData?.expiresAt ? (orgData.expiresAt.toDate ? orgData.expiresAt.toDate() : new Date(orgData.expiresAt)) : null;
  const isExpired = orgData ? ((expiresAtDate ? (expiresAtDate.getTime() < Date.now()) : false) || orgData.isSuspended === true) : false;
  const suspensionReason = orgData?.isSuspended 
    ? "تعطيل يدوي مباشر ومؤقت من إدارة المنصة" 
    : "انتهاء ترخيص الاشتراك أو انقضاء فترة التجربة المجانية";

  const getExpiryWarningLevel = () => {
    if (!orgData || isExpired || !expiresAtDate) return 0;
    const diffTime = expiresAtDate.getTime() - Date.now();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffDays <= 0) return 0;
    if (diffDays <= 1) return 3; // Before 1 day
    if (diffDays <= 3) return 2; // Before 3 days
    if (diffDays <= 7) return 1; // Before 7 days
    return 0;
  };

  const getRemainingTimeText = () => {
    if (!expiresAtDate) return "";
    const diffTime = expiresAtDate.getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 1) {
      return `متبقي ${diffDays} أيام`;
    } else {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      if (diffHours > 1) {
        return `متبقي ${diffHours} ساعة فقط`;
      } else {
        const diffMins = Math.ceil(diffTime / (1000 * 60));
        return `متبقي ${diffMins} دقيقة فقط!`;
      }
    }
  };

  const expiryWarningLevel = getExpiryWarningLevel();
  const showExpiryWarning = expiryWarningLevel > 0 && !dismissedWarningMap[expiryWarningLevel];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col lg:flex-row" dir="rtl">
      
      {/* Floating Centered Toast System */}
      <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-slate-950/95 border-2 border-emerald-500 text-white px-6 py-4 rounded-2xl shadow-[0_0_45px_rgba(16,185,129,0.35)] flex items-center gap-3.5 backdrop-blur-xl pointer-events-auto max-w-sm w-full md:max-w-md text-right border-l-[6px] border-l-emerald-500"
              dir="rtl"
            >
              <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <CheckCircle className="w-5.5 h-5.5" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold text-slate-400 block mb-0.5 leading-none">تنبيه ذكي</span>
                <span className="text-sm font-extrabold text-slate-100 block leading-tight">{successMsg}</span>
              </div>
            </motion.div>
          )}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-slate-950/95 border-2 border-red-500 text-white px-6 py-4 rounded-2xl shadow-[0_0_45px_rgba(239,68,68,0.35)] flex items-center gap-3.5 backdrop-blur-xl pointer-events-auto max-w-sm w-full md:max-w-md text-right border-l-[6px] border-l-red-500"
              dir="rtl"
            >
              <div className="w-10 h-10 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center justify-center text-red-500 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                <AlertCircle className="w-5.5 h-5.5" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold text-slate-400 block mb-0.5 leading-none">تنبيه خطأ</span>
                <span className="text-sm font-extrabold text-slate-100 block leading-tight">{errorMsg}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Mobile Header */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-[60]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-indigo-500/10 shrink-0 border border-slate-800 overflow-hidden p-0.5">
            <img src={logoUrl || defaultLogo} alt="Logo" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
          </div>
          <span className="font-black text-sm">{restaurantName}</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[65] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-64 bg-slate-900 border-l border-slate-800 z-[70] transform transition-transform duration-300 lg:relative lg:transform-none lg:z-auto lg:flex flex-col shadow-2xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="p-8 flex items-center gap-3.5 border-b border-slate-800">
          <div className="w-11 h-11 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-indigo-500/10 shrink-0 border border-slate-800 overflow-hidden p-0.5 transform hover:scale-105 transition-transform duration-200">
            <img src={logoUrl || defaultLogo} alt="Logo" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h1 className="text-lg font-black leading-none">{restaurantName}</h1>
            <p className="text-[10px] text-slate-500 font-mono mt-1.5 uppercase tracking-normal">لوحة الإدارة</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as TabType);
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all group relative",
                activeTab === item.id 
                  ? theme.sidebarActiveBg 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-pill" 
                  className="mr-auto w-1.5 h-1.5 rounded-full bg-white" 
                />
              )}
              {item.live && (
                <span className="mr-auto flex h-2 w-2">
                  <span className={cn(
                    "animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75",
                    activeTab === item.id ? "bg-white" : "bg-emerald-400"
                  )}></span>
                  <span className={cn(
                    "relative inline-flex rounded-full h-2 w-2",
                    activeTab === item.id ? "bg-white" : "bg-emerald-500"
                  )}></span>
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 hover:text-red-400 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-h-screen relative overflow-y-auto">

        <div className="max-w-screen-2xl mx-auto p-4 lg:p-10">
          {isExpired && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mb-8 p-6 rounded-[2rem] bg-gradient-to-br from-red-500/10 via-orange-500/5 to-slate-950/40 border-2 border-red-500/20 shadow-2xl relative overflow-hidden text-right"
              dir="rtl"
            >
              <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-600"></div>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0 text-red-400">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-base font-black text-rose-400 tracking-tight">وضع الإشراف الحصري: واجهة الزبائن والموظفين مغلقة ⚠️</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">حالة الاشتراك غير نشطة</p>
                  </div>
                  <p className="text-slate-300 text-xs md:text-sm font-bold leading-relaxed">
                    نود إفادتك بأن رابط تقديم الطلبات مغلق تماماً في وجوه الزبائن، والعمل الجماعي للموظفين معطّل حالياً وذلك لوجود: <span className="text-rose-400 font-extrabold">{suspensionReason}</span>.
                  </p>
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-xs space-y-2 text-slate-400">
                    <div className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                      <span><strong className="text-indigo-400 font-extrabold">استثناء المالك الرئيسي:</strong> تم منحك حق الوصول الكامل لقرأة الإحصائيات التاريخية، تصدير البيانات ومراجعة إعدادات متجرك بحرّية تامة لتجنب انقطاع سجلاتك الحيوية.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                      <span><strong className="text-emerald-400 font-extrabold">طريقة التنشيط الفوري:</strong> يرجى التواصل فوراً مع إدارة المنصة (المالك العام) لتجديد الاشتراك أو سداد الترخيص اللازم، وسيعود متجرك لاستقبال طلبات الزبائن والمبيعات ثوانٍ معدودة بعد السداد!</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {desktopPermission !== "granted" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mb-8 p-5 rounded-[2rem] border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-slate-900/40 to-slate-950 text-right flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xl relative overflow-hidden"
              dir="rtl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                  <Bell className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-amber-400">🚨 تنبيه هام: إشعارات المتصفح غير مفعّلة في الخلفية!</h4>
                  <p className="text-slate-300 text-xs font-bold leading-relaxed">
                    لن تتمكن من استلام الطلبات الجديدة أو تحديثات الزبائن الفورية في الخلفية في حال إغلاق التطبيق أو مغادرة الصفحة. يرجى تنشيط الإشعار فوراً.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={requestNotificationPermission}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 border border-transparent text-xs font-black text-slate-950 transition-all duration-155 cursor-pointer active:scale-95 shadow-lg shadow-amber-500/25"
                >
                  🔔 تفعيل الإشعارات الآن
                </button>
              </div>
            </motion.div>
          )}

          {showExpiryWarning && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`mb-8 p-6 rounded-[2rem] border-2 shadow-2xl relative overflow-hidden text-right flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
                expiryWarningLevel === 3 
                  ? "bg-gradient-to-br from-red-500/10 via-red-950/5 to-slate-950/40 border-red-500/30" 
                  : expiryWarningLevel === 2 
                    ? "bg-gradient-to-br from-orange-500/10 via-orange-950/5 to-slate-950/40 border-orange-500/30" 
                    : "bg-gradient-to-br from-indigo-500/10 via-indigo-950/5 to-slate-950/40 border-indigo-500/20"
              }`}
              dir="rtl"
            >
              <div className={`absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r ${
                expiryWarningLevel === 3 
                  ? "from-red-500 via-rose-500 to-red-600" 
                  : expiryWarningLevel === 2 
                    ? "from-orange-500 via-amber-500 to-orange-600" 
                    : "from-indigo-500 via-purple-500 to-indigo-600"
              }`}></div>
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  expiryWarningLevel === 3 
                    ? "bg-red-500/10 text-red-400 border border-red-500/25 animate-bounce" 
                    : expiryWarningLevel === 2 
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/25 animate-pulse" 
                      : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25"
                }`}>
                  <AlertCircle className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-1">
                  <h4 className={`text-sm font-black ${
                    expiryWarningLevel === 3 
                      ? "text-red-400" 
                      : expiryWarningLevel === 2 
                        ? "text-orange-400" 
                        : "text-indigo-400"
                  }`}>
                    {expiryWarningLevel === 3 
                      ? "تنبيه خطوة أخيرة: ينتهي ترخيص المتجر اليوم! 🚨" 
                      : expiryWarningLevel === 2 
                        ? "تنبيه هام: متبقي أقل من 3 أيام لتجديد الاشتراك! ⚠️" 
                        : "تذكير: يقترب انتهاء الاشتراك السنوي/التجريبي 📅"}
                  </h4>
                  <p className="text-slate-300 text-xs font-bold leading-relaxed">
                    {expiryWarningLevel === 3 
                      ? `متبقي أقل من 24 ساعة فقط (${getRemainingTimeText()}) على توقف ترخيص متجركم بالكامل. نرجو المسارعة بسداد الرسوم لتجنب انقطاع المبيعات وعمل الموظفين.` 
                      : expiryWarningLevel === 2 
                        ? `عليك سداد الفاتورة المعلقة خلال يومين كحد أقصى لتجنب الإغلاق لزبائنك (${getRemainingTimeText()}). تواصل مع مالك المنصة للتنشيط.` 
                        : `نود لفت انتباهك بأن الاشتراك شارف على الانتهاء (${getRemainingTimeText()}). نوفر لك إمكانية الدفع والتجديد المبكر لتفادي توقف الخدمة.`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.setItem(`dismissed_expiry_warning_${expiryWarningLevel}_${orgId}`, "true");
                    setDismissedWarningMap(prev => ({ ...prev, [expiryWarningLevel]: true }));
                  }
                }}
                className="px-4 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-xs font-black text-slate-400 hover:text-white transition-all duration-150 cursor-pointer active:scale-95 shrink-0 self-end md:self-center"
              >
                تجاهل مؤقت ×
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === "live" && (
              <motion.div
                key="live-page"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl font-black">المراقبة الحية</h2>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-slate-500 text-sm">متابعة فورية للطلبات النشطة في النظام</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {orders.filter(o => o.status !== "completed").map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden"
                  >
                    <div className={cn(
                      "absolute top-0 right-0 h-1 w-full",
                      order.status === "pending" ? "bg-amber-500" : 
                      order.status === "accepted" ? "bg-blue-500" : 
                      order.status === "ready" ? "bg-emerald-500" : 
                      order.status === "delivering" ? "bg-teal-500" : "bg-red-500"
                    )} />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-right">
                        <div className="flex flex-wrap items-center gap-1.5 justify-start">
                          <h4 className="font-bold text-base leading-tight text-white">{order.customerName}</h4>
                          {order.customerPhone && (
                            <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800 shrink-0">
                              <span className="text-[9.5px] text-slate-300 font-mono font-black" dir="ltr">
                                {order.customerPhone}
                              </span>
                              <a 
                                href={`https://wa.me/${order.customerPhone.replace(/[\s+()-]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-1.5 py-0.5 hover:bg-emerald-500/20 text-emerald-400 rounded transition-all text-[9.5px] leading-none shrink-0 font-sans"
                                title="مراسلة سريعة عبر الواتساب"
                              >
                                💬 واتساب
                              </a>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">#{order.id.slice(-6).toUpperCase()}</p>
                      </div>
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        order.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                        order.status === "accepted" ? "bg-blue-500/10 text-blue-500" :
                        order.status === "ready" ? "bg-emerald-500/10 text-emerald-500" : 
                        order.status === "delivering" ? "bg-teal-500/10 text-teal-400 animate-pulse border border-teal-500/15" : "bg-red-500/10 text-red-500 cursor-default"
                      )}>
                        {order.status === "pending" && "قيد الانتظار"}
                        {order.status === "accepted" && "جاري التحضير"}
                        {order.status === "ready" && "جاهز للتسليم"}
                        {order.status === "delivering" && "جاري التوصيل 🚚"}
                        {order.status === "cancelled" && "تم الإلغاء"}
                        {order.status === "completed" && "تم التسليم"}
                      </span>
                    </div>

                    {order.chatRequested && (
                      <div className="mb-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-2.5 rounded-2xl text-[10px] font-black flex items-center justify-between gap-1.5 animate-pulse" dir="rtl">
                        <div className="flex items-center gap-1.5 font-sans">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                          <span>💬 العميل يطلب فتح المحادثة</span>
                        </div>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const orderRef = doc(db, "organizations", orgId, "orders", order.id);
                              await updateDoc(orderRef, { chatRequested: false });
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 rounded text-amber-300 hover:text-white text-[9px] transition-all font-bold cursor-pointer font-sans"
                        >
                          استبعاد
                        </button>
                      </div>
                    )}

                    {order.deliveryDate && (
                      <div className="flex items-center gap-1.5 mb-2 bg-indigo-500/15 border border-indigo-500/20 p-2 rounded-xl text-indigo-400 text-xs font-mono justify-end">
                        <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="font-bold text-slate-400 ml-1">موعد الاستلام المطلوب:</span>
                        <span className="font-black">
                          {order.deliveryDate === "اليوم" 
                            ? "اليوم" 
                            : (() => {
                                try {
                                  return format(new Date(order.deliveryDate), "yyyy-MM-dd hh:mm a", { locale: ar });
                                } catch (e) {
                                  return order.deliveryDate;
                                }
                              })()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mb-3 p-2 rounded-xl text-xs font-bold justify-end border bg-slate-950 border-slate-800/60 leading-none">
                      {order.fulfillmentType === "delivery" ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>توصيل الطلب للموقع</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-500">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>الاستلام بنفسي من الفرع</span>
                        </div>
                      )}
                    </div>

                    {order.fulfillmentType === "delivery" && (order.addressManual || order.addressLocation) && (
                      <div className="space-y-2 mb-3 p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl text-right">
                        {order.addressManual && (
                          <div className="text-right">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block">العنوان المكتوب:</span>
                            <span className="text-xs text-slate-200 font-bold leading-relaxed">{order.addressManual}</span>
                          </div>
                        )}
                        {order.addressLocation && (
                          <div className="text-right pt-2 border-t border-slate-800/20 mt-1 flex flex-col sm:flex-row-reverse sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-500 block">الموقع الجغرافي (GPS):</span>
                              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px] inline-block text-left" dir="ltr">{order.addressLocation}</span>
                            </div>
                            <a 
                              href={order.addressLocation} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-xl border border-emerald-500/15 w-full sm:w-auto"
                            >
                              📍 فتح في خرائط جوجل
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mb-6">
                      <ItemTransferAssistant 
                        orderId={order.id} 
                        itemsText={order.items || ""} 
                        customerName={order.customerName}
                        orderStatus={order.status}
                        onAllItemsTransferred={
                          order.status === "accepted" 
                            ? () => {
                                const nextStatus = (order.fulfillmentType === "delivery" && deliveryEnabled) ? "delivering" : "ready";
                                handleUpdateOrderStatus(order.id, nextStatus);
                              }
                            : undefined
                        }
                      />
                    </div>

                    {/* Quick Invoice Details (Inform & Proceed) */}
                    {order.status !== "pending" && order.status !== "cancelled" && (
                      <div className="mb-4 bg-slate-1050/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-2.5 text-right">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>كشف الحساب الفوري (أبلغ واستمر)</span>
                          </span>
                          <button 
                            onClick={() => {
                              setPricingOrder(order);
                              setPricingItemsPrice(order.totalPrice ? order.totalPrice.toString() : "");
                              setPricingDeliveryPrice(order.deliveryPrice !== undefined ? order.deliveryPrice.toString() : "");
                              setPricingNotesVal(order.pricingNotes || "");
                            }}
                            className="text-[10px] font-black text-indigo-400 hover:text-indigo-350 transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/15 active:scale-95 cursor-pointer"
                          >
                            {order.totalPrice !== undefined ? "✏️ تعديل الحساب" : "➕ إعداد الفاتورة السريعة"}
                          </button>
                        </div>
                        {order.totalPrice !== undefined ? (
                          <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 space-y-1.5 text-xs font-semibold font-mono" dir="rtl">
                            <div className="flex justify-between text-slate-300">
                              <span className="font-bold">قيمة السلع والقطع:</span>
                              <span className="text-slate-100 font-bold">{order.totalPrice} {getCurrencyLabel(currency)}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span className="font-bold">رسوم التوصيل/الخدمة:</span>
                              <span className="text-slate-100 font-bold">{order.deliveryPrice || 0} {getCurrencyLabel(currency)}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-800 pt-1.5 font-black">
                              <span className="text-indigo-400 font-black">الإجمالي الكلي:</span>
                              <span className="text-indigo-400 text-sm font-black">{(order.totalPrice || 0) + (order.deliveryPrice || 0)} {getCurrencyLabel(currency)}</span>
                            </div>
                            {order.pricingNotes && (
                              <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-1.5 font-bold leading-normal truncate" title={order.pricingNotes}>
                                <span className="text-slate-400 block font-black mb-0.5">تفاصيل التسعير:</span>
                                {order.pricingNotes}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-2 text-[10px] text-slate-500 font-bold border border-dashed border-slate-850 rounded-xl bg-slate-950/40">
                            💡 لم يتم تسعير الطلب للعميل بعد. انقر لتحديد السعر وإعلامه فورا.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Remote Payment Status Banner (Admin Action Hub) */}
                    {order.fulfillmentType === "delivery" && order.totalPrice !== undefined && (
                      <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 mb-3 text-right text-xs">
                        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-850">
                          <span className="font-black text-white flex items-center gap-1">
                            <span>💳</span>
                            <span>مدفوعات الفاتورة البنكية</span>
                          </span>
                          {order.paymentStatus === "checking" && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black animate-pulse">
                              جاري التشييك... ⏳
                            </span>
                          )}
                          {order.paymentStatus === "paid" && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black">
                              تم الدفع وعمد ✔
                            </span>
                          )}
                          {(!order.paymentStatus || order.paymentStatus === "unpaid") && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-750 text-slate-400 text-[9px] font-black">
                              غير مدفوع 💸
                            </span>
                          )}
                        </div>

                        {order.paymentStatus === "checking" ? (
                          <div className="space-y-2">
                            <p className="text-[10px] text-amber-300 font-bold leading-normal">
                              ⚠️ العميل قام بتحويل القيمة ويطلب التأكيد. تحقق من وصول الحوالة المصرفية للإدارة أولاً:
                            </p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const ref = doc(db, "organizations", orgId, "orders", order.id);
                                    const existingChat = order.chat || [];
                                    await updateDoc(ref, {
                                      paymentStatus: "paid",
                                      chat: [...existingChat, {
                                        sender: "system",
                                        senderName: "النظام",
                                        text: "✅ تم قبول واعتماد دفعتك البنكية بنجاح من قبل الإدارة. جاري تسليم الطلب للتوصيل فوراً.",
                                        createdAt: new Date().toISOString()
                                      }],
                                      updatedAt: serverTimestamp()
                                    });
                                    showToast("تم اعتماد الدفع بنجاح! 🎉");
                                  } catch (err) {
                                    console.error(err);
                                    showToast("فشل اعتماد الدفع", true);
                                  }
                                }}
                                className="flex-1 bg-emerald-650 hover:bg-emerald-500 text-white font-bold py-1.5 rounded text-[10px] transition-all"
                              >
                                موافقة على الدفع ✅
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm("هل تريد رفض عملية الدفع وإبلاغ العميل بمراجعة حوالته؟")) {
                                    try {
                                      const ref = doc(db, "organizations", orgId, "orders", order.id);
                                      const existingChat = order.chat || [];
                                      await updateDoc(ref, {
                                        paymentStatus: "unpaid",
                                        chat: [...existingChat, {
                                          sender: "system",
                                          senderName: "النظام",
                                          text: "❌ تم رفض عملية الدفع البنكية من قبل الإدارة. يرجى مراجعة الحوالة المصرفية والتحويل مجدداً بشكل صحيح.",
                                          createdAt: new Date().toISOString()
                                        }],
                                        updatedAt: serverTimestamp()
                                      });
                                      showToast("تم رفض الدفعة بنجاح");
                                    } catch (err) {
                                      console.error(err);
                                      showToast("فشل إلغاء الدفع", true);
                                    }
                                  }
                                }}
                                className="bg-red-500/10 hover:bg-red-550 text-red-500 hover:text-white font-bold py-1.5 px-3 rounded text-[10px] transition-all"
                              >
                                رفض الدفع ❌
                              </button>
                            </div>
                          </div>
                        ) : order.paymentStatus === "paid" ? (
                          <div className="space-y-1 text-[10px] text-slate-400 font-semibold leading-relaxed">
                            <p className="text-emerald-400 font-bold">🎯 تم استلام وإيداع المبلغ المالي كاملاً.</p>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const ref = doc(db, "organizations", orgId, "orders", order.id);
                                  await updateDoc(ref, {
                                    paymentStatus: "unpaid",
                                    updatedAt: serverTimestamp()
                                  });
                                  showToast("تم التراجع عن الاعتماد بنجاح");
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="text-red-400 hover:text-red-300 underline font-normal mt-1 cursor-pointer"
                            >
                              التراجع عن اعتماد الدفع؟
                            </button>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 font-semibold">
                            ⏳ في انتظار قيام العميل بالتحويل وإعلان "تم الدفع"...
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mb-4">
                      {order.status === "pending" && (
                        <>
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, "accepted")}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-2 rounded-lg transition-all"
                          >
                            قبول
                          </button>
                          <button 
                            onClick={() => setOrderToCancel(order)}
                            className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold py-2 px-3 rounded-lg transition-all"
                            title="refuse-order"
                          >
                            رفض
                          </button>
                        </>
                      )}
                      {order.status === "accepted" && (
                        <>
                          {order.fulfillmentType === "delivery" && deliveryEnabled ? (
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, "delivering")}
                              className="flex-1 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold py-2 rounded-lg transition-all"
                            >
                              بدء التوصيل 🚚
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, "ready")}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-2 rounded-lg transition-all"
                            >
                              تجهيز
                            </button>
                          )}
                          <button 
                            onClick={() => setOrderToCancel(order)}
                            className="bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 text-[10px] font-bold py-2 px-3 rounded-lg transition-all"
                            title="cancel-process"
                          >
                            إلغاء
                          </button>
                        </>
                      )}
                      {order.status === "ready" && (
                        <>
                          {order.fulfillmentType === "delivery" && deliveryEnabled ? (
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, "delivering")}
                              className="flex-1 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-bold py-2 rounded-lg transition-all"
                            >
                              تسليم المندوب 🚚
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, "completed")}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-2 rounded-lg transition-all"
                            >
                              تسليم
                            </button>
                          )}
                          <button 
                            onClick={() => setOrderToCancel(order)}
                            className="bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 text-[10px] font-bold py-2 px-3 rounded-lg transition-all"
                            title="cancel-process"
                          >
                            إلغاء
                          </button>
                        </>
                      )}
                      {order.status === "delivering" && (
                        <>
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, "completed")}
                            className="flex-1 bg-emerald-650 hover:bg-emerald-500 text-white text-[10px] font-bold py-2 rounded-lg transition-all"
                          >
                            تأكيد التوصيل ✔
                          </button>
                          <button 
                            onClick={() => setOrderToCancel(order)}
                            className="bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 text-[10px] font-bold py-2 px-3 rounded-lg transition-all"
                            title="cancel-process"
                          >
                            إلغاء
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => {
                          setSingleOrderToDelete(order);
                        }}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all border border-transparent"
                        title="حذف الطلب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {orgData?.subscriptionTier === "tier1" ? (
                        <a 
                          href={order.customerPhone ? `https://wa.me/${order.customerPhone.replace(/[\s+()-]/g, '')}` : "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all border border-transparent flex items-center gap-1.5 cursor-pointer text-[10px] font-sans font-bold"
                          title="مراسلة العميل عبر واتساب مباشرة"
                        >
                          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                          <span>الواتساب 💬</span>
                        </a>
                      ) : (
                        <button 
                          onClick={() => {
                            // Check Tier 2 chat limit
                            if (orgData?.subscriptionTier === "tier2") {
                              const chatActiveOrdersCount = orders.filter(o => o.chat && o.chat.length > 1).length;
                              if (chatActiveOrdersCount >= 50 && (!order.chat || order.chat.length <= 1)) {
                                showToast("لقد استنفدت حد المحادثات المتاح للباقة المتقدمة (50 عميل شهرياً)! يرجى ترقية الترخيص السنوي للباقة الاحترافية لمحادثات غير محدودة.", true);
                                return;
                              }
                            }
                            setExpandedChatOrderId(expandedChatOrderId === order.id ? null : order.id);
                          }}
                          className={cn(
                            "p-2 rounded-lg transition-all relative border",
                            expandedChatOrderId === order.id 
                              ? "bg-indigo-605 text-white border-transparent" 
                              : "bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300"
                          )}
                          title="الدردشة مع العميل"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {order.chat && order.chat.length > 0 && order.chat[order.chat.length - 1]?.sender === "customer" ? (
                            <>
                              <span className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-rose-555 rounded-full animate-ping" />
                              <span className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-rose-500 rounded-full" />
                            </>
                          ) : order.chatRequested ? (
                            <>
                              <span className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                              <span className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-amber-100/40 rounded-full animate-pulse" />
                            </>
                          ) : null}
                        </button>
                      )}
                    </div>

                    {/* Expandable Order Chat Panel */}
                    <AnimatePresence>
                      {expandedChatOrderId === order.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-slate-800/80 pt-3 mt-1.5 mb-4 overflow-hidden text-right"
                          dir="rtl"
                        >
                          <div className="flex flex-col gap-1.5 mb-2.5 px-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-indigo-400 flex items-center gap-1">
                                <span>💬 دردشة مباشرة مع العميل</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const orderRef = doc(db, "organizations", orgId, "orders", order.id);
                                      await updateDoc(orderRef, {
                                        chatMuted: !order.chatMuted
                                      });
                                    } catch (err) {
                                      console.error("Error toggling chatMuted:", err);
                                    }
                                  }}
                                  className={cn(
                                    "px-2 py-0.5 rounded-lg text-[9px] font-black transition-all flex items-center gap-1 active:scale-95 border",
                                    order.chatMuted 
                                      ? "bg-rose-500/15 hover:bg-rose-555 text-rose-400 border-rose-500/20" 
                                      : "bg-slate-900 hover:bg-slate-850 text-slate-400 border-slate-800"
                                  )}
                                >
                                  {order.chatMuted ? "🔇 إلغاء كتم العميل" : "🔇 كتم دردشة العميل"}
                                </button>
                                <span className="text-[9px] text-slate-500 font-mono">#{order.id.slice(-4).toUpperCase()}</span>
                              </div>
                            </div>
                            
                            {orgData?.subscriptionTier === "tier2" && (
                              <div className="bg-amber-500/15 border border-amber-500/20 p-2.5 rounded-2xl text-[10px] text-slate-350 font-semibold leading-relaxed">
                                ⚠️ <span className="text-amber-500 font-black">كوتة الباقة المتقدمة (Standard):</span> تشتمل هذه الباقة على ليميت 50 محادثة عملاء نشطة شهرياً فقط. للتخلص من أي حدود، تفضل بترقية ترخيص المنشأة السنوي للباقة الاحترافية.
                              </div>
                            )}
                            {orgData?.subscriptionTier === "tier3" && (
                              <div className="bg-emerald-500/10 border border-emerald-500/15 p-2 rounded-xl text-[9px] text-emerald-400 font-bold flex items-center justify-between">
                                <span>🎯 الباقة الاحترافية نشطة: دردشة مباشرة متكاملة مفتوحة بلا حدود</span>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-bold border border-emerald-500/30">Unlimited</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Messages scrolling list */}
                          <div className="bg-slate-950 rounded-xl p-3 border border-slate-900 overflow-y-auto max-h-[160px] space-y-2 mb-2 custom-scrollbar flex flex-col">
                            {(!order.chat || order.chat.length === 0) ? (
                              <div className="text-center py-5 text-slate-655 text-[10px] font-bold">
                                لا توجد رسائل سابقة. أرسل رسالة للعميل حول هذا الطلب.
                              </div>
                            ) : (
                              order.chat.map((msg: any, idx: number) => {
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
                                      <span className="bg-slate-900 text-slate-500 text-[9px] px-2 py-0.5 rounded-full border border-slate-850 font-semibold my-0.5">
                                        {msg.text}
                                      </span>
                                    ) : (
                                      <div className="max-w-[85%]">
                                        <span className="text-[9px] text-slate-500 block mb-0.5 px-1 font-semibold leading-none text-right">
                                          {isCustomer ? "الزبون" : msg.senderName || "الإدارة"}
                                        </span>
                                        <p className={cn(
                                          "px-2.5 py-1.5 rounded-2xl break-words leading-relaxed text-right font-semibold text-[11px]",
                                          isCustomer 
                                            ? "bg-slate-900 border border-slate-800 text-slate-200 rounded-tr-none" 
                                            : "bg-indigo-600 text-white rounded-tl-none"
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

                          {/* Chat text input form */}
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const form = e.currentTarget;
                              const input = form.elements.namedItem("chatText") as HTMLInputElement;
                              const text = input.value.trim();
                              if (!text) return;
                              
                              try {
                                const orderRef = doc(db, "organizations", orgId, "orders", order.id);
                                const newMsg = {
                                  sender: "staff",
                                  senderName: "الإدارة",
                                  text,
                                  createdAt: new Date().toISOString()
                                };
                                await updateDoc(orderRef, {
                                  chat: [...(order.chat || []), newMsg],
                                  chatRequested: false
                                });
                                fetch("/api/notify-new-chat", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    orgId,
                                    orderId: order.id,
                                    sender: "staff",
                                    senderName: "الإدارة",
                                    text,
                                    restaurantName
                                  })
                                }).catch(err => console.error("Error triggering admin chat push:", err));
                                input.value = "";
                              } catch (err) {
                                console.error("Failed to send message:", err);
                              }
                            }}
                            className="flex gap-1.5 animate-fadeIn"
                          >
                            <input
                              type="text"
                              name="chatText"
                              placeholder="اكتب رسالة للعميل..."
                              required
                              className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-505 text-white placeholder-slate-650"
                              autoComplete="off"
                            />
                            <button
                              type="submit"
                              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shrink-0"
                            >
                              إرسال
                            </button>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.createdAt && typeof order.createdAt.toDate === 'function' ? format(order.createdAt.toDate(), "HH:mm") : "---"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span className="truncate max-w-[80px]">
                          {order.staffName || "في الانتظار"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {orders.filter(o => o.status !== "completed").length === 0 && (
                  <div className="col-span-full py-20 text-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[2rem]">
                    <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">لا يوجد طلبات نشطة حالياً</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black">سجل الطلبات</h2>
                <p className="text-slate-500 text-sm">مراجعة كاملة لجميع العمليات السابقة والمكتملة</p>
              </div>

              {/* Orders Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <h2 className="text-lg md:text-xl font-black text-slate-200">سجل الطلبات التفصيلي</h2>
                    <button
                      type="button"
                      onClick={exportCompletedOrdersToExcel}
                      className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 font-extrabold text-[11px] py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer font-sans"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                      <span>تصدير الطلبات المكتملة (Excel)</span>
                    </button>
                  </div>
                  <div className="relative hidden sm:block">
                    <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="بحث..." 
                      className="bg-slate-950 border border-slate-800 rounded-lg py-1.5 pr-10 pl-4 text-xs font-mono outline-none focus:border-indigo-500 tracking-normal"
                    />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-slate-950/50 text-[10px] uppercase font-black tracking-normal text-slate-500">
                        <th className="px-6 py-4">العميل</th>
                        <th className="px-6 py-4 text-center">المسؤول الحالي</th>
                        <th className="px-6 py-4 text-center">التتبع (الموظفين)</th>
                        <th className="px-6 py-4 text-center">الحالة</th>
                        <th className="px-6 py-4 text-center">التوقيت</th>
                        <th className="px-6 py-4 text-center">خيارات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-sm">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-950/50 transition-colors">
                          <td className="px-6 py-4 font-bold">
                            <div className="flex flex-col">
                              <span>{o.customerName}</span>
                              <span className="text-[10px] text-slate-500 font-mono">#{o.id.slice(-4)}</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {o.deliveryDate && (
                                  <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                    {o.deliveryDate === "اليوم" 
                                      ? "الاستلام اليوم" 
                                      : (() => {
                                          try {
                                            return format(new Date(o.deliveryDate), "yyyy-MM-dd hh:mm a", { locale: ar });
                                          } catch (e) {
                                            return o.deliveryDate;
                                          }
                                        })()}
                                  </span>
                                )}
                                {o.fulfillmentType === "delivery" ? (
                                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <Truck className="w-2.5 h-2.5" /> توصيل
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <MapPin className="w-2.5 h-2.5" /> استلام بنفسي
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-slate-400">
                             <div className="flex flex-col items-center">
                               <span className="font-bold text-slate-200">{o.staffName || "---"}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-wrap justify-center gap-2">
                              {o.acceptedBy && (
                                <div className="bg-amber-500/5 border border-amber-500/10 px-2 py-1 rounded text-[9px]">
                                  <span className="text-slate-500 block">قبول:</span>
                                  <span className="text-amber-500 font-bold">{o.acceptedBy}</span>
                                </div>
                              )}
                              {o.preparedBy && (
                                <div className="bg-blue-500/5 border border-blue-500/10 px-2 py-1 rounded text-[9px]">
                                  <span className="text-slate-500 block">تجهيز:</span>
                                  <span className="text-blue-500 font-bold">{o.preparedBy}</span>
                                </div>
                              )}
                              {o.dispatchedBy && (
                                <div className="bg-teal-500/5 border border-teal-500/10 px-2 py-1 rounded text-[9px]">
                                  <span className="text-slate-500 block">توصيل:</span>
                                  <span className="text-teal-500 font-bold">{o.dispatchedBy}</span>
                                </div>
                              )}
                              {o.deliveredBy && (
                                <div className="bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded text-[9px]">
                                  <span className="text-slate-500 block">تسليم:</span>
                                  <span className="text-emerald-500 font-bold">{o.deliveredBy}</span>
                                </div>
                              )}
                              {!o.acceptedBy && !o.preparedBy && !o.dispatchedBy && !o.deliveredBy && <span className="text-slate-600">---</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap",
                              o.status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
                              o.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                              o.status === "accepted" ? "bg-blue-500/10 text-blue-500" :
                              o.status === "ready" ? "bg-emerald-500/10 text-emerald-400" :
                              o.status === "delivering" ? "bg-teal-500/10 text-teal-400 animate-pulse border border-teal-500/15" :
                              o.status === "cancelled" ? "bg-red-500/10 text-red-500" : "bg-slate-800 text-slate-400"
                            )}>
                              {o.status === "pending" && "قيد الانتظار"}
                              {o.status === "accepted" && "جاري التحضير"}
                              {o.status === "ready" && "جاهز للتسليم"}
                              {o.status === "delivering" && "جاري التوصيل 🚚"}
                              {o.status === "completed" && "تم التسليم"}
                              {o.status === "cancelled" && "تم الإلغاء"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-[10px] font-mono text-slate-500">
                            {o.createdAt && typeof o.createdAt.toDate === 'function' 
                              ? format(o.createdAt.toDate(), "HH:mm", { locale: ar }) 
                              : "---"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => {
                                setSingleOrderToDelete(o);
                              }}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                              title="حذف الطلب"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <div className="p-20 text-center text-slate-600 font-bold uppercase tracking-normal text-xs">
                      لا يوجد طلبات مسجلة حالياً
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "staff" && (
            <motion.div
              key="staff-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 border border-slate-800 p-6 rounded-3xl gap-4">
                <div>
                  <h2 className="text-2xl font-black">إدارة الكادر التشغيلي</h2>
                  <p className="text-slate-500 text-sm mt-1">إضافة، تعديل، وحذف بيانات الموظفين وصلاحياتهم</p>
                </div>
                <button 
                  onClick={() => {
                    const tier = orgData?.subscriptionTier || "tier1";
                    if (tier === "tier1" && staff.length >= 1) {
                      showToast("الباقة الاقتصادية تسمح بموظف تشغيلي واحد فقط! يرجى ترقية باقتك لإضافة المزيد.", true);
                      return;
                    }
                    if (tier === "tier2" && staff.length >= 4) {
                      showToast("الباقة المتقدمة تسمح بـ 4 موظفين فقط! يرجى ترقية الترخيص للباقة الاحترافية لإضافة المزيد.", true);
                      return;
                    }
                    setShowAddStaff(true);
                  }}
                  className={cn(
                    "w-full md:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg text-xs md:text-sm",
                    ((orgData?.subscriptionTier || "tier1") === "tier1" && staff.length >= 1) || ((orgData?.subscriptionTier || "tier1") === "tier2" && staff.length >= 4)
                      ? "bg-slate-800 text-slate-500 hover:bg-slate-800 border border-slate-755 cursor-not-allowed opacity-60 shadow-none"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-95"
                  )}
                >
                  <UserPlus className="w-5 h-5" />
                  <span>إضافة موظف</span>
                  {(((orgData?.subscriptionTier || "tier1") === "tier1" && staff.length >= 1) || ((orgData?.subscriptionTier || "tier1") === "tier2" && staff.length >= 4)) && (
                    <span className="text-[9px] bg-red-500/15 border border-red-500/20 text-rose-400 px-2 py-0.5 rounded-lg flex items-center gap-1 font-black">
                      🔒 مغلق
                    </span>
                  )}
                </button>
              </div>

              {/* Team Subscription Restrictions */}
              {orgData?.subscriptionTier === "tier1" && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-3xl flex items-center justify-between gap-3 text-right" dir="rtl">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/15">⚠️ قيود الباقة الاقتصادية (Basic)</span>
                    <p className="text-xs text-slate-300 font-bold">مسموح لك بموظف تشغيلي إضافي واحد فقط (حساب فريق عمل نشط). يرجى ترقية الاشتراك لإتاحة إضافة حسابات إضافية.</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-500 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">{staff.length} / 1</span>
                </div>
              )}
              {orgData?.subscriptionTier === "tier2" && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-3xl flex items-center justify-between gap-3 text-right" dir="rtl">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-400/15">ℹ️ قيود الباقة المتقدمة (Standard)</span>
                    <p className="text-xs text-slate-300 font-bold">مسموح لك بزيادة حتى 4 حسابات كحد أقصى لكادر العمل التشغيلي. للتشغيل اللامحدود، تفضل بالترقية للباقة الاحترافية.</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">{staff.length} / 4</span>
                </div>
              )}
              {orgData?.subscriptionTier === "tier3" && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl flex items-center justify-between gap-3 text-right" dir="rtl">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-400/15">🎯 ميزات الباقة الاحترافية (Unlimited)</span>
                    <p className="text-xs text-slate-300 font-bold">حق الكادر مفتوح لديك بالكامل للتشغيل من مختلف الأجهزة بلا قيود وبلا كوتة أعداد.</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">{staff.length} / ∞</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {staffStats.map((s) => (
                    <motion.div
                      key={s.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative group overflow-hidden"
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 font-black text-lg">
                          {s.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{s.name}</h4>
                          <p className="text-[10px] text-slate-500 uppercase tracking-normal font-black">{s.role}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                           <p className="text-[9px] uppercase font-black text-slate-600 mb-1">تم القبول</p>
                           <p className="font-mono text-sm text-amber-400 font-black">{s.acceptedCount}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                           <p className="text-[9px] uppercase font-black text-slate-600 mb-1">تم التجهيز</p>
                           <p className="font-mono text-sm text-blue-400 font-black">{s.preparedCount}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                           <p className="text-[9px] uppercase font-black text-slate-600 mb-1">تم التسليم</p>
                           <p className="font-mono text-sm text-emerald-400 font-black">{s.deliveredCount}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                           <p className="text-[9px] uppercase font-black text-slate-600 mb-1">الرمز السري</p>
                           <p className="font-mono text-sm text-indigo-400 font-black">{s.passcode}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => setEditingStaff(s)}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <Edit className="w-4 h-4" /> تعديل
                        </button>
                        <button 
                          onClick={() => setStaffToDelete(s)}
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <Trash2 className="w-4 h-4" /> حذف
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {staff.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl">
                     <Users className="w-12 h-12 mx-auto text-slate-700 mb-4" />
                     <p className="text-slate-500 font-bold">لم يتم إضافة موظفين بعد</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div
              key="stats-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black">تحليل الأداء</h2>
                <p className="text-slate-500">إحصائيات تفصيلية عن المبيعات والإنتاجية</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "إجمالي الطلبات", val: totalOrders, icon: BarChart3, color: "bg-blue-500" },
                  { label: "طلبات نشطة", val: activeOrders, icon: Clock, color: "bg-amber-500" },
                  { label: "طلبات مكتملة", val: completedOrders, icon: CheckCircle, color: "bg-emerald-500" },
                  { label: "نسبة الإنجاز", val: `${totalOrders ? Math.round((completedOrders/totalOrders)*100) : 0}%`, icon: TrendingUp, color: "bg-indigo-500" },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-normal text-slate-500 mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black">{stat.val}</h3>
                      </div>
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", stat.color)}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
                 <TrendingUp className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                 <p className="text-slate-500 font-bold mb-8">إحصائيات الموظفين</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {staffStats.map(s => (
                     <div key={s.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-right">
                       <div className="flex justify-between items-center mb-4">
                         <span className="text-indigo-400 font-black">{s.name}</span>
                         <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400">{s.role}</span>
                       </div>
                       <div className="space-y-3">
                         <div className="flex justify-between text-xs">
                           <span className="text-slate-500">تم القبول:</span>
                           <span className="font-bold text-amber-500">{s.acceptedCount}</span>
                         </div>
                         <div className="flex justify-between text-xs">
                           <span className="text-slate-500">تم التجهيز:</span>
                           <span className="font-bold text-blue-500">{s.preparedCount}</span>
                         </div>
                         <div className="flex justify-between text-xs">
                           <span className="text-slate-500">تم التسليم:</span>
                           <span className="font-bold text-emerald-500">{s.deliveredCount}</span>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black">الإعدادات العامة</h2>
                <p className="text-slate-500">تخصيص النظام ومعلومات النشاط التجاري</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 flex items-center justify-between">
                      <span>اسم المنشأة</span>
                      {(orgData?.subscriptionTier === "tier1" || orgData?.subscriptionTier === "tier2") && (
                        <span className="text-[10px] bg-red-500/15 border border-red-500/20 text-rose-400 px-2.5 py-0.5 rounded-lg flex items-center gap-1 font-black">
                          🔒 مغلق (خاص بالباقة الاحترافية)
                        </span>
                      )}
                    </label>
                    <input 
                      type="text"
                      disabled={orgData?.subscriptionTier === "tier1"}
                      className={cn(
                        "w-full bg-slate-950 border rounded-xl px-4 py-3 text-white focus:outline-none transition-colors",
                        (orgData?.subscriptionTier === "tier1")
                          ? "border-slate-900 opacity-60 text-slate-450 cursor-not-allowed bg-slate-950/80" 
                          : "border-slate-800 focus:border-indigo-500"
                      )}
                      value={(orgData?.subscriptionTier === "tier1") ? "quick order @ الطلب السريع" : restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="أدخل اسم المطعم أو المقهى"
                    />
                    {(orgData?.subscriptionTier === "tier1") && (
                      <p className="text-[10px] text-amber-500 font-extrabold mt-1.5 leading-relaxed">
                        ⚠️ اسم المنشأة مثبت تلقائياً على (<span className="font-sans font-black text-rose-400">quick order @ الطلب السريع</span>) في الباقة الاقتصادية. للتحكم الكامل تفضل بالترقية للباقة المتقدمة أو الاحترافية لربط اسم شعارك وهويتك المستقلة.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">رقم الواتساب الخاص بالمنشأة</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono text-left"
                      value={merchantWhatsApp}
                      onChange={(e) => setMerchantWhatsApp(e.target.value)}
                      placeholder="مثال: 96777000000"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      يُستخدم للتواصل المباشر ومراسلتك على الواتساب من قبل عملائك عند تتبع الطلبات أو للباقة الاقتصادية.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">العملة الرسمية للأسعار والطلبات</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all font-semibold text-sm cursor-pointer"
                    >
                      <option value="ريال يمني">ريال يمني (افتراضي)</option>
                      <option value="ريال سعودي">ريال سعودي</option>
                      <option value="دولار">دولار</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-800/60">
                    <h3 className="text-sm font-bold text-indigo-400 mb-4 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#6366f1]" />
                      إعدادات حساب مسؤول المتجر
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2">اسم مستخدم الحساب</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500">
                            <User className="w-4 h-4" />
                          </span>
                          <input 
                            type="text"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                            value={orgUsername}
                            onChange={(e) => setOrgUsername(e.target.value)}
                            placeholder="اسم المستخدم للمتجر"
                          />
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1.5 leading-relaxed">
                          ⚠️ تنبيه: تغيير اسم المستخدم سيقوم فوراً بتغيير معرف تسجيل الدخول الخاص بمتجرك.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2">كلمة مرور الحساب</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500">
                            <Lock className="w-4 h-4" />
                          </span>
                          <input 
                            type="text"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                            value={orgPassword}
                            onChange={(e) => setOrgPassword(e.target.value)}
                            placeholder="كلمة المرور الجديدة"
                          />
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1.5 leading-relaxed">
                          أدخل كلمة مرور قوية مكونة من حروف أو أرقام لا تقل عن 4 عناصر لحماية لوحة القيادة.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Activation option */}
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1 text-right">
                      <div className="flex items-center gap-2 mb-1 justify-start" dir="rtl">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          deliveryEnabled ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                        )}></span>
                        <p className="text-xs font-bold text-slate-200 font-black">خيارات واستقبال خدمة التوصيل</p>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                        عند تمكين هذا الخيار، سيتمكن العميل في واجهة الطلب من اختيار "توصيل للطلب". وإذا تم تعطيله، سيظهر زر التوصيل باهتاً ومغلقاً وسيكون استلام الطلب من الفرع هو الخيار الوحيد النشط افتراضياً.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setDeliveryEnabled(!deliveryEnabled)}
                      className={cn(
                        "w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0 select-none",
                        deliveryEnabled 
                          ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400" 
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700"
                      )}
                    >
                      {deliveryEnabled ? "توصيل الطلبات: مفعّل" : "توصيل الطلبات: معطّل"}
                    </button>
                  </div>

                  {/* مركز إعدادات تنبيهات وإشعارات النظام الذكي */}
                  <div className="pt-6 border-t border-slate-800/60 space-y-4 text-right" dir="rtl">
                    <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2 justify-start">
                      <Bell className="w-4 h-4 text-indigo-400 animate-pulse" />
                      إمدادات وإعدادات تنبيهات النظام الذكية 🔔
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">تتيح لك هذه الإعدادات تفعيل الإشعارات الفورية على مستوى المتصفح (Web Notifications) وضبط التنبيهات الصوتية المتكررة فور ورود أي طلبات جديدة للزبائن.</p>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-3 justify-start">
                        {/* زر تجربة نغمة الرنين لاستئناف حظر المتصفح المسبق */}
                        <button 
                          type="button"
                          onClick={playSoundWithFallback}
                          className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-black rounded-xl transition-all flex items-center gap-2 border border-slate-800 hover:border-slate-700 active:scale-95 cursor-pointer"
                        >
                          <span>🔊 تجربة نغمة الجرس</span>
                        </button>

                        {/* زر تفعيل إشعارات المتصفح لسطح المكتب */}
                        <button
                          type="button"
                          onClick={requestNotificationPermission}
                          className={cn(
                            "px-4 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 border active:scale-95 cursor-pointer",
                            desktopPermission === "granted"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : "bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-500/20"
                          )}
                        >
                          <span>🔔 {desktopPermission === "granted" ? "إشعارات المتصفح: مفعّلة" : "تفعيل إشعارات المتصفح المباشرة"}</span>
                        </button>
                      </div>

                      {/* زر فتح دليل المساعدة بالخطوات للآيفون وسفاري */}
                      <button
                        type="button"
                        onClick={() => setShowNotificationGuide(true)}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 justify-start text-right cursor-pointer select-none"
                      >
                        <span>📱 تواجه مشكلة بالتفعيل؟ اضغط هنا لرؤية خطوات تشغيل الإشعارات على سفاري وآيفون</span>
                      </button>

                      {/* اختيار تكرار نغمة الرنين حتى مراجعة وإلغاء أو قبول الطلب */}
                      <label className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl cursor-pointer select-none hover:border-slate-700 transition-colors w-full">
                        <input 
                          type="checkbox"
                          checked={enableSoundLoop}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setEnableSoundLoop(val);
                            showToast(val ? "تم تفعيل المنبه اللانهائي للطلبات المعلقة 🎼" : "تم إلغاء تفعيل منبه الرنين المتكرر");
                          }}
                          className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-900"
                        />
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-200 block">تنشيط منبه الرنين المتكرر المستمر</span>
                          <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">تكرار صوت الجرس تلقائياً كل دقيقتين لحين التعامل مع الطلبات المعلقة (يعمل لدى كل من المدير والموظفين على حد سواء).</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-indigo-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-indigo-200">ملاحظة</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        يتم حفظ هذه الإعدادات سحابياً وستظهر لجميع الموظفين والعملاء في النظام.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveGeneralSettings}
                    disabled={savingBranding}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black py-4 rounded-xl transition-all"
                  >
                    {savingBranding ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </button>

                  {/* Log Cleanup & Automation Section */}
                  <div className="pt-6 border-t border-slate-800 mt-6">
                    <h3 className="text-sm font-bold text-indigo-400 mb-4">أتمتة تنظيف سجلات الطلبات</h3>
                    <div className="p-5 bg-slate-950 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex-1 text-right">
                        <div className="flex items-center gap-2 mb-1.5 justify-start" dir="rtl">
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            ((orgData?.subscriptionTier === "tier1" || orgData?.subscriptionTier === "tier2") ? true : autoCleanupEnabled) ? "bg-emerald-500 animate-pulse" : "bg-slate-700"
                          )}></span>
                          <p className="text-xs font-bold text-slate-200">الجدولة والتنظيف الدوري تلقائياً</p>
                        </div>
                        {(() => {
                          const tier = orgData?.subscriptionTier || "tier1";
                          if (tier === "tier1") {
                            return (
                              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                                تم تفعيل التنظيف التلقائي الذكي للمحافظة على أداء لوحة القيادة؛ حيث يتم أرشفة ومسح الطلبات المكتملة والمسلمة تلقائياً بعد مرور <span className="text-amber-400 font-extrabold">10 أيام</span> لضمان خفة وسرعة النظام ومواكبة الزوار بضعف الكفاءة الحالية.
                              </p>
                            );
                          } else if (tier === "tier2") {
                            return (
                              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                                تم تفعيل التنظيف التلقائي الذكي للمحافظة على أداء لوحة القيادة؛ حيث يتم أرشفة ومسح الطلبات المكتملة والمسلمة تلقائياً بعد مرور <span className="text-indigo-400 font-extrabold">20 يوماً</span> لضمان خفة وسرعة النظام ومواكبة الزوار بضعف الكفاءة الحالية.
                              </p>
                            );
                          } else {
                            return (
                              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                                يتيح لك النظام أرشفة وحذف الطلبات المكتملة التي مر عليها <span className="text-emerald-400 font-extrabold">30 يوماً</span> بصفة دورية، لتضمن بقاء النظام خفيفاً واستجابة موقع عملائك فورية وبأعلى سرعة ممكنة.
                              </p>
                            );
                          }
                        })()}
                        {lastAutoCleanup && (
                          <p className="text-[9px] text-indigo-400 font-sans mt-2" dir="rtl font-semibold">
                            📅 آخر عملية تنظيف تلقائي تمت بنجاح:{" "}
                            {(() => {
                              try {
                                const d = typeof lastAutoCleanup.toDate === 'function' ? lastAutoCleanup.toDate() : new Date(lastAutoCleanup);
                                return format(d, "yyyy-MM-dd hh:mm a", { locale: ar });
                              } catch (e) {
                                return "---";
                              }
                            })()}
                          </p>
                        )}
                      </div>
                      {(() => {
                        const isEnforced = orgData?.subscriptionTier === "tier1" || orgData?.subscriptionTier === "tier2";
                        const isCurrentlyActive = isEnforced ? true : autoCleanupEnabled;
                        return (
                          <button 
                            type="button"
                            onClick={isEnforced ? undefined : handleToggleAutoCleanup}
                            disabled={isEnforced || savingCleanup}
                            className={cn(
                              "w-full md:w-auto px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border",
                              isEnforced
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-not-allowed"
                                : isCurrentlyActive 
                                  ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 border-transparent cursor-pointer active:scale-95" 
                                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border-slate-700 cursor-pointer active:scale-95"
                            )}
                          >
                            {isEnforced ? "مفعّل تلقائياً للأداء ✅" : isCurrentlyActive ? "إيقاف الحذف التلقائي" : "تفعيل الحذف التلقائي"}
                          </button>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800 mt-6">
                    <h3 className="text-sm font-bold text-red-500 mb-4">منطقة الخطر وإدارة السجلات يدوياً</h3>
                    
                    {/* Clear completed orders only */}
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                      <div className="text-right">
                        <p className="text-xs font-bold text-amber-200 mb-1">حذف الطلبات المكتملة فقط</p>
                        <p className="text-[10px] text-slate-500 font-bold">حذف الطلبات التي سُلّمت للعملاء فقط لتخفيف قاعدة البيانات والإبقاء على الطلبات في الانتظار أو قيد المعالجة.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={handleClearCompletedOrders}
                        className="w-full md:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/10 active:scale-95 shrink-0 cursor-pointer"
                      >
                        حذف السجلات المكتملة
                      </button>
                    </div>

                    {/* Clear all orders */}
                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mt-4 shadow-sm">
                      <div className="text-right">
                        <p className="text-xs font-bold text-red-200 mb-1">تصفير جميع الطلبات بالكامل</p>
                        <p className="text-[10px] text-slate-500 font-bold">حذف كافة سجلات الطلبات من قاعدة البيانات نهائياً بغض النظر عن حالتها.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={handleClearAllOrders}
                        className="w-full md:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-500/20 active:scale-95 shrink-0 cursor-pointer"
                      >
                        حذف السجل بالكامل
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "customer_settings" && (
            <motion.div
              key="customer_settings-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 text-right"
              dir="rtl"
            >
              {(!orgData || orgData?.subscriptionTier === "tier1") ? (
                <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center space-y-6 max-w-2xl mx-auto my-12 shadow-2xl">
                  <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
                    <Lock className="w-10 h-10 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black text-white">هذا القسم مغلق في الباقة الحالية 🔒</h3>
                  <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed font-semibold">
                    أنت مشترك حالياً في <span className="text-indigo-400 font-extrabold">الباقة الاقتصادية (Basic)</span>.
                    تقدم هذه الباقة تطبيق العملاء بـ <span className="text-white font-extrabold">الهوية الرسمية الافتراضية والشعار الأساسي والافتراضيات القياسية لنظام Quick Order (بالإضافة إلى وسم العلامة المائية للشركة)</span>.
                  </p>
                  <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                    🌟 لتخصيص محرر المظهر بالكامل، وتغيير الألوان والشعار الخاص بالمنشأة، وتعديل نصوص تتبع مسارات الخطوات، يرجى التواصل مع الإدارة لترقية اشتراكك السنوي للتكامل الكامل مع <span className="text-indigo-400 font-bold">الباقة المتقدمة</span> أو <span className="text-indigo-400 font-bold">الاحترافية الشاملة</span>.
                  </p>
                </div>
              ) : (
                <>
                  {/* Header section with info instruction block */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      <h2 className="text-3xl font-black tracking-tight text-white">محرر صفحات العملاء التفاعلي 🎨</h2>
                      <p className="text-slate-400 text-xs font-medium">قم بتعديل وتطوير النصوص والأيقونات والمظهر لصفحة الاستقبال وبوابة تتبع مسار الطلبات للعملاء مباشرة.</p>
                    </div>
                    
                    {/* Restore Defaults and Sync Helpers */}
                    <button
                      type="button"
                      disabled={orgData?.subscriptionTier === "tier2"}
                      onClick={handleResetToDefaults}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-50 text-xs font-extrabold px-4  py-2.5 rounded-xl border border-red-500/15 transition-all active:scale-95 cursor-pointer"
                      title={orgData?.subscriptionTier === "tier2" ? "استعادة النصوص الافتراضية متاح فقط في الباقة الاحترافية" : ""}
                    >
                      استعادة النصوص الافتراضية للجميع 🔄
                    </button>
                  </div>

                  {orgData?.subscriptionTier === "tier2" && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3 text-right" dir="rtl">
                      <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                      <div className="space-y-1">
                        <span className="text-xs font-black text-amber-400 block">⚠️ وضع التخصيص الجزئي (الباقة المتقدمة - Standard)</span>
                        <p className="text-[10px] text-slate-350 leading-relaxed font-bold">
                          بصفتك مشتركاً في الباقة المتقدمة، يمكنك تعديل ألوان الواجهة واختيار أيقونة ونوع الشعار وتنشيط الدليفري. 
                          ولكن <span className="text-rose-400 font-extrabold">تعديل اسم المنشأة المباشر</span>، <span className="text-rose-400 font-extrabold">النصوص الترحيبية</span>، و<span className="text-rose-400 font-extrabold">رموز وعناوين خطوات تتبع الطلبات</span> هي ميزات ممتازة مغلقة ومثبتة تلقائياً على الافتراضيات الذكية للسرعة والأداء.
                        </p>
                        <p className="text-[9.5px] text-indigo-400 font-extrabold">
                          🚀 للتحرير اللانهائي الكامل وتخصيص هويتك بكل التفاصيل الفنية، يرجى التواصل مع الإدارة للترقية للحقيبة الاحترافية السنوية الشاملة!
                        </p>
                      </div>
                    </div>
                  )}

              {/* Navigation toggle simulator tabs + Main customizer color scheme bar */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col gap-5">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
                  {/* Select active simulator screen view */}
                  <div className="space-y-1.5 w-full lg:w-auto">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">اختر الشاشة المراد معاينتها وتخصيصها داخل المحاكي:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "welcome", label: "📱 شاشة العميل ونموذج الطلب", desc: "الواجهة الأساسية للطلب" },
                        { id: "tracking_delivery", label: "🚚 تتبع الطلب (التوصيل)", desc: "خطوات تتبع التوصيل" },
                        { id: "tracking_pickup", label: "🛍️ تتبع الطلب (الاستلام)", desc: "خطوات تتبع الاستلام" }
                      ].map((simTab) => {
                        const isSimActive = activePreviewTab === simTab.id || (simTab.id === "welcome" && activePreviewTab === "order_form");
                        return (
                          <button
                            key={simTab.id}
                            type="button"
                            onClick={() => {
                              setActivePreviewTab(simTab.id as any);
                              showToast(`تم عرض محاكاة: ${simTab.label}`);
                            }}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97] select-none cursor-pointer",
                              isSimActive 
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 ring-2 ring-indigo-500/30"
                                : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                            )}
                          >
                            {simTab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Color Themes */}
                  <div className="space-y-1.5 w-full lg:w-auto">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">لون السمة الرئيسي وهوية شاشات العملاء:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: "emerald", label: "زمردي", color: "bg-emerald-500" },
                        { id: "blue", label: "أزرق", color: "bg-blue-500" },
                        { id: "indigo", label: "بنفسجي", color: "bg-indigo-500" },
                        { id: "rose", label: "وردي", color: "bg-rose-500" },
                        { id: "amber", label: "ذهبي", color: "bg-amber-500" },
                        { id: "violet", label: "بنفسجي داكن", color: "bg-violet-500" },
                        { id: "teal", label: "تركواز", color: "bg-teal-500" }
                      ].map((theme) => {
                        const isThemeActive = primaryColor === theme.id;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => {
                              setPrimaryColor(theme.id);
                              showToast(`تم اختيار السمة: ${theme.label}`);
                            }}
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all active:scale-95 select-none cursor-pointer",
                              isThemeActive 
                                ? "bg-slate-950 text-white border-slate-700 ring-2 ring-indigo-500/50" 
                                : "bg-slate-950/40 text-slate-400 border-slate-900 hover:border-slate-800"
                            )}
                          >
                            <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", theme.color)} />
                            <span>{theme.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Clean, centered smartphone interactive workspace */}
                <div className="max-w-[420px] mx-auto w-full flex flex-col items-center gap-6">
                  
                  {/* Smartphone interactive mockup simulator */}
                  <div className="w-full flex flex-col items-center p-5 bg-slate-950/30 rounded-[2.5rem] border border-slate-800/60 shadow-xl">
                    <div className="text-center mb-4">
                      <span className="text-[11px] font-black text-slate-400 tracking-wide uppercase">محاكي شاشة الهاتف التفاعلي 📱</span>
                      <p className="text-[9.5px] font-medium text-slate-500 mt-0.5">انقر مباشرة على الشعار أو النصوص بالهاتف لتعديلها وتخصيصها!</p>
                    </div>

                    {/* Smartphone Layout Container */}
                    <div className="w-full max-w-[340px] bg-slate-950 border-[6px] border-slate-850 rounded-[35px] shadow-2xl relative overflow-hidden flex flex-col select-none border-b-[8px] border-t-[8px]">
                      {/* Notch Speaker */}
                      <div className="absolute top-0 inset-x-0 h-4 bg-slate-800 rounded-b-xl flex justify-center items-center z-40">
                        <div className="w-10 h-0.5 bg-slate-900 rounded-full"></div>
                      </div>

                      {/* Header network details */}
                      <div className="pt-4 px-4 flex justify-between text-[7px] font-sans font-extrabold text-slate-600 z-30">
                        <span>QuickOrder 📶</span>
                        <span>12:45 PM 🔋 100%</span>
                      </div>

                      {/* Simulated Screen Inner Body */}
                      <div className="px-3 pb-4 pt-2 flex-1 flex flex-col min-h-[480px] text-right" dir="rtl">
                        
                        {/* 1. If active preview tab is WELCOME SCREEN & ORDER FORM PORTAL combined */}
                        {(activePreviewTab === "welcome" || activePreviewTab === "order_form") && (
                          <div className="flex-1 flex flex-col justify-start relative overflow-y-auto max-h-[580px] scrollbar-none text-right">
                            {/* Brand/Hero Section inside phone */}
                            <div className={cn("p-4 text-white flex flex-col items-center text-center relative overflow-hidden rounded-2xl shrink-0 shadow-md", COLOR_THEMES[primaryColor]?.heroBg || "bg-emerald-600")}>
                              <div className={cn("absolute top-0 left-0 w-full h-full skew-x-12 translate-x-1/2", COLOR_THEMES[primaryColor]?.heroSkewBg || "bg-emerald-700/20")}></div>
                              
                               {/* Clickable Store Logo/Icon Preset */}
                               <div 
                                 onClick={() => {
                                   setIconSelectorTarget("store_logo");
                                 }}
                                 className={cn(
                                   "w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 relative z-10 shadow-lg cursor-pointer hover:scale-105 transition-all select-none border",
                                   logoUrl ? "bg-white p-0.5 border-white/40" : "bg-white/10 backdrop-blur-md border-white/20"
                                 )}
                                 title="انقر لتغيير الأيقونة أو لرفع شعار مخصص"
                               >
                                 {logoUrl ? (
                                   <img src={logoUrl} alt="الشعار" className="w-full h-full object-contain rounded-lg" referrerPolicy="no-referrer" />
                                 ) : (
                                   (() => {
                                     switch (chosenIcon) {
                                        case "shopping-bag": return <ShoppingBag className="w-5 h-5 text-white" />;
                                        case "utensils": return <Utensils className="w-5 h-5 text-white" />;
                                        case "store": return <Store className="w-5 h-5 text-white" />;
                                        case "coffee": return <Coffee className="w-5 h-5 text-white" />;
                                        case "pizza": return <Pizza className="w-5 h-5 text-white" />;
                                        case "sparkles": return <Sparkles className="w-5 h-5 text-white" />;
                                        case "pill": return <Pill className="w-5 h-5 text-white" />;
                                        case "croissant": return <Croissant className="w-5 h-5 text-white" />;
                                        case "shopping-cart": return <ShoppingCart className="w-5 h-5 text-white" />;
                                        case "shirt": return <Shirt className="w-5 h-5 text-white" />;
                                        case "gift": return <Gift className="w-5 h-5 text-white" />;
                                        case "flower": return <Flower className="w-5 h-5 text-white" />;
                                        case "smartphone": return <Smartphone className="w-5 h-5 text-white" />;
                                        case "apple": return <Apple className="w-5 h-5 text-white" />;
                                        default: return <ShoppingBag className="w-5 h-5 text-white" />;
                                      }
                                   })()
                                 )}
                               </div>
                              
                              {/* Name input - editable */}
                              <input
                                type="text"
                                disabled={orgData?.subscriptionTier === "tier1"}
                                value={orgData?.subscriptionTier === "tier1" ? "quick order @ الطلب السريع" : restaurantName}
                                onChange={(e) => setRestaurantName(e.target.value)}
                                className={cn(
                                  "w-full text-center bg-transparent text-[13px] font-black transition-all mr-0 ml-0 border-0 border-b border-dashed px-2",
                                  orgData?.subscriptionTier === "tier1"
                                    ? "text-slate-450 border-transparent cursor-not-allowed select-none"
                                    : "text-white hover:bg-slate-900/40 rounded focus:bg-slate-900 focus:outline-none border-transparent hover:border-white/30 truncate"
                                )}
                                title={orgData?.subscriptionTier === "tier1" ? "تعديل اسم المنشأة مقفل في الباقة الاقتصادية" : "تعديل اسم المنشأة المباشر"}
                                placeholder="اسم المتجر"
                              />

                              {/* Welcome message - editable */}
                              <textarea
                                rows={2}
                                disabled={orgData?.subscriptionTier !== "tier3"}
                                value={orgData?.subscriptionTier !== "tier3" ? "أهلاً بك في نظام الطلبات المتطور (quick order). اطلب الآن وتابع حالة طلبك مباشرة." : welcomeMessage}
                                onChange={(e) => setWelcomeMessage(e.target.value)}
                                className={cn(
                                  "w-full text-center bg-transparent text-[9px] transition-all leading-normal resize-none font-semibold mt-1.5 border-0 border-b border-dashed px-2",
                                  orgData?.subscriptionTier !== "tier3"
                                    ? "text-white/40 border-transparent cursor-not-allowed select-none"
                                    : "text-white/80 hover:bg-slate-900/40 rounded focus:bg-slate-900 focus:outline-none border-transparent hover:border-white/20"
                                )}
                                title={orgData?.subscriptionTier !== "tier3" ? "تعديل الرسالة الترحيبية مقفل في الباقة الحالية" : "تعديل الرسالة الترحيبية"}
                                placeholder="الرسالة الترحيبية..."
                              />
                            </div>

                            {/* Simulated form underneath exactly like CustomerView style */}
                            <div className="space-y-3.5 mt-3 px-1 text-right">
                              {/* Name Field */}
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-500 flex items-center gap-1.5 pr-0.5 w-full">
                                  <User className={cn("w-3 h-3 shrink-0", COLOR_THEMES[primaryColor]?.textAccent || "text-emerald-500")} />
                                  <input
                                    type="text"
                                    value={fieldNameLabel}
                                    onChange={(e) => setFieldNameLabel(e.target.value)}
                                    className="bg-transparent text-[8px] font-black text-slate-400 border border-dashed border-transparent hover:border-slate-800 focus:border-indigo-505 rounded px-1 transition-all focus:outline-none w-full text-right cursor-text"
                                    title="تعديل عنوان حقل الاسم"
                                    placeholder="اسم العميل"
                                  />
                                </label>
                                <input
                                  type="text"
                                  disabled
                                  value=""
                                  placeholder=""
                                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-900 text-[9px] bg-slate-950/40 text-slate-600 cursor-not-allowed text-right"
                                />
                              </div>

                              {/* Phone Field */}
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-500 flex items-center gap-1.5 pr-0.5 w-full">
                                  <Phone className={cn("w-3 h-3 shrink-0", COLOR_THEMES[primaryColor]?.textAccent || "text-emerald-500")} />
                                  <input
                                    type="text"
                                    value={fieldPhoneLabel}
                                    onChange={(e) => setFieldPhoneLabel(e.target.value)}
                                    className="bg-transparent text-[8px] font-black text-slate-400 border border-dashed border-transparent hover:border-slate-800 focus:border-indigo-505 rounded px-1 transition-all focus:outline-none w-full text-right cursor-text"
                                    title="تعديل عنوان حقل الجوال"
                                    placeholder="رقم الجوال"
                                  />
                                </label>
                                <input
                                  type="tel"
                                  disabled
                                  value=""
                                  placeholder=""
                                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-900 text-[9px] bg-slate-950/40 text-slate-600 cursor-not-allowed text-right font-mono"
                                />
                              </div>

                              {/* Fulfillment switches */}
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-500 flex items-center gap-1.5 pr-0.5">
                                  <Truck className={cn("w-3 h-3", COLOR_THEMES[primaryColor]?.textAccent || "text-emerald-500")} /> طريقة استلام الطلب
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSimFulfillmentType("pickup")}
                                    className={cn(
                                      "py-2 rounded-xl border text-[8.5px] font-bold transition-all text-center flex flex-col justify-center items-center gap-1 active:scale-95 cursor-pointer",
                                      simFulfillmentType === "pickup"
                                        ? COLOR_THEMES[primaryColor]?.tabActive || "bg-emerald-500/10 text-emerald-400"
                                        : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900"
                                    )}
                                  >
                                    <MapPin className={cn("w-3 h-3 animate-pulse", COLOR_THEMES[primaryColor]?.textAccent || "text-emerald-500")} />
                                    <span>الاستلام من الفرع</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (deliveryEnabled) setSimFulfillmentType("delivery");
                                    }}
                                    className={cn(
                                      "py-2 rounded-xl border text-[8.5px] font-bold transition-all text-center flex flex-col justify-center items-center gap-1 relative overflow-hidden active:scale-95 cursor-pointer",
                                      !deliveryEnabled ? "opacity-35 cursor-not-allowed bg-slate-950/40 border-slate-900 text-slate-600" : (
                                        simFulfillmentType === "delivery"
                                          ? COLOR_THEMES[primaryColor]?.tabActive || "bg-emerald-500/10 text-emerald-400"
                                          : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900"
                                      )
                                    )}
                                  >
                                    <Truck className={cn("w-3 h-3", COLOR_THEMES[primaryColor]?.textAccent || "text-emerald-500")} />
                                    <span>توصيل للموقع</span>
                                    {!deliveryEnabled && (
                                      <span className="absolute top-0.5 right-0.5 text-[6px] font-black bg-red-500/15 border border-red-500/20 px-1 py-0.2 rounded text-red-500 scale-75">مغلق</span>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Dates picker options toggle */}
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-500 flex items-center gap-1.5 pr-0.5">
                                  <Clock className={cn("w-3 h-3", COLOR_THEMES[primaryColor]?.textAccent || "text-emerald-500")} /> موعد استلام أو توصيل الطلب
                                </label>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSimDeliveryOption("today")}
                                    className={cn(
                                      "py-1.5 rounded-lg border text-[8px] font-bold transition-all text-center flex flex-col justify-center items-center cursor-pointer",
                                      simDeliveryOption === "today"
                                        ? COLOR_THEMES[primaryColor]?.tabActive || "bg-emerald-500/10 text-emerald-400"
                                        : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900"
                                    )}
                                  >
                                    <span>اليوم (فوري)</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSimDeliveryOption("custom")}
                                    className={cn(
                                      "py-1.5 rounded-lg border text-[8px] font-bold transition-all text-center flex flex-col justify-center items-center cursor-pointer",
                                      simDeliveryOption === "custom"
                                        ? COLOR_THEMES[primaryColor]?.tabActive || "bg-emerald-500/10 text-emerald-400"
                                        : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900"
                                    )}
                                  >
                                    <span>تحديد وقت مخصص</span>
                                  </button>
                                </div>
                              </div>

                              {/* Items detailed text area */}
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-500 flex items-center gap-1.5 pr-0.5 w-full">
                                  <ShoppingBag className={cn("w-3 h-3 shrink-0", COLOR_THEMES[primaryColor]?.textAccent || "text-emerald-500")} />
                                  <input
                                    type="text"
                                    value={fieldItemsLabel}
                                    onChange={(e) => setFieldItemsLabel(e.target.value)}
                                    className="bg-transparent text-[8px] font-black text-slate-400 border border-dashed border-transparent hover:border-slate-800 focus:border-indigo-505 rounded px-1 transition-all focus:outline-none w-full text-right cursor-text"
                                    title="تعديل عنوان حقل تفاصيل الطلب"
                                    placeholder="تفاصيل الطلبات"
                                  />
                                </label>
                                <textarea
                                  rows={2}
                                  disabled
                                  value=""
                                  placeholder=""
                                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-900 text-[9px] bg-slate-950/40 text-slate-600 cursor-not-allowed text-right leading-relaxed resize-none"
                                />
                              </div>

                              {/* Sent Button */}
                              <button
                                type="button"
                                onClick={() => showToast("تمت محاكاة تقديم طلبك بنجاح! هذه واجهة معاينة تفاعلية للعملاء.")}
                                className={cn(
                                  "w-full py-2.5 text-center rounded-xl text-[9.5px] font-black transition-all border border-transparent select-none shadow-md mt-1 cursor-pointer active:scale-95",
                                  COLOR_THEMES[primaryColor]?.buttonBg || "bg-emerald-500 text-slate-950"
                                )}
                              >
                                تأكيد وإرسال الطلب سحابياً 🚀
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 2. If active preview tab is TRACKING DELIVERY VIEW */}
                        {activePreviewTab === "tracking_delivery" && (
                          <div className="flex-1 flex flex-col justify-start relative pt-3 overflow-y-auto max-h-[580px] scrollbar-none">
                            <span className="text-[9px] font-black text-white block border-b border-slate-900 pb-1.5 mb-2.5 text-center">🎯 تتبع الطلب (التوصيل)</span>
                            
                            <div className="bg-slate-900/80 p-2 rounded-xl text-center border border-slate-800 mb-4 shrink-0">
                              <span className="text-[7px] text-slate-500 block font-bold leading-normal mb-0.5">الرقم المرجعي للطلب:</span>
                              <span className="text-[9px] font-mono font-black text-indigo-400">#QO-2026-X80D</span>
                            </div>

                            {/* Tracking Vertical interactive timeline */}
                            <div className="relative pr-5 mr-1 border-r border-slate-800 space-y-4 pb-2 text-right">
                              {[
                                { k: "pending", label: stepPendingLabel, desc: stepPendingDesc, ic: stepPendingIcon, col: "text-amber-500", ring: "ring-amber-500/20" },
                                { k: "accepted", label: stepAcceptedLabel, desc: stepAcceptedDesc, ic: stepAcceptedIcon, col: "text-blue-500", ring: "ring-blue-500/20" },
                                { k: "ready", label: stepReadyLabel, desc: stepReadyDesc, ic: stepReadyIcon, col: "text-emerald-500", ring: "ring-emerald-500/20" },
                                { k: "delivering", label: stepDeliveringLabel, desc: stepDeliveringDesc, ic: stepDeliveringIcon, col: "text-teal-500", ring: "ring-teal-500/20" },
                                { k: "completed", label: stepCompletedLabel, desc: stepCompletedDesc, ic: stepCompletedIcon, col: "text-indigo-500", ring: "ring-indigo-500/20" }
                              ].map((item, idx) => {
                                const isFirstStep = idx === 0;
                                return (
                                  <div 
                                    key={item.k} 
                                    className="relative group cursor-pointer hover:bg-slate-900/40 p-1 rounded-lg transition-colors text-right"
                                    onClick={() => showToast(`تم اختيار خطوة لطلب التوصيل: (${item.label}) للمعاينة.`)}
                                    title="اضغط لتمرير خيار التعديل"
                                  >
                                    {/* Vertical bullet */}
                                    <div 
                                      className={cn(
                                        "absolute right-[-24px] top-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border bg-slate-950 cursor-pointer hover:scale-115 transition-all z-10 shadow-sm",
                                        isFirstStep ? "border-amber-500 shadow-md shadow-amber-500/20 text-amber-500" : "border-slate-800 text-slate-500"
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIconSelectorTarget(item.k);
                                      }}
                                      title="انقر لتغيير أيقونة هذه المرحلة"
                                    >
                                      {renderIconMockup(item.ic, "w-2 h-2")}
                                    </div>

                                    {/* Texts block */}
                                    <div className="flex-1 pr-1 text-right">
                                      {/* Click to edit titles */}
                                      <input
                                        type="text"
                                        disabled={orgData?.subscriptionTier !== "tier3"}
                                        value={(() => {
                                          if (orgData?.subscriptionTier === "tier3") return item.label;
                                          if (item.k === "pending") return "تم استلام الطلب وبانتظار المراجعة";
                                          if (item.k === "accepted") return "جاري تحضير طلبك";
                                          if (item.k === "ready") return "طلبك جاهز للتسليم";
                                          if (item.k === "delivering") return "جاري توصيل طلبك";
                                          return "تم التوصيل والتسليم بنجاح";
                                        })()}
                                        onChange={(e) => {
                                          if (item.k === "pending") setStepPendingLabel(e.target.value);
                                          else if (item.k === "accepted") setStepAcceptedLabel(e.target.value);
                                          else if (item.k === "ready") setStepReadyLabel(e.target.value);
                                          else if (item.k === "delivering") setStepDeliveringLabel(e.target.value);
                                          else if (item.k === "completed") setStepCompletedLabel(e.target.value);
                                        }}
                                        className={cn(
                                          "w-full bg-transparent text-[8.5px] font-black border border-dashed rounded px-1 py-0.5 focus:outline-none focus:bg-slate-900 text-right transition-all",
                                          orgData?.subscriptionTier !== "tier3"
                                            ? "border-transparent text-slate-450 cursor-not-allowed select-none focus:bg-transparent"
                                            : "text-white border-transparent hover:border-slate-800 focus:border-indigo-500 cursor-text"
                                        )}
                                        placeholder="عنوان الخطوة"
                                        onClick={(e) => e.stopPropagation()}
                                        title={orgData?.subscriptionTier !== "tier3" ? "تعديل عناوين الخطوات متاح فقط في الباقة الاحترافية" : ""}
                                      />
                                      
                                      {/* Click to edit descriptions */}
                                      <textarea
                                        rows={2}
                                        disabled={orgData?.subscriptionTier !== "tier3"}
                                        value={(() => {
                                          if (orgData?.subscriptionTier === "tier3") return item.desc;
                                          if (item.k === "pending") return "تفاصيل طلبك قيد المراجعة والاعتماد الفوري من قبل الإدارة";
                                          if (item.k === "accepted") return "طلبك قيد التحضير الفعلي وتجهيز المحتويات الآن";
                                          if (item.k === "ready") return "تم الانتهاء من تجهيز طلبك بالكامل وهو بانتظار مندوب التوصيل";
                                          if (item.k === "delivering") return "المندوب في طريقه إليك الآن لتسليم الشحنة، يرجى الاستعداد";
                                          return "شكرًا لتعاملك معنا وثقتك بخدماتنا! نتمنى لك يومًا طيبًا";
                                        })()}
                                        onChange={(e) => {
                                          if (item.k === "pending") setStepPendingDesc(e.target.value);
                                          else if (item.k === "accepted") setStepAcceptedDesc(e.target.value);
                                          else if (item.k === "ready") setStepReadyDesc(e.target.value);
                                          else if (item.k === "delivering") setStepDeliveringDesc(e.target.value);
                                          else if (item.k === "completed") setStepCompletedDesc(e.target.value);
                                        }}
                                        className={cn(
                                          "w-full bg-transparent text-[7.5px] font-semibold border border-dashed rounded px-1 py-0.5 mt-0.5 focus:outline-none focus:bg-slate-900 leading-normal resize-none text-right transition-all",
                                          orgData?.subscriptionTier !== "tier3"
                                            ? "border-transparent text-slate-500/80 cursor-not-allowed select-none focus:bg-transparent"
                                            : "text-slate-400 border-transparent hover:border-slate-800 focus:border-indigo-500 cursor-text"
                                        )}
                                        placeholder="شرح توضيحي للمرحلة"
                                        onClick={(e) => e.stopPropagation()}
                                        title={orgData?.subscriptionTier !== "tier3" ? "تعديل وصف الخطوات متاح فقط في الباقة الاحترافية" : ""}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 3. If active preview tab is TRACKING PICKUP VIEW */}
                        {activePreviewTab === "tracking_pickup" && (
                          <div className="flex-1 flex flex-col justify-start relative pt-3 overflow-y-auto max-h-[580px] scrollbar-none">
                            <span className="text-[9px] font-black text-white block border-b border-slate-900 pb-1.5 mb-2.5 text-center">🎯 تتبع الطلب (محلي واستلام)</span>
                            
                            <div className="bg-slate-900/80 p-2 rounded-xl text-center border border-slate-800 mb-4 shrink-0">
                              <span className="text-[7px] text-slate-500 block font-bold leading-normal mb-0.5">الرقم المرجعي للطلب المحلي:</span>
                              <span className="text-[9px] font-mono font-black text-indigo-400">#QO-2026-T404</span>
                            </div>

                            {/* Tracking Vertical interactive timeline for Pickup */}
                            <div className="relative pr-5 mr-1 border-r border-slate-800 space-y-4 pb-2 text-right">
                              {[
                                { k: "pending", label: stepPendingLabel, desc: stepPendingDesc, ic: stepPendingIcon },
                                { k: "accepted", label: stepAcceptedLabel, desc: stepAcceptedDesc, ic: stepAcceptedIcon },
                                { k: "ready_pickup", label: stepPickupReadyLabel, desc: stepPickupReadyDesc, ic: stepPickupReadyIcon },
                                { k: "completed_pickup", label: stepPickupCompletedLabel, desc: stepPickupCompletedDesc, ic: stepPickupCompletedIcon }
                              ].map((item, idx) => {
                                const isFirstStep = idx === 0;
                                return (
                                  <div 
                                    key={item.k} 
                                    className="relative group cursor-pointer hover:bg-slate-900/40 p-1 rounded-lg transition-colors text-right"
                                    onClick={() => showToast(`تم تحديد خطوة للطلب المحلي: (${item.label}) للمعاينة.`)}
                                    title="اضغط لتعديل الخطوة"
                                  >
                                    {/* Bullet point on progress timeline */}
                                    <div 
                                      className={cn(
                                        "absolute right-[-24px] top-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border bg-slate-950 cursor-pointer hover:scale-115 transition-all z-10 shadow-sm",
                                        isFirstStep ? "border-amber-500 shadow-md shadow-amber-500/20 text-amber-500" : "border-slate-800 text-slate-500"
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIconSelectorTarget(item.k);
                                      }}
                                      title="انقر لتغيير أيقونة المرحلة"
                                    >
                                      {renderIconMockup(item.ic, "w-2 h-2")}
                                    </div>

                                    {/* Texts block */}
                                    <div className="flex-1 pr-1 text-right">
                                      {/* Editable title */}
                                      <input
                                        type="text"
                                        disabled={orgData?.subscriptionTier !== "tier3"}
                                        value={(() => {
                                          if (orgData?.subscriptionTier === "tier3") return item.label;
                                          if (item.k === "pending") return "تم استلام الطلب وبانتظار المراجعة";
                                          if (item.k === "accepted") return "جاري تحضير طلبك";
                                          if (item.k === "ready_pickup") return "جاهز للتسلم من الفرع";
                                          return "تم تسليم الطلب من الفرع";
                                        })()}
                                        onChange={(e) => {
                                          if (item.k === "pending") setStepPendingLabel(e.target.value);
                                          else if (item.k === "accepted") setStepAcceptedLabel(e.target.value);
                                          else if (item.k === "ready_pickup") setStepPickupReadyLabel(e.target.value);
                                          else if (item.k === "completed_pickup") setStepPickupCompletedLabel(e.target.value);
                                        }}
                                        className={cn(
                                          "w-full bg-transparent text-[8.5px] font-black border border-dashed rounded px-1 py-0.5 focus:outline-none focus:bg-slate-900 text-right transition-all",
                                          orgData?.subscriptionTier !== "tier3"
                                            ? "border-transparent text-slate-450 cursor-not-allowed select-none focus:bg-transparent"
                                            : "text-white border-transparent hover:border-slate-800 focus:border-indigo-500 cursor-text"
                                        )}
                                        placeholder="عنوان الخطوة"
                                        onClick={(e) => e.stopPropagation()}
                                        title={orgData?.subscriptionTier !== "tier3" ? "تعديل عناوين الخطوات متاح فقط في الباقة الاحترافية" : ""}
                                      />
                                      
                                      {/* Editable description */}
                                      <textarea
                                        rows={2}
                                        disabled={orgData?.subscriptionTier !== "tier3"}
                                        value={(() => {
                                          if (orgData?.subscriptionTier === "tier3") return item.desc;
                                          if (item.k === "pending") return "تفاصيل طلبك قيد المراجعة والاعتماد الفوري من قبل الإدارة";
                                          if (item.k === "accepted") return "طلبك قيد التحضير الفعلي وتجهيز المحتويات الآن";
                                          if (item.k === "ready_pickup") return "طلبك جاهز تمامًا وبانتظار تشريفك لاستلامه من الفرع الخاص بنا";
                                          return "سعدنا بتشريفك لنا وتم تسليمك الطلب بنجاح. بالهناء والشفاء!";
                                        })()}
                                        onChange={(e) => {
                                          if (item.k === "pending") setStepPendingDesc(e.target.value);
                                          else if (item.k === "accepted") setStepAcceptedDesc(e.target.value);
                                          else if (item.k === "ready_pickup") setStepPickupReadyDesc(e.target.value);
                                          else if (item.k === "completed_pickup") setStepPickupCompletedDesc(e.target.value);
                                        }}
                                        className={cn(
                                          "w-full bg-transparent text-[7.5px] font-semibold border border-dashed rounded px-1 py-0.5 mt-0.5 focus:outline-none focus:bg-slate-900 leading-normal resize-none text-right transition-all",
                                          orgData?.subscriptionTier !== "tier3"
                                            ? "border-transparent text-slate-500/80 cursor-not-allowed select-none focus:bg-transparent"
                                            : "text-slate-400 border-transparent hover:border-slate-800 focus:border-indigo-500 cursor-text"
                                        )}
                                        placeholder="شرح توضيحي للمرحلة"
                                        onClick={(e) => e.stopPropagation()}
                                        title={orgData?.subscriptionTier !== "tier3" ? "تعديل وصف الخطوات متاح فقط في الباقة الاحترافية" : ""}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>

                  {/* Save button and instructions under mockup */}
                  <div className="w-full space-y-3 mt-4">
                    <button 
                      onClick={handleSaveCustomerBranding}
                      disabled={savingBranding}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 text-white font-black py-4 rounded-2xl transition-all cursor-pointer active:scale-[0.98] shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2.5 text-xs font-bold"
                    >
                      {savingBranding ? (
                        <>
                          <span>جاري الحفظ والاعتماد السحابي...</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping font-bold shrink-0"></span>
                        </>
                      ) : (
                        "💾 حفظ واعتماد إعدادات المظهر والخطوات"
                      )}
                    </button>

                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 text-[10.5px] leading-relaxed text-slate-400 text-right" dir="rtl">
                      💡 <strong>تنبيه للتعديل المباشر:</strong> تعديل النصوص الترحيبية والأسماء والخطوات يتم بالنقر والكتابة على المحاكي بالأعلى. تفعيل التوصيل بالدليفري متاح وجاهز بالفعل بالاعدادات العامة.
                    </div>
                  </div>

                </div>
              </div>

              {/* Absolute dialog overlay icon-selector popup */}
              <AnimatePresence>
                {iconSelectorTarget && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 text-right"
                    dir="rtl"
                  >
                    <motion.div 
                      initial={{ scale: 0.95, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.95, y: 15 }}
                      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full"
                    >
                      <h4 className="text-sm font-black text-indigo-400 mb-2 flex items-center gap-2">
                        {iconSelectorTarget === "store_logo" ? (
                          <>
                            <Upload className="w-4 h-4" />
                            شعار المتجر والأيقونة الافتراضية
                          </>
                        ) : (
                          <>
                            <Paintbrush className="w-4 h-4" />
                            اختر الرمز أو الأيقونة
                          </>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400 mb-4 font-bold">
                        {iconSelectorTarget === "store_logo" 
                          ? "يمكنك رفع صورة شعار مخصصة لمتجرك لتبدو بشكل احترافي، أو اختيار أحد الأيقونات الجاهزة بالأسفل:" 
                          : "انقر لتغيير أيقونة المرحلة المحددة بالتحديث الفوري والمزامنة:"}
                      </p>

                      {/* Store Logo Custom Upload section */}
                      {iconSelectorTarget === "store_logo" && (
                        <div className="mb-5 space-y-4 border-b border-slate-800 pb-5 text-right" dir="rtl">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-300 block font-sans">رفع شعار جديد (صورة مخصصة):</label>
                            
                            <div className="grid grid-cols-1 gap-3">
                              {/* Drag & Drop or Click to select file */}
                              <div className="group relative border border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/50 bg-slate-950/50 rounded-2xl p-4 transition-all text-center flex flex-col items-center justify-center min-h-[100px]">
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={handleLogoUpload}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <Upload className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors mb-1.5 mx-auto" />
                                <span className="text-[10px] font-black text-slate-300 block">اضغط أو اسحب صورة الشعار هنا لرفعها</span>
                                <span className="text-[8px] text-slate-500 block mt-0.5">PNG, JPG, SVG لا تتعدى 800KB</span>
                              </div>

                              {/* OR Text URL Input */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 block pb-0.5">أو أدخل رابط شعار مباشر (سحابي):</label>
                                <input 
                                  type="text"
                                  value={logoUrl}
                                  onChange={(e) => setLogoUrl(e.target.value)}
                                  placeholder="https://example.com/logo.png"
                                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-[10px] font-mono text-white focus:outline-none focus:border-indigo-500 text-left"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Image preview & delete */}
                          {logoUrl && (
                            <div className="bg-slate-950/65 p-3 rounded-2xl border border-slate-850/50 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 bg-white p-0.5 rounded-lg border border-slate-800 flex items-center justify-center shrink-0">
                                  <img 
                                    src={logoUrl} 
                                    alt="شعار مخصص" 
                                    className="w-full h-full object-contain rounded-md" 
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-black text-emerald-400 block">شعار مخصص مفعل</span>
                                  <span className="text-[8px] text-slate-500 block">سيتم عرضه بدل الأيقونات</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setLogoUrl("");
                                  showToast("تم حذف الشعار المخصص والرجوع للأيقونة.");
                                }}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[9px] font-bold py-1.5 px-2.5 rounded-lg border border-red-500/15 transition-all cursor-pointer"
                              >
                                إزالة الشعار 🗑️
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-3 gap-2 pr-1 max-h-[220px] overflow-y-auto">
                        {(iconSelectorTarget === "store_logo" ? [
                          { id: "store", icon: Store, label: "متجر عام" },
                          { id: "croissant", icon: Croissant, label: "مخبز" },
                          { id: "shopping-cart", icon: ShoppingCart, label: "سوبر ماركت" },
                          { id: "pill", icon: Pill, label: "صيدلية" },
                          { id: "coffee", icon: Coffee, label: "مقهى" },
                          { id: "pizza", icon: Pizza, label: "مطعم معجنات" },
                          { id: "shopping-bag", icon: ShoppingBag, label: "حقيبة شراء" },
                          { id: "shirt", icon: Shirt, label: "محل ملابس" },
                          { id: "gift", icon: Gift, label: "محل هدايا" },
                          { id: "flower", icon: Flower, label: "محل زهور" },
                          { id: "smartphone", icon: Smartphone, label: "إلكترونيات" },
                          { id: "apple", icon: Apple, label: "خضار وفواكه" }
                        ] : [
                          { id: "clock", icon: Clock, label: "ساعة" },
                          { id: "utensils", icon: Utensils, label: "أواني" },
                          { id: "bell", icon: Bell, label: "جرس الاستعداد" },
                          { id: "truck", icon: Truck, label: "شاحنة توصيل" },
                          { id: "check-circle-2", icon: CheckCircle, label: "صح مكتمل" },
                          { id: "store", icon: Store, label: "متجر" },
                          { id: "coffee", icon: Coffee, label: "قهوة وكوب" },
                          { id: "pizza", icon: Pizza, label: "وجبة معجنات" },
                          { id: "sparkles", icon: Sparkles, label: "بريق" },
                          { id: "map-pin", icon: MapPin, label: "عنوان موقع" },
                          { id: "shopping-bag", icon: ShoppingBag, label: "حقيبة شراء" },
                          { id: "pill", icon: Pill, label: "صيدلية" },
                          { id: "croissant", icon: Croissant, label: "مخبز" },
                          { id: "shopping-cart", icon: ShoppingCart, label: "سوبر ماركت" },
                          { id: "shirt", icon: Shirt, label: "محل ملابس" },
                          { id: "gift", icon: Gift, label: "محل هدايا" },
                          { id: "flower", icon: Flower, label: "محل زهور" },
                          { id: "smartphone", icon: Smartphone, label: "إلكترونيات" },
                          { id: "apple", icon: Apple, label: "خضار وفواكه" }
                        ]).map((item) => {
                          const SelectionIconComp = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                // assign icon matching targeted state
                                if (iconSelectorTarget === "store_logo") setChosenIcon(item.id);
                                else if (iconSelectorTarget === "pending") setStepPendingIcon(item.id);
                                else if (iconSelectorTarget === "accepted") setStepAcceptedIcon(item.id);
                                else if (iconSelectorTarget === "ready") setStepReadyIcon(item.id);
                                else if (iconSelectorTarget === "delivering") setStepDeliveringIcon(item.id);
                                else if (iconSelectorTarget === "completed") setStepCompletedIcon(item.id);
                                else if (iconSelectorTarget === "ready_pickup") setStepPickupReadyIcon(item.id);
                                else if (iconSelectorTarget === "completed_pickup") setStepPickupCompletedIcon(item.id);
                                
                                setIconSelectorTarget(null);
                                showToast(`تم اختيار أيقونة (${item.label}) للخطوة بنجاح!`);
                              }}
                              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all hover:scale-105 active:scale-95"
                            >
                              <SelectionIconComp className="w-4 h-4 text-indigo-400 mb-1" />
                              <span className="text-[9px] font-bold text-slate-400">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setIconSelectorTarget(null)}
                        className="mt-5 w-full bg-slate-800 hover:bg-slate-750 text-slate-400 py-2.5 rounded-xl text-xs font-black border border-slate-700/60 active:scale-95"
                      >
                        إلغاء النافذة
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              </>)}
            </motion.div>
          )}
          {activeTab === "links" && (
            <motion.div
              key="links-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto space-y-8 h-full flex flex-col justify-center"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 lg:p-14 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600"></div>
                
                <div className="flex flex-col items-center text-center mb-12">
                  <div className="w-24 h-24 bg-indigo-600/10 rounded-[2.5rem] flex items-center justify-center text-indigo-500 mb-6 border border-indigo-500/20">
                    <Share2 className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black mb-3">روابط الوصول السريع</h2>
                  <p className="text-slate-500 max-w-sm text-sm lg:text-base leading-relaxed">قم بمشاركة هذه الروابط مع الفريق أو تحويلها إلى رموز QR للمنشأة</p>
                </div>

                <div className="space-y-8">
                  {/* Customer Link CARD */}
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-[2rem] group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                        <LayoutDashboard className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-normal text-emerald-500">رابط واجهة العملاء (QR)</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                      <code className="text-xs font-mono text-slate-400 truncate w-full md:max-w-[300px] bg-slate-950/50 p-2 rounded-lg">{window.location.origin}?orgId={orgId}&view=customer</code>
                      <div className="flex shrink-0 gap-3 w-full md:w-auto">
                        <button 
                          onClick={() => copyToClipboard('customer')}
                          className="flex-1 md:w-12 md:h-12 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center py-3 md:py-0 text-white transition-all shadow-lg active:scale-95"
                        >
                          {copiedLink === 'customer' ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                        <a 
                          href={`/?orgId=${orgId}&view=customer`} 
                          target="_blank" 
                          className="flex-1 md:w-12 md:h-12 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center py-3 md:py-0 text-white transition-all shadow-lg"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Staff Link CARD */}
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-[2rem] group hover:border-amber-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-normal text-amber-500">رابط واجهة الموظفين</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                      <code className="text-xs font-mono text-slate-400 truncate w-full md:max-w-[300px] bg-slate-950/50 p-2 rounded-lg">{window.location.origin}?orgId={orgId}&view=staff</code>
                      <div className="flex shrink-0 gap-3 w-full md:w-auto">
                        <button 
                          onClick={() => copyToClipboard('staff')}
                          className="flex-1 md:w-12 md:h-12 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center py-3 md:py-0 text-white transition-all shadow-lg active:scale-95"
                        >
                          {copiedLink === 'staff' ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                        <a 
                          href={`/?orgId=${orgId}&view=staff`} 
                          target="_blank" 
                          className="flex-1 md:w-12 md:h-12 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center py-3 md:py-0 text-white transition-all shadow-lg"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl text-indigo-400 text-[10px] md:text-xs leading-loose text-center font-bold">
                   💡 نصيحة: استخدم أحد تطبيقات تحويل الروابط إلى <b>QR Code</b> لطباعة واجهة العملاء ووضعها على الطاولات.
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === "bank_accounts" && (
            <motion.div
              key="bank-accounts-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-8 h-full"
              dir="rtl"
            >
              {/* Header Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                      <Landmark className="w-8 h-8 text-indigo-500" />
                      <span>الحسابات المصرفية للمنشأة</span>
                    </h2>
                    <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                      قم بتهيئة وإدارة الحسابات البنكية والمصرفية التي ستظهر للعملاء كوسائل دفع عند اختيارهم لخدمة التوصيل.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Add or Edit Bank Account form */}
                <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl h-fit font-sans">
                  {editingBankAccount ? (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-black text-amber-500">تعديل الحساب البنكي</h3>
                        <button
                          type="button"
                          onClick={() => setEditingBankAccount(null)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] px-2.5 py-1 rounded-lg transition cursor-pointer"
                        >
                          إلغاء التعديل
                        </button>
                      </div>
                      <form onSubmit={handleUpdateBankAccount} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-normal text-slate-405 block">اسم البنك او المصرف</label>
                          <input
                            required
                            type="text"
                            value={editingBankAccount.bankName}
                            onChange={e => setEditingBankAccount({ ...editingBankAccount, bankName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="مثال: بنك الكريمي، بنك اليمن..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-normal text-slate-405 block">اسم صاحب الحساب</label>
                          <input
                            required
                            type="text"
                            value={editingBankAccount.accountHolder}
                            onChange={e => setEditingBankAccount({ ...editingBankAccount, accountHolder: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="الاسم الثلاثي لمالك الحساب..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-normal text-slate-405 block">رقم الحساب او IBAN</label>
                          <input
                            required
                            type="text"
                            value={editingBankAccount.accountNumber}
                            onChange={e => setEditingBankAccount({ ...editingBankAccount, accountNumber: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                            placeholder="رقم الحساب أو الـ IBAN..."
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl transition-all shadow-md text-xs cursor-pointer"
                        >
                          تحديث الحساب 💾
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-black mb-4 text-white">إضافة حساب جديد</h3>

                      {orgData?.subscriptionTier === "tier1" && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl mb-4 text-right" dir="rtl">
                          <p className="text-[10px] font-black text-amber-500 mb-1">⚠️ تنبيه قيود الباقة الاقتصادية (Basic):</p>
                          <p className="text-[10px] text-slate-300 font-bold leading-normal">مسموح لك بتشغيل حساب مصرفي واحد فقط لتلقي التحويلات. للربط بأكثر من حساب، يرجى ترقية الاشتراك.</p>
                        </div>
                      )}
                      {orgData?.subscriptionTier === "tier2" && (
                        <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-2xl mb-4 text-right" dir="rtl">
                          <p className="text-[10px] font-black text-indigo-400 mb-1">ℹ️ تنبيه قيود الباقة المتقدمة (Standard):</p>
                          <p className="text-[10px] text-slate-300 font-bold leading-normal">مسموح لك بتسجيل حتى 3 حسابات مصرفية بحدٍ أقصى. لتعدى هذا الحد، يرجى بالترقية للباقة الاحترافية السنوية.</p>
                        </div>
                      )}
                      {orgData?.subscriptionTier === "tier3" && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl mb-4 text-right" dir="rtl">
                          <p className="text-[10px] font-black text-emerald-400 mb-1">🎯 الباقة الاحترافية نشطة (Unlimited):</p>
                          <p className="text-[10px] text-slate-300 font-bold leading-normal">يمكنك ربط وإضافة حسابات مصرفية غير محدودة وبمختلف البنوك والمصارف في اليمن أو الخارج.</p>
                        </div>
                      )}

                      <form onSubmit={handleAddBankAccount} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-normal text-slate-405 block">اسم البنك او المصرف</label>
                          <input
                            required
                            type="text"
                            value={newBankAccount.bankName}
                            onChange={e => setNewBankAccount({ ...newBankAccount, bankName: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="مثال: بنك الكريمي، بنك اليمن..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-normal text-slate-405 block">اسم صاحب الحساب</label>
                          <input
                            required
                            type="text"
                            value={newBankAccount.accountHolder}
                            onChange={e => setNewBankAccount({ ...newBankAccount, accountHolder: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="الاسم الثلاثي لمالك الحساب..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-normal text-slate-405 block">رقم الحساب او IBAN</label>
                          <input
                            required
                            type="text"
                            value={newBankAccount.accountNumber}
                            onChange={e => setNewBankAccount({ ...newBankAccount, accountNumber: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                            placeholder="رقم الحساب أو الـ IBAN..."
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isAddingAccount || (((orgData?.subscriptionTier || "tier1") === "tier1" && bankAccounts.length >= 1) || ((orgData?.subscriptionTier || "tier1") === "tier2" && bankAccounts.length >= 3))}
                          className={cn(
                            "w-full font-black py-2.5 px-4 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5",
                            (((orgData?.subscriptionTier || "tier1") === "tier1" && bankAccounts.length >= 1) || ((orgData?.subscriptionTier || "tier1") === "tier2" && bankAccounts.length >= 3))
                              ? "bg-slate-800 text-slate-500 border border-slate-755 cursor-not-allowed opacity-60 shadow-none"
                              : "bg-indigo-600 hover:bg-indigo-500 text-white"
                          )}
                        >
                          {(((orgData?.subscriptionTier || "tier1") === "tier1" && bankAccounts.length >= 1) || ((orgData?.subscriptionTier || "tier1") === "tier2" && bankAccounts.length >= 3)) ? (
                            <>
                              <span>🔒 مغلق (تم الوصول للحد الأقصى بالباقة)</span>
                            </>
                          ) : isAddingAccount ? (
                            "جاري الإضافة..."
                          ) : (
                            "حفظ الحساب"
                          )}
                        </button>
                      </form>
                    </>
                  )}
                </div>

                {/* Display Accounts List */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-black text-white">الحسابات الحالية ({bankAccounts.length})</h3>
                  {bankAccounts.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 border-dashed rounded-[2.5rem] py-16 text-center text-slate-500 font-bold text-sm">
                      ⚠️ لم يتم إضافة أي حسابات مصرفية بعد. أضف حساباً لتشغيل التحويل البنكي للتوصيل.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {bankAccounts.map((account) => (
                        <div key={account.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between gap-4 group hover:border-indigo-500/30 transition-all">
                          <div className="space-y-2 text-right">
                            <div className="flex items-center gap-2">
                              <span className="p-1 px-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px]">💳</span>
                              <h4 className="text-sm font-black text-white">{account.bankName}</h4>
                            </div>
                            <div className="space-y-1 text-xs">
                              <p className="text-slate-400 font-semibold"><span className="text-slate-500">اسم صاحب الحساب:</span> {account.accountHolder}</p>
                              <p className="text-slate-300 font-mono"><span className="text-slate-500 font-sans">رقم الحساب او IBAN:</span> {account.accountNumber}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0 font-sans">
                            <button
                              onClick={() => {
                                setEditingBankAccount(account);
                              }}
                              className="bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white p-2.5 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
                              title="تعديل الحساب"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if(window.confirm("هل أنت متأكد من رغبتك في حذف هذا الحساب؟")) {
                                  handleDeleteBankAccount(account.id);
                                }
                              }}
                              className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2.5 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
                              title="حذف الحساب"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Footer />
      </div>
    </main>

      {/* MODALS */}
      
      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddStaff && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-black mb-6">إضافة موظف جديد</h2>
              <form onSubmit={handleAddStaff} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-normal text-slate-500">الاسم الكامل</label>
                  <input
                    required
                    type="text"
                    value={newStaff.name || ""}
                    onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="أدخل اسم الموظف..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">الرمز السري (برقم أو كلمة)</label>
                  <input
                    required
                    type="text"
                    value={newStaff.passcode || ""}
                    onChange={e => setNewStaff({ ...newStaff, passcode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="مثال: 1234"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-normal text-slate-500">المسمى الوظيفي</label>
                  <select
                    value={newStaff.role || ""}
                    onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="موظف">موظف</option>
                    <option value="مشرف">مشرف</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                  >
                    حفظ البيانات
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddStaff(false)}
                    className="px-6 bg-slate-800 text-slate-400 font-bold py-4 rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Staff Modal */}
      <AnimatePresence>
        {staffToDelete && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                <Trash2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-black mb-2">تأكيد الحذف</h2>
              <p className="text-slate-500 text-sm mb-8">
                هل أنت متأكد من رغبتك في حذف الموظف <span className="text-white font-bold">"{staffToDelete.name}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteStaff}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-red-500/20"
                >
                  نعم، احذف
                </button>
                <button
                  onClick={() => setStaffToDelete(null)}
                  className="flex-1 bg-slate-800 text-slate-400 font-bold py-4 rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Staff Modal */}
      <AnimatePresence>
        {editingStaff && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-black mb-6">تعديل بيانات الموظف</h2>
              <form onSubmit={handleUpdateStaff} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-normal text-slate-500">الاسم الكامل</label>
                  <input
                    required
                    type="text"
                    value={editingStaff.name || ""}
                    onChange={e => setEditingStaff({ ...editingStaff, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-normal text-slate-500">الرمز السري</label>
                  <input
                    required
                    type="text"
                    value={editingStaff.passcode || ""}
                    onChange={e => setEditingStaff({ ...editingStaff, passcode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-normal text-slate-500">المسمى الوظيفي</label>
                  <select
                    value={editingStaff.role || ""}
                    onChange={e => setEditingStaff({ ...editingStaff, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="موظف">موظف</option>
                    <option value="مشرف">مشرف</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                  >
                    تحديث البيانات
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingStaff(null)}
                    className="px-6 bg-slate-800 text-slate-400 font-bold py-4 rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pb-20" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-6 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse">
                <LogOut className="w-6 h-6 text-red-500" />
              </div>
              
              <h3 className="text-lg font-black text-white mb-2 leading-tight">هل تريد تسجيل الخروج؟</h3>
              <p className="text-slate-400 text-xs font-semibold mb-6">تأكيد الرغبة في تسجيل خروج مدير المتجر والعودة لشاشة الدخول الرئيسية.</p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex-1 bg-red-650 hover:bg-red-600 text-white font-black py-3 rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-95 text-xs"
                >
                  نعم، خروج
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl border border-slate-700 transition-all active:scale-95 text-xs"
                >
                  تراجع
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showClearAllConfirm && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pb-20" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-6 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              
              <h3 className="text-lg font-black text-white mb-2 leading-tight">تأكيد حذف كافة السجلات</h3>
              <p className="text-slate-400 text-xs font-semibold mb-6">هل أنت متأكد من رغبتك في حذف وتصفير جميع سجلات الطلبات بالكامل؟ لا يمكن مراجعة أو استرجاع البيانات بعد الحذف.</p>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={clearingInProgress}
                  onClick={executeClearAllOrders}
                  className="flex-1 bg-red-650 hover:bg-red-600 text-white font-black py-3 rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-95 text-xs disabled:opacity-50"
                >
                  {clearingInProgress ? "جاري الحذف..." : "نعم، حذف الكل"}
                </button>
                <button
                  type="button"
                  disabled={clearingInProgress}
                  onClick={() => setShowClearAllConfirm(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl border border-slate-700 transition-all active:scale-95 text-xs"
                >
                  تراجع
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showClearCompletedConfirm && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pb-20" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-6 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <Trash2 className="w-6 h-6 text-amber-500" />
              </div>
              
              <h3 className="text-lg font-black text-white mb-2 leading-tight">تأكيد حذف الطلبات المكتملة</h3>
              <p className="text-slate-400 text-xs font-semibold mb-6">هل أنت متأكد من رغبتك في تنظيف وحذف كافة الطلبات المكتملة والمسلّمة فقط من السجلات؟ لا يمكن التراجع عن هذا الإجراء.</p>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={clearingInProgress}
                  onClick={executeClearCompletedOrders}
                  className="flex-1 bg-amber-650 hover:bg-amber-600 text-white font-black py-3 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 text-xs disabled:opacity-50"
                >
                  {clearingInProgress ? "جاري الحذف..." : "نعم، حذف المكتمل"}
                </button>
                <button
                  type="button"
                  disabled={clearingInProgress}
                  onClick={() => setShowClearCompletedConfirm(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl border border-slate-700 transition-all active:scale-95 text-xs"
                >
                  تراجع
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {singleOrderToDelete && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pb-20" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-6 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              
              <h3 className="text-lg font-black text-white mb-2 leading-tight">حذف الطلب بشكل نهائي</h3>
              <p className="text-slate-400 text-xs font-semibold mb-1">
                هل أنت متأكد من رغبتك في حذف طلب العميل <span className="text-white font-bold">"{singleOrderToDelete.customerName}"</span>؟
              </p>
              <p className="text-slate-500 text-[10px] font-bold mb-4">سيتم مسح الوجبات: {singleOrderToDelete.items.slice(0, 50)}...</p>

              {/* If order status is NOT completed, show a strong Arabic status warning */}
              {singleOrderToDelete.status !== "completed" ? (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl p-3 mb-5 text-[11px] font-bold text-center leading-relaxed">
                  ⚠️ تنبيه: هذا الطلب <span className="underline">ليس مكتملاً</span> وهو حالياً في الحالة:{" "}
                  <span className="text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 inline-block mt-1 font-black shadow-inner">
                    ({(() => {
                      switch (singleOrderToDelete.status) {
                        case "pending": return "قيد الانتظار";
                        case "accepted": return "جاري التحضير";
                        case "ready": return "جاهز للتسليم";
                        case "delivering": return "جاري التوصيل 🚚";
                        case "cancelled": return "تم الإلغاء";
                        default: return singleOrderToDelete.status;
                      }
                    })()})
                  </span>
                </div>
              ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/15 text-emerald-500/90 rounded-2xl p-3 mb-5 text-[10px] font-bold text-center">
                  ✓ ينتمي هذا السجل لطلب مكتمل وتم تسليمه بنجاح.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={clearingInProgress}
                  onClick={executeDeleteSingleOrder}
                  className="flex-1 bg-red-655 hover:bg-red-650 text-white font-black py-3 rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-95 text-xs disabled:opacity-50"
                >
                  {clearingInProgress ? "جاري الحذف..." : "نعم، احذف"}
                </button>
                <button
                  type="button"
                  disabled={clearingInProgress}
                  onClick={() => setSingleOrderToDelete(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl border border-slate-700 transition-all active:scale-95 text-xs"
                >
                  تراجع
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {orderToCancel && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pb-20" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-6 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-6 h-6 text-red-500 animate-bounce" />
              </div>

              <h3 className="text-lg font-black text-white mb-2 leading-tight">
                {orderToCancel.status === "pending" ? "رفض طلب العميل" : "إلغاء طلب العميل"}
              </h3>
              <p className="text-slate-400 text-xs font-semibold mb-1">
                هل أنت متأكد من رغبتك في {orderToCancel.status === "pending" ? "رفض" : "إلغاء"} طلب العميل <span className="text-white font-bold">"{orderToCancel.customerName}"</span>؟
              </p>
              <p className="text-slate-500 text-[10px] font-bold mb-4">كافة السلع: {orderToCancel.items.slice(0, 55)}...</p>

              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 mb-5 text-[11px] font-bold leading-relaxed text-center">
                ⚠️ تأكيد الإجراء: سيتم وضع علامة "ملغى" على هذا الطلب وإعلامه في واجهة العميل تلقائياً.
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    await handleUpdateOrderStatus(orderToCancel.id, "cancelled");
                    setOrderToCancel(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-95 text-xs"
                >
                  نعم، {orderToCancel.status === "pending" ? "ارفض" : "ألغِ"}
                </button>
                <button
                  type="button"
                  onClick={() => setOrderToCancel(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl border border-slate-700 transition-all active:scale-95 text-xs"
                >
                  تراجع
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showNotificationGuide && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowNotificationGuide(false)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-6 h-6 text-indigo-400 animate-bounce" />
              </div>

              <h2 className="text-lg font-black text-white text-center mb-1 leading-normal">
                دليل تشغيل وإعداد الإشعارات الفورية بالخطوات 📱
              </h2>
              <p className="text-slate-400 text-[11px] font-semibold text-center mb-5">
                تختلف شروط وطرق تفعيل الإشعارات باختلاف برامج التصفح وأنظمة التشغيل، إليك الدليل الشامل لتفعيلها بنجاح:
              </p>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 text-right scrollbar-thin scrollbar-thumb-slate-800">
                
                {/* Safari / iOS System */}
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <span className="text-base">🍏</span>
                    <h3 className="text-xs font-black text-indigo-400">هواتف آيفون وآيباد (أبل iOS Safari)</h3>
                  </div>
                  <p className="text-[10.5px] leading-relaxed text-slate-300 font-medium">
                    تشترط شركة أبل لتفعيل الإشعارات على هواتف الآيفون أن تقوم بإضافة الموقع الإلكتروني إلى شاشتك الرئيسية أولاً كـ جرس تنبيه خارجي مستقل:
                  </p>
                  <ol className="text-[10px] leading-relaxed text-slate-400 list-decimal pr-4 space-y-1">
                    <li>افتح رابط لوحة التحكم هذا في متصفح <strong className="text-white font-black">Safari</strong> الأساسي على الآيفون.</li>
                    <li>اضغط على زر <strong className="text-white font-black">المشاركة 📤 (Share)</strong> في شريط الأدوات بالأسفل.</li>
                    <li>من قائمة الخيارات، انزل لأسفل واضغط على <strong className="text-indigo-400 font-bold">"إضافة إلى الشاشة الرئيسية" 📲 (Add to Home Screen)</strong>.</li>
                    <li>افتح التطبيق الجديد من شاشتك الرئيسية لأول مرة، ثم توجه لقائمة الإعدادات وفعل الإشعارات لتعمل معك فورياً ونظامياً!</li>
                  </ol>
                </div>

                {/* Inline browser within apps */}
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400">
                    <span className="text-base">🌐</span>
                    <h3 className="text-xs font-black text-amber-400">التصفح داخل تطبيقات التواصل (سناب شات، واتساب، الخ)</h3>
                  </div>
                  <p className="text-[10.5px] leading-relaxed text-slate-300 font-medium">
                    تقوم هذه التطبيقات بفتح الروابط داخل متصفحات داخلية مدمجة (In-App Viewers) وهي محجوبة تماماً من طلب الإشعارات أو الوصول لنظام التشغيل لأسباب أمنية.
                  </p>
                  <p className="text-[10px] leading-relaxed text-slate-400">
                    <strong className="text-white font-black">الحل:</strong> انقر على خيار النقاط الثلاث بالزاوية أو زر <strong className="text-white">"فتح في متصفح خارجي"</strong> بالهاتف، لتفتح الصفحة في متصفحك الافتراضي (Safari / Chrome) ثم قم بتفعيل الإشعارات من هناك.
                  </p>
                </div>

                {/* Permissions Blocks */}
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400">
                    <span className="text-base">🔒</span>
                    <h3 className="text-xs font-black text-rose-400">تجاوز حظر أو رفض الإذن السابق (الكروم وسفاري للكمبيوتر)</h3>
                  </div>
                  <p className="text-[10.5px] leading-relaxed text-slate-300 font-medium">
                    إذا قمت بالنقر على "رفض الإذن" (Block) مسبقاً، فلن يقوم المتصفح بسؤالك مرة ثانية تلقائياً لحمايتك.
                  </p>
                  <ol className="text-[10px] leading-relaxed text-slate-400 list-decimal pr-4 space-y-1">
                    <li>في شريط العنوان بالأعلى بجوار رابط الموقع، اضغط على <strong className="text-rose-400 font-bold">أيقونة القفل 🔒</strong> أو الإعدادات الخاصة بالموقع.</li>
                    <li>ابحث عن بند <strong className="text-white">"الإشعارات" (Notifications)</strong> وقم بتغييره إلى <strong className="text-emerald-400 font-bold">"سماح" (Allow)</strong>.</li>
                    <li>قم بعمل إعادة تحديث (Refresh) للصفحة، وستعمل الإشعارات معك بالكامل الآن!</li>
                  </ol>
                </div>

              </div>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => setShowNotificationGuide(false)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-lg text-xs cursor-pointer active:scale-95"
                >
                  حسناً، فهمت ذلك وطرق التفعيل
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {pricingOrder && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 pb-20" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden text-right"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setPricingOrder(null)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Coins className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>

              <h2 className="text-lg font-black text-white text-center mb-1 leading-normal">
                إصدار الفاتورة وكشف الحساب السريع 💸
              </h2>
              <p className="text-slate-400 text-[11px] font-semibold text-center mb-5 leading-normal">
                آلية <span className="text-indigo-400 font-black">أبلغ واستمر (Inform & Proceed)</span>: حدد المبلغ وسيكمل النظام تشغيل الطلب والاتصال بالزبون فوراً وبأعلى سرعة ممكنة.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 mr-1 font-black">
                    قيمة السعر الكلي للقطع والتمور ({getCurrencyLabel(currency)}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={pricingItemsPrice}
                    onChange={(e) => setPricingItemsPrice(e.target.value)}
                    className="w-full text-sm p-3.5 rounded-2xl border border-slate-805 border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-600 font-mono text-center"
                    placeholder="مثال: 155"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 mr-1 font-black">
                    رسوم التوصيل / الخدمة ({getCurrencyLabel(currency)}) {deliveryEnabled ? "*" : "(اختياري)"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={pricingDeliveryPrice}
                    onChange={(e) => setPricingDeliveryPrice(e.target.value)}
                    className="w-full text-sm p-3.5 rounded-2xl border border-slate-805 border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-600 font-mono text-center"
                    placeholder={deliveryEnabled ? "أدخل رسوم التوصيل (إلزامية)" : "مثال: 15 (اختياري - التوصيل معطل)"}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 mr-1 font-black">تفاصيل / شرح السعر الحسابي (اختياري)</label>
                  <textarea
                    rows={2}
                    value={pricingNotesVal}
                    onChange={(e) => setPricingNotesVal(e.target.value)}
                    className="w-full text-xs p-3.5 rounded-2xl border border-slate-805 border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-600 resize-none font-sans"
                    placeholder="مثال: حساب القطع مع ضريبة القيمة المضافة"
                  />
                </div>

                {/* Total Preview */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl text-right">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold">الحساب الإجمالي المطلوب:</span>
                    <span className="text-lg font-black text-indigo-400 font-mono">
                      {(parseFloat(pricingItemsPrice) || 0) + (parseFloat(pricingDeliveryPrice) || 0)} {getCurrencyLabel(currency)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    disabled={isSavingPrice || !pricingItemsPrice || (deliveryEnabled && !pricingDeliveryPrice)}
                    onClick={handleSavePricing}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-2xl transition-all shadow-lg shadow-indigo-650/15 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-1.5 active:scale-95 text-xs font-bold cursor-pointer"
                  >
                    {isSavingPrice ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>تأكيد الفاتورة وإعلام الزبون فورا</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingOrder(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-350 font-bold px-4 py-3 rounded-2xl border border-slate-700 transition-all active:scale-95 text-xs font-bold font-sans cursor-pointer"
                  >
                    تراجع
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
