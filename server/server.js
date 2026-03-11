const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

/* =========================
CONFIG
========================= */

const PORT = process.env.PORT || 3000;

/* Allowed Frontend Origins */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://chiru-mlbb-store-1-kv4z.onrender.com"
];

/* =========================
MIDDLEWARE
========================= */

app.use(cors()); // Allow all for simplicity in this project

app.use(express.json());

/* =========================
SECURITY & CHARSET HEADERS
========================= */

app.use((req, res, next) => {
  // Security Headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // Set default charset for HTML responses
  // Only apply to HTML pages, not to JSON API or static files like images/scripts
  const isApi = req.url.includes("/api/");
  const isStaticFile = req.url.includes(".");
  
  if ((req.url.endsWith(".html") || req.url === "/" || !isStaticFile) && !isApi) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
  }
  
  next();
});

/* =========================
ADMIN AUTH (SIMPLE)
========================= */

const ADMIN_PASS = "chiru2026"; // Simple admin password

function adminAuth(req, res, next) {
  const auth = req.headers['x-admin-pass'];
  if (auth === ADMIN_PASS) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

/* =========================
ROUTES
========================= */

const orderRoutes = require("./routes/order");

/* API ROUTES */

app.use("/api", orderRoutes);

/* ADMIN PROTECTED API */
app.get("/admin/api/orders", adminAuth, (req, res) => {
  const orderService = require("./services/orderService");
  res.json(orderService.getOrders());
});

app.post("/admin/api/update-order", adminAuth, (req, res) => {
  const orderService = require("./services/orderService");
  const { orderId, status } = req.body;
  if (!orderId || !status) return res.status(400).json({ error: "Missing fields" });
  const success = orderService.updateOrderStatus(orderId, status);
  if (!success) return res.status(404).json({ error: "Order not found" });
  res.json({ success: true });
});

/* =========================
HEALTH CHECK
========================= */

app.get("/health", (req, res) => {

res.json({
status: "ok",
service: "chiru-mlbb-api",
time: new Date().toISOString()
});

});

/* =========================
STATIC FRONTEND
========================= */

const clientPath = path.join(__dirname, "../client");

/* ADMIN PANEL (Must be before express.static and fallback) */

app.get("/admin", (req, res) => {
  res.redirect("/admin-secret-chiru");
});

app.get("/admin-secret-chiru", (req, res) => {
  res.sendFile(path.join(clientPath, "admin.html"));
});

app.use(express.static(clientPath));

/* Home Page */

app.get("/", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

/* =========================
FALLBACK
========================= */

app.get("*", (req, res) => {
res.sendFile(path.join(clientPath, "index.html"));
});

/* =========================
ERROR HANDLER
========================= */

app.use((err, req, res, next) => {

console.error("Server error:", err);

res.status(500).json({
error: "Internal Server Error"
});

});

/* =========================
START SERVER
========================= */

app.listen(PORT, () => {
  console.log("🚀 CHIRU MLBB API running");
  console.log(`🌐 Server started on port ${PORT}`);

  // SELF-PING SYSTEM (To help prevent sleep on Render Free Plan)
  // This pings the server every 10 minutes.
  const self_url = "https://chiru-mlbb-store.onrender.com/health";
  const axios = require("axios");
  setInterval(() => {
    axios.get(self_url)
      .then(() => console.log("Self-ping successful: Service kept awake"))
      .catch(err => console.log("Self-ping failed:", err.message));
  }, 10 * 60 * 1000); // 10 minutes
});

