```javascript
/* ------------------------------
   CHIRU MLBB STORE ADMIN PANEL
--------------------------------*/

const API_BASE = "";

/* ------------------------------
   LOAD ORDERS (LIVE DASHBOARD)
--------------------------------*/

async function loadOrders() {

  const container = document.getElementById("orders");

  if (!container) return;

  try {

    const res = await fetch(API_BASE + "/api/orders");

    if (!res.ok) {
      container.innerHTML = "<p>Unable to load orders</p>";
      return;
    }

    const orders = await res.json();

    if (!orders || orders.length === 0) {
      container.innerHTML = "<p>No orders yet.</p>";
      return;
    }

    let html = "";

    orders.slice().reverse().forEach(order => {

      html += `
      <div style="
        border-bottom:1px solid #333;
        padding:12px;
        margin-bottom:8px;
      ">
        <b>Order ID:</b> ${order.orderId} <br>
        <b>Player:</b> ${order.uid} (${order.server}) <br>
        <b>Package:</b> ${order.package} <br>
        <b>Price:</b> ₹${order.price} <br>
        <b>Status:</b> ${order.status || "Pending"}
      </div>
      `;

    });

    container.innerHTML = html;

  } catch (err) {

    console.log("Order load failed", err);

    container.innerHTML =
      "<p style='color:red;'>Server error loading orders.</p>";

  }

}

/* ------------------------------
   PROFIT CALCULATOR
--------------------------------*/

function calc() {

  const costInput = document.getElementById("cost");
  const sellInput = document.getElementById("sell");
  const result = document.getElementById("profit");

  if (!costInput || !sellInput || !result) return;

  const cost = Number(costInput.value);
  const sell = Number(sellInput.value);

  if (!cost || !sell) {
    result.innerText = "Enter cost and selling price";
    return;
  }

  const profit = sell - cost;

  let text = "Profit: ₹" + profit;

  if (profit < 0) {
    text += " (Loss)";
  }

  result.innerText = text;

}

/* ------------------------------
   AUTO REFRESH ORDERS
--------------------------------*/

loadOrders();

/* refresh every 5 seconds */

setInterval(loadOrders, 5000);
```
