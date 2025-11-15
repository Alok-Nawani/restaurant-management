#!/usr/bin/env node

/**
 * Manual database sync script
 * Run this after executing SQL queries from terminal or external tools
 * 
 * Usage:
 *   node sync-db.js
 *   node sync-db.js Orders  (sync specific table)
 */

const { forceSyncAll, syncTable } = require('./utils/databaseChangeMonitor');

async function main() {
  const tableName = process.argv[2];
  
  try {
    if (tableName) {
      console.log(`🔄 Syncing table: ${tableName}...`);
      await syncTable(tableName);
      console.log(`✅ Table ${tableName} synced successfully!`);
    } else {
      console.log('🔄 Syncing all tables...');
      await forceSyncAll();
      console.log('✅ All tables synced successfully!');
    }
    
    console.log('\n💡 Changes should now be visible in:');
    console.log('   - Markdown files: backend/data_tables/*.md');
    console.log('   - Frontend: Refresh your browser or wait for auto-refresh');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing:', error.message);
    process.exit(1);
  }
}

main();

