"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Truck, Loader2, Plus, X } from "lucide-react";
import { fleetAPI } from '@/lib/api';
import { TopBar } from '@/Components/ui/top-bar';
import { useRouter } from 'next/navigation';

export default function FleetDashboard() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    vin: '',
    type: 'TRUCK',
    licensePlate: '',
    seatingCapacity: ''
  });
  const [submitError, setSubmitError] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const fleetRes = await fleetAPI.getAll();
      if (!fleetRes.error && fleetRes.data) {
        setVehicles(fleetRes.data.reverse());
      } else {
        console.error(fleetRes.error);
      }
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const finalData = {
        ...formData,
        seatingCapacity: formData.type === 'BUS' ? parseInt(formData.seatingCapacity) : undefined
      };

      const res = await fleetAPI.register(finalData as any);

      if (res.error) {
        setSubmitError(res.error);
      } else {
        setIsRegistering(false);
        setFormData({ vin: '', type: 'TRUCK', licensePlate: '', seatingCapacity: '' });
        fetchVehicles();
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred.');
    }
  };

  const inputStyle = "w-full bg-transparent border-b border-[#DCD7CB] py-4 text-[#1A1A1A] font-light text-base focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none placeholder:text-[#C4BFAF]";
  const labelStyle = "text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-1 block";

  if (loading && vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-[#1A1A1A]" strokeWidth={1.5} />
          <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#8C877D]">Fetching Fleet Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F9F8F4] text-[#1A1A1A] font-sans h-full min-h-screen">
      <TopBar title="Fleet Operations" />

      <div className="p-6 md:p-12 lg:p-16 flex-1 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2">
              Live Registry
            </h3>
            <h2 className="text-5xl font-['Playfair_Display',_serif] tracking-tighter">
              Vehicle Fleet.
            </h2>
          </div>
          {!isRegistering && (
            <Button
              onClick={() => setIsRegistering(true)}
              className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] transition-colors rounded-none text-[10px] tracking-[0.2em] uppercase px-8 py-6 group flex items-center gap-3"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Register Vehicle
            </Button>
          )}
        </div>
        
        {isRegistering ? (
          <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9] mb-16 max-w-2xl mx-auto">
            <CardHeader className="border-b border-[#DCD7CB] pb-6 flex flex-row justify-between items-center">
              <CardTitle className="font-['Playfair_Display',_serif] text-2xl text-[#1A1A1A]">New Registration</CardTitle>
              <Button variant="ghost" onClick={() => setIsRegistering(false)} className="text-[#8C877D] hover:text-[#1A1A1A] p-0 hover:bg-transparent rounded-none">
                <X className="w-5 h-5" strokeWidth={1} />
              </Button>
            </CardHeader>
            <CardContent className="pt-10 px-8 pb-12">
              <form onSubmit={handleRegister} className="flex flex-col gap-10">

                {submitError && (
                  <div className="border border-[#7f1d1d]/20 bg-[#fef2f2] p-4 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-[#7f1d1d] font-semibold">{submitError}</p>
                  </div>
                )}

                <div className="relative flex flex-col">
                  <label className={labelStyle}>Vehicle Type</label>
                  <select
                    value={formData.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, type: e.target.value })}
                    className={`${inputStyle} appearance-none cursor-pointer`}
                  >
                    <option value="TRUCK">Heavy Duty Truck</option>
                    <option value="VAN">Cargo Van</option>
                    <option value="BUS">Passenger Bus</option>
                  </select>
                  <div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">↓</div>
                </div>

                <div className="flex flex-col">
                  <label className={labelStyle}>VIN (Vehicle Identification Number)</label>
                  <input
                    type="text" required
                    placeholder="e.g. 1HGCM82633A004"
                    value={formData.vin}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, vin: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div className="flex flex-col">
                  <label className={labelStyle}>License Plate</label>
                  <input
                    type="text" required
                    placeholder="e.g. MH-12-TR-9901"
                    value={formData.licensePlate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, licensePlate: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                {formData.type === 'BUS' && (
                  <div className="flex flex-col animate-in slide-in-from-top-2 duration-300">
                    <label className={labelStyle}>Seating Capacity</label>
                    <input
                      type="number" required min="1" max="150"
                      placeholder="e.g. 45"
                      value={formData.seatingCapacity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, seatingCapacity: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <Button type="submit" disabled={loading} className="flex-1 bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] transition-colors rounded-none text-[10px] tracking-[0.2em] uppercase py-6">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> : 'Confirm Registration'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9]">
            <CardHeader className="border-b border-[#DCD7CB] pb-8 flex flex-row items-center justify-between">
              <CardTitle className="font-['Playfair_Display',_serif] text-2xl flex items-center gap-4 text-[#1A1A1A]">
                <Truck className="w-6 h-6 text-[#1A1A1A]" strokeWidth={1} />
                Active Manifest
              </CardTitle>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">
                Total Units: {vehicles.length}
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#DCD7CB] hover:bg-transparent">
                    <TableHead className="pl-8 py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Identity / VIN</TableHead>
                    <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Type Details</TableHead>
                    <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">License Plate</TableHead>
                    <TableHead className="pr-8 py-6 text-right text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.length > 0 ? vehicles.map((v: any) => (
                    <TableRow 
                      key={v.id} 
                      onClick={() => router.push(`/dashboard/fleet/${v.id}`)}
                      className="border-[#DCD7CB] hover:bg-[#F9F8F4] transition-colors cursor-pointer"
                    >
                      <TableCell className="pl-8 py-5 font-mono text-sm text-[#1A1A1A]">{v.vin}</TableCell>
                      <TableCell className="py-5 text-[10px] uppercase tracking-[0.2em] text-[#8C877D] font-semibold">
                        {v.type} {v.type === 'BUS' && <span className="text-[#1A1A1A] font-light">({v.seatingCapacity} SEATS)</span>}
                      </TableCell>
                      <TableCell className="py-5 text-sm font-light tracking-wide text-[#1A1A1A]">
                        {v.licensePlate}
                      </TableCell>
                      <TableCell className="pr-8 py-5 text-right">
                        <Badge
                          variant="outline"
                          className={`rounded-none text-[9px] font-bold uppercase tracking-widest px-3 py-1 ${v.status === 'IDLE'
                              ? 'border-[#8C877D] text-[#8C877D]'
                              : 'border-[#1A1A1A] text-[#1A1A1A]'
                            }`}
                        >
                          {v.status || 'ACTIVE'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20">
                        <p className="text-sm text-[#8C877D] font-light italic">No manifest anomalies detected. Fleet ledger is empty.</p>
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