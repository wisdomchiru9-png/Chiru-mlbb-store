let currentOrder = null;
let selectedPack = "";
let selectedPrice = "";


/* LOAD PACKAGES FROM API */

async function loadPackages() {

  const container = document.getElementById("packages");
  if(!container) return;

  try {

    const res = await fetch("/api/packages");
    const packages = await res.json();

    container.innerHTML = "";

    packages.forEach(p => {

      const discount = Math.round(((p.original - p.price) / p.original) * 100);

      const card = `
        <div class="card">

          <img src="https://cdn-icons-png.flaticon.com/512/3523/3523063.png" width="60">

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

  } catch (err) {

    console.log("Packages API unavailable");

  }

}



/* PLAYER CHECK API */

async function checkPlayer(){

  const uid = document.getElementById("uid").value;
  const server = document.getElementById("server").value;

  if(uid.length < 5 || server.length < 1){

    document.getElementById("nickname").innerText =
    "Invalid Player ID or Server";

    return;

  }

  try {

    const res = await fetch("/api/check-player",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body: JSON.stringify({ uid, server })

    });

    const data = await res.json();

    document.getElementById("nickname").innerText =
    "Player: " + data.nickname + " ✔";

    if(data.avatar){
      document.getElementById("avatar").src = data.avatar;
    }

  }

  catch(err){

    document.getElementById("nickname").innerText =
    "Could not verify player";

  }

}



/* CREATE ORDER FROM API */

async function order(packageId){

  const uid = document.getElementById("uid").value;
  const server = document.getElementById("server").value;

  if(!uid || !server){

    alert("Enter Player ID and Server ID first");
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
        packageId
      })

    });

    const data = await res.json();

    currentOrder = data;

    document.getElementById("orderInfo").innerText =
    "Order ID: " + data.orderId + " | Pay ₹" + data.price;

    document.getElementById("orderBox")
    .classList.remove("hidden");

  }

  catch(err){

    alert("Order creation failed");

  }

}



/* STATIC PACKAGE SELECT */

function selectPack(pack,price){

  const uid = document.getElementById("uid").value;
  const server = document.getElementById("server").value;

  if(!uid || !server){

    alert("Enter Player ID and Server ID first");
    return;

  }

  selectedPack = pack;
  selectedPrice = price;

  currentOrder = null;

  document.getElementById("orderInfo").innerText =
  pack + " - ₹" + price;

  document.getElementById("orderBox")
  .classList.remove("hidden");

}



/* PAYMENT CONFIRMATION */

function confirmPayment(){

  const uid = document.getElementById("uid").value;
  const server = document.getElementById("server").value;

  const fileInput =
  document.getElementById("paymentProof");

  if(!uid || !server){

    alert("Enter Player ID and Server ID first");
    return;

  }

  if(fileInput.files.length === 0){

    alert("Upload payment screenshot");
    return;

  }

  let message = "";


  if(currentOrder){

    message =
    "CHIRU MLBB STORE ORDER\n\n" +
    "Order ID: " + currentOrder.orderId + "\n" +
    "Player ID: " + currentOrder.uid + "\n" +
    "Server ID: " + currentOrder.server + "\n" +
    "Package: " + currentOrder.package + "\n" +
    "Price: ₹" + currentOrder.price + "\n\n" +
    "Payment screenshot uploaded.";

  }

  else{

    message =
    "CHIRU MLBB STORE ORDER\n\n" +
    "Player ID: " + uid + "\n" +
    "Server ID: " + server + "\n" +
    "Package: " + selectedPack + "\n" +
    "Price: ₹" + selectedPrice + "\n\n" +
    "Payment screenshot uploaded.";

  }


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