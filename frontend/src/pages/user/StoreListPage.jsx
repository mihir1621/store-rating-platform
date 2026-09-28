import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';
import FilterBar from '../../components/FilterBar';
import StarRating from '../../components/StarRating';
import { useToast } from '../../context/ToastContext';
import { Search, Star, RefreshCw, X, MessageSquare } from 'lucide-react';

const StoreListPage = () => {
  const toast = useToast();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    name: '',
    address: '',
  });

  const [selectedStore, setSelectedStore] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      setError('Failed to fetch stores. Please refresh.');
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

  const openRatingModal = (store) => {
    setSelectedStore(store);
    setRatingValue(store.userRating ? store.userRating.value : 5);
    setSubmitError('');
    setModalOpen(true);
  };

  const closeRatingModal = () => {
    setSelectedStore(null);
    setModalOpen(false);
  };

  const handleRatingSubmit = async () => {
    setSubmitError('');
    setSubmitting(true);
    try {
      if (selectedStore.userRating) {
        await api.patch(`/ratings/${selectedStore.userRating.id}`, { value: ratingValue });
        toast.success(`Rating for "${selectedStore.name}" updated successfully!`);
      } else {
        await api.post('/ratings', { storeId: selectedStore.id, value: ratingValue });
        toast.success(`Thank you for rating "${selectedStore.name}"!`);
      }
      closeRatingModal();
      fetchStores();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to submit rating. Please try again.';
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Store Name', sortable: true },
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
            <span className="text-xs text-ink-2 italic">No ratings yet</span>
          )}
        </div>
      )
    },
    {
      key: 'userRating',
      label: 'Your Rating',
      sortable: true,
      sortMethod: (a, b) => {
        const ratingA = a.userRating ? a.userRating.value : 0;
        const ratingB = b.userRating ? b.userRating.value : 0;
        return ratingA - ratingB;
      },
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.userRating ? (
            <>
              <StarRating value={row.userRating.value} readOnly={true} size={14} />
              <span className="inline-block px-2 py-0.5 border border-focus text-accent bg-paper rounded-sm font-mono text-[10px] font-bold animate-badge-pop">RATED</span>
            </>
          ) : (
            <span className="text-xs text-ink-2 italic">Not rated</span>
          )}
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      width: '140px',
      render: (row) => (
        <button
          onClick={() => openRatingModal(row)}
          className={`btn text-xs font-bold px-4 py-2 ${row.userRating ? 'btn-secondary' : 'btn-green'}`}
        >
          {row.userRating ? 'EDIT RATING' : 'RATE STORE'}
        </button>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="animate-slide-up">
        <h1 className="text-2xl tracking-wider mb-1">STORE PLATFORM</h1>
        <p className="text-sm text-ink-2">Browse registered stores and share your feedback and experience</p>
      </div>

      <div className="card px-6 py-5 border-paper-3 bg-paper-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-accent" />
            <h3 className="text-sm tracking-wider font-bold text-ink">SEARCH REGISTERED STORES</h3>
          </div>
          {(filters.name || filters.address) && (
            <button onClick={() => setFilters({ name: '', address: '' })} className="inline-flex items-center gap-1 bg-transparent border-none text-danger font-mono text-xs font-bold cursor-pointer hover:underline transition-all duration-200 hover:scale-105 active:scale-95">
              <X size={14} className="transition-transform duration-200 hover:rotate-90" />
              <span>CLEAR FILTERS</span>
            </button>
          )}
        </div>

        <FilterBar
          fields={[
            { key: 'name', placeholder: 'Search by Name', type: 'text' },
            { key: 'address', placeholder: 'Search by Address', type: 'text' }
          ]}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-ink-2 font-mono text-sm">
          <RefreshCw size={24} className="animate-spin-fast text-accent" />
          <span>RETRIEVING STORES...</span>
        </div>
      ) : (
        <SortableTable
          columns={columns}
          data={stores}
          defaultSortKey="name"
        />
      )}

      {modalOpen && selectedStore && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeRatingModal}>
          <div className="bg-paper border border-border rounded-[10px] p-8 w-full max-w-[440px] relative shadow-xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 bg-transparent border-none text-ink-2 cursor-pointer p-1 rounded-sm hover:text-ink transition-colors duration-150" onClick={closeRatingModal} aria-label="Close modal">
              <X size={18} />
            </button>

            <div className="text-center mb-6">
              <MessageSquare size={32} className="text-accent mx-auto mb-2" />
              <h2 className="text-xl tracking-wider mb-1">{selectedStore.userRating ? 'EDIT RATING' : 'RATE STORE'}</h2>
              <p className="text-sm text-ink-2">Share your score for <strong>{selectedStore.name}</strong></p>
            </div>

            {submitError && <div className="alert alert-danger mb-4">{submitError}</div>}

            <div>
              <div className="flex justify-center py-4 mb-8">
                <StarRating
                  value={ratingValue}
                  onChange={(val) => setRatingValue(val)}
                  readOnly={false}
                  size={36}
                />
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={closeRatingModal}
                  className="btn btn-secondary flex-1"
                  disabled={submitting}
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleRatingSubmit}
                  className="btn btn-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? 'SUBMITTING...' : 'SUBMIT RATING'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreListPage;
