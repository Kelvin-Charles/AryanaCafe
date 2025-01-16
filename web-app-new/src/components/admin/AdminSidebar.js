import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdRestaurantMenu,
  MdPeople,
  MdShoppingCart,
  MdInsertChart,
  MdEventSeat,
  MdLogout
} from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/admin', icon: MdDashboard, label: 'Dashboard' },
    { path: '/admin/menu', icon: MdRestaurantMenu, label: 'Manage Menu' },
    { path: '/admin/orders', icon: MdShoppingCart, label: 'Manage Orders' },
    { path: '/admin/reservations', icon: MdEventSeat, label: 'Reservations' },
    { path: '/admin/users', icon: MdPeople, label: 'Manage Users' },
    { path: '/admin/reports', icon: MdInsertChart, label: 'Reports' }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 min-h-screen bg-gray-800 text-white">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded transition-colors ${
                isActive(item.path)
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-700'
              }`}
            >
              <item.icon className="text-xl" />
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded hover:bg-gray-700 transition-colors text-left"
          >
            <MdLogout className="text-xl" />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar; 