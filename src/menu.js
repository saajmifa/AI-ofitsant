// menu.js
// ------------------------------------------------------------
// Restoran menyusi. Frontend'dagi menyu bilan bir xil, shunda
// backend va ilova bir xil ma'lumotdan foydalanadi.
// ------------------------------------------------------------

const MENU = [
  {
    id: "osh", name: "Osh (Palov)", category: "Milliy Taomlar", price: 35000,
    description: "Zafarli guruch, mayda to'g'ralgan go'sht, sershira sariq sabzi va no'xat bilan pishirilgan an'anaviy o'zbek milliy taomi.",
    image: "/dishes/osh.jpg", tags: ["Eng ommabop", "Tavsiya etiladi"], rating: 4.9, prepareTime: 15,
  },
  {
    id: "lagmon", name: "Lag'mon", category: "Milliy Taomlar", price: 28000,
    description: "Qo'lda cho'zilgan yupqa xamir, go'sht va sabzavotlardan tayyorlangan sershira qovurma lag'mon.",
    image: "/dishes/lagmon.jpg", tags: ["Sershira", "Issiq"], rating: 4.7, prepareTime: 12,
  },
  {
    id: "manti", name: "Manti", category: "Milliy Taomlar", price: 30000,
    description: "Bug'da pishirilgan, yupqa xamir ichida sershira mol go'shti va piyoz. Smetana bilan tortiladi.",
    image: "/dishes/manti.jpg", tags: ["Bug'da", "Yengil"], rating: 4.6, prepareTime: 18,
  },
  {
    id: "norin", name: "Norin", category: "Milliy Taomlar", price: 32000,
    description: "Yupqa qilib maydalangan xamir va go'sht bilan tayyorlangan, sovuq holda tortiladigan milliy taom.",
    image: "/dishes/norin.jpg", tags: ["Milliy", "Maxsus retsept"], rating: 4.5, prepareTime: 15,
  },
  {
    id: "shashlik", name: "Shashlik", category: "Milliy Taomlar", price: 38000,
    description: "Ko'mir taftida pishirilgan, maxsus ziravorlar bilan marinadlangan va to'g'ralgan piyoz bilan tortiladi.",
    image: "/dishes/shashlik.jpg", tags: ["Ko'mirda", "Eng xaridorgir"], rating: 4.8, prepareTime: 20,
  },
  {
    id: "somsa", name: "Somsa", category: "Milliy Taomlar", price: 12000,
    description: "Tandirda pishirilgan, mayda to'g'ralgan go'shtdan iborat qatlama xamirli milliy somsa.",
    image: "/dishes/somsa.jpg", tags: ["Issiq", "Qarsildoq"], rating: 4.8, prepareTime: 10,
  },
  {
    id: "achchiq-chuchuk", name: "Achchiq-chuchuk", category: "Salatlar", price: 15000,
    description: "Yangi terilgan sershira pomidor, shirin piyoz va murch bilan tayyorlangan salat.",
    image: "/dishes/achchiq-chuchuk.jpg", tags: ["Foydali", "Palov uchun"], rating: 4.9, prepareTime: 5,
  },
  {
    id: "qozon-kabob", name: "Qozon kabob", category: "Milliy Taomlar", price: 40000,
    description: "Qozonda uzoq vaqt pishirilgan yumshoq go'sht va kartoshkadan iborat mazali milliy taom.",
    image: "/dishes/qozon-kabob.jpg", tags: ["Yumshoq", "To'yimli"], rating: 4.7, prepareTime: 25,
  },
  {
    id: "ayron", name: "Ayron", category: "Ichimliklar", price: 8000,
    description: "Tabiiy qatiqdan tayyorlangan, tetiklashtiruvchi sovuq milliy ichimlik.",
    image: "/dishes/ayron.jpg", tags: ["Sovuq", "Tabiiy"], rating: 4.6, prepareTime: 2,
  },
  {
    id: "choy", name: "Ko'k choy", category: "Ichimliklar", price: 5000,
    description: "Choynakda tortiladigan sarxil ko'k choy. Ovqat hazm qilishni yaxshilaydi.",
    image: "/dishes/choy.jpg", tags: ["Klassik", "Issiq"], rating: 4.9, prepareTime: 3,
  },
  {
    id: "halva", name: "Halva", category: "Shirinliklar", price: 10000,
    description: "Yong'oq va shirinliklar qo'shilgan, mayin va shirin an'anaviy desert.",
    image: "/dishes/halva.jpg", tags: ["Shirin", "Yong'oqli"], rating: 4.7, prepareTime: 2,
  },
];

module.exports = { MENU };
