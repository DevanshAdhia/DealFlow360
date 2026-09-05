import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getSession, initializeData } from './services/storageService';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Customers from './pages/Customers';
import Products from './pages/Products';
import DiscountRules from './pages/DiscountRules';
import ApprovalRules from './pages/ApprovalRules';
import Inventory from './pages/Inventory';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import Categories from './pages/Categories';
import PriceLists from './pages/PriceLists';
import Quotations from './pages/Quotations';
import Orders from './pages/Orders';
import Warehouses from './pages/Warehouses';
import Billing from './pages/Billing';
import Notifications from './pages/Notifications';
import AdminLayout from './components/layout/AdminLayout';

const Placeholder = ({ title }) => <div className="page-header"><h1 className="page-title">{title}</h1><p>Module under construction.</p></div>;

// Make sure initial mock data is loaded into localStorage synchronously
initializeData();

function App() {
  const [session, setSessionState] = useState(() => getSession());

  const handleLogin = (user) => {
    setSession(user);
    setSessionState(user);
  };

  const handleLogout = () => {
    setSession(null);
    setSessionState(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          session ? <Navigate to="/admin/dashboard" /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/signup" element={
          session ? <Navigate to="/admin/dashboard" /> : <Login onLogin={handleLogin} />
        } />
        
        <Route path="/admin" element={
          session ? <AdminLayout onLogout={handleLogout} user={session} /> : <Navigate to="/login" />
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<Roles />} />
          <Route path="customers" element={<Customers />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="price-lists" element={<PriceLists />} />
          <Route path="discount-rules" element={<DiscountRules />} />
          <Route path="approval-rules" element={<ApprovalRules />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="orders" element={<Orders />} />
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="billing" element={<Billing />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to="/admin/dashboard" />} />
        <Route path="*" element={<div className="content"><h1>404 Not Found</h1></div>} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
