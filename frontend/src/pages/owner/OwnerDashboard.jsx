import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';
import StarRating from '../../components/StarRating';
import { Store, Star, MessageSquare, RefreshCw, HelpCircle } from 'lucide-react';

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    storeName: '',
    avgRating: null,
    ratings: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/ratings/my-store');
      setDashboardData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Failed to fetch store owner metrics. Please reload.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const columns = [
    { 
      key: 'userName', 
      label: 'Customer Name', 
      sortable: true,
      sortMethod: (a, b) => {
        const nameA = a.User?.name || '';
        const nameB = b.User?.name || '';
        return nameA.localeCompare(nameB);
      },
      render: (row) => <span>{row.User?.name || 'Anonymous Customer'}</span>
    },
    { 
      key: 'userEmail', 
      label: 'Email Address', 
      sortable: true,
      sortMethod: (a, b) => {
        const emailA = a.User?.email || '';
        const emailB = b.User?.email || '';
        return emailA.localeCompare(emailB);
      },
      render: (row) => <span>{row.User?.email || 'N/A'}</span>
    },
    { 
      key: 'value', 
      label: 'Submitted Score', 
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <StarRating value={row.value} readOnly={true} size={14} />
          <span className="font-mono text-xs font-bold text-ink-2">{row.value} Stars</span>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Submission Date',
      sortable: true,
      render: (row) => {
        const date = new Date(row.createdAt);
        return <span>{date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>;
      }
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-4 min-h-[50vh] text-ink-2 font-mono text-sm">
        <RefreshCw size={24} className="animate-spin-fast text-accent" />
        <span>LOADING OWNER DASHBOARD...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="max-w-[460px] mx-auto text-center flex flex-col items-center gap-4 border border-border bg-paper-2 rounded-lg p-8">
          <HelpCircle size={48} className="text-danger" />
          <h2 className="text-lg tracking-wider font-bold">DASHBOARD ERROR</h2>
          <p className="alert alert-danger w-full">{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">
            RETRY LOADING
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Header (Light) */}
      <div className="container mx-auto px-4 pt-8 pb-2 animate-slide-up">
        <span className="inline-block font-mono text-[10px] font-bold text-accent mb-1 tracking-widest">STORE PROFILE</span>
        <h1 className="text-3xl tracking-wider mb-1">{dashboardData.storeName.toUpperCase()}</h1>
        <p className="text-sm text-ink-2">Realtime consumer satisfaction statistics and scoring logs</p>
      </div>

      {/* Stats Band (Graphite/Dark) */}
      <div className="w-full bg-graphite py-10 border-y border-border/10 text-white my-6 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-white/10 bg-white/5 p-8 rounded-lg md:col-span-2 flex flex-col gap-3 hover:border-accent transition-colors duration-250 ease-out">
              <div className="font-mono text-xs font-bold tracking-wider text-white/85">OVERALL SATISFACTION</div>
              {dashboardData.avgRating ? (
                <div className="flex items-center gap-5">
                  <span className="font-display text-4xl font-bold text-white leading-none">{dashboardData.avgRating}</span>
                  <div className="flex flex-col gap-1">
                    <StarRating value={parseFloat(dashboardData.avgRating)} readOnly={true} size={20} />
                    <span className="text-xs text-white/70">
                      Average score from {dashboardData.ratings.length} user reviews
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="font-display text-4xl font-bold text-white/50 leading-none">—</span>
                  <span className="text-xs text-white/70">
                    No customer reviews submitted yet.
                  </span>
                </div>
              )}
            </div>

            <div className="border border-white/10 bg-white/5 p-8 rounded-lg flex flex-col gap-3 hover:border-accent transition-colors duration-250 ease-out">
              <div className="font-mono text-xs font-bold tracking-wider text-white/85">TOTAL REVIEWS</div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-white leading-none">{dashboardData.ratings.length}</span>
                <span className="font-mono text-xs font-bold text-white/85">SUBMISSIONS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews table (Light) */}
      <div className="container mx-auto px-4 pb-8 flex flex-col gap-4">
        <h2 className="text-sm tracking-wider text-ink-2 font-bold uppercase">REVIEWS LOG</h2>
        <SortableTable
          columns={columns}
          data={dashboardData.ratings}
          defaultSortKey="createdAt"
        />
      </div>
    </div>
  );
};

export default OwnerDashboard;
