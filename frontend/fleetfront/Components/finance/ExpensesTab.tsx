"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Loader2, Plus, X, Trash2, Pencil } from "lucide-react";
import { financeAPI } from '@/lib/api';

const inputStyle = "w-full bg-transparent border-b border-[#DCD7CB] py-4 text-[#1A1A1A] font-light text-base focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none placeholder:text-[#C4BFAF]";
const labelStyle = "text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-1 block";

const CATEGORIES = ['FUEL', 'MAINTENANCE', 'SALARY', 'INSURANCE', 'TAX', 'TOLL', 'RENT', 'PARKING', 'LOAN_PAYMENT', 'OTHER'];

interface Props { onRefresh: () => void; }
type Mode = 'list' | 'create' | 'edit';

export default function ExpensesTab({ onRefresh }: Props) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('list');
  const [editTarget, setEditTarget] = useState<any>(null);
  const [filterCat, setFilterCat] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({ category: 'FUEL', amount: '', vendor: '', notes: '', expenseDate: '' });

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await financeAPI.getExpenses(filterCat ? { category: filterCat } : undefined);
    if (!res.error && res.data) setExpenses(res.data);
    setLoading(false);
  }, [filterCat]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const resetForm = () => {
    setForm({ category: 'FUEL', amount: '', vendor: '', notes: '', expenseDate: '' });
    setEditTarget(null);
    setSubmitError('');
    setMode('list');
  };

  const openEdit = (exp: any) => {
    setEditTarget(exp);
    setForm({
      category: exp.category,
      amount: String(exp.amount),
      vendor: exp.vendor || '',
      notes: exp.notes || '',
      expenseDate: exp.expenseDate ? new Date(exp.expenseDate).toISOString().split('T')[0] : '',
    });
    setMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(''); setSubmitLoading(true);
    const payload = { category: form.category, amount: parseFloat(form.amount), vendor: form.vendor || undefined, notes: form.notes || undefined, expenseDate: form.expenseDate || undefined };
    const res = mode === 'edit' && editTarget
      ? await financeAPI.updateExpense(editTarget.id, payload)
      : await financeAPI.createExpense(payload);
    if (res.error) setSubmitError(res.error);
    else { resetForm(); fetch_(); onRefresh(); }
    setSubmitLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    await financeAPI.deleteExpense(id); fetch_(); onRefresh();
  };

  if (loading && expenses.length === 0) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#1A1A1A]" /></div>;

  // ── CREATE / EDIT FORM ──
  if (mode === 'create' || mode === 'edit') {
    const isEdit = mode === 'edit';
    return (
      <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9] mb-12 max-w-2xl mx-auto">
        <CardHeader className="border-b border-[#DCD7CB] pb-6 flex flex-row justify-between items-center">
          <CardTitle className="font-['Playfair_Display',_serif] text-2xl">{isEdit ? 'Edit Expense' : 'New Expense'}</CardTitle>
          <Button variant="ghost" onClick={resetForm} className="text-[#8C877D] hover:text-[#1A1A1A] p-0 hover:bg-transparent rounded-none"><X className="w-5 h-5" strokeWidth={1} /></Button>
        </CardHeader>
        <CardContent className="pt-10 px-8 pb-12">
          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            {submitError && <div className="border border-[#7f1d1d]/20 bg-[#fef2f2] p-4 text-center"><p className="text-[10px] uppercase tracking-widest text-[#7f1d1d] font-semibold">{submitError}</p></div>}
            <div className="relative flex flex-col"><label className={labelStyle}>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={`${inputStyle} appearance-none cursor-pointer`}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select><div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">↓</div>
            </div>
            <div className="flex flex-col"><label className={labelStyle}>Amount (₹)</label><input type="number" required step="0.01" min="1" placeholder="e.g. 2500" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className={inputStyle} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Vendor</label><input type="text" placeholder="e.g. Shell Fuel Station" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} className={inputStyle} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Notes</label><input type="text" placeholder="Optional details" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputStyle} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Date</label><input type="date" value={form.expenseDate} onChange={e => setForm({ ...form, expenseDate: e.target.value })} className={inputStyle} /></div>
            <Button type="submit" disabled={submitLoading} className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] rounded-none text-[10px] tracking-[0.2em] uppercase py-6">
              {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Save Changes' : 'Record Expense'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // ── TABLE ──
  return (
    <div>
      <div className="flex justify-between items-end mb-8 gap-4 flex-wrap">
        <h3 className="text-2xl font-['Playfair_Display',_serif]">Expense Tracker</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="bg-transparent border border-[#DCD7CB] py-2 px-4 text-[10px] uppercase tracking-[0.15em] font-semibold text-[#8C877D] rounded-none appearance-none cursor-pointer pr-8 focus:outline-none focus:border-[#1A1A1A]">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C877D] text-xs">↓</div>
          </div>
          <Button onClick={() => setMode('create')} className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] rounded-none text-[10px] tracking-[0.2em] uppercase px-8 py-6 flex items-center gap-3"><Plus className="w-4 h-4" strokeWidth={1.5} /> Add Expense</Button>
        </div>
      </div>
      <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9]">
        <CardContent className="pt-0 px-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#DCD7CB] hover:bg-transparent">
                <TableHead className="pl-8 py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Date</TableHead>
                <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Category</TableHead>
                <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Vendor</TableHead>
                <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Notes</TableHead>
                <TableHead className="py-6 text-right text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Amount</TableHead>
                <TableHead className="pr-8 py-6 text-right text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length > 0 ? expenses.map((exp: any) => (
                <TableRow key={exp.id} className="border-[#DCD7CB] hover:bg-[#F9F8F4] transition-colors">
                  <TableCell className="pl-8 py-5 text-sm font-mono text-[#8C877D]">{new Date(exp.expenseDate).toLocaleDateString()}</TableCell>
                  <TableCell className="py-5"><Badge variant="outline" className="rounded-none text-[9px] uppercase tracking-widest border-[#8C877D] text-[#8C877D]">{exp.category}</Badge></TableCell>
                  <TableCell className="py-5 text-sm font-light">{exp.vendor || '—'}</TableCell>
                  <TableCell className="py-5 text-sm text-[#8C877D] font-light">{exp.notes || '—'}</TableCell>
                  <TableCell className="py-5 text-right text-sm font-['Playfair_Display',_serif] text-[#8C877D]">-₹{exp.amount?.toLocaleString()}</TableCell>
                  <TableCell className="pr-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button onClick={() => openEdit(exp)} title="Edit" className="text-[#8C877D] hover:text-[#1A1A1A] transition-colors"><Pencil className="w-4 h-4" strokeWidth={1.5} /></button>
                      <button onClick={() => handleDelete(exp.id)} title="Delete" className="text-[#8C877D] hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={6} className="text-center py-20"><p className="text-sm text-[#8C877D] font-light italic">No expenses recorded.</p></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
