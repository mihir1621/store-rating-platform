import React from 'react';

const StatCard = ({ label, value, loading }) => {
  return (
    <div className="card flex flex-col items-start gap-2 flex-1 min-w-[200px]">
      {loading ? (
        <div className="w-[60px] h-[44px] bg-gradient-to-r from-paper-3 via-border to-paper-3 bg-[length:200%_100%] animate-shimmer rounded-sm" />
      ) : (
        <div className="font-display text-4xl font-bold leading-none text-ink">{value}</div>
      )}
      <div className="font-body text-xs font-bold tracking-wider text-ink-2">{label.toUpperCase()}</div>
    </div>
  );
};

export default StatCard;
