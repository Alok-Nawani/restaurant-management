const fs = require('fs');
const path = require('path');
const { sequelize, ...models } = require('../models');
const { exportAllTables, exportModelToMarkdown } = require('./tableExporter');
const { setExportingFromSQL } = require('./markdownSync');

// Track last known modification times
let lastModTimes = {};
// Track table checksums for better change detection
let lastChecksums = {};
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
    // First, try to get MAX(updatedAt) if the table has that column
    try {
      const [results] = await sequelize.query(
        `SELECT MAX(updatedAt) as lastMod FROM ${tableName}`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      if (results && results.lastMod) {
        return new Date(results.lastMod).getTime();
      }
    } catch (e) {
      // Table might not have updatedAt column, continue to other methods
    }
    
    // Fallback: check file modification time (more reliable for external changes)
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

// Get table row count and checksum for change detection
async function getTableChecksum(tableName) {
  try {
    // Get row count
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as count FROM ${tableName}`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const rowCount = countResult?.count || 0;
    
    // Get a simple checksum of recent rows (last 10 rows' IDs)
    try {
      const [checksumResult] = await sequelize.query(
        `SELECT GROUP_CONCAT(id) as ids FROM (SELECT id FROM ${tableName} ORDER BY id DESC LIMIT 10)`,
        { type: sequelize.QueryTypes.SELECT }
      );
      const checksum = `${rowCount}-${checksumResult?.ids || ''}`;
      return checksum;
    } catch (e) {
      // If no id column, just use row count
      return `${rowCount}`;
    }
  } catch (error) {
    return '0';
  }
}

// Check for changes in a specific table
async function checkTableChanges(tableName) {
  const mapping = tableMapping[tableName];
  if (!mapping) return false;
  
  // Method 1: Check modification time
  const currentModTime = await getTableModTime(tableName);
  const lastModTime = lastModTimes[tableName] || 0;
  
  // Method 2: Check checksum (catches changes even without updatedAt)
  const currentChecksum = await getTableChecksum(tableName);
  const lastChecksum = lastChecksums[tableName] || '';
  
  // If either method detects a change, export
  const timeChanged = currentModTime > lastModTime;
  const checksumChanged = currentChecksum !== lastChecksum;
  
  if (timeChanged || checksumChanged) {
    console.log(`[DB Monitor] 🔄 Detected changes in ${tableName} (time: ${timeChanged}, checksum: ${checksumChanged})`);
    lastModTimes[tableName] = currentModTime;
    lastChecksums[tableName] = currentChecksum;
    
    // Export the table to markdown
    try {
      setExportingFromSQL(true);
      const model = models[mapping.model];
      if (model) {
        await exportModelToMarkdown(model, mapping.filename);
        console.log(`[DB Monitor] ✅ Exported ${mapping.filename}.md`);
        
        // Dispatch event for frontend refresh (if possible)
        // The frontend will pick this up via its auto-refresh mechanism
        
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
  
  // Initialize last modification times and checksums
  for (const tableName of Object.keys(tableMapping)) {
    try {
      lastModTimes[tableName] = await getTableModTime(tableName);
      lastChecksums[tableName] = await getTableChecksum(tableName);
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
        
        // Always check all tables (not just when file mtime changes)
        // This ensures we catch changes even if mtime doesn't update immediately
        let hasChanges = false;
        for (const tableName of Object.keys(tableMapping)) {
          const changed = await checkTableChanges(tableName);
          if (changed) hasChanges = true;
        }
        
        if (hasChanges) {
          lastFileModTime = currentFileModTime;
          console.log('[DB Monitor] ✅ Changes detected and exported');
        } else if (currentFileModTime > lastFileModTime) {
          // File was modified but no table changes detected yet
          // This might be a write in progress, so update the timestamp
          lastFileModTime = currentFileModTime;
          console.log('[DB Monitor] 📝 Database file modified, monitoring for changes...');
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
    
    // Update last mod times and checksums
    for (const tableName of Object.keys(tableMapping)) {
      lastModTimes[tableName] = await getTableModTime(tableName);
      lastChecksums[tableName] = await getTableChecksum(tableName);
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
      lastChecksums[tableName] = await getTableChecksum(tableName);
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


