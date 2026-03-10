let currentOrder = null;
let selectedPackageId = null;
let selectedPaymentMethod = null;
const API_TIMEOUT = 12000;

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), API_TIMEOUT);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

/* LOAD PACKAGES FROM API */

async function loadPackages() {

  const container = document.getElementById("packages");
  if(!container) return;

  try {

    const res = await fetchWithTimeout("/api/packages");
    const packages = res.ok ? await res.json() : [];

    container.innerHTML = "";

    // Inject high-demand premium option for ultimate mode
    packages.unshift({
      id: "ultra-risk",
      name: "Ultra Risk",
      original: "3999",
      price: "2999",
      isUltraRisk: true
    });

    if (!packages || packages.length === 0) {
      container.innerHTML = '<p style="color:#cfd8e3;">No packages available right now. Please try again in a few seconds.</p>';
      return;
    }

    let html = "";
    packages.forEach(p => {
      const cardClass = `card ${p.isUltraRisk ? "ultra-risk" : ""} ${p.name.includes("Weekly") ? "special" : ""}`;
      const card = `
        <div class="${cardClass}" id="pack-${p.id}" onclick="selectPackage(${p.id})">
          <h3>${p.name}</h3>
          <p class="old">₹${p.original}</p>
          <p class="price">₹${p.price}</p>
          <button>Select</button>
        </div>
      `;
      html += card;
    });

    container.innerHTML = html;

  } catch (err) {
    console.log("Packages API unavailable", err);
    container.innerHTML = '<p style="color:#ff6b6b;">Error loading packages. Please refresh.</p>';
  }

}

/* UI SELECTION LOGIC */

function selectPackage(id) {
    selectedPackageId = id;
    
    // Highlight selected card
    document.querySelectorAll(".card").forEach(c => c.classList.remove("selected-card"));
    const selectedCard = document.getElementById("pack-" + id);
    if(selectedCard) selectedCard.classList.add("selected-card");
}

function selectPayment(method) {
    selectedPaymentMethod = method;

    // Highlight selected payment card
    // We need to find the card based on the method name since we don't have unique IDs
    const cards = document.querySelectorAll(".payment-card");
    cards.forEach(c => {
        c.classList.remove("selected-payment");
        if(c.querySelector("h3").innerText === method) {
            c.classList.add("selected-payment");
        }
    });
}


/* PLAYER CHECK API */

// Simple client-side cache to speed up repeated checks
const playerCache = {};

async function checkPlayer(){

  const uid = document.getElementById("uid").value.trim();
  const server = document.getElementById("server").value.trim();
  const nickElement = document.getElementById("nickname");

  if(uid.length < 5 || server.length < 1){
    nickElement.innerText = "Invalid Player ID or Server";
    return;
  }

  document.getElementById("uid").value = uid;
  document.getElementById("server").value = server;

  // Check cache first for instant results
  const cacheKey = `${uid}-${server}`;
  if (playerCache[cacheKey]) {
    nickElement.innerHTML = "Player: <b style='color:#00ffd5'>" + playerCache[cacheKey] + "</b> ✔";
    return;
  }

  // Show loading state
  nickElement.innerHTML = "<span style='color:#aaa'>Searching Account...</span>";

  try {
    const res = await fetchWithTimeout("/api/check-player",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ uid, server })
    });

    const data = res.ok ? await res.json() : null;

    if (res.ok && data && data.nickname) {
      playerCache[cacheKey] = data.nickname;
      nickElement.innerHTML = "Player: <b style='color:#00ffd5'>" + data.nickname + "</b> ✔";
      if (data.avatar){
        const avatar = document.getElementById("avatar");
        avatar.src = data.avatar;
        avatar.alt = "Player avatar for " + data.nickname;
      }
      return;
    }

    if (res.ok && data && !data.nickname) {
      nickElement.innerHTML = "Player: <b style='color:#00ffd5'>Unknown</b> ✔";
      return;
    }

    nickElement.innerHTML = "<span style='color:#ff4c4c'>Account Not Found or system busy</span>";

  } catch (err) {
    nickElement.innerHTML = "<span style='color:#ff4c4c'>System Busy, Try Again</span>";
  }
}



