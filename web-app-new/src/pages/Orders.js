import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../services/api';

const Orders = () => {
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

  const cancelOrder = async (orderId) => {
    try {
      await api.orders.cancel(orderId);
      fetchOrders();
    } catch (error) {
      setError('Failed to cancel order. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Orders</h1>
      {loading ? (
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center">No orders found.</div>
      ) : (
        <ul className="space-y-8">
          {orders.map((order) => (
            <li key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Order #{order.id}</h2>
                <span className={`px-2 py-1 rounded text-white ${
                  order.status === 'pending'
                    ? 'bg-yellow-500'
                    : order.status === 'preparing'
                    ? 'bg-blue-500'
                    : order.status === 'ready'
                    ? 'bg-green-500'
                    : order.status === 'delivered'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4">Ordered on: {format(new Date(order.createdAt), 'MMMM d, yyyy')}</p>
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">Items:</h3>
                <ul className="list-disc list-inside">
                  {order.items.map((item) => (
                    <li key={item.id} className="text-gray-600">
                      {item.quantity} x {item.menuItem.name} - ${item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xl font-bold">Total: ${order.totalAmount.toFixed(2)}</p>
                {order.status === 'pending' && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Orders; 