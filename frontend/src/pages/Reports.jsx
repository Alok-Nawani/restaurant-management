import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({
    orders: null,
    revenue: null,
    staff: null,
    inventory: null,
    customers: null,
    reviews: null
  });
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Get all orders without pagination limit
      const [ordersData, staffData, inventoryData, customersData, reviewsData] = await Promise.all([
        api.getOrders({ limit: 1000 }),
        api.getStaffStats(),
        api.getInventoryStats(),
        api.getCustomers(),
        api.getReviewStats()
      ]);

      const orders = ordersData.orders || ordersData || [];
      
      // Calculate revenue from orders
      const revenue = orders.reduce((total, order) => {
        return total + (order.total || 0);
      }, 0);

      // Calculate orders by status
      const ordersByStatus = orders.reduce((acc, order) => {
        const status = (order.status || 'PENDING').toUpperCase();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Calculate orders by day (last 7 days)
      const ordersByDay = orders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Calculate top menu items - handle both OrderItems array and nested structure
      const menuItemCounts = {};
      orders.forEach(order => {
        const orderItems = order.OrderItems || order.orderItems || [];
        orderItems.forEach(item => {
          const menuItem = item.MenuItem || item.menuItem || {};
          const menuItemName = menuItem.name || item.name || 'Unknown';
          const quantity = item.quantity || item.qty || 1;
          menuItemCounts[menuItemName] = (menuItemCounts[menuItemName] || 0) + quantity;
        });
      });

      const topMenuItems = Object.entries(menuItemCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

      // Calculate customer statistics
      const totalCustomers = customersData.customers?.length || customersData.data?.customers?.length || 0;
      const customersArray = customersData.customers || customersData.data?.customers || [];
      const newCustomers = customersArray.filter(customer => {
        const customerDate = new Date(customer.createdAt);
        const startDate = new Date(dateRange.start);
        return customerDate >= startDate;
      }).length || 0;

      setReports({
        orders: {
          total: orders.length,
          byStatus: ordersByStatus,
          byDay: ordersByDay,
          topItems: topMenuItems
        },
        revenue: {
          total: revenue,
          average: orders.length > 0 ? revenue / orders.length : 0
        },
        staff: staffData,
        inventory: inventoryData,
        customers: {
          total: totalCustomers,
          new: newCustomers
        },
        reviews: reviewsData?.data || reviewsData
      });
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Prepare chart data
  const statusChartData = reports.orders?.byStatus && Object.keys(reports.orders.byStatus).length > 0 
    ? Object.entries(reports.orders.byStatus).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
        count: count
      }))
    : [
        { status: 'Pending', count: 0 },
        { status: 'Confirmed', count: 0 },
        { status: 'Preparing', count: 0 },
        { status: 'Ready', count: 0 },
        { status: 'Delivered', count: 0 },
        { status: 'Paid', count: 0 }
      ];

  const topMenuItemsChartData = reports.orders?.topItems && reports.orders.topItems.length > 0
    ? reports.orders.topItems.map(([name, count]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        count: parseInt(count) || 0
      }))
    : [];

  // Debug logging
  console.log('Reports data:', {
    ordersByStatus: reports.orders?.byStatus,
    topMenuItems: reports.orders?.topItems,
    statusChartData,
    topMenuItemsChartData
  });

  const roleChartData = reports.staff?.roleStats?.map(role => ({
    name: role.role.charAt(0).toUpperCase() + role.role.slice(1).replace('_', ' '),
    value: parseInt(role.count) || 0
  })) || [];

  const categoryChartData = reports.inventory?.categoryStats?.map(category => ({
    name: category.category.charAt(0).toUpperCase() + category.category.slice(1).replace('_', ' '),
    value: parseInt(category.count) || 0
  })) || [];

  const topItemsChartData = reports.orders?.topItems?.slice(0, 5).map(([item, count]) => ({
    name: item.length > 15 ? item.substring(0, 15) + '...' : item,
    count: parseInt(count) || 0
  })) || [];

  const ratingDistributionData = reports.reviews?.ratingDistribution?.map(rating => ({
    rating: `${rating.rating} Star${rating.rating > 1 ? 's' : ''}`,
    count: parseInt(rating.count) || 0
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your restaurant operations</p>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
    <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={loadReports}
            className="btn-primary px-4 py-2"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{reports.orders?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(reports.revenue?.total || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-semibold text-gray-900">{reports.staff?.totalStaff || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inventory Items</p>
              <p className="text-2xl font-semibold text-gray-900">{reports.inventory?.totalItems || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Orders by Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
          {statusChartData.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>No orders data available</p>
            </div>
          )}
        </div>

        {/* Staff Role Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Role Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {roleChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Menu Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Menu Items</h3>
          {topMenuItemsChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMenuItemsChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>No order data available</p>
            </div>
          )}
        </div>

        {/* Inventory Categories */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Feedback & Reviews</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feedback Summary */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Feedback Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Feedback</span>
                <span className="font-semibold">{reports.reviews?.totalReviews || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Average Rating</span>
                <span className="font-semibold text-yellow-600">
                  {reports.reviews?.averageRating || '0.00'} ⭐
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Verified Reviews</span>
                <span className="font-semibold text-green-600">
                  {reports.reviews?.verifiedReviews || 0}
                </span>
              </div>
            </div>
          </div>
          
          {/* Recent Feedback */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Recent Feedback</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {reports.reviews?.recentReviews && reports.reviews.recentReviews.length > 0 ? (
                reports.reviews.recentReviews.map((review, index) => (
                  <div key={index} className="p-3 border-l-4 border-blue-500 bg-gray-50 rounded">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">
                        {review.Customer?.name || review.customer?.name || 'Anonymous'}
                      </span>
                      <span className="text-yellow-500 text-xs">
                        {'⭐'.repeat(review.rating || 0)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                      {review.comment || 'No comment provided'}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No feedback yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {reports.reviews && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Rating Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Rating Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Review Statistics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Reviews</span>
                <span className="font-semibold">{reports.reviews.totalReviews || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Verified Reviews</span>
                <span className="font-semibold text-green-600">{reports.reviews.verifiedReviews || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Rating</span>
                <span className="font-semibold text-yellow-600">{reports.reviews.averageRating || 0} ⭐</span>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Reviews</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {reports.reviews.recentReviews?.map((review, index) => (
                    <div key={index} className="text-sm border-l-2 border-blue-200 pl-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{review.Customer?.name || 'Anonymous'}</span>
                        <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                      </div>
                      <p className="text-gray-600 text-xs mt-1">{review.comment?.substring(0, 50)}...</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orders by Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {Object.entries(reports.orders?.byStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Staff</span>
              <span className="font-semibold">{reports.staff?.totalStaff || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Staff</span>
              <span className="font-semibold text-green-600">{reports.staff?.activeStaff || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Experience</span>
              <span className="font-semibold">{reports.staff?.experienceStats?.avgExperience ? Math.round(reports.staff.experienceStats.avgExperience) : 0} years</span>
            </div>
          </div>
        </div>

        {/* Inventory Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Items</span>
              <span className="font-semibold">{reports.inventory?.totalItems || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Low Stock Items</span>
              <span className="font-semibold text-red-600">{reports.inventory?.lowStockCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Value</span>
              <span className="font-semibold">{formatCurrency(reports.inventory?.totalValue || 0)}</span>
            </div>
          </div>
        </div>

        {/* Customer Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Customers</span>
              <span className="font-semibold">{reports.customers?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Customers</span>
              <span className="font-semibold text-green-600">{reports.customers?.new || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Order Value</span>
              <span className="font-semibold">{formatCurrency(reports.revenue?.average || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}