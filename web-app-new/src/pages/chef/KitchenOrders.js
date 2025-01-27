import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/formatCurrency';

const KitchenOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('preparing'); // 'pending', 'preparing', 'ready'

  useEffect(() => {
    fetchOrders();
    // Set up polling for new orders
    const interval = setInterval(fetchOrders, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.orders.getActiveOrders();
      const filteredOrders = response.data.filter(order => 
        filter === 'all' ? true : order.status === filter
      );
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.orders.updateStatus(orderId, status);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleItemStatusUpdate = async (orderId, itemId, status) => {
    try {
      await api.orders.updateItemStatus(orderId, itemId, status);
      fetchOrders();
    } catch (error) {
      console.error('Error updating item status:', error);
      alert('Failed to update item status');
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Kitchen Orders</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${
              filter === 'pending' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('preparing')}
            className={`px-4 py-2 rounded ${
              filter === 'preparing' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            Preparing
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`px-4 py-2 rounded ${
              filter === 'ready' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            Ready
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">Order #{order.id}</h2>
                <p className="text-gray-600">
                  {format(new Date(order.createdAt), 'HH:mm')}
                </p>
                <p className="text-gray-600">
                  {order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1)}
                  {order.tableNumber && ` - Table ${order.tableNumber}`}
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
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{item.quantity}x {item.menuItem.name}</span>
                        {item.specialInstructions && (
                          <p className="text-sm text-gray-600">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <select
                        value={item.status}
                        onChange={(e) => handleItemStatusUpdate(order.id, item.id, e.target.value)}
                        className={`ml-2 px-2 py-1 rounded text-sm ${getStatusColor(item.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {order.specialRequests && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Special Requests:</h3>
                  <p className="text-gray-600">{order.specialRequests}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'preparing')}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'ready')}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Mark as Ready
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center text-gray-600">
          No {filter} orders found
        </div>
      )}
    </div>
  );
};

export default KitchenOrders; 