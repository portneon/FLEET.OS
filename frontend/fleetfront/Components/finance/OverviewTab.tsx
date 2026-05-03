"use client"

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { TrendingUp, TrendingDown, Banknote, Receipt, Wallet, AlertTriangle, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { financeAPI } from '@/lib/api';

const CATEGORIES = ['ALL', 'INVOICE', 'PAYMENT', 'FUEL', 'MAINTENANCE', 'SALARY', 'INSURANCE', 'TAX', 'TOLL', 'RENT', 'PARKING', 'LOAN_PAYMENT', 'OTHER'];
const inputStyle = "w-full bg-transparent border-b border-[#DCD7CB] py-3 text-[#1A1A1A] font-light text-sm focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none placeholder:text-[#C4BFAF]";
const labelStyle = "text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-1 block";

interface Props {
  dashboard: any;
  receivables: any[];
  payables: any[];
  activity: any[];
  onRefresh: () => void;
}

export default function OverviewTab({ dashboard, receivables, payables, activity, onRefresh }: Props) {
  const d = dashboard || {};
  const [filterCat, setFilterCat] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filteredActivity, setFilteredActivity] = useState<any[] | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);

  // Edit transaction state
  const [editTarget, setEditTarget] = useState<any>(null);
  const [editForm, setEditForm] = useState({ amount: '', category: '', description: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const displayActivity = filteredActivity ?? activity;

  const applyFilter = useCallback(async (cat: string, type: string) => {
    setFilterCat(cat); setFilterType(type);
    if (cat === 'ALL' && type === 'ALL') { setFilteredActivity(null); return; }
    setFilterLoading(true);
    const filters: any = {};
    if (cat !== 'ALL') filters.category = cat;
    if (type !== 'ALL') filters.type = type;
    const res = await financeAPI.getSummary(filters);
    if (!res.error && res.data) setFilteredActivity(res.data.recentActivity || []);
    setFilterLoading(false);
  }, []);

  const openEdit = (tx: any) => {
    setEditTarget(tx);
    setEditForm({ amount: String(tx.amount), category: tx.category, description: tx.description || '' });
    setEditError('');
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    setEditLoading(true); setEditError('');
    const res = await financeAPI.updateTransaction(editTarget.id, {
      amount: parseFloat(editForm.amount),
      category: editForm.category,
      description: editForm.description,
    });
    if (res.error) { setEditError(res.error); setEditLoading(false); return; }
    setEditTarget(null);
    await onRefresh();
    // Re-apply filter if active
    if (filterCat !== 'ALL' || filterType !== 'ALL') await applyFilter(filterCat, filterType);
    setEditLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this audit entry? This cannot be undone.')) return;
    await financeAPI.deleteTransaction(id);
    await onRefresh();
    if (filterCat !== 'ALL' || filterType !== 'ALL') await applyFilter(filterCat, filterType);
  };

  const cards = [
    { label: 'Total Invoiced', value: d.totalInvoiced, icon: Receipt, dark: false },
    { label: 'Total Paid', value: d.totalPaid, icon: Banknote, dark: false },
    { label: 'Total Expenses', value: d.totalExpenses, icon: TrendingDown, dark: false },
    { label: 'Fuel Costs', value: d.totalFuelCost, icon: Wallet, dark: false },
    { label: 'Overdue Invoices', value: d.overdueInvoices, icon: AlertTriangle, dark: false, isCount: true },
    { label: 'Net Profit', value: d.netProfit, icon: TrendingUp, dark: true },
  ];

  const statusColor = (s: string) => {
    if (s === 'PAID') return 'border-[#1A1A1A] text-[#1A1A1A]';
    if (s === 'OVERDUE') return 'border-red-400 text-red-600';
    return 'border-[#8C877D] text-[#8C877D]';
  };

  return (
    <div className="space-y-12">
      {/* ── KPI STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(c => (
          <Card key={c.label} className={`border shadow-none rounded-none transition-colors ${c.dark ? 'bg-[#1A1A1A] border-[#1A1A1A]' : 'border-[#DCD7CB] bg-[#FDFCF9] border-l-4 border-l-[#1A1A1A] hover:bg-white'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">{c.label}</CardTitle>
              <c.icon className={`w-4 h-4 ${c.dark ? 'text-[#F9F8F4]' : 'text-[#1A1A1A]'}`} strokeWidth={1.5} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-light font-['Playfair_Display',_serif] ${c.dark ? (d.netProfit < 0 ? 'text-red-400' : 'text-[#F9F8F4]') : 'text-[#1A1A1A]'}`}>
                {c.isCount ? (c.value ?? 0) : `₹${(c.value ?? 0).toLocaleString()}`}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── RECEIVABLES + PAYABLES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9]">
          <CardHeader className="border-b border-[#DCD7CB] pb-4">
            <CardTitle className="font-['Playfair_Display',_serif] text-xl">Pending Receivables</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            {receivables.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-[#DCD7CB] hover:bg-transparent">
                    <TableHead className="pl-6 py-4 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Customer</TableHead>
                    <TableHead className="py-4 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Due</TableHead>
                    <TableHead className="py-4 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Status</TableHead>
                    <TableHead className="pr-6 py-4 text-right text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivables.slice(0, 8).map((r: any) => (
                    <TableRow key={r.id} className="border-[#DCD7CB] hover:bg-[#F9F8F4]">
                      <TableCell className="pl-6 py-3 text-sm font-light">{r.invoice?.customer?.name || '—'}</TableCell>
                      <TableCell className="py-3 text-sm font-mono text-[#8C877D]">{new Date(r.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell className="py-3"><Badge variant="outline" className={`rounded-none text-[9px] uppercase tracking-widest ${statusColor(r.status)}`}>{r.status}</Badge></TableCell>
                      <TableCell className="pr-6 py-3 text-right text-sm font-['Playfair_Display',_serif]">₹{r.amountDue?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-12 text-sm text-[#8C877D] font-light italic">No pending receivables.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9]">
          <CardHeader className="border-b border-[#DCD7CB] pb-4">
            <CardTitle className="font-['Playfair_Display',_serif] text-xl">Pending Payables</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            {payables.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-[#DCD7CB] hover:bg-transparent">
                    <TableHead className="pl-6 py-4 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Vendor</TableHead>
                    <TableHead className="py-4 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Due</TableHead>
                    <TableHead className="py-4 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Status</TableHead>
                    <TableHead className="pr-6 py-4 text-right text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payables.slice(0, 8).map((p: any) => (
                    <TableRow key={p.id} className="border-[#DCD7CB] hover:bg-[#F9F8F4]">
                      <TableCell className="pl-6 py-3 text-sm font-light">{p.vendor}</TableCell>
                      <TableCell className="py-3 text-sm font-mono text-[#8C877D]">{new Date(p.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell className="py-3"><Badge variant="outline" className={`rounded-none text-[9px] uppercase tracking-widest ${statusColor(p.status)}`}>{p.status}</Badge></TableCell>
                      <TableCell className="pr-6 py-3 text-right text-sm font-['Playfair_Display',_serif]">₹{p.amount?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-12 text-sm text-[#8C877D] font-light italic">No pending payables.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── INLINE EDIT MODAL ── */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9] w-full max-w-lg">
            <CardHeader className="border-b border-[#DCD7CB] pb-4 flex flex-row justify-between items-center">
              <CardTitle className="font-['Playfair_Display',_serif] text-xl">Edit Audit Entry</CardTitle>
              <button onClick={() => setEditTarget(null)} className="text-[#8C877D] hover:text-[#1A1A1A]"><X className="w-5 h-5" strokeWidth={1} /></button>
            </CardHeader>
            <CardContent className="pt-6 px-8 pb-8">
              <div className="flex flex-col gap-6">
                {editError && <p className="text-xs text-red-600 uppercase tracking-widest">{editError}</p>}
                <div className="flex flex-col"><label className={labelStyle}>Amount (₹)</label>
                  <input type="number" step="0.01" min="0" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} className={inputStyle} /></div>
                <div className="relative flex flex-col"><label className={labelStyle}>Category</label>
                  <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className={`${inputStyle} appearance-none cursor-pointer`}>
                    {CATEGORIES.filter(c => c !== 'ALL').map(c => <option key={c} value={c}>{c}</option>)}
                  </select><div className="absolute right-0 bottom-3 pointer-events-none text-[#8C877D] text-xs">↓</div>
                </div>
                <div className="flex flex-col"><label className={labelStyle}>Description</label>
                  <input type="text" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className={inputStyle} /></div>
                <Button onClick={handleEditSave} disabled={editLoading} className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333] rounded-none text-[10px] tracking-[0.2em] uppercase py-5 mt-2">
                  {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TRANSACTION AUDIT TRAIL ── */}
      <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9]">
        <CardHeader className="border-b border-[#DCD7CB] pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-['Playfair_Display',_serif] text-2xl">Transaction Audit Trail</CardTitle>
              <p className="text-xs text-[#8C877D] mt-1 font-light">All creates and edits are logged. Admin can update or delete entries.</p>
            </div>
            {/* ── FILTERS ── */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Category filter */}
              <div className="relative">
                <select value={filterCat} onChange={e => applyFilter(e.target.value, filterType)}
                  className="bg-[#F9F8F4] border border-[#DCD7CB] py-2 pl-3 pr-7 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] rounded-none appearance-none cursor-pointer focus:outline-none focus:border-[#1A1A1A]">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>)}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C877D] text-[9px]">↓</div>
              </div>
              {/* Type filter */}
              <div className="relative">
                <select value={filterType} onChange={e => applyFilter(filterCat, e.target.value)}
                  className="bg-[#F9F8F4] border border-[#DCD7CB] py-2 pl-3 pr-7 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] rounded-none appearance-none cursor-pointer focus:outline-none focus:border-[#1A1A1A]">
                  <option value="ALL">All Types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C877D] text-[9px]">↓</div>
              </div>
              {(filterCat !== 'ALL' || filterType !== 'ALL') && (
                <button onClick={() => applyFilter('ALL', 'ALL')} className="text-[9px] uppercase tracking-widest text-[#8C877D] hover:text-[#1A1A1A] underline font-semibold">Clear</button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#DCD7CB] hover:bg-transparent">
                <TableHead className="pl-8 py-5 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Date</TableHead>
                <TableHead className="py-5 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Action</TableHead>
                <TableHead className="py-5 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Category</TableHead>
                <TableHead className="py-5 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Description</TableHead>
                <TableHead className="py-5 text-right text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Amount</TableHead>
                <TableHead className="pr-8 py-5 text-right text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-16"><Loader2 className="w-5 h-5 animate-spin text-[#8C877D] mx-auto" /></TableCell></TableRow>
              ) : displayActivity.length > 0 ? displayActivity.map((t: any) => {
                const isEdit = t.description?.startsWith('[EDIT]');
                const isIncome = t.type === 'INCOME';
                return (
                  <TableRow key={t.id} className="border-[#DCD7CB] hover:bg-[#F9F8F4] transition-colors group">
                    <TableCell className="pl-8 py-4 text-xs font-mono text-[#8C877D]">{new Date(t.date).toLocaleString()}</TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className={`rounded-none text-[9px] uppercase tracking-widest ${isEdit ? 'border-amber-400 text-amber-600' : 'border-[#8C877D] text-[#8C877D]'}`}>
                        {isEdit ? 'EDIT' : 'CREATE'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] bg-[#F0EDE6] px-2 py-1">{t.category}</span>
                    </TableCell>
                    <TableCell className={`py-4 text-sm font-light max-w-xs truncate ${isEdit ? 'text-amber-700' : 'text-[#1A1A1A]'}`}>
                      {t.description?.replace(/^\[(CREATE|EDIT)\]\s*/, '') || '—'}
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <span className={`text-sm font-['Playfair_Display',_serif] ${isIncome ? 'text-[#1A1A1A]' : 'text-[#8C877D]'}`}>
                        {isIncome ? '+' : '-'}₹{t.amount?.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="pr-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(t)} title="Edit entry" className="text-[#8C877D] hover:text-[#1A1A1A] transition-colors"><Pencil className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                        <button onClick={() => handleDelete(t.id)} title="Delete entry" className="text-[#8C877D] hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <p className="text-sm text-[#8C877D] font-light italic">
                      {filterCat !== 'ALL' || filterType !== 'ALL' ? `No entries for this filter.` : 'No activity recorded yet.'}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
