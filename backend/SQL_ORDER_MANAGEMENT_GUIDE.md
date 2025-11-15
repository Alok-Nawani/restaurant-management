# SQL Order Management Guide

Complete guide for managing orders using SQL queries in the SQL Terminal.

## Table of Contents
1. [Create a New Order](#create-a-new-order)
2. [Add Items to Order](#add-items-to-order)
3. [Update Order Status](#update-order-status)
4. [Update Order Items](#update-order-items)
5. [View Order Details](#view-order-details)
6. [Complete Examples](#complete-examples)

---

## Create a New Order

### Step 1: Create the Order
```sql
INSERT INTO Orders (tableNumber, status, total, customerId, createdAt, updatedAt)
VALUES ('T-10', 'PENDING', 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

**Note the order ID** from the response (e.g., `lastInsertRowid: 100`)

---

## Add Items to Order

### Step 2: Find Menu Item IDs
First, find the IDs of the items you want to order:

```sql
-- Find Roti
SELECT id, name, price FROM MenuItems WHERE name LIKE '%Roti%' OR name LIKE '%roti%';

-- Find Paneer dishes
SELECT id, name, price FROM MenuItems WHERE name LIKE '%Paneer%' OR name LIKE '%paneer%';

-- Find Naan
SELECT id, name, price FROM MenuItems WHERE name LIKE '%Naan%' OR name LIKE '%naan%';
```

### Step 3: Add Items to the Order
```sql
-- Add Roti and Paneer to order (assuming order ID is 100, menu item IDs: Roti=15, Paneer=25)
INSERT INTO OrderItems (orderId, menuItemId, quantity, price)
VALUES 
  (100, 15, 2, 20),   -- 2x Roti (price: 20 each)
  (100, 25, 1, 130);  -- 1x Paneer Butter Masala (price: 130)
```

### Step 4: Update Order Total
```sql
-- Update the order total automatically
UPDATE Orders 
SET total = (
    SELECT SUM(quantity * price) 
    FROM OrderItems 
    WHERE orderId = 100
),
updatedAt = CURRENT_TIMESTAMP
WHERE id = 100;
```

---

## Update Order Status

### Change Status to CONFIRMED
```sql
UPDATE Orders 
SET status = 'CONFIRMED', 
    updatedAt = CURRENT_TIMESTAMP 
WHERE id = 100;
```

### Change Status to PREPARING
```sql
UPDATE Orders 
SET status = 'PREPARING', 
    updatedAt = CURRENT_TIMESTAMP 
WHERE id = 100;
```

### Change Status to READY
```sql
UPDATE Orders 
SET status = 'READY', 
    updatedAt = CURRENT_TIMESTAMP 
WHERE id = 100;
```

### Change Status to DELIVERED
```sql
UPDATE Orders 
SET status = 'DELIVERED', 
    updatedAt = CURRENT_TIMESTAMP 
WHERE id = 100;
```

### Status Flow
```
PENDING → CONFIRMED → PREPARING → READY → DELIVERED
```

---

## Update Order Items

### Change Roti to Naan

#### Step 1: Find the OrderItem ID
```sql
-- Find the order item ID for Roti in order 100
SELECT oi.id, oi.orderId, oi.menuItemId, oi.quantity, oi.price, m.name as itemName
FROM OrderItems oi
JOIN MenuItems m ON oi.menuItemId = m.id
WHERE oi.orderId = 100 AND m.name LIKE '%Roti%';
```

#### Step 2: Update the Item
```sql
-- Update Roti (orderItemId: 5) to Naan (menuItemId: 16, price: 30)
UPDATE OrderItems 
SET menuItemId = 16,      -- Change to Naan
    price = 30,           -- Update price
    updatedAt = CURRENT_TIMESTAMP
WHERE id = 5 AND orderId = 100;
```

#### Step 3: Update Order Total
```sql
-- Recalculate order total
UPDATE Orders 
SET total = (
    SELECT SUM(quantity * price) 
    FROM OrderItems 
    WHERE orderId = 100
),
updatedAt = CURRENT_TIMESTAMP
WHERE id = 100;
```

### Change Quantity of an Item
```sql
-- Change quantity of Paneer from 1 to 2
UPDATE OrderItems 
SET quantity = 2,
    updatedAt = CURRENT_TIMESTAMP
WHERE orderId = 100 AND menuItemId = 25;

-- Update order total
UPDATE Orders 
SET total = (
    SELECT SUM(quantity * price) 
    FROM OrderItems 
    WHERE orderId = 100
),
updatedAt = CURRENT_TIMESTAMP
WHERE id = 100;
```

### Remove an Item from Order
```sql
-- Remove Roti from order
DELETE FROM OrderItems 
WHERE orderId = 100 AND menuItemId = 15;

-- Update order total
UPDATE Orders 
SET total = (
    SELECT SUM(quantity * price) 
    FROM OrderItems 
    WHERE orderId = 100
),
updatedAt = CURRENT_TIMESTAMP
WHERE id = 100;
```

### Add More Items to Existing Order
```sql
-- Add Dal to existing order
INSERT INTO OrderItems (orderId, menuItemId, quantity, price)
VALUES (100, 30, 1, 90);  -- 1x Dal (menuItemId: 30, price: 90)

-- Update order total
UPDATE Orders 
SET total = (
    SELECT SUM(quantity * price) 
    FROM OrderItems 
    WHERE orderId = 100
),
updatedAt = CURRENT_TIMESTAMP
WHERE id = 100;
```

---

## View Order Details

### View Complete Order with Items
```sql
SELECT 
  o.id as orderId,
  o.tableNumber,
  o.status,
  o.total,
  o.createdAt,
  c.name as customerName,
  GROUP_CONCAT(m.name || ' x' || oi.quantity || ' (₹' || (oi.quantity * oi.price) || ')', ', ') as items
FROM Orders o
LEFT JOIN Customers c ON o.customerId = c.id
LEFT JOIN OrderItems oi ON o.id = oi.orderId
LEFT JOIN MenuItems m ON oi.menuItemId = m.id
WHERE o.id = 100
GROUP BY o.id;
```

### View Order Items in Detail
```sql
SELECT 
  oi.id as orderItemId,
  oi.orderId,
  m.name as itemName,
  oi.quantity,
  oi.price as unitPrice,
  (oi.quantity * oi.price) as itemTotal
FROM OrderItems oi
JOIN MenuItems m ON oi.menuItemId = m.id
WHERE oi.orderId = 100;
```

### View All Pending Orders
```sql
SELECT 
  o.id,
  o.tableNumber,
  o.status,
  o.total,
  c.name as customerName,
  COUNT(oi.id) as itemCount
FROM Orders o
LEFT JOIN Customers c ON o.customerId = c.id
LEFT JOIN OrderItems oi ON o.id = oi.orderId
WHERE o.status = 'PENDING'
GROUP BY o.id
ORDER BY o.createdAt DESC;
```

---

## Complete Examples

### Example 1: Complete Order Flow (Roti + Paneer)

```sql
-- 1. Create order
INSERT INTO Orders (tableNumber, status, total, customerId, createdAt, updatedAt)
VALUES ('T-10', 'PENDING', 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Note the order ID (let's say it's 100)
-- Get it with:
SELECT last_insert_rowid() as newOrderId;

-- 3. Find menu item IDs
SELECT id, name, price FROM MenuItems 
WHERE name IN ('Tandoori Roti', 'Paneer Butter Masala', 'Butter Naan')
ORDER BY name;

-- 4. Add items (assuming: Roti ID=15, Paneer ID=25)
INSERT INTO OrderItems (orderId, menuItemId, quantity, price)
VALUES 
  (100, 15, 2, 20),   -- 2x Roti
  (100, 25, 1, 130);  -- 1x Paneer Butter Masala

-- 5. Update order total
UPDATE Orders 
SET total = (SELECT SUM(quantity * price) FROM OrderItems WHERE orderId = 100),
    updatedAt = CURRENT_TIMESTAMP
WHERE id = 100;

-- 6. Confirm the order
UPDATE Orders 
SET status = 'CONFIRMED', 
    updatedAt = CURRENT_TIMESTAMP 
WHERE id = 100;

-- 7. View the order
SELECT 
  o.id, o.tableNumber, o.status, o.total,
  GROUP_CONCAT(m.name || ' x' || oi.quantity, ', ') as items
FROM Orders o
JOIN OrderItems oi ON o.id = oi.orderId
JOIN MenuItems m ON oi.menuItemId = m.id
WHERE o.id = 100
GROUP BY o.id;
```

### Example 2: Change Roti to Naan

```sql
-- 1. View current order items
SELECT oi.id, oi.menuItemId, m.name, oi.quantity, oi.price
FROM OrderItems oi
JOIN MenuItems m ON oi.menuItemId = m.id
WHERE oi.orderId = 100;

-- 2. Find Naan ID
SELECT id, name, price FROM MenuItems WHERE name LIKE '%Naan%';

-- 3. Update Roti to Naan (assuming orderItemId=5, new menuItemId=16, new price=30)
UPDATE OrderItems 
SET menuItemId = 16,
    price = 30,
    updatedAt = CURRENT_TIMESTAMP
WHERE id = 5 AND orderId = 100;

-- 4. Update order total
UPDATE Orders 
SET total = (SELECT SUM(quantity * price) FROM OrderItems WHERE orderId = 100),
    updatedAt = CURRENT_TIMESTAMP
WHERE id = 100;

-- 5. Verify the change
SELECT 
  o.id, o.tableNumber, o.status, o.total,
  GROUP_CONCAT(m.name || ' x' || oi.quantity, ', ') as items
FROM Orders o
JOIN OrderItems oi ON o.id = oi.orderId
JOIN MenuItems m ON oi.menuItemId = m.id
WHERE o.id = 100
GROUP BY o.id;
```

### Example 3: Update Order Status Flow

```sql
-- Start: PENDING
SELECT id, tableNumber, status FROM Orders WHERE id = 100;

-- Step 1: Confirm order
UPDATE Orders SET status = 'CONFIRMED', updatedAt = CURRENT_TIMESTAMP WHERE id = 100;

-- Step 2: Start preparing
UPDATE Orders SET status = 'PREPARING', updatedAt = CURRENT_TIMESTAMP WHERE id = 100;

-- Step 3: Mark as ready
UPDATE Orders SET status = 'READY', updatedAt = CURRENT_TIMESTAMP WHERE id = 100;

-- Step 4: Deliver
UPDATE Orders SET status = 'DELIVERED', updatedAt = CURRENT_TIMESTAMP WHERE id = 100;

-- Verify status
SELECT id, tableNumber, status, updatedAt FROM Orders WHERE id = 100;
```

### Example 4: Add More Items to Existing Order

```sql
-- Current order has Roti and Paneer, add Dal and Rice

-- 1. Find Dal and Rice IDs
SELECT id, name, price FROM MenuItems 
WHERE name LIKE '%Dal%' OR name LIKE '%Rice%'
ORDER BY name;

-- 2. Add new items
INSERT INTO OrderItems (orderId, menuItemId, quantity, price)
VALUES 
  (100, 30, 1, 90),   -- 1x Dal
  (100, 35, 1, 80);   -- 1x Jeera Rice

-- 3. Update order total
UPDATE Orders 
SET total = (SELECT SUM(quantity * price) FROM OrderItems WHERE orderId = 100),
    updatedAt = CURRENT_TIMESTAMP
WHERE id = 100;

-- 4. View updated order
SELECT 
  o.id, o.tableNumber, o.status, o.total,
  GROUP_CONCAT(m.name || ' x' || oi.quantity || ' (₹' || (oi.quantity * oi.price) || ')', ', ') as items
FROM Orders o
JOIN OrderItems oi ON o.id = oi.orderId
JOIN MenuItems m ON oi.menuItemId = m.id
WHERE o.id = 100
GROUP BY o.id;
```

---

## Quick Reference

### Common Menu Item Searches
```sql
-- Bread items
SELECT id, name, price FROM MenuItems WHERE category = 'Bread';

-- Curry items
SELECT id, name, price FROM MenuItems WHERE category = 'Curry';

-- Rice items
SELECT id, name, price FROM MenuItems WHERE category = 'Rice';

-- All available items
SELECT id, name, price, category FROM MenuItems WHERE available = 1 ORDER BY category, name;
```

### Order Status Values
- `PENDING` - Order just created
- `CONFIRMED` - Order confirmed by staff
- `PREPARING` - Kitchen is preparing
- `READY` - Order ready for serving
- `DELIVERED` - Order delivered to customer
- `COMPLETED` - Order completed and paid
- `CANCELLED` - Order cancelled

### Important Notes
1. Always update the order total after adding/removing/updating items
2. Use `last_insert_rowid()` to get the ID of the last inserted order
3. Check menu item IDs before adding to orders
4. Order items are linked by `orderId` and `menuItemId`
5. Each order item stores the price at the time of order (for historical accuracy)

---

## Troubleshooting

### Order Total is Wrong
```sql
-- Recalculate order total
UPDATE Orders 
SET total = (SELECT SUM(quantity * price) FROM OrderItems WHERE orderId = 100),
    updatedAt = CURRENT_TIMESTAMP
WHERE id = 100;
```

### Can't Find Menu Item
```sql
-- Search by partial name
SELECT id, name, price, category FROM MenuItems 
WHERE name LIKE '%roti%' OR name LIKE '%paneer%' OR name LIKE '%naan%';
```

### View All Orders for a Table
```sql
SELECT o.*, COUNT(oi.id) as itemCount
FROM Orders o
LEFT JOIN OrderItems oi ON o.id = oi.orderId
WHERE o.tableNumber = 'T-10'
GROUP BY o.id
ORDER BY o.createdAt DESC;
```

