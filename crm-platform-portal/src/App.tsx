import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { SalesRepDashboard } from './pages/SalesRepDashboard';
import { SupervisorDashboard } from './pages/SupervisorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Unauthorized } from './pages/Unauthorized';

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes - Role-based */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {(() => {
                switch (user?.role) {
                  case 'admin':
                    return <AdminDashboard />;
                  case 'manager':
                    return <SupervisorDashboard />;
                  case 'sales_rep':
                    return <SalesRepDashboard />;
                  default:
                    return <Navigate to="/login" replace />;
                }
              })()}
            </ProtectedRoute>
          }
        />

        {/* Specific Role Routes */}
        <Route
          path="/sales-rep"
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'manager', 'admin']}>
              <SalesRepDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
