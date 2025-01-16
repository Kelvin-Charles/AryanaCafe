import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import useApi from '../../hooks/useApi';
import { format } from 'date-fns';

const ManageOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { data: orders = [], loading, error, execute: fetchOrders } = useApi(api.orders.getAll);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.orders.updateStatus(id, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
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

  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>

        {/* Orders List */}
        <div className="bg-white p-6 rounded-lg shadow">
          {loading ? (
            <div>Loading orders...</div>
          ) : error ? (
            <div>Error loading orders: {error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Order ID</th>
                    <th className="px-4 py-2">Customer</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="border px-4 py-2">#{order.id}</td>
                      <td className="border px-4 py-2">{order.customerName}</td>
                      <td className="border px-4 py-2">
                        {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="border px-4 py-2">
                        ${calculateTotal(order.items).toFixed(2)}
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
                          className="px-3 py-1 bg-blue-500 text-white rounded"
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
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4">Order Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="font-medium">Order ID:</label>
                  <p>#{selectedOrder.id}</p>
                </div>
                <div>
                  <label className="font-medium">Customer Name:</label>
                  <p>{selectedOrder.customerName}</p>
                </div>
                <div>
                  <label className="font-medium">Date:</label>
                  <p>{format(new Date(selectedOrder.createdAt), 'MMMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <label className="font-medium">Items:</label>
                  <div className="mt-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between py-2 border-b">
                        <span>{item.name} x {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 font-bold flex justify-between">
                    <span>Total:</span>
                    <span>${calculateTotal(selectedOrder.items).toFixed(2)}</span>
                  </div>
                </div>
                <div>
                  <label className="font-medium">Special Instructions:</label>
                  <p>{selectedOrder.specialInstructions || 'None'}</p>
                </div>
                <div>
                  <label className="font-medium">Status:</label>
                  <p className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders; 