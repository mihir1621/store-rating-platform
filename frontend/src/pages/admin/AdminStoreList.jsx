import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';
import FilterBar from '../../components/FilterBar';
import StarRating from '../../components/StarRating';
import { PlusSquare, Search, RefreshCw, X } from 'lucide-react';

const AdminStoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    name: '',
    address: '',
  });

  const navigate = useNavigate();

  const fetchStores = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.name) params.name = filters.name;
      if (filters.address) params.address = filters.address;

      const response = await api.get('/stores', { params });
      setStores(response.data);
    } catch (err) {
      setError('Failed to fetch stores. Please reload.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 350);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ name: '', address: '' });
  };

  const columns = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'avgRating',
      label: 'Overall Rating',
      sortable: true,
      sortMethod: (a, b) => {
        const ratingA = a.avgRating ? parseFloat(a.avgRating) : 0;
        const ratingB = b.avgRating ? parseFloat(b.avgRating) : 0;
        return ratingA - ratingB;
      },
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.avgRating ? (
            <>
              <StarRating value={parseFloat(row.avgRating)} readOnly={true} size={14} />
              <span className="font-mono text-xs font-bold text-accent">({parseFloat(row.avgRating).toFixed(1)})</span>
            </>
          ) : (
            <span className="text-xs text-ink-2 italic">No ratings</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl tracking-wider mb-1">REGISTERED STORES</h1>
          <p className="text-sm text-ink-2">Manage stores and view their customer satisfaction reviews</p>
        </div>
        <button 
          onClick={() => navigate('/admin/stores/new')}
          className="btn btn-primary header-action-btn font-display font-bold text-xs tracking-wider gap-2 px-5 py-3"
        >
          <PlusSquare size={16} />
          <span>CREATE STORE</span>
        </button>
      </div>

      <div className="card px-6 py-5 border-paper-3 bg-paper-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-accent" />
            <h3 className="text-sm tracking-wider font-bold text-ink">FILTER STORES</h3>
          </div>
          {(filters.name || filters.address) && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1 bg-transparent border-none text-danger font-mono text-xs font-bold cursor-pointer hover:underline">
              <X size={14} />
              <span>CLEAR FILTERS</span>
            </button>
          )}
        </div>

        <FilterBar
          fields={[
            { key: 'name', placeholder: 'Search Store Name', type: 'text' },
            { key: 'address', placeholder: 'Search Address', type: 'text' }
          ]}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-ink-2 font-mono text-sm">
          <RefreshCw size={24} className="animate-spin-fast text-accent" />
          <span>LOADING STORES...</span>
        </div>
      ) : (
        <SortableTable
          columns={columns}
          data={stores}
          defaultSortKey="name"
        />
      )}
    </div>
  );
};

export default AdminStoreList;
