import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { storeSchema } from '../../validations/schemas';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, PlusSquare, Store, Mail, MapPin, User, RefreshCw } from 'lucide-react';

const AddStoreForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });

  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await api.get('/users', { params: { role: 'owner' } });
        setOwners(response.data);
        
        const defaultOwnerId = location.state?.defaultOwnerId;
        if (defaultOwnerId) {
          setFormData(prev => ({ ...prev, ownerId: defaultOwnerId }));
        }
      } catch (err) {
        setApiError('Failed to fetch list of store owners. Please reload.');
      } finally {
        setLoadingOwners(false);
      }
    };
    fetchOwners();
  }, [location.state]);

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

    const submissionBody = {
      name: formData.name,
      email: formData.email,
      address: formData.address,
      ownerId: formData.ownerId === '' ? null : formData.ownerId,
    };

    const result = storeSchema.safeParse(submissionBody);
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
      await api.post('/stores', submissionBody);
      toast.success('Store registered successfully!');
      setSuccess('Store registered successfully!');
      setTimeout(() => {
        navigate('/admin/stores');
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        const expressErrors = {};
        err.response.data.errors.forEach(e => {
          expressErrors[e.path || e.param] = e.msg;
        });
        setErrors(expressErrors);
        toast.error('Validation failed. Please check the fields.');
      } else {
        const errorMsg = err.response?.data?.error || 'Failed to create store. Please try again.';
        setApiError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
      <button onClick={() => navigate('/admin/stores')} className="inline-flex items-center gap-2 bg-transparent border-none font-display text-xs font-bold text-ink-2 hover:text-ink cursor-pointer w-fit transition-colors duration-150">
        <ArrowLeft size={16} />
        <span>BACK TO STORES</span>
      </button>

      <div className="card w-full max-w-[520px] mx-auto p-8 border-paper-3 bg-paper-2">
        <div className="text-center mb-8">
          <PlusSquare size={32} className="text-accent mx-auto mb-2" />
          <h1 className="text-xl tracking-wider mb-1">REGISTER NEW STORE</h1>
          <p className="text-sm text-ink-2">Create a new store profile on the platform</p>
        </div>

        {apiError && <div className="alert alert-danger mb-4">{apiError}</div>}
        {success && <div className="alert alert-success mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label htmlFor="name" className="block font-mono text-xs font-bold uppercase tracking-wider mb-2 text-ink-2">STORE NAME</label>
            <div className="relative flex items-center">
              <Store size={18} className="absolute left-4 text-ink-2 pointer-events-none" />
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter store brand/branch name"
                required
                disabled={loading}
                className="w-full pl-11 pr-4"
              />
            </div>
            {errors.name && <span className="text-danger text-xs font-bold mt-1 block">{errors.name}</span>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="block font-mono text-xs font-bold uppercase tracking-wider mb-2 text-ink-2">OFFICIAL STORE EMAIL</label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-4 text-ink-2 pointer-events-none" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@storename.com"
                required
                disabled={loading}
                className="w-full pl-11 pr-4"
              />
            </div>
            {errors.email && <span className="text-danger text-xs font-bold mt-1 block">{errors.email}</span>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="ownerId" className="block font-mono text-xs font-bold uppercase tracking-wider mb-2 text-ink-2">ASSIGN STORE OWNER</label>
            <div className="relative flex items-center">
              <User size={18} className="absolute left-4 text-ink-2 pointer-events-none" />
              <select
                id="ownerId"
                value={formData.ownerId}
                onChange={(e) => handleInputChange('ownerId', e.target.value)}
                disabled={loading || loadingOwners}
                className="w-full pl-11 pr-4 font-medium"
              >
                <option value="">Unassigned (Select Owner)</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            </div>
            {errors.ownerId && <span className="text-danger text-xs font-bold mt-1 block">{errors.ownerId}</span>}
            {loadingOwners ? (
              <span className="inline-flex items-center gap-1 text-xs text-accent mt-1 font-medium">
                <RefreshCw size={12} className="animate-spin-fast" />
                <span>Loading available owners...</span>
              </span>
            ) : owners.length === 0 ? (
              <span className="text-danger text-xs font-bold mt-1 block">
                No store owners registered. Create a user with role "Store Owner" first.
              </span>
            ) : null}
          </div>

          <div className="flex flex-col">
            <label htmlFor="address" className="block font-mono text-xs font-bold uppercase tracking-wider mb-2 text-ink-2">STORE PHYSICAL ADDRESS</label>
            <div className="relative flex items-start">
              <MapPin size={18} className="absolute left-4 top-3 text-ink-2 pointer-events-none" />
              <textarea
                id="address"
                rows="3"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete store physical location address"
                required
                disabled={loading}
                className="w-full pl-11 pr-4 resize-y"
              />
            </div>
            {errors.address && <span className="text-danger text-xs font-bold mt-1 block">{errors.address}</span>}
            <span className="font-mono text-[10px] text-ink-2 mt-1 block opacity-85">MAXIMUM 400 CHARACTERS.</span>
          </div>

          <button type="submit" className="btn btn-primary w-full font-display font-bold tracking-wider mt-4" disabled={loading}>
            {loading ? 'REGISTERING...' : 'REGISTER STORE'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStoreForm;
