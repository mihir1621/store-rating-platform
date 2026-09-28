import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import { Users, Store, ArrowRight, UserPlus, PlusSquare } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (err) {
        setError('Failed to fetch dashboard metrics. Please reload.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col flex-1">
      {/* Header section (Light) */}
      <div className="container mx-auto px-4 pt-8 pb-2">
        <h1 className="text-2xl tracking-wider mb-1">ADMIN DASHBOARD</h1>
        <p className="text-sm text-ink-2">System metrics and configurations overview</p>
      </div>

      {error && (
        <div className="container mx-auto px-4">
          <div className="alert alert-danger my-4">{error}</div>
        </div>
      )}

      {/* Graphite stats band (Dark) */}
      <div className="w-full bg-graphite py-10 border-y border-border/10 text-white my-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-start gap-2 flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-lg p-6 hover:border-accent transition-colors duration-250 ease-out">
              {loading ? (
                <div className="w-[60px] h-[44px] bg-gradient-to-r from-white/10 via-white/20 to-white/10 bg-[length:200%_100%] animate-shimmer rounded-sm" />
              ) : (
                <div className="font-display text-4xl font-bold leading-none text-white">{stats.totalUsers}</div>
              )}
              <div className="font-mono text-xs font-bold tracking-wider text-white/85">TOTAL USERS</div>
            </div>

            <div className="flex flex-col items-start gap-2 flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-lg p-6 hover:border-accent transition-colors duration-250 ease-out">
              {loading ? (
                <div className="w-[60px] h-[44px] bg-gradient-to-r from-white/10 via-white/20 to-white/10 bg-[length:200%_100%] animate-shimmer rounded-sm" />
              ) : (
                <div className="font-display text-4xl font-bold leading-none text-white">{stats.totalStores}</div>
              )}
              <div className="font-mono text-xs font-bold tracking-wider text-white/85">TOTAL STORES</div>
            </div>

            <div className="flex flex-col items-start gap-2 flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-lg p-6 hover:border-accent transition-colors duration-250 ease-out">
              {loading ? (
                <div className="w-[60px] h-[44px] bg-gradient-to-r from-white/10 via-white/20 to-white/10 bg-[length:200%_100%] animate-shimmer rounded-sm" />
              ) : (
                <div className="font-display text-4xl font-bold leading-none text-white">{stats.totalRatings}</div>
              )}
              <div className="font-mono text-xs font-bold tracking-wider text-white/85">TOTAL RATINGS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions (Light) */}
      <div className="container mx-auto px-4 pb-8 flex flex-col gap-6">
        <h2 className="font-mono text-xs tracking-wider text-ink-2 font-bold uppercase">QUICK ACTIONS</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card flex flex-col gap-4 border-paper-3 bg-paper-2">
            <div className="flex items-center gap-3">
              <Users className="text-accent" size={24} />
              <h3 className="text-lg tracking-wider font-bold">MANAGE USERS</h3>
            </div>
            <p className="text-sm text-ink-2 flex-1">View, search, filter, and sort all registered users and administrators.</p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link to="/admin/users" className="btn btn-secondary flex-1 min-w-[120px] font-display text-xs font-bold gap-2 px-4 py-2">
                <span>VIEW USERS</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/admin/users/new" className="btn btn-primary flex-1 min-w-[120px] font-display text-xs font-bold gap-2 px-4 py-2">
                <UserPlus size={16} />
                <span>ADD USER</span>
              </Link>
            </div>
          </div>

          <div className="card flex flex-col gap-4 border-paper-3 bg-paper-2">
            <div className="flex items-center gap-3">
              <Store className="text-accent" size={24} />
              <h3 className="text-lg tracking-wider font-bold">MANAGE STORES</h3>
            </div>
            <p className="text-sm text-ink-2 flex-1">View the list of stores, overall ratings, and assign store owners.</p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link to="/admin/stores" className="btn btn-secondary flex-1 min-w-[120px] font-display text-xs font-bold gap-2 px-4 py-2">
                <span>VIEW STORES</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/admin/stores/new" className="btn btn-primary flex-1 min-w-[120px] font-display text-xs font-bold gap-2 px-4 py-2">
                <PlusSquare size={16} />
                <span>ADD STORE</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
