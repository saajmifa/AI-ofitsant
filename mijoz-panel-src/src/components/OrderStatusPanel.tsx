import React from 'react';
import { motion } from 'motion/react';
import { ChefHat, ShoppingBag, Truck, CheckCircle2, Loader2 } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderStatusPanelProps {
  activeOrder: Order | null;
}

export default function OrderStatusPanel({ activeOrder }: OrderStatusPanelProps) {
  if (!activeOrder) return null;

  const statuses: { key: OrderStatus; label: string; icon: React.ComponentType<any>; desc: string }[] = [
    {
      key: 'received',
      label: 'Qabul qilindi',
      icon: ShoppingBag,
      desc: 'Oshxona buyurtmangizni qabul qildi',
    },
    {
      key: 'preparing',
      label: 'Tayyorlanmoqda',
      icon: ChefHat,
      desc: 'Siz uchun mahoratli oshpazlarimiz pishirmoqda',
    },
    {
      key: 'on_way',
      label: 'Ofitsiant yo\'lda',
      icon: Truck,
      desc: 'Taomlar tayyor, stolingizga olib kelinmoqda',
    },
    {
      key: 'delivered',
      label: 'Yetkazildi',
      icon: CheckCircle2,
      desc: 'Yoqimli ishtaha! Taomlar stolingizda',
    },
  ];

  const getStatusIndex = (status: OrderStatus) => {
    return statuses.findIndex((s) => s.key === status);
  };

  const currentIndex = getStatusIndex(activeOrder.status);

  return (
    <motion.div
      id="order-status-panel"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-neutral-200/60 p-6 shadow-sm space-y-6"
    >
      {/* Header with timer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-4 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 bg-[--color-primary-gold] rounded-full animate-pulse" />
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-900">
              Buyurtmangiz Holati
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              ID: {activeOrder.id} • Stol №{activeOrder.tableNumber}
            </p>
          </div>
        </div>
        
        {/* Live status indicator */}
        {activeOrder.status !== 'delivered' ? (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-1.5 flex items-center space-x-2 self-start sm:self-auto">
            <Loader2 className="w-4 h-4 text-[--color-primary-gold-dark] animate-spin" />
            <span className="text-xs text-amber-900 font-bold font-sans">{statuses[currentIndex]?.label || 'Kutilmoqda'}</span>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5 flex items-center space-x-1.5 self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-emerald-900 font-bold uppercase font-sans">Yetkazildi</span>
          </div>
        )}
      </div>

      {/* Progress timeline */}
      <div className="relative">
        {/* Line Behind */}
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-neutral-100 -z-0 hidden md:block" />
        
        {/* Colored Progress Line */}
        {currentIndex > 0 && (
          <div
            className="absolute top-5 left-6 h-0.5 bg-[--color-primary-gold] -z-0 hidden md:block transition-all duration-1000"
            style={{ width: `${(currentIndex / (statuses.length - 1)) * 92}%` }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative z-10">
          {statuses.map((status, index) => {
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            const isPending = index > currentIndex;
            const Icon = status.icon;

            return (
              <div
                key={status.key}
                className={`flex md:flex-col items-start md:items-center md:text-center gap-4 md:gap-2.5 transition-all ${
                  isActive ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                }`}
              >
                {/* Node circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0 ${
                    isCompleted
                      ? 'bg-[--color-primary-gold] border-[--color-primary-gold] text-neutral-950 shadow-md shadow-[--color-primary-gold]/20'
                      : isActive
                      ? 'bg-neutral-950 border-neutral-950 text-[--color-primary-gold] ring-4 ring-neutral-100 shadow-md scale-105'
                      : 'bg-white border-neutral-200 text-neutral-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Node info */}
                <div>
                  <h4
                    className={`text-xs sm:text-sm font-bold ${
                      isActive ? 'text-neutral-950' : isCompleted ? 'text-neutral-800' : 'text-neutral-500'
                    }`}
                  >
                    {status.label}
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5 md:hidden lg:block leading-tight">
                    {status.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ordered Items summary */}
      <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-4">
        <h4 className="text-xs text-neutral-400 font-bold uppercase tracking-wider font-mono mb-2.5">
          Buyurtma ro&apos;yxati
        </h4>
        <div className="space-y-2.5">
          {activeOrder.items.map((item) => (
            <div key={item.dish.id} className="flex justify-between items-center text-xs text-neutral-700 font-mono">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-neutral-200/60 flex items-center justify-center text-[10px] font-bold text-neutral-800 font-mono">
                  {item.quantity}x
                </span>
                <span className="font-sans font-medium text-neutral-800">{item.dish.name}</span>
                {item.notes && (
                  <span className="text-[10px] font-sans italic text-amber-600 bg-amber-50 border border-amber-100/40 px-1.5 py-0.5 rounded-md">
                    &quot;{item.notes}&quot;
                  </span>
                )}
              </div>
              <span className="font-semibold text-neutral-950">
                {new Intl.NumberFormat('uz-UZ').format(item.dish.price * item.quantity)} UZS
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
