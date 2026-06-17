import React, { useEffect, useState, useRef } from "react";
import Footer from "./Footer";
import { db } from "../lib/firebase";
import { subscribeUserToPush } from "../lib/pushSubscription";
// @ts-ignore
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp,
  Timestamp,
  limit
} from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  Clock, 
  CheckCircle, 
  Package, 
  ExternalLink,
  ChevronRight,
  Monitor,
  CheckCircle2,
  AlertCircle,
  User,
  LogOut,
  ArrowLeft,
  Eye,
  EyeOff,
  Truck,
  MapPin,
  Store,
  MessageSquare,
  X,
  Coins,
  FileText,
  Check,
  Loader2
} from "lucide-react";
import useSound from "use-sound";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: string;
  status: "pending" | "accepted" | "ready" | "delivering" | "completed" | "cancelled";
  staffName?: string;
  acceptedBy?: string;
  preparedBy?: string;
  deliveredBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deliveryDate?: string;
  chat?: any[];
  totalPrice?: number;
  deliveryPrice?: number;
  pricingNotes?: string;
  chatMuted?: boolean;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  passcode: string;
}

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
    timelinePointActive: "border-indigo-505 text-indigo-400",
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
    badgeBg: "bg-indigo-500/10 border-indigo-500/10 text-indigo-400",
    buttonBg: "bg-indigo-500 hover:bg-indigo-400 text-slate-950",
    tabActive: "bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/5",
    gradientText: "from-indigo-500",
    timelinePointActive: "border-indigo-500 text-indigo-400",
    systemOnlineBullet: "bg-indigo-400",
    sidebarActiveBg: "bg-indigo-600 shadow-lg shadow-indigo-500/20 text-white"
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
    badgeBg: "bg-violet-500/10 border-violet-500/10 text-violet-400",
    buttonBg: "bg-violet-500 hover:bg-violet-400 text-slate-950",
    tabActive: "bg-violet-500/10 border-violet-500 text-violet-400 shadow-lg shadow-violet-500/5",
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
    tabActive: "bg-teal-500/10 border-teal-555 text-teal-450 shadow-lg shadow-teal-500/5",
    gradientText: "from-teal-500",
    timelinePointActive: "border-teal-500 text-teal-400",
    systemOnlineBullet: "bg-teal-400",
    sidebarActiveBg: "bg-teal-600 shadow-lg shadow-teal-500/20 text-slate-950"
  }
};

