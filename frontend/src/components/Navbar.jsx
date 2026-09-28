import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, Key, Store, Users, User, Search } from 'lucide-react';
import CommandPalette from './CommandPalette';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const linkClass = (path) => {
    const isActive = location.pathname === path;
    return `inline-flex items-center gap-2 font-display text-sm font-bold py-2 px-1 relative transition-all duration-250 ease-out ${
      isActive ? 'text-accent' : 'text-ink-2 hover:text-ink hover:-translate-y-px'
    }`;
  };

  const activeIndicator = (path) => {
    const isActive = location.pathname === path;
    return (
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-accent rounded-full transition-all duration-300 ease-out"
        style={{
          width: isActive ? '100%' : '0%',
          opacity: isActive ? 1 : 0,
          boxShadow: isActive ? '0 0 8px oklch(70% 0.2 290 / 0.5)' : 'none'
        }}
      />
    );
  };

  if (!user) {
    return (
      <header className="bg-paper border-b border-paper-3 sticky top-0 z-50 h-[70px] flex items-center animate-slide-down">
        <div className="container mx-auto px-4 flex items-center justify-between h-full">
          <Link to="/login" className="font-display font-bold text-lg tracking-wider text-ink hover:opacity-80 transition-opacity duration-150">
            <span>STORE RATINGS</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/login" className={linkClass('/login')}>
              <span>LOGIN</span>
              {activeIndicator('/login')}
            </Link>
            <Link to="/signup" className={linkClass('/signup')}>
              <span>SIGNUP</span>
              {activeIndicator('/signup')}
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-paper border-b border-paper-3 sticky top-0 z-50 h-auto md:h-[70px] py-4 md:py-0 flex items-center animate-slide-down">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 h-full">
        <Link 
          to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'owner' ? '/owner/dashboard' : '/stores'} 
          className="font-display font-bold text-lg tracking-wider text-ink hover:opacity-80 transition-opacity duration-150"
        >
          <span>STORE RATINGS</span>
        </Link>
        
        <nav className="flex flex-wrap items-center justify-center gap-6">
          {user.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                <Shield size={16} className={location.pathname === '/admin/dashboard' ? 'text-accent opacity-100' : 'opacity-70'} />
                <span>STATS</span>
                {activeIndicator('/admin/dashboard')}
              </Link>
              <Link to="/admin/users" className={linkClass('/admin/users')}>
                <Users size={16} className={location.pathname === '/admin/users' ? 'text-accent opacity-100' : 'opacity-70'} />
                <span>USERS</span>
                {activeIndicator('/admin/users')}
              </Link>
              <Link to="/admin/stores" className={linkClass('/admin/stores')}>
                <Store size={16} className={location.pathname === '/admin/stores' ? 'text-accent opacity-100' : 'opacity-70'} />
                <span>STORES</span>
                {activeIndicator('/admin/stores')}
              </Link>
            </>
          )}

          {user.role === 'user' && (
            <Link to="/stores" className={linkClass('/stores')}>
              <Store size={16} className={location.pathname === '/stores' ? 'text-accent opacity-100' : 'opacity-70'} />
              <span>STORES</span>
              {activeIndicator('/stores')}
            </Link>
          )}

          {user.role === 'owner' && (
            <Link to="/owner/dashboard" className={linkClass('/owner/dashboard')}>
              <Shield size={16} className={location.pathname === '/owner/dashboard' ? 'text-accent opacity-100' : 'opacity-70'} />
              <span>MY STORE</span>
              {activeIndicator('/owner/dashboard')}
            </Link>
          )}

          <Link to="/change-password" className={linkClass('/change-password')}>
            <Key size={16} className={location.pathname === '/change-password' ? 'text-accent opacity-100' : 'opacity-70'} />
            <span>PASSWORD</span>
            {activeIndicator('/change-password')}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user && (
            <button 
              onClick={() => setIsPaletteOpen(true)}
              className="inline-flex items-center gap-2 bg-paper-2 border border-border rounded-md px-3.5 py-2 font-mono text-[10px] font-bold text-ink-2 hover:bg-paper-3 hover:border-ink-2 cursor-pointer transition-all duration-150 select-none"
              aria-label="Open command palette"
            >
              <Search size={14} className="text-accent" />
              <span>SEARCH</span>
              <kbd className="bg-paper px-1 py-0.5 rounded border border-border text-[9px]">⌘K</kbd>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-2 bg-paper-2 rounded-md max-w-[200px] border border-border">
            <User size={14} className="text-ink-2" />
            <div className="flex flex-col leading-none">
              <span className="font-mono text-[10px] font-bold text-accent mb-0.5">{user.role.toUpperCase()}</span>
              <span className="text-xs text-ink-2 overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px]" title={user.email}>{user.email}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="inline-flex items-center gap-2 bg-transparent border border-border rounded-md px-4 py-2 font-display text-xs font-bold text-ink cursor-pointer hover:bg-paper-3 hover:border-ink-2 hover:-translate-y-px active:scale-96 transition-all duration-250 ease-out" 
            aria-label="Log out"
          >
            <LogOut size={16} />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </header>
  );
};

export default Navbar;
