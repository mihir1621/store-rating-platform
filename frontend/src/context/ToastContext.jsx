import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-[380px] pointer-events-none">
        {toasts.map((t) => {
          let typeClasses = '';
          let Icon = Info;

          if (t.type === 'success') {
            typeClasses = 'bg-paper-2 border-success/30 text-ink';
            Icon = CheckCircle;
          } else if (t.type === 'error') {
            typeClasses = 'bg-paper-2 border-danger/30 text-ink';
            Icon = AlertCircle;
          } else if (t.type === 'warning') {
            typeClasses = 'bg-paper-2 border-focus/30 text-ink';
            Icon = AlertCircle;
          } else {
            typeClasses = 'bg-paper-2 border-border text-ink';
            Icon = Info;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-md shadow-md border transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-4 ${typeClasses}`}
              role="alert"
            >
              <div className="mt-0.5 flex-shrink-0">
                {t.type === 'success' && <Icon className="text-success" size={18} />}
                {t.type === 'error' && <Icon className="text-danger" size={18} />}
                {t.type === 'warning' && <Icon className="text-accent" size={18} />}
                {t.type === 'info' && <Icon className="text-accent" size={18} />}
              </div>
              <div className="flex-1 text-sm font-medium tracking-wide leading-snug">{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 bg-transparent border-none text-ink-2 hover:text-ink cursor-pointer p-0.5 transition-colors duration-150"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
