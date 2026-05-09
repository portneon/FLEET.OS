import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';

export interface TableSpec {
  title: string;
  columns: { key: string; label: string; type?: 'number' | 'currency' | 'percent' | 'string' }[];
  rows: Record<string, any>[];
}

export function DataTable({ spec }: { spec: TableSpec }) {
  const [expanded, setExpanded] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = [...spec.rows].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey], bv = b[sortKey];
    if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
    return sortDir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const rowsToShow = expanded ? sorted : sorted.slice(0, 6);
  const hasMore = spec.rows.length > 6;

  const formatCell = (val: any, type?: string): string => {
    if (val === null || val === undefined) return '\u2014';
    if (type === 'currency' && typeof val === 'number')
      return `\u20b9${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    if (type === 'percent' && typeof val === 'number') return `${val.toFixed(1)}%`;
    if (typeof val === 'number') return val % 1 !== 0 ? val.toFixed(2) : val.toLocaleString();
    if (val instanceof Date)
      return val.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    if (typeof val === 'string' && /\d{4}-\d{2}-\d{2}T/.test(val)) {
      try { return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
      catch { return val; }
    }
    return String(val);
  };

  return (
    <div className="border border-[#E5E3DD] rounded-xl overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#F9F8F4]">
              {spec.columns.map((col, i) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-4 py-3 text-[10px] uppercase tracking-wider font-semibold text-[#8C877D] cursor-pointer hover:text-[#1A1A1A] transition-colors select-none ${i === 0 ? 'text-left' : 'text-right'}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowsToShow.map((row, i) => (
              <tr key={i} className={`border-t border-[#F0EFEA] hover:bg-[#F9F8F4] transition-colors ${i % 2 === 0 ? '' : 'bg-[#FDFCF9]'}`}>
                {spec.columns.map((col, j) => (
                  <td key={col.key} className={`px-4 py-3 text-[#1A1A1A] ${j === 0 ? 'font-medium' : 'text-right text-[#4A4A4A]'}`}>
                    {formatCell(row[col.key], col.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full py-2.5 bg-[#F9F8F4] hover:bg-[#F0EFEA] text-[#8C877D] hover:text-[#1A1A1A] text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border-t border-[#F0EFEA]"
        >
          {expanded
            ? <><ChevronUp className="w-3.5 h-3.5" /> Show Less</>
            : <><ChevronDown className="w-3.5 h-3.5" /> Show All {spec.rows.length} Rows</>
          }
        </button>
      )}
    </div>
  );
}
