import { Navigate } from "react-router-dom";
import { useAuthStore, useIsAuthenticated } from "../store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useIsAuthenticated();
  const loading = useAuthStore((state) => state.loading);

  // ⭐ Prevent flicker: wait for persist to load
  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-xl">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
