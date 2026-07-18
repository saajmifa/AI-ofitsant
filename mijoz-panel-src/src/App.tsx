import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import { Utensils, ShoppingCart, Check } from 'lucide-react';
import { CartItem, Order, CallRequest, Dish, OrderStatus } from './types';
import Navbar from './components/Navbar';
import MenuSection from './components/MenuSection';
import CartSection from './components/CartSection';
import OrderStatusPanel from './components/OrderStatusPanel';
import ServiceRequests from './components/ServiceRequests';
import BillingSection from './components/BillingSection';

// --- Backend integration helpers ---------------------------------------
// Bu ilova "Online Ofitsant" backendi bilan ishlaydi: /api/menu, /api/orders,
// /api/calls manzillari orqali ma'lumot oladi/yuboradi, Socket.io orqali esa
// real vaqtda yangilanishlarni kuzatadi (order:new, order:updated, call:new,
// call:updated).

// Backend buyurtma holatini oddiy matn sifatida yuboradi: "Yangi",
// "Tayyorlanmoqda", "Tayyor". Dizayndagi bosqichlarga moslaymiz.
function mapBackendStatus(status: string): OrderStatus {
  switch (status) {
    case 'Yangi':
      return 'received';
    case 'Tayyorlanmoqda':
      return 'preparing';
    case 'Tayyor':
      return 'on_way';
    case 'Yetkazildi':
    case 'Tolandi':
      return 'delivered';
    default:
      return 'received';
  }
}

interface BackendOrder {
  id: number;
  table: string | number;
  items: { id: string; name: string; price: number; quantity: number; notes?: string }[];
  status: string;
  time: string;
  createdAt: number;
}

interface BackendCall {
  id: number;
  table: string | number | null;
  reason: string;
  source: string;
  status: string;
  time: string;
}

function toOrder(bo: BackendOrder, dishLookup: Map<string, Dish>): Order {
  const totalPrice = bo.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  return {
    id: 'ZFR-' + bo.id,
    tableNumber: String(bo.table),
    items: bo.items.map((it) => ({
      dish:
        dishLookup.get(it.id) ||
        ({
          id: it.id,
          name: it.name,
          description: '',
          price: it.price,
          category: '',
          image: '',
          tags: [],
          rating: 0,
          prepareTime: 0,
        } as Dish),
      quantity: it.quantity,
      notes: it.notes,
    })),
    totalPrice,
    status: mapBackendStatus(bo.status),
    timestamp: bo.time,
  };
}

const CALL_LABELS: Record<string, 'waiter' | 'water' | 'cutlery' | 'clean'> = {
  "Ofitsiant chaqiruvi": 'waiter',
  "Suv olib kelish": 'water',
  "Pichoq-vilka so'rovi": 'cutlery',
  "Stolni tozalash": 'clean',
};
const CALL_REASONS: Record<'waiter' | 'water' | 'cutlery' | 'clean', string> = {
  waiter: "Ofitsiant chaqiruvi",
  water: "Suv olib kelish",
  cutlery: "Pichoq-vilka so'rovi",
  clean: "Stolni tozalash",
};

