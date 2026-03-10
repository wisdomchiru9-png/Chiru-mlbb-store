const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

/* IMPORT ROUTES */
const orderRoutes = require("./routes/order");

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* API ROUTES */
app.use("/api", orderRoutes);

/* SERVE FRONTEND FILES */
app.use(express.static(path.join(__dirname, "../client")));

/* HEALTH CHECK */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* LOAD WEBSITE */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

/* FALLBACK FOR CLIENT-SIDE ROUTING AND DIRECT LINKS */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

/* START SERVER */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});