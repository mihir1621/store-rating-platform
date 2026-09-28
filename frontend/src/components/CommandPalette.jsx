import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Compass, Shield, Users, Store, Key, LogOut } from 'lucide-react';

const CommandPalette = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Auto-focus input when palette opens
  useEffect(() => {
    if (isOpen && user) {
      setSearch('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, user]);

  // Get available commands based on user role
  const getCommands = () => {
    if (!user) return [];
    const common = [
      {
        id: 'password',
        title: 'CHANGE PASSWORD',
        description: 'Update your account security details',
        icon: <Key size={16} />,
        action: () => { navigate('/change-password'); onClose(); }
      },
      {
        id: 'logout',
        title: 'LOGOUT',
        description: 'Sign out of your account session',
        icon: <LogOut size={16} />,
        action: () => { logout(); navigate('/login'); onClose(); }
      }
    ];

    if (user.role === 'admin') {
      return [
        {
          id: 'stats',
          title: 'GO TO STATISTICS DASHBOARD',
          description: 'View total users, stores, and ratings metrics',
          icon: <Shield size={16} />,
          action: () => { navigate('/admin/dashboard'); onClose(); }
        },
        {
          id: 'users',
          title: 'MANAGE SYSTEM USERS',
          description: 'View list of all administrators, owners, and customers',
          icon: <Users size={16} />,
          action: () => { navigate('/admin/users'); onClose(); }
        },
        {
          id: 'stores',
          title: 'MANAGE REGISTERED STORES',
          description: 'View list of all stores and assigned owners',
          icon: <Store size={16} />,
          action: () => { navigate('/admin/stores'); onClose(); }
        },
        {
          id: 'add-user',
          title: 'CREATE NEW USER ACCOUNT',
          description: 'Register a new administrator, owner, or normal user',
          icon: <Users size={16} />,
          action: () => { navigate('/admin/users/new'); onClose(); }
        },
        {
          id: 'add-store',
          title: 'REGISTER NEW STORE',
          description: 'Register a new physical store and assign an owner',
          icon: <Store size={16} />,
          action: () => { navigate('/admin/stores/new'); onClose(); }
        },
        ...common
      ];
    }

    if (user.role === 'owner') {
      return [
        {
          id: 'owner-dashboard',
          title: 'GO TO STORE PROFILE DASHBOARD',
          description: 'View store satisfaction score and reviews log',
          icon: <Store size={16} />,
          action: () => { navigate('/owner/dashboard'); onClose(); }
        },
        ...common
      ];
    }

    // Role === 'user'
    return [
      {
        id: 'stores-list',
        title: 'BROWSE STORES PLATFORM',
        description: 'Browse stores list, check overall scores, and rate stores',
        icon: <Store size={16} />,
        action: () => { navigate('/stores'); onClose(); }
      },
      ...common
    ];
  };

  const allCommands = getCommands();
  const filteredCommands = allCommands.filter(cmd => 
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  // Handle keyboard shortcuts (ArrowUp, ArrowDown, Enter, Escape)
  useEffect(() => {
    if (!isOpen || !user) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[activeIndex]) {
          filteredCommands[activeIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, filteredCommands, onClose, isOpen, user]);

  // Adjust scroll position to keep active item visible
  useEffect(() => {
    if (listRef.current && isOpen && user) {
      const activeEl = listRef.current.children[activeIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex, isOpen, user]);

  // If closed or no user, do not render
  if (!isOpen || !user) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-start justify-center z-9999 px-4 pt-[10vh]"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[560px] bg-paper border border-border rounded-lg shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-paper-2">
          <Search size={18} className="text-ink-2" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Type a command or navigate..."
            className="w-full bg-transparent border-none p-0 text-base text-ink outline-none focus:ring-0"
          />
          <span className="font-mono text-[10px] font-bold text-ink-2 bg-paper-3 px-2 py-0.5 rounded-sm border border-border tracking-wider select-none">
            ESC
          </span>
        </div>

        {/* Commands list */}
        <div 
          ref={listRef} 
          className="max-h-[320px] overflow-y-auto p-2 flex flex-col gap-1"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-sm text-ink-2 font-mono">
              NO MATCHES FOUND
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-md cursor-pointer transition-colors duration-100 ${
                    isActive 
                      ? 'bg-accent text-white' 
                      : 'bg-transparent text-ink hover:bg-paper-2'
                  }`}
                >
                  <div className={isActive ? 'text-white' : 'text-accent'}>
                    {cmd.icon}
                  </div>
                  <div className="flex flex-col flex-1 leading-tight">
                    <span className={`font-display text-sm font-bold tracking-wide ${isActive ? 'text-white' : 'text-ink'}`}>
                      {cmd.title}
                    </span>
                    <span className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-ink-2'}`}>
                      {cmd.description}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer tip */}
        <div className="px-4 py-2 bg-paper-2 border-t border-border flex items-center justify-between text-[10px] font-mono font-bold text-ink-2 tracking-wider">
          <div className="flex items-center gap-1.5">
            <Compass size={12} className="text-accent" />
            <span>NAVIGATION COMMAND PALETTE</span>
          </div>
          <div className="flex items-center gap-2">
            <span>↑↓ NAVIGATE</span>
            <span>ENTER SELECT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