export default function StaffDashboard({ orgId, isPlatformOwner = false }: { orgId: string; isPlatformOwner?: boolean }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedChatOrderId, setExpandedChatOrderId] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`quickorder_current_staff_${orgId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved staff:", e);
        }
      }
    }
    return null;
  });
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const currentStaffRef = useRef<Staff | null>(currentStaff);
  useEffect(() => {
    currentStaffRef.current = currentStaff;
  }, [currentStaff]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentStaff) {
        localStorage.setItem(`quickorder_current_staff_${orgId}`, JSON.stringify(currentStaff));
      } else {
        localStorage.removeItem(`quickorder_current_staff_${orgId}`);
      }
    }
  }, [currentStaff, orgId]);

  useEffect(() => {
    if (orgId && currentStaff && typeof window !== "undefined") {
      if ("Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission().then((perm) => {
            if (perm === "granted") {
              subscribeUserToPush({
                orgId,
                userType: "staff",
                staffId: currentStaff.id
              }).catch(err => console.error("Error subscribing staff to push:", err));
            }
          });
        } else if (Notification.permission === "granted") {
          subscribeUserToPush({
            orgId,
            userType: "staff",
            staffId: currentStaff.id
          }).catch(err => console.error("Error subscribing staff to push:", err));
        }
      }
    }
  }, [orgId, currentStaff]);
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [play] = useSound(NOTIFICATION_SOUND);
  const [restaurantName, setRestaurantName] = useState("مطعم البركة");
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [primaryColor, setPrimaryColor] = useState("emerald");
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [orgData, setOrgData] = useState<any>(null);
  const [dismissedWarningMap, setDismissedWarningMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (typeof window !== "undefined" && orgId) {
      setDismissedWarningMap({
        1: localStorage.getItem(`dismissed_expiry_warning_1_${orgId}`) === "true",
        2: localStorage.getItem(`dismissed_expiry_warning_2_${orgId}`) === "true",
        3: localStorage.getItem(`dismissed_expiry_warning_3_${orgId}`) === "true",
      });
    }
  }, [orgId]);
  const lastPendingIds = useRef<Set<string>>(new Set());
  const lastChatLengthMap = useRef<Record<string, number>>({});
  const isFirstLoad = useRef(true);

  // sound and native browser desktop notification states
  const [enableSoundLoop, setEnableSoundLoop] = useState<boolean>(true);

  const [desktopPermission, setDesktopPermission] = useState<string>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showNotificationGuide, setShowNotificationGuide] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const [currency, setCurrency] = useState<string>("ريال يمني");

  const getCurrencyLabel = (cur: string) => {
    if (cur === "ريال سعودي") return "ر.س";
    if (cur === "دولار") return "دولار";
    return "ر.ي";
  };

  const [pricingOrder, setPricingOrder] = useState<Order | null>(null);
  const [pricingItemsPrice, setPricingItemsPrice] = useState<string>("");
  const [pricingDeliveryPrice, setPricingDeliveryPrice] = useState<string>("");
  const [pricingNotesVal, setPricingNotesVal] = useState<string>("");
  const [isSavingPrice, setIsSavingPrice] = useState<boolean>(false);

  const showToast = (msg: string, isError = false) => {
    if (isError) setErrorMsg(msg);
    else setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3050);
  };

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
        // Immediately subscribe staff to Web Push system
        if (orgId && currentStaff) {
          subscribeUserToPush({
            orgId,
            userType: "staff",
            staffId: currentStaff.id
          }).catch(err => console.error("Error subscribing staff to push via button click:", err));
        }
        triggerDesktopNotification("تنبيهات طاقم العمل 🔔", "ستستلم إشعارات نظام فورية بجميع الطلبات الجديدة الواردة!");
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
            console.error("Failed to show SW notification for staff:", err);
          });
        }).catch((err) => {
          console.error("SW ready failed for staff:", err);
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


  type OrderFilter = "all" | "mine";
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");
  const [selectedStatusModal, setSelectedStatusModal] = useState<"pending" | "accepted" | "ready" | "delivering" | "completed" | null>(null);

  useEffect(() => {
    if (!db || !orgId) {
      setLoading(false);
      setError("لم يتم العثور على إعدادات Firebase.");
      return;
    }

    try {
      // Load Staff List
      const unsubStaff = onSnapshot(collection(db, "organizations", orgId, "staff"), 
        (snap) => {
          const loadedStaff = snap.docs.map(d => ({ id: d.id, ...d.data() } as Staff));
          setStaffList(loadedStaff);

          // Force logout if the logged-in staff is deleted from the database
          if (currentStaffRef.current) {
            const stillExists = loadedStaff.some(s => s.id === currentStaffRef.current?.id);
            if (!stillExists) {
              setCurrentStaff(null);
            }
          }
        },
        (err) => {
          console.error("Staff load error:", err);
          setError("خطأ في الاتصال بقاعدة البيانات (الموظفين)");
        }
      );

      const q = query(
        collection(db, "organizations", orgId, "orders"),
        orderBy("createdAt", "desc"),
        limit(150)
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const rawOrders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Order[];

          // In-memory sort by status, then by createdAt desc to avoid composite index requirements in Firestore
          const statusOrder: Record<string, number> = {
            "pending": 0,
            "accepted": 1,
            "ready": 2,
            "delivering": 3,
            "completed": 4,
            "cancelled": 5
          };
          const newOrders = [...rawOrders].sort((a, b) => {
            const valA = statusOrder[a.status] !== undefined ? statusOrder[a.status] : 99;
            const valB = statusOrder[b.status] !== undefined ? statusOrder[b.status] : 99;
            if (valA !== valB) return valA - valB;
            
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });

          const currentPendingIds = new Set(newOrders.filter(o => o.status === "pending").map(o => o.id));
          
          if (!isFirstLoad.current) {
            // 1. New orders check
            const newPendingIds = Array.from(currentPendingIds).filter(id => !lastPendingIds.current.has(id));
            if (newPendingIds.length > 0) {
              playSoundWithFallback();
              const newestOrder = newOrders.find(o => o.id === newPendingIds[0]);
              if (newestOrder) {
                triggerDesktopNotification(
                  "طلب جديد وارد للتحضير! 🔔",
                  `الزبون: ${newestOrder.customerName || 'بدون اسم'} - محتويات: ${newestOrder.items || 'طلب فارغ'}`
                );
                showToast(`وصل طلب جديد من ${newestOrder.customerName || 'عميل'}!`);
              }
            }

            // 2. Chat messages check from customers on any order
            newOrders.forEach((o) => {
              const previousLen = lastChatLengthMap.current[o.id] !== undefined ? lastChatLengthMap.current[o.id] : (o.chat ? o.chat.length : 0);
              const currentChat = o.chat || [];
              const currentLen = currentChat.length;

              if (currentLen > previousLen) {
                const newMessages = currentChat.slice(previousLen);
                const customerMsg = newMessages.find((m: any) => m.sender === "customer");
                if (customerMsg) {
                  // Only notify if chat is not muted by staff
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
          newOrders.forEach((o) => {
            newChatLengthMap[o.id] = o.chat ? o.chat.length : 0;
          });
          lastChatLengthMap.current = newChatLengthMap;
          
          setOrders(newOrders);
          lastPendingIds.current = currentPendingIds;
          isFirstLoad.current = false;
          setLoading(false);
        },
        (err) => {
          console.error("Orders list error:", err);
          setError("خطأ في الاتصال بقاعدة البيانات (الطلبات)");
          setLoading(false);
        }
      );

      return () => {
        unsubStaff();
        unsubscribe();
      };
    } catch (err) {
      console.error("Setup error:", err);
      setError("حدث خطأ غير متوقع");
      setLoading(false);
    }
  }, [play, orgId]);

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

  useEffect(() => {
    if (!db || !orgId) return;
    const unsub = onSnapshot(doc(db, "organizations", orgId, "settings", "branding"), (docSnap) => {
      if (docSnap.exists()) {
        const bData = docSnap.data();
        setRestaurantName(bData.restaurantName || "مطعم البركة");
        setLogoUrl(bData.logoUrl || "/logo.png");
        setDeliveryEnabled(bData.deliveryEnabled !== false);
        setCurrency(bData.currency || "ريال يمني");
        setEnableSoundLoop(bData.enableSoundLoop !== false);
        setPrimaryColor(bData.primaryColor || "emerald");
      }
    });
    return () => unsub();
  }, [orgId]);

  useEffect(() => {
    if (!db || !orgId) return;
    const unsub = onSnapshot(doc(db, "organizations", orgId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const activePlan = data.subscriptionPlan || data.subscriptionTier || "tier1";
        setOrgData({ id: docSnap.id, ...data, subscriptionPlan: activePlan, subscriptionTier: activePlan });
      }
    });
    return () => unsub();
  }, [orgId]);

  const updateStatus = async (orderId: string, newStatus: Order["status"]) => {
    if (!currentStaff || !orgId || !db) return;
    
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
      const orderRef = doc(db, "organizations", orgId, "orders", orderId);
      const updates: any = {
        status: newStatus,
        updatedAt: serverTimestamp(),
        handledBy: currentStaff.id,
        staffName: currentStaff.name,
      };

      if (newStatus === "accepted") updates.acceptedBy = currentStaff.name;
      if (newStatus === "ready") updates.preparedBy = currentStaff.name;
      if (newStatus === "delivering") updates.dispatchedBy = currentStaff.name;
      if (newStatus === "completed") updates.deliveredBy = currentStaff.name;
      if (newStatus === "cancelled") updates.cancelledBy = "staff";

      // Append system message transition to chat
      const orderObj = orders.find(o => o.id === orderId);
      const existingChat = orderObj?.chat || [];
      
      let systemText = "";
      if (newStatus === "accepted") systemText = `تم قبول الطلب وبدأ التحضير بواسطة ${currentStaff.name} 👨‍🍳`;
      if (newStatus === "ready") systemText = `اكتمل تجهيز الطلب وهو جاهز للتسليم! (بواسطة ${currentStaff.name}) 🎉`;
      if (newStatus === "delivering") systemText = `الطلب مع المندوب ومباشرة التوصيل (بواسطة ${currentStaff.name}) 🚚`;
      if (newStatus === "completed") systemText = "تم تسليم الطلب وإنتهاء الخدمة بنجاح، شكراً لثقتكم! ❤️";
      if (newStatus === "cancelled") systemText = `تم إلغاء هذا الطلب بواسطة ${currentStaff.name} ❌`;

      if (systemText) {
        updates.chat = [...existingChat, {
          sender: "system",
          senderName: "النظام",
          text: systemText,
          createdAt: new Date().toISOString()
        }];
      }

      await updateDoc(orderRef, updates);

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
      }).catch(err => console.error("Error calling notify-order-status:", err));
    } catch (error) {
      console.error(error);
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
      }).catch(err => console.error("Error calling notify-order-status on pricing:", err));

      showToast("تم تحديث الفاتورة وإصدار كشف الحساب الفوري للعميل! 🎉");
      setPricingOrder(null);
    } catch (err) {
      console.error(err);
      showToast("فشل تحديث الفاتورة", true);
    } finally {
      setIsSavingPrice(false);
    }
  };

  const isManagerOrSupervisor = currentStaff && (
    currentStaff.role?.includes("مدير") || 
    currentStaff.role?.includes("مشرف")
  );

  const pendingOrders = orders.filter(o => o.status === "pending");
  const acceptedOrders = orders.filter(o => o.status === "accepted");
  const readyOrders = orders.filter(o => o.status === "ready");
  const deliveringOrders = orders.filter(o => o.status === "delivering");
  const completedOrders = orders.filter(o => o.status === "completed");
  const cancelledOrders = orders.filter(o => o.status === "cancelled");
  const inProgressOrders = orders.filter(o => o.status === "accepted" || o.status === "ready" || o.status === "delivering");
  const recentCompleted = orders.filter(o => o.status === "completed").slice(0, 5);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-all"
        >
          إعادة التحميل
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-sm font-bold text-slate-400">جاري تحميل واجهة العمليات الفورية...</h2>
        </div>
      </div>
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStaff && passcode === selectedStaff.passcode) {
      setCurrentStaff(selectedStaff);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  // Login Screen if no staff selected
  if (!currentStaff) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8"
        >
          <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shrink-0 border border-slate-800 overflow-hidden mb-6 p-0.5">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
          </div>
          
          <AnimatePresence mode="wait">
            {!selectedStaff ? (
              <motion.div
                key="select-staff"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h1 className="text-2xl font-black text-white mb-2">{restaurantName}</h1>
                <p className="text-slate-500 mb-8 font-medium">تسجيل دخول الموظفين - يرجى اختيار اسمك</p>
                
                <div className="space-y-3">
                  {staffList.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStaff(s)}
                      className="w-full flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-emerald-500 transition-all text-right group"
                    >
                      <div>
                        <div className="text-white font-bold">{s.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest">{s.role}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-emerald-500" />
                    </button>
                  ))}
                  {staffList.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
                      لم يتم إضافة موظفين بعد من لوحة الإدارة
                    </div>
                  )}
                </div>


              </motion.div>
            ) : (
              <motion.div
                key="enter-passcode"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button 
                  onClick={() => { setSelectedStaff(null); setPasscode(""); setLoginError(false); }}
                  className="text-slate-500 text-xs mb-4 flex items-center gap-1 hover:text-white"
                >
                   <ChevronRight className="w-4 h-4" /> عودة لقائمة الموظفين
                </button>
                <h1 className="text-2xl font-black text-white mb-2">أهلاً {selectedStaff.name}</h1>
                <p className="text-slate-500 mb-8 font-medium">يرجى إدخال الرمز السري الخاص بك</p>
                
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        autoFocus
                        type={showPasscode ? "text" : "password"}
                        value={passcode}
                        onChange={e => setPasscode(e.target.value)}
                        className={cn(
                          "w-full bg-slate-950 border rounded-xl px-12 py-4 text-center text-2xl font-black text-white outline-none transition-all",
                          showPasscode ? "tracking-normal text-xl" : "tracking-[0.5em]",
                          loginError ? "border-red-500" : "border-slate-800 focus:border-emerald-500"
                        )}
                        placeholder={showPasscode ? "الرمز" : "••••"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasscode(!showPasscode)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                      >
                        {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {loginError && <p className="text-red-500 text-xs text-center font-bold">الرمز السري غير صحيح!</p>}
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    دخول للنظام
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <Footer />
      </div>
    );
  }

  const expiresAtDate = orgData?.expiresAt ? (orgData.expiresAt.toDate ? orgData.expiresAt.toDate() : new Date(orgData.expiresAt)) : null;
  const isExpired = orgData ? ((expiresAtDate ? (expiresAtDate.getTime() < Date.now()) : false) || orgData.isSuspended === true) : false;

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

  const theme = COLOR_THEMES[primaryColor] || COLOR_THEMES.emerald;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col" dir="rtl">
      <div className="flex-1 flex flex-col max-w-screen-2xl mx-auto w-full">
        {/* Header */}
        <header className="p-4 md:px-8 bg-slate-900/40 backdrop-blur-md border-b border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 transition-all duration-300" id="staff-header">
          {/* Right Brand Group */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/10 shrink-0 transform hover:scale-105 transition-transform duration-200 border border-slate-800 overflow-hidden p-0.5">
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg md:text-xl font-black text-white tracking-tight leading-none">{restaurantName}</h1>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold mt-1.5 leading-none">لوحة متابعة العمليات الفورية</p>
              </div>
            </div>
            
            {/* Visual indicator for mobile */}
            <div className="md:hidden flex items-center gap-2">
              <span className="h-6 w-[1.5px] bg-slate-800"></span>
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-950/20 border border-red-900/30 active:scale-95 transition-all"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
          
          {/* Left Staff and Control Group */}
          <div className="hidden md:flex items-center justify-end gap-5">
            {/* Elegant Staff profile pill */}
            <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl px-4 py-2 hover:border-slate-700 hover:bg-slate-950/80 transition-all duration-250 shadow-inner group">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-black text-sm group-hover:bg-slate-755 group-hover:text-emerald-400 transition-colors">
                  {currentStaff.name ? currentStaff.name.charAt(0) : "👤"}
                </div>
                <span className="absolute -bottom-0.5 -left-0.5 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse"></span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-500 font-bold leading-none mb-1.5 uppercase tracking-tighter">الموظف الحالي</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white leading-none">{currentStaff.name}</span>
                  <span className={cn(
                    "text-[9px] font-black px-2 py-0.5 rounded-md leading-none border uppercase tracking-wide",
                    currentStaff.role?.includes("مدير") 
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                      : currentStaff.role?.includes("مشرف")
                      ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                      : currentStaff.role?.includes("شف") || currentStaff.role?.includes("طباخ") || currentStaff.role?.includes("مطبخ")
                      ? "bg-pink-500/15 border-pink-500/30 text-pink-400"
                      : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  )}>
                    {currentStaff.role || "موظف"}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-10 w-[1px] bg-slate-800"></div>

            {/* Elegant Notification Button */}
            <button 
              type="button"
              onClick={requestNotificationPermission}
              className={cn(
                "flex items-center justify-center w-11 h-11 rounded-2xl border transition-all active:scale-95 duration-200 cursor-pointer group",
                desktopPermission === "granted"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                  : cn(theme.badgeBg, "hover:opacity-95")
              )}
              title={desktopPermission === "granted" ? "إشعارات المتصفح: مفعّلة ✓" : "تفعيل الإشعارات الفورية"}
            >
               <Bell className={cn("w-5 h-5", desktopPermission !== "granted" && "animate-pulse")} />
            </button>

            {/* Premium Logout Button */}
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center justify-center w-11 h-11 rounded-2xl bg-red-950/15 border border-red-900/30 hover:bg-red-900/40 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/15 transition-all active:scale-95 duration-200 cursor-pointer group"
              title="تسجيل الخروج"
            >
               <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-350 transition-colors duration-200" />
            </button>
          </div>
        </header>

        {/* Sub Header / Real-time Meta Badges */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-black">
              شاشة التحكم والعمليات الموحدة
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="text-slate-400 font-bold hidden sm:inline">أهلاً بك، <span className="text-emerald-400 font-black">{currentStaff.name}</span></span>
            <span className="h-4 w-[1px] bg-slate-800 hidden sm:inline"></span>
            
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 px-2.5 py-1 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] text-slate-400 font-bold">نشاطك اليوم: <span className="text-white font-black">{orders.filter(o => o.staffName === currentStaff.name && o.status === "completed").length}</span></span>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 px-2.5 py-1 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-bold">قيد العمل: <span className="text-indigo-400 font-black">{orders.filter(o => o.staffName === currentStaff.name && (o.status === "accepted" || o.status === "ready" || o.status === "delivering")).length}</span></span>
            </div>
          </div>
        </div>

        <main className="flex-1 flex flex-col p-4 md:p-6 gap-6">
          <div className="flex-1 flex flex-col">
            
            {/* Main panel: Interactive massive status buttons (full width) */}
            <section className="w-full flex-1 flex flex-col gap-6 pb-6">
              {showExpiryWarning && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`p-5 rounded-[2rem] border-2 shadow-2xl relative overflow-hidden text-right shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
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
                          ? "تنبيه طاقم العمل: ينتهي اشتراك المتجر اليوم! 🚨" 
                          : expiryWarningLevel === 2 
                            ? "تنبيه لطاقم العمل: يقترب انتهاء الاشتراك (متبقي أقل من 3 أيام) ⚠️" 
                            : "تذكير لطاقم العمل: يقترب انتهاء اشتراك المتجر التجريبي/السنوي 📅"}
                      </h4>
                      <p className="text-slate-300 text-xs font-bold leading-relaxed">
                        {expiryWarningLevel === 3 
                          ? `نحيطكم علماً بأن اشتراك المتجر متوقف اليوم خلال أقل من 24 ساعة (${getRemainingTimeText()}). يُرجى تذكير إدارة المتجر بالتواصل مع مالك المنصة لسداد الاشتراك لتفادي إغلاق النظام.` 
                          : expiryWarningLevel === 2 
                            ? `يقترب المتجر من انتهاء ترخيصه الفعال بحلول 3 أيام (${getRemainingTimeText()}). نرجو إبلاغ مسؤول المنشأة بتسديد الفاتورة لضمان استمرارية تلقي طلبات زبائنكم.` 
                            : `تنبيه روتيني: شارف اشتراك النظام على الانتهاء خلال أسبوع (${getRemainingTimeText()}). يرجى الاستعداد لتسجيل التجديد مبكراً.`}
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

              {/* Welcome Summary Banner */}
              <div className="bg-gradient-to-br from-indigo-950/30 via-slate-900 to-indigo-900/10 border border-indigo-505 p-5 rounded-2rem shadow-xl relative overflow-hidden shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="absolute top-0 right-0 bottom-0 w-1 bg-indigo-505"></div>
                <div className="text-right">
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <span>أهلاً بك مجدداً، {currentStaff.name} 👋</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-black">{currentStaff.role}</span>
                  </h2>
                  <p className="text-slate-400 text-xs mt-1 font-semibold block">شاشات وأقسام التحكم بالطلبات سريعة الاستجابة. اضغط على أي قسم لمعاينته وإدارته بالكامل بمرونة.</p>
                </div>
                <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold">الطلبات اليومية</p>
                    <p className="text-lg font-black text-indigo-400">{orders.length}</p>
                  </div>
                  <div className="w-[1px] h-8 bg-slate-800"></div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold">إنجازاتك اليوم</p>
                    <p className="text-lg font-black text-emerald-400">{orders.filter(o => o.staffName === currentStaff.name && o.status === "completed").length}</p>
                  </div>
                </div>
              </div>

              {/* Huge Status Buttons Grid */}
              <div className={cn(
                "grid grid-cols-1 gap-4",
                deliveryEnabled ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"
              )}>
                
                {/* Button 1: Pending Orders */}
                <button
                  onClick={() => setSelectedStatusModal("pending")}
                  className={cn(
                    "bg-slate-900/50 border hover:bg-slate-900/80 text-right p-6 rounded-3xl transition-all duration-300 relative flex flex-col justify-between min-h-[160px] active:scale-[0.98] group overflow-hidden shadow-lg",
                    pendingOrders.length > 0 
                      ? "border-amber-500/40 shadow-amber-500/5 ring-1 ring-amber-500/20" 
                      : "border-slate-800/80 hover:border-slate-700"
                  )}
                >
                  {/* Visual pulse for new orders */}
                  {pendingOrders.length > 0 && (
                    <span className="absolute top-0 left-0 w-2 h-2 rounded-full bg-amber-500 m-4 animate-ping"></span>
                  )}
                  
                  <div className="flex justify-between items-start w-full mb-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/15 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
                      <Bell className="w-6 h-6" />
                    </div>
                    <span className={cn(
                      "text-3xl font-black font-mono px-3.5 py-1 rounded-2xl border transition-all",
                      pendingOrders.length > 0 
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20" 
                        : "bg-slate-950 text-slate-400 border-slate-800"
                    )}>
                      {pendingOrders.length}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-white font-black text-base group-hover:text-amber-400 transition-colors">الطلبات الجديدة (قيد الانتظار)</h3>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed font-semibold">طلبات جديدة مرسلة بانتظار التفويض والقبول للتحضير.</p>
                  </div>
                </button>

                {/* Button 2: In-Progress Orders */}
                <button
                  onClick={() => setSelectedStatusModal("accepted")}
                  className={cn(
                    "bg-slate-900/50 border hover:bg-slate-900/80 text-right p-6 rounded-3xl transition-all duration-300 relative flex flex-col justify-between min-h-[160px] active:scale-[0.98] group overflow-hidden shadow-lg",
                    acceptedOrders.length > 0 
                      ? "border-blue-500/40 shadow-blue-500/5" 
                      : "border-slate-800/80 hover:border-slate-700"
                  )}
                >
                  <div className="flex justify-between items-start w-full mb-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/15 text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                      <Package className="w-6 h-6" />
                    </div>
                    <span className={cn(
                      "text-3xl font-black font-mono px-3.5 py-1 rounded-2xl border transition-all",
                      acceptedOrders.length > 0 
                        ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20" 
                        : "bg-slate-950 text-slate-400 border-slate-800"
                    )}>
                      {acceptedOrders.length}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-white font-black text-base group-hover:text-blue-400 transition-colors">طلبات قيد التحضير والتجهيز</h3>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed font-semibold">الطلبات التي تم قبولها وجاري العمل على تجهيزها وتوفيرها حالياً.</p>
                  </div>
                </button>

                {/* Button 3: Ready Orders */}
                <button
                  onClick={() => setSelectedStatusModal("ready")}
                  className={cn(
                    "bg-slate-900/50 border hover:bg-slate-900/80 text-right p-6 rounded-3xl transition-all duration-300 relative flex flex-col justify-between min-h-[160px] active:scale-[0.98] group overflow-hidden shadow-lg",
                    readyOrders.length > 0 
                      ? "border-emerald-500/40 shadow-emerald-500/5 ring-1 ring-emerald-500/20" 
                      : "border-slate-800/80 hover:border-slate-700"
                  )}
                >
                  {/* Visual glow pulse for ready orders */}
                  {readyOrders.length > 0 && (
                    <span className="absolute top-0 left-0 w-2 h-2 rounded-full bg-emerald-500 m-4 animate-ping"></span>
                  )}

                  <div className="flex justify-between items-start w-full mb-4">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <span className={cn(
                      "text-3xl font-black font-mono px-3.5 py-1 rounded-2xl border transition-all",
                      readyOrders.length > 0 
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20" 
                        : "bg-slate-950 text-slate-400 border-slate-800"
                    )}>
                      {readyOrders.length}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-white font-black text-base group-hover:text-emerald-400 transition-colors">الطلبات الجاهزة للتسليم للعميل</h3>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed font-semibold">طلبات جاهزة للتسليم الفوري بانتظار استلام العميل لها.</p>
                  </div>
                </button>

                {/* Button for Delivering Orders (Conditionally rendered when delivery is enabled) */}
                {deliveryEnabled && (
                  <button
                    onClick={() => setSelectedStatusModal("delivering")}
                    className={cn(
                      "bg-slate-900/50 border hover:bg-slate-900/80 text-right p-6 rounded-3xl transition-all duration-300 relative flex flex-col justify-between min-h-[160px] active:scale-[0.98] group overflow-hidden shadow-lg",
                      deliveringOrders.length > 0 
                        ? "border-teal-500/40 shadow-teal-500/5 ring-1 ring-teal-500/20" 
                        : "border-slate-800/80 hover:border-slate-700"
                    )}
                  >
                    {/* Visual glow pulse for delivering orders */}
                    {deliveringOrders.length > 0 && (
                      <span className="absolute top-0 left-0 w-2 h-2 rounded-full bg-teal-500 m-4 animate-ping"></span>
                    )}

                    <div className="flex justify-between items-start w-full mb-4">
                      <div className="p-3 bg-teal-500/10 border border-teal-500/15 text-teal-400 rounded-2xl group-hover:scale-110 transition-transform">
                        <Truck className="w-6 h-6" />
                      </div>
                      <span className={cn(
                        "text-3xl font-black font-mono px-3.5 py-1 rounded-2xl border transition-all",
                        deliveringOrders.length > 0 
                          ? "bg-teal-600 text-white border-teal-500 shadow-md shadow-teal-500/20" 
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      )}>
                        {deliveringOrders.length}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-white font-black text-base group-hover:text-teal-400 transition-colors">الطلبات قيد التوصيل حالياً</h3>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed font-semibold">الطلبات التي تم إرسالها مع مندوب التوصيل وهي في طريقها للعملاء.</p>
                    </div>
                  </button>
                )}

                {/* Button 4: Completed Orders */}
                <button
                  onClick={() => setSelectedStatusModal("completed")}
                  className="bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 text-right p-6 rounded-3xl transition-all duration-300 relative flex flex-col justify-between min-h-[160px] active:scale-[0.98] group overflow-hidden shadow-lg"
                >
                  <div className="flex justify-between items-start w-full mb-4">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-505 text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black font-mono px-3.5 py-1 rounded-2xl border bg-slate-950 text-indigo-400 border-slate-800">
                      {completedOrders.length}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-white font-black text-base group-hover:text-indigo-400 transition-colors">الطلبات المكتملة والأرشيف اليومي</h3>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed font-semibold">الطلبات التي تم توصيلها للعملاء وإتمامها وحفظ دورتها بالكامل باليوم.</p>
                  </div>
                </button>

              </div>
            </section>

          </div>
        </main>

        {/* Footer Status Bar */}
        <footer className="h-10 bg-slate-900/60 border-t border-slate-850 px-6 flex items-center justify-between shrink-0 text-[10px] text-slate-450">
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-slate-400">بوابة الموظف النشطة</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold font-sans">تزامن مباشر وقوي عبر السحاب</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          </div>
        </footer>
        <Footer />
      </div>

      {/* Interactive Status Detailed Popups */}
      <AnimatePresence>
        {selectedStatusModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-45 flex items-end md:items-center justify-center p-0 md:p-4 shadow-2xl" dir="rtl">
            <motion.div
              initial={{ opacity: 0, y: "20%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "20%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full h-[100dvh] md:h-auto md:max-h-[85vh] md:max-w-4xl bg-slate-900 border-0 md:border border-slate-800 rounded-none md:rounded-3xl p-5 md:p-6 shadow-2xl relative flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-800 shrink-0 mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-slate-950 shrink-0",
                    selectedStatusModal === "pending" ? "bg-amber-500" :
                    selectedStatusModal === "accepted" ? "bg-blue-500" :
                    selectedStatusModal === "ready" ? "bg-emerald-500" :
                    selectedStatusModal === "delivering" ? "bg-teal-500" : "bg-indigo-500"
                  )}>
                    {selectedStatusModal === "pending" && <Bell className="w-5 h-5" />}
                    {selectedStatusModal === "accepted" && <Package className="w-5 h-5" />}
                    {selectedStatusModal === "ready" && <CheckCircle2 className="w-5 h-5" />}
                    {selectedStatusModal === "delivering" && <Truck className="w-5 h-5 text-slate-950" />}
                    {selectedStatusModal === "completed" && <CheckCircle className="w-5 h-5" />}
                  </div>
                  <div className="text-right">
                    <h2 className="text-lg font-black text-white leading-tight">
                      {selectedStatusModal === "pending" && `الطلبـات الجديـدة (${pendingOrders.length} طلب)`}
                      {selectedStatusModal === "accepted" && `الطلبات قيد التحضير والتجهيز (${acceptedOrders.length} طلب)`}
                      {selectedStatusModal === "ready" && `الطلبـات الجاهـزة للاستـلام (${readyOrders.length} طلب)`}
                      {selectedStatusModal === "delivering" && `الطلبات قيد التوصيل حالياً (${deliveringOrders.length} طلب)`}
                      {selectedStatusModal === "completed" && `الطلبات المكتملة والمغلقة اليوم (${completedOrders.length} طلب)`}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                      {selectedStatusModal === "pending" && "المراجعة والقبول وبدء جدولة التجهيز للعميل"}
                      {selectedStatusModal === "accepted" && "عمليات تحضير وتجهيز المنتجات والسلع وتلبية مخرجات العميل بدقة"}
                      {selectedStatusModal === "ready" && "الطلبات الجاهزة كلياً بانتظار استلام العميل في الموعد المختار"}
                      {selectedStatusModal === "delivering" && "الطلبات التي خرجت مع المندوب وفي طريقها لعنوان العميل الآن"}
                      {selectedStatusModal === "completed" && "سجلات المخرجات والعمليات المنجزة بالكامل باليوم الحالي"}
                    </p>
                  </div>
                </div>

                {/* Filters Row Inside Popup Header */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1">
                    <button
                      onClick={() => setActiveFilter("all")}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-black transition-all",
                        activeFilter === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                      )}
                    >
                      الكل
                    </button>
                    <button
                      onClick={() => setActiveFilter("mine")}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-black transition-all",
                        activeFilter === "mine" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                      )}
                    >
                      طلباتي
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedStatusModal(null)}
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all shrink-0"
                    title="إغلاق النافذة"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Items List Content Scroll Container */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {(() => {
                  const targetList = 
                    selectedStatusModal === "pending" ? pendingOrders :
                    selectedStatusModal === "accepted" ? acceptedOrders :
                    selectedStatusModal === "ready" ? readyOrders :
                    selectedStatusModal === "delivering" ? deliveringOrders : completedOrders;

                  const filteredList = targetList.filter(o => 
                    activeFilter === "all" || 
                    o.staffName === currentStaff.name || 
                    o.handledBy === currentStaff.id ||
                    o.acceptedBy === currentStaff.name || 
                    o.preparedBy === currentStaff.name || 
                    o.deliveredBy === currentStaff.name
                  );

                  if (filteredList.length === 0) {
                    return (
                      <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-slate-950/60 flex items-center justify-center border border-slate-800 text-slate-500">
                          {selectedStatusModal === "pending" && <Bell className="w-6 h-6 animate-pulse text-amber-500" />}
                          {selectedStatusModal === "accepted" && <Package className="w-6 h-6 text-blue-500" />}
                          {selectedStatusModal === "ready" && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                          {selectedStatusModal === "delivering" && <Truck className="w-6 h-6 text-teal-400 animate-pulse" />}
                          {selectedStatusModal === "completed" && <CheckCircle className="w-6 h-6 text-indigo-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-300">لا توجد أي طلبات في هذا القسم حالياً</p>
                          <p className="text-xs text-slate-500 mt-1">عند تلقي طلبات جديدة أو تحويل حالة الطلبات سوف تتم مزامنتها تلقائياً.</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredList.map((order) => {
                        const isReady = order.status === "ready";
                        return (
                          <motion.div
                            key={order.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "bg-slate-950 border border-slate-850 p-4 rounded-2xl relative shadow-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all group",
                              isReady && "border-emerald-500/30 bg-gradient-to-br from-slate-950 to-emerald-950/10"
                            )}
                          >
                            <div>
                              {/* Customer Profile Row */}
                              <div className="flex justify-between items-start mb-3 gap-2">
                                <div className="min-w-0 text-right">
                                  <h3 className="text-white font-black text-sm truncate leading-tight">{order.customerName}</h3>
                                  <p className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">{order.customerPhone}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  <span className="text-[9px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800 font-bold shrink-0">
                                    {order.createdAt && typeof order.createdAt.toDate === 'function' ? format(order.createdAt.toDate(), "HH:mm") : "..."}
                                  </span>
                                  {order.staffName && (
                                    <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-bold shrink-0">
                                      بواسطة: {order.staffName}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {order.chatRequested && (
                                <div className="mb-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-2.5 rounded-xl text-[10px] font-black flex items-center justify-between gap-1.5 animate-pulse" dir="rtl">
                                  <div className="flex items-center gap-1.5 font-sans">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-555 animate-ping shrink-0" />
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

                              {/* Custom date/time delivery banner */}
                              {order.deliveryDate && (
                                <div className="flex items-center gap-1.5 mb-2 bg-indigo-500/10 border border-indigo-500/15 p-2 rounded-xl text-indigo-400 text-[10px] font-mono justify-end">
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

                              {order.fulfillmentType && (
                                <div className="flex items-center gap-1.5 mb-2 p-2 rounded-xl text-[10px] font-bold justify-end border bg-slate-950 border-slate-800/60 leading-none">
                                  {order.fulfillmentType === "delivery" ? (
                                    <div className="flex items-center gap-1.5 text-emerald-400">
                                      <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      <span>توصيل للموقع</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 text-blue-400">
                                      <Store className="w-3.5 h-3.5 text-blue-450 shrink-0" />
                                      <span>استلام من الفرع</span>
                                    </div>
                                  )}
                                </div>
                              )}

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
                                        <span className="text-[9px] uppercase font-bold text-slate-500 block">رابط خرائط جوجل (GPS):</span>
                                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[150px] inline-block text-left" dir="ltr">{order.addressLocation}</span>
                                      </div>
                                      <a 
                                        href={order.addressLocation} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-all flex items-center justify-center gap-1 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/15 w-full sm:w-auto"
                                      >
                                        📍 فتح الموقع بالخريطة
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-right text-xs font-semibold leading-relaxed mb-3 text-slate-300 select-all whitespace-pre-wrap font-mono">
                                {order.items}
                              </div>

                              {order.notes && (
                                <div className="text-[10px] text-slate-400 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl mb-3 text-right">
                                  <strong className="text-amber-400 block mb-0.5">ملاحظات العميل:</strong>
                                  {order.notes}
                                </div>
                              )}

                              {/* Quick Invoice Details (Inform & Proceed) */}
                              {order.status !== "pending" && order.status !== "cancelled" && (
                                <div className="mb-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2 text-right">
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
                                      className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 active:scale-95 cursor-pointer"
                                    >
                                      {order.totalPrice !== undefined ? "✏️ تعديل الحساب" : "➕ إعداد الفاتورة السريعة"}
                                    </button>
                                  </div>
                                  {order.totalPrice !== undefined ? (
                                    <div className="bg-slate-950/80 border border-slate-900 rounded-lg p-2.5 space-y-1.5 text-xs font-semibold font-mono" dir="rtl">
                                      <div className="flex justify-between">
                                        <span className="text-slate-400 font-bold">قيمة المنتجات والقطع:</span>
                                        <span className="text-slate-200 font-bold">{order.totalPrice} {getCurrencyLabel(currency)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400 font-bold">رسوم التوصيل/الخدمة:</span>
                                        <span className="text-slate-200 font-bold">{order.deliveryPrice || 0} {getCurrencyLabel(currency)}</span>
                                      </div>
                                      <div className="flex justify-between border-t border-slate-900/80 pt-1.5 font-black text-slate-200">
                                        <span className="text-indigo-400">الإجمالي النهائي للطلب:</span>
                                        <span className="text-indigo-400 text-sm font-black">{(order.totalPrice || 0) + (order.deliveryPrice || 0)} {getCurrencyLabel(currency)}</span>
                                      </div>
                                      {order.pricingNotes && (
                                        <div className="text-[10px] text-slate-550 border-t border-slate-950/50 pt-1.5 font-bold leading-normal truncate" title={order.pricingNotes}>
                                          <span className="text-slate-400 block font-black mb-0.5">تفاصيل التسعير:</span>
                                          {order.pricingNotes}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-center py-2 text-[10px] text-slate-550 font-bold border border-dashed border-slate-800 rounded-lg bg-slate-950/40">
                                      💡 لم يتم تسعير الطلب للعميل بعد. انقر لتحديد السعر وإعلامه فوراً بقيمة طلباته ليستكمل الإجراءات.
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Staff Payment Status Alert Panel */}
                              {order.fulfillmentType === "delivery" && order.totalPrice !== undefined && (
                                <div className="bg-slate-900 border border-slate-950 rounded-xl p-3 mb-2 text-right text-xs">
                                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-950/40">
                                    <span className="font-black text-slate-300 flex items-center gap-1">
                                      <span>💳</span>
                                      <span>حالة دفع الفاتورة</span>
                                    </span>
                                    {order.paymentStatus === "checking" && (
                                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black animate-pulse">
                                        جاري التشييك... ⏳
                                      </span>
                                    )}
                                    {order.paymentStatus === "paid" && (
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black">
                                        تم الدفع ✔
                                      </span>
                                    )}
                                    {(!order.paymentStatus || order.paymentStatus === "unpaid") && (
                                      <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-900 text-slate-450 text-[9px] font-black">
                                        غير مدفوع 💸
                                      </span>
                                    )}
                                  </div>

                                  {order.paymentStatus === "checking" ? (
                                    <div className="space-y-1.5">
                                      <p className="text-[10px] text-amber-300/90 font-bold leading-relaxed">
                                        ⚠️ العميل حول المبلغ ويطلب الموافقة. تطابق من الرسالة الواردة من البنك أولاً:
                                      </p>
                                      {isManagerOrSupervisor ? (
                                        <div className="flex gap-1.5 font-bold">
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
                                                    text: "✅ تم قبول واعتماد دفعتك البنكية بنجاح من قبل الكادر. جاري التوصيل الآن.",
                                                    createdAt: new Date().toISOString()
                                                  }],
                                                  updatedAt: serverTimestamp()
                                                });
                                                showToast("تم اعتماد الدفع بنجاح");
                                              } catch (err) {
                                                console.error(err);
                                              }
                                            }}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-1 px-2 rounded-lg text-[10px] transition-all"
                                          >
                                            موافقة ✅
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
                                                }
                                              }
                                            }}
                                            className="bg-red-500/10 hover:bg-red-550 text-red-500 hover:text-white font-black py-1 px-2 rounded-lg text-[10px] transition-all"
                                          >
                                            رفض ❌
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="bg-slate-950/70 p-2.5 text-center text-red-400 font-bold border border-slate-900 rounded-lg text-[10px] leading-relaxed">
                                          ⚠️ اعتماد أو رفض الدفع متاح للمدير والمشرف فقط.
                                        </div>
                                      )}
                                    </div>
                                  ) : order.paymentStatus === "paid" ? (
                                    <div className="space-y-1 text-[10px] text-slate-450 font-bold leading-none flex items-center justify-between">
                                      <span className="text-emerald-400">🎯 تم استلام وإيداع المبلغ المالي كاملاً.</span>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          try {
                                            const ref = doc(db, "organizations", orgId, "orders", order.id);
                                            await updateDoc(ref, {
                                              paymentStatus: "unpaid",
                                              updatedAt: serverTimestamp()
                                            });
                                            showToast("تم إلغاء تأكيد الدفع");
                                          } catch (err) {
                                            console.error(err);
                                          }
                                        }}
                                        className="text-red-400 hover:text-red-300 underline font-normal cursor-pointer text-[9px]"
                                      >
                                        تراجع؟
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-slate-550 font-semibold leading-none">
                                      ⏳ بانتظار العميل لإرسال إيداع الحوالة...
                                    </p>
                                  )}
                                </div>
                              )}

                              <div className="flex gap-2 pt-2 border-t border-slate-900 transition-all shrink-0">
                                {order.status === "pending" && (
                                  <>
                                    <button 
                                      onClick={() => updateStatus(order.id, "accepted")}
                                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/10 active:scale-95 flex items-center justify-center gap-1"
                                    >
                                      <span>قبول وتجهيز الطلب</span>
                                    </button>
                                    {isManagerOrSupervisor && (
                                      <button 
                                        onClick={() => setOrderToCancel(order)}
                                        className="bg-red-600 hover:bg-red-500 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1 shadow-md shadow-red-500/10 shrink-0"
                                      >
                                        <span>رفض الطلب</span>
                                      </button>
                                    )}
                                  </>
                                )}

                                {order.status === "accepted" && (
                                  <>
                                    {order.fulfillmentType === "delivery" && deliveryEnabled ? (
                                      <button 
                                        onClick={() => updateStatus(order.id, "delivering")}
                                        className="flex-1 bg-teal-600 text-white text-xs font-black py-2.5 rounded-xl shadow-md shadow-teal-500/10 hover:bg-teal-500 transition-all active:scale-95 flex items-center justify-center gap-1"
                                      >
                                        <span>إتمام التجهيز وبدء التوصيل 🚚</span>
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => updateStatus(order.id, "ready")}
                                        className="flex-1 bg-blue-600 text-white text-xs font-black py-2.5 rounded-xl shadow-md shadow-blue-500/10 hover:bg-blue-500 transition-all active:scale-95 flex items-center justify-center gap-1"
                                      >
                                        <span>إتمام التجهيز وإشعار العميل</span>
                                      </button>
                                    )}
                                    {isManagerOrSupervisor && (
                                      <button 
                                        onClick={() => setOrderToCancel(order)}
                                        className="bg-slate-800/80 hover:bg-slate-700/80 text-red-400 border border-slate-755 text-xs font-black px-3.5 py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1 shrink-0"
                                        title="إلغاء العملية"
                                      >
                                        <span>إلغاء العملية</span>
                                      </button>
                                    )}
                                  </>
                                )}

                                {order.status === "ready" && (
                                  <>
                                    {order.fulfillmentType === "delivery" && deliveryEnabled ? (
                                      <button 
                                        onClick={() => updateStatus(order.id, "delivering")}
                                        className="flex-1 bg-teal-600 text-white text-xs font-black py-2.5 rounded-xl shadow-md shadow-teal-500/10 hover:bg-teal-500 transition-all active:scale-95 flex items-center justify-center gap-1"
                                      >
                                        <Truck className="w-3.5 h-3.5 text-white animate-pulse shrink-0" />
                                        <span>تسليم المندوب وبدء التوصيل</span>
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => updateStatus(order.id, "completed")}
                                        className="flex-1 bg-emerald-600 text-white text-xs font-black py-2.5 rounded-xl shadow-md shadow-emerald-500/10 hover:bg-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-1"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-white animate-pulse shrink-0" /> 
                                        <span>تسليم الطلب للعميل</span>
                                      </button>
                                    )}
                                    {isManagerOrSupervisor && (
                                      <button 
                                        onClick={() => setOrderToCancel(order)}
                                        className="bg-slate-800/80 hover:bg-slate-700/80 text-red-400 border border-slate-755 text-xs font-black px-3.5 py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1 shrink-0"
                                        title="إلغاء العملية"
                                      >
                                        <span>إلغاء العملية</span>
                                      </button>
                                    )}
                                  </>
                                )}

                                {order.status === "delivering" && (
                                  <>
                                    <button 
                                      onClick={() => updateStatus(order.id, "completed")}
                                      className="flex-1 bg-emerald-600 text-white text-xs font-black py-2.5 rounded-xl shadow-md shadow-emerald-500/10 hover:bg-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-1"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-white animate-bounce shrink-0" /> 
                                      <span>تأكيد إتمام توصيل الطلب للعميل ✔</span>
                                    </button>
                                    {isManagerOrSupervisor && (
                                      <button 
                                        onClick={() => setOrderToCancel(order)}
                                        className="bg-slate-800/80 hover:bg-slate-700/80 text-red-400 border border-slate-755 text-xs font-black px-3.5 py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1 shrink-0"
                                        title="إلغاء العملية"
                                      >
                                        <span>إلغاء العملية</span>
                                      </button>
                                    )}
                                  </>
                                )}

                                {order.status === "completed" && (
                                  <span className="text-xs font-bold text-slate-500 w-full text-center py-2 bg-slate-900 border border-slate-855 rounded-xl block">
                                    تم تسليم الطلب بواسطة: <span className="text-slate-300 font-extrabold">{order.deliveredBy || order.staffName || "الموظف"}</span>
                                  </span>
                                )}

                                {(orgData?.subscriptionPlan || orgData?.subscriptionTier || "tier1") === "tier1" ? (
                                  <a 
                                    href={order.customerPhone ? `https://wa.me/${order.customerPhone.replace(/[\s+()-]/g, '')}` : "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-xl transition-all relative border flex items-center justify-center shrink-0 active:scale-95 bg-emerald-600/15 hover:bg-emerald-600 border-emerald-500/20 hover:border-transparent text-emerald-400 hover:text-white"
                                    title="مراسلة العميل واتساب (قناة باقة اقتصادية لمجاراة الموانع)"
                                  >
                                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.51 5.284 3.509 8.486-.002 6.643-5.338 11.982-11.95 11.982-1.996-.001-3.959-.5-5.717-1.45L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.811 1.452 5.4 0 9.794-4.402 9.796-9.809a9.756 9.756 0 00-2.875-6.93 9.722 9.722 0 00-6.92-2.871C6.069 4.004 2.1 7.973 2.1 13.376c0 1.63.435 3.22 1.262 4.636l-.3 1.096c1.1.2 2.2-.1 3.25-.6l-.33-.2z"/>
                                    </svg>
                                    {order.chatRequested && (
                                      <>
                                        <span className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                                        <span className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-amber-500 border border-slate-900" />
                                      </>
                                    )}
                                  </a>
                                ) : (
                                  <button 
                                    onClick={() => setExpandedChatOrderId(expandedChatOrderId === order.id ? null : order.id)}
                                    className={cn(
                                      "p-2.5 rounded-xl transition-all relative border flex items-center justify-center shrink-0 active:scale-95",
                                      expandedChatOrderId === order.id 
                                        ? "bg-indigo-600 text-white border-transparent" 
                                        : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-350"
                                    )}
                                    title="الدردشة مع العميل"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                    {order.chat && order.chat.length > 0 && order.chat[order.chat.length - 1]?.sender === "customer" ? (
                                      <>
                                        <span className="absolute -top-0.5 -left-0.5 h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                                        <span className="absolute -top-0.5 -left-0.5 h-2 w-2 rounded-full bg-rose-500" />
                                      </>
                                    ) : order.chatRequested ? (
                                      <>
                                        <span className="absolute -top-0.5 -left-0.5 h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                                        <span className="absolute -top-0.5 -left-0.5 h-2 w-2 rounded-full bg-amber-500" />
                                      </>
                                    ) : null}
                                  </button>
                                )}
                              </div>

                              {/* Expandable Order Chat Panel for Staff */}
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
                                      
                                      {(orgData?.subscriptionPlan || orgData?.subscriptionTier || "tier1") === "tier2" && (
                                        <div className="bg-amber-500/15 border border-amber-500/20 p-2.5 rounded-2xl text-[10px] text-slate-350 font-semibold leading-relaxed">
                                          ⚠️ <span className="text-amber-500 font-black">كوتة الباقة المتقدمة (Standard):</span> تقتصر هذه الباقة على 50 محادثة عملاء/شهرياً فقط. للدردشة المفتوحة بلا حدود، يرجى ترقية الاشتراك للباقة الاحترافية السنوية.
                                        </div>
                                      )}
                                      {(orgData?.subscriptionPlan || orgData?.subscriptionTier || "tier1") === "tier3" && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/15 p-2 rounded-xl text-[9px] text-emerald-400 font-bold flex items-center justify-between">
                                          <span>🎯 الباقة الاحترافية مفعلة: خدمة دردشة مباشرة مفتوحة وبلا حدود تشغيلية</span>
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
                                                <span className="bg-slate-900 text-slate-500 text-[9px] px-2 py-0.5 rounded-full border border-slate-855 font-semibold my-0.5">
                                                  {msg.text}
                                                </span>
                                              ) : (
                                                <div className="max-w-[85%]">
                                                  <span className="text-[9px] text-slate-500 block mb-0.5 px-1 font-semibold leading-none text-right">
                                                    {isCustomer ? "الزبون" : msg.senderName || "فريق العمل"}
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
                                            senderName: currentStaff?.name || "الموظف",
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
                                              senderName: currentStaff?.name || "الموظف",
                                              text,
                                              restaurantName
                                            })
                                          }).catch(err => console.error("Failed to notify new staff chat:", err));
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
                                        className="flex-1 bg-slate-950 border border-slate-855 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-505 text-white placeholder-slate-650"
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
                            </div>
                          </motion.div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              {/* Popup Window Dialog Box bottom footer */}
              <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0 mt-3">
                <button
                  type="button"
                  onClick={() => setSelectedStatusModal(null)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-all active:scale-95 text-xs"
                >
                  إغلاق النافذة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 pb-20" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] p-6 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse">
                <LogOut className="w-6 h-6" />
              </div>
              
              <h3 className="text-lg font-black text-white mb-2 leading-tight">هل تريد تسجيل الخروج؟</h3>
              <p className="text-slate-400 text-xs font-semibold mb-6">هل أنت متأكد من رغبتك في تسجيل الخروج؟ سوف تحتاج لإدخال رمز المرور مجدداً.</p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStaff(null);
                    setSelectedStaff(null);
                    setShowLogoutConfirm(false);
                    setSelectedStatusModal(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-95 text-xs"
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
                تختلف شروط وطرق تفعيل الإشعارات باختلاف برامج التصفح وأنظمة التشغيل، إليك الدليل الشامل لتفعيلها بنجاح لضمان سماع وإرسال الطلبات:
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
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden"
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

              <div className="space-y-4 text-right">
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
                    className="w-full text-sm p-3.5 rounded-2xl border border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-600 font-mono text-center"
                    placeholder="مثال: 150"
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
                    className="w-full text-sm p-3.5 rounded-2xl border border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-600 font-mono text-center"
                    placeholder={deliveryEnabled ? "أدخل رسوم التوصيل (إلزامية)" : "مثال: 15 (اختياري - التوصيل معطل)"}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 mr-1 font-black">تفاصيل / شرح السعر الحسابي (اختياري)</label>
                  <textarea
                    rows={2}
                    value={pricingNotesVal}
                    onChange={(e) => setPricingNotesVal(e.target.value)}
                    className="w-full text-xs p-3.5 rounded-2xl border border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-slate-950 text-white placeholder-slate-600 resize-none font-sans"
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
                    className="bg-slate-800 hover:bg-slate-700 text-slate-350 font-bold px-4 py-3 rounded-2xl border border-slate-700 transition-all active:scale-95 text-xs font-bold"
                  >
                    تراجع
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
    </div>
  );
}
