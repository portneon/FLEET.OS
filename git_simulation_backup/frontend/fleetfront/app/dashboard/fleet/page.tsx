"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Truck, Loader2, Plus, Bell } from "lucide-react";
import { fleetAPI } from '@/lib/api';

export default function FleetDashboard() {
  const [vehicles, setVehicles] = useState([]);
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
        setVehicles(fleetRes.data);
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

  if (loading && vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-[#8C877D]" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C877D]">Fetching Fleet Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#FBFBF9] text-[#1A1A1A] font-sans h-full">
      {/* TOP BAR */}
      <header className="flex items-center justify-between p-6 border-b border-[#EBE6DD] bg-[#FBFBF9]/80 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-lg font-light tracking-wide">Fleet Operations</h2>
        <div className="flex items-center gap-6">
          <Bell className="w-4 h-4 text-[#8C877D]" />
          <div className="w-8 h-8 bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-serif italic">A</div>
        </div>
      </header>

      <div className="p-6 md:p-12 lg:p-16 flex-1 overflow-auto">
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2">Live Registry</h3>
            <h2 className="text-5xl font-['Playfair_Display',serif] tracking-tighter">Vehicle Fleet.</h2>
          </div>
          {!isRegistering && (
            <Button onClick={() => setIsRegistering(true)} className="bg-[#1A1A1A] text-white rounded-none text-[10px] tracking-[0.2em] uppercase px-8 py-6 group flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#C4BFAF] group-hover:text-white transition-colors" />
              Register Vehicle
            </Button>
          )}
        </div>

        {isRegistering ? (
          <Card className="border-[#EBE6DD] shadow-none rounded-none bg-white mb-16 max-w-2xl">
            <CardHeader className="border-b border-[#EBE6DD] pb-6">
              <CardTitle className="font-['Playfair_Display',serif] text-2xl">New Registration</CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleRegister} className="flex flex-col gap-6">
                {submitError && <p className="text-red-500 text-xs uppercase tracking-widest">{submitError}</p>}

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Vehicle Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="border border-[#EBE6DD] p-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-transparent rounded-none"
                  >
                    <option value="TRUCK">TRUCK</option>
                    <option value="VAN">VAN</option>
                    <option value="BUS">BUS</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">VIN (Vehicle Identification Number)</label>
                  <input
                    type="text" required
                    value={formData.vin} onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    className="border border-[#EBE6DD] p-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-transparent rounded-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">License Plate</label>
                  <input
                    type="text" required
                    value={formData.licensePlate} onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    className="border border-[#EBE6DD] p-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-transparent rounded-none"
                  />
                </div>

                {formData.type === 'BUS' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Seating Capacity</label>
                    <input
                      type="number" required
                      value={formData.seatingCapacity} onChange={(e) => setFormData({ ...formData, seatingCapacity: e.target.value })}
                      className="border border-[#EBE6DD] p-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-transparent rounded-none"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading} className="bg-[#1A1A1A] text-white rounded-none text-[10px] tracking-[0.2em] uppercase px-10 py-6">
                    Confirm Registration
                  </Button>
                  <Button type="button" onClick={() => setIsRegistering(false)} variant="outline" className="rounded-none text-[10px] tracking-[0.2em] uppercase px-10 py-6 border-[#EBE6DD]">
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
                <Truck className="w-5 h-5 text-[#8C877D]" />
                Active Manifest
              </CardTitle>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Total: {vehicles.length}</div>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#EBE6DD] hover:bg-transparent px-8">
                    <TableHead className="pl-8 text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Identity</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Type</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">License Plate</TableHead>
                    <TableHead className="pr-8 text-right text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.length > 0 ? vehicles.map((v: any) => (
                    <TableRow key={v.id} className="border-[#F5F2ED] hover:bg-[#FBFBF9] transition-colors px-8">
                      <TableCell className="pl-8 font-mono text-sm py-6">{v.vin}</TableCell>
                      <TableCell className="text-[10px] uppercase tracking-widest text-[#8C877D] font-bold">
                        {v.type} {v.type === 'BUS' && `(${v.seatingCapacity} SEATS)`}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-medium tracking-wider">
                        {v.licensePlate}
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <Badge variant="outline" className={`rounded-none border-[#1A1A1A] text-[9px] font-bold uppercase tracking-tighter px-3 ${v.status === 'IDLE' ? 'text-[#8C877D] border-[#EBE6DD]' : 'text-[#1A1A1A]'}`}>
                          {v.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-[#C4BFAF] italic">No manifest anomalies detected. Fleet is empty.</TableCell></TableRow>
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
