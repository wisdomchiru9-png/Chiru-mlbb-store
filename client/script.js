let currentOrder = null;
let selectedPackageId = null;
let selectedPaymentMethod = null;

/* LOAD PACKAGES FROM API */

async function loadPackages() {

  const container = document.getElementById("packages");
  if(!container) return;

  try {

    const res = await fetch("/api/packages");
    const packages = await res.json();

    container.innerHTML = "";
    
    let html = "";
    packages.forEach(p => {
      
      const card = `
        <div class="card ${p.name.includes("Weekly") ? "special" : ""}" id="pack-${p.id}" onclick="selectPackage(${p.id})">
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

    console.log("Packages API unavailable");

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
    const res = await fetch("/api/check-player",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ uid, server })
    });

    const data = await res.json();

    if (res.status === 200) {
      // Save to cache
      playerCache[cacheKey] = data.nickname;
      
      nickElement.innerHTML = "Player: <b style='color:#00ffd5'>" + data.nickname + "</b> ✔";
      if(data.avatar) document.getElementById("avatar").src = data.avatar;
    } else {
      nickElement.innerHTML = "<span style='color:#ff4c4c'>Account Not Found</span>";
    }

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



/* LOAD PACKAGES ON PAGE START */

document.addEventListener("DOMContentLoaded", loadPackages);
