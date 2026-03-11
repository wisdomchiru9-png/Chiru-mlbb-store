```javascript
/* ------------------------------
   CHIRU MLBB STORE ADMIN PANEL
--------------------------------*/

const API_BASE = "";
let adminPass = localStorage.getItem("adminPass") || "";

/* ------------------------------
   ADMIN AUTH
--------------------------------*/

function checkAuth() {
  if (!adminPass) {
    adminPass = prompt("Enter Admin Password:");
    if (adminPass) {
      localStorage.setItem("adminPass", adminPass);
    }
  }
}

/* ------------------------------
   LOAD ORDERS (LIVE DASHBOARD)
--------------------------------*/

async function loadOrders() {

  checkAuth();
  const container = document.getElementById("orders");

  if (!container) return;

  try {

    const res = await fetch(API_BASE + "/admin/api/orders", {
      headers: { "x-admin-pass": adminPass }
    });

    if (res.status === 401) {
      localStorage.removeItem("adminPass");
      adminPass = "";
      alert("Unauthorized. Please refresh and try again.");
      return;
    }

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
      const statusClass = order.status === "completed" ? "status-completed" : "status-pending";
      const cardClass = order.status === "completed" ? "order-card completed" : "order-card pending";

      html += `
      <div class="${cardClass}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <b>Order ID:</b> ${order.orderId} <br>
            <b>Player:</b> ${order.uid} (${order.server}) <br>
            <b>Package:</b> ${order.package} <br>
            <b>Price:</b> ₹${order.price} <br>
            <b>Method:</b> ${order.paymentMethod || "UPI"} <br>
            <b>Time:</b> ${new Date(order.createdAt).toLocaleString()}
          </div>
          <div style="text-align: right;">
            <span class="status-badge ${statusClass}">${order.status || "Pending"}</span>
            <br><br>
            ${order.status !== "completed" ? 
              `<button onclick="updateStatus(${order.orderId}, 'completed')" style="background:#22c55e; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Mark Done</button>` : 
              `<button onclick="updateStatus(${order.orderId}, 'pending')" style="background:#64748b; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Undo</button>`
            }
          </div>
        </div>
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
   UPDATE ORDER STATUS
--------------------------------*/

async function updateStatus(orderId, status) {
  try {
    const res = await fetch(API_BASE + "/admin/api/update-order", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-admin-pass": adminPass
      },
      body: JSON.stringify({ orderId, status })
    });

    if (res.ok) {
      loadOrders();
    } else {
      alert("Failed to update status");
    }
  } catch (err) {
    console.error(err);
    alert("Error updating status");
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
