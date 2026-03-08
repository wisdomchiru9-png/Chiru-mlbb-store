const express = require("express");
const router = express.Router();

const packages = require("../config/packages");
const orders = require("../data/orders"); // shared in-memory order storage

/* GET PACKAGES */
router.get("/packages", (req, res) => {
  res.json(packages);
});

/* CHECK PLAYER */
router.post("/check-player", (req, res) => {
  const { uid, server } = req.body;

  if (!uid || !server) {
    return res.status(400).json({ error: "Missing UID or Server" });
  }

  res.json({
    nickname: "MLBB_Player123",
    avatar: "https://cdn-icons-png.flaticon.com/512/3523/3523063.png"
  });
});

/* CREATE ORDER */
router.post("/create-order", (req, res) => {
  const { uid, server, packageId } = req.body;

  if (!uid || !server || !packageId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const selected = packages.find(p => p.id == packageId);

  if (!selected) {
    return res.status(404).json({ error: "Package not found" });
  }

  const order = {
    orderId: Date.now(),
    uid,
    server,
    package: selected.name,
    price: selected.price,
    status: "pending" // default status
  };

  // ✅ Save order in memory
  orders.push(order);

  res.json(order);
});

/* GET ALL ORDERS (ADMIN) */
router.get("/orders", (req, res) => {
  res.json(orders);
});

/* UPDATE ORDER STATUS */
router.post("/update-order", (req, res) => {
  const { orderId, status } = req.body;

  const order = orders.find(o => o.orderId == orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  order.status = status;
  res.json(order);
});

module.exports = router;