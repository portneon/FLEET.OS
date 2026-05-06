"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Building2, Plus, Loader2, Mail, Phone, MoreHorizontal, X } from "lucide-react";
import { financeAPI } from '@/lib/api';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await financeAPI.getCustomers();
      if (!res.error && res.data) {
        // Filter for B2B Clients
        const businessClients = res.data.filter((c: any) => c.customerType === 'BUSINESS');
        setClients(businessClients);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financeAPI.createCustomer({
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        customerType: 'BUSINESS'
      });
      setIsDialogOpen(false);
      setNewClient({ name: '', email: '', phone: '' });
      fetchClients();
    } catch (error) {
      console.error("Failed to add client:", error);
    }
  };

  if (loading && clients.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F9F8F4]">
        <Loader2 className="w-6 h-6 animate-spin text-[#1A1A1A]" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F9F8F4] min-h-screen text-[#1A1A1A] font-sans">
      <div className="border-b border-[#DCD7CB] bg-[#FDFCF9] px-8 py-6 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-3xl font-['Playfair_Display',_serif] text-[#1A1A1A]">B2B Directory</h1>
          <p className="text-xs text-[#8C877D] mt-1 tracking-wide font-light">
            Manage corporate clients, accounts, and engagement.
          </p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333] rounded-none text-[10px] uppercase tracking-widest px-6 h-10"
        >
          <Plus className="w-3 h-3 mr-2" /> Add Client
        </Button>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FDFCF9] border border-[#DCD7CB] w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#DCD7CB]">
              <h2 className="font-['Playfair_Display',_serif] text-2xl text-[#1A1A1A]">New Corporate Client</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(false)} className="h-8 w-8 p-0 rounded-none hover:bg-[#E5E3DB]">
                <X className="w-4 h-4 text-[#1A1A1A]" />
              </Button>
            </div>
            <form onSubmit={handleAddClient} className="p-6 space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-[10px] uppercase tracking-widest text-[#8C877D] block font-semibold">Company Name</label>
                <input
                  id="name"
                  required
                  value={newClient.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClient({...newClient, name: e.target.value})}
                  className="w-full bg-transparent border-b border-[#DCD7CB] py-3 text-[#1A1A1A] font-light focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] uppercase tracking-widest text-[#8C877D] block font-semibold">Primary Email</label>
                <input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClient({...newClient, email: e.target.value})}
                  className="w-full bg-transparent border-b border-[#DCD7CB] py-3 text-[#1A1A1A] font-light focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-[10px] uppercase tracking-widest text-[#8C877D] block font-semibold">Contact Phone</label>
                <input
                  id="phone"
                  value={newClient.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClient({...newClient, phone: e.target.value})}
                  className="w-full bg-transparent border-b border-[#DCD7CB] py-3 text-[#1A1A1A] font-light focus:outline-none focus:border-[#1A1A1A] transition-colors"
                />
              </div>
              <div className="pt-4 flex gap-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-none border-[#1A1A1A] text-[#1A1A1A] text-[10px] uppercase tracking-widest h-12">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333] rounded-none text-[10px] uppercase tracking-widest h-12">
                  Save Client
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none border-l-4 border-l-[#1A1A1A]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C877D] flex justify-between">
                Total B2B Clients <Building2 className="w-4 h-4 text-[#1A1A1A]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light font-['Playfair_Display',serif] text-[#1A1A1A]">
                {clients.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-[#DCD7CB] shadow-none bg-[#FDFCF9] rounded-none">
          <Table>
            <TableHeader>
              <TableRow className="border-[#DCD7CB] hover:bg-transparent">
                <TableHead className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] py-4 pl-6">Company</TableHead>
                <TableHead className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] py-4">Contact Info</TableHead>
                <TableHead className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] py-4">Status</TableHead>
                <TableHead className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] py-4 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-[#8C877D] font-light text-sm italic">
                    No corporate clients found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id} className="border-[#DCD7CB] hover:bg-[#F9F8F4] transition-colors">
                    <TableCell className="font-medium text-sm py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E5E3DB] flex items-center justify-center text-[#1A1A1A] font-['Playfair_Display',serif]">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        {client.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm py-4">
                      <div className="flex flex-col gap-1">
                        {client.email && (
                          <div className="flex items-center gap-2 text-[#8C877D]">
                            <Mail className="w-3 h-3" /> {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2 text-[#8C877D]">
                            <Phone className="w-3 h-3" /> {client.phone}
                          </div>
                        )}
                        {(!client.email && !client.phone) && <span className="text-xs italic text-[#8C877D]">No contact info</span>}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className="rounded-none border-[#1A1A1A] text-[#1A1A1A] text-[9px] uppercase tracking-widest">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-4 pr-6">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none hover:bg-[#E5E3DB]">
                        <MoreHorizontal className="h-4 w-4 text-[#8C877D]" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
