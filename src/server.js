// server.js
// ------------------------------------------------------------
// Bu — "pochta xizmati" qismi. U quyidagilarni qiladi:
//
// 1) API (manzillar) orqali ma'lumot qabul qiladi va beradi
//    (masalan: "yangi buyurtma qo'sh", "buyurtmalarni ber")
// 2) Socket.io orqali BARCHA ochiq qurilmalarga bir zumda
//    signal yuboradi (masalan: mijoz buyurtma bersa, oshxona
//    ekrani sahifani yangilamasdan ham darhol ko'radi)
// 3) Kuzatuvchi yuborgan rasm/videolarni saqlaydi
// ------------------------------------------------------------

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { db, nextId } = require("./db");
const { MENU } = require("./menu");

const app = express();
const server = http.createServer(app);

// Real vaqtli ulanish uchun Socket.io. CORS "*" — hozircha
// istalgan manzildan ulanishga ruxsat beradi (demo uchun oson,
// productionda buni restoraningiz domeniga cheklash kerak).
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Kuzatuvchi yuborgan rasm/video shu papkaga saqlanadi va
// "/uploads/..." manzili orqali ochiladi.
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB chegarasi
});

// Har bir javobda kichik yordamchi: vaqtni "soat:daqiqa" qilib beradi
function nowTime() {
  return new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

// ============================================================
// MENYU
// ============================================================
app.get("/api/menu", (req, res) => {
  res.json(MENU);
});

// ============================================================
// BUYURTMALAR
// ============================================================

// Barcha buyurtmalarni olish (yoki ?table=5 bilan faqat bitta stol uchun)
app.get("/api/orders", (req, res) => {
  const { table } = req.query;
  let orders = db.get("orders").value();
  if (table) orders = orders.filter((o) => String(o.table) === String(table));
  res.json(orders);
});

// Yangi buyurtma qo'shish (mijoz ilovasidan keladi)
app.post("/api/orders", (req, res) => {
  const { table, items, paymentMethod } = req.body;
  if (!table || !items || !items.length) {
    return res.status(400).json({ error: "table va items majburiy" });
  }
  const order = {
    id: nextId("order"),
    table,
    items,
    paymentMethod: paymentMethod || "naqd",
    status: "Yangi",
    time: nowTime(),
    createdAt: Date.now(),
  };
  db.get("orders").unshift(order).write();
  io.emit("order:new", order); // barcha ochiq ekranlarga darhol yuboriladi
  res.status(201).json(order);
});

// Buyurtma holatini o'zgartirish (oshxona ekranidan: Yangi -> Tayyorlanmoqda -> Tayyor)
app.patch("/api/orders/:id", (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const order = db.get("orders").find({ id }).value();
  if (!order) return res.status(404).json({ error: "Buyurtma topilmadi" });
  db.get("orders").find({ id }).assign({ status }).write();
  const updated = db.get("orders").find({ id }).value();
  io.emit("order:updated", updated);
  res.json(updated);
});

// ============================================================
// CHAQIRUVLAR (mijozdan "ofitsant chaqirish" + kuzatuvchidan xabar)
// ============================================================

app.get("/api/calls", (req, res) => {
  res.json(db.get("calls").value());
});

// Mijozdan oddiy chaqiruv (rasm/video yo'q)
app.post("/api/calls", (req, res) => {
  const { table, reason, source } = req.body;
  if (!reason) return res.status(400).json({ error: "reason majburiy" });
  const call = {
    id: nextId("call"),
    table: table || null,
    reason,
    source: source || "mijoz",
    mediaUrl: null,
    mediaType: null,
    status: "yangi",
    time: nowTime(),
  };
  db.get("calls").unshift(call).write();
  io.emit("call:new", call);
  res.status(201).json(call);
});

// Kuzatuvchidan xabar — rasm yoki video bilan birga kelishi mumkin
// (multipart/form-data: reason, table, file)
app.post("/api/calls/report", upload.single("file"), (req, res) => {
  const { reason, table } = req.body;
  if (!reason) return res.status(400).json({ error: "reason majburiy" });

  let mediaUrl = null;
  let mediaType = null;
  if (req.file) {
    mediaUrl = `/uploads/${req.file.filename}`;
    mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";
  }

  const call = {
    id: nextId("call"),
    table: table ? Number(table) : null,
    reason,
    source: "kuzatuv",
    mediaUrl,
    mediaType,
    status: "yangi",
    time: nowTime(),
  };
  db.get("calls").unshift(call).write();
  io.emit("call:new", call);
  res.status(201).json(call);
});

// Admin: chaqiruvni ofitsantga biriktirish yoki "bajarildi" deb belgilash
app.patch("/api/calls/:id", (req, res) => {
  const id = Number(req.params.id);
  const { status, assignedTo } = req.body;
  const call = db.get("calls").find({ id }).value();
  if (!call) return res.status(404).json({ error: "Chaqiruv topilmadi" });
  const patch = {};
  if (status) patch.status = status;
  if (assignedTo !== undefined) patch.assignedTo = assignedTo;
  db.get("calls").find({ id }).assign(patch).write();
  const updated = db.get("calls").find({ id }).value();
  io.emit("call:updated", updated);
  res.json(updated);
});

// ============================================================
// KUZATUVCHI <-> ADMIN ICHKI CHAT
// ============================================================

app.get("/api/staff-chat", (req, res) => {
  res.json(db.get("staffChat").value());
});

app.post("/api/staff-chat", (req, res) => {
  const { sender, text } = req.body;
  if (!sender || !text) return res.status(400).json({ error: "sender va text majburiy" });
  const message = { id: nextId("chat"), sender, text, time: nowTime() };
  db.get("staffChat").push(message).write();
  io.emit("chat:new", message);
  res.status(201).json(message);
});

// ============================================================
// Ishga tushirish
// ============================================================
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Server ishga tushdi: http://localhost:${PORT}`);
});
