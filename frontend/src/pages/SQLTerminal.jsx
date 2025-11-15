import React, { useState, useEffect, useRef } from 'react';
import { fetchJSON } from '../api/api';
import toast from 'react-hot-toast';

export default function SQLTerminal() {
  const [query, setQuery] = useState('SELECT * FROM MenuItems LIMIT 10;');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [queryHistory, setQueryHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState('query'); // 'query' or 'templates'
  const textareaRef = useRef(null);

  useEffect(() => {
    loadTables();
    const savedQuery = localStorage.getItem('sqlTerminalLastQuery');
    if (savedQuery) {
      setQuery(savedQuery);
    }
  }, []);

  const loadTables = async () => {
    try {
      const response = await fetchJSON('/sql/tables');
      setTables(response.tables || []);
    } catch (error) {
      console.error('Error loading tables:', error);
      toast.error('Failed to load tables');
    }
  };

  const refreshTables = async () => {
    try {
      setLoading(true);
      const response = await fetchJSON('/sql/refresh-tables', {
        method: 'POST'
      });
      if (response.success) {
        toast.success('All tables exported to markdown files successfully');
        await loadTables();
      } else {
        toast.error(response.error || 'Failed to refresh tables');
      }
    } catch (error) {
      console.error('Error refreshing tables:', error);
      toast.error('Failed to refresh tables');
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!query.trim()) {
      toast.error('Please enter a SQL query');
      return;
    }

    try {
      setLoading(true);
      const response = await fetchJSON('/sql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });

      if (response.success) {
        setResults(response);
        if (!queryHistory.includes(query.trim())) {
          setQueryHistory(prev => [query.trim(), ...prev].slice(0, 50));
        }
        localStorage.setItem('sqlTerminalLastQuery', query.trim());
        
        const trimmedQuery = query.trim().toUpperCase();
        if (trimmedQuery.startsWith('INSERT') || trimmedQuery.startsWith('UPDATE') || trimmedQuery.startsWith('DELETE')) {
          await loadTables();
          toast.success(response.message || 'Query executed successfully. Tables refreshed.');
          // Trigger frontend refresh notification
          window.dispatchEvent(new CustomEvent('databaseUpdated'));
        } else {
          toast.success(response.message || 'Query executed successfully');
        }
      } else {
        toast.error(response.error || 'Query failed');
        setResults({ success: false, error: response.error });
      }
    } catch (error) {
      console.error('Error executing query:', error);
      toast.error(error.message || 'Failed to execute query');
      setResults({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeQuery();
    }
    else if (e.key === 'ArrowUp' && queryHistory.length > 0) {
      e.preventDefault();
      const newIndex = historyIndex < queryHistory.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(newIndex);
      if (newIndex >= 0) {
        setQuery(queryHistory[newIndex]);
      }
    }
    else if (e.key === 'ArrowDown' && historyIndex >= 0) {
      e.preventDefault();
      const newIndex = historyIndex > 0 ? historyIndex - 1 : -1;
      setHistoryIndex(newIndex);
      if (newIndex >= 0) {
        setQuery(queryHistory[newIndex]);
      } else {
        setQuery('');
      }
    }
  };

  const loadTableSchema = async (tableName) => {
    try {
      const response = await fetchJSON(`/sql/schema/${tableName}`);
      if (response.success) {
        const columns = response.schema.map(col => col.name).join(', ');
        setQuery(`SELECT ${columns} FROM ${tableName} LIMIT 10;`);
        setSelectedTable(tableName);
        toast.success(`Loaded schema for ${tableName}`);
      }
    } catch (error) {
      console.error('Error loading schema:', error);
      toast.error('Failed to load table schema');
    }
  };

  const insertTemplate = (template) => {
    setQuery(template);
    setActiveTab('query');
    textareaRef.current?.focus();
  };

  // Comprehensive query templates organized by category
  const queryTemplates = {
    'Menu Items': [
      {
        name: 'Add New Menu Item',
        query: `INSERT INTO MenuItems (name, price, category, description, available, isVeg, createdAt, updatedAt)
VALUES ('New Dish', 150, 'Curry', 'Delicious curry dish', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`
      },
      {
        name: 'Update Menu Item Price',
        query: `UPDATE MenuItems SET price = 200, updatedAt = CURRENT_TIMESTAMP WHERE id = 1;`
      },
      {
        name: 'Mark Item as Unavailable',
        query: `UPDATE MenuItems SET available = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = 1;`
      },
      {
        name: 'Delete Menu Item',
        query: `DELETE FROM MenuItems WHERE id = 1;`
      },
      {
        name: 'View All Menu Items',
        query: `SELECT id, name, price, category, available, isVeg FROM MenuItems ORDER BY category, name;`
      }
    ],
    'Orders': [
      {
        name: 'Create New Order',
        query: `INSERT INTO Orders (tableNumber, status, total, customerId, createdAt, updatedAt)
VALUES ('T-10', 'PENDING', 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`
      },
      {
        name: 'Find Menu Item IDs (Roti, Paneer, Naan)',
        query: `-- Find Roti, Paneer, and Naan IDs
SELECT id, name, price FROM MenuItems 
WHERE name LIKE '%Roti%' OR name LIKE '%Paneer%' OR name LIKE '%Naan%'
ORDER BY name;`
      },
      {
        name: 'Add Items to Order (Roti + Paneer)',
        query: `-- Replace 100 with your order ID, and menu item IDs with actual IDs
INSERT INTO OrderItems (orderId, menuItemId, quantity, price)
VALUES 
  (100, 15, 2, 20),   -- 2x Roti (replace 15 with actual Roti ID)
  (100, 25, 1, 130);  -- 1x Paneer (replace 25 with actual Paneer ID)

-- Update order total:
UPDATE Orders 
SET total = (SELECT SUM(quantity * price) FROM OrderItems WHERE orderId = 100),
    updatedAt = CURRENT_TIMESTAMP
WHERE id = 100;`
      },
      {
        name: 'Change Roti to Naan in Order',
        query: `-- Step 1: Find order item ID for Roti
SELECT oi.id, m.name FROM OrderItems oi
JOIN MenuItems m ON oi.menuItemId = m.id
WHERE oi.orderId = 100 AND m.name LIKE '%Roti%';

-- Step 2: Update to Naan (replace IDs with actual values)
UPDATE OrderItems 
SET menuItemId = 16, price = 30, updatedAt = CURRENT_TIMESTAMP
WHERE id = 5 AND orderId = 100;

-- Step 3: Update order total
UPDATE Orders 
SET total = (SELECT SUM(quantity * price) FROM OrderItems WHERE orderId = 100),
    updatedAt = CURRENT_TIMESTAMP
WHERE id = 100;`
      },
      {
        name: 'Update Order Status to CONFIRMED',
        query: `UPDATE Orders SET status = 'CONFIRMED', updatedAt = CURRENT_TIMESTAMP WHERE id = 1;`
      },
      {
        name: 'Update Order Status to PREPARING',
        query: `UPDATE Orders SET status = 'PREPARING', updatedAt = CURRENT_TIMESTAMP WHERE id = 1;`
      },
      {
        name: 'Update Order Status to READY',
        query: `UPDATE Orders SET status = 'READY', updatedAt = CURRENT_TIMESTAMP WHERE id = 1;`
      },
      {
        name: 'Update Order Status to DELIVERED',
        query: `UPDATE Orders SET status = 'DELIVERED', updatedAt = CURRENT_TIMESTAMP WHERE id = 1;`
      },
      {
        name: 'View Order with Items',
        query: `SELECT 
  o.id as orderId,
  o.tableNumber,
  o.status,
  o.total,
  c.name as customerName,
  GROUP_CONCAT(m.name || ' x' || oi.quantity) as items
FROM Orders o
LEFT JOIN Customers c ON o.customerId = c.id
LEFT JOIN OrderItems oi ON o.id = oi.orderId
LEFT JOIN MenuItems m ON oi.menuItemId = m.id
WHERE o.id = 1
GROUP BY o.id;`
      },
      {
        name: 'View All Pending Orders',
        query: `SELECT o.*, c.name as customerName 
FROM Orders o 
LEFT JOIN Customers c ON o.customerId = c.id 
WHERE o.status = 'PENDING' 
ORDER BY o.createdAt DESC;`
      }
    ],
    'Customers': [
      {
        name: 'Add New Customer',
        query: `INSERT INTO Customers (name, email, phone, address, createdAt, updatedAt)
VALUES ('John Doe', 'john@example.com', '+919876543210', '123 Main St', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`
      },
      {
        name: 'Update Customer Info',
        query: `UPDATE Customers 
SET name = 'John Smith', email = 'johnsmith@example.com', updatedAt = CURRENT_TIMESTAMP 
WHERE id = 1;`
      },
      {
        name: 'View All Customers',
        query: `SELECT id, name, email, phone, address FROM Customers ORDER BY name;`
      }
    ],
    'Staff': [
      {
        name: 'Add New Staff Member',
        query: `INSERT INTO Staff (name, email, phone, role, position, salary, hireDate, createdAt, updatedAt)
VALUES ('Jane Doe', 'jane@example.com', '+919876543211', 'waiter', 'Senior Waiter', 25000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`
      },
      {
        name: 'Update Staff Salary',
        query: `UPDATE Staff SET salary = 30000, updatedAt = CURRENT_TIMESTAMP WHERE id = 1;`
      },
      {
        name: 'Update Staff Role',
        query: `UPDATE Staff SET role = 'chef', position = 'Head Chef', updatedAt = CURRENT_TIMESTAMP WHERE id = 1;`
      },
      {
        name: 'View All Staff',
        query: `SELECT id, name, email, role, position, salary FROM Staff ORDER BY role, name;`
      }
    ],
    'Inventory': [
      {
        name: 'Add New Inventory Item',
        query: `INSERT INTO Inventory (name, category, quantity, unit, reorderLevel, supplier, price, createdAt, updatedAt)
VALUES ('Tomatoes', 'Vegetables', 100, 'kg', 20, 'Fresh Farm Co', 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`
      },
      {
        name: 'Update Inventory Quantity',
        query: `UPDATE Inventory SET quantity = 150, updatedAt = CURRENT_TIMESTAMP WHERE id = 1;`
      },
      {
        name: 'Decrease Inventory (After Use)',
        query: `UPDATE Inventory SET quantity = quantity - 10, updatedAt = CURRENT_TIMESTAMP WHERE id = 1;`
      },
      {
        name: 'Increase Inventory (Restock)',
        query: `UPDATE Inventory SET quantity = quantity + 50, updatedAt = CURRENT_TIMESTAMP WHERE id = 1;`
      },
      {
        name: 'View Low Stock Items',
        query: `SELECT * FROM Inventory WHERE quantity <= reorderLevel ORDER BY quantity ASC;`
      },
      {
        name: 'View All Inventory',
        query: `SELECT id, name, category, quantity, unit, reorderLevel FROM Inventory ORDER BY category, name;`
      }
    ],
    'Reviews': [
      {
        name: 'Add New Review',
        query: `INSERT INTO Reviews (customerId, orderId, rating, comment, foodRating, serviceRating, ambianceRating, isVerified, createdAt, updatedAt)
VALUES (1, 1, 5, 'Excellent food and service!', 5, 5, 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`
      },
      {
        name: 'Update Review',
        query: `UPDATE Reviews 
SET rating = 4, comment = 'Good experience', updatedAt = CURRENT_TIMESTAMP 
WHERE id = 1;`
      },
      {
        name: 'View All Reviews',
        query: `SELECT r.*, c.name as customerName, o.tableNumber 
FROM Reviews r
LEFT JOIN Customers c ON r.customerId = c.id
LEFT JOIN Orders o ON r.orderId = o.id
ORDER BY r.createdAt DESC;`
      }
    ],
    'Payments': [
      {
        name: 'Add Payment for Order',
        query: `INSERT INTO Payments (orderId, amount, method, status, transactionId, createdAt, updatedAt)
VALUES (1, 500, 'cash', 'completed', 'TXN-' || strftime('%Y%m%d%H%M%S', 'now'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`
      },
      {
        name: 'Update Payment Status',
        query: `UPDATE Payments SET status = 'completed', updatedAt = CURRENT_TIMESTAMP WHERE id = 1;`
      },
      {
        name: 'View All Payments',
        query: `SELECT p.*, o.tableNumber, o.total as orderTotal 
FROM Payments p
LEFT JOIN Orders o ON p.orderId = o.id
ORDER BY p.createdAt DESC;`
      }
    ],
    'Analytics': [
      {
        name: 'Total Revenue',
        query: `SELECT SUM(total) as totalRevenue FROM Orders WHERE status IN ('DELIVERED', 'PAID', 'COMPLETED');`
      },
      {
        name: 'Revenue by Status',
        query: `SELECT status, COUNT(*) as orderCount, SUM(total) as revenue 
FROM Orders 
GROUP BY status 
ORDER BY revenue DESC;`
      },
      {
        name: 'Top Selling Menu Items',
        query: `SELECT m.name, SUM(oi.quantity) as totalSold, SUM(oi.quantity * oi.price) as revenue
FROM OrderItems oi
JOIN MenuItems m ON oi.menuItemId = m.id
GROUP BY m.id
ORDER BY totalSold DESC
LIMIT 10;`
      },
      {
        name: 'Average Order Value',
        query: `SELECT AVG(total) as avgOrderValue, COUNT(*) as totalOrders 
FROM Orders 
WHERE status IN ('DELIVERED', 'PAID', 'COMPLETED');`
      },
      {
        name: 'Customer Order History',
        query: `SELECT c.name, COUNT(o.id) as orderCount, SUM(o.total) as totalSpent
FROM Customers c
LEFT JOIN Orders o ON c.id = o.customerId
GROUP BY c.id
ORDER BY totalSpent DESC;`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-indigo-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">💻 SQL Terminal</h1>
              <p className="text-indigo-100">Execute SQL queries and manage your database directly</p>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedTable}
                onChange={(e) => {
                  setSelectedTable(e.target.value);
                  if (e.target.value) {
                    loadTableSchema(e.target.value);
                  }
                }}
                className="px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 focus:ring-2 focus:ring-indigo-300 border border-indigo-500"
              >
                <option value="">Select Table...</option>
                {tables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
              <button
                onClick={refreshTables}
                disabled={loading}
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center gap-2"
                title="Export all tables to markdown"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Tables
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="mb-6 bg-white rounded-xl shadow-lg border border-indigo-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('query')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'query'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Query Editor
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'templates'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Query Templates
            </button>
          </div>

          {activeTab === 'query' ? (
            <div className="p-6">
              {/* SQL Editor */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">SQL Query</label>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-100 rounded border">Ctrl/Cmd + Enter</kbd>
                    <span>to execute</span>
                  </div>
                </div>
                <textarea
                  ref={textareaRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHistoryIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full h-64 p-4 font-mono text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none bg-gray-50"
                  placeholder="Enter your SQL query here..."
                  spellCheck={false}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={executeQuery}
                    disabled={loading || !query.trim()}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Executing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Execute Query
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Queries */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Quick Queries:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'All Menu Items', query: 'SELECT * FROM MenuItems LIMIT 20;' },
                    { label: 'All Orders', query: 'SELECT * FROM Orders ORDER BY createdAt DESC LIMIT 10;' },
                    { label: 'All Customers', query: 'SELECT * FROM Customers LIMIT 20;' },
                    { label: 'Order Items', query: 'SELECT oi.*, m.name as menuItemName FROM OrderItems oi JOIN MenuItems m ON oi.menuItemId = m.id LIMIT 20;' },
                    { label: 'Total Revenue', query: 'SELECT SUM(total) as totalRevenue FROM Orders WHERE status IN ("DELIVERED", "PAID", "COMPLETED");' }
                  ].map((quick, idx) => (
                    <button
                      key={idx}
                      onClick={() => insertTemplate(quick.query)}
                      className="px-3 py-1.5 text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors font-medium"
                    >
                      {quick.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Click on any template to load it into the query editor</p>
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {Object.entries(queryTemplates).map(([category, templates]) => (
                  <div key={category} className="border-b border-gray-200 pb-4 last:border-0">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-3">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {templates.map((template, idx) => (
                        <button
                          key={idx}
                          onClick={() => insertTemplate(template.query)}
                          className="text-left p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg transition-colors"
                        >
                          <div className="font-medium text-gray-900">{template.name}</div>
                          <div className="text-xs text-gray-500 mt-1 font-mono truncate">{template.query.substring(0, 60)}...</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="bg-white rounded-xl shadow-lg border border-indigo-200 overflow-hidden">
            <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {results.success ? (
                    <>
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Query Results
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Error
                    </>
                  )}
                </h3>
                {results.success && (
                  <div className="flex items-center gap-4">
                    {results.affectedRows !== undefined && (
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">{results.affectedRows}</span> row(s) affected
                      </span>
                    )}
                    {results.lastInsertRowid && (
                      <span className="text-sm text-indigo-600 font-medium">
                        Last ID: {results.lastInsertRowid}
                      </span>
                    )}
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">{results.rowCount}</span> row(s) returned
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="overflow-auto max-h-96">
              {results.success ? (
                results.data && results.data.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {results.columns.map((col, idx) => (
                            <th
                              key={idx}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.data.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-indigo-50 transition-colors">
                            {results.columns.map((col, colIdx) => (
                              <td
                                key={colIdx}
                                className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap"
                              >
                                {row[col] !== null && row[col] !== undefined
                                  ? String(row[col])
                                  : <span className="text-gray-400 italic">NULL</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-lg font-medium">Query executed successfully</p>
                    <p className="text-sm">No rows returned</p>
                  </div>
                )
              ) : (
                <div className="p-6">
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-800 mb-1">SQL Error</h4>
                        <p className="text-red-700 font-mono text-sm">{results.error}</p>
                        {results.details && (
                          <pre className="text-red-600 text-xs mt-3 overflow-auto bg-red-100 p-3 rounded">
                            {results.details}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Query History */}
        {queryHistory.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg border border-indigo-200 p-4">
            <h4 className="text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Query History (Use ↑/↓ arrows in editor)
            </h4>
            <div className="flex flex-wrap gap-2">
              {queryHistory.slice(0, 10).map((histQuery, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(histQuery);
                    setHistoryIndex(-1);
                    setActiveTab('query');
                  }}
                  className="px-3 py-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 hover:border-indigo-300 truncate max-w-xs transition-colors"
                  title={histQuery}
                >
                  {histQuery.substring(0, 50)}...
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
