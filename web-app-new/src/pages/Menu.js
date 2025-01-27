import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import CartIcon from '../components/CartIcon';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDietary, setSelectedDietary] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState({});
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
  }, [selectedCategory, selectedDietary]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await api.menu.getAll({ category: selectedCategory, dietary: selectedDietary });
      setMenuItems(response.data);
      // Initialize quantities
      const initialQuantities = {};
      response.data.forEach(item => {
        initialQuantities[item.id] = 1;
      });
      setQuantities(initialQuantities);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch menu items. Please try again.');
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId, value) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, parseInt(value) || 1)
    }));
  };

  const handleAddToCart = async (item) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await addToCart(item.id, quantities[item.id]);
      alert('Item added to cart successfully!');
      // Reset quantity after adding to cart
      setQuantities(prev => ({
        ...prev,
        [item.id]: 1
      }));
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.error || 'Failed to add item to cart. Please try again.');
    }
  };

  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Our Menu</h1>
        <CartIcon />
      </div>

      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2"
          >
            <option value="all">All Categories</option>
            <option value="appetizers">Appetizers</option>
            <option value="main">Main Course</option>
            <option value="desserts">Desserts</option>
            <option value="beverages">Beverages</option>
          </select>

          <select
            value={selectedDietary}
            onChange={(e) => setSelectedDietary(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2"
          >
            <option value="all">All Dietary</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="gluten-free">Gluten-Free</option>
          </select>
        </div>

        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 border border-gray-300 rounded px-4 py-2 pr-10"
          />
          <svg
            className="absolute right-3 top-3 h-5 w-5 text-gray-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMenuItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{item.name}</h2>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">{formatCurrency(item.price)}</span>
                    <div className="flex items-center gap-2">
                      <label htmlFor={`quantity-${item.id}`} className="sr-only">Quantity</label>
                      <input
                        id={`quantity-${item.id}`}
                        type="number"
                        min="1"
                        value={quantities[item.id]}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        className="w-16 border border-gray-300 rounded px-2 py-1"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu; 