import React, { useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import useApi from '../../hooks/useApi';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts/es6';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import MiniStatistics from '../../components/admin/MiniStatistics';

const Dashboard = () => {
  const { data: ordersList = [], loading: ordersLoading, error: ordersError, execute: fetchOrders } = useApi(api.orders.getAll);
  const { data: reservationsList = [], loading: reservationsLoading, error: reservationsError, execute: fetchReservations } = useApi(api.reservations.getAll);
  const { data: menuItemsList = [], loading: menuLoading, error: menuError, execute: fetchMenu } = useApi(api.menu.getAll);
  const { data: reportData = {}, loading: reportLoading, error: reportError, execute: fetchReport } = useApi(() => api.reports.get('sales', '7days'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchOrders(),
          fetchReservations(),
          fetchMenu(),
          fetchReport()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (ordersLoading || reservationsLoading || menuLoading || reportLoading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div>Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (ordersError || reservationsError || menuError || reportError) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div>Error loading dashboard data. Please try again later.</div>
        </div>
      </div>
    );
  }

  const todayReservations = reservationsList?.filter(r => 
    format(new Date(r.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ) || [];

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-primary">
              {ordersList?.length || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Today's Reservations</h3>
            <p className="text-3xl font-bold text-primary">
              {todayReservations.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Menu Items</h3>
            <p className="text-3xl font-bold text-primary">
              {menuItemsList?.length || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Today's Sales</h3>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(reportData?.todaySales || 0)}
            </p>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
          <div className="h-80">
            {reportData?.salesData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    name="Sales"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                No sales data available
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            {ordersList?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Order ID</th>
                      <th className="px-4 py-2">Customer</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td className="border px-4 py-2">#{order.id}</td>
                        <td className="border px-4 py-2">{order.customerName}</td>
                        <td className="border px-4 py-2">
                          <span className={`px-2 py-1 rounded text-sm ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="border px-4 py-2">
                          ${order.total?.toFixed(2) || '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>No recent orders</div>
            )}
          </div>

          {/* Today's Reservations */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Today's Reservations</h3>
            {todayReservations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Time</th>
                      <th className="px-4 py-2">Customer</th>
                      <th className="px-4 py-2">Party Size</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayReservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td className="border px-4 py-2">{reservation.time}</td>
                        <td className="border px-4 py-2">{reservation.customerName}</td>
                        <td className="border px-4 py-2">{reservation.partySize}</td>
                        <td className="border px-4 py-2">
                          <span className={`px-2 py-1 rounded text-sm ${getStatusColor(reservation.status)}`}>
                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>No reservations for today</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 