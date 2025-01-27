import React from 'react';

const CustomerDashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">My Orders</h2>
          <p>Order history coming soon...</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">My Reservations</h2>
          <p>Reservation management coming soon...</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">My Profile</h2>
          <p>Profile management coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard; 