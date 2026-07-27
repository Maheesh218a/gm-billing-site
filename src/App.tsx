import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetails from './pages/customers/CustomerDetails';
import VehicleList from './pages/vehicles/VehicleList';
import DriverList from './pages/drivers/DriverList';

import Layout from './components/layout/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/customers/create" element={<CustomerForm />} />
              <Route path="/customers/:id/edit" element={<CustomerForm />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />
              
              <Route path="/vehicles" element={<VehicleList />} />
              <Route path="/vehicles/create" element={<div className="p-8">Vehicle Form Placeholder</div>} />
              <Route path="/vehicles/:id/edit" element={<div className="p-8">Vehicle Form Placeholder</div>} />
              <Route path="/vehicles/:id" element={<div className="p-8">Vehicle Details Placeholder</div>} />
              
              <Route path="/drivers" element={<DriverList />} />
              <Route path="/drivers/create" element={<div className="p-8">Driver Form Placeholder</div>} />
              <Route path="/drivers/:id/edit" element={<div className="p-8">Driver Form Placeholder</div>} />
              <Route path="/drivers/:id" element={<div className="p-8">Driver Details Placeholder</div>} />
              {/* Add more protected routes here */}
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
