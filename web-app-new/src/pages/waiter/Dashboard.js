import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { format } from 'date-fns';

const WaiterDashboard = () => {
  const [activeTables, setActiveTables] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [todayReservations, setTodayReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every minute
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tablesResponse, ordersResponse, reservationsResponse] = await Promise.all([
        api.tables.getStatus(),
        api.orders.getPendingOrders(),
        api.reservations.getAll()
      ]);

      setActiveTables(tablesResponse.data.filter(table => table.status === 'occupied'));
      setPendingOrders(ordersResponse.data);
      
      // Filter today's reservations
      const today = new Date();
      setTodayReservations(
        reservationsResponse.data.filter(reservation => 
          format(new Date(reservation.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        )
      );
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
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
      <h1 className="text-3xl font-bold mb-8">Waiter Dashboard</h1>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/waiter/tables" className="bg-primary text-white p-6 rounded-lg shadow hover:bg-primary-dark">
          <h3 className="text-xl font-semibold mb-2">Table Management</h3>
          <p className="text-sm opacity-90">View and manage table status</p>
        </Link>
        <Link to="/waiter/orders/new" className="bg-secondary text-white p-6 rounded-lg shadow hover:bg-secondary-dark">
          <h3 className="text-xl font-semibold mb-2">Take Order</h3>
          <p className="text-sm opacity-90">Create a new order</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Tables */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Active Tables</h2>
          {activeTables.length > 0 ? (
            <div className="space-y-4">
              {activeTables.map((table) => (
                <div key={table.id} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Table {table.number}</span>
                    <span className="text-sm text-gray-600">
                      {table.currentOrder ? `Order #${table.currentOrder.id}` : 'No order'}
                    </span>
                  </div>
                  {table.currentOrder && (
                    <div className="text-sm text-gray-600 mt-1">
                      Started: {format(new Date(table.currentOrder.createdAt), 'HH:mm')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No active tables</p>
          )}
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pending Orders</h2>
          {pendingOrders.length > 0 ? (
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div key={order.id} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Order #{order.id}</span>
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Table {order.tableNumber} • {format(new Date(order.createdAt), 'HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No pending orders</p>
          )}
        </div>

        {/* Today's Reservations */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Today's Reservations</h2>
          {todayReservations.length > 0 ? (
            <div className="space-y-4">
              {todayReservations.map((reservation) => (
                <div key={reservation.id} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{reservation.customerName}</span>
                    <span className="text-sm text-gray-600">{reservation.time}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Table {reservation.tableNumber} • {reservation.partySize} guests
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No reservations for today</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaiterDashboard; 