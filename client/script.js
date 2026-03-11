let currentOrder = null;
let selectedPackageId = null;
let selectedPaymentMethod = null;

const API_TIMEOUT = 12000;
const API_BASE = "";

/* ---------------------------
FETCH WITH TIMEOUT
---------------------------- */

function fetchWithTimeout(url, options = {}) {

const controller = new AbortController();
const id = setTimeout(() => controller.abort(), API_TIMEOUT);

return fetch(url, { ...options, signal: controller.signal })
.finally(() => clearTimeout(id));

}

/* ---------------------------
LOAD PACKAGES
---------------------------- */

async function loadPackages() {

const container = document.getElementById("packages");
if (!container) return;

try {

```
const res = await fetchWithTimeout(`${API_BASE}/api/packages`);
const packages = res.ok ? await res.json() : [];

container.innerHTML = "";

packages.unshift({
  id: "ultra-risk",
  name: "Ultra Risk",
  original: "3999",
  price: "2999",
  isUltraRisk: true
});

if (!packages || packages.length === 0) {

  container.innerHTML =
    '<p style="color:#cfd8e3;">No packages available right now.</p>';

  return;
}

let html = "";

packages.forEach(p => {

  const cardClass =
    `card ${p.isUltraRisk ? "ultra-risk" : ""} ${p.name.includes("Weekly") ? "special" : ""}`;

  html += `
  <div class="${cardClass}" id="pack-${p.id}" onclick="selectPackage('${p.id}')">
    <h3>${p.name}</h3>
    <p class="old">₹${p.original}</p>
    <p class="price">₹${p.price}</p>
    <button>Select</button>
  </div>
  `;
});

container.innerHTML = html;
```

} catch (err) {

```
console.log("Packages API unavailable", err);

container.innerHTML =
  '<p style="color:#ff6b6b;">Error loading packages.</p>';
```

}

}

/* ---------------------------
PACKAGE SELECTION
---------------------------- */

function selectPackage(id) {

selectedPackageId = id;

document.querySelectorAll(".card")
.forEach(c => c.classList.remove("selected-card"));

const selectedCard =
document.getElementById("pack-" + id);

if (selectedCard)
selectedCard.classList.add("selected-card");

}

/* ---------------------------
PAYMENT METHOD
---------------------------- */

function selectPayment(method) {

selectedPaymentMethod = method;

const cards =
document.querySelectorAll(".payment-card");

cards.forEach(c => {

```
c.classList.remove("selected-payment");

if (c.querySelector("h3").innerText === method) {

  c.classList.add("selected-payment");

}
```

});

}

/* ---------------------------
PLAYER CHECK
---------------------------- */

const playerCache = {};

async function checkPlayer() {

const uid =
document.getElementById("uid").value.trim();

const server =
document.getElementById("server").value.trim();

const nickElement =
document.getElementById("nickname");

if (uid.length < 5 || server.length < 1) {

```
nickElement.innerText =
  "Invalid Player ID or Server";

return;
```

}

const cacheKey = `${uid}-${server}`;

if (playerCache[cacheKey]) {

```
nickElement.innerHTML =
  "Player: <b style='color:#00ffd5'>" +
  playerCache[cacheKey] +
  "</b> ✔";

return;
```

}

nickElement.innerHTML =
"<span style='color:#aaa'>Searching Account...</span>";

try {

```
const res =
  await fetchWithTimeout(`${API_BASE}/api/check-player`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({ uid, server })

  });

const data = res.ok ? await res.json() : null;

if (res.ok && data && data.nickname) {

  playerCache[cacheKey] =
    data.nickname;

  nickElement.innerHTML =
    "Player: <b style='color:#00ffd5'>" +
    data.nickname +
    "</b> ✔";

  if (data.avatar) {

    const avatar =
      document.getElementById("avatar");

    avatar.src = data.avatar;

  }

  return;
}

nickElement.innerHTML =
  "<span style='color:#ff4c4c'>Account Not Found</span>";
```

}

catch (err) {

```
nickElement.innerHTML =
  "<span style='color:#ff4c4c'>System Busy</span>";
```

}

}

/* ---------------------------
CREATE ORDER
---------------------------- */

