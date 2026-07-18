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

// "data" papkasi git'da saqlanmaydi (.gitignore'da db.json istisno qilingan,
// bo'sh papkalarni esa git umuman kuzatmaydi). Shuning uchun Railway/Render'da
// birinchi marta deploy qilinganda bu papka mavjud bo'lmasligi mumkin — bu esa
// serverni ishga tushishning o'zidayoq (ENOENT xatosi bilan) qulatib qo'yardi.
// Shu sabab, papka bo'lmasa, avval uni yaratib olamiz.
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
