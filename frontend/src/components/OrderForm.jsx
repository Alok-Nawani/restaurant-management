import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import toast from 'react-hot-toast';

export default function OrderForm({ onClose }) {
  const [menu, setMenu] = useState([]);
  const [items, setItems] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Customer creation fields
  const [customerOption, setCustomerOption] = useState('existing'); // 'existing' or 'new'
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [menuData, customersData] = await Promise.all([
        api.getMenu(),
        api.getCustomers()
      ]);
      setMenu(menuData.items || menuData || []);
      setCustomers(customersData.customers || customersData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load menu and customers');
      setMenu([]);
      setCustomers([]);
    }
  };

  const addItem = (menuId) => {
    const existingItem = items.find(item => item.menuItemId === menuId);
    if (existingItem) {
      updateQty(items.findIndex(item => item.menuItemId === menuId), existingItem.qty + 1);
    } else {
      setItems([...items, { menuItemId: menuId, qty: 1 }]);
    }
  };

  const updateQty = (idx, qty) => {
    if (qty <= 0) {
      removeItem(idx);
      return;
    }
    const copy = [...items];
    copy[idx].qty = qty;
    setItems(copy);
  };

  const removeItem = (idx) => {
    const copy = [...items];
    copy.splice(idx, 1);
    setItems(copy);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const menuItem = menu.find(m => m.id === item.menuItemId);
      return total + (menuItem ? menuItem.price * item.qty : 0);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!tableNumber.trim()) {
      toast.error('Please enter a table number');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    if (customerOption === 'new') {
      if (!newCustomer.name.trim()) {
        toast.error('Please enter customer name');
        return;
      }
      if (!newCustomer.phone.trim()) {
        toast.error('Please enter customer phone number');
        return;
      }
    }

    try {
      setLoading(true);
      
      let finalCustomerId = customerId;
      
      // Create new customer if needed
      if (customerOption === 'new') {
        const createdCustomer = await api.createCustomer({
          name: newCustomer.name.trim(),
          phone: newCustomer.phone.trim(),
          email: newCustomer.email.trim() || null
        });
        finalCustomerId = createdCustomer.id;
        toast.success('Customer created successfully!');
      }
      
      // Create order
      await api.createOrder({
        tableNumber: tableNumber.trim(),
        customerId: finalCustomerId || null,
        items
      });
      toast.success('Order created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Create New Order</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Number *
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Table 5, A1, etc."
              />
            </div>
          </div>

          {/* Customer Selection */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h4>
            
            {/* Customer Option Toggle */}
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="customerOption"
                  value="existing"
                  checked={customerOption === 'existing'}
                  onChange={(e) => setCustomerOption(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Select Existing Customer</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="customerOption"
                  value="new"
                  checked={customerOption === 'new'}
                  onChange={(e) => setCustomerOption(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Create New Customer</span>
              </label>
            </div>

            {/* Existing Customer Selection */}
            {customerOption === 'existing' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Customer
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose from existing customers</option>
                  {customers && customers.length > 0 && customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Leave empty for walk-in customer</p>
              </div>
            )}

            {/* New Customer Form */}
            {customerOption === 'new' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Menu Items</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menu && menu.length > 0 ? menu.map(item => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-gray-900">{item.name}</h5>
                    <span className="text-sm font-semibold text-green-600">₹{item.price}</span>
                  </div>
                  {item.category && (
                    <p className="text-sm text-gray-500 mb-3">{item.category}</p>
                  )}
                  <button
                    onClick={() => addItem(item.id)}
                    className="w-full btn-primary text-sm"
                  >
                    Add to Order
                  </button>
                </div>
              )) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No menu items available
                </div>
              )}
            </div>
          </div>

          {/* Selected Items */}
          {items.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Selected Items</h4>
              <div className="space-y-3">
                {items.map((item, idx) => {
                  const menuItem = menu.find(m => m.id === item.menuItemId);
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{menuItem?.name}</h5>
                        <p className="text-sm text-gray-500">₹{menuItem?.price} each</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQty(idx, item.qty - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(idx, item.qty + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(idx)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Summary */}
          {items.length > 0 && (
            <div className="mb-6 pt-4 border-t border-gray-300">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span>₹{calculateTotal()}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || items.length === 0 || !tableNumber.trim()}
              className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}