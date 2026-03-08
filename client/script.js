let currentOrder = null;

async function loadPackages() {
  const res = await fetch("/api/packages");
  const packages = await res.json();

  const container = document.getElementById("packages");
  container.innerHTML = "";

  packages.forEach(p => {
    const discount = Math.round(((p.original - p.price) / p.original) * 100);

    const card = `
      <div class="card">
        <img src="https://cdn-icons-png.flaticon.com/512/3523/3523063.png">
        <h3>${p.name}</h3>
        <p class="price">
          <span class="original">₹${p.original}</span>
          →
          <span class="discount">₹${p.price}</span>
        </p>
        <p class="off">${discount}% OFF</p>
        <button onclick="order(${p.id})">Buy</button>
      </div>
    `;
    container.innerHTML += card;
  });
}

/* PLAYER CHECK API */
async function checkPlayer() {
  const uid = document.getElementById("uid").value;
  const server = document.getElementById("server").value;

  if (uid.length < 5 || server.length < 1) {
    document.getElementById("nickname").innerText = "Invalid Player ID or Server";
    return;
  }

  try {
    const res = await fetch("/api/check-player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, server })
    });

    const data = await res.json();

    // ✅ Show nickname + avatar
    document.getElementById("nickname").innerText =
      "Player: " + data.nickname + " ✔";

    document.getElementById("avatar").src = data.avatar;

  } catch (err) {
    document.getElementById("nickname").innerText = "Could not verify player";
  }
}

/* CREATE ORDER */
async function order(packageId) {
  const uid = document.getElementById("uid").value;
  const server = document.getElementById("server").value;

  const res = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, server, packageId })
  });

  const data = await res.json();

  // Save current order for WhatsApp confirmation
  currentOrder = data;

  document.getElementById("orderInfo").innerText =
    "Order ID: " + data.orderId + " | Pay ₹" + data.price;

  document.getElementById("orderBox").classList.remove("hidden");
}

/* PAYMENT CONFIRMATION → WhatsApp */
function confirmPayment() {
  if (!currentOrder) {
    alert("No order found");
    return;
  }

  const message = `Hello, I completed payment for MLBB Diamonds.\n\nOrder ID: ${currentOrder.orderId}\nUID: ${currentOrder.uid}\nServer: ${currentOrder.server}\nPackage: ${currentOrder.package}\nPrice: ₹${currentOrder.price}\n\nPlease verify and send the diamonds.`;

  const phone = "919863713522"; // Your WhatsApp number
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
}

loadPackages();