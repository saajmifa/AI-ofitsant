import { motion } from 'motion/react';
import { ChefHat, Bell, HelpCircle } from 'lucide-react';

interface NavbarProps {
  tableNumber: string;
  activeCallCount: number;
}

export default function Navbar({ tableNumber, activeCallCount }: NavbarProps) {
  return (
    <motion.header
      id="navbar-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-neutral-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="bg-neutral-950 text-[--color-primary-gold] p-2.5 rounded-xl border border-neutral-800 shadow-inner flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 block leading-tight">
                Zafaron
              </span>
              <span className="text-[10px] sm:text-xs font-mono tracking-widest text-[--color-primary-gold-dark] uppercase font-semibold block">
                Luxury Lounge
              </span>
            </div>
          </div>

          {/* Quick Table Selector and Assistance Badge */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Table Number Badge */}
            <div className="flex items-center bg-neutral-950 text-white border border-neutral-800 rounded-xl px-3.5 py-1.5 shadow-sm transition-all">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-2" />
              <span className="text-[10px] text-neutral-400 font-bold tracking-wider mr-1.5 font-sans select-none hidden sm:inline">STOL:</span>
              <span className="text-xs sm:text-sm font-black font-mono text-[--color-primary-gold]">
                №{tableNumber}
              </span>
            </div>

            {/* Assistance Status Bell */}
            <div className="relative">
              <button
                id="nav-assistance-btn"
                className="p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 transition-all flex items-center justify-center"
                title="Chaqirilgan xizmatlar"
              >
                <Bell className="w-4 h-4" />
                {activeCallCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono"
                  >
                    {activeCallCount}
                  </motion.span>
                )}
              </button>
            </div>

            {/* Premium Guide Help */}
            <div className="hidden md:flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer text-sm font-medium space-x-1 transition-all">
              <HelpCircle className="w-4 h-4" />
              <span className="text-xs">Yordam</span>
            </div>

          </div>

        </div>
      </div>
    </motion.header>
  );
}
