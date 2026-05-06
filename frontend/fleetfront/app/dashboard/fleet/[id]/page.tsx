"use client"

import React, { useEffect, useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Loader2, ArrowLeft, Wrench, Fuel, Activity, Calendar, Map as MapRoute } from "lucide-react";
import { fleetAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'maintenance' | 'fuel' | 'trips' | 'performance'>('trips');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fleetAPI.getHistory(id);
        if (!res.error && res.data) {
          setVehicle(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F9F8F4]">
        <Loader2 className="w-6 h-6 animate-spin text-[#1A1A1A]" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#F9F8F4]">
        <h2 className="text-2xl font-['Playfair_Display',_serif] mb-4">Vehicle Not Found</h2>
        <Button onClick={() => router.push('/dashboard/fleet')} variant="outline" className="rounded-none border-[#1A1A1A] text-[#1A1A1A]">
          Return to Fleet
        </Button>
      </div>
    );
  }

  // Derived Performance Metrics
  const trips = vehicle.trips || [];
  const completedTrips = trips.filter((t: any) => t.status === 'COMPLETED');
  const onTimeRate = trips.length > 0 ? ((completedTrips.length / trips.length) * 100).toFixed(0) : 0;
  
  const totalRevenue = trips.reduce((sum: number, trip: any) => {
    const bookings = trip.bookings || [];
    return sum + bookings.reduce((bSum: number, b: any) => bSum + Number(b.amount || 0), 0);
  }, 0);

  const fuelLogs = vehicle.fuelLogs || [];
  const totalFuelCost = fuelLogs.reduce((sum: number, f: any) => sum + f.cost, 0);

  const maintenanceLogs = vehicle.maintenanceLogs || [];
  const totalMaintenanceCost = maintenanceLogs.reduce((sum: number, m: any) => sum + m.cost, 0);

  return (
    <div className="flex-1 flex flex-col bg-[#F9F8F4] min-h-screen text-[#1A1A1A] font-sans">
      <div className="border-b border-[#DCD7CB] bg-[#FDFCF9] px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between sticky top-0 z-10 gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.push('/dashboard/fleet')} variant="ghost" className="rounded-none hover:bg-[#E5E3DB] px-2 h-10 w-10 p-0 text-[#8C877D] hover:text-[#1A1A1A]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-['Playfair_Display',_serif] text-[#1A1A1A]">{vehicle.licensePlate}</h1>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="border-[#1A1A1A] text-[#1A1A1A] rounded-none px-2 py-0.5 text-[9px] uppercase tracking-widest">{vehicle.vin}</Badge>
              <Badge variant="outline" className="border-[#8C877D] text-[#8C877D] rounded-none px-2 py-0.5 text-[9px] uppercase tracking-widest">{vehicle.type}</Badge>
              <Badge variant="outline" className={`rounded-none px-2 py-0.5 text-[9px] uppercase tracking-widest ${vehicle.status === 'IDLE' ? 'border-[#8C877D] text-[#8C877D]' : 'border-[#1A1A1A] text-[#1A1A1A]'}`}>{vehicle.status}</Badge>
            </div>
          </div>
        </div>
        <div className="flex bg-[#E5E3DB] p-1 gap-1">
          {[
            { id: 'trips', label: 'Travel', icon: MapRoute },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            { id: 'fuel', label: 'Fuel', icon: Fuel },
            { id: 'performance', label: 'Performance', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2 text-[10px] uppercase tracking-widest transition-colors font-semibold ${activeTab === tab.id ? 'bg-[#1A1A1A] text-[#F9F8F4]' : 'text-[#8C877D] hover:text-[#1A1A1A]'}`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {activeTab === 'trips' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-['Playfair_Display',_serif] mb-6">Historical Runs</h2>
            {trips.length > 0 ? (
              <div className="space-y-4">
                {trips.map((trip: any) => {
                  const revenue = (trip.bookings || []).reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0);
                  return (
                    <Card key={trip.id} className="border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none">
                      <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm uppercase tracking-wider">{trip.route?.name || 'Custom Route'}</h3>
                          <div className="flex gap-4 mt-2 text-xs text-[#8C877D]">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(trip.scheduledStart).toLocaleDateString()}</span>
                            <span>Driver: {trip.driver?.user?.name || 'Unassigned'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-8 text-right">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#8C877D] mb-1">Status</p>
                            <Badge variant="outline" className="rounded-none border-[#1A1A1A] text-[9px]">{trip.status}</Badge>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#8C877D] mb-1">Revenue</p>
                            <p className="font-mono text-sm font-semibold">₹{revenue.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-[#DCD7CB] bg-[#FDFCF9]">
                <p className="text-sm text-[#8C877D] italic font-light">No travel history available.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-['Playfair_Display',_serif] mb-6">Service & Repairs</h2>
            <Card className="border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#DCD7CB] hover:bg-transparent">
                    <TableHead className="text-[9px] uppercase tracking-widest text-[#8C877D] py-4 pl-6">Service Type</TableHead>
                    <TableHead className="text-[9px] uppercase tracking-widest text-[#8C877D] py-4">Date</TableHead>
                    <TableHead className="text-[9px] uppercase tracking-widest text-[#8C877D] py-4">Next Due</TableHead>
                    <TableHead className="text-[9px] uppercase tracking-widest text-[#8C877D] py-4 text-right pr-6">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceLogs.length === 0 ? (
                     <TableRow>
                       <TableCell colSpan={4} className="text-center py-12 text-[#8C877D] italic text-sm font-light">No maintenance records found.</TableCell>
                     </TableRow>
                  ) : maintenanceLogs.map((log: any) => (
                    <TableRow key={log.id} className="border-[#DCD7CB] hover:bg-[#F9F8F4]">
                      <TableCell className="pl-6 py-4 font-medium text-sm">{log.maintenanceType}</TableCell>
                      <TableCell className="py-4 text-sm font-light">{new Date(log.servicedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="py-4 text-sm font-light">
                        {log.nextDue ? new Date(log.nextDue).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="pr-6 py-4 text-right font-mono text-sm">₹{log.cost.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {activeTab === 'fuel' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-['Playfair_Display',_serif] mb-6">Fuel Consumption</h2>
            <Card className="border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#DCD7CB] hover:bg-transparent">
                    <TableHead className="text-[9px] uppercase tracking-widest text-[#8C877D] py-4 pl-6">Date</TableHead>
                    <TableHead className="text-[9px] uppercase tracking-widest text-[#8C877D] py-4">Odometer</TableHead>
                    <TableHead className="text-[9px] uppercase tracking-widest text-[#8C877D] py-4">Liters</TableHead>
                    <TableHead className="text-[9px] uppercase tracking-widest text-[#8C877D] py-4 text-right pr-6">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fuelLogs.length === 0 ? (
                     <TableRow>
                       <TableCell colSpan={4} className="text-center py-12 text-[#8C877D] italic text-sm font-light">No fuel records found.</TableCell>
                     </TableRow>
                  ) : fuelLogs.map((log: any) => (
                    <TableRow key={log.id} className="border-[#DCD7CB] hover:bg-[#F9F8F4]">
                      <TableCell className="pl-6 py-4 text-sm font-light">{new Date(log.filledAt).toLocaleDateString()}</TableCell>
                      <TableCell className="py-4 text-sm font-light">{log.odometer.toLocaleString()} km</TableCell>
                      <TableCell className="py-4 text-sm font-light">{log.liters} L</TableCell>
                      <TableCell className="pr-6 py-4 text-right font-mono text-sm">₹{log.cost.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-['Playfair_Display',_serif] mb-6">KPIs & Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none border-l-4 border-l-[#1A1A1A]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[9px] uppercase tracking-widest text-[#8C877D]">Total Trips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-['Playfair_Display',_serif] text-[#1A1A1A]">{trips.length}</div>
                </CardContent>
              </Card>
              <Card className="border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none border-l-4 border-l-[#1A1A1A]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[9px] uppercase tracking-widest text-[#8C877D]">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-['Playfair_Display',_serif] text-[#1A1A1A]">{onTimeRate}%</div>
                </CardContent>
              </Card>
              <Card className="border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none border-l-4 border-l-[#1A1A1A]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[9px] uppercase tracking-widest text-[#8C877D]">Fuel Expense</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-['Playfair_Display',_serif] text-[#1A1A1A]">₹{totalFuelCost.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none border-l-4 border-l-[#1A1A1A]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[9px] uppercase tracking-widest text-[#8C877D]">Maint. Expense</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-['Playfair_Display',_serif] text-[#1A1A1A]">₹{totalMaintenanceCost.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none border-l-4 border-l-[#1A1A1A] md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[9px] uppercase tracking-widest text-[#8C877D]">Lifetime Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-['Playfair_Display',_serif] text-[#1A1A1A]">₹{totalRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
