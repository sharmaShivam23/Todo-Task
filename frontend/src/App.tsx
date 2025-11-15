import { Routes, Route, Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { useIsAuthenticated } from './store/authStore';

function App() {
  const isAuthenticated = useIsAuthenticated();

  // Memoize route elements to prevent unnecessary re-renders
  const authRoutes = useMemo(() => {
    if (isAuthenticated) {
      return {
        signup: <Navigate to="/" replace />,
        signin: <Navigate to="/" replace />,
        forgotPassword: <Navigate to="/" replace />,
        resetPassword: <Navigate to="/" replace />,
      };
    }
    return {
      signup: <Signup />,
      signin: <Signin />,
      forgotPassword: <ForgotPassword />,
      resetPassword: <ResetPassword />,
    };
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/signup" element={authRoutes.signup} />
        <Route path="/signin" element={authRoutes.signin} />
        <Route path="/forgot-password" element={authRoutes.forgotPassword} />
        <Route path="/reset-password" element={authRoutes.resetPassword} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
