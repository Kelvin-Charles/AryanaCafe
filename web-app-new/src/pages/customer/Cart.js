import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

const Cart = () => {
  const [orderType, setOrderType] = useState('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const navigate = useNavigate();
  
  const { 
    cartItems, 
    loading, 
    cartTotal,
    updateQuantity: updateCartQuantity,
    removeItem: removeCartItem,
    clearCart
  } = useCart();

  const handleQuantityChange = async (itemId, quantity) => {
    try {
      await updateCartQuantity(itemId, quantity);
    } catch (error) {
      alert('Failed to update quantity. Please try again.');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeCartItem(itemId);
    } catch (error) {
      alert('Failed to remove item. Please try again.');
    }
  };

  const handleCheckout = async () => {
    try {
      // Validate order details
      if (orderType === 'dine-in' && !tableNumber) {
        alert('Please enter a table number');
        return;
      }
      if (orderType === 'delivery' && !deliveryAddress) {
        alert('Please enter a delivery address');
        return;
      }

      const orderData = {
        items: cartItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions
        })),
        orderType,
        tableNumber: orderType === 'dine-in' ? parseInt(tableNumber) : null,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
        specialRequests
      };

      await api.orders.create(orderData);
      await clearCart();
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      alert('Failed to place order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600">Your cart is empty</p>
          <button
            onClick={() => navigate('/menu')}
            className="mt-4 bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-gray-600">{formatCurrency(item.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                        className="w-16 border rounded px-2 py-1"
                      />
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Order Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Type
                  </label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="dine-in">Dine In</option>
                    <option value="takeaway">Takeaway</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                {orderType === 'dine-in' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Table Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                )}

                {orderType === 'delivery' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      rows="3"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    rows="3"
                    placeholder="Any special instructions?"
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full mt-4 bg-primary text-white px-6 py-3 rounded hover:bg-primary-dark"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 