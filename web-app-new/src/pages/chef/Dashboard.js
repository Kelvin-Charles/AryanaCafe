import React from 'react';

const ChefDashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Chef Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
          <p>Order management coming soon...</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Inventory Status</h2>
          <p>Inventory tracking coming soon...</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Special Requests</h2>
          <p>Special requests management coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard; 