/* INITIATE ORDER (BUY NOW) */

async function initiateOrder(){

  if(!selectedPackageId) {
      alert("Please select a Diamond Package first!");
      return;
  }

  if(!selectedPaymentMethod) {
      alert("Please select a Payment Method!");
      return;
  }

  const uid = document.getElementById("uid").value;
  const server = document.getElementById("server").value;

  if(!uid || !server){
    alert("Please enter Player ID and Server ID first!");
    return;
  }

  try{

    const res = await fetch("/api/create-order",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
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
    "Order ID: " + data.orderId + " | Pay ₹" + data.price + " via " + selectedPaymentMethod;

    const box = document.getElementById("orderBox");
    box.classList.remove("hidden");
    box.scrollIntoView({ behavior: "smooth" });

  }

  catch(err){
    console.error(err);
    alert("Order creation failed");

  }

}



/* PAYMENT CONFIRMATION */

function confirmPayment(){

  if(!currentOrder){
    alert("Please select a package first");
    return;
  }

  const fileInput = document.getElementById("paymentProof");

  if(fileInput.files.length === 0){
    alert("Upload payment screenshot");
    return;
  }

  const message =
  "CHIRU MLBB STORE ORDER\n\n" +
  "Order ID: " + currentOrder.orderId + "\n" +
  "Player ID: " + currentOrder.uid + "\n" +
  "Server ID: " + currentOrder.server + "\n" +
  "Package: " + currentOrder.package + "\n" +
  "Price: ₹" + currentOrder.price + "\n" +
  "Method: " + selectedPaymentMethod + "\n\n" +
  "Payment screenshot uploaded.";

  const phone = "919863713522";

  const url =
  "https://wa.me/" +
  phone +
  "?text=" +
  encodeURIComponent(message);

  window.open(url,"_blank");

}



/* ULTIMATE MODE TOGGLE */
function applyUltimateMode(value) {
  const isOn = value === true;
  document.body.classList.toggle("ultimate-mode", isOn);
  const button = document.getElementById("ultimateModeBtn");
  if (button) {
    button.innerText = `Ultimate Mode: ${isOn ? "On" : "Off"}`;
  }
  localStorage.setItem("ultimateMode", isOn ? "1" : "0");
}

function initUltimateMode() {
  const saved = localStorage.getItem("ultimateMode");
  const enabled = saved === "1";
  applyUltimateMode(enabled);

  const button = document.getElementById("ultimateModeBtn");
  if (button) {
    button.addEventListener("click", () => {
      const active = document.body.classList.toggle("ultimate-mode");
      applyUltimateMode(active);
      playSfx("toggle");
    });
  }
}

function playSfx(type) {
  if (!window.localStorage.getItem("soundEnabled")) {
    window.localStorage.setItem("soundEnabled", "1");
  }
  const soundEnabled = window.localStorage.getItem("soundEnabled") === "1";
  if (!soundEnabled) return;

  let src = "";
  if (type === "toggle") src = "https://freesound.org/data/previews/146/146727_2491515-lq.mp3";
  if (!src) return;

  const audio = new Audio(src);
  audio.volume = 0.25;
  audio.play().catch(() => {});
}

function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const resize = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  };
  resize();
  window.addEventListener("resize", resize);

  const particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 1 + Math.random() * 1.8,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    alpha: 0.1 + Math.random() * 0.28,
  }));

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
      grad.addColorStop(0, `rgba(0, 255, 190, ${p.alpha})`);
      grad.addColorStop(1, "rgba(0, 255, 190, 0)");

      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  };

  draw();
}

/* LOAD PACKAGES ON PAGE START */

document.addEventListener("DOMContentLoaded", () => {
  initUltimateMode();
  initParticles();
  loadPackages();
});
