import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
  isActive
    ? 'text-[#8B5E3C] font-bold border-b-2 border-[#8B5E3C] pb-1 transition'
    : 'text-[#8C7B6B] hover:text-[#8B5E3C] font-medium transition';

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-[#E8DDD4] w-full">
      <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between w-full">

        <NavLink to="/" className="text-xl font-bold text-[#8B5E3C] flex items-center gap-2">
          📸 Memory Gallery
        </NavLink>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <span className="text-[#8C7B6B] font-medium">
                Hey, <span className="text-[#8B5E3C] font-bold">{user.name} 👋</span>
              </span>
              <NavLink to="/" className={linkClass}>Home</NavLink>
              <NavLink to="/upload" className={linkClass}>Upload</NavLink>
              <NavLink to="/profile" className={linkClass}>Profile</NavLink>
              <button
                onClick={handleLogout}
                className="bg-[#8B5E3C] text-white px-4 py-2 rounded-lg hover:bg-[#7A4F2F] transition font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <NavLink
                to="/register"
                className="bg-[#8B5E3C] text-white px-4 py-2 rounded-lg hover:bg-[#7A4F2F] transition font-medium"
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;