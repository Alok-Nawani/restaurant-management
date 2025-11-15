const express = require('express');
const router = express.Router();
const { sequelize, ...models } = require('../models');
const { auth } = require('../middleware/auth');
const { exportAllTables, exportModelToMarkdown } = require('../utils/tableExporter');
const { setExportingFromSQL } = require('../utils/markdownSync');
const { forceSyncAll, syncTable } = require('../utils/databaseChangeMonitor');

// Execute SQL query
router.post('/execute', auth, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'SQL query is required' 
      });
    }

    // Security: Block dangerous operations in production
    const trimmedQuery = query.trim().toUpperCase();
    const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE'];
    
    // Detect query types
    const isSelectQuery = trimmedQuery.startsWith('SELECT');
    const isPragmaQuery = trimmedQuery.startsWith('PRAGMA');
    const isReadOnly = process.env.NODE_ENV === 'production' && !isSelectQuery && !isPragmaQuery;
    
    if (isReadOnly) {
      // In production, only allow SELECT queries
      return res.status(403).json({ 
        success: false, 
        error: 'Only SELECT queries are allowed in production mode' 
      });
    }

    // Check for dangerous keywords (even in development, warn about destructive operations)
    const hasDangerousKeyword = dangerousKeywords.some(keyword => 
      trimmedQuery.includes(keyword)
    );

    if (hasDangerousKeyword && !isSelectQuery) {
      // In development, allow but log a warning
      console.warn(`⚠️  Potentially dangerous SQL query executed: ${query.substring(0, 100)}`);
    }

    // Execute the query - use a simpler approach that works with SQLite
    let results;
    let affectedRows = 0;
    
    if (isPragmaQuery) {
      // PRAGMA queries need special handling - use RAW type
      // PRAGMA returns [[results], metadata] where results is array of objects
      const queryResult = await sequelize.query(query, {
        type: sequelize.QueryTypes.RAW
      });
      
      // Extract the actual results array
      // queryResult format: [[{...}, {...}], {}]
      if (Array.isArray(queryResult) && queryResult.length > 0 && Array.isArray(queryResult[0])) {
        results = queryResult[0]; // This is the array of row objects
      } else if (Array.isArray(queryResult) && queryResult.length > 0) {
        // Fallback: if first element is not array, use it directly
        results = queryResult[0];
      } else if (Array.isArray(queryResult)) {
        results = queryResult;
      } else {
        results = [];
      }
    } else if (isSelectQuery) {
      // For SELECT queries
      results = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT
      });
    } else {
      // For INSERT, UPDATE, DELETE, etc.
      // Execute the query - Sequelize handles SQLite queries
      const queryResult = await sequelize.query(query);
      
      // Sequelize returns [results, metadata] for SQLite
      // For INSERT/UPDATE/DELETE, results is usually empty array
      let metadata = null;
      
      if (Array.isArray(queryResult) && queryResult.length === 2) {
        metadata = queryResult[1];
      }
      
      // Try to extract affected rows from metadata
      if (metadata && typeof metadata === 'object') {
        affectedRows = metadata.changes !== undefined ? metadata.changes : 1;
      } else {
        affectedRows = 1; // Default to 1 if we can't determine
      }
      
      // For INSERT queries, try to get the last inserted row ID
      if (trimmedQuery.startsWith('INSERT')) {
        try {
          const lastIdResult = await sequelize.query(
            'SELECT last_insert_rowid() as lastInsertRowid',
            { type: sequelize.QueryTypes.SELECT }
          );
          
          if (lastIdResult && lastIdResult.length > 0) {
            const row = lastIdResult[0];
            const lastId = row.lastInsertRowid || row.lastinsertrowid || null;
            results = {
              lastInsertRowid: lastId,
              changes: affectedRows
            };
          } else {
            results = { changes: affectedRows };
          }
        } catch (lastIdError) {
          // If getting last ID fails, just return changes
          console.warn('Failed to get last_insert_rowid:', lastIdError.message);
          results = { changes: affectedRows };
        }
      } else {
        // For UPDATE/DELETE, just return changes
        results = { changes: affectedRows };
      }
    }

    // Format results - handle both array and object formats
    let formattedResults = [];
    let columns = [];
    
    if (isPragmaQuery && results) {
      // PRAGMA results should already be an array of objects
      if (Array.isArray(results) && results.length > 0) {
        formattedResults = results;
        // Get columns from first row
        if (typeof results[0] === 'object' && results[0] !== null) {
          columns = Object.keys(results[0]);
        }
      } else if (typeof results === 'object' && results !== null && !Array.isArray(results)) {
        // Single object result
        formattedResults = [results];
        columns = Object.keys(results);
      } else {
        formattedResults = [];
        columns = [];
      }
    } else if (isSelectQuery && results) {
      // Handle SELECT query results
      if (Array.isArray(results)) {
        formattedResults = results.map(row => {
          if (typeof row === 'object' && row !== null) {
            const formattedRow = {};
            Object.keys(row).forEach(key => {
              // Handle SQLite's column naming (table.column format)
              const cleanKey = key.includes('.') ? key.split('.').pop() : key;
              formattedRow[cleanKey] = row[key];
            });
            return formattedRow;
          }
          return row;
        });
      } else if (typeof results === 'object') {
        // Single result object
        const formattedRow = {};
        Object.keys(results).forEach(key => {
          const cleanKey = key.includes('.') ? key.split('.').pop() : key;
          formattedRow[cleanKey] = results[key];
        });
        formattedResults = [formattedRow];
      }
      
      // Get columns from first row if available
      columns = formattedResults.length > 0 && typeof formattedResults[0] === 'object'
        ? Object.keys(formattedResults[0])
        : [];
    }

    // Return response
    if (isSelectQuery || isPragmaQuery) {
      // Debug log for PRAGMA queries
      if (isPragmaQuery) {
        console.log('PRAGMA Response:', {
          formattedResultsLength: formattedResults.length,
          columnsLength: columns.length,
          sampleRow: formattedResults[0]
        });
      }
      
      res.json({
        success: true,
        data: formattedResults,
        rowCount: formattedResults.length,
        columns: columns,
        message: `Query executed successfully. ${formattedResults.length} row(s) returned.`
      });
    } else {
      // For INSERT/UPDATE/DELETE queries
      const responseData = {
        success: true,
        data: [],
        rowCount: 0,
        columns: [],
        affectedRows: affectedRows,
        message: `Query executed successfully. ${affectedRows} row(s) affected.`
      };
      
      // If results contain lastInsertRowid (from INSERT), include it
      if (results && typeof results === 'object' && !Array.isArray(results)) {
        if (results.lastInsertRowid !== undefined) {
          responseData.lastInsertRowid = results.lastInsertRowid;
          responseData.message = `Query executed successfully. ${affectedRows} row(s) affected. Last inserted ID: ${results.lastInsertRowid}`;
        }
        if (results.changes !== undefined) {
          responseData.affectedRows = results.changes;
        }
      }
      
      // After INSERT/UPDATE/DELETE, trigger markdown export for affected tables
      // This ensures markdown files are updated when using raw SQL
      // Do this BEFORE sending response to ensure it completes
      try {
        const trimmedQuery = query.trim().toUpperCase();
        if (trimmedQuery.startsWith('INSERT INTO') || trimmedQuery.startsWith('UPDATE') || trimmedQuery.startsWith('DELETE FROM')) {
          // Set flag to prevent markdown sync watcher from overwriting our changes
          setExportingFromSQL(true);
          
          // Determine which table was affected
          let tableName = null;
          if (trimmedQuery.startsWith('INSERT INTO')) {
            const match = query.match(/INSERT\s+INTO\s+(\w+)/i);
            tableName = match ? match[1] : null;
          } else if (trimmedQuery.startsWith('UPDATE')) {
            const match = query.match(/UPDATE\s+(\w+)/i);
            tableName = match ? match[1] : null;
          } else if (trimmedQuery.startsWith('DELETE FROM')) {
            const match = query.match(/DELETE\s+FROM\s+(\w+)/i);
            tableName = match ? match[1] : null;
          }
          
          // Map table name to model (handle both singular and plural)
          if (tableName) {
            // Normalize table name - remove trailing 's' if present for model lookup
            const normalizedTableName = tableName.replace(/s$/, '');
            
            const tableToModel = {
              'MenuItem': 'MenuItem',
              'MenuItems': 'MenuItem',
              'Order': 'Order',
              'Orders': 'Order',
              'OrderItem': 'OrderItem',
              'OrderItems': 'OrderItem',
              'Customer': 'Customer',
              'Customers': 'Customer',
              'Payment': 'Payment',
              'Payments': 'Payment',
              'Staff': 'Staff',
              'Inventory': 'Inventory',
              'Review': 'Review',
              'Reviews': 'Review',
              'User': 'User',
              'Users': 'User'
            };
            
            const modelName = tableToModel[tableName] || tableToModel[normalizedTableName] || tableName;
            const model = models[modelName];
            
            if (model) {
              // Export the affected table
              const filenameMap = {
                'MenuItem': 'menu',
                'Order': 'orders',
                'OrderItem': 'order_items',
                'Customer': 'customers',
                'Payment': 'payments',
                'Staff': 'staff',
                'Inventory': 'inventory',
                'Review': 'reviews',
                'User': 'authenticate'
              };
              const filename = filenameMap[modelName] || modelName.toLowerCase();
              await exportModelToMarkdown(model, filename);
              console.log(`[SQL] ✅ Exported ${filename}.md after SQL ${trimmedQuery.split(' ')[0]} on ${tableName}`);
              
              // Wait a bit to ensure file write completes
              await new Promise(resolve => setTimeout(resolve, 100));
            } else {
              console.warn(`[SQL] Model not found for table: ${tableName} (tried: ${modelName})`);
            }
          }
          
          // Reset flag after export
          setTimeout(() => {
            setExportingFromSQL(false);
          }, 2000); // Keep flag for 2 seconds to prevent sync loop
        }
      } catch (exportError) {
        // Don't fail the query if export fails
        console.error('[SQL] ❌ Failed to export after SQL query:', exportError.message);
        setExportingFromSQL(false);
      }
      
      res.json(responseData);
    }

  } catch (error) {
    console.error('SQL Query Error:', error);
    console.error('Error Stack:', error.stack);
    console.error('Query that failed:', query.substring(0, 200));
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute SQL query',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      query: process.env.NODE_ENV === 'development' ? query.substring(0, 200) : undefined
    });
  }
});

