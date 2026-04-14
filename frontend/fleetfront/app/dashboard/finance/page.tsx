"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Banknote, Loader2, Plus, Bell, TrendingUp, TrendingDown } from "lucide-react";
import { ApiResponse } from '@/lib/api';

const API_BASE_URL = 'http://localhost:3000/api';

export default function FinanceDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'INCOME',
    category: '',
    description: ''
  });

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const orgId = typeof window !== 'undefined' ? localStorage.getItem('orgId') : null;
      const res = await fetch(`${API_BASE_URL}/finance/summary`, {
        headers: orgId ? { 'x-organization-id': orgId } : {}
      });
      const data = await res.json();
      if (res.ok) setSummary(data.data);
    } catch (error) {
      console.error("Failed to fetch finance summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const orgId = typeof window !== 'undefined' ? localStorage.getItem('orgId') : null;
      const res = await fetch(`${API_BASE_URL}/finance/record`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(orgId ? { 'x-organization-id': orgId } : {})
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error);
      } else {
        setIsAdding(false);
        setFormData({ amount: '', type: 'INCOME', category: '', description: '' });
        fetchSummary();
      }
    } catch (error) {
        setSubmitError('An unexpected error occurred.');
    }
  };

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center -m-6 h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-[#8C877D]" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C877D]">Aggregating Financials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#FBFBF9] text-[#1A1A1A] font-sans h-full">
        {/* TOP BAR */}
        <header className="flex items-center justify-between p-6 border-b border-[#EBE6DD] bg-[#FBFBF9]/80 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-lg font-light tracking-wide">Financial Hub</h2>
          <div className="flex items-center gap-6">
            <Bell className="w-4 h-4 text-[#8C877D]" />
            <div className="w-8 h-8 bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-serif italic">A</div>
          </div>
        </header>

        <div className="p-6 md:p-12 lg:p-16 flex-1 overflow-auto">
          {/* HEADER AREA */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2">Yield & Expenditures</h3>
              <h2 className="text-5xl font-['Playfair_Display',serif] tracking-tighter">Finance Ledger.</h2>
            </div>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} className="bg-[#1A1A1A] text-white rounded-none text-[10px] tracking-[0.2em] uppercase px-8 py-6 group flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#C4BFAF] group-hover:text-white transition-colors" />
                Record Transaction
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="border-[#EBE6DD] shadow-none bg-white rounded-none border-l-4 border-l-[#4A5D23]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Gross Revenue</CardTitle>
                <TrendingUp className="w-4 h-4 text-[#4A5D23]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light font-['Playfair_Display',serif]">₹{summary?.revenue?.toLocaleString() || '0'}</div>
              </CardContent>
            </Card>

            <Card className="border-[#EBE6DD] shadow-none bg-white rounded-none border-l-4 border-l-[#8B3A3A]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Operating Expenses</CardTitle>
                <TrendingDown className="w-4 h-4 text-[#8B3A3A]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light font-['Playfair_Display',serif]">₹{summary?.expenses?.toLocaleString() || '0'}</div>
              </CardContent>
            </Card>

            <Card className="border-[#EBE6DD] shadow-none bg-white rounded-none border-l-4 border-l-[#1A1A1A]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Net Profit</CardTitle>
                <Banknote className="w-4 h-4 text-[#1A1A1A]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light font-['Playfair_Display',serif]">₹{summary?.profit?.toLocaleString() || '0'}</div>
              </CardContent>
            </Card>
          </div>

          {isAdding ? (
            <Card className="border-[#EBE6DD] shadow-none rounded-none bg-white mb-16 max-w-2xl">
              <CardHeader className="border-b border-[#EBE6DD] pb-6">
                <CardTitle className="font-['Playfair_Display',serif] text-2xl">New Transaction</CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleRecord} className="flex flex-col gap-6">
                  {submitError && <p className="text-[#8B3A3A] bg-[#FDF4F4] border border-[#F4DADA] px-4 py-2 text-xs uppercase tracking-widest">{submitError}</p>}
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Transaction Flow</label>
                    <select 
                      value={formData.type} 
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="border border-[#EBE6DD] p-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-transparent rounded-none"
                    >
                      <option value="INCOME">INCOME (Yield)</option>
                      <option value="EXPENSE">EXPENSE (Cost)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Amount (₹)</label>
                    <input 
                      type="number" required min="1" step="0.01"
                      value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="border border-[#EBE6DD] p-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-transparent rounded-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Category</label>
                    <input 
                      type="text" required placeholder="e.g. Fuel, Maintenance, Dispatch Invoice..."
                      value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="border border-[#EBE6DD] p-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-transparent rounded-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Optional Details</label>
                    <input 
                      type="text"
                      value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="border border-[#EBE6DD] p-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-transparent rounded-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={loading} className="bg-[#1A1A1A] text-white rounded-none text-[10px] tracking-[0.2em] uppercase px-10 py-6">
                      Add to Ledger
                    </Button>
                    <Button type="button" onClick={() => setIsAdding(false)} variant="outline" className="rounded-none text-[10px] tracking-[0.2em] uppercase px-10 py-6 border-[#EBE6DD]">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-[#EBE6DD] shadow-none rounded-none bg-white">
              <CardHeader className="border-b border-[#EBE6DD] pb-8 flex flex-row items-center justify-between">
                <CardTitle className="font-['Playfair_Display',serif] text-2xl flex items-center gap-3">
                  <Banknote className="w-5 h-5 text-[#8C877D]" />
                  Statement of Account
                </CardTitle>
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Recent 50</div>
              </CardHeader>
              <CardContent className="pt-0 px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#EBE6DD] hover:bg-transparent px-8">
                      <TableHead className="pl-8 text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Date</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Category</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Details</TableHead>
                      <TableHead className="pr-8 text-right text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary?.recentActivity?.length > 0 ? summary.recentActivity.map((t: any) => (
                      <TableRow key={t.id} className="border-[#F5F2ED] hover:bg-[#FBFBF9] transition-colors px-8">
                        <TableCell className="pl-8 font-mono text-sm py-6 text-[#8C877D]">
                            {new Date(t.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-[10px] uppercase tracking-widest text-[#1A1A1A] font-bold">
                          {t.category}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-medium tracking-wider text-[#C4BFAF]">
                          {t.description || '-'}
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          <span className={`text-sm font-semibold tracking-wider ${t.type === 'INCOME' ? 'text-[#4A5D23]' : 'text-[#8B3A3A]'}`}>
                            {t.type === 'INCOME' ? '+' : '-'}₹{t.amount.toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={4} className="text-center py-20 text-[#C4BFAF] italic">No ledgers entries posted.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
    </div>
  );
}
