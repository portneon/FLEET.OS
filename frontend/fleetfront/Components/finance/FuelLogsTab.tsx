"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Loader2, Plus, X } from "lucide-react";
import { financeAPI, fleetAPI } from '@/lib/api';

const inputStyle = "w-full bg-transparent border-b border-[#DCD7CB] py-4 text-[#1A1A1A] font-light text-base focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none placeholder:text-[#C4BFAF]";
const labelStyle = "text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-1 block";

export default function FuelLogsTab({ onRefresh }: { onRefresh: () => void }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({ vehicleId: '', liters: '', cost: '', odometer: '' });

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const [logRes, vRes] = await Promise.all([financeAPI.getFuelLogs(), fleetAPI.getAll()]);
    if (!logRes.error && logRes.data) setLogs(logRes.data);
    if (!vRes.error && vRes.data) setVehicles(vRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(''); setSubmitLoading(true);
    const res = await financeAPI.createFuelLog({ vehicleId: form.vehicleId, liters: parseFloat(form.liters), cost: parseFloat(form.cost), odometer: parseFloat(form.odometer) });
    if (res.error) setSubmitError(res.error);
    else { setIsAdding(false); setForm({ vehicleId: '', liters: '', cost: '', odometer: '' }); fetch_(); }
    setSubmitLoading(false);
  };

  if (loading && logs.length === 0) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#1A1A1A]" /></div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <h3 className="text-2xl font-['Playfair_Display',_serif]">Fuel Log</h3>
        {!isAdding && <Button onClick={() => setIsAdding(true)} className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] rounded-none text-[10px] tracking-[0.2em] uppercase px-8 py-6 flex items-center gap-3"><Plus className="w-4 h-4" strokeWidth={1.5} /> Log Refuel</Button>}
      </div>
      {isAdding ? (
        <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9] mb-12 max-w-2xl mx-auto">
          <CardHeader className="border-b border-[#DCD7CB] pb-6 flex flex-row justify-between items-center">
            <CardTitle className="font-['Playfair_Display',_serif] text-2xl">New Fuel Entry</CardTitle>
            <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-[#8C877D] hover:text-[#1A1A1A] p-0 hover:bg-transparent rounded-none"><X className="w-5 h-5" strokeWidth={1} /></Button>
          </CardHeader>
          <CardContent className="pt-10 px-8 pb-12">
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              {submitError && <div className="border border-[#7f1d1d]/20 bg-[#fef2f2] p-4 text-center"><p className="text-[10px] uppercase tracking-widest text-[#7f1d1d] font-semibold">{submitError}</p></div>}
              <div className="relative flex flex-col"><label className={labelStyle}>Vehicle</label>
                <select required value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} className={`${inputStyle} appearance-none cursor-pointer`}>
                  <option value="">Select vehicle...</option>
                  {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.licensePlate} ({v.type})</option>)}
                </select><div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">↓</div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="flex flex-col"><label className={labelStyle}>Liters</label><input type="number" required step="0.1" min="0.1" placeholder="45.5" value={form.liters} onChange={e => setForm({ ...form, liters: e.target.value })} className={inputStyle} /></div>
                <div className="flex flex-col"><label className={labelStyle}>Cost (₹)</label><input type="number" required step="0.01" min="1" placeholder="4500" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} className={inputStyle} /></div>
                <div className="flex flex-col"><label className={labelStyle}>Odometer</label><input type="number" required step="0.1" min="0" placeholder="85432" value={form.odometer} onChange={e => setForm({ ...form, odometer: e.target.value })} className={inputStyle} /></div>
              </div>
              <Button type="submit" disabled={submitLoading} className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] rounded-none text-[10px] tracking-[0.2em] uppercase py-6">
                {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Fuel Entry'}
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
                  <TableHead className="pl-8 py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Date</TableHead>
                  <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Vehicle</TableHead>
                  <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Liters</TableHead>
                  <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Odometer</TableHead>
                  <TableHead className="pr-8 py-6 text-right text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length > 0 ? logs.map((l: any) => (
                  <TableRow key={l.id} className="border-[#DCD7CB] hover:bg-[#F9F8F4] transition-colors">
                    <TableCell className="pl-8 py-5 text-sm font-mono text-[#8C877D]">{new Date(l.filledAt).toLocaleDateString()}</TableCell>
                    <TableCell className="py-5 text-sm font-light">{l.vehicle?.licensePlate || '—'}</TableCell>
                    <TableCell className="py-5 text-sm">{l.liters} L</TableCell>
                    <TableCell className="py-5 text-sm font-mono text-[#8C877D]">{l.odometer?.toLocaleString()} km</TableCell>
                    <TableCell className="pr-8 py-5 text-right text-sm font-['Playfair_Display',_serif]">₹{l.cost?.toLocaleString()}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center py-20"><p className="text-sm text-[#8C877D] font-light italic">No fuel logs recorded.</p></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
