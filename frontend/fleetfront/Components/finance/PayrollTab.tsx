"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";
import { financeAPI, staffAPI } from '@/lib/api';

const inputStyle = "w-full bg-transparent border-b border-[#DCD7CB] py-4 text-[#1A1A1A] font-light text-base focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none placeholder:text-[#C4BFAF]";
const labelStyle = "text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-1 block";

export default function PayrollTab({ onRefresh }: { onRefresh: () => void }) {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({ driverId: '', month: '', baseSalary: '', bonus: '', deductions: '' });

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const [payRes, staffRes] = await Promise.all([financeAPI.getPayrolls(), staffAPI.getAll()]);
    if (!payRes.error && payRes.data) setPayrolls(payRes.data);
    if (!staffRes.error && staffRes.data) {
      // Filter to only show drivers (staff with driverProfile)
      const drivers = staffRes.data.filter((s: any) => s.driverProfile);
      setStaff(drivers);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(''); setSubmitLoading(true);
    const base = parseFloat(form.baseSalary);
    const bonus = form.bonus ? parseFloat(form.bonus) : 0;
    const deductions = form.deductions ? parseFloat(form.deductions) : 0;
    const selectedStaff = staff.find(s => s.driverProfile?.id === form.driverId);
    const res = await financeAPI.createPayroll({
      driverId: form.driverId,
      month: form.month + '-01',
      baseSalary: base,
      bonus: bonus || undefined,
      deductions: deductions || undefined,
      netPay: base + bonus - deductions
    });
    if (res.error) setSubmitError(res.error);
    else { setIsAdding(false); setForm({ driverId: '', month: '', baseSalary: '', bonus: '', deductions: '' }); fetch_(); }
    setSubmitLoading(false);
  };

  const handleMarkPaid = async (id: string) => {
    await financeAPI.updatePayroll(id, { paidAt: new Date().toISOString() });
    fetch_();
  };

  if (loading && payrolls.length === 0) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#1A1A1A]" /></div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <h3 className="text-2xl font-['Playfair_Display',_serif]">Payroll Registry</h3>
        {!isAdding && <Button onClick={() => setIsAdding(true)} className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] rounded-none text-[10px] tracking-[0.2em] uppercase px-8 py-6 flex items-center gap-3"><Plus className="w-4 h-4" strokeWidth={1.5} /> New Payroll</Button>}
      </div>

      {isAdding ? (
        <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9] mb-12 max-w-2xl mx-auto">
          <CardHeader className="border-b border-[#DCD7CB] pb-6 flex flex-row justify-between items-center">
            <CardTitle className="font-['Playfair_Display',_serif] text-2xl">Create Payroll Entry</CardTitle>
            <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-[#8C877D] hover:text-[#1A1A1A] p-0 hover:bg-transparent rounded-none"><X className="w-5 h-5" strokeWidth={1} /></Button>
          </CardHeader>
          <CardContent className="pt-10 px-8 pb-12">
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              {submitError && <div className="border border-[#7f1d1d]/20 bg-[#fef2f2] p-4 text-center"><p className="text-[10px] uppercase tracking-widest text-[#7f1d1d] font-semibold">{submitError}</p></div>}
              <div className="relative flex flex-col"><label className={labelStyle}>Driver</label>
                <select required value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })} className={`${inputStyle} appearance-none cursor-pointer`}>
                  <option value="">Select driver...</option>
                  {staff.map((s: any) => <option key={s.driverProfile?.id} value={s.driverProfile?.id}>{s.name} ({s.driverProfile?.licenseNumber})</option>)}
                </select><div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">↓</div>
              </div>
              <div className="flex flex-col"><label className={labelStyle}>Month</label><input type="month" required value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} className={inputStyle} /></div>
              <div className="grid grid-cols-3 gap-6">
                <div className="flex flex-col"><label className={labelStyle}>Base Salary (₹)</label><input type="number" required step="0.01" min="1" placeholder="25000" value={form.baseSalary} onChange={e => setForm({ ...form, baseSalary: e.target.value })} className={inputStyle} /></div>
                <div className="flex flex-col"><label className={labelStyle}>Bonus (₹)</label><input type="number" step="0.01" min="0" placeholder="0" value={form.bonus} onChange={e => setForm({ ...form, bonus: e.target.value })} className={inputStyle} /></div>
                <div className="flex flex-col"><label className={labelStyle}>Deductions (₹)</label><input type="number" step="0.01" min="0" placeholder="0" value={form.deductions} onChange={e => setForm({ ...form, deductions: e.target.value })} className={inputStyle} /></div>
              </div>
              {form.baseSalary && (
                <div className="border-t border-[#DCD7CB] pt-4 text-right">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C877D]">Net Pay: </span>
                  <span className="text-xl font-['Playfair_Display',_serif] text-[#1A1A1A]">₹{((parseFloat(form.baseSalary || '0') + parseFloat(form.bonus || '0') - parseFloat(form.deductions || '0'))).toLocaleString()}</span>
                </div>
              )}
              <Button type="submit" disabled={submitLoading} className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] rounded-none text-[10px] tracking-[0.2em] uppercase py-6">
                {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Payroll'}
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
                  <TableHead className="pl-8 py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Driver</TableHead>
                  <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Month</TableHead>
                  <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Base</TableHead>
                  <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Bonus</TableHead>
                  <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Deductions</TableHead>
                  <TableHead className="py-6 text-right text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Net Pay</TableHead>
                  <TableHead className="pr-8 py-6 text-right text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.length > 0 ? payrolls.map((p: any) => (
                  <TableRow key={p.id} className="border-[#DCD7CB] hover:bg-[#F9F8F4] transition-colors">
                    <TableCell className="pl-8 py-5 text-sm font-light">{p.driver?.user?.name || '—'}</TableCell>
                    <TableCell className="py-5 text-sm font-mono text-[#8C877D]">{new Date(p.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</TableCell>
                    <TableCell className="py-5 text-sm">₹{p.baseSalary?.toLocaleString()}</TableCell>
                    <TableCell className="py-5 text-sm text-[#8C877D]">₹{(p.bonus || 0).toLocaleString()}</TableCell>
                    <TableCell className="py-5 text-sm text-[#8C877D]">₹{(p.deductions || 0).toLocaleString()}</TableCell>
                    <TableCell className="py-5 text-right text-sm font-semibold font-['Playfair_Display',_serif]">₹{p.netPay?.toLocaleString()}</TableCell>
                    <TableCell className="pr-8 py-5 text-right">
                      {p.paidAt ? (
                        <Badge variant="outline" className="rounded-none text-[9px] uppercase tracking-widest border-[#1A1A1A] text-[#1A1A1A]">PAID</Badge>
                      ) : (
                        <button onClick={() => handleMarkPaid(p.id)} className="text-[10px] uppercase tracking-widest text-[#1A1A1A] hover:underline font-semibold border border-[#DCD7CB] px-3 py-1 hover:border-[#1A1A1A] transition-colors">Mark Paid</button>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={7} className="text-center py-20"><p className="text-sm text-[#8C877D] font-light italic">No payroll records found.</p></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