// Get table list
router.get('/tables', auth, async (req, res) => {
  try {
    const tables = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    res.json({
      success: true,
      tables: tables.map(t => t.name || t.NAME || t.Name)
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch tables'
    });
  }
});

// Get table schema
router.get('/schema/:tableName', auth, async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Validate table name (only alphanumeric and underscore)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid table name'
      });
    }
    
    const schema = await sequelize.query(
      `PRAGMA table_info(${tableName})`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    res.json({
      success: true,
      tableName,
      schema
    });
  } catch (error) {
    console.error('Error fetching schema:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch table schema'
    });
  }
});

// Refresh/export all tables to markdown
router.post('/refresh-tables', auth, async (req, res) => {
  try {
    await forceSyncAll();
    res.json({
      success: true,
      message: 'All tables exported to markdown files successfully'
    });
  } catch (error) {
    console.error('Error refreshing tables:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to refresh tables'
    });
  }
});

// Sync a specific table
router.post('/sync-table/:tableName', auth, async (req, res) => {
  try {
    const { tableName } = req.params;
    await syncTable(tableName);
    res.json({
      success: true,
      message: `Table ${tableName} synced successfully`
    });
  } catch (error) {
    console.error('Error syncing table:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync table'
    });
  }
});

module.exports = router;

