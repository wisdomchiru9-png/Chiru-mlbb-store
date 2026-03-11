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

app.use(cors({
origin: (origin, callback) => {

```
if (!origin) return callback(null, true);

if (allowedOrigins.includes(origin)) {
  return callback(null, true);
}

return callback(null, true);
```

},
methods: ["GET", "POST"],
allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* =========================
ROUTES
========================= */

const orderRoutes = require("./routes/order");

/* API ROUTES */

app.use("/api", orderRoutes);

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

app.use(express.static(clientPath));

/* Home Page */

app.get("/", (req, res) => {
res.sendFile(path.join(clientPath, "index.html"));
});

/* =========================
ADMIN PANEL
========================= */

app.get("/admin-secret-chiru", (req, res) => {
res.sendFile(path.join(clientPath, "admin.html"));
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

});

