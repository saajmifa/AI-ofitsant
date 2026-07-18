import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Clock, Star, Plus, Minus, Check } from 'lucide-react';
import { Dish, CartItem } from '../types';

interface MenuSectionProps {
  menu: Dish[];
  onAddToCart: (dish: Dish, quantity: number) => void;
  onUpdateQuantity: (dishId: string, quantity: number) => void;
  cart: CartItem[];
  isEasyMode?: boolean;
}

export default function MenuSection({
  menu,
  onAddToCart,
  onUpdateQuantity,
  cart,
  isEasyMode = false,
}: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { name: 'Barchasi', icon: '🍽️' },
    { name: 'Milliy Taomlar', icon: '🇺🇿' },
    { name: 'Salatlar', icon: '🥗' },
    { name: 'Shirinliklar', icon: '🍰' },
    { name: 'Ichimliklar', icon: '🥤' }
  ];

  // Filter menu items
  const filteredMenu = menu.filter((dish) => {
    const matchesCategory = selectedCategory === 'Barchasi' || dish.category === selectedCategory;
    const matchesSearch =
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';
  };

  const getCartQuantity = (dishId: string) => {
    const item = cart.find((c) => c.dish.id === dishId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-6">
      {/* Category Navigation & Search bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Category Pill Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth w-full md:w-auto">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`transition-all whitespace-nowrap cursor-pointer flex items-center space-x-2 rounded-full ${
                  isEasyMode
                    ? isActive
                      ? 'bg-neutral-950 text-white shadow-md font-black px-6 py-4 text-base sm:text-lg border-2 border-neutral-950'
                      : 'bg-white text-neutral-800 hover:text-neutral-900 hover:bg-neutral-100 border-2 border-neutral-300 px-6 py-4 text-base sm:text-lg'
                    : isActive
                      ? 'bg-neutral-950 text-white shadow-sm font-semibold px-4 py-2.5 text-xs sm:text-sm'
                      : 'bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/60 px-4 py-2.5 text-xs sm:text-sm'
                }`}
              >
                <span className={isEasyMode ? "text-xl sm:text-2xl" : "text-sm"}>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input with Clear Button */}
        <div className={`relative w-full ${isEasyMode ? 'md:w-96' : 'md:w-80'}`}>
          <span className="absolute inset-y-0 left-3.5 flex items-center text-neutral-400 pointer-events-none">
            <Search className={isEasyMode ? "w-5 h-5 text-neutral-500" : "w-4 h-4"} />
          </span>
          <input
            id="menu-search-input"
            type="text"
            placeholder={isEasyMode ? "Nima yeyishni xohlaysiz? Qidirish..." : "Taom yoki ichimlik qidirish..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-11 pr-11 bg-white border focus:outline-none focus:ring-4 focus:ring-[--color-primary-gold]/20 focus:border-[--color-primary-gold] text-neutral-800 shadow-sm transition-all rounded-full ${
              isEasyMode 
                ? 'py-4 text-base sm:text-lg border-2 border-neutral-300 font-medium' 
                : 'py-2.5 text-sm border-neutral-200/80'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors p-1"
              title="Tozalash"
            >
              <Minus className="w-4 h-4 bg-neutral-100 rounded-full text-neutral-500 hover:bg-neutral-200 p-0.5" />
            </button>
          )}
        </div>

      </div>

      {/* Bento Grid */}
      <motion.div
        layout
        className={isEasyMode ? "grid grid-cols-1 gap-8 max-w-3xl mx-auto" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}
      >
        <AnimatePresence mode="popLayout">
          {filteredMenu.map((dish) => {
            const qty = getCartQuantity(dish.id);

            return (
              <motion.div
                id={`dish-card-${dish.id}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                whileHover={isEasyMode ? {} : { y: -4 }}
                key={dish.id}
                className={`group relative bg-white rounded-3xl border overflow-hidden shadow-sm transition-all ${
                  isEasyMode 
                    ? 'border-neutral-300 shadow-md ring-1 ring-neutral-200 p-2' 
                    : 'border-neutral-200/60 hover:border-neutral-300 hover:shadow-md'
                }`}
              >

                {/* Star rating and prep time overlays */}
                <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1.5">
                  <div className={`bg-neutral-900/80 backdrop-blur-md text-white font-semibold font-mono rounded-lg flex items-center space-x-1 shadow-sm ${
                    isEasyMode ? 'text-xs sm:text-sm px-3 py-1 border border-neutral-700' : 'text-[10px] sm:text-xs px-2 py-0.5'
                  }`}>
                    <Star className={`${isEasyMode ? 'w-4 h-4' : 'w-3 h-3'} text-[--color-primary-gold] fill-[--color-primary-gold]`} />
                    <span>{dish.rating}</span>
                  </div>
                  <div className={`bg-neutral-900/80 backdrop-blur-md text-white font-semibold font-mono rounded-lg flex items-center space-x-1 shadow-sm ${
                    isEasyMode ? 'text-xs sm:text-sm px-3 py-1 border border-neutral-700' : 'text-[10px] sm:text-xs px-2 py-0.5'
                  }`}>
                    <Clock className={`${isEasyMode ? 'w-4 h-4' : 'w-3 h-3'} text-neutral-300`} />
                    <span>{dish.prepareTime} daq</span>
                  </div>
                </div>

                {/* Dish Image */}
                <div className={`relative w-full overflow-hidden bg-neutral-100 rounded-2xl ${
                  isEasyMode ? 'aspect-video sm:aspect-[2/1]' : 'aspect-video'
                }`}>
                  <img
                    src={dish.image}
                    alt={dish.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Content */}
                <div className={`flex flex-col justify-between ${
                  isEasyMode ? 'p-6 sm:p-8 h-auto space-y-6' : 'p-5 h-[200px]'
                }`}>
                  <div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {dish.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`font-bold rounded-lg ${
                            isEasyMode 
                              ? 'text-xs sm:text-sm bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1' 
                              : 'text-[10px] font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Title & Desc */}
                    <h3 className={`font-serif font-black text-neutral-900 transition-colors ${
                      isEasyMode 
                        ? 'text-2xl sm:text-3xl mb-2 leading-tight' 
                        : 'text-base sm:text-lg font-bold line-clamp-1 group-hover:text-[--color-primary-gold-dark]'
                    }`}>
                      {dish.name}
                    </h3>
                    <p className={`text-neutral-500 leading-relaxed ${
                      isEasyMode 
                        ? 'text-sm sm:text-base font-medium mt-2 text-neutral-600' 
                        : 'text-xs mt-1 line-clamp-2'
                    }`}>
                      {dish.description}
                    </p>
                  </div>

                  {/* Pricing and Cart Actions */}
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-neutral-100/80 ${
                    isEasyMode ? 'pt-6 mt-2' : 'pt-4 mt-4'
                  }`}>
                    <div className="flex flex-col">
                      <span className={`font-mono tracking-wider text-neutral-400 font-semibold uppercase ${
                        isEasyMode ? 'text-xs' : 'text-[10px]'
                      }`}>
                        Narxi
                      </span>
                      <span className={`font-mono font-black text-neutral-900 tracking-tight ${
                        isEasyMode ? 'text-2xl sm:text-3xl text-rose-600' : 'text-sm sm:text-base'
                      }`}>
                        {formatPrice(dish.price)}
                      </span>
                    </div>

                    {/* Quick Add Actions */}
                    <div className={isEasyMode ? "h-auto py-1 flex items-center justify-start sm:justify-end" : "h-10 flex items-center"}>
                      <AnimatePresence mode="wait">
                        {qty === 0 ? (
                          <motion.button
                            id={`add-to-cart-btn-${dish.id}`}
                            key="add-btn"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onAddToCart(dish, 1)}
                            className={`flex items-center space-x-2 shadow-md cursor-pointer ${
                              isEasyMode 
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl text-base sm:text-lg font-black w-full sm:w-auto justify-center ring-2 ring-emerald-500/20'
                                : 'bg-neutral-950 text-white hover:bg-[--color-primary-gold-dark] hover:text-white px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 shadow-sm transition-all'
                            }`}
                          >
                            <Plus className={isEasyMode ? "w-5 h-5 stroke-[3px]" : "w-3.5 h-3.5"} />
                            <span>{isEasyMode ? "Tanlash va Buyurtma qilish" : "Qo'shish"}</span>
                          </motion.button>
                        ) : (
                          <motion.div
                            key="qty-selector"
                            initial={{ opacity: 0, width: 40 }}
                            animate={{ opacity: 1, width: isEasyMode ? 180 : 110 }}
                            exit={{ opacity: 0, width: 40 }}
                            className={`flex items-center bg-neutral-100 border rounded-2xl overflow-hidden shadow-sm ${
                              isEasyMode ? 'border-neutral-300 ring-2 ring-neutral-200/50 w-full sm:w-auto' : 'border-neutral-200/60'
                            }`}
                          >
                            <button
                              id={`decrease-qty-btn-${dish.id}`}
                              onClick={() => onUpdateQuantity(dish.id, qty - 1)}
                              className={`flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer ${
                                isEasyMode ? 'w-14 h-14 text-xl font-bold' : 'w-8 h-8'
                              }`}
                            >
                              <Minus className={isEasyMode ? "w-5 h-5 stroke-[2.5px]" : "w-3.5 h-3.5"} />
                            </button>
                            <span className={`flex-1 text-center font-mono text-neutral-900 ${
                              isEasyMode ? 'text-lg sm:text-xl font-black' : 'text-xs font-bold'
                            }`}>
                              {qty}
                            </span>
                            <button
                              id={`increase-qty-btn-${dish.id}`}
                              onClick={() => onUpdateQuantity(dish.id, qty + 1)}
                              className={`flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer ${
                                isEasyMode ? 'w-14 h-14 text-xl font-bold' : 'w-8 h-8'
                              }`}
                            >
                              <Plus className={isEasyMode ? "w-5 h-5 stroke-[2.5px]" : "w-3.5 h-3.5"} />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredMenu.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-3xl border border-neutral-100 shadow-sm"
        >
          <p className="text-sm sm:text-base text-neutral-500 font-medium">
            Siz izlagan taom yoki ichimlik topilmadi.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Barchasi');
            }}
            className="mt-3 text-xs font-bold text-[--color-primary-gold-dark] hover:underline"
          >
            Barcha taomlarni ko&apos;rish
          </button>
        </motion.div>
      )}
    </div>
  );
}
