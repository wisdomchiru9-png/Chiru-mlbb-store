```javascript
/*
=================================
CHIRU MLBB STORE - ORDER STORAGE
=================================

Temporary in-memory storage.

NOTE:
All orders will reset when the server restarts.
For production you should later use a database
(MongoDB / Firebase / Supabase).
*/

const orders = [];

/* Add new order */

function addOrder(order) {
  orders.push(order);
  return order;
}

/* Get all orders */

function getOrders() {
  return orders;
}

/* Find order */

function findOrder(orderId) {
  return orders.find(o => o.orderId == orderId);
}

/* Update order status */

function updateOrder(orderId, status) {
  const order = orders.find(o => o.orderId == orderId);

  if (!order) return null;

  order.status = status;

  return order;
}

module.exports = {
  orders,
  addOrder,
  getOrders,
  findOrder,
  updateOrder
};
```


