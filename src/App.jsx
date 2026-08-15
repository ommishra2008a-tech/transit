import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SidebarProvider } from './contexts/SidebarContext';
import Sidebar from './components/Sidebar';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import Login from './pages/auth/Login';
import Profile from './pages/auth/Profile';
import PassengerHome from './pages/passenger/PassengerHome';
import TrackBus from './pages/passenger/TrackBus';
import BusDetails from './pages/passenger/BusDetails';
import PassengerMap from './pages/passenger/PassengerMap';
import DriverDashboard from './pages/driver/DriverDashboard';
import ActiveTrip from './pages/driver/ActiveTrip';
import DriverSetup from './pages/driver/DriverSetup';
import PendingApproval from './pages/driver/PendingApproval';
import AdminDashboard from './pages/admin/AdminDashboard';
import BusesManagement from './pages/admin/BusesManagement';
import LiveMap from './pages/admin/LiveMap';
import AddDriver from './pages/admin/AddDriver';
import AdminSettings from './pages/admin/AdminSettings';
import DriverApprovals from './pages/admin/DriverApprovals';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="h-dvh flex items-center justify-center bg-[#030712]"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let role = (user.role || 'PASSENGER').toUpperCase();
  // Normalize unknown roles to PASSENGER to prevent infinite redirect loops between Login and ProtectedRoute
  if (!['DRIVER', 'ADMIN', 'PASSENGER'].includes(role)) {
    role = 'PASSENGER';
  }

  if (allowedRoles && !allowedRoles.map(r => r.toUpperCase()).includes(role)) {
    if (role === 'DRIVER') return <Navigate to="/driver" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'PASSENGER') return <Navigate to="/passenger" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SidebarProvider>
          <Router>
            <Sidebar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />

              {/* Shared Protected Route */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Passenger Routes */}
              <Route path="/passenger" element={
                <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                  <PassengerHome />
                </ProtectedRoute>
              } />
              <Route path="/passenger/track/:id" element={
                <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                  <TrackBus />
                </ProtectedRoute>
              } />
              <Route path="/passenger/bus/:id" element={
                <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                  <BusDetails />
                </ProtectedRoute>
              } />
              <Route path="/passenger/map" element={
                <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                  <PassengerMap />
                </ProtectedRoute>
              } />

              {/* Driver Routes */}
              <Route path="/driver" element={
                <ProtectedRoute allowedRoles={['DRIVER', 'ADMIN']}>
                  <DriverDashboard />
                </ProtectedRoute>
              } />
              <Route path="/driver/setup" element={
                <ProtectedRoute allowedRoles={['DRIVER']}>
                  <DriverSetup />
                </ProtectedRoute>
              } />
              <Route path="/driver/pending" element={
                <ProtectedRoute allowedRoles={['DRIVER']}>
                  <PendingApproval />
                </ProtectedRoute>
              } />
              <Route path="/driver/trip" element={
                <ProtectedRoute allowedRoles={['DRIVER']}>
                  <ActiveTrip />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/buses" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <BusesManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/map" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <LiveMap />
                </ProtectedRoute>
              } />
              <Route path="/admin/drivers/add" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AddDriver />
                </ProtectedRoute>
              } />
              <Route path="/admin/drivers/approvals" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DriverApprovals />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminSettings />
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SidebarProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
