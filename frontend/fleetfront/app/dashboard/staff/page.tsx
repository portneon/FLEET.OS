"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, Plus, Bell, X } from "lucide-react";
import { staffAPI } from '@/lib/api';

export default function StaffDashboard() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [staffHistoryLoading, setStaffHistoryLoading] = useState(false);

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

        setStaff(res.data.reverse());
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

  const openStaffProfile = async (staffMember: any) => {
    setSelectedStaff(staffMember);
    setStaffHistoryLoading(true);
    try {
      const res = await staffAPI.getHistory(staffMember.id);
      if (!res.error && res.data) {
        setSelectedStaff(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setStaffHistoryLoading(false);
    }
  };

  const closeStaffProfile = () => {
    setSelectedStaff(null);
  };

  const inputStyle = "w-full bg-transparent border-b border-[#DCD7CB] py-4 text-[#1A1A1A] font-light text-base focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none placeholder:text-[#C4BFAF]";
  const labelStyle = "text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-1 block";

  if (loading && staff.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-[#1A1A1A]" strokeWidth={1.5} />
          <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#8C877D]">Fetching Workforce Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F9F8F4] text-[#1A1A1A] font-sans h-full min-h-screen">


      <header className="flex items-center justify-between p-6 border-b border-[#DCD7CB] bg-[#F9F8F4]/80 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-lg font-light tracking-wide">Workforce Management</h2>
        <div className="flex items-center gap-6">
          <Bell className="w-5 h-5 text-[#8C877D] hover:text-[#1A1A1A] cursor-pointer transition-colors" strokeWidth={1} />
          <div className="w-8 h-8 bg-[#1A1A1A] text-[#F9F8F4] flex items-center justify-center text-xs font-serif italic border border-[#1A1A1A]">
            A
          </div>
        </div>
      </header>

      <div className="p-6 md:p-12 lg:p-16 flex-1 overflow-auto">


        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2">
              Personnel Ledger
            </h3>
            <h2 className="text-5xl font-['Playfair_Display',_serif] tracking-tighter">
              Staff Directory.
            </h2>
          </div>
          {!isRegistering && staff.length > 0 && !selectedStaff && (
            <Button
              onClick={() => setIsRegistering(true)}
              className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] transition-colors rounded-none text-[10px] tracking-[0.2em] uppercase px-8 py-6 group flex items-center gap-3"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Register Personnel
            </Button>
          )}
        </div>
        
        {/* CONDITIONAL RENDERING */}
        {selectedStaff ? (
          <div className="animate-in fade-in duration-500">
            <Button
              onClick={closeStaffProfile}
              variant="outline"
              className="mb-8 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F8F4] transition-colors rounded-none text-[10px] tracking-[0.2em] uppercase px-6 py-4"
            >
              ← Back to Directory
            </Button>

            <div className="bg-[#FFFFFF] border border-[#DCD7CB] p-8 md:p-12 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#8C877D] font-semibold mb-2">
                    Personnel Profile
                  </h3>
                  <h2 className="text-4xl font-['Playfair_Display',_serif] text-[#1A1A1A] tracking-wide">
                    {selectedStaff.name}
                  </h2>
                  <div className="flex gap-4 mt-4">
                    <Badge variant="outline" className="border-[#1A1A1A] text-[#1A1A1A] rounded-none px-3 py-1 text-[9px] uppercase tracking-widest font-bold">
                      {selectedStaff.role}
                    </Badge>
                    {selectedStaff.driverProfile && (
                      <Badge variant="outline" className="border-[#8C877D] text-[#8C877D] rounded-none px-3 py-1 text-[9px] uppercase tracking-widest font-bold">
                        {selectedStaff.driverProfile.experience} YRS EXP
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest text-[#8C877D] mb-1">Date Joined</p>
                  <p className="text-sm text-[#1A1A1A] font-light">{new Date(selectedStaff.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {staffHistoryLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A]" strokeWidth={1} />
                </div>
              ) : selectedStaff.driverProfile ? (
                <div>
                  {/* Driver Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 border-t border-[#DCD7CB] pt-8">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-[#8C877D] font-semibold mb-4">Duty Matrix</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#F9F8F4] p-6 border border-[#DCD7CB]">
                          <p className="text-[9px] uppercase tracking-widest text-[#8C877D] mb-2">Total Trips</p>
                          <p className="text-3xl font-light font-['Playfair_Display',_serif]">{selectedStaff.driverProfile.trips?.length || 0}</p>
                        </div>
                        <div className="bg-[#F9F8F4] p-6 border border-[#DCD7CB]">
                          <p className="text-[9px] uppercase tracking-widest text-[#8C877D] mb-2">License Ref.</p>
                          <p className="text-sm font-medium mt-2">{selectedStaff.driverProfile.licenseNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trip Ledger */}
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-[#8C877D] font-semibold mb-6 flex items-center gap-2">
                       Operational Ledger (Historical Runs)
                    </h4>
                    
                    {selectedStaff.driverProfile.trips?.length > 0 ? (
                      <div className="space-y-4">
                        {selectedStaff.driverProfile.trips.map((trip: any) => {
                          let durationStr = "N/A";
                          if (trip.actualStart && trip.actualEnd) {
                            const diff = new Date(trip.actualEnd).getTime() - new Date(trip.actualStart).getTime();
                            const mins = Math.floor(diff / 60000);
                            const hrs = Math.floor(mins / 60);
                            durationStr = hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
                          }

                          return (
                            <div key={trip.id} className="border border-[#DCD7CB] p-6 flex justify-between items-center bg-[#FDFCF9] hover:border-[#1A1A1A] transition-colors">
                              <div>
                                <p className="font-['Playfair_Display',_serif] text-lg text-[#1A1A1A]">{trip.route?.name || 'Unassigned Route'}</p>
                                <p className="text-[10px] uppercase tracking-widest text-[#8C877D] mt-1">Date: {new Date(trip.scheduledStart).toLocaleDateString()}</p>
                              </div>
                              <div className="flex gap-12 text-right">
                                <div>
                                  <p className="text-[9px] uppercase tracking-widest text-[#8C877D] mb-1">Vehicle</p>
                                  <p className="text-sm text-[#1A1A1A] font-light">{trip.vehicle?.licensePlate || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] uppercase tracking-widest text-[#8C877D] mb-1">Duration</p>
                                  <p className="text-sm text-[#1A1A1A] font-light">{durationStr}</p>
                                </div>
                                <div className="w-24">
                                  <p className="text-[9px] uppercase tracking-widest text-[#8C877D] mb-1">Status</p>
                                  <Badge variant="outline" className={`rounded-none text-[9px] uppercase tracking-widest ${trip.status === 'COMPLETED' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-[#8C877D] text-[#8C877D]'}`}>
                                    {trip.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-16 border border-dashed border-[#DCD7CB]">
                        <p className="text-sm text-[#8C877D] font-light italic">No historical runs recorded for this staff member.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 border-t border-[#DCD7CB]">
                  <p className="text-sm text-[#8C877D] font-light italic">Detailed metrics are only available for dispatch drivers.</p>
                </div>
              )}
            </div>
          </div>
        ) : isRegistering ? (
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

                <div className="flex flex-col">
                  <label className={labelStyle}>Full Name</label>
                  <input
                    type="text" required placeholder="e.g. Michael Chen"
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div className="flex flex-col">
                  <label className={labelStyle}>Email Address</label>
                  <input
                    type="email" required placeholder="e.g. m.chen@company.com"
                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div className="flex flex-col">
                  <label className={labelStyle}>Temporary Password</label>
                  <input
                    type="password" required placeholder="••••••••"
                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={inputStyle}
                  />
                </div>

                <div className="relative flex flex-col">
                  <label className={labelStyle}>Assigned Role</label>
                  <select
                    value={formData.roleName}
                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                    className={`${inputStyle} appearance-none cursor-pointer`}
                  >
                    <option value="DRIVER">Driver</option>
                    <option value="MECHANIC">Mechanic</option>
                    <option value="DISPATCHER">Dispatcher</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                  <div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">↓</div>
                </div>

                {formData.roleName === 'DRIVER' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col">
                      <label className={labelStyle}>License Number</label>
                      <input
                        type="text" required placeholder="e.g. MH1420110062821"
                        value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        className={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className={labelStyle}>Years of Experience</label>
                      <input
                        type="number" required placeholder="e.g. 5" min="0" max="50"
                        value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className={inputStyle}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <Button type="submit" disabled={loading} className="flex-1 bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] transition-colors rounded-none text-[10px] tracking-[0.2em] uppercase py-6">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> : 'Create Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-[#DCD7CB] shadow-none rounded-none bg-[#FDFCF9]">
            <CardHeader className="border-b border-[#DCD7CB] pb-8 flex flex-row justify-between items-center">
              <CardTitle className="font-['Playfair_Display',_serif] text-2xl flex items-center gap-4 text-[#1A1A1A]">
                <Users className="w-6 h-6 text-[#1A1A1A]" strokeWidth={1} /> Workforce Ledger
              </CardTitle>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">
                Total Personnel: {staff.length}
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#DCD7CB] hover:bg-transparent">
                    <TableHead className="pl-8 py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Entity</TableHead>
                    <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Classification</TableHead>
                    <TableHead className="py-6 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Identity</TableHead>
                    <TableHead className="pr-8 py-6 text-right text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.length > 0 ? staff.map((member: any) => (
                    <TableRow 
                      key={member.id} 
                      onClick={() => openStaffProfile(member)}
                      className="border-[#DCD7CB] hover:bg-[#F9F8F4] transition-colors cursor-pointer"
                    >
                      <TableCell className="pl-8 py-5 font-medium text-sm text-[#1A1A1A]">{member.name}</TableCell>
                      <TableCell className="py-5 text-[10px] uppercase tracking-[0.2em] text-[#8C877D] font-semibold">
                        {member.driverProfile ? "Driver" : member.role}
                      </TableCell>
                      <TableCell className="py-5 text-sm font-light tracking-wide text-[#1A1A1A]">
                        {member.driverProfile?.licenseNumber || member.email.split('@')[0]}
                      </TableCell>
                      <TableCell className="pr-8 py-5 text-right">
                        <Badge
                          variant="outline"
                          className="rounded-none border-[#1A1A1A] text-[#1A1A1A] text-[9px] font-bold uppercase tracking-widest px-3 py-1"
                        >
                          {member.driverProfile ? "Verified" : "Authorized"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-24">
                        <p className="text-sm text-[#8C877D] font-light italic mb-6">
                          Ledger is currently empty.
                        </p>
                        <Button
                          onClick={() => setIsRegistering(true)}
                          variant="outline"
                          className="border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F8F4] transition-colors rounded-none text-[10px] tracking-[0.2em] uppercase px-8 py-6 inline-flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" strokeWidth={1.5} />
                          Add Your Staff
                        </Button>
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