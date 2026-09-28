import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';
import FilterBar from '../../components/FilterBar';
import { UserPlus, Search, RefreshCw, X } from 'lucide-react';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: '',
  });

  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;
      if (filters.role) params.role = filters.role;

      const response = await api.get('/users', { params });
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch user list. Please reload.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 350);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ name: '', email: '', address: '', role: '' });
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { 
      key: 'role', 
      label: 'Role', 
      sortable: true,
      render: (row) => {
        let badgeColor = '';
        if (row.role === 'admin') {
          badgeColor = 'bg-paper border-border text-ink';
        } else if (row.role === 'owner') {
          badgeColor = 'bg-paper border-focus text-accent';
        } else {
          badgeColor = 'bg-paper border-success/30 text-success';
        }
        return (
          <span className={`inline-block px-3 py-1 rounded-sm font-mono text-xs font-bold border ${badgeColor}`}>
            {row.role.toUpperCase()}
          </span>
        );
      }
    },
  ];

  const handleRowClick = (row) => {
    navigate(`/admin/users/${row.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl tracking-wider mb-1">SYSTEM USERS</h1>
          <p className="text-sm text-ink-2">Manage, query, and review registered platform users</p>
        </div>
        <button 
          onClick={() => navigate('/admin/users/new')}
          className="btn btn-primary font-display font-bold text-xs tracking-wider gap-2 px-5 py-3"
        >
          <UserPlus size={16} />
          <span>CREATE USER</span>
        </button>
      </div>

      <div className="card px-6 py-5 border-paper-3 bg-paper-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-accent" />
            <h3 className="text-sm tracking-wider font-bold text-ink">FILTER USERS</h3>
          </div>
          {(filters.name || filters.email || filters.address || filters.role) && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1 bg-transparent border-none text-danger font-mono text-xs font-bold cursor-pointer hover:underline">
              <X size={14} />
              <span>CLEAR FILTERS</span>
            </button>
          )}
        </div>

        <FilterBar
          fields={[
            { key: 'name', placeholder: 'Search Name', type: 'text' },
            { key: 'email', placeholder: 'Search Email', type: 'text' },
            { key: 'address', placeholder: 'Search Address', type: 'text' },
            { 
              key: 'role', 
              placeholder: 'All Roles', 
              type: 'select',
              options: [
                { value: 'admin', label: 'Administrator' },
                { value: 'user', label: 'Normal User' },
                { value: 'owner', label: 'Store Owner' }
              ]
            }
          ]}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-ink-2 font-mono text-sm">
          <RefreshCw size={24} className="animate-spin-fast text-accent" />
          <span>LOADING USERS...</span>
        </div>
      ) : (
        <SortableTable
          columns={columns}
          data={users}
          defaultSortKey="name"
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
};

export default AdminUserList;
