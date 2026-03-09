const express = require("express");
const router = express.Router();
const axios = require("axios");

const packages = require("../config/packages");
const orders = require("../data/orders"); // shared in-memory order storage

/* GET PACKAGES */
router.get("/packages", (req, res) => {
  res.json(packages);
});

/* CHECK PLAYER */
router.post("/check-player", async (req, res) => {
  const { uid, server } = req.body;

  if (!uid || !server) {
    return res.status(400).json({ error: "Missing UID or Server" });
  }

  // 1. Instant verification for special IDs
  const realPlayers = {
    "1041655028": "Wisdom Chiru",
    "663838": "RRQ Lemon",
    "5123456": "JessNoLimit"
  };

  if (realPlayers[uid]) {
    return res.json({ nickname: realPlayers[uid], avatar: "/icon.png" });
  }

  // 2. Parallel Multi-API Lookup for maximum speed
  const checkRequests = [
    // VGM API (Fast & Reliable)
    axios.get(`https://api.vgm.tv/mobile-legends/player/check?userid=${uid}&zoneid=${server}`, {
      timeout: 8000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }).catch(e => null),
    
    // Smile.one API (Fast Backup)
    axios.post('https://www.smile.one/merchant/mobilelegends/checkrole', 
      require('querystring').stringify({
        user_id: uid,
        zone_id: server,
        pid: 19,
        check_role: 1
      }), {
        timeout: 8000,
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    ).catch(e => null)
  ];

  try {
    const results = await Promise.all(checkRequests);
    
    for (const response of results) {
      if (!response || !response.data) continue;
      
      let name = response.data.name || response.data.username || response.data.nickname || response.data.role_name;
      if (name) {
        return res.json({ nickname: name, avatar: "/icon.png" });
      }
    }
  } catch (e) {
    console.log(`Lookup failed for ID ${uid}:`, e.message);
  }

  // 3. Final Fallback - Error instead of fake name
  return res.status(404).json({ error: "Account Not Found" });
});

/* CREATE ORDER */
router.post("/create-order", (req, res) => {
  const { uid, server, packageId, paymentMethod } = req.body;

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
    paymentMethod: paymentMethod || "Unknown",
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