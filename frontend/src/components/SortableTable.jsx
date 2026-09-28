import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const SortableTable = ({ columns, data, defaultSortKey = '', onRowClick }) => {
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleHeaderClick = (key, sortable) => {
    if (!sortable) return;

    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    const column = columns.find(col => col.key === sortKey);
    const customSort = column?.sortMethod;

    return [...data].sort((a, b) => {
      if (customSort) {
        return sortDirection === 'asc' ? customSort(a, b) : customSort(b, a);
      }

      let valA = a[sortKey];
      let valB = b[sortKey];

      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDirection, columns]);

  return (
    <div className="overflow-x-auto border border-border rounded-md w-full">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => {
              const isCurrentSort = sortKey === col.key;
              const isSortable = col.sortable !== false;
              return (
                <th
                  key={col.key}
                  onClick={() => handleHeaderClick(col.key, col.sortable !== false)}
                  style={{ width: col.width || 'auto' }}
                  className={`bg-paper-2 font-display font-bold text-xs uppercase tracking-wider text-ink py-4 px-6 select-none transition-colors duration-150 ${
                    isSortable ? 'cursor-pointer hover:bg-paper-3' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {isSortable && (
                      <span className="inline-flex text-accent min-w-[14px]">
                        {isCurrentSort ? (
                          sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <span className="inline-block w-[14px] h-[14px]" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-ink-2 font-display font-medium">
                No items match the query.
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
              <tr
                key={row.id || index}
                onClick={() => onRowClick && onRowClick(row)}
                className={`border-b border-border last:border-b-0 even:bg-paper-2/40 hover:bg-paper-3/80 transition-all duration-200 ${
                  onRowClick ? 'cursor-pointer' : 'cursor-default'
                } animate-row-enter opacity-0 anim-delay-${Math.min(index + 1, 10)}`}
                style={{ animationFillMode: 'forwards' }}
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-4 px-6 text-sm text-ink leading-relaxed">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SortableTable;
