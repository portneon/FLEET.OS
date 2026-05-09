import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

export interface ChartSpec {
  type: 'bar' | 'line' | 'area' | 'pie' | 'donut';
  title: string;
  data: { label: string; value: number; [key: string]: any }[];
  xKey: string;
  yKey: string;
}

const PALETTE = ['#1A1A1A', '#4A90D9', '#50C878', '#FF6B6B', '#FFB347', '#9B59B6', '#2ECC71', '#E74C3C'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A1A] text-white px-3 py-2 text-xs rounded shadow-xl">
      <p className="font-semibold mb-1 text-[#DCD7CB]">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color ?? '#fff' }}>
          {typeof entry.value === 'number'
            ? entry.value % 1 !== 0 ? entry.value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : entry.value.toLocaleString()
            : entry.value}
        </p>
      ))}
    </div>
  );
};

export function DynamicChart({ spec }: { spec: ChartSpec }) {
  const { type, data, xKey, yKey } = spec;
  const tickStyle = { fontSize: 10, fill: '#8C877D' };

  if (type === 'pie' || type === 'donut') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%"
            innerRadius={type === 'donut' ? 55 : 0}
            outerRadius={80} paddingAngle={type === 'donut' ? 4 : 0}
            dataKey={yKey} nameKey={xKey}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EFEA" />
          <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={tickStyle} dy={8} />
          <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey={yKey} stroke="#1A1A1A" strokeWidth={2.5}
            dot={{ r: 3, fill: '#1A1A1A', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#1A1A1A' }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EFEA" />
          <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={tickStyle} dy={8} />
          <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey={yKey} stroke="#1A1A1A" strokeWidth={2}
            fill="url(#areaGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Bar (default)
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EFEA" />
        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={tickStyle} dy={8} />
        <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F5F0' }} />
        <Bar dataKey={yKey} fill="#1A1A1A" radius={[3, 3, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
