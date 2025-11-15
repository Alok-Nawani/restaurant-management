# External SQL Tools Connection Guide

This guide explains how to connect external SQL tools (like DBeaver, DB Browser for SQLite, TablePlus, etc.) to the restaurant management database and ensure all changes sync to the frontend and markdown files.

## Database Location

The SQLite database file is located at:
```
backend/database.sqlite
```

**Full path (Mac):**
```
/Users/alok/Documents/hotel management/backend/database.sqlite
```

---

## Recommended SQL Tools for macOS

### 1. **DB Browser for SQLite** (Free, Recommended)
- **Download:** https://sqlitebrowser.org/
- **Install:** `brew install --cask db-browser-for-sqlite`
- **Features:** Simple, lightweight, perfect for SQLite

### 2. **DBeaver** (Free, Professional)
- **Download:** https://dbeaver.io/download/
- **Install:** `brew install --cask dbeaver-community`
- **Features:** Full-featured database tool, supports many databases

### 3. **TablePlus** (Paid, Beautiful UI)
- **Download:** https://tableplus.com/
- **Install:** `brew install --cask tableplus`
- **Features:** Modern, beautiful interface

### 4. **DataGrip** (Paid, JetBrains)
- **Download:** https://www.jetbrains.com/datagrip/
- **Features:** Professional IDE for databases

### 5. **SQLiteStudio** (Free, Cross-platform)
- **Download:** https://sqlitestudio.pl/
- **Features:** Lightweight, portable

---

## Connection Instructions

### DB Browser for SQLite

1. **Open DB Browser for SQLite**
2. **Click "Open Database"**
3. **Navigate to:** `backend/database.sqlite`
4. **Click "Open"**
5. **You're connected!**

### DBeaver

1. **Open DBeaver**
2. **Click "New Database Connection"** (plug icon)
3. **Select "SQLite"**
4. **Click "Next"**
5. **In "Path" field, browse to:** `backend/database.sqlite`
6. **Click "Test Connection"**
7. **Click "Finish"**

### TablePlus

1. **Open TablePlus**
2. **Click "Create a new connection"**
3. **Select "SQLite"**
4. **In "Database" field, browse to:** `backend/database.sqlite`
5. **Click "Test"**
6. **Click "Connect"**

---

## Automatic Sync System

The system automatically monitors the database for changes made by external tools and syncs them to:
- ✅ Markdown files (`backend/data_tables/*.md`)
- ✅ Frontend (auto-refreshes)

### How It Works

1. **Database Change Monitor** runs every 3 seconds
2. Detects when `database.sqlite` file is modified
3. Checks all tables for changes
4. Exports updated tables to markdown files
5. Frontend automatically refreshes (via polling)

### Manual Sync

If you want to force a sync immediately:

#### Option 1: Via SQL Terminal
1. Go to **SQL Terminal** in the frontend
2. Click **"Refresh Tables"** button
3. All tables will be synced

#### Option 2: Via API
```bash
curl -X POST http://localhost:4000/api/sql/refresh-tables \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Option 3: Restart Backend Server
Restarting the server will trigger a full sync.

---

## Example Queries from External Tools

### Update Order Status
```sql
UPDATE Orders 
SET status = 'CONFIRMED', 
    updatedAt = CURRENT_TIMESTAMP 
WHERE id = 1034;
```

### Add Menu Item
```sql
INSERT INTO MenuItems (name, price, category, description, available, isVeg, createdAt, updatedAt)
VALUES ('New Dish', 150, 'Curry', 'Delicious curry', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

### Update Inventory Quantity
```sql
UPDATE Inventory 
SET quantity = quantity + 50, 
    updatedAt = CURRENT_TIMESTAMP 
WHERE id = 1;
```

### Change Order Item
```sql
-- Change BBQ Chicken Pizza to Chicken Pizza
UPDATE OrderItems 
SET menuItemId = 45, 
    price = 300, 
    updatedAt = CURRENT_TIMESTAMP 
WHERE id = 123 AND orderId = 1034;

-- Update order total
UPDATE Orders 
SET total = (SELECT SUM(quantity * price) FROM OrderItems WHERE orderId = 1034),
    updatedAt = CURRENT_TIMESTAMP
WHERE id = 1034;
```

---

## Important Notes

### 1. **Always Update `updatedAt`**
When modifying records, always update the `updatedAt` timestamp:
```sql
UPDATE TableName 
SET column = value, 
    updatedAt = CURRENT_TIMESTAMP 
WHERE id = X;
```

### 2. **Sync Timing**
- Changes are detected within **3 seconds**
- Markdown files update automatically
- Frontend refreshes automatically (every 30 seconds or on page focus)

### 3. **Multiple Connections**
- SQLite supports multiple read connections
- Only one write connection at a time
- The backend server and external tools can work simultaneously

### 4. **Transaction Safety**
- Use transactions for complex operations:
```sql
BEGIN TRANSACTION;
  -- Your queries here
COMMIT;
```

### 5. **Backup Before Major Changes**
```bash
cp backend/database.sqlite backend/database.sqlite.backup
```

---

## Troubleshooting

### Changes Not Appearing in Frontend

1. **Check if backend is running:**
   ```bash
   ps aux | grep "node.*server"
   ```

2. **Check backend logs:**
   ```bash
   tail -f /tmp/backend.log
   ```
   Look for: `[DB Monitor] 🔄 Detected changes`

3. **Force sync manually:**
   - Use "Refresh Tables" button in SQL Terminal
   - Or restart the backend server

### Database Locked Error

If you get "database is locked":
- Close other connections to the database
- Wait a few seconds and try again
- Restart the backend server

### Sync Not Working

1. **Check monitoring is enabled:**
   - Look for: `✅ Database change monitor enabled` in server logs
   
2. **Check file permissions:**
   ```bash
   ls -la backend/database.sqlite
   ```

3. **Manual sync:**
   - Use the "Refresh Tables" button
   - Or restart the server

---

## Quick Reference

### Database Path
```
backend/database.sqlite
```

### Tables
- `MenuItems` - Menu items
- `Orders` - Orders
- `OrderItems` - Order line items
- `Customers` - Customers
- `Staff` - Staff members
- `Inventory` - Inventory items
- `Reviews` - Customer reviews
- `Payments` - Payment records
- `Users` - System users

### Sync Frequency
- **Database Monitor:** Every 3 seconds
- **Frontend Refresh:** Every 30 seconds (or on focus)
- **Manual Sync:** Instant via "Refresh Tables" button

---

## Best Practices

1. ✅ Always update `updatedAt` when modifying records
2. ✅ Use transactions for multiple related queries
3. ✅ Test queries in SQL Terminal first, then use external tools
4. ✅ Keep backend server running for auto-sync
5. ✅ Use "Refresh Tables" if changes don't appear immediately
6. ✅ Backup database before major changes

---

## Command Line SQLite

You can also use SQLite from the terminal:

```bash
# Connect to database
cd backend
sqlite3 database.sqlite

# Run queries
sqlite3 database.sqlite "SELECT * FROM Orders LIMIT 5;"

# Interactive mode
sqlite3 database.sqlite
```

All changes made via command line will also be automatically synced!

---

## Support

If you encounter issues:
1. Check backend logs: `tail -f /tmp/backend.log`
2. Verify database file exists: `ls -la backend/database.sqlite`
3. Check if monitoring is active in server startup logs
4. Try manual sync via "Refresh Tables" button

Happy querying! 🚀

