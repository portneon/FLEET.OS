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

const statusColor = (s: string) => {
  if (s === 'PAID') return 'border-[#1A1A1A] text-[#1A1A1A]';
  if (s === 'OVERDUE') return 'border-red-400 text-red-600';
  if (s === 'CANCELLED') return 'border-[#C4BFAF] text-[#C4BFAF]';
  return 'border-[#8C877D] text-[#8C877D]';
};

interface Props { onRefresh: () => void; }

type Mode = 'list' | 'create' | 'edit' | 'payment';

export default function InvoicesTab({ onRefresh }: Props) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('list');
  const [editTarget, setEditTarget] = useState<any>(null);
  const [payTarget, setPayTarget] = useState<any>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({ customerId: '', subtotal: '', tax: '', discount: '', dueDate: '', status: 'PENDING' });
  const [payForm, setPayForm] = useState({ amount: '', method: 'CASH', status: 'SUCCESS' });

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const [invRes, custRes] = await Promise.all([financeAPI.getInvoices(), financeAPI.getCustomers()]);
    if (!invRes.error && invRes.data) setInvoices(invRes.data);
    if (!custRes.error && custRes.data) setCustomers(custRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const resetForm = () => {
    setForm({ customerId: '', subtotal: '', tax: '', discount: '', dueDate: '', status: 'PENDING' });
    setEditTarget(null);
    setPayTarget(null);
    setSubmitError('');
    setMode('list');
  };

  const openEdit = (inv: any) => {
    setEditTarget(inv);
    setForm({
      customerId: inv.customerId,
      subtotal: String(inv.subtotal),
      tax: String(inv.tax),
      discount: String(inv.discount || 0),
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
      status: inv.status,
    });
    setMode('edit');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(''); setSubmitLoading(true);
    const sub = parseFloat(form.subtotal); const tax = parseFloat(form.tax); const disc = parseFloat(form.discount || '0');
    const res = await financeAPI.createInvoice({ customerId: form.customerId, subtotal: sub, tax, discount: disc, total: sub + tax - disc, dueDate: form.dueDate });
    if (res.error) setSubmitError(res.error);
    else { resetForm(); fetch_(); onRefresh(); }
    setSubmitLoading(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setSubmitError(''); setSubmitLoading(true);
    const sub = parseFloat(form.subtotal); const tax = parseFloat(form.tax); const disc = parseFloat(form.discount || '0');
    const res = await financeAPI.updateInvoice(editTarget.id, {
      subtotal: sub, tax, discount: disc, total: sub + tax - disc,
      dueDate: form.dueDate, status: form.status,
    });
    if (res.error) setSubmitError(res.error);
    else { resetForm(); fetch_(); onRefresh(); }
    setSubmitLoading(false);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTarget) return;
    setSubmitError(''); setSubmitLoading(true);
    const res = await financeAPI.recordPayment({ invoiceId: payTarget.id, amount: parseFloat(payForm.amount), method: payForm.method, status: payForm.status });
    if (res.error) setSubmitError(res.error);
    else { resetForm(); fetch_(); onRefresh(); }
    setSubmitLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice and its associated payments?')) return;
    await financeAPI.deleteInvoice(id); fetch_(); onRefresh();
  };

  if (loading && invoices.length === 0) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#1A1A1A]" /></div>;

  // ── PAYMENT FORM ──
  if (mode === 'payment' && payTarget) {
    return (
      <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9] max-w-2xl mx-auto">
        <CardHeader className="border-b border-[#DCD7CB] pb-6 flex flex-row justify-between items-center">
          <CardTitle className="font-['Playfair_Display',_serif] text-2xl">Record Payment</CardTitle>
          <Button variant="ghost" onClick={resetForm} className="text-[#8C877D] hover:text-[#1A1A1A] p-0 hover:bg-transparent rounded-none"><X className="w-5 h-5" strokeWidth={1} /></Button>
        </CardHeader>
        <CardContent className="pt-8 px-8 pb-12">
          <p className="text-sm text-[#8C877D] mb-8">Invoice Total: <span className="text-[#1A1A1A] font-semibold">₹{payTarget.total?.toLocaleString()}</span> — Customer: <span className="text-[#1A1A1A]">{payTarget.customer?.name}</span></p>
          <form onSubmit={handlePayment} className="flex flex-col gap-8">
            {submitError && <div className="border border-[#7f1d1d]/20 bg-[#fef2f2] p-4 text-center"><p className="text-[10px] uppercase tracking-widest text-[#7f1d1d] font-semibold">{submitError}</p></div>}
            <div className="flex flex-col"><label className={labelStyle}>Amount (₹)</label><input type="number" required step="0.01" min="1" placeholder={String(payTarget.total)} value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} className={inputStyle} /></div>
            <div className="relative flex flex-col"><label className={labelStyle}>Payment Method</label>
              <select value={payForm.method} onChange={e => setPayForm({ ...payForm, method: e.target.value })} className={`${inputStyle} appearance-none cursor-pointer`}>
                <option value="CASH">Cash</option><option value="CARD">Card</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="UPI">UPI</option>
              </select><div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">↓</div>
            </div>
            <Button type="submit" disabled={submitLoading} className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] rounded-none text-[10px] tracking-[0.2em] uppercase py-6">
              {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Payment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // ── CREATE / EDIT FORM ──
  if (mode === 'create' || mode === 'edit') {
    const isEdit = mode === 'edit';
    return (
      <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9] mb-12 max-w-2xl mx-auto">
        <CardHeader className="border-b border-[#DCD7CB] pb-6 flex flex-row justify-between items-center">
          <CardTitle className="font-['Playfair_Display',_serif] text-2xl">{isEdit ? 'Edit Invoice' : 'Create Invoice'}</CardTitle>
          <Button variant="ghost" onClick={resetForm} className="text-[#8C877D] hover:text-[#1A1A1A] p-0 hover:bg-transparent rounded-none"><X className="w-5 h-5" strokeWidth={1} /></Button>
        </CardHeader>
        <CardContent className="pt-10 px-8 pb-12">
          <form onSubmit={isEdit ? handleEdit : handleCreate} className="flex flex-col gap-10">
            {submitError && <div className="border border-[#7f1d1d]/20 bg-[#fef2f2] p-4 text-center"><p className="text-[10px] uppercase tracking-widest text-[#7f1d1d] font-semibold">{submitError}</p></div>}
            {isEdit && (
              <div className="relative flex flex-col"><label className={labelStyle}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={`${inputStyle} appearance-none cursor-pointer`}>
                  <option value="PENDING">Pending</option><option value="PAID">Paid</option><option value="OVERDUE">Overdue</option><option value="CANCELLED">Cancelled</option>
                </select><div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">↓</div>
              </div>
            )}
            <div className="relative flex flex-col"><label className={labelStyle}>Customer</label>
              <select required value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })} disabled={isEdit} className={`${inputStyle} appearance-none cursor-pointer ${isEdit ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <option value="">Select customer...</option>
                {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select><div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">↓</div>
            </div>
            <div className="flex flex-col"><label className={labelStyle}>Subtotal (₹)</label><input type="number" required step="0.01" min="0" placeholder="10000" value={form.subtotal} onChange={e => setForm({ ...form, subtotal: e.target.value })} className={inputStyle} /></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col"><label className={labelStyle}>Tax (₹)</label><input type="number" required step="0.01" min="0" placeholder="1800" value={form.tax} onChange={e => setForm({ ...form, tax: e.target.value })} className={inputStyle} /></div>
              <div className="flex flex-col"><label className={labelStyle}>Discount (₹)</label><input type="number" step="0.01" min="0" placeholder="0" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} className={inputStyle} /></div>
            </div>
            {form.subtotal && (
              <div className="border-t border-[#DCD7CB] pt-4 text-right">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C877D]">Total: </span>
                <span className="text-xl font-['Playfair_Display',_serif]">₹{((parseFloat(form.subtotal || '0') + parseFloat(form.tax || '0') - parseFloat(form.discount || '0'))).toLocaleString()}</span>
              </div>
            )}
            <div className="flex flex-col"><label className={labelStyle}>Due Date</label><input type="date" required value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className={inputStyle} /></div>
            <Button type="submit" disabled={submitLoading} className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] rounded-none text-[10px] tracking-[0.2em] uppercase py-6">
              {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Save Changes' : 'Create Invoice'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // ── TABLE ──
  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <h3 className="text-2xl font-['Playfair_Display',_serif]">Invoice Ledger</h3>
        <Button onClick={() => setMode('create')} className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] rounded-none text-[10px] tracking-[0.2em] uppercase px-8 py-6 flex items-center gap-3"><Plus className="w-4 h-4" strokeWidth={1.5} /> New Invoice</Button>
      </div>
      <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9]">
        <CardContent className="pt-0 px-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#DCD7CB] hover:bg-transparent">
                <TableHead className="pl-8 py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Customer</TableHead>
                <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Issued</TableHead>
                <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Due</TableHead>
                <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Status</TableHead>
                <TableHead className="py-6 text-right text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Total</TableHead>
                <TableHead className="pr-8 py-6 text-right text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length > 0 ? invoices.map((inv: any) => (
                <TableRow key={inv.id} className="border-[#DCD7CB] hover:bg-[#F9F8F4] transition-colors">
                  <TableCell className="pl-8 py-5 text-sm font-light">{inv.customer?.name || '—'}</TableCell>
                  <TableCell className="py-5 text-sm font-mono text-[#8C877D]">{new Date(inv.issuedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="py-5 text-sm font-mono text-[#8C877D]">{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="py-5"><Badge variant="outline" className={`rounded-none text-[9px] uppercase tracking-widest ${statusColor(inv.status)}`}>{inv.status}</Badge></TableCell>
                  <TableCell className="py-5 text-right text-sm font-['Playfair_Display',_serif]">₹{inv.total?.toLocaleString()}</TableCell>
                  <TableCell className="pr-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-4">
                      {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                        <button onClick={() => { setPayTarget(inv); setMode('payment'); }} className="text-[10px] uppercase tracking-widest text-[#1A1A1A] hover:underline font-semibold">Pay</button>
                      )}
                      <button onClick={() => openEdit(inv)} title="Edit" className="text-[#8C877D] hover:text-[#1A1A1A] transition-colors"><Pencil className="w-4 h-4" strokeWidth={1.5} /></button>
                      <button onClick={() => handleDelete(inv.id)} title="Delete" className="text-[#8C877D] hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={6} className="text-center py-20"><p className="text-sm text-[#8C877D] font-light italic">No invoices found.</p></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
