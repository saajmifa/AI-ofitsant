import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Users, Star, ThumbsUp, DollarSign, Receipt, Share2, Printer } from 'lucide-react';
import { Bill } from '../types';

interface BillingSectionProps {
  subtotal: number;
  serviceCharge: number;
  grandTotal: number;
  tableNumber: string;
  onPayBill: (method: 'click' | 'payme' | 'uzcard' | 'cash', tip: number) => void;
  isPaid: boolean;
}

export default function BillingSection({
  subtotal,
  serviceCharge,
  grandTotal,
  tableNumber,
  onPayBill,
  isPaid,
}: BillingSectionProps) {
  const [splitCount, setSplitCount] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<'click' | 'payme' | 'uzcard' | 'cash'>('click');
  const [tipPercentage, setTipPercentage] = useState<number>(0);
  const [ratings, setRatings] = useState({ food: 5, service: 5, ai: 5 });
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const tips = [0, 5, 10, 15];
  const tipAmount = Math.round(subtotal * (tipPercentage / 100));
  const finalTotal = grandTotal + tipAmount;
  const splitAmount = Math.round(finalTotal / splitCount);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
  };

  const paymentGateways = [
    { key: 'click' as const, label: 'CLICK', color: 'border-indigo-100 hover:border-indigo-300 text-indigo-700 bg-indigo-50/20' },
    { key: 'payme' as const, label: 'Payme', color: 'border-teal-100 hover:border-teal-300 text-teal-700 bg-teal-50/20' },
    { key: 'uzcard' as const, label: 'Karta', color: 'border-sky-100 hover:border-sky-300 text-sky-700 bg-sky-50/20' },
    { key: 'cash' as const, label: 'Naqd pul', color: 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-neutral-50/40' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/60 p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-2.5 border-b border-neutral-100 pb-4">
        <div className="bg-neutral-50 p-2 rounded-lg border border-neutral-100 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-neutral-800" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-neutral-900">
            Hisob va To&apos;lov
          </h3>
          <p className="text-xs text-neutral-400 font-sans">
            Mavjud buyurtmalar va to&apos;lov amaliyotlari
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isPaid ? (
          <motion.div
            key="unpaid-billing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Friendly Hospitality Tip */}
            <div className="bg-amber-50/40 border border-amber-100/60 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed flex items-start space-x-2.5">
              <span className="text-base select-none">✨</span>
              <div>
                <span className="font-bold block text-amber-950 mb-0.5">Qulay To&apos;lov Tizimi</span>
                <span>Buyurtmani hoziroq elektron (Click/Payme) tarzda to&apos;lashingiz yoki taomlar stolingizga kelgach, xohishingizga ko&apos;ra to&apos;lov qilishingiz mumkin.</span>
              </div>
            </div>

            {/* Quick Bill Splitter */}
            <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-neutral-800 uppercase font-sans flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-[--color-primary-gold-dark]" />
                  <span>Hisobni bo&apos;lish</span>
                </span>
                <span className="text-xs font-bold text-[--color-primary-gold-dark] font-mono">
                  {splitCount} kishi
                </span>
              </div>
              
              <input
                id="split-count-range"
                type="range"
                min="1"
                max="10"
                value={splitCount}
                onChange={(e) => setSplitCount(parseInt(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-neutral-200 rounded-lg cursor-pointer focus:outline-none"
              />

              <div className="flex justify-between items-center text-xs text-neutral-500 font-mono pt-1">
                <span>Kishi boshiga:</span>
                <span className="text-sm font-bold text-neutral-900 font-mono">
                  {formatPrice(splitAmount)}
                </span>
              </div>
            </div>

            {/* Tip Selection */}
            <div>
              <label className="text-xs text-neutral-400 font-bold uppercase block mb-2">
                Choychaqa (Ixtiyoriy):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {tips.map((tip) => (
                  <button
                    key={tip}
                    onClick={() => setTipPercentage(tip)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      tipPercentage === tip
                        ? 'bg-neutral-950 border-neutral-950 text-white shadow-sm'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {tip === 0 ? '0%' : `${tip}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="border-t border-b border-neutral-100 py-3 space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-500 font-mono">
                <span>Oraliq jami:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-500 font-mono">
                <span>Xizmat haqi (10%):</span>
                <span>{formatPrice(serviceCharge)}</span>
              </div>
              {tipAmount > 0 && (
                <div className="flex justify-between text-xs text-neutral-500 font-mono">
                  <span>Choychaqa ({tipPercentage}%):</span>
                  <span>{formatPrice(tipAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-neutral-900 font-bold pt-1.5 font-mono">
                <span>To&apos;lov jami:</span>
                <span className="text-base text-neutral-950">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Payment gateways */}
            <div className="space-y-2.5">
              <label className="text-xs text-neutral-400 font-bold uppercase block">
                To&apos;lov usuli:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentGateways.map((gate) => (
                  <button
                    key={gate.key}
                    onClick={() => setSelectedMethod(gate.key)}
                    className={`p-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${gate.color} ${
                      selectedMethod === gate.key
                        ? 'ring-2 ring-neutral-950 border-transparent shadow-xs'
                        : 'opacity-85'
                    }`}
                  >
                    <span>{gate.label}</span>
                    <div className={`w-3.5 h-3.5 rounded-full border border-neutral-300 flex items-center justify-center p-0.5 ${
                      selectedMethod === gate.key ? 'bg-neutral-950 border-neutral-950 text-white' : ''
                    }`}>
                      {selectedMethod === gate.key && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onPayBill(selectedMethod, tipAmount)}
              className="w-full bg-[--color-primary-gold-dark] hover:bg-neutral-950 hover:text-white text-neutral-950 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-amber-500/10"
            >
              <CreditCard className="w-4 h-4" />
              <span>Hisobni To&apos;lash</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="paid-billing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Payment Successful Banner */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-emerald-950">
                  To&apos;lov muvaffaqiyatli amalga oshirildi!
                </h4>
                <p className="text-xs text-emerald-800 mt-1">
                  Stol №{tableNumber} uchun jami {formatPrice(finalTotal)} to&apos;landi. Tashrifingiz uchun rahmat!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-2 pt-1">
                <button
                  onClick={() => alert("Kvitansiya bosib chiqarilmoqda...")}
                  className="bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/80 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Chekni olish</span>
                </button>
                <button
                  onClick={() => alert("Do'stlarga yuborish havolasi nusxalandi!")}
                  className="bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/80 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Ulashish</span>
                </button>
              </div>
            </div>

            {/* Feedback section */}
            <div className="border-t border-neutral-100 pt-5">
              {!feedbackSubmitted ? (
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <h4 className="font-serif text-sm sm:text-base font-bold text-neutral-950">
                    Xizmatingiz qanday bo&apos;ldi?
                  </h4>
                  
                  {/* Rating items */}
                  <div className="space-y-3">
                    {[
                      { key: 'food' as const, label: 'Taomlar sifati' },
                      { key: 'service' as const, label: 'Xizmat ko&apos;rsatish' },
                      { key: 'ai' as const, label: 'AI Ofitsiant xizmati' },
                    ].map((ratingItem) => (
                      <div key={ratingItem.key} className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500 font-medium" dangerouslySetInnerHTML={{ __html: ratingItem.label }} />
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatings({ ...ratings, [ratingItem.key]: star })}
                              className="text-amber-400 hover:scale-110 transition-all cursor-pointer"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  star <= ratings[ratingItem.key] ? 'fill-current' : 'text-neutral-200'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comment Box */}
                  <div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Fikr va takliflaringizni yozing (ixtiyoriy)..."
                      rows={2}
                      className="w-full rounded-xl border border-neutral-200 p-3 text-xs focus:outline-none focus:border-[--color-primary-gold] bg-neutral-50"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-neutral-950 text-white hover:bg-[--color-primary-gold-dark] hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Fikrni yuborish
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 text-center space-y-1.5"
                >
                  <p className="text-xs sm:text-sm font-bold text-neutral-800">
                    Samimiy fikringiz uchun rahmat!
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Sizning sharhingiz restoran xizmatlarini yanada yaxshilashga yordam beradi.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
