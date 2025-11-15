# Quick Start: SQL Queries from External Tools

## 🎯 Two Ways to Connect

### Option 1: DBeaver (Recommended)

**Full Path to Use:**
```
/Users/alok/Documents/hotel management/backend/database.sqlite
```

**Quick Steps:**
1. Open DBeaver
2. Click "New Database Connection" (plug icon)
3. Select "SQLite"
4. In "Path" field, paste the full path above
5. Click "Test Connection" → Should show "Connected"
6. Click "Finish"

**📖 Full Guide:** See `DBeaver_CONNECTION_GUIDE.md`

---

### Option 2: Terminal (Built-in)

```bash
cd "/Users/alok/Documents/hotel management/backend"
sqlite3 database.sqlite
```

Then run your queries:
```sql
UPDATE Orders 
SET status = 'CONFIRMED', 
    updatedAt = CURRENT_TIMESTAMP 
WHERE id = 1034;
```

---

## ✅ After Running Queries

### Automatic Sync (Recommended)
- Changes are **automatically detected every 3 seconds**
- Markdown files update automatically
- Frontend refreshes automatically

### Manual Sync (Instant)
If you want immediate sync:

```bash
cd "/Users/alok/Documents/hotel management/backend"
node sync-db.js          # Sync all tables
node sync-db.js Orders   # Sync specific table
```

Or use the **"Sync Now"** button in the SQL Terminal (frontend)

---

## 🔍 Verify Changes

1. **Check Markdown:**
   ```bash
   cat backend/data_tables/orders.md
   ```

2. **Check Frontend:**
   - Open Orders page in browser
   - It should auto-refresh every 30 seconds
   - Or refresh manually (F5)

3. **Check Backend Logs:**
   ```bash
   tail -f /tmp/backend.log
   ```
   Look for: `[DB Monitor] 🔄 Detected changes`

---

## ⚠️ Important Notes

1. **Always update `updatedAt`** when modifying records:
   ```sql
   UPDATE TableName 
   SET column = value, 
       updatedAt = CURRENT_TIMESTAMP 
   WHERE id = X;
   ```

2. **Use Full Path in DBeaver:**
   - ❌ Don't use: `backend/database.sqlite`
   - ✅ Use: `/Users/alok/Documents/hotel management/backend/database.sqlite`

3. **Backend Must Be Running:**
   - The monitor only works when the backend server is running
   - Check: `ps aux | grep "node.*server"`

---

## 🚀 Example Workflow

1. **Connect DBeaver** using full path
2. **Run query:**
   ```sql
   UPDATE Orders 
   SET status = 'PREPARING', 
       updatedAt = CURRENT_TIMESTAMP 
   WHERE id = 1034;
   ```
3. **Wait 3 seconds** (or run `node sync-db.js`)
4. **Check results:**
   - Markdown file updated ✅
   - Frontend shows new status ✅

---

## 🆘 Troubleshooting

**Problem:** Changes not appearing

**Solution:**
1. Check backend is running: `ps aux | grep "node.*server"`
2. Check logs: `tail -f /tmp/backend.log`
3. Manual sync: `node sync-db.js`
4. Verify path in DBeaver is correct (full absolute path)

**Problem:** "no such table: Orders" in DBeaver

**Solution:**
- You're connected to the wrong database
- Make sure you're connected to `database.sqlite` (not "DBeaver Sample Database")
- Use the full path: `/Users/alok/Documents/hotel management/backend/database.sqlite`

---

Happy querying! 🎉

