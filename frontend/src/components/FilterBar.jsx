import React from 'react';

const FilterBar = ({ fields, filters, onFilterChange }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6 w-full">
      {fields.map((field) => (
        <div key={field.key} className="flex-1 min-w-[180px]" style={{ width: field.width || 'auto' }}>
          {field.type === 'select' ? (
            <select
              value={filters[field.key] || ''}
              onChange={(e) => onFilterChange(field.key, e.target.value)}
              aria-label={field.placeholder}
              className="bg-paper-2 border border-border rounded-md px-3 py-2 text-sm w-full outline-none focus:bg-paper focus:border-accent focus:ring-3 focus:ring-focus hover:bg-paper-3 transition-colors duration-150 font-medium"
            >
              <option value="">{field.placeholder}</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={filters[field.key] || ''}
              onChange={(e) => onFilterChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              aria-label={field.placeholder}
              className="bg-paper-2 border border-border rounded-md px-3 py-2 text-sm w-full outline-none focus:bg-paper focus:border-accent focus:ring-3 focus:ring-focus hover:bg-paper-3 transition-colors duration-150"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default FilterBar;
