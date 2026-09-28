import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, User, Mail, MapPin, Shield, Store, RefreshCw, Trash2 } from 'lucide-react';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteUser = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete the user "${userDetail.name}"? This will also remove all their associated ratings and unassign any stores owned by them.`)) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/users/${id}`);
      toast.success(`User "${userDetail.name}" deleted successfully.`);
      navigate('/admin/users');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete user. Please try again.';
      toast.error(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        setUserDetail(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch user details.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-4 min-h-[50vh] text-ink-2 font-mono text-sm">
        <RefreshCw size={24} className="animate-spin-fast text-accent" />
        <span>LOADING PROFILE...</span>
      </div>
    );
  }

  if (error || !userDetail) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col gap-4">
        <div className="alert alert-danger">{error || 'User not found.'}</div>
        <button onClick={() => navigate('/admin/users')} className="btn btn-secondary flex-center w-fit">
          <ArrowLeft size={16} className="mr-2" />
          <span>BACK TO USERS</span>
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
      <button onClick={() => navigate('/admin/users')} className="inline-flex items-center gap-2 bg-transparent border-none font-display text-xs font-bold text-ink-2 hover:text-ink cursor-pointer w-fit transition-colors duration-150">
        <ArrowLeft size={16} />
        <span>BACK TO USERS</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="card border-paper-3 bg-paper-2 p-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-paper-3 flex items-center justify-center text-accent">
              <User size={36} />
            </div>
            <div>
              <h2 className="text-lg tracking-wider font-bold">{userDetail.name.toUpperCase()}</h2>
              <span className={`inline-block px-2 py-0.5 rounded-sm font-mono text-xs font-bold border ${
                userDetail.role === 'admin' 
                  ? 'bg-paper border-border text-ink' 
                  : userDetail.role === 'owner' 
                  ? 'bg-paper border-focus text-accent' 
                  : 'bg-paper border-success/30 text-success'
              }`}>{userDetail.role.toUpperCase()}</span>
            </div>
          </div>

          <hr className="border-0 border-t border-paper-3 my-6" />

          <div className="flex flex-col gap-5">
            <div className="flex gap-4 items-start">
              <Mail size={16} className="text-accent mt-0.5" />
              <div>
                <span className="block text-xs font-bold text-ink-2 mb-0.5 tracking-wider">EMAIL ADDRESS</span>
                <span className="text-sm text-ink">{userDetail.email}</span>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <MapPin size={16} className="text-accent mt-0.5" />
              <div>
                <span className="block text-xs font-bold text-ink-2 mb-0.5 tracking-wider">RESIDENTIAL ADDRESS</span>
                <span className="text-sm text-ink">{userDetail.address}</span>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Shield size={16} className="text-accent mt-0.5" />
              <div>
                <span className="block text-xs font-bold text-ink-2 mb-0.5 tracking-wider">USER IDENTIFIER</span>
                <span className="font-mono text-xs text-ink-2">{userDetail.id}</span>
              </div>
            </div>
          </div>

          {user && user.id !== userDetail.id && (
            <>
              <hr className="border-0 border-t border-paper-3 my-6" />
              <div className="flex justify-end">
                <button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="btn btn-danger text-xs font-bold gap-2 px-4 py-2"
                >
                  <Trash2 size={14} />
                  <span>{deleting ? 'DELETING...' : 'DELETE USER'}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {userDetail.role === 'owner' && (
          <div className="card border-paper-3 bg-paper-2 p-8">
            <div className="flex items-center gap-2 mb-6 text-ink">
              <Store size={20} className="text-accent" />
              <h3 className="text-sm tracking-wider font-bold uppercase">STORE OWNERSHIP</h3>
            </div>

            {userDetail.store ? (
              <div className="flex flex-col gap-6">
                <div>
                  <span className="block text-xs font-bold text-ink-2 mb-2 tracking-wider">ASSIGNED STORE</span>
                  <h4 className="text-lg font-bold">{userDetail.store.name}</h4>
                  <span className="font-mono text-xs text-ink-2">ID: {userDetail.store.id}</span>
                </div>

                <div>
                  <span className="block text-xs font-bold text-ink-2 mb-2 tracking-wider">AVERAGE OVERALL RATING</span>
                  {userDetail.store.avgRating ? (
                    <div className="flex items-center gap-4 bg-paper p-4 rounded-md border border-border">
                      <span className="font-display text-3xl font-bold text-accent leading-none">{userDetail.store.avgRating}</span>
                      <div className="flex flex-col gap-1">
                        <StarRating value={parseFloat(userDetail.store.avgRating)} readOnly={true} size={18} />
                        <span className="text-xs text-ink-2">based on {userDetail.store.totalRatings} user reviews</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-ink-2 italic">
                      No ratings submitted yet for this store.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-sm text-ink-2">
                <p>This store owner does not have a store registered on the platform yet.</p>
                <button 
                  onClick={() => navigate('/admin/stores/new', { state: { defaultOwnerId: userDetail.id } })}
                  className="btn btn-primary text-xs font-bold w-fit px-4 py-2"
                >
                  CREATE STORE NOW
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserDetail;
