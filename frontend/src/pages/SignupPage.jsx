import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { signupSchema } from '../validations/schemas';
import { useToast } from '../context/ToastContext';
import { User, Mail, Lock, MapPin, Eye, EyeOff } from 'lucide-react';

const SignupPage = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError('');
    setSuccess('');

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      (result.error.errors || result.error.issues || []).forEach(err => {
        const path = err.path[0];
        if (path) {
          fieldErrors[path] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Please fix the validation errors below.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/signup', formData);
      toast.success('Account created successfully! Redirecting to login...');
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (!err.response) {
        // Network error - backend unreachable
        const msg = 'Unable to reach the server. Please check your connection and try again.';
        setApiError(msg);
        toast.error(msg);
      } else if (err.response?.data?.errors) {
        const expressErrors = {};
        err.response.data.errors.forEach(e => {
          expressErrors[e.path || e.param] = e.msg;
        });
        setErrors(expressErrors);
        toast.error('Validation failed. Please review the highlighted fields.');
      } else {
        const errorMsg = err.response?.data?.error || 'Registration failed. Please try again.';
        setApiError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-8 bg-paper">
      <div className="card w-full max-w-[500px] px-8 py-8 border-paper-3 bg-paper-2 animate-scale-in">
        <div className="mb-6 text-center">
          <h1 className="text-xl tracking-wider mb-1">CREATE AN ACCOUNT</h1>
          <p className="text-sm text-ink-2">Register to submit store ratings</p>
        </div>

        {apiError && <div className="alert alert-danger mb-4">{apiError}</div>}
        {success && <div className="alert alert-success mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label htmlFor="name" className="block font-mono text-xs font-bold uppercase tracking-wider mb-2 text-ink-2">FULL LEGAL NAME</label>
            <div className="relative flex items-center">
              <User size={18} className="absolute left-4 text-ink-2 pointer-events-none" />
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Must be between 20 and 60 characters"
                required
                disabled={loading}
                className="w-full pl-11 pr-4"
              />
            </div>
            {errors.name && <span className="text-danger text-xs font-bold mt-1 block">{errors.name}</span>}
            <span className="font-mono text-[10px] text-ink-2 mt-1 block opacity-85">MINIMUM 20 CHARACTERS REQUIRED.</span>
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="block font-mono text-xs font-bold uppercase tracking-wider mb-2 text-ink-2">EMAIL ADDRESS</label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-4 text-ink-2 pointer-events-none" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={loading}
                className="w-full pl-11 pr-4"
              />
            </div>
            {errors.email && <span className="text-danger text-xs font-bold mt-1 block">{errors.email}</span>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="block font-mono text-xs font-bold uppercase tracking-wider mb-2 text-ink-2">PASSWORD</label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 text-ink-2 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="8 to 16 characters"
                required
                disabled={loading}
                className="w-full pl-11 pr-12"
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
            {errors.password && <span className="text-danger text-xs font-bold mt-1 block">{errors.password}</span>}
            <span className="font-mono text-[10px] text-ink-2 mt-1 block opacity-85">8-16 CHARACTERS, 1 UPPERCASE, 1 SPECIAL SYMBOL.</span>
          </div>

          <div className="flex flex-col">
            <label htmlFor="address" className="block font-mono text-xs font-bold uppercase tracking-wider mb-2 text-ink-2">RESIDENTIAL ADDRESS</label>
            <div className="relative flex items-start">
              <MapPin size={18} className="absolute left-4 top-3 text-ink-2 pointer-events-none" />
              <textarea
                id="address"
                rows="3"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your complete home address"
                required
                disabled={loading}
                className="w-full pl-11 pr-4 resize-y"
              />
            </div>
            {errors.address && <span className="text-danger text-xs font-bold mt-1 block">{errors.address}</span>}
            <span className="font-mono text-[10px] text-ink-2 mt-1 block opacity-85">MAXIMUM 400 CHARACTERS.</span>
          </div>

          <button type="submit" className={`btn btn-primary w-full font-display font-bold tracking-wider mt-2 ${!loading ? 'animate-glow-pulse' : ''}`} disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-ink-2">
          <span>Already registered? </span>
          <Link to="/login" className="text-accent font-semibold hover:text-accent-hover hover:underline transition-colors duration-150">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
