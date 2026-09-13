import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './layouts/AppLayout';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import GrindingEntry from './pages/GrindingEntry';
import Login from './pages/Login';
import POS from './pages/POS';
import Products from './pages/Products';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';
import SalesHistory from './pages/SalesHistory';
import Suppliers from './pages/Suppliers';
import Users from './pages/Users';

function CatchAllRedirect() {
  const { isOwner } = useAuth();
  return <Navigate to={isOwner ? '/' : '/pos'} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route element={<ProtectedRoute ownerOnly />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/users" element={<Users />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/sales-history" element={<SalesHistory />} />
              </Route>

              <Route path="/pos" element={<POS />} />
              <Route path="/grinding" element={<GrindingEntry />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
            </Route>
          </Route>

          <Route path="*" element={<CatchAllRedirect />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
