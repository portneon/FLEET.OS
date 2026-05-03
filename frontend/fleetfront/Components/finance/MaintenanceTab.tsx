"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Loader2, Plus, X } from "lucide-react";
import { financeAPI, fleetAPI } from '@/lib/api';

const inputStyle = "w-full bg-transparent border-b border-[#DCD7CB] py-4 text-[#1A1A1A] font-light text-base focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none placeholder:text-[#C4BFAF]";
const labelStyle = "text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-1 block";

export default function MaintenanceTab({ onRefresh }: { onRefresh: () => void }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({ vehicleId: '', maintenanceType: '', cost: '', vendor: '', notes: '', nextDue: '' });

  const fetchVehicles = useCallback(async () => {
    const vRes = await fleetAPI.getAll();
    if (!vRes.error && vRes.data) {
      setVehicles(vRes.data);
      if (vRes.data.length > 0 && !selectedVehicle) {
        setSelectedVehicle(vRes.data[0].id);
      }
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    if (!selectedVehicle) { setLoading(false); return; }
    setLoading(true);
    const res = await financeAPI.getMaintenanceLogs(selectedVehicle);
    if (!res.error && res.data) setLogs(res.data);
    setLoading(false);
  }, [selectedVehicle]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(''); setSubmitLoading(true);
    const res = await financeAPI.createMaintenanceLog({ vehicleId: form.vehicleId, maintenanceType: form.maintenanceType, cost: parseFloat(form.cost), vendor: form.vendor || undefined, notes: form.notes || undefined, nextDue: form.nextDue || undefined });
    if (res.error) setSubmitError(res.error);
    else { setIsAdding(false); setForm({ vehicleId: '', maintenanceType: '', cost: '', vendor: '', notes: '', nextDue: '' }); setSelectedVehicle(form.vehicleId); fetchLogs(); }
    setSubmitLoading(false);
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-8 gap-4 flex-wrap">
        <h3 className="text-2xl font-['Playfair_Display',_serif]">Maintenance Records</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} className="bg-transparent border border-[#DCD7CB] py-2 px-4 text-[10px] uppercase tracking-[0.15em] font-semibold text-[#8C877D] rounded-none appearance-none cursor-pointer pr-8 focus:outline-none focus:border-[#1A1A1A]">
              {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.licensePlate}</option>)}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C877D] text-xs">↓</div>
          </div>
          {!isAdding && <Button onClick={() => setIsAdding(true)} className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] rounded-none text-[10px] tracking-[0.2em] uppercase px-8 py-6 flex items-center gap-3"><Plus className="w-4 h-4" strokeWidth={1.5} /> Log Service</Button>}
        </div>
      </div>

      {isAdding ? (
        <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9] mb-12 max-w-2xl mx-auto">
          <CardHeader className="border-b border-[#DCD7CB] pb-6 flex flex-row justify-between items-center">
            <CardTitle className="font-['Playfair_Display',_serif] text-2xl">Log Maintenance</CardTitle>
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
              <div className="flex flex-col"><label className={labelStyle}>Maintenance Type</label><input type="text" required placeholder="e.g. Oil Change, Tire Rotation" value={form.maintenanceType} onChange={e => setForm({ ...form, maintenanceType: e.target.value })} className={inputStyle} /></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col"><label className={labelStyle}>Cost (₹)</label><input type="number" required step="0.01" min="1" placeholder="3500" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} className={inputStyle} /></div>
                <div className="flex flex-col"><label className={labelStyle}>Vendor</label><input type="text" placeholder="Service center name" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} className={inputStyle} /></div>
              </div>
              <div className="flex flex-col"><label className={labelStyle}>Notes</label><input type="text" placeholder="Optional" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputStyle} /></div>
              <div className="flex flex-col"><label className={labelStyle}>Next Due Date</label><input type="date" value={form.nextDue} onChange={e => setForm({ ...form, nextDue: e.target.value })} className={inputStyle} /></div>
              <Button type="submit" disabled={submitLoading} className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] rounded-none text-[10px] tracking-[0.2em] uppercase py-6">
                {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Maintenance'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9]">
          <CardContent className="pt-0 px-0 overflow-auto">
            {loading ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#1A1A1A]" /></div> : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[#DCD7CB] hover:bg-transparent">
                    <TableHead className="pl-8 py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Date</TableHead>
                    <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Type</TableHead>
                    <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Vendor</TableHead>
                    <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Next Due</TableHead>
                    <TableHead className="pr-8 py-6 text-right text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length > 0 ? logs.map((l: any) => (
                    <TableRow key={l.id} className="border-[#DCD7CB] hover:bg-[#F9F8F4] transition-colors">
                      <TableCell className="pl-8 py-5 text-sm font-mono text-[#8C877D]">{new Date(l.servicedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="py-5 text-sm font-light">{l.maintenanceType}</TableCell>
                      <TableCell className="py-5 text-sm text-[#8C877D]">{l.vendor || '—'}</TableCell>
                      <TableCell className="py-5 text-sm font-mono text-[#8C877D]">{l.nextDue ? new Date(l.nextDue).toLocaleDateString() : '—'}</TableCell>
                      <TableCell className="pr-8 py-5 text-right text-sm font-['Playfair_Display',_serif]">₹{l.cost?.toLocaleString()}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={5} className="text-center py-20"><p className="text-sm text-[#8C877D] font-light italic">No maintenance records for this vehicle.</p></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
