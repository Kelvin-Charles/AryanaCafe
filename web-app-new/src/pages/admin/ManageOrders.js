import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import useApi from '../../hooks/useApi';
import { format } from 'date-fns';

const ManageOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { data, loading, error, execute: fetchOrders } = useApi(api.orders.getAll);
  const orders = data || [];
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdateError(null);
      await api.orders.updateStatus(id, newStatus);
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      setUpdateError(error.response?.data?.error || 'Failed to update order status');
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

  const calculateTotal = (items = []) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>

        {updateError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {updateError}
          </div>
        )}

        {/* Orders List */}
        <div className="bg-white p-6 rounded-lg shadow">
          {loading ? (
            <div>Loading orders...</div>
          ) : error ? (
            <div className="text-red-600">Error loading orders: {error}</div>
          ) : orders.length === 0 ? (
            <div className="text-gray-500">No orders found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Order ID</th>
                    <th className="px-4 py-2">Customer</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="border px-4 py-2">{order.orderId}</td>
                      <td className="border px-4 py-2">
                        <div>{order.customerName || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </td>
                      <td className="border px-4 py-2">
                        <span className="capitalize">{order.orderType}</span>
                      </td>
                      <td className="border px-4 py-2">
                        {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="border px-4 py-2">
                        TSh {order.totalAmount ? 
                          Number(order.totalAmount).toLocaleString() : 
                          calculateTotal(order.items).toLocaleString()}
                      </td>
                      <td className="border px-4 py-2">
                        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="border px-4 py-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="mr-2 p-1 border rounded"
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="font-medium">Order ID:</label>
                    <p className="text-lg">{selectedOrder.orderId}</p>
                  </div>
                  <div>
                    <label className="font-medium">Customer Information:</label>
                    <p>{selectedOrder.customerName}</p>
                    <p className="text-gray-600">{selectedOrder.customerEmail}</p>
                    {selectedOrder.customerPhone && (
                      <p className="text-gray-600">{selectedOrder.customerPhone}</p>
                    )}
                  </div>
                  <div>
                    <label className="font-medium">Order Type:</label>
                    <p className="capitalize">{selectedOrder.orderType}</p>
                  </div>
                  <div>
                    <label className="font-medium">Date:</label>
                    <p>{format(new Date(selectedOrder.createdAt), 'MMMM dd, yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <label className="font-medium">Status:</label>
                    <p className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium">Payment Status:</label>
                    <p className="capitalize">{selectedOrder.paymentStatus}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {selectedOrder.orderType === 'delivery' && (
                    <div>
                      <label className="font-medium">Delivery Address:</label>
                      <p className="whitespace-pre-wrap">{selectedOrder.deliveryAddress || 'Not provided'}</p>
                    </div>
                  )}
                  {selectedOrder.orderType === 'dine-in' && (
                    <div>
                      <label className="font-medium">Table Number:</label>
                      <p>Table {selectedOrder.tableNumber || 'Not assigned'}</p>
                    </div>
                  )}
                  <div>
                    <label className="font-medium">Special Instructions:</label>
                    <p className="whitespace-pre-wrap">{selectedOrder.specialRequests || 'None'}</p>
                  </div>
                  {selectedOrder.estimatedDeliveryTime && (
                    <div>
                      <label className="font-medium">Estimated Delivery Time:</label>
                      <p>{format(new Date(selectedOrder.estimatedDeliveryTime), 'HH:mm')}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <label className="font-medium">Order Items:</label>
                <div className="mt-2 border rounded-lg overflow-hidden">
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
                      {(selectedOrder.items || []).map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">
                            <div>{item.menuItem?.name || 'Unknown Item'}</div>
                            {item.specialInstructions && (
                              <div className="text-sm text-gray-500">Note: {item.specialInstructions}</div>
                            )}
                          </td>
                          <td className="px-4 py-2 text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">TSh {item.price.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right">TSh {(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="border-t bg-gray-50 font-bold">
                        <td colSpan="3" className="px-4 py-2 text-right">Total:</td>
                        <td className="px-4 py-2 text-right">
                          TSh {selectedOrder.totalAmount ? 
                            Number(selectedOrder.totalAmount).toLocaleString() : 
                            calculateTotal(selectedOrder.items).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders; 