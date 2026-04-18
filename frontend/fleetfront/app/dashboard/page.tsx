"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Truck, Users, Activity, Banknote, Bell, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { staffAPI, fleetAPI, financeAPI, tripAPI } from '@/lib/api';

import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [staff, setStaff] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]); // Dynamic alerts state
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    activeFleet: 0,
    driversOnDuty: 0,
    alertCount: 0
  });

  useEffect(() => {
    const syncSystemData = async () => {
      try {
        const [staffRes, fleetRes, financeRes, tripsRes] = await Promise.all([
          staffAPI.getAll(),
          fleetAPI.getAll(),
          financeAPI.getSummary(),
          tripAPI.getAll()
        ]);

        if (!staffRes.error && staffRes.data) {
          // Reverses the array so the newest users appear at the top of the table
          setStaff(staffRes.data.reverse());

          const driverCount = staffRes.data.filter((m: any) => m.role === 'DRIVER').length;
          setStats(prev => ({ ...prev, driversOnDuty: driverCount }));
        }

        if (!fleetRes.error && fleetRes.data) {
          setStats(prev => ({ ...prev, activeFleet: fleetRes.data?.length || 0 }));
        }

        if (!financeRes.error && financeRes.data) {
          setStats(prev => ({ ...prev, revenue: financeRes.data.revenue || 0 }));
        }

        if (!tripsRes.error && tripsRes.data) {
          const cancelledTrips = tripsRes.data.filter((t: any) => t.status === 'CANCELLED');
          setStats(prev => ({ ...prev, alertCount: cancelledTrips.length }));
          
          // Generate dynamic notices from cancelled trips
          const notices = cancelledTrips.slice(0, 3).map((t: any) => ({
            title: "Trip Interruption",
            time: new Date(t.updatedAt || t.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            desc: `Trip ${t.id.slice(0, 8)} was cancelled operationaly.`
          }));
          setAlerts(notices);
        }
      } catch (error) {
        console.error("System synchronization failed:", error);
      } finally {
        setLoading(false);
      }
    };

    syncSystemData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-[#1A1A1A]" strokeWidth={1.5} />
          <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#8C877D]">Initializing System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F9F8F4] text-[#1A1A1A] font-sans h-full min-h-screen">

      {/* TOP BAR */}
      <header className="flex items-center justify-between p-6 border-b border-[#DCD7CB] bg-[#F9F8F4]/80 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-lg font-light tracking-wide">Operations Overview</h2>
        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer group">
            <Bell className="w-5 h-5 text-[#8C877D] group-hover:text-[#1A1A1A] transition-colors" strokeWidth={1} />
            {stats.alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#1A1A1A] rounded-full"></span>
            )}
          </div>
          <div className="w-8 h-8 bg-[#1A1A1A] text-[#F9F8F4] flex items-center justify-center text-xs font-serif italic border border-[#1A1A1A]">
            A
          </div>
        </div>
      </header>

      <div className="p-6 md:p-12 lg:p-16 flex-1 overflow-auto">

        {/* KPI CARDS (Moved to the top) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: Banknote, path: '/dashboard/finance' },
            { label: "Active Fleet", value: stats.activeFleet, icon: Truck, path: '/dashboard/fleet' },
            { label: "Staff/Drivers", value: stats.driversOnDuty, icon: Users, path: '/dashboard/staff' },
            { label: "Alerts", value: stats.alertCount, icon: Activity, path: '/dashboard/transit' },
          ].map((stat, i) => (
            <Card 
              key={i} 
              onClick={() => router.push(stat.path)}
              className="border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none border-l-4 border-l-[#1A1A1A] hover:bg-[#FFFFFF] transition-colors cursor-pointer"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">
                  {stat.label}
                </CardTitle>
                <stat.icon className="w-4 h-4 text-[#1A1A1A]" strokeWidth={1} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light font-['Playfair_Display',_serif] text-[#1A1A1A]">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: Dynamic Data Table */}
          <Card className="lg:col-span-2 border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none flex flex-col h-full">
            <CardHeader className="border-b border-[#DCD7CB] pb-6 flex flex-row items-end justify-between">
              <div>
                <CardTitle className="font-['Playfair_Display',_serif] text-2xl text-[#1A1A1A]">Recent Registrations</CardTitle>
                <p className="text-xs font-light tracking-wide text-[#8C877D] mt-2">
                  Latest operator and driver sign-ups in the system.
                </p>
              </div>
              <Button 
                onClick={() => router.push('/dashboard/staff')}
                variant="ghost" 
                className="text-[9px] uppercase tracking-widest text-[#1A1A1A] hover:bg-transparent hover:underline rounded-none p-0"
              >
                View Ledger <ArrowRight className="ml-2 w-3 h-3" strokeWidth={1.5} />
              </Button>
            </CardHeader>
            <CardContent className="pt-0 p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#DCD7CB] hover:bg-transparent">
                    <TableHead className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] py-4 pl-6">Entity Name</TableHead>
                    <TableHead className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] py-4">Role</TableHead>
                    <TableHead className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] py-4 text-right pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Dynamic Rendering: Show empty state if no data, otherwise map first 5 rows */}
                  {staff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12">
                        <p className="text-sm text-[#8C877D] font-light italic">No entity records found in the system.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    staff.slice(0, 5).map((user, i) => (
                      <TableRow key={i} className="border-[#DCD7CB] hover:bg-[#FFFFFF] transition-colors">
                        <TableCell className="font-medium text-sm py-4 pl-6">
                          {user.businessName || user.name || user.email}
                        </TableCell>
                        <TableCell className="text-sm text-[#8C877D] font-light py-4">
                          {user.role}
                        </TableCell>
                        <TableCell className="text-right py-4 pr-6">
                          <Badge
                            variant="outline"
                            className="rounded-none text-[9px] uppercase tracking-widest border-[#1A1A1A] text-[#1A1A1A]"
                          >
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* RIGHT COLUMN: Dynamic System Notices */}
          <Card className="lg:col-span-1 border border-[#DCD7CB] shadow-none bg-[#F9F8F4] rounded-none flex flex-col h-full">
            <CardHeader className="border-b border-[#DCD7CB] pb-6">
              <CardTitle className="font-['Playfair_Display',_serif] text-2xl text-[#1A1A1A]">System Notices</CardTitle>
              <p className="text-xs font-light tracking-wide text-[#8C877D] mt-2">
                Items requiring immediate attention.
              </p>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col gap-4">

              {/* Dynamic Alerts Rendering */}
              {alerts.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center border border-dashed border-[#DCD7CB] bg-[#FDFCF9]">
                  <AlertCircle className="w-6 h-6 text-[#DCD7CB] mb-3" strokeWidth={1} />
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-[#8C877D]">No Pending Notices</p>
                </div>
              ) : (
                alerts.map((notice, i) => (
                  <div key={i} className="flex gap-4 p-4 border border-[#DCD7CB] bg-[#FDFCF9] hover:border-[#1A1A1A] transition-colors group cursor-pointer">
                    <AlertCircle className="w-4 h-4 text-[#8C877D] group-hover:text-[#1A1A1A] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">{notice.title}</h4>
                        <span className="text-[9px] text-[#8C877D] tracking-wider">{notice.time}</span>
                      </div>
                      <p className="text-xs text-[#8C877D] font-light leading-relaxed">
                        {notice.desc}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {alerts.length > 0 && (
                <Button variant="outline" className="w-full mt-4 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F8F4] transition-colors rounded-none text-[10px] tracking-[0.2em] uppercase py-6">
                  Acknowledge All
                </Button>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}