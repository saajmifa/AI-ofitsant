# Online Ofitsant — Backend

Bu — "Online Ofitsant" loyihasining **server (backend)** qismi. Oddiy tilda
aytganda: bu — barcha buyurtmalar, chaqiruvlar va xabarlarni saqlab turadigan
va turli qurilmalar (mijoz telefoni, admin planshet, oshxona monitori)
o'rtasida signal almashtiradigan markaziy dastur.

## Bu nima qiladi?

- Mijoz buyurtma bersa — bu yerda saqlanadi, sahifa yangilansa ham yo'qolmaydi
- Admin, kuzatuvchi, oshxona — barchasi shu bitta serverga ulanadi va bir xil
  ma'lumotni bir vaqtda ko'radi
- Kuzatuvchi yuborgan rasm/videolar shu yerda saqlanadi

## 1-qadam: Kompyuteringizda sinab ko'rish

Buning uchun kompyuteringizda **Node.js** o'rnatilgan bo'lishi kerak
(https://nodejs.org saytidan yuklab olinadi, "LTS" versiyani tanlang).

Node.js o'rnatilgach, terminal (buyruqlar oynasi) orqali:

```bash
# 1. Ushbu papkaga kiring
cd backend

# 2. Kerakli kutubxonalarni o'rnating (faqat birinchi marta kerak)
npm install

# 3. Serverni ishga tushiring
npm start
```

Agar hammasi to'g'ri bo'lsa, ekranda shunday yozuv chiqadi:

```
✅ Server ishga tushdi: http://localhost:4000
```

Shu manzilni brauzerda ochib ko'ring: `http://localhost:4000/api/menu` —
agar restoran menyusi JSON ko'rinishida chiqsa, demak server ishlayapti.

## 2-qadam: Internetga chiqarish (deploy qilish)

Kompyuteringizda ishlashi — bu faqat sinov uchun. Haqiqiy restoranda
ishlatish uchun serverni internetga joylashtirish (deploy qilish) kerak.
Eng oson va bepul yo'l — **Railway.app** yoki **Render.com**:

1. https://railway.app saytiga kiring, GitHub hisobingiz bilan ro'yxatdan o'ting
2. Ushbu `backend` papkasini GitHub'ga yuklang (yoki Railway'ning
   "Deploy from local folder" imkoniyatidan foydalaning)
3. Railway avtomatik ravishda `npm install` va `npm start` ni ishga tushiradi
4. Sizga `https://sizning-loyihangiz.up.railway.app` kabi doimiy manzil beriladi

Shu manzil — bu sizning **backend manzilingiz**. Frontend ilova (React
dastur) shu manzilga ulanishi kerak bo'ladi.

## API manzillari (frontend dasturchi uchun)

| Manzil | Vazifasi |
|---|---|
| `GET /api/menu` | Menyuni olish |
| `GET /api/orders?table=5` | Bitta stol buyurtmalarini olish |
| `POST /api/orders` | Yangi buyurtma qo'shish |
| `PATCH /api/orders/:id` | Buyurtma holatini o'zgartirish |
| `GET /api/calls` | Barcha chaqiruvlarni olish |
| `POST /api/calls` | Mijozdan ofitsant chaqiruvi |
| `POST /api/calls/report` | Kuzatuvchidan rasm/video bilan xabar |
| `PATCH /api/calls/:id` | Chaqiruvni ofitsantga biriktirish / yopish |
| `GET /api/staff-chat` | Ichki chat xabarlarini olish |
| `POST /api/staff-chat` | Ichki chatga xabar yozish |

Barcha o'zgarishlar **Socket.io** orqali barcha ochiq ekranlarga darhol
yuboriladi (`order:new`, `order:updated`, `call:new`, `call:updated`,
`chat:new` nomli signal orqali) — hech kim sahifani yangilashi shart emas.

## Muhim eslatma

Ma'lumotlar hozircha oddiy `data/db.json` faylida saqlanadi — bu kichik
restoran uchun yetarli, lekin juda katta hajmda (kuniga minglab buyurtma)
ishlatilsa, kelajakda haqiqiy ma'lumotlar bazasiga (PostgreSQL kabi)
o'tish tavsiya etiladi.
