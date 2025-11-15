import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function CustomerReviews() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    rating: '',
    isVerified: '',
    search: ''
  });

  useEffect(() => {
    loadReviews();
    loadStats();
    
    // Listen for database updates from SQL Terminal
    const handleDatabaseUpdate = () => {
      loadReviews();
      loadStats();
    };
    window.addEventListener('databaseUpdated', handleDatabaseUpdate);
    
    return () => {
      window.removeEventListener('databaseUpdated', handleDatabaseUpdate);
    };
  }, [filters]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.isVerified) params.append('isVerified', filters.isVerified);
      if (filters.search) params.append('search', filters.search);

      const response = await api.getReviews();
      setReviews(response.data?.data?.reviews || response.data?.reviews || response.reviews || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.getReviewStats();
      setStats(response);
    } catch (error) {
      console.error('Error loading review stats:', error);
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.deleteReview(id);
        toast.success('Review deleted successfully');
        loadReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error('Failed to delete review');
      }
    }
  };

  const handleToggleVerification = async (id, isVerified) => {
    try {
      await api.updateReview(id, { isVerified: !isVerified });
      toast.success(`Review ${!isVerified ? 'verified' : 'unverified'} successfully`);
      loadReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Prepare data for charts
  const ratingDistributionData = stats?.ratingDistribution?.map(rating => ({
    rating: `${rating.rating} Star${rating.rating > 1 ? 's' : ''}`,
    count: rating.count
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
          <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-gray-600">Manage and analyze customer feedback</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalReviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.verifiedReviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageRating} ⭐</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verification Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalReviews > 0 ? Math.round((stats.verifiedReviews / stats.totalReviews) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Rating Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
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

        {/* Recent Reviews */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {stats?.recentReviews?.map((review, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{review.Customer?.name || 'Anonymous'}</span>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{review.comment?.substring(0, 100)}...</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({...filters, rating: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
            <select
              value={filters.isVerified}
              onChange={(e) => setFilters({...filters, isVerified: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Reviews</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search comments..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Reviews ({reviews.length})</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {reviews.map((review) => (
            <div key={review.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {review.Customer?.name || 'Anonymous Customer'}
                      </h4>
                      <p className="text-sm text-gray-500">{review.Customer?.email}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">({review.rating}/5)</span>
                    </div>
                    {review.isVerified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    {review.foodRating && (
                      <div>
                        <span className="font-medium">Food:</span> {renderStars(review.foodRating)} ({review.foodRating}/5)
                      </div>
                    )}
                    {review.serviceRating && (
                      <div>
                        <span className="font-medium">Service:</span> {renderStars(review.serviceRating)} ({review.serviceRating}/5)
                      </div>
                    )}
                    {review.ambianceRating && (
                      <div>
                        <span className="font-medium">Ambiance:</span> {renderStars(review.ambianceRating)} ({review.ambianceRating}/5)
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Order #{review.Order?.id}</span>
                    <span>•</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    {review.Order && (
                      <>
                        <span>•</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.Order.status)}`}>
                          {review.Order.status}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleToggleVerification(review.id, review.isVerified)}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      review.isVerified
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {review.isVerified ? 'Unverify' : 'Verify'}
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
