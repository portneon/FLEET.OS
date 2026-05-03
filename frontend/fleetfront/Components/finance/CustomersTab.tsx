"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Loader2, Plus, X, Trash2 } from "lucide-react";
import { financeAPI } from '@/lib/api';

const inputStyle = "w-full bg-transparent border-b border-[#DCD7CB] py-4 text-[#1A1A1A] font-light text-base focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none placeholder:text-[#C4BFAF]";
const labelStyle = "text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-1 block";

export default function CustomersTab({ onRefresh }: { onRefresh: () => void }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', customerType: 'BUSINESS' });

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await financeAPI.getCustomers();
    if (!res.error && res.data) setCustomers(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(''); setSubmitLoading(true);
    const res = await financeAPI.createCustomer(form);
    if (res.error) { setSubmitError(res.error); }
    else { setIsAdding(false); setForm({ name: '', email: '', phone: '', customerType: 'BUSINESS' }); fetch_(); }
    setSubmitLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    await financeAPI.deleteCustomer(id);
    fetch_();
  };

  if (loading && customers.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#1A1A1A]" strokeWidth={1.5} /></div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <h3 className="text-2xl font-['Playfair_Display',_serif]">Customer Directory</h3>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] rounded-none text-[10px] tracking-[0.2em] uppercase px-8 py-6 flex items-center gap-3">
            <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Customer
          </Button>
        )}
      </div>

      {isAdding ? (
        <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9] mb-12 max-w-2xl mx-auto">
          <CardHeader className="border-b border-[#DCD7CB] pb-6 flex flex-row justify-between items-center">
            <CardTitle className="font-['Playfair_Display',_serif] text-2xl">New Customer</CardTitle>
            <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-[#8C877D] hover:text-[#1A1A1A] p-0 hover:bg-transparent rounded-none"><X className="w-5 h-5" strokeWidth={1} /></Button>
          </CardHeader>
          <CardContent className="pt-10 px-8 pb-12">
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              {submitError && <div className="border border-[#7f1d1d]/20 bg-[#fef2f2] p-4 text-center"><p className="text-[10px] uppercase tracking-widest text-[#7f1d1d] font-semibold">{submitError}</p></div>}
              <div className="relative flex flex-col">
                <label className={labelStyle}>Customer Type</label>
                <select value={form.customerType} onChange={e => setForm({ ...form, customerType: e.target.value })} className={`${inputStyle} appearance-none cursor-pointer`}>
                  <option value="BUSINESS">Business</option>
                  <option value="INDIVIDUAL">Individual</option>
                </select>
                <div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">↓</div>
              </div>
              <div className="flex flex-col"><label className={labelStyle}>Name</label><input type="text" required placeholder="e.g. Acme Logistics" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputStyle} /></div>
              <div className="flex flex-col"><label className={labelStyle}>Email</label><input type="email" placeholder="contact@acme.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputStyle} /></div>
              <div className="flex flex-col"><label className={labelStyle}>Phone</label><input type="text" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputStyle} /></div>
              <Button type="submit" disabled={submitLoading} className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] rounded-none text-[10px] tracking-[0.2em] uppercase py-6">
                {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Customer'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9]">
          <CardContent className="pt-0 px-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#DCD7CB] hover:bg-transparent">
                  <TableHead className="pl-8 py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Name</TableHead>
                  <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Type</TableHead>
                  <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Email</TableHead>
                  <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Phone</TableHead>
                  <TableHead className="pr-8 py-6 text-right text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length > 0 ? customers.map((c: any) => (
                  <TableRow key={c.id} className="border-[#DCD7CB] hover:bg-[#F9F8F4] transition-colors">
                    <TableCell className="pl-8 py-5 text-sm font-light">{c.name}</TableCell>
                    <TableCell className="py-5"><Badge variant="outline" className="rounded-none text-[9px] uppercase tracking-widest border-[#8C877D] text-[#8C877D]">{c.customerType}</Badge></TableCell>
                    <TableCell className="py-5 text-sm text-[#8C877D]">{c.email || '—'}</TableCell>
                    <TableCell className="py-5 text-sm text-[#8C877D]">{c.phone || '—'}</TableCell>
                    <TableCell className="pr-8 py-5 text-right">
                      <button onClick={() => handleDelete(c.id)} className="text-[#8C877D] hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center py-20"><p className="text-sm text-[#8C877D] font-light italic">No customers found.</p></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
