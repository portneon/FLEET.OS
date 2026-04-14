"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, Plus, Bell } from "lucide-react";
import { staffAPI } from '@/lib/api';

export default function StaffDashboard() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleName: 'DRIVER',
    licenseNumber: '',
    experience: ''
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await staffAPI.getAll();
      if (!res.error && res.data) {
        setStaff(res.data);
      } else {
        console.error(res.error);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const finalData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        roleName: formData.roleName
      };

      if (formData.roleName === 'DRIVER') {
        finalData.licenseNumber = formData.licenseNumber;
        finalData.experience = parseInt(formData.experience);
      }
      
      const res = await staffAPI.register(finalData);
      
      if (res.error) {
        setSubmitError(res.error);
      } else {
        setIsRegistering(false);
        setFormData({ name: '', email: '', password: '', roleName: 'DRIVER', licenseNumber: '', experience: '' });
        fetchStaff();
      }
    } catch (error) {
        setSubmitError('An unexpected error occurred.');
    }
  };

  if (loading && staff.length === 0) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center -m-6 h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-[#8C877D]" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8C877D]">Fetching Workforce Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#FBFBF9] text-[#1A1A1A] font-sans h-full">
        {/* TOP BAR */}
        <header className="flex items-center justify-between p-6 border-b border-[#EBE6DD] bg-[#FBFBF9]/80 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-lg font-light tracking-wide">Workforce Management</h2>
          <div className="flex items-center gap-6">
            <Bell className="w-4 h-4 text-[#8C877D]" />
            <div className="w-8 h-8 bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-serif italic">A</div>
          </div>
        </header>

        <div className="p-6 md:p-12 lg:p-16 flex-1 overflow-auto">
          {/* HEADER AREA */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2">Personnel Ledger</h3>
              <h2 className="text-5xl font-['Playfair_Display',serif] tracking-tighter">Staff Directory.</h2>
            </div>
            {!isRegistering && (
              <Button onClick={() => setIsRegistering(true)} className="bg-[#1A1A1A] text-white rounded-none text-[10px] tracking-[0.2em] uppercase px-8 py-6 group flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#C4BFAF] group-hover:text-white transition-colors" />
                Register Personnel
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
                  {submitError && <p className="text-[#8B3A3A] bg-[#FDF4F4] border border-[#F4DADA] px-4 py-2 text-xs uppercase tracking-widest">{submitError}</p>}
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Full Name</label>
                    <input 
                      type="text" required
                      value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="border border-[#EBE6DD] p-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-transparent rounded-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Email Address</label>
                    <input 
                      type="email" required
                      value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="border border-[#EBE6DD] p-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-transparent rounded-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Temporary Password</label>
                    <input 
                      type="password" required
                      value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="border border-[#EBE6DD] p-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-transparent rounded-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Assigned Role</label>
                    <select 
                      value={formData.roleName} 
                      onChange={(e) => setFormData({...formData, roleName: e.target.value})}
                      className="border border-[#EBE6DD] p-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-transparent rounded-none"
                    >
                      <option value="DRIVER">DRIVER</option>
                      <option value="MECHANIC">MECHANIC</option>
                      <option value="DISPATCHER">DISPATCHER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>

                  {formData.roleName === 'DRIVER' && (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">License Number</label>
                        <input 
                          type="text" required
                          value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                          className="border border-[#EBE6DD] p-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-transparent rounded-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Years of Experience</label>
                        <input 
                          type="number" required
                          value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})}
                          className="border border-[#EBE6DD] p-3 text-sm focus:outline-none focus:border-[#1A1A1A] bg-transparent rounded-none"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={loading} className="bg-[#1A1A1A] text-white rounded-none text-[10px] tracking-[0.2em] uppercase px-10 py-6">
                      Create Profile
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
              <CardHeader className="border-b border-[#EBE6DD] pb-8 flex flex-row justify-between items-center">
                <CardTitle className="font-['Playfair_Display',serif] text-2xl flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#8C877D]"/> Workforce Ledger
                </CardTitle>
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D]">Total: {staff.length}</div>
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
                        <TableCell className="text-[10px] uppercase tracking-widest text-[#8C877D] font-bold">
                          {member.driverProfile ? "Served (Driver)" : `Service (${member.role})`}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-medium tracking-wider text-[#1A1A1A]">
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
          )}
        </div>
    </div>
  );
}
