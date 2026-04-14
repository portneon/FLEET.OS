"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Truck, Users, Activity, Banknote, Bell, Loader2 } from "lucide-react";
import { staffAPI, fleetAPI } from '@/lib/api';

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
        const [staffRes, fleetRes] = await Promise.all([
          staffAPI.getAll(),
          fleetAPI.getAll()
        ]);

        if (!staffRes.error && staffRes.data) {
          setStaff(staffRes.data);
          // Calculate driver count dynamically
          const driverCount = staffRes.data.filter((m: any) => m.role === 'DRIVER').length;
          setStats(prev => ({ ...prev, driversOnDuty: driverCount }));
        }

        if (!fleetRes.error && fleetRes.data) {
          setStats(prev => ({ ...prev, activeFleet: fleetRes.data.length }));
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
    <div className="flex-1 flex flex-col bg-[#FBFBF9] text-[#1A1A1A] font-sans h-full">
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
        </div>
    </div>
  );
}