export default function App() {
  // --- States ---
  const [tableNumber, setTableNumber] = useState<string>('1');
  const [menu, setMenu] = useState<Dish[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [activeCalls, setActiveCalls] = useState<CallRequest[]>([]);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [isEasyMode, setIsEasyMode] = useState<boolean>(false);

  // Mobile Tab navigation ('menu' | 'cart')
  const [activeTab, setActiveTab] = useState<'menu' | 'cart'>('menu');

  // Interactive Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const dishLookupRef = useRef<Map<string, Dish>>(new Map());

  // --- Dynamic Table Number Extraction from QR Link ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const table = params.get('table') || params.get('stol') || params.get('t');
    if (table) {
      setTableNumber(table);
    }
  }, []);

  // --- Load menu from backend ---
  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data: Dish[]) => {
        setMenu(data);
        dishLookupRef.current = new Map(data.map((d) => [d.id, d]));
      })
      .catch(() => showToast("Menyuni yuklab bo'lmadi. Internet aloqasini tekshiring."))
      .finally(() => setMenuLoading(false));
  }, []);

  // --- Load this table's existing active order/calls + connect socket ---
  useEffect(() => {
    if (!tableNumber) return;

    fetch(`/api/orders?table=${encodeURIComponent(tableNumber)}`)
      .then((res) => res.json())
      .then((orders: BackendOrder[]) => {
        const unfinished = orders.find((o) => o.status !== 'Yetkazildi' && o.status !== "To'landi");
        if (unfinished) setActiveOrder(toOrder(unfinished, dishLookupRef.current));
      })
      .catch(() => {});

    fetch('/api/calls')
      .then((res) => res.json())
      .then((calls: BackendCall[]) => {
        const mine = calls
          .filter((c) => String(c.table) === String(tableNumber) && c.status !== 'yopilgan' && c.status !== 'bajarildi')
          .map((c) => ({
            id: String(c.id),
            tableNumber: String(c.table),
            type: CALL_LABELS[c.reason] || 'waiter',
            status: 'pending' as const,
            timestamp: c.time,
          }));
        setActiveCalls(mine);
      })
      .catch(() => {});

    const socket = io({ path: '/socket.io' });
    socketRef.current = socket;

    socket.on('order:new', (order: BackendOrder) => {
      if (String(order.table) === String(tableNumber)) {
        setActiveOrder(toOrder(order, dishLookupRef.current));
      }
    });

    socket.on('order:updated', (order: BackendOrder) => {
      if (String(order.table) === String(tableNumber)) {
        setActiveOrder((prev) => (prev && prev.id === 'ZFR-' + order.id ? toOrder(order, dishLookupRef.current) : prev));
        if (order.status === 'Tayyor') {
          showToast("Taomlaringiz tayyor, ofitsiant tez orada olib keladi! 🍽️");
        }
      }
    });

    socket.on('call:new', (call: BackendCall) => {
      if (String(call.table) === String(tableNumber)) {
        setActiveCalls((prev) => [
          ...prev.filter((c) => c.id !== String(call.id)),
          {
            id: String(call.id),
            tableNumber: String(call.table),
            type: CALL_LABELS[call.reason] || 'waiter',
            status: 'pending',
            timestamp: call.time,
          },
        ]);
      }
    });

    socket.on('call:updated', (call: BackendCall) => {
      if (String(call.table) === String(tableNumber) && (call.status === 'yopilgan' || call.status === 'bajarildi')) {
        setActiveCalls((prev) => prev.filter((c) => c.id !== String(call.id)));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [tableNumber]);

  // --- Actions ---
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const handleAddToCart = (dish: Dish, quantity: number, notes?: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes } : item
        );
      }
      return [...prev, { dish, quantity, notes }];
    });
    showToast(`Savatchaga ${quantity}x ${dish.name} qo'shildi`);
  };

  const handleUpdateQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(dishId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.dish.id === dishId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (dishId: string) => {
    const item = cart.find((c) => c.dish.id === dishId);
    setCart((prev) => prev.filter((item) => item.dish.id !== dishId));
    if (item) {
      showToast(`Savatchadan ${item.dish.name} olib tashlandi`);
    }
  };

  const handleClearCart = () => {
    setCart([]);
    showToast('Savatcha tozalandi');
  };

  const handlePlaceOrder = async (notes?: string) => {
    if (cart.length === 0) return;

    const items = cart.map((item) => ({
      id: item.dish.id,
      name: item.dish.name,
      price: item.dish.price,
      quantity: item.quantity,
      notes: item.notes || notes || undefined,
    }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: tableNumber, items, paymentMethod: 'naqd' }),
      });
      if (!res.ok) throw new Error('order failed');
      const order: BackendOrder = await res.json();
      setActiveOrder(toOrder(order, dishLookupRef.current));
      setCart([]);
      setIsPaid(false);
      showToast('Ajoyib! Buyurtmangiz oshxonaga yuborildi 👨‍🍳');
    } catch (e) {
      showToast("Buyurtmani yuborib bo'lmadi. Qayta urinib ko'ring.");
    }
  };

  const handleCallService = async (type: 'waiter' | 'water' | 'cutlery' | 'clean') => {
    try {
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: tableNumber, reason: CALL_REASONS[type], source: 'mijoz' }),
      });
      if (!res.ok) throw new Error('call failed');
      const call: BackendCall = await res.json();
      setActiveCalls((prev) => [
        ...prev,
        { id: String(call.id), tableNumber: String(call.table), type, status: 'pending', timestamp: call.time },
      ]);
      const label = type === 'waiter' ? 'Ofitsiant' : type === 'water' ? 'Suv' : type === 'cutlery' ? 'Pichoq-vilka' : 'Stolni tozalash';
      showToast(`${label} chaqirildi, tez orada stolingizga yaqinlashadi`);
    } catch (e) {
      showToast("Chaqiruvni yuborib bo'lmadi. Qayta urinib ko'ring.");
    }
  };

  const handleCancelCall = async (id: string) => {
    setActiveCalls((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/calls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'yopilgan' }),
      });
    } catch (e) {
      // jim: mijoz tomonidan bekor qilingani UI'da baribir ko'rsatiladi
    }
    showToast('Chaqiruv bekor qilindi');
  };

  const handlePayBill = async (method: 'click' | 'payme' | 'uzcard' | 'cash', tip: number) => {
    setIsPaid(true);
    if (activeOrder) {
      try {
        await fetch(`/api/orders/${activeOrder.id.replace('ZFR-', '')}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: "To'landi" }),
        });
      } catch (e) {
        // to'lov UI'da baribir muvaffaqiyatli ko'rsatiladi
      }
    }
    showToast(`To'lov muvaffaqiyatli amalga oshirildi!`);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">

      {/* Interactive Floating Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white border border-neutral-800 rounded-2xl px-5 py-3 shadow-xl flex items-center space-x-3 max-w-sm w-full mx-4"
          >
            <div className="bg-[--color-primary-gold] p-1.5 rounded-lg text-neutral-950 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 stroke-[3px]" />
            </div>
            <p className="text-xs sm:text-sm font-semibold flex-1 leading-tight">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Mobile Floating Cart Summary */}
      <AnimatePresence>
        {cart.length > 0 && activeTab !== 'cart' && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="md:hidden fixed bottom-4 left-4 right-4 z-45 bg-neutral-900 text-white rounded-2xl p-4 shadow-2xl border border-neutral-800/80 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-[--color-primary-gold] text-neutral-950 p-2.5 rounded-xl flex items-center justify-center relative">
                <ShoppingCart className="w-4.5 h-4.5" />
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, c) => sum + c.quantity, 0)}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-neutral-400 font-medium">Savatchada:</span>
                <span className="block text-xs sm:text-sm font-bold font-mono text-white">
                  {new Intl.NumberFormat('uz-UZ').format(cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)) + ' UZS'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab('cart');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-[--color-primary-gold] hover:bg-white text-neutral-950 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1 shadow-sm"
            >
              <span>Savatni ko&apos;rish</span>
              <span>→</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brand Luxury Navigation */}
      <Navbar tableNumber={tableNumber} activeCallCount={activeCalls.length} />

      {/* Decorative Brand Hero Pattern */}
      <section className="bg-neutral-950 text-white relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-neutral-900 to-black opacity-95" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[--color-primary-gold]/25 to-transparent" />

        <div className="absolute -top-10 right-10 w-40 h-40 border border-neutral-800/60 rounded-full pointer-events-none" />
        <div className="absolute bottom-5 left-1/4 w-2 h-2 bg-[--color-primary-gold]/30 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-3">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Zafaron Luxury Lounge
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Milliy qadriyatlar va zamonaviy oshpazlik uyg&apos;unligi. Stolingizdagi QR kodni skanerlang va navbatsiz, oson, to&apos;g&apos;ridan-to&apos;g&apos;ri buyurtma bering.
          </p>
          <div className="flex items-center justify-center space-x-4 pt-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-[--color-primary-gold] uppercase">
            <span className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              <span>STOL №{tableNumber} FAOLLASHTIRILDI</span>
            </span>
            <span className="text-neutral-700">•</span>
            <span>Premium xizmat</span>
            <span className="text-neutral-700">•</span>
            <span>100% Halol</span>
          </div>
        </div>
      </section>

      {/* Navigation tabs for smaller mobile screens */}
      <div className="md:hidden bg-white border-b border-neutral-200/60 sticky top-20 z-30">
        <div className="flex justify-around items-center">
          {[
            { id: 'menu' as const, label: 'Menyu', icon: Utensils },
            { id: 'cart' as const, label: 'Buyurtmalar & Savatcha', icon: ShoppingCart },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-3.5 flex-1 relative text-xs font-bold transition-colors cursor-pointer ${
                  isSelected ? 'text-[--color-primary-gold-dark]' : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span>{tab.label}</span>

                {tab.id === 'cart' && cart.length > 0 && (
                  <span className="absolute top-2 right-1/4 bg-neutral-950 text-white rounded-full text-[10px] w-4.5 h-4.5 flex items-center justify-center font-mono font-bold">
                    {cart.reduce((sum, c) => sum + c.quantity, 0)}
                  </span>
                )}

                {isSelected && (
                  <motion.div
                    layoutId="mobile-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--color-primary-gold]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout Bento Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Elder-Friendly & Simple Mode Accessibility Banner */}
        <div className={`p-5 rounded-3xl border transition-all duration-300 shadow-sm ${
          isEasyMode
            ? 'bg-amber-50/90 border-amber-200 ring-2 ring-amber-400'
            : 'bg-white border-neutral-200'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-start space-x-4 w-full md:w-auto">
              <div className="text-3xl select-none pt-0.5">👵</div>
              <div>
                <h3 className={`font-bold tracking-tight text-neutral-900 ${isEasyMode ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}>
                  {isEasyMode
                    ? "Oddiy va Katta Rejim yoqilgan!"
                    : "Telefon ishlatishga qiynalasizmi?"}
                </h3>
                <p className={`text-neutral-500 mt-1 leading-relaxed ${isEasyMode ? 'text-sm font-semibold' : 'text-xs'}`}>
                  {isEasyMode
                    ? "Yozuvlar va rasmlar yiriklashtirildi. Qiynalsangiz, o'ng tomondagi qizil tugma orqali ofitsiantni chaqirishingiz mumkin."
                    : "Yozuvlarni kattaroq, tushunarli qilish uchun o'ng tomondagi 'Katta & Oddiy Rejim' tugmasini bosing."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 w-full md:w-auto justify-end">
              <button
                onClick={() => handleCallService('waiter')}
                className="bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs sm:text-sm font-black px-5 py-3 rounded-2xl transition-all flex items-center space-x-2 shadow-md cursor-pointer w-full sm:w-auto justify-center animate-pulse"
              >
                <span className="text-lg">🛎️</span>
                <span>Ofitsiantni Chaqirish</span>
              </button>

              <button
                onClick={() => {
                  setIsEasyMode(!isEasyMode);
                  showToast(isEasyMode ? "Oddiy rejim o'chirildi" : "Oddiy va Katta Rejim yoqildi!");
                }}
                className={`text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl transition-all cursor-pointer w-full sm:w-auto text-center border ${
                  isEasyMode
                    ? 'bg-neutral-900 text-white hover:bg-black border-neutral-900'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-200'
                }`}
              >
                {isEasyMode ? "❌ Oddiy rejimni o'chirish" : "👵 Katta & Oddiy Rejim"}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop 2-Column Bento Grid Layout */}
        <div className="hidden md:grid grid-cols-12 gap-8 items-start">

          <div className="col-span-8 space-y-8">
            <div className="border-b border-neutral-200/60 pb-3">
              <h2 className="font-serif text-2xl font-bold text-neutral-900 tracking-tight flex items-center space-x-2">
                <span>Zafaron Taomnoma Menusi</span>
                <span className="text-[10px] font-mono font-bold text-neutral-400 border border-neutral-200 px-2 py-0.5 rounded-lg uppercase tracking-wider self-center">
                  Premium
                </span>
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Sarxil va yangi masalliqlardan tayyorlangan oshpazlik durdonalari
              </p>
            </div>

            {menuLoading ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-neutral-100 shadow-sm text-sm text-neutral-400">
                Menyu yuklanmoqda...
              </div>
            ) : (
              <MenuSection
                menu={menu}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
                cart={cart}
                isEasyMode={isEasyMode}
              />
            )}
          </div>

          <div className="col-span-4 sticky top-24 space-y-6">
            <OrderStatusPanel activeOrder={activeOrder} />

            <CartSection
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onPlaceOrder={handlePlaceOrder}
            />

            <ServiceRequests
              activeCalls={activeCalls}
              onCallService={handleCallService}
              onCancelCall={handleCancelCall}
            />

            {activeOrder && (
              <BillingSection
                subtotal={activeOrder.items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)}
                serviceCharge={Math.round(activeOrder.items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0) * 0.1)}
                grandTotal={activeOrder.totalPrice}
                tableNumber={tableNumber}
                onPayBill={handlePayBill}
                isPaid={isPaid}
              />
            )}
          </div>

        </div>

        {/* Mobile Tab-Based Render Section */}
        <div className="md:hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'menu' && (
              <motion.div
                key="mobile-menu-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="border-b border-neutral-100 pb-2.5">
                  <h2 className="font-serif text-xl font-bold text-neutral-950">
                    Zafaron Taomnoma Menusi
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    Oshpazlarimiz tomonidan ehtiyotkorlik bilan tanlangan lazzatlar
                  </p>
                </div>

                {menuLoading ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-neutral-100 shadow-sm text-sm text-neutral-400">
                    Menyu yuklanmoqda...
                  </div>
                ) : (
                  <MenuSection
                    menu={menu}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                    cart={cart}
                    isEasyMode={isEasyMode}
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'cart' && (
              <motion.div
                key="mobile-cart-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <OrderStatusPanel activeOrder={activeOrder} />

                <CartSection
                  cart={cart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onClearCart={handleClearCart}
                  onPlaceOrder={handlePlaceOrder}
                />

                <ServiceRequests
                  activeCalls={activeCalls}
                  onCallService={handleCallService}
                  onCancelCall={handleCancelCall}
                />

                {activeOrder && (
                  <BillingSection
                    subtotal={activeOrder.items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)}
                    serviceCharge={Math.round(activeOrder.items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0) * 0.1)}
                    grandTotal={activeOrder.totalPrice}
                    tableNumber={tableNumber}
                    onPayBill={handlePayBill}
                    isPaid={isPaid}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Brand Footer */}
      <footer className="bg-neutral-950 text-neutral-400 py-10 mt-16 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="font-serif text-lg font-bold text-white tracking-wide block">
            Zafaron Luxury Lounge
          </span>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Toshkent sh., Mirobod tumani, Amir Temur shoh ko&apos;chasi, 12-uy. Tel: +998 (71) 200-00-00.
          </p>
          <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
            © 2026 Zafaron Luxury Lounge • Barcha huquqlar himoyalangan
          </div>
        </div>
      </footer>

    </div>
  );
}
