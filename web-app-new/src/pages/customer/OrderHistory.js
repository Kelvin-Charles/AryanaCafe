import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../services/api';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.orders.getMyOrders();
      console.log('Orders response:', response.data); // Debug log
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        console.error('Orders data is not an array:', response.data);
        setError('Invalid orders data received');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.error || 'Failed to fetch orders. Please try again.');
    } finally {
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Order ID</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-2">{order.orderId}</td>
                  <td className="px-4 py-2">
                    {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-2 capitalize">{order.orderType}</td>
                  <td className="px-4 py-2 text-right">
                    TSh {Number(order.totalAmount).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded text-sm text-center ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                    >
                      Details
                    </button>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-600">Order ID</p>
                <p className="font-medium">{selectedOrder.orderId}</p>
              </div>
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-medium">
                  {format(new Date(selectedOrder.createdAt), 'MMMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <span className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-gray-600">Order Type</p>
                <p className="font-medium capitalize">{selectedOrder.orderType}</p>
              </div>
            </div>

            {selectedOrder.orderType === 'delivery' && selectedOrder.deliveryAddress && (
              <div className="mb-6">
                <p className="text-gray-600">Delivery Address</p>
                <p className="font-medium">{selectedOrder.deliveryAddress}</p>
              </div>
            )}

            {selectedOrder.orderType === 'dine-in' && selectedOrder.tableNumber && (
              <div className="mb-6">
                <p className="text-gray-600">Table Number</p>
                <p className="font-medium">{selectedOrder.tableNumber}</p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-bold mb-2">Order Items</h3>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-center">Quantity</th>
                    <th className="px-4 py-2 text-right">Price</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">
                        <div>{item.menuItem?.name || 'Unknown Item'}</div>
                        {item.specialInstructions && (
                          <div className="text-sm text-gray-500">Note: {item.specialInstructions}</div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">TSh {Number(item.price).toLocaleString()}</td>
                      <td className="px-4 py-2 text-right">TSh {Number(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="border-t bg-gray-50 font-bold">
                    <td colSpan="3" className="px-4 py-2 text-right">Total:</td>
                    <td className="px-4 py-2 text-right">TSh {Number(selectedOrder.totalAmount).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {selectedOrder.specialRequests && (
              <div>
                <p className="text-gray-600">Special Requests</p>
                <p className="font-medium">{selectedOrder.specialRequests}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory; 