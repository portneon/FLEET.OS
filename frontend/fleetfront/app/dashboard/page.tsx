"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Truck, Users, Activity, Banknote, Bell, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    activeFleet: 0,
    driversOnDuty: 0,
    alerts: 0
  });


  useEffect(() => {
    const syncSystemData = async () => {
      try {
        const orgId = localStorage.getItem('orgId'); 
        const headers = { 'x-organization-id': orgId || '' };

    
        const [staffRes, fleetRes] = await Promise.all([
          fetch('/api/staff', { headers }),
          fetch('/api/fleet', { headers })
        ]);

        const staffData = await staffRes.json();
        const fleetData = await fleetRes.json();

        if (staffData.data) {
          setStaff(staffData.data);
          // Calculate 'Served' entities vs 'Service' entities dynamically
          const driverCount = staffData.data.filter((m: any) => m.role === 'DRIVER').length;
          setStats(prev => ({ ...prev, driversOnDuty: driverCount }));
        }

        if (fleetData.data) {
          setStats(prev => ({ ...prev, activeFleet: fleetData.data.length }));
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
      <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-[#8C877D]" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C877D]">Initializing System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#1A1A1A] flex flex-col md:flex-row font-sans">
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#EBE6DD] bg-[#FBFBF9] p-6">
        <div className="mb-12">
          <h1 className="text-2xl font-['Playfair_Display',serif] tracking-tight">System</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mt-1">Admin Console</p>
        </div>
        <nav className="flex flex-col gap-4 flex-1">
          {['Overview', 'Fleet', 'Staff', 'Financials'].map((item, i) => (
            <a key={i} href="#" className={`text-sm font-light tracking-wide py-2 border-b ${i === 0 ? 'border-[#1A1A1A]' : 'border-transparent text-[#8C877D] hover:text-[#1A1A1A]'} transition-colors`}>
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="flex items-center justify-between p-6 border-b border-[#EBE6DD] bg-[#FBFBF9]/80 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-lg font-light tracking-wide">Operations Overview</h2>
          <div className="flex items-center gap-6">
            <Bell className="w-4 h-4 text-[#8C877D]" />
            <div className="w-8 h-8 bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-serif italic">A</div>
          </div>
        </header>

        <div className="p-6 md:p-12 lg:p-16 flex-1 overflow-auto">
          {/* WELCOME AREA */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2">Live Status</h3>
              <h2 className="text-5xl font-['Playfair_Display',serif] tracking-tighter">System Overview.</h2>
            </div>
            <Button className="bg-[#1A1A1A] text-white rounded-none text-[10px] tracking-[0.2em] uppercase px-10 py-7">Generate Manifest</Button>
          </div>

          {/* DYNAMIC KPI GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { label: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: Banknote },
              { label: "Active Fleet", value: stats.activeFleet, icon: Truck },
              { label: "Staff/Drivers", value: stats.driversOnDuty, icon: Users },
              { label: "Alerts", value: stats.alerts, icon: Activity },
            ].map((stat, i) => (
              <Card key={i} className="border-[#EBE6DD] shadow-none bg-white rounded-none border-l-4 border-l-[#1A1A1A]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">{stat.label}</CardTitle>
                  <stat.icon className="w-3 h-3 text-[#C4BFAF]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-light font-['Playfair_Display',serif]">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* DYNAMIC WORKFORCE TABLE */}
          <Card className="border-[#EBE6DD] shadow-none rounded-none bg-white">
            <CardHeader className="border-b border-[#EBE6DD] pb-8">
              <CardTitle className="font-['Playfair_Display',serif] text-2xl">Workforce Ledger</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#EBE6DD] hover:bg-transparent px-8">
                    <TableHead className="pl-8 text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Entity</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Classification</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Identity</TableHead>
                    <TableHead className="pr-8 text-right text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.length > 0 ? staff.map((member: any) => (
                    <TableRow key={member.id} className="border-[#F5F2ED] hover:bg-[#FBFBF9] transition-colors px-8">
                      <TableCell className="pl-8 font-medium text-sm py-6">{member.name}</TableCell>
                      <TableCell className="text-[10px] uppercase tracking-widest text-[#8C877D]">
                        {member.driverProfile ? "Served (Driver)" : `Service (${member.role})`}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-[#C4BFAF]">
                        {member.driverProfile?.licenseNumber || member.email.split('@')[0]}
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <Badge variant="outline" className="rounded-none border-[#1A1A1A] text-[#1A1A1A] text-[9px] font-bold uppercase tracking-tighter px-3">
                          {member.driverProfile ? "Verified" : "Authorized"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-[#C4BFAF] italic">No entities provisioned.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}