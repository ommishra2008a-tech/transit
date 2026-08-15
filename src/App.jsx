import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SidebarProvider } from './contexts/SidebarContext';
import Sidebar from './components/Sidebar';
import ViewOnlyBanner from './components/ViewOnlyBanner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
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

// Protected Route Wrapper - allows authenticated users to access all dashboards (with View-Only guard)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-[#030712]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SidebarProvider>
          <Router>
            <ViewOnlyBanner />
            <Sidebar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Shared Protected Route */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Passenger Routes */}
              <Route path="/passenger" element={
                <ProtectedRoute>
                  <PassengerHome />
                </ProtectedRoute>
              } />
              <Route path="/passenger/track/:id" element={
                <ProtectedRoute>
                  <TrackBus />
                </ProtectedRoute>
              } />
              <Route path="/passenger/bus/:id" element={
                <ProtectedRoute>
                  <BusDetails />
                </ProtectedRoute>
              } />
              <Route path="/passenger/map" element={
                <ProtectedRoute>
                  <PassengerMap />
                </ProtectedRoute>
              } />

              {/* Driver Routes */}
              <Route path="/driver" element={
                <ProtectedRoute>
                  <DriverDashboard />
                </ProtectedRoute>
              } />
              <Route path="/driver/setup" element={
                <ProtectedRoute>
                  <DriverSetup />
                </ProtectedRoute>
              } />
              <Route path="/driver/pending" element={
                <ProtectedRoute>
                  <PendingApproval />
                </ProtectedRoute>
              } />
              <Route path="/driver/trip" element={
                <ProtectedRoute>
                  <ActiveTrip />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/buses" element={
                <ProtectedRoute>
                  <BusesManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/map" element={
                <ProtectedRoute>
                  <LiveMap />
                </ProtectedRoute>
              } />
              <Route path="/admin/drivers/add" element={
                <ProtectedRoute>
                  <AddDriver />
                </ProtectedRoute>
              } />
              <Route path="/admin/drivers/approvals" element={
                <ProtectedRoute>
                  <DriverApprovals />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute>
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
