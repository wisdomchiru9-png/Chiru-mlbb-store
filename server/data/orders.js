```javascript
/* =========================
   ORDER STORAGE
   In-memory database
========================= */

const orders = [];

/* Add new order */
function addOrder(order) {
  orders.push(order);
}

/* Get all orders */
function getAllOrders() {
  return orders;
}

/* Find order by ID */
function findOrder(orderId) {
  return orders.find(o => o.orderId == orderId);
}

/* Update order status */
function updateOrderStatus(orderId, status) {
  const order = findOrder(orderId);

  if (!order) return null;

  order.status = status;
  order.updatedAt = new Date().toISOString();

  return order;
}

module.exports = {
  orders,
  addOrder,
  getAllOrders,
  findOrder,
  updateOrderStatus
};
```
