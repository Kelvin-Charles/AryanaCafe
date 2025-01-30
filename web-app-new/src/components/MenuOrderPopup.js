import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MenuOrderPopup = ({ isOpen, onClose, onOrderComplete }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [orderNote, setOrderNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchMenuItems();
    }
  }, [isOpen]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await api.menu.getAll();
      setMenuItems(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId, quantity) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: Math.max(0, quantity)
    }));
  };

  const calculateTotal = () => {
    return menuItems.reduce((total, item) => {
      const quantity = selectedItems[item.id] || 0;
      const price = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price) || 0;
      return total + (price * quantity);
    }, 0);
  };

  const handleSubmit = async () => {
    const orderItems = Object.entries(selectedItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => ({
        menuItemId: itemId,
        quantity
      }));

    if (orderItems.length === 0) {
      alert('Please select at least one item');
      return;
    }

    const orderData = {
      items: orderItems,
      note: orderNote,
      status: 'pending',
      orderType: 'dine-in'
    };

    try {
      const response = await api.orders.create(orderData);
      onOrderComplete(response.data.id);
      onClose();
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Failed to create order. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Add Food to Your Reservation</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">
              <p>{error}</p>
              <button
                onClick={fetchMenuItems}
                className="mt-4 text-primary hover:text-primary-dark"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <p className="text-gray-600">{item.description}</p>
                      <p className="text-primary font-medium">${typeof item.price === 'string' ? parseFloat(item.price).toFixed(2) : Number(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, (selectedItems[item.id] || 0) - 1)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-8 text-center">{selectedItems[item.id] || 0}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, (selectedItems[item.id] || 0) + 1)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Order Notes</label>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
                  rows="3"
                  placeholder="Any special instructions for your order?"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium">Total:</span>
            <span className="text-xl font-bold">${calculateTotal().toFixed(2)}</span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark"
              disabled={loading || Object.values(selectedItems).every(v => v === 0)}
            >
              Add to Reservation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuOrderPopup; 