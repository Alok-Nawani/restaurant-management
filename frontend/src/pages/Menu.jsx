import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { fetchJSON, api } from '../api/api';

// Helper function to get category-specific food images
const getFoodImage = (name, category) => {
  // Specific item images (check these first)
  const itemSpecificImages = {
    'Fish Fingers': '286eCwJoC6s', // Fish fingers - bowl of food with peas
    'Aloo Tikki': 'zJyPd4-DmRk', // Aloo tikki - burger with fries
  };
  
  // Check if this specific item has an image
  if (itemSpecificImages[name]) {
    return `https://images.unsplash.com/photo-${itemSpecificImages[name]}?w=400&h=300&fit=crop&q=80`;
  }
  
  // Check for chicken dishes (can be in Appetizer or Curry category)
  const isChickenDish = name.toLowerCase().includes('chicken');
  if (isChickenDish) {
    return `https://images.unsplash.com/photo-LxvWDcPfPB4?w=400&h=300&fit=crop&q=80`;
  }
  
  // Category-specific image IDs from Unsplash (without photo- prefix, will add in URL)
  const categoryImages = {
    'Pizza': [
      '1513104890138-7c749659a591', // Pizza
      '1565299624946-b28f40a0ae38',
      '1574071318508-1cdbab80d002'
    ],
    'Beverage': [
      'S7VRvq6sCvA' // Beverages - vodka with lemon in glass
    ],
    'Dessert': [
      'dLNu65g0jMA' // Desserts - baked pastry lot
    ],
    'Appetizer': [
      '1544025162-d76694265947', // Appetizers
      '1562967914-608f82629710',
      '1529042410759-befb120db08'
    ],
    'Curry': [
      'T_vb0zXgZEU' // Curries - tomato soup bowls
    ],
    'Rice': [
      'zXNC_lBBVGE' // Rice - rice with sesame in black bowl
    ],
    'Vegetable': [
      '1512621776951-a57141f2eefd', // Vegetables
      '1540420773420-3366772f4999',
      '1512621776951-a57141f2eefd'
    ],
    'Bread': [
      'VvJDbhvSmnI' // Bread - brown bread on brown woven basket
    ],
    'Snack': [
      'Tl0Qo1PSCX8' // Snacks - fried appetizers with dipping sauces
    ],
    'Side': [
      '1544025162-d76694265947', // Side dishes
      '1562967914-608f82629710',
      '1529042410759-befb120db08'
    ],
    'Dal': [
      'FEaRWfdpAZ4' // Dal - table with bowls of food (red lentil dahl)
    ]
  };
  
  // Get image from category-specific array
  const categoryImageIds = categoryImages[category] || categoryImages['Curry'];
  const imageId = categoryImageIds[Math.floor(Math.random() * categoryImageIds.length)];
  
  return `https://images.unsplash.com/photo-${imageId}?w=400&h=300&fit=crop&q=80`;
};

// Category icons
const CategoryIcon = ({ category }) => {
  const icons = {
    'Appetizer': '🍤',
    'Rice': '🍚',
    'Curry': '🍛',
    'Vegetable': '🥗',
    'Bread': '🍞',
    'Pizza': '🍕',
    'Beverage': '🥤',
    'Dessert': '🍰',
    'Snack': '🍿',
    'Side': '🥙',
    'Dal': '🥘'
  };
  return <span className="text-2xl">{icons[category] || '🍽️'}</span>;
};

