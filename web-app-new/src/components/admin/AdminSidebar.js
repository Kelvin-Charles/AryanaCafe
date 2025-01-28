import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  Square3Stack3DIcon,
  ShoppingCartIcon,
  CalendarIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/admin', icon: HomeIcon, label: 'Dashboard' },
    { path: '/admin/menu', icon: Square3Stack3DIcon, label: 'Manage Menu' },
    { path: '/admin/orders', icon: ShoppingCartIcon, label: 'Manage Orders' },
    { path: '/admin/reservations', icon: CalendarIcon, label: 'Reservations' },
    { path: '/admin/users', icon: UsersIcon, label: 'Manage Users' },
    { path: '/admin/reports', icon: ChartBarIcon, label: 'Reports' }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-[250px] min-h-screen bg-white dark:bg-navy-800 shadow-xl"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            Aryana Cafe
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Admin Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {active && (
                    <motion.div
                      className="absolute right-0 w-1 h-8 bg-white rounded-l-lg"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-navy-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg transition-all duration-200"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSidebar; 