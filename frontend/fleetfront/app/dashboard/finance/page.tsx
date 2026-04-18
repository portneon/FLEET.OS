"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Banknote, Loader2, Plus, Bell, TrendingUp, TrendingDown, X } from "lucide-react";
import { financeAPI } from '@/lib/api';

export default function FinanceDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    type: 'INCOME',
    category: '',
    description: ''
  });

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    const res = await financeAPI.getSummary();
    if (!res.error && res.data) {
      setSummary(res.data);
    } else {
      console.error('Finance summary error:', res.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitLoading(true);
    try {
      const res = await financeAPI.addTransaction({
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        description: formData.description || undefined,
      });
      if (res.error) {
        setSubmitError(res.error);
      } else {
        setIsAdding(false);
        setFormData({ amount: '', type: 'INCOME', category: '', description: '' });
        fetchSummary();
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Shared Input Styles for the Luxury Form
  const inputStyle = "w-full bg-transparent border-b border-[#DCD7CB] py-4 text-[#1A1A1A] font-light text-base focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none placeholder:text-[#C4BFAF]";
  const labelStyle = "text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-1 block";

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-[#1A1A1A]" strokeWidth={1.5} />
          <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#8C877D]">Aggregating Financials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F9F8F4] text-[#1A1A1A] font-sans h-full min-h-screen">

      {/* TOP BAR */}
      <header className="flex items-center justify-between p-6 border-b border-[#DCD7CB] bg-[#F9F8F4]/80 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-lg font-light tracking-wide">Financial Hub</h2>
        <div className="flex items-center gap-6">
          <Bell className="w-5 h-5 text-[#8C877D] hover:text-[#1A1A1A] cursor-pointer transition-colors" strokeWidth={1} />
          <div className="w-8 h-8 bg-[#1A1A1A] text-[#F9F8F4] flex items-center justify-center text-xs font-serif italic border border-[#1A1A1A]">
            A
          </div>
        </div>
      </header>

      <div className="p-6 md:p-12 lg:p-16 flex-1 overflow-auto">

        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2">
              Yield &amp; Expenditures
            </h3>
            <h2 className="text-5xl font-['Playfair_Display',_serif] tracking-tighter">
              Finance Ledger.
            </h2>
          </div>
          {!isAdding && (
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] transition-colors rounded-none text-[10px] tracking-[0.2em] uppercase px-8 py-6 group flex items-center gap-3"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Record Transaction
            </Button>
          )}
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none border-l-4 border-l-[#1A1A1A] hover:bg-[#FFFFFF] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Gross Revenue</CardTitle>
              <TrendingUp className="w-4 h-4 text-[#1A1A1A]" strokeWidth={1.5} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light font-['Playfair_Display',_serif] text-[#1A1A1A]">
                ₹{summary?.revenue?.toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none border-l-4 border-l-[#1A1A1A] hover:bg-[#FFFFFF] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Operating Expenses</CardTitle>
              <TrendingDown className="w-4 h-4 text-[#1A1A1A]" strokeWidth={1.5} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light font-['Playfair_Display',_serif] text-[#1A1A1A]">
                ₹{summary?.expenses?.toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#DCD7CB] shadow-none bg-[#1A1A1A] rounded-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Net Profit</CardTitle>
              <Banknote className="w-4 h-4 text-[#F9F8F4]" strokeWidth={1.5} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light font-['Playfair_Display',_serif] text-[#F9F8F4]">
                ₹{summary?.profit?.toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CONDITIONAL RENDERING: FORM vs TABLE */}
        {isAdding ? (
          <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9] mb-16 max-w-2xl mx-auto">
            <CardHeader className="border-b border-[#DCD7CB] pb-6 flex flex-row justify-between items-center">
              <CardTitle className="font-['Playfair_Display',_serif] text-2xl text-[#1A1A1A]">New Transaction</CardTitle>
              <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-[#8C877D] hover:text-[#1A1A1A] p-0 hover:bg-transparent rounded-none">
                <X className="w-5 h-5" strokeWidth={1} />
              </Button>
            </CardHeader>
            <CardContent className="pt-10 px-8 pb-12">
              <form onSubmit={handleRecord} className="flex flex-col gap-10">

                {submitError && (
                  <div className="border border-[#7f1d1d]/20 bg-[#fef2f2] p-4 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-[#7f1d1d] font-semibold">{submitError}</p>
                  </div>
                )}

                <div className="relative flex flex-col">
                  <label className={labelStyle}>Transaction Flow</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className={`${inputStyle} appearance-none cursor-pointer`}
                  >
                    <option value="INCOME">INCOME (Yield)</option>
                    <option value="EXPENSE">EXPENSE (Cost)</option>
                  </select>
                  <div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">↓</div>
                </div>

                <div className="flex flex-col">
                  <label className={labelStyle}>Amount (₹)</label>
                  <input
                    type="number" required min="1" step="0.01" placeholder="e.g. 50000.00"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div className="flex flex-col">
                  <label className={labelStyle}>Category</label>
                  <input
                    type="text" required placeholder="e.g. Fuel, Maintenance, Dispatch Invoice..."
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div className="flex flex-col">
                  <label className={labelStyle}>Optional Details</label>
                  <input
                    type="text" placeholder="Invoice # or specific notes"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="submit" disabled={submitLoading} className="flex-1 bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] transition-colors rounded-none text-[10px] tracking-[0.2em] uppercase py-6">
                    {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> : 'Add to Ledger'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9]">
            <CardHeader className="border-b border-[#DCD7CB] pb-8 flex flex-row justify-between items-center">
              <CardTitle className="font-['Playfair_Display',_serif] text-2xl flex items-center gap-4 text-[#1A1A1A]">
                <Banknote className="w-6 h-6 text-[#1A1A1A]" strokeWidth={1} />
                Statement of Account
              </CardTitle>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">
                Recent 50 Entries
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#DCD7CB] hover:bg-transparent">
                    <TableHead className="pl-8 py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Date</TableHead>
                    <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Category</TableHead>
                    <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Details</TableHead>
                    <TableHead className="pr-8 py-6 text-right text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary?.recentActivity?.length > 0 ? summary.recentActivity.map((t: any) => (
                    <TableRow key={t.id} className="border-[#DCD7CB] hover:bg-[#F9F8F4] transition-colors">
                      <TableCell className="pl-8 py-5 font-mono text-sm text-[#1A1A1A]">
                        {new Date(t.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-5 text-[10px] uppercase tracking-widest text-[#1A1A1A] font-bold">
                        {t.category}
                      </TableCell>
                      <TableCell className="py-5 text-sm font-light tracking-wide text-[#8C877D]">
                        {t.description || '—'}
                      </TableCell>
                      <TableCell className="pr-8 py-5 text-right">
                        <span className={`text-sm font-['Playfair_Display',_serif] tracking-wider ${t.type === 'INCOME' ? 'text-[#1A1A1A]' : 'text-[#8C877D]'}`}>
                          {t.type === 'INCOME' ? '+' : '-'}₹{t.amount.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-24">
                        <p className="text-sm text-[#8C877D] font-light italic mb-6">
                          The ledger currently has no financial entries.
                        </p>
                        <Button
                          onClick={() => setIsAdding(true)}
                          variant="outline"
                          className="border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F8F4] transition-colors rounded-none text-[10px] tracking-[0.2em] uppercase px-8 py-6 inline-flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" strokeWidth={1.5} />
                          Record Initial Transaction
                        </Button>
                      </TableCell>
                    </TableRow>
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