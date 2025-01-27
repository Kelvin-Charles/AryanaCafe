import React from 'react';

const WaiterDashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Waiter Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Active Tables</h2>
          <p>Table management coming soon...</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pending Orders</h2>
          <p>Order management coming soon...</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Today's Reservations</h2>
          <p>Reservation details coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default WaiterDashboard; 