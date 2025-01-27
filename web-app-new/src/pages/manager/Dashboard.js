import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
  const [staffOverview, setStaffOverview] = useState({
    total: 0,
    onDuty: 0,
    waiters: [],
    chefs: []
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [staffResponse, scheduleResponse, inventoryResponse] = await Promise.all([
        api.users.getStaff(),
        api.shifts.getAll(),
        api.inventory.getStatus()
      ]);

      setStaffOverview({
        total: staffResponse.data.length,
        onDuty: staffResponse.data.filter(staff => staff.isOnDuty).length,
        waiters: staffResponse.data.filter(staff => staff.role === 'waiter'),
        chefs: staffResponse.data.filter(staff => staff.role === 'chef')
      });

      setTodaySchedule(scheduleResponse.data);
      setInventoryStatus(inventoryResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
      <h1 className="text-3xl font-bold mb-8">Manager Dashboard</h1>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/manager/staff" className="bg-blue-500 text-white p-6 rounded-lg shadow hover:bg-blue-600">
          <h3 className="text-xl font-semibold mb-2">Manage Staff</h3>
          <p className="text-sm opacity-90">Add, edit, or remove staff members</p>
        </Link>
        <Link to="/manager/schedule" className="bg-green-500 text-white p-6 rounded-lg shadow hover:bg-green-600">
          <h3 className="text-xl font-semibold mb-2">Staff Schedule</h3>
          <p className="text-sm opacity-90">Manage staff shifts and schedules</p>
        </Link>
        <Link to="/manager/inventory" className="bg-purple-500 text-white p-6 rounded-lg shadow hover:bg-purple-600">
          <h3 className="text-xl font-semibold mb-2">Inventory</h3>
          <p className="text-sm opacity-90">Manage inventory and stock levels</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Staff Overview */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Staff Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Staff:</span>
              <span className="font-bold">{staffOverview.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>On Duty:</span>
              <span className="font-bold text-green-600">{staffOverview.onDuty}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Waiters:</span>
              <span className="font-bold">{staffOverview.waiters.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Chefs:</span>
              <span className="font-bold">{staffOverview.chefs.length}</span>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
          <div className="space-y-4">
            {todaySchedule.map((shift) => (
              <div key={shift.id} className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{shift.staffName}</span>
                  <span className="text-sm text-gray-600">
                    {format(new Date(shift.startTime), 'HH:mm')} - 
                    {format(new Date(shift.endTime), 'HH:mm')}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{shift.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Inventory Status</h2>
          <div className="space-y-4">
            {inventoryStatus.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <span>{item.name}</span>
                <span className={`font-bold ${
                  item.quantity <= item.minThreshold ? 'text-red-600' : 'text-green-600'
                }`}>
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard; 