export default function Menu() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('menuCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('menuCart', JSON.stringify(cart));
  }, [cart]);

  async function loadMenu() {
    try {
    const data = await fetchJSON('/menu');
      setItems(data.items || data || []);
    } catch (error) {
      console.error('Error loading menu:', error);
      toast.error('Failed to load menu items');
      setItems([]);
    }
  }

  async function loadCustomers() {
    try {
      const data = await api.getCustomers();
      setCustomers(Array.isArray(data) ? data : (data.customers || []));
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  }

  useEffect(() => {
    loadMenu();
    loadCustomers();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(items.map(item => item.category).filter(Boolean))];
    return cats;
  }, [items]);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items;
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

  // Group items by category for display
  const groupedItems = useMemo(() => {
    if (selectedCategory !== 'All') {
      return { [selectedCategory]: filteredItems };
    }
    const grouped = {};
    items.forEach(item => {
      const cat = item.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });
    return grouped;
  }, [items, selectedCategory, filteredItems]);

  // Cart functions
  const addToCart = (item) => {
    if (!item.available) {
      toast.error('This item is currently unavailable');
      return;
    }
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success(`${item.name} added to cart`);
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
    toast.success('Item removed from cart');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!tableNumber.trim()) {
      toast.error('Please enter a table number');
      return;
    }

    try {
      const orderItems = cart.map(item => ({
        menuItemId: item.id,
        qty: item.quantity
      }));

      await api.createOrder({
        tableNumber: tableNumber.trim(),
        customerId: customerId || null,
        items: orderItems
      });

      toast.success('Order placed successfully!');
      setCart([]);
      setShowCheckout(false);
      setShowCart(false);
      setTableNumber('');
      setCustomerId('');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Failed to place order');
    }
  };

  const onSubmit = async (data) => {
    try {
      await fetchJSON('/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      toast.success('Menu item added');
      setShowForm(false);
      reset();
      loadMenu();
    } catch (err) {
      toast.error('Failed to add menu item');
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Menu</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCart(true)}
            className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Cart
            {getCartItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {getCartItemCount()}
              </span>
            )}
          </button>
        <button
          onClick={() => setShowForm(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Add Item
        </button>
      </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items by Category */}
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <div key={category} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CategoryIcon category={category} />
            <h3 className="text-xl font-bold text-gray-800">{category}</h3>
            <span className="text-sm text-gray-500">({categoryItems.length} items)</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryItems.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                {/* Food Image */}
                <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
                  <img
                    src={getFoodImage(item.name, item.category)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to gradient with category emoji
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement;
                      if (!fallback.querySelector('.fallback-content')) {
                        const categoryEmojis = {
                          'Pizza': '🍕',
                          'Beverage': '🥤',
                          'Dessert': '🍰',
                          'Appetizer': '🍤',
                          'Curry': '🍛',
                          'Rice': '🍚',
                          'Vegetable': '🥗',
                          'Bread': '🍞',
                          'Snack': '🍿',
                          'Side': '🥙',
                          'Dal': '🥘'
                        };
                        const emoji = categoryEmojis[item.category] || '🍽️';
                        fallback.innerHTML = `
                          <div class="fallback-content w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-orange-100 to-red-100">
                            ${emoji}
                          </div>
                        `;
                      }
                    }}
                  />
                  {/* Veg/Non-Veg Indicator */}
                  {(() => {
                    const nameLower = item.name.toLowerCase();
                    // Auto-detect non-veg items based on keywords
                    const isNonVeg = nameLower.includes('chicken') || 
                                     nameLower.includes('mutton') || 
                                     nameLower.includes('fish') || 
                                     nameLower.includes('prawn') || 
                                     nameLower.includes('egg') ||
                                     nameLower.includes('meat') ||
                                     nameLower.includes('seekh') ||
                                     (nameLower.includes('kebab') && !nameLower.includes('hara'));
                    const isVegetarian = !isNonVeg && (item.isVeg !== false);
                    
                    return (
                      <div className="absolute top-3 right-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                            isVegetarian
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                        >
                          <span className="text-white text-xs font-bold">
                            {isVegetarian ? 'V' : 'NV'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                  {/* Availability Badge */}
                  {!item.available && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Unavailable
                      </span>
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-bold text-lg text-gray-800 flex-1">{item.name}</h4>
                    {/* Veg/Non-Veg Label - Auto-detect based on name if isVeg is not set correctly */}
                    {(() => {
                      const nameLower = item.name.toLowerCase();
                      // Auto-detect non-veg items based on keywords
                      const isNonVeg = nameLower.includes('chicken') || 
                                       nameLower.includes('mutton') || 
                                       nameLower.includes('fish') || 
                                       nameLower.includes('prawn') || 
                                       nameLower.includes('egg') ||
                                       nameLower.includes('meat') ||
                                       nameLower.includes('seekh') ||
                                       nameLower.includes('kebab') && !nameLower.includes('hara');
                      const isVegetarian = !isNonVeg && (item.isVeg !== false);
                      
                      return (
                        <span
                          className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                            isVegetarian
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {isVegetarian ? 'VEG' : 'NON-VEG'}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-blue-600">₹{item.price}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                item.available 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                {item.available ? 'Available' : 'Unavailable'}
              </span>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    disabled={!item.available}
                    className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                      item.available
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {item.available ? 'Add to Cart' : 'Unavailable'}
                  </button>
            </div>
          </div>
        ))}
      </div>
        </div>
      ))}

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items found in this category.</p>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
          <div className="bg-white h-full w-full max-w-md shadow-2xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Shopping Cart</h3>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
      </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-gray-600">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{item.price * item.quantity}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">₹{getCartTotal()}</span>
                </div>
                <button
                  onClick={() => {
                    setShowCheckout(true);
                    setShowCart(false);
                  }}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Checkout</h3>
              <button
                onClick={() => {
                  setShowCheckout(false);
                  setShowCart(true);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Table Number *</label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., T-01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer (Optional)</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.email ? `(${customer.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span>Total Items:</span>
                <span className="font-semibold">{getCartItemCount()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-xl font-bold text-blue-600">₹{getCartTotal()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCheckout(false);
                  setShowCart(true);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Cart
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add Menu Item</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  {...register('name', { required: true })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Butter Chicken"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  {...register('description')}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Brief description of the dish"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium mb-1">Price *</label>
                <input
                  type="number"
                    step="0.01"
                    {...register('price', { required: true, min: 0 })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    {...register('category')}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('isVeg')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Vegetarian</span>
                </label>
                <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    defaultChecked
                    {...register('available')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Available</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
