import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Trash2, ArrowRight, MessageSquare, Check, X } from 'lucide-react';
import { CartItem, Dish } from '../types';

interface CartSectionProps {
  cart: CartItem[];
  onUpdateQuantity: (dishId: string, quantity: number) => void;
  onRemoveItem: (dishId: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (notes?: string) => void;
}

export default function CartSection({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
}: CartSectionProps) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [generalNotes, setGeneralNotes] = useState('');
  const [activeNotesId, setActiveNotesId] = useState<string | null>(null);
  const [itemNote, setItemNote] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const serviceCharge = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + serviceCharge;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';
  };

  const handleSaveItemNote = (dishId: string) => {
    onUpdateQuantity(dishId, cart.find(c => c.dish.id === dishId)?.quantity || 1);
    const item = cart.find(c => c.dish.id === dishId);
    if (item) {
      item.notes = itemNote;
    }
    setActiveNotesId(null);
    setItemNote('');
  };

  const handleOpenNoteField = (dishId: string, currentNote = '') => {
    setActiveNotesId(dishId);
    setItemNote(currentNote);
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/60 p-6 shadow-sm flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-100 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-neutral-800" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-neutral-900">
                Sizning Savatchangiz
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                {cart.length} xil taom
              </p>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Tozalash</span>
            </button>
          )}
        </div>

        {/* Cart Item list */}
        <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div
                key={item.dish.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="border-b border-neutral-100/60 pb-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-neutral-800 font-sans">
                      {item.dish.name}
                    </h4>
                    <span className="text-xs text-neutral-400 font-mono">
                      {formatPrice(item.dish.price)}
                    </span>
                    
                    {/* Display Saved Notes */}
                    {item.notes && (
                      <div className="mt-1 text-[11px] text-amber-600 bg-amber-50/50 rounded-lg px-2 py-1 flex items-center space-x-1 border border-amber-100/40">
                        <MessageSquare className="w-3 h-3 flex-shrink-0" />
                        <span className="line-clamp-1 italic">Izoh: &quot;{item.notes}&quot;</span>
                      </div>
                    )}
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center bg-neutral-50 border border-neutral-200/40 rounded-xl overflow-hidden h-7">
                      <button
                        onClick={() => onUpdateQuantity(item.dish.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold font-mono text-neutral-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.dish.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Inline note toggle or input */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenNoteField(item.dish.id, item.notes || '')}
                        className="text-[10px] text-neutral-400 hover:text-[--color-primary-gold-dark] font-medium flex items-center space-x-0.5 cursor-pointer"
                      >
                        <MessageSquare className="w-2.5 h-2.5" />
                        <span>Izoh yozish</span>
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.dish.id)}
                        className="text-[10px] text-red-400 hover:text-red-600 font-medium cursor-pointer"
                      >
                        O&apos;chirish
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Note Box */}
                {activeNotesId === item.dish.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center space-x-1.5"
                  >
                    <input
                      type="text"
                      placeholder="Masalan: piyozsiz, achchiq bo'lmasin..."
                      value={itemNote}
                      onChange={(e) => setItemNote(e.target.value)}
                      className="flex-1 text-xs px-2.5 py-1 rounded-lg border border-neutral-200 focus:outline-none focus:border-[--color-primary-gold] bg-neutral-50"
                    />
                    <button
                      onClick={() => handleSaveItemNote(item.dish.id)}
                      className="bg-neutral-900 text-white p-1 rounded-lg hover:bg-neutral-800 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveNotesId(null)}
                      className="bg-neutral-100 text-neutral-500 p-1 rounded-lg hover:bg-neutral-200 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {cart.length === 0 && (
            <div className="text-center py-12 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 font-medium font-sans">
                Savatchangiz bo&apos;sh.
              </p>
              <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                Menyudan taom tanlang yoki AI Ofitsiantdan so&apos;rang.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="mt-6 border-t border-neutral-100 pt-4 space-y-3.5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-500 font-mono">
              <span>Oraliq jami:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-500 font-mono">
              <span>Xizmat haqi (10%):</span>
              <span>{formatPrice(serviceCharge)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-900 font-bold border-t border-dashed border-neutral-200 pt-2 font-mono">
              <span>Umumiy jami:</span>
              <span className="text-neutral-950">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <button
            onClick={() => setShowOrderModal(true)}
            className="w-full bg-neutral-950 text-white hover:bg-[--color-primary-gold-dark] hover:text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer group"
          >
            <span>Buyurtmani Rasmiylashtirish</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-neutral-100 max-w-md w-full p-6 shadow-xl relative"
          >
            <h3 className="font-serif text-xl font-bold text-neutral-950 mb-1">
              Oshxonaga yuborish
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mb-4">
              Buyurtmangiz oshxona oshpazlariga yuboriladi va tayyorlash boshlanadi.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs text-neutral-400 font-semibold uppercase block mb-1">
                  Oshxonaga qo&apos;shimcha tilak yoki eslatma:
                </label>
                <textarea
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Masalan: qovurg'ali go'shtidan bo'lsin, salat muzdek bo'lsin, barcha taomlar birga olib kelinsin..."
                  rows={3}
                  className="w-full rounded-xl border border-neutral-200 p-3 text-xs focus:outline-none focus:border-[--color-primary-gold] focus:ring-1 focus:ring-[--color-primary-gold] bg-neutral-50"
                />
              </div>

              {/* Mini receipt list */}
              <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-3 max-h-32 overflow-y-auto">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block mb-2">Buyurtma tarkibi:</span>
                <div className="space-y-1">
                  {cart.map((item) => (
                    <div key={item.dish.id} className="flex justify-between text-xs text-neutral-600 font-mono">
                      <span>{item.dish.name} x{item.quantity}</span>
                      <span>{formatPrice(item.dish.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowOrderModal(false)}
                className="flex-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  onPlaceOrder(generalNotes);
                  setShowOrderModal(false);
                  setGeneralNotes('');
                }}
                className="flex-1 bg-neutral-950 hover:bg-neutral-900 text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Tasdiqlayman</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
