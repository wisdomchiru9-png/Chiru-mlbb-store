```javascript
const express = require("express");
const router = express.Router();
const axios = require("axios");
const qs = require("querystring");

const packages = require("../config/packages");
const orders = require("../data/orders");

/* =========================
   GET PACKAGES
========================= */

router.get("/packages", (req, res) => {
  res.json(packages);
});

/* =========================
   CHECK PLAYER
========================= */

router.post("/check-player", async (req, res) => {

  let { uid, server } = req.body;

  uid = String(uid || "").trim();
  server = String(server || "").trim();

  if (!uid || !server) {
    return res.status(400).json({ error: "Missing UID or Server" });
  }

  /* Instant verified players */

  const realPlayers = {
    "1041655028": "Wisdom Chiru",
    "663838": "RRQ Lemon",
    "5123456": "JessNoLimit"
  };

  if (realPlayers[uid]) {
    return res.json({
      nickname: realPlayers[uid],
      avatar: "/icon.png"
    });
  }

  /* Multi API Lookup */

  const requests = [

    axios.get(
      `https://api.vgm.tv/mobile-legends/player/check?userid=${uid}&zoneid=${server}`,
      {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0" }
      }
    ).catch(() => null),

    axios.post(
      "https://www.smile.one/merchant/mobilelegends/checkrole",
      qs.stringify({
        user_id: uid,
        zone_id: server,
        pid: 19,
        check_role: 1
      }),
      {
        timeout: 8000,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0"
        }
      }
    ).catch(() => null)

  ];

  try {

    const results = await Promise.all(requests);

    for (const r of results) {

      if (!r || !r.data) continue;

      const payload = r.data;

      let name =
        payload.name ||
        payload.username ||
        payload.nickname ||
        payload.role_name;

      if (!name && payload.data) {
        name =
          payload.data.name ||
          payload.data.nickname ||
          payload.data.role_name ||
          payload.data.player_name;
      }

      if (!name && payload.result) {
        name =
          payload.result.name ||
          payload.result.role_name;
      }

      if (
        !name &&
        Array.isArray(payload.items) &&
        payload.items.length
      ) {
        name =
          payload.items[0].name ||
          payload.items[0].player_name;
      }

      if (name) {
        return res.json({
          nickname: String(name).trim(),
          avatar: "/icon.png"
        });
      }

    }

  } catch (err) {
    console.log("Player lookup failed:", err.message);
  }

  /* Final fallback */

  return res.json({
    nickname: `Player ${uid}`,
    avatar: "/icon.png"
  });

});

/* =========================
   CREATE ORDER
========================= */

router.post("/create-order", (req, res) => {

  const { uid, server, packageId, paymentMethod } = req.body;

  if (!uid || !server || !packageId) {
    return res.status(400).json({
      error: "Missing required fields"
    });
  }

  const selected = packages.find(p => p.id == packageId);

  if (!selected) {
    return res.status(404).json({
      error: "Package not found"
    });
  }

  const order = {

    orderId: Date.now(),

    uid,
    server,

    package: selected.name,

    price: selected.price,

    paymentMethod: paymentMethod || "Unknown",

    status: "pending",

    createdAt: new Date().toISOString()

  };

  orders.push(order);

  res.json(order);

});

/* =========================
   ADMIN - GET ALL ORDERS
========================= */

router.get("/orders", (req, res) => {
  res.json(orders);
});

/* =========================
   ADMIN - UPDATE ORDER
========================= */

router.post("/update-order", (req, res) => {

  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({
      error: "Missing orderId or status"
    });
  }

  const order = orders.find(o => o.orderId == orderId);

  if (!order) {
    return res.status(404).json({
      error: "Order not found"
    });
  }

  order.status = status;

  res.json({
    success: true,
    order
  });

});

module.exports = router;
```
