import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar(){
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <aside className="w-56 bg-gray-800 text-white p-4">
      <nav className="flex flex-col gap-3">
        <Link 
          to="/" 
          className={`py-2 px-3 rounded transition-colors ${
            isActive('/') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
          }`}
        >
          Dashboard
        </Link>
        <Link 
          to="/orders" 
          className={`py-2 px-3 rounded transition-colors ${
            isActive('/orders') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
          }`}
        >
          Orders
        </Link>
        <Link 
          to="/menu" 
          className={`py-2 px-3 rounded transition-colors ${
            isActive('/menu') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
          }`}
        >
          Menu
        </Link>
        <Link 
          to="/customers" 
          className={`py-2 px-3 rounded transition-colors ${
            isActive('/customers') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
          }`}
        >
          Customers
        </Link>
        <Link 
          to="/staff" 
          className={`py-2 px-3 rounded transition-colors ${
            isActive('/staff') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
          }`}
        >
          Staff
        </Link>
        <Link 
          to="/inventory" 
          className={`py-2 px-3 rounded transition-colors ${
            isActive('/inventory') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
          }`}
        >
          Inventory
        </Link>
        <Link 
          to="/reviews" 
          className={`py-2 px-3 rounded transition-colors ${
            isActive('/reviews') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
          }`}
        >
          Reviews
        </Link>
        <Link 
          to="/sql" 
          className={`py-2 px-3 rounded transition-colors ${
            isActive('/sql') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
          }`}
        >
          SQL Terminal
        </Link>
        <Link 
          to="/reports" 
          className={`py-2 px-3 rounded transition-colors ${
            isActive('/reports') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
          }`}
        >
          Reports
        </Link>
      </nav>
    </aside>
  )
}