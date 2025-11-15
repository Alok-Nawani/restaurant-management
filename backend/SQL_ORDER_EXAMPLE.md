# How to Add Order Items to an Order

## Step 1: Create the Order

```sql
INSERT INTO Orders (id, tableNumber, status, total, createdAt, updatedAt, customerId)
VALUES (NULL, 5, 'PENDING', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2);
```

## Step 2: Get the Order ID

After inserting the order, you need to get the order ID. You can use:

```sql
-- Get the last inserted order ID
SELECT last_insert_rowid() as orderId;
```

Or if you know the order ID, you can use it directly.

## Step 3: Add Order Items

Insert menu items into the `OrderItems` table. You need:
- `orderId` - The ID of the order you just created
- `menuItemId` - The ID of the menu item from the MenuItems table
- `quantity` - How many of this item
- `price` - The price per unit (from MenuItems table)

### Example: Adding items to an order

```sql
-- First, let's see available menu items
SELECT id, name, price FROM MenuItems LIMIT 10;

-- Now add items to the order (assuming orderId is 1)
-- Add 2 Paneer Tikka (menuItemId: 1, price: 120)
INSERT INTO OrderItems (orderId, menuItemId, quantity, price)
VALUES (1, 1, 2, 120);

-- Add 1 Chicken Biryani (menuItemId: 2, price: 220)
INSERT INTO OrderItems (orderId, menuItemId, quantity, price)
VALUES (1, 2, 1, 220);

-- Add 2 Cold Coffee (menuItemId: 3, price: 80)
INSERT INTO OrderItems (orderId, menuItemId, quantity, price)
VALUES (1, 3, 2, 80);
```

## Step 4: Update Order Total

After adding all items, update the order total:

```sql
UPDATE Orders 
SET total = (
    SELECT SUM(quantity * price) 
    FROM OrderItems 
    WHERE orderId = 1
)
WHERE id = 1;
```

## Complete Example in One Transaction

```sql
-- Start transaction (optional, for data integrity)
BEGIN TRANSACTION;

-- 1. Create the order
INSERT INTO Orders (id, tableNumber, status, total, createdAt, updatedAt, customerId)
VALUES (NULL, 5, 'PENDING', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2);

-- 2. Get the order ID (store this value)
-- Let's say it returned orderId = 65

-- 3. Add order items
INSERT INTO OrderItems (orderId, menuItemId, quantity, price) VALUES
(65, 1, 2, 120),   -- 2x Paneer Tikka
(65, 2, 1, 220),   -- 1x Chicken Biryani
(65, 3, 2, 80);    -- 2x Cold Coffee

-- 4. Update order total
UPDATE Orders 
SET total = (
    SELECT SUM(quantity * price) 
    FROM OrderItems 
    WHERE orderId = 65
)
WHERE id = 65;

-- Commit transaction
COMMIT;
```

## Using last_insert_rowid() in a Single Query

If you want to do it in one go, you can use a subquery:

```sql
-- Create order and add items in one go
INSERT INTO Orders (id, tableNumber, status, total, createdAt, updatedAt, customerId)
VALUES (NULL, 5, 'PENDING', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2);

-- Then add items using last_insert_rowid()
INSERT INTO OrderItems (orderId, menuItemId, quantity, price) VALUES
(last_insert_rowid(), 1, 2, 120),   -- 2x Paneer Tikka
(last_insert_rowid(), 2, 1, 220),   -- 1x Chicken Biryani
(last_insert_rowid(), 3, 2, 80);    -- 2x Cold Coffee

-- Update total
UPDATE Orders 
SET total = (
    SELECT SUM(quantity * price) 
    FROM OrderItems 
    WHERE orderId = last_insert_rowid()
)
WHERE id = last_insert_rowid();
```

## View Order with Items

To see the order with all its items:

```sql
SELECT 
    o.id as orderId,
    o.tableNumber,
    o.status,
    o.total,
    c.name as customerName,
    mi.name as itemName,
    oi.quantity,
    oi.price,
    (oi.quantity * oi.price) as itemTotal
FROM Orders o
JOIN Customers c ON o.customerId = c.id
JOIN OrderItems oi ON o.id = oi.orderId
JOIN MenuItems mi ON oi.menuItemId = mi.id
WHERE o.id = 65;
```

## OrderItems Table Structure

- `id` - Primary key (auto-increment)
- `orderId` - Foreign key to Orders table
- `menuItemId` - Foreign key to MenuItems table
- `quantity` - Number of items (default: 1)
- `price` - Price per unit (from MenuItems)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

## Important Notes

1. **Unique Constraint**: The combination of `orderId` and `menuItemId` must be unique. If a customer orders the same item twice, you should update the quantity instead of inserting a new row.

2. **Price**: Always use the price from the MenuItems table at the time of order to maintain historical accuracy (prices might change later).

3. **Order Total**: Remember to update the order total after adding/removing items.

4. **Transaction**: Use transactions when creating orders with multiple items to ensure data consistency.

