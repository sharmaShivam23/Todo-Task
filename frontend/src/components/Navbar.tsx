import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useIsAuthenticated } from '../store/authStore';
import { CheckSquare, LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, clearAuth } = useAuthStore();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    navigate('/signin');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-700 transition-colors">
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TodoApp</span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="h-5 w-5" />
                  <span className="font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/signin"
                  className="text-gray-700 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

