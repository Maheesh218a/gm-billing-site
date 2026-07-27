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
import VehicleForm from './pages/vehicles/VehicleForm';
import DriverList from './pages/drivers/DriverList';
import DriverForm from './pages/drivers/DriverForm';
import InvoiceList from './pages/invoices/InvoiceList';
import InvoiceForm from './pages/invoices/InvoiceForm';
import InvoiceView from './pages/invoices/InvoiceView';
import PublicInvoiceView from './pages/invoices/PublicInvoiceView';
import PaymentList from './pages/payments/PaymentList';
import BookingCalendar from './pages/bookings/BookingCalendar';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Templates from './pages/Templates';
import Backup from './pages/Backup';
import Logs from './pages/Logs';

import Layout from './components/layout/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verify/:id" element={<PublicInvoiceView />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/customers/create" element={<CustomerForm />} />
              <Route path="/customers/:id/edit" element={<CustomerForm />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />
              
              <Route path="/vehicles" element={<VehicleList />} />
              <Route path="/vehicles/create" element={<VehicleForm />} />
              <Route path="/vehicles/:id/edit" element={<VehicleForm />} />
              <Route path="/vehicles/:id" element={<div className="p-8">Vehicle Details Placeholder</div>} />
              
              <Route path="/drivers" element={<DriverList />} />
              <Route path="/drivers/create" element={<DriverForm />} />
              <Route path="/drivers/:id/edit" element={<DriverForm />} />
              <Route path="/drivers/:id" element={<div className="p-8">Driver Details Placeholder</div>} />

              <Route path="/invoices" element={<Navigate to="/invoices/history" replace />} />
              <Route path="/invoices/history" element={<InvoiceList />} />
              <Route path="invoices/create" element={<InvoiceForm />} />
              <Route path="invoices/:id/edit" element={<InvoiceForm />} />
              <Route path="invoices/:id" element={<InvoiceView />} />

              <Route path="/payments" element={<PaymentList />} />

              <Route path="/bookings" element={<BookingCalendar />} />
              
              <Route path="/settings" element={<Settings />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/backup" element={<Backup />} />
              <Route path="/logs" element={<Logs />} />
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
