const express = require("express");
const cors = require("cors");
const path = require("path");

const orderRoutes = require("./routes/order");

const app = express();

app.use(cors());
app.use(express.json());

/* API ROUTES */
app.use("/api", orderRoutes);

/* SERVE FRONTEND */
app.use(express.static(path.join(__dirname, "../client")));

/* HEALTH CHECK */
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

/* LOAD WEBSITE */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
});

/* START SERVER */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});