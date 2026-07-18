# Mijoz paneli — dizayn manbasi (React + Vite)

Bu papka — "Zafaron Luxury Lounge" nomli yangi, premium dizaynli mijoz
paneli ilovasining **manba (source) kodi**. Tayyor (build qilingan)
versiyasi allaqachon `backend/public/client/` papkasida joylashgan va
server shuni avtomatik beradi — shuning uchun bu papkani odatiy holda
qayta build qilishning hojati yo'q.

Agar dizaynga o'zgartirish kiritmoqchi bo'lsangiz:

```bash
cd mijoz-panel-src
npm install
npm run dev      # http://localhost:5173 — real vaqtli ko'rish uchun
                  # (backendni alohida "npm start" bilan ishga tushiring, 4000-portda)
```

O'zgartirishlarni saqlab, tayyor versiyasini yangilash uchun:

```bash
npm run build
rm -rf ../public/client/*
cp -r dist/* ../public/client/
```

## Backend bilan bog'lanish

Bu ilova quyidagi backend manzillaridan foydalanadi (hammasi
`../src/server.js`da mavjud):

- `GET /api/menu` — menyuni oladi (rasm, tavsif, narx va h.k. bilan)
- `POST /api/orders` — yangi buyurtma yuboradi
- `GET /api/orders?table=N` — shu stolning faol buyurtmasini oladi
- `POST /api/calls` — ofitsiant/suv/pichoq-vilka/tozalash chaqiruvi
- `PATCH /api/calls/:id` — chaqiruvni bekor qilish
- Socket.io: `order:new`, `order:updated`, `call:new`, `call:updated` —
  real vaqtda yangilanishlar uchun

## Muhim: rollar tizimi

Serverning `src/server.js` fayli "/" manzilini quyidagicha bo'ladi:

- `/` yoki `/?table=5` (rol ko'rsatilmagan) → **shu yangi mijoz paneli**
  (`public/client/index.html`)
- `/?role=admin`, `/?role=kitchen`, `/?role=monitor` → eski ilova
  (`public/index.html` + `public/bundle.js`) — admin, oshxona va
  kuzatuvchi panellari **o'zgarishsiz** qoldirilgan.

Shuning uchun QR kodlaringizni o'zgartirish shart emas — ular
avtomatik ravishda yangi dizaynga ochiladi.
