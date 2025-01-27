import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.orders.getMyOrders();
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch orders. Please try again.');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await api.orders.updateStatus(orderId, 'cancelled');
      fetchOrders();
      alert('Order cancelled successfully');
    } catch (error) {
      alert('Failed to cancel order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      {orders.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600">No orders found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">Order #{order.id}</h2>
                  <p className="text-gray-600">
                    {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Items:</h3>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <div>
                          <span className="font-medium">
                            {item.menuItem?.name || 'Unknown Item'}
                          </span>
                          <span className="text-gray-600"> × {item.quantity}</span>
                        </div>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>

                {order.orderType === 'delivery' && order.deliveryAddress && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Delivery Address:</h3>
                    <p className="text-gray-600">{order.deliveryAddress}</p>
                  </div>
                )}

                {order.specialRequests && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Special Requests:</h3>
                    <p className="text-gray-600">{order.specialRequests}</p>
                  </div>
                )}

                {order.status === 'pending' && (
                  <div className="border-t pt-4">
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory; 