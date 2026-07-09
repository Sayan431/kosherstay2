import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';

// Pages
import Home from './pages/Home.jsx';
import PropertyDetail from './pages/PropertyDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import BookingList from './pages/customer/BookingList.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AddProperty from './pages/admin/AddProperty.jsx';
import EditProperty from './pages/admin/EditProperty.jsx';
import AdminBookings from './pages/admin/AdminBookings.jsx';
import BookingCalendar from './pages/admin/BookingCalendar.jsx';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard.jsx';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-wrapper"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer routes */}
        <Route path="/my-bookings" element={
          <ProtectedRoute roles={['customer']}>
            <BookingList />
          </ProtectedRoute>
        } />

        {/* Hotel Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['hotel_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/add-property" element={
          <ProtectedRoute roles={['hotel_admin']}>
            <AddProperty />
          </ProtectedRoute>
        } />
        <Route path="/admin/edit-property/:id" element={
          <ProtectedRoute roles={['hotel_admin']}>
            <EditProperty />
          </ProtectedRoute>
        } />
        <Route path="/admin/bookings" element={
          <ProtectedRoute roles={['hotel_admin']}>
            <AdminBookings />
          </ProtectedRoute>
        } />
        <Route path="/admin/calendar/:propertyId" element={
          <ProtectedRoute roles={['hotel_admin']}>
            <BookingCalendar />
          </ProtectedRoute>
        } />

        {/* Super Admin routes */}
        <Route path="/super-admin" element={
          <ProtectedRoute roles={['super_admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
