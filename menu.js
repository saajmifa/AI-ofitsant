// db.js
// ------------------------------------------------------------
// Bu fayl — "ombor" qismi. Barcha ma'lumotlar (buyurtmalar,
// chaqiruvlar, chat xabarlari) shu yerda, oddiy JSON fayl
// ichida saqlanadi (data/db.json). Server o'chib-yonsa ham,
// bu fayl saqlanib qoladi — hech narsa yo'qolmaydi.
// ------------------------------------------------------------

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");
const fs = require("fs");

// "data" papkasi git orqali kelmasligi mumkin (masalan .gitignore
// tufayli), shuning uchun bu yerda avtomatik yaratib qo'yamiz —
// aks holda server ishga tushishda xatolik berib qoladi.
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const adapter = new FileSync(path.join(dataDir, "db.json"));
const db = low(adapter);

// Agar fayl bo'sh bo'lsa, boshlang'ich (default) qiymatlarni qo'yamiz
db.defaults({
  orders: [],        // barcha buyurtmalar
  calls: [],         // ofitsant chaqiruvlari + kuzatuvchi xabarlari
  staffChat: [],      // kuzatuvchi <-> admin ichki suhbati
  counters: { order: 1000, call: 2000, chat: 3000 },
}).write();

function nextId(counterName) {
  const value = db.get(`counters.${counterName}`).value() + 1;
  db.set(`counters.${counterName}`, value).write();
  return value;
}

module.exports = { db, nextId };
