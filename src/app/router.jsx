import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar/Navbar';
import Login from '../pages/auth/Login';
import PassengerHome from '../pages/passenger/PassengerHome';
import BusDetails from '../pages/passenger/BusDetails';
import TrackBus from '../pages/passenger/TrackBus';
import DriverDashboard from '../pages/driver/DriverDashboard';
import ActiveTrip from '../pages/driver/ActiveTrip';
import AdminDashboard from '../pages/admin/AdminDashboard';
import Buses from '../pages/admin/Buses';
import RoutesPage from '../pages/admin/Routes';
import LiveMap from '../pages/admin/LiveMap';
import ProtectedRoute from '../components/ProtectedRoute';

function RoleRedirect() {
  const { isAuth, role } = useAuth();
  if (!isAuth) return <Navigate to="/login" replace />;
  const routes = { PASSENGER: '/passenger', DRIVER: '/driver', ADMIN: '/admin' };
  return <Navigate to={routes[role] || '/login'} replace />;
}

function AppLayout({ children }) {
  const { isAuth } = useAuth();
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      {isAuth && <Navbar />}
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Passenger */}
          <Route path="/passenger" element={<ProtectedRoute allowedRoles={['PASSENGER']}><PassengerHome /></ProtectedRoute>} />
          <Route path="/passenger/bus/:id" element={<ProtectedRoute allowedRoles={['PASSENGER']}><BusDetails /></ProtectedRoute>} />
          <Route path="/passenger/track/:id" element={<ProtectedRoute allowedRoles={['PASSENGER']}><TrackBus /></ProtectedRoute>} />

          {/* Driver */}
          <Route path="/driver" element={<ProtectedRoute allowedRoles={['DRIVER']}><DriverDashboard /></ProtectedRoute>} />
          <Route path="/driver/trip" element={<ProtectedRoute allowedRoles={['DRIVER']}><ActiveTrip /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/buses" element={<ProtectedRoute allowedRoles={['ADMIN']}><Buses /></ProtectedRoute>} />
          <Route path="/admin/routes" element={<ProtectedRoute allowedRoles={['ADMIN']}><RoutesPage /></ProtectedRoute>} />
          <Route path="/admin/live-map" element={<ProtectedRoute allowedRoles={['ADMIN']}><LiveMap /></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
