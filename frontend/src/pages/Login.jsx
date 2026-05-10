import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post('/users/login', { email, password });
      login(res.data.user, res.data.token);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-[#E8DDD4] p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C1810]">Welcome Back</h1>
          <p className="text-[#8C7B6B] mt-2">Sign in to your Memory Gallery</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#2C1810]">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="border border-[#E8DDD4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] bg-[#FAF7F2] text-[#2C1810] placeholder-[#C4A882] w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#2C1810]">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="border border-[#E8DDD4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] bg-[#FAF7F2] text-[#2C1810] placeholder-[#C4A882] w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#8B5E3C] text-white py-3 rounded-lg font-semibold hover:bg-[#7A4F2F] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200 mt-2 w-full"
          >
            {loading ? 'Please wait...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-6 text-[#8C7B6B]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#8B5E3C] font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;