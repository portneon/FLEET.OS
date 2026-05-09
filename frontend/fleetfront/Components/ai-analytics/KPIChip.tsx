import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface KPICard {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'red' | 'blue' | 'amber' | 'purple';
}

const colorMap = {
  green:  { bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  red:    { bg: 'bg-red-50',      text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500' },
  blue:   { bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500' },
  amber:  { bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  purple: { bg: 'bg-purple-50',   text: 'text-purple-700',  border: 'border-purple-200',  dot: 'bg-purple-500' },
};

export function KPIChip({ label, value, trend, color = 'blue' }: KPICard) {
  const c = colorMap[color];
  return (
    <div className={`flex flex-col gap-1.5 px-4 py-4 ${c.bg} border ${c.border} rounded-xl`}>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] uppercase tracking-wider font-semibold ${c.text} opacity-70`}>{label}</span>
        {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
        {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
        {trend === 'neutral' && <Minus className="w-4 h-4 text-[#8C877D]" />}
      </div>
      <span className={`text-2xl font-bold ${c.text} leading-none tracking-tight`}>{value}</span>
    </div>
  );
}
