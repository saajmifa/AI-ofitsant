import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, UserCheck, Utensils, Droplet, Trash2, X, Bell } from 'lucide-react';
import { CallRequest } from '../types';

interface ServiceRequestsProps {
  activeCalls: CallRequest[];
  onCallService: (type: 'waiter' | 'water' | 'cutlery' | 'clean') => void;
  onCancelCall: (id: string) => void;
}

export default function ServiceRequests({
  activeCalls,
  onCallService,
  onCancelCall,
}: ServiceRequestsProps) {
  const serviceTypes = [
    {
      key: 'waiter' as const,
      label: 'Ofitsiantni chaqirish',
      icon: Bell,
      color: 'bg-neutral-950 hover:bg-neutral-900 text-white',
      desc: 'Umumiy xizmat yoki savollar',
    },
    {
      key: 'water' as const,
      label: 'Muzdek suv olib kelish',
      icon: Droplet,
      color: 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/80',
      desc: 'Mineral yoki filtrlangan suv',
    },
    {
      key: 'cutlery' as const,
      label: 'Pichoq va vilka',
      icon: Utensils,
      color: 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/80',
      desc: 'Qo\'shimcha asbob-uskunalar',
    },
    {
      key: 'clean' as const,
      label: 'Stolni tozalash',
      icon: Trash2,
      color: 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/80',
      desc: 'Ortiqcha idishlarni olish',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/60 p-6 shadow-sm space-y-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-2.5 border-b border-neutral-100 pb-4 mb-4">
          <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-100 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-neutral-800" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-neutral-900">
              Ofitsiantni Chaqirish
            </h3>
            <p className="text-xs text-neutral-400 font-sans">
              Bir tugma bilan stolingizga jismoniy yordam chaqiring
            </p>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {serviceTypes.map((type) => {
            const isPending = activeCalls.some((c) => c.type === type.key);
            
            return (
              <button
                key={type.key}
                disabled={isPending}
                onClick={() => onCallService(type.key)}
                className={`p-4 rounded-2xl transition-all cursor-pointer text-left flex items-start space-x-3 group relative overflow-hidden ${type.color} ${
                  isPending ? 'opacity-40 cursor-not-allowed scale-98' : 'hover:shadow-md hover:scale-[1.01]'
                }`}
              >
                <div className={`p-2 rounded-xl flex items-center justify-center ${
                  type.key === 'waiter' ? 'bg-[--color-primary-gold] text-neutral-950' : 'bg-neutral-50 border border-neutral-200/40 text-neutral-700'
                }`}>
                  <type.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs sm:text-sm font-bold truncate leading-tight">
                    {type.label}
                  </span>
                  <span className="block text-[10px] text-neutral-400 mt-0.5 truncate leading-none">
                    {type.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Calls List with timers */}
      <div className="mt-4">
        <AnimatePresence>
          {activeCalls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2.5 pt-4 border-t border-neutral-100"
            >
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono block">
                Chaqirilgan xizmatlar statusi:
              </span>
              
              <div className="space-y-2">
                {activeCalls.map((call) => {
                  const label = serviceTypes.find((s) => s.key === call.type)?.label || 'Yordam';
                  
                  return (
                    <motion.div
                      key={call.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="bg-amber-50/70 border border-amber-100/80 rounded-2xl px-4 py-3 flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-2 h-2 bg-[--color-primary-gold] rounded-full animate-ping" />
                        <div>
                          <span className="block text-xs font-bold text-amber-950">
                            {label}
                          </span>
                          <span className="block text-[10px] text-amber-700 font-mono mt-0.5">
                            Ofitsiant yo&apos;lda • 1-2 daqiqada yetib keladi
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => onCancelCall(call.id)}
                        className="bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-neutral-700 p-1 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                        title="Chaqiruvni bekor qilish"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
