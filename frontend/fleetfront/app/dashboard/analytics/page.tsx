"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, TrendingDown, RefreshCw, BarChart2, Calendar } from 'lucide-react'
import { analyticsAPI } from '@/lib/api'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend 
} from 'recharts'

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<string>('monthly')
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const fetchReport = async () => {
    setLoading(true)
    const res = await analyticsAPI.getReport(period, dateRange.start, dateRange.end)
    if (!res.error && res.data) {
       setReport(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (period !== 'custom') {
       fetchReport()
    } else if (dateRange.start && dateRange.end) {
       fetchReport()
    }
  }, [period, dateRange])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#FFFFFF] border border-[#DCD7CB] p-4 shadow-xl">
          <p className="text-[10px] uppercase tracking-widest text-[#8C877D] mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
             <p key={index} className="text-sm font-medium text-[#1A1A1A]">
                {entry.name}: {entry.name === 'Revenue' || entry.name === 'Profit' || entry.name === 'Expenses' ? '₹' : ''}{entry.value}
             </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading && !report) {
     return (
        <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#1A1A1A]" strokeWidth={1} />
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#1A1A1A] font-sans p-6 md:p-12 lg:p-16">
       
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-[#DCD7CB] pb-8 gap-6">
          <div>
             <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8C877D] mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4" strokeWidth={1} /> Global Telemetry
             </h3>
             <h1 className="text-5xl font-['Playfair_Display',_serif] tracking-tight text-[#1A1A1A]">Visualization & Reports.</h1>
          </div>
          
          <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                {['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifetime', 'custom'].map((p) => (
                   <button 
                      key={p} 
                      onClick={() => setPeriod(p)}
                      className={`px-4 py-2 text-[9px] uppercase tracking-[0.2em] font-bold whitespace-nowrap transition-colors border ${period === p ? 'bg-[#1A1A1A] text-[#F9F8F4] border-[#1A1A1A]' : 'bg-transparent text-[#8C877D] border-[#DCD7CB] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'}`}
                   >
                      {p}
                   </button>
                ))}
             </div>
             {period === 'custom' && (
                <div className="flex gap-2">
                   <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({...p, start: e.target.value}))} className="px-3 py-2 border border-[#DCD7CB] bg-transparent text-sm focus:outline-none focus:border-[#1A1A1A]" />
                   <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({...p, end: e.target.value}))} className="px-3 py-2 border border-[#DCD7CB] bg-transparent text-sm focus:outline-none focus:border-[#1A1A1A]" />
                </div>
             )}
          </div>
       </div>

       {report && (
          <div className="animate-in fade-in duration-700">
             
             {/* Key Metrics Summary */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                   { label: 'Total Revenue', value: `₹${report.summary.totalRevenue.toLocaleString()}` },
                   { label: 'Total Profit', value: `₹${report.summary.totalProfit.toLocaleString()}` },
                   { label: 'Total Trips Managed', value: report.summary.totalTrips },
                   { label: 'Passenger Volume', value: report.summary.totalPassengers },
                ].map((stat, i) => (
                   <Card key={i} className="border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none">
                      <CardHeader className="pb-2">
                         <CardTitle className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">
                            {stat.label}
                         </CardTitle>
                      </CardHeader>
                      <CardContent>
                         <div className="text-3xl font-light font-['Playfair_Display',_serif] text-[#1A1A1A]">
                            {stat.value}
                         </div>
                      </CardContent>
                   </Card>
                ))}
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Financial Overview Chart */}
                <Card className="border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none">
                   <CardHeader className="border-b border-[#DCD7CB] pb-6">
                      <CardTitle className="font-['Playfair_Display',_serif] text-2xl text-[#1A1A1A]">Financial Overview</CardTitle>
                      <p className="text-xs font-light tracking-wide text-[#8C877D] mt-2">Revenue, Expenses, and Profit trends.</p>
                   </CardHeader>
                   <CardContent className="pt-8 h-[400px]">
                      {loading ? (
                         <div className="h-full flex items-center justify-center border border-dashed border-[#DCD7CB]">
                             <Loader2 className="w-5 h-5 animate-spin text-[#8C877D]" strokeWidth={1} />
                         </div>
                      ) : (
                         <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={report.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                             <defs>
                               <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.1}/>
                                 <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
                               </linearGradient>
                               <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#14532d" stopOpacity={0.1}/>
                                 <stop offset="95%" stopColor="#14532d" stopOpacity={0}/>
                               </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCD7CB" />
                             <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8C877D' }} dy={10} />
                             <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8C877D' }} />
                             <Tooltip content={<CustomTooltip />} />
                             <Legend iconType="square" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                             <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#1A1A1A" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                             <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#7f1d1d" strokeWidth={1} strokeDasharray="4 4" fill="none" />
                             <Area type="monotone" dataKey="profit" name="Profit" stroke="#14532d" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                           </AreaChart>
                         </ResponsiveContainer>
                      )}
                   </CardContent>
                </Card>

                {/* Operations & Logistics Chart */}
                <Card className="border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none">
                   <CardHeader className="border-b border-[#DCD7CB] pb-6">
                      <CardTitle className="font-['Playfair_Display',_serif] text-2xl text-[#1A1A1A]">Operations & Logistics</CardTitle>
                      <p className="text-xs font-light tracking-wide text-[#8C877D] mt-2">Volume of trips dispatched and completed.</p>
                   </CardHeader>
                   <CardContent className="pt-8 h-[400px]">
                      {loading ? (
                         <div className="h-full flex items-center justify-center border border-dashed border-[#DCD7CB]">
                             <Loader2 className="w-5 h-5 animate-spin text-[#8C877D]" strokeWidth={1} />
                         </div>
                      ) : (
                         <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={report.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={2}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCD7CB" />
                             <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8C877D' }} dy={10} />
                             <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8C877D' }} allowDecimals={false} />
                             <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9F8F4' }} />
                             <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                             <Bar dataKey="totalTrips" name="Total Dispatched" fill="#DCD7CB" radius={[2, 2, 0, 0]} />
                             <Bar dataKey="completedTrips" name="Completed Valid" fill="#1A1A1A" radius={[2, 2, 0, 0]} />
                           </BarChart>
                         </ResponsiveContainer>
                      )}
                   </CardContent>
                </Card>
                
             </div>
          </div>
       )}
    </div>
  )
}
