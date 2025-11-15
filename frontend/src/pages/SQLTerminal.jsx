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
  const textareaRef = useRef(null);

  useEffect(() => {
    loadTables();
    // Load last query from localStorage
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
        // Add to history
        if (!queryHistory.includes(query.trim())) {
          setQueryHistory(prev => [query.trim(), ...prev].slice(0, 20));
        }
        // Save to localStorage
        localStorage.setItem('sqlTerminalLastQuery', query.trim());
        toast.success(response.message || 'Query executed successfully');
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
    // Ctrl/Cmd + Enter to execute
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeQuery();
    }
    // Arrow up/down for history
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

  const quickQueries = [
    { label: 'All Menu Items', query: 'SELECT * FROM MenuItems LIMIT 20;' },
    { label: 'All Orders', query: 'SELECT * FROM Orders ORDER BY createdAt DESC LIMIT 10;' },
    { label: 'All Customers', query: 'SELECT * FROM Customers LIMIT 20;' },
    { label: 'Order Items with Menu', query: 'SELECT oi.*, m.name as menuItemName, m.price FROM OrderItems oi JOIN MenuItems m ON oi.menuItemId = m.id LIMIT 20;' },
    { label: 'Orders with Customer', query: 'SELECT o.*, c.name as customerName FROM Orders o LEFT JOIN Customers c ON o.customerId = c.id ORDER BY o.createdAt DESC LIMIT 10;' },
    { label: 'Total Revenue', query: 'SELECT SUM(total) as totalRevenue FROM Orders WHERE status = "PAID";' },
    { label: 'Top Menu Items', query: 'SELECT m.name, SUM(oi.quantity) as totalQuantity FROM OrderItems oi JOIN MenuItems m ON oi.menuItemId = m.id GROUP BY m.id ORDER BY totalQuantity DESC LIMIT 10;' },
  ];

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold">SQL Terminal</h2>
          <p className="text-gray-600 text-sm">Execute SQL queries on your database</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedTable}
            onChange={(e) => {
              setSelectedTable(e.target.value);
              if (e.target.value) {
                loadTableSchema(e.target.value);
              }
            }}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Table...</option>
            {tables.map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
          <button
            onClick={loadTables}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh Tables
          </button>
        </div>
      </div>

      {/* Quick Query Buttons */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Quick Queries:</p>
        <div className="flex flex-wrap gap-2">
          {quickQueries.map((quick, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(quick.query);
                setHistoryIndex(-1);
              }}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {quick.label}
            </button>
          ))}
        </div>
      </div>

      {/* SQL Editor */}
      <div className="flex-1 flex flex-col mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">SQL Query</label>
          <div className="text-xs text-gray-500">
            Press <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl/Cmd + Enter</kbd> to execute
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
          className="flex-1 w-full p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Enter your SQL query here..."
          spellCheck={false}
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={executeQuery}
            disabled={loading || !query.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Executing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Execute Query
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="flex-1 flex flex-col border rounded-lg bg-white">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">
                {results.success ? 'Query Results' : 'Error'}
              </h3>
              {results.success && (
                <span className="text-sm text-gray-600">
                  {results.rowCount} row(s) returned
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            {results.success ? (
              results.data && results.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {results.columns.map((col, idx) => (
                          <th
                            key={idx}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.data.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-gray-50">
                          {results.columns.map((col, colIdx) => (
                            <td
                              key={colIdx}
                              className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                            >
                              {row[col] !== null && row[col] !== undefined
                                ? String(row[col])
                                : <span className="text-gray-400">NULL</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Query executed successfully but returned no rows.
                </div>
              )
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-red-800">SQL Error</h4>
                    <p className="text-red-700 mt-1 font-mono text-sm">{results.error}</p>
                    {results.details && (
                      <pre className="text-red-600 text-xs mt-2 overflow-auto">
                        {results.details}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Query History */}
      {queryHistory.length > 0 && (
        <div className="mt-4 border rounded-lg bg-gray-50 p-4">
          <h4 className="text-sm font-semibold mb-2">Query History (Use ↑/↓ arrows in editor)</h4>
          <div className="flex flex-wrap gap-2">
            {queryHistory.slice(0, 5).map((histQuery, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(histQuery);
                  setHistoryIndex(-1);
                }}
                className="px-2 py-1 text-xs bg-white hover:bg-gray-200 rounded border truncate max-w-xs"
                title={histQuery}
              >
                {histQuery.substring(0, 50)}...
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

