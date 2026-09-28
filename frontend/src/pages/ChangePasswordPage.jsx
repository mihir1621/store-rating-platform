import React, { useState } from 'react';
import api from '../api/axios';
import { changePasswordSchema } from '../validations/schemas';
import { useToast } from '../context/ToastContext';
import { Key, Lock, Eye, EyeOff } from 'lucide-react';

const ChangePasswordPage = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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

    const result = changePasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      (result.error.errors || result.error.issues || []).forEach(err => {
        const path = err.path[0];
        if (path) {
          fieldErrors[path] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Please fix the validation errors.');
      return;
    }

    setLoading(true);
    try {
      await api.patch('/users/password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password updated successfully!');
      setSuccess('Password updated successfully!');
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      if (err.response?.data?.errors) {
        const expressErrors = {};
        err.response.data.errors.forEach(e => {
          expressErrors[e.path || e.param] = e.msg;
        });
        setErrors(expressErrors);
        toast.error('Validation failed. Please review the inputs.');
      } else {
        const errorMsg = err.response?.data?.error || 'Password update failed. Please try again.';
        setApiError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center py-12 flex-1 px-4">
      <div className="card w-full max-w-[480px] px-8 py-8 border-paper-3 bg-paper-2 animate-scale-in">
        <div className="text-center mb-8">
          <Key size={32} className="text-accent mx-auto mb-2" />
          <h1 className="text-xl tracking-wider mb-1">CHANGE PASSWORD</h1>
          <p className="text-sm text-ink-2">Update your account login security</p>
        </div>

        {apiError && <div className="alert alert-danger mb-4">{apiError}</div>}
        {success && <div className="alert alert-success mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col">
            <label htmlFor="oldPassword" className="block font-mono text-xs font-bold uppercase tracking-wider mb-2 text-ink-2">CURRENT PASSWORD</label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 text-ink-2 pointer-events-none" />
              <input
                id="oldPassword"
                type={showOldPass ? 'text' : 'password'}
                value={formData.oldPassword}
                onChange={(e) => handleInputChange('oldPassword', e.target.value)}
                placeholder="Enter current password"
                required
                disabled={loading}
                className="w-full pl-11 pr-12"
              />
              <button
                type="button"
                className="absolute right-4 bg-transparent border-none text-ink-2 cursor-pointer flex items-center justify-center p-1 rounded-sm hover:text-ink transition-colors duration-150"
                onClick={() => setShowOldPass(!showOldPass)}
                tabIndex="-1"
                aria-label={showOldPass ? 'Hide password' : 'Show password'}
              >
                {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.oldPassword && <span className="text-danger text-xs font-bold mt-1 block">{errors.oldPassword}</span>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="newPassword" className="block font-mono text-xs font-bold uppercase tracking-wider mb-2 text-ink-2">NEW PASSWORD</label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 text-ink-2 pointer-events-none" />
              <input
                id="newPassword"
                type={showNewPass ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="8 to 16 characters"
                required
                disabled={loading}
                className="w-full pl-11 pr-12"
              />
              <button
                type="button"
                className="absolute right-4 bg-transparent border-none text-ink-2 cursor-pointer flex items-center justify-center p-1 rounded-sm hover:text-ink transition-colors duration-150"
                onClick={() => setShowNewPass(!showNewPass)}
                tabIndex="-1"
                aria-label={showNewPass ? 'Hide password' : 'Show password'}
              >
                {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && <span className="text-danger text-xs font-bold mt-1 block">{errors.newPassword}</span>}
            <span className="font-mono text-[10px] text-ink-2 mt-1 block opacity-85">8-16 CHARACTERS, 1 UPPERCASE, 1 SPECIAL SYMBOL.</span>
          </div>

          <div className="flex flex-col">
            <label htmlFor="confirmPassword" className="block font-mono text-xs font-bold uppercase tracking-wider mb-2 text-ink-2">CONFIRM NEW PASSWORD</label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 text-ink-2 pointer-events-none" />
              <input
                id="confirmPassword"
                type={showNewPass ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={loading}
                className="w-full pl-11 pr-12"
              />
            </div>
            {errors.confirmPassword && <span className="text-danger text-xs font-bold mt-1 block">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-primary w-full font-display font-bold tracking-wider" disabled={loading}>
            {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
