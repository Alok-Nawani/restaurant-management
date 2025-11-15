# DBeaver Connection Guide - Step by Step

## Exact Database Path

**Full Absolute Path:**
```
/Users/alok/Documents/hotel management/backend/database.sqlite
```

**Important:** You MUST use the full path, not a relative path like `backend/database.sqlite`

---

## Step-by-Step Connection Instructions

### Step 1: Open DBeaver

1. Launch **DBeaver** application
2. If you see a welcome screen, close it

### Step 2: Create New Connection

1. **Click the "New Database Connection" button** (plug icon) in the toolbar
   - OR
   - Go to **Database** → **New Database Connection**
   - OR
   - Press `Cmd+Shift+N` (Mac) or `Ctrl+Shift+N` (Windows/Linux)

### Step 3: Select SQLite

1. In the connection wizard, you'll see a list of database types
2. **Scroll down and find "SQLite"**
3. **Click on "SQLite"** to select it
4. Click **"Next"** button at the bottom

### Step 4: Configure Path

1. You'll see a form with a **"Path"** field
2. **DO NOT** just type `backend/database.sqlite` - this won't work!
3. **Click the folder icon** (Browse button) next to the Path field
4. In the file browser:
   - Navigate to: `/Users/alok/Documents/hotel management/backend/`
   - Select the file: `database.sqlite`
   - Click **"Open"**
5. **OR** manually type the full path:
   ```
   /Users/alok/Documents/hotel management/backend/database.sqlite
   ```

### Step 5: Test Connection

1. Click the **"Test Connection"** button at the bottom
2. You should see: **"Connected"** in green
3. If you see an error, check:
   - The path is correct (full absolute path)
   - The file exists at that location
   - You have read/write permissions

### Step 6: Save Connection

1. Click **"Finish"** button
2. The connection will appear in your Database Navigator (left panel)
3. You can rename it by right-clicking → **"Edit Connection"** → change the name

---

## Verify Connection

### Check Tables

1. In the **Database Navigator** (left panel), expand your connection
2. Expand **"Tables"** folder
3. You should see tables like:
   - `Orders`
   - `MenuItems`
   - `Customers`
   - `OrderItems`
   - `Payments`
   - `Staff`
   - `Inventory`
   - `Reviews`
   - `Users`

### Test Query

1. Right-click on the **"Orders"** table
2. Select **"View Data"** or **"Read Data"**
3. You should see order records

---

## Common Issues & Solutions

### Issue 1: "no such table: Orders"

**Problem:** You're connected to the wrong database (probably "DBeaver Sample Database")

**Solution:**
1. Check the connection name in Database Navigator
2. Make sure you're connected to `database.sqlite` (your project database)
3. If you see "DBeaver Sample Database", disconnect it and create a new connection following the steps above

### Issue 2: "SQL error or missing database"

**Problem:** The path is incorrect or the file doesn't exist

**Solution:**
1. Verify the file exists:
   ```bash
   ls -la "/Users/alok/Documents/hotel management/backend/database.sqlite"
   ```
2. Use the **full absolute path** in DBeaver
3. Make sure there are no typos in the path

### Issue 3: "Database is locked"

**Problem:** Another process (like the backend server) has the database open

**Solution:**
1. This is usually fine - SQLite supports multiple readers
2. If you get write errors, close other connections temporarily
3. The backend server can stay running - it won't interfere with reads

### Issue 4: Can't find the file

**Problem:** The path has spaces or special characters

**Solution:**
1. Use the **Browse button** instead of typing
2. Navigate through the folders visually
3. Make sure you're in the correct directory:
   - `/Users/alok/Documents/hotel management/backend/`

---

## Quick Reference

### Connection Settings Summary

- **Database Type:** SQLite
- **Path:** `/Users/alok/Documents/hotel management/backend/database.sqlite`
- **Driver:** SQLite (built-in, no additional driver needed)

### After Connecting

1. ✅ You can now run SQL queries
2. ✅ Changes will auto-sync to markdown files (every 3 seconds)
3. ✅ Frontend will auto-refresh
4. ✅ Use "Sync Now" button in SQL Terminal for immediate sync

### Example Query

```sql
UPDATE Orders 
SET status = 'CONFIRMED', 
    updatedAt = CURRENT_TIMESTAMP 
WHERE id = 1034;
```

After running this:
- Wait 3 seconds for auto-sync
- OR click "Sync Now" in SQL Terminal for immediate sync
- Check `backend/data_tables/orders.md` - it should update
- Check frontend Orders page - it should refresh

---

## Still Having Issues?

1. **Check backend logs:**
   ```bash
   tail -f /tmp/backend.log
   ```
   Look for: `[DB Monitor] 🔄 Detected changes`

2. **Verify database file:**
   ```bash
   ls -la "/Users/alok/Documents/hotel management/backend/database.sqlite"
   ```

3. **Test with command line:**
   ```bash
   cd "/Users/alok/Documents/hotel management/backend"
   sqlite3 database.sqlite "SELECT COUNT(*) FROM Orders;"
   ```

4. **Manual sync after queries:**
   ```bash
   cd "/Users/alok/Documents/hotel management/backend"
   node sync-db.js
   ```

---

## Need Help?

If you're still stuck:
1. Take a screenshot of your DBeaver connection settings
2. Check the exact error message
3. Verify the database file exists and is accessible

Good luck! 🚀

