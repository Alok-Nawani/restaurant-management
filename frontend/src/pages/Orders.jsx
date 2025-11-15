import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';
import OrderForm from '../components/OrderForm';
import toast from 'react-hot-toast';

// Icons
const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const TableIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders({ status: statusFilter });
      setOrders(data.orders || data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setLoading(false);
    }
    
    // Listen for database updates from SQL Terminal
    const handleDatabaseUpdate = () => {
      loadOrders();
    };
    window.addEventListener('databaseUpdated', handleDatabaseUpdate);
    
    return () => {
      window.removeEventListener('databaseUpdated', handleDatabaseUpdate);
    };
  }, [statusFilter, user]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-orange-100 text-orange-800',
      READY: 'bg-green-100 text-green-800',
      DELIVERED: 'bg-purple-100 text-purple-800',
      PAID: 'bg-emerald-100 text-emerald-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PREPARING',
      PREPARING: 'READY',
      READY: 'DELIVERED',
      DELIVERED: 'PAID'
    };
    return statusFlow[currentStatus];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Orders Management</h2>
          <p className="text-gray-600 mb-6">Please log in to manage orders</p>
          <a 
            href="/login" 
            className="btn-primary px-6 py-2 rounded-md"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">📋 Order Management</h1>
              <p className="text-green-100">{orders.length} orders in system</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-white hover:bg-green-50 text-green-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PlusIcon />
              New Order
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <ClockIcon />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <ClockIcon />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900">{orders.filter(o => o.status === 'PENDING').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl">
                <ClockIcon />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Preparing</p>
                <p className="text-3xl font-bold text-gray-900">{orders.filter(o => o.status === 'PREPARING').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckIcon />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{orders.filter(o => ['PAID', 'DELIVERED', 'completed'].includes(o.status)).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Filter by Status</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                statusFilter === '' 
                  ? 'bg-green-500 text-white transform scale-105' 
                  : 'bg-white text-gray-700 hover:bg-green-50 border border-green-200'
              }`}
            >
              All Orders
            </button>
            {['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'PAID', 'CANCELLED'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                  statusFilter === status 
                    ? 'bg-green-500 text-white transform scale-105' 
                    : 'bg-white text-gray-700 hover:bg-green-50 border border-green-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Order Workflow Guide */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            📋 Order Workflow Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-yellow-600 font-bold">1</span>
              </div>
              <p className="text-sm font-medium text-gray-700">PENDING</p>
              <p className="text-xs text-gray-500">New order received</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <p className="text-sm font-medium text-gray-700">CONFIRMED</p>
              <p className="text-xs text-gray-500">Order accepted</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-orange-600 font-bold">3</span>
              </div>
              <p className="text-sm font-medium text-gray-700">PREPARING</p>
              <p className="text-xs text-gray-500">Kitchen started</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 font-bold">4</span>
              </div>
              <p className="text-sm font-medium text-gray-700">READY</p>
              <p className="text-xs text-gray-500">Food ready</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 font-bold">5</span>
              </div>
              <p className="text-sm font-medium text-gray-700">DELIVERED</p>
              <p className="text-xs text-gray-500">Served to customer</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-emerald-600 font-bold">6</span>
              </div>
              <p className="text-sm font-medium text-gray-700">PAID</p>
              <p className="text-xs text-gray-500">Payment received</p>
            </div>
          </div>
          <p className="text-sm text-blue-700 mt-4 text-center">
            💡 <strong>Staff Control:</strong> Each step requires manual confirmation. Orders will NOT automatically progress.
          </p>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {statusFilter ? 'No orders with this status' : 'Create your first order to get started!'}
              </p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 group">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">Order #{order.id}</h3>
                      <p className="text-green-100 text-sm mt-1">
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Order Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <TableIcon />
                      <span className="text-sm">Table {order.tableNumber}</span>
                    </div>
                    {order.Customer && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <UserIcon />
                        <span className="text-sm">{order.Customer.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-gray-600">
                      <ClockIcon />
                      <span className="text-sm">Total: ₹{order.total}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.OrderItems && order.OrderItems.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Items:</h4>
                      <div className="space-y-2">
                        {order.OrderItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="text-sm font-medium text-gray-900">{item.MenuItem?.name}</span>
                              <span className="text-xs text-gray-500 ml-2">x{item.quantity}</span>
                            </div>
                            <span className="text-sm font-semibold text-green-600">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* Status Update Button */}
                    {getNextStatus(order.status) && order.status !== 'PAID' && order.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status))}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <CheckIcon />
                        Mark as {getNextStatus(order.status)}
                      </button>
                    )}
                    
                    {/* Cancel Button for Pending Orders */}
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <XIcon />
                        Cancel Order
                      </button>
                    )}
                    
                    {/* Completed Status Indicator */}
                    {order.status === 'PAID' && (
                      <div className="w-full bg-green-100 text-green-800 py-3 px-4 rounded-lg text-sm font-semibold text-center border border-green-200">
                        ✅ Order Completed & Paid
                      </div>
                    )}
                    
                    {/* Cancelled Status Indicator */}
                    {order.status === 'CANCELLED' && (
                      <div className="w-full bg-red-100 text-red-800 py-3 px-4 rounded-lg text-sm font-semibold text-center border border-red-200">
                        ❌ Order Cancelled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showForm && (
        <OrderForm 
          onClose={() => { 
            setShowForm(false); 
            loadOrders(); 
          }} 
        />
      )}
    </div>
  );
}