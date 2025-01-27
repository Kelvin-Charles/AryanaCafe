import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageMenu from './pages/admin/ManageMenu';
import ManageOrders from './pages/admin/ManageOrders';
import ManageReservations from './pages/admin/ManageReservations';
import ManageUsers from './pages/admin/ManageUsers';
import Reports from './pages/admin/Reports';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import StaffSchedule from './pages/manager/StaffSchedule';
import InventoryManagement from './pages/manager/InventoryManagement';
import StaffManagement from './pages/manager/StaffManagement';

// Waiter Pages
import WaiterDashboard from './pages/waiter/Dashboard';
import TableManagement from './pages/waiter/TableManagement';
import OrderTaking from './pages/waiter/OrderTaking';

// Chef Pages
import ChefDashboard from './pages/chef/Dashboard';
import KitchenOrders from './pages/chef/KitchenOrders';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import Cart from './pages/customer/Cart';
import OrderHistory from './pages/customer/OrderHistory';
import Reservations from './pages/customer/Reservations';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/menu" element={<Menu />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/menu" element={
              <ProtectedRoute requiredRole="admin">
                <ManageMenu />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute requiredRole="admin">
                <ManageOrders />
              </ProtectedRoute>
            } />
            <Route path="/admin/reservations" element={
              <ProtectedRoute requiredRole="admin">
                <ManageReservations />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <ManageUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute requiredRole="admin">
                <Reports />
              </ProtectedRoute>
            } />

            {/* Manager Routes */}
            <Route path="/manager" element={
              <ProtectedRoute requiredRole="manager">
                <ManagerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/manager/staff" element={
              <ProtectedRoute requiredRole="manager">
                <StaffManagement />
              </ProtectedRoute>
            } />
            <Route path="/manager/schedule" element={
              <ProtectedRoute requiredRole="manager">
                <StaffSchedule />
              </ProtectedRoute>
            } />
            <Route path="/manager/inventory" element={
              <ProtectedRoute requiredRole="manager">
                <InventoryManagement />
              </ProtectedRoute>
            } />

            {/* Waiter Routes */}
            <Route path="/waiter" element={
              <ProtectedRoute requiredRole="waiter">
                <WaiterDashboard />
              </ProtectedRoute>
            } />
            <Route path="/waiter/tables" element={
              <ProtectedRoute requiredRole="waiter">
                <TableManagement />
              </ProtectedRoute>
            } />
            <Route path="/waiter/orders" element={
              <ProtectedRoute requiredRole="waiter">
                <OrderTaking />
              </ProtectedRoute>
            } />

            {/* Chef Routes */}
            <Route path="/chef" element={
              <ProtectedRoute requiredRole="chef">
                <ChefDashboard />
              </ProtectedRoute>
            } />
            <Route path="/chef/orders" element={
              <ProtectedRoute requiredRole="chef">
                <KitchenOrders />
              </ProtectedRoute>
            } />

            {/* Customer Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            } />
            <Route path="/reservations" element={
              <ProtectedRoute>
                <Reservations />
              </ProtectedRoute>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
