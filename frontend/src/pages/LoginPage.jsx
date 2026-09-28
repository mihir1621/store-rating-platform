import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const LoginPage = () => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      login(token, user);
      
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/stores');
      }
    } catch (err) {
      let errorMsg;
      if (!err.response) {
        errorMsg = 'Unable to reach the server. Please check your connection and try again.';
      } else {
        errorMsg = err.response?.data?.error || 'Invalid email or password. Please try again.';
      }
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-8 bg-paper">
      <div className="card w-full max-w-[440px] px-8 py-10 border-paper-3 bg-paper-2 animate-scale-in">
        <div className="mb-8 text-center">
          <h1 className="text-2xl tracking-wider mb-2">SIGN IN</h1>
          <p className="text-sm text-ink-2">Access your store rating account</p>
        </div>

        {error && <div className="alert alert-danger mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col">
            <label htmlFor="email" className="block font-mono text-xs font-bold uppercase tracking-wider mb-2 text-ink-2">EMAIL ADDRESS</label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-4 text-ink-2 pointer-events-none" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                disabled={loading}
                className="pl-11 pr-4 w-full"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="block font-mono text-xs font-bold uppercase tracking-wider mb-2 text-ink-2">PASSWORD</label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 text-ink-2 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="pl-11 pr-12 w-full"
              />
              <button
                type="button"
                className="absolute right-4 bg-transparent border-none text-ink-2 cursor-pointer flex items-center justify-center p-1 rounded-sm hover:text-ink transition-colors duration-150"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className={`btn btn-primary w-full font-display font-bold tracking-wider mt-2 ${!loading ? 'animate-glow-pulse' : ''}`} disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-ink-2">
          <span>New to the platform? </span>
          <Link to="/signup" className="text-accent font-semibold hover:text-accent-hover hover:underline transition-colors duration-150">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
