const fs = require('fs');
const path = require('path');
const { sequelize, ...models } = require('../models');
const { exportAllTables, exportModelToMarkdown } = require('./tableExporter');
const { setExportingFromSQL } = require('./markdownSync');

// Track last known modification times
let lastModTimes = {};
let isMonitoring = false;
let monitoringInterval = null;

// Map table names to models and filenames
const tableMapping = {
  'MenuItems': { model: 'MenuItem', filename: 'menu' },
  'Orders': { model: 'Order', filename: 'orders' },
  'OrderItems': { model: 'OrderItem', filename: 'order_items' },
  'Customers': { model: 'Customer', filename: 'customers' },
  'Payments': { model: 'Payment', filename: 'payments' },
  'Staff': { model: 'Staff', filename: 'staff' },
  'Inventory': { model: 'Inventory', filename: 'inventory' },
  'Reviews': { model: 'Review', filename: 'reviews' },
  'Users': { model: 'User', filename: 'authenticate' }
};

// Get table modification time from SQLite
async function getTableModTime(tableName) {
  try {
    // Query SQLite's internal tables to get modification info
    const [results] = await sequelize.query(
      `SELECT MAX(updatedAt) as lastMod FROM ${tableName}`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (results && results.lastMod) {
      return new Date(results.lastMod).getTime();
    }
    
    // Fallback: check file modification time
    const dbPath = path.join(__dirname, '..', 'database.sqlite');
    if (fs.existsSync(dbPath)) {
      return fs.statSync(dbPath).mtime.getTime();
    }
    
    return 0;
  } catch (error) {
    // If table doesn't have updatedAt, use file mtime
    const dbPath = path.join(__dirname, '..', 'database.sqlite');
    if (fs.existsSync(dbPath)) {
      return fs.statSync(dbPath).mtime.getTime();
    }
    return 0;
  }
}

// Check for changes in a specific table
async function checkTableChanges(tableName) {
  const mapping = tableMapping[tableName];
  if (!mapping) return false;
  
  const currentModTime = await getTableModTime(tableName);
  const lastModTime = lastModTimes[tableName] || 0;
  
  if (currentModTime > lastModTime) {
    console.log(`[DB Monitor] 🔄 Detected changes in ${tableName}`);
    lastModTimes[tableName] = currentModTime;
    
    // Export the table to markdown
    try {
      setExportingFromSQL(true);
      const model = models[mapping.model];
      if (model) {
        await exportModelToMarkdown(model, mapping.filename);
        console.log(`[DB Monitor] ✅ Exported ${mapping.filename}.md`);
        
        // Reset flag after a delay
        setTimeout(() => {
          setExportingFromSQL(false);
        }, 2000);
      }
      return true;
    } catch (error) {
      console.error(`[DB Monitor] ❌ Error exporting ${tableName}:`, error.message);
      setExportingFromSQL(false);
      return false;
    }
  }
  
  return false;
}

// Monitor database for external changes
async function startMonitoring(intervalMs = 3000) {
  if (isMonitoring) {
    console.log('[DB Monitor] Already monitoring database');
    return;
  }
  
  console.log('[DB Monitor] 🔍 Starting database change monitoring...');
  
  // Initialize last modification times
  for (const tableName of Object.keys(tableMapping)) {
    try {
      lastModTimes[tableName] = await getTableModTime(tableName);
    } catch (error) {
      console.warn(`[DB Monitor] Could not get mod time for ${tableName}:`, error.message);
    }
  }
  
  isMonitoring = true;
  
  // Monitor database file modification time
  const dbPath = path.join(__dirname, '..', 'database.sqlite');
  let lastFileModTime = fs.existsSync(dbPath) 
    ? fs.statSync(dbPath).mtime.getTime() 
    : 0;
  
  monitoringInterval = setInterval(async () => {
    try {
      // Check if database file was modified
      if (fs.existsSync(dbPath)) {
        const currentFileModTime = fs.statSync(dbPath).mtime.getTime();
        
        if (currentFileModTime > lastFileModTime) {
          console.log('[DB Monitor] 📝 Database file modified externally, checking all tables...');
          lastFileModTime = currentFileModTime;
          
          // Check all tables for changes
          let hasChanges = false;
          for (const tableName of Object.keys(tableMapping)) {
            const changed = await checkTableChanges(tableName);
            if (changed) hasChanges = true;
          }
          
          if (hasChanges) {
            // Notify frontend (via a file or event that frontend can poll)
            // For now, we'll rely on the frontend's auto-refresh mechanism
            console.log('[DB Monitor] ✅ Changes detected and exported');
          }
        }
      }
    } catch (error) {
      console.error('[DB Monitor] Error during monitoring:', error.message);
    }
  }, intervalMs);
  
  console.log(`[DB Monitor] ✅ Monitoring active (checking every ${intervalMs}ms)`);
}

// Stop monitoring
function stopMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
  isMonitoring = false;
  console.log('[DB Monitor] ⏹️  Monitoring stopped');
}

// Force sync all tables
async function forceSyncAll() {
  console.log('[DB Monitor] 🔄 Force syncing all tables...');
  setExportingFromSQL(true);
  
  try {
    await exportAllTables(models);
    console.log('[DB Monitor] ✅ All tables synced');
    
    // Update last mod times
    for (const tableName of Object.keys(tableMapping)) {
      lastModTimes[tableName] = await getTableModTime(tableName);
    }
  } catch (error) {
    console.error('[DB Monitor] ❌ Error during force sync:', error.message);
  } finally {
    setTimeout(() => {
      setExportingFromSQL(false);
    }, 2000);
  }
}

// Sync a specific table
async function syncTable(tableName) {
  const mapping = tableMapping[tableName];
  if (!mapping) {
    throw new Error(`Unknown table: ${tableName}`);
  }
  
  console.log(`[DB Monitor] 🔄 Syncing ${tableName}...`);
  setExportingFromSQL(true);
  
  try {
    const model = models[mapping.model];
    if (model) {
      await exportModelToMarkdown(model, mapping.filename);
      lastModTimes[tableName] = await getTableModTime(tableName);
      console.log(`[DB Monitor] ✅ Synced ${tableName} -> ${mapping.filename}.md`);
    }
  } catch (error) {
    console.error(`[DB Monitor] ❌ Error syncing ${tableName}:`, error.message);
    throw error;
  } finally {
    setTimeout(() => {
      setExportingFromSQL(false);
    }, 2000);
  }
}

module.exports = {
  startMonitoring,
  stopMonitoring,
  forceSyncAll,
  syncTable,
  isMonitoring: () => isMonitoring
};

