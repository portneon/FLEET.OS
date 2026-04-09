import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Truck, Users, Activity, Banknote, Menu, Bell } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-background p-6">
        <div className="mb-12">
          <h1 className="text-2xl font-['Playfair_Display',serif] tracking-tight">System</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground mt-1">
            Admin Console
          </p>
        </div>
        <nav className="flex flex-col gap-4 flex-1">
          {['Overview', 'Operators', 'Fleet Status', 'Financials', 'Settings'].map((item, i) => (
            <a 
              key={i} 
              href="#" 
              className={`text-sm font-light tracking-wide py-2 border-b ${i === 0 ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'} transition-colors`}
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="mt-auto">
           <Button variant="outline" className="w-full text-xs tracking-widest uppercase rounded-none border-border">
             Sign Out
           </Button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col">
        
        {/* MOBILE HEADER & DESKTOP TOP BAR */}
        <header className="flex items-center justify-between p-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="md:hidden flex items-center gap-4">
            <Menu className="w-5 h-5 text-muted-foreground" />
            <span className="font-['Playfair_Display',serif] text-xl">System</span>
          </div>
          <div className="hidden md:block">
             <h2 className="text-lg font-light tracking-wide">Operations Overview</h2>
          </div>
          <div className="flex items-center gap-6">
            <Bell className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
            <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center text-xs font-serif">
              A
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="p-6 md:p-12 lg:p-16 flex-1 overflow-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-2">
                Today's Summary
              </h3>
              <h2 className="text-4xl font-['Playfair_Display',serif] tracking-tight">
                Welcome back, Admin.
              </h2>
            </div>
            <Button className="rounded-none text-xs tracking-widest uppercase px-8 py-6">
              Generate Report
            </Button>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total Revenue", value: "₹428,500", icon: Banknote, trend: "+12.5% this week" },
              { label: "Active Fleet", value: "142", icon: Truck, trend: "12 units offline" },
              { label: "Drivers on Duty", value: "118", icon: Users, trend: "4 pending approvals" },
              { label: "System Alerts", value: "3", icon: Activity, trend: "Requires attention" },
            ].map((stat, i) => (
              <Card key={i} className="border-border shadow-none bg-card rounded-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-light font-['Playfair_Display',serif]">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-2 font-light">
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* RECENT ACTIVITY TABLE */}
          <Card className="border-border shadow-none rounded-none">
            <CardHeader className="border-b border-border pb-6">
              <CardTitle className="font-['Playfair_Display',serif] text-2xl">Recent Registrations</CardTitle>
              <CardDescription className="text-xs font-light tracking-wide text-muted-foreground">
                Latest operator and driver sign-ups requiring verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Entity Name</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Type</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: "Apex Logistics", type: "Truck Operator", status: "Pending" },
                    { name: "Arjun Kumar", type: "Driver", status: "Verified" },
                    { name: "Coastal Transits", type: "Bus Operator", status: "Pending" },
                    { name: "Michael Chen", type: "Driver", status: "In Review" },
                  ].map((row, i) => (
                    <TableRow key={i} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-sm">{row.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.type}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`rounded-none text-[10px] uppercase tracking-wider ${
                            row.status === 'Verified' ? 'border-green-900/30 text-green-900' : 
                            'border-foreground text-foreground'
                          }`}
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" className="text-xs hover:bg-transparent hover:underline rounded-none">
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}