async function initiateOrder() {

if (!selectedPackageId) {

```
alert("Select a Diamond Package first!");
return;
```

}

if (!selectedPaymentMethod) {

```
alert("Select Payment Method!");
return;
```

}

const uid =
document.getElementById("uid").value;

const server =
document.getElementById("server").value;

if (!uid || !server) {

```
alert("Enter Player ID and Server ID!");
return;
```

}

try {

```
const res =
  await fetch(`${API_BASE}/api/create-order`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({

      uid,
      server,
      packageId: selectedPackageId,
      paymentMethod: selectedPaymentMethod

    })

  });

const data = await res.json();

currentOrder = data;

document.getElementById("orderInfo").innerText =
  "Order ID: " + data.orderId +
  " | Pay ₹" + data.price +
  " via " + selectedPaymentMethod;

const box =
  document.getElementById("orderBox");

box.classList.remove("hidden");

box.scrollIntoView({ behavior: "smooth" });
```

}

catch (err) {

```
console.error(err);

alert("Order creation failed");
```

}

}

/* ---------------------------
PAYMENT CONFIRMATION
---------------------------- */

function confirmPayment() {

if (!currentOrder) {

```
alert("Create order first");
return;
```

}

const fileInput =
document.getElementById("paymentProof");

if (fileInput.files.length === 0) {

```
alert("Upload payment screenshot");
return;
```

}

const message =
"CHIRU MLBB STORE ORDER\n\n" +
"Order ID: " + currentOrder.orderId + "\n" +
"Player ID: " + currentOrder.uid + "\n" +
"Server ID: " + currentOrder.server + "\n" +
"Package: " + currentOrder.package + "\n" +
"Price: ₹" + currentOrder.price + "\n" +
"Method: " + selectedPaymentMethod;

const phone = "919863713522";

const url =
"https://wa.me/" +
phone +
"?text=" +
encodeURIComponent(message);

window.open(url, "_blank");

}

/* ---------------------------
ULTIMATE MODE
---------------------------- */

function applyUltimateMode(value) {

const isOn = value === true;

document.body.classList.toggle(
"ultimate-mode",
isOn
);

const button =
document.getElementById("ultimateModeBtn");

if (button) {

```
button.innerText =
  `Ultimate Mode: ${isOn ? "On" : "Off"}`;
```

}

localStorage.setItem(
"ultimateMode",
isOn ? "1" : "0"
);

}

function initUltimateMode() {

const saved =
localStorage.getItem("ultimateMode");

const enabled =
saved === "1";

applyUltimateMode(enabled);

}

/* ---------------------------
PARTICLE BACKGROUND
---------------------------- */

function initParticles() {

const canvas =
document.getElementById("particleCanvas");

if (!canvas) return;

const ctx =
canvas.getContext("2d");

const resize = () => {

```
canvas.width =
  canvas.clientWidth;

canvas.height =
  canvas.clientHeight;
```

};

resize();

window.addEventListener(
"resize",
resize
);

const particles =
Array.from({ length: 80 }, () => ({

```
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: 1 + Math.random() * 1.8,
  vx: (Math.random() - 0.5) * 0.22,
  vy: (Math.random() - 0.5) * 0.22,
  alpha: 0.1 + Math.random() * 0.28

}));
```

const draw = () => {

```
ctx.clearRect(
  0,
  0,
  canvas.width,
  canvas.height
);

particles.forEach(p => {

  p.x += p.vx;
  p.y += p.vy;

  if (p.x < 0) p.x = canvas.width;
  if (p.x > canvas.width) p.x = 0;

  if (p.y < 0) p.y = canvas.height;
  if (p.y > canvas.height) p.y = 0;

  ctx.beginPath();

  ctx.fillStyle =
    `rgba(0,255,190,${p.alpha})`;

  ctx.arc(
    p.x,
    p.y,
    p.r,
    0,
    Math.PI * 2
  );

  ctx.fill();

});

requestAnimationFrame(draw);
```

};

draw();

}

/* ---------------------------
UPDATE CHECK SYSTEM
---------------------------- */

const CURRENT_APP_VERSION = "1.0";

async function checkForUpdate() {

try {

```
const res =
  await fetch(`/version.json?t=${Date.now()}`);

if (!res.ok) return;

const data =
  await res.json();

if (data.version !== CURRENT_APP_VERSION) {

  const banner =
    document.getElementById("updateBanner");

  if (banner)
    banner.style.display = "block";

}
```

}

catch (err) {

```
console.log("Update check failed");
```

}

}

setInterval(checkForUpdate, 30000);

/* ---------------------------
PAGE INIT
---------------------------- */

document.addEventListener(
"DOMContentLoaded",
() => {

```
initUltimateMode();
initParticles();
loadPackages();
```

}
);
