
"use client"

import React, { useEffect, useState } from "react"
import { Badge } from "@/Components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { staffAPI } from "@/lib/api"
import { Loader2 } from "lucide-react"

const StaffDirectory = () => {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const staffStyle = {
    label: "text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D] border-b border-[#EBE6DD] pb-4",
    cell: "py-6 text-sm font-light text-[#1A1A1A] border-b border-[#F5F2ED]"
  }

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true)
        const response = await staffAPI.getAll()
        if (response.error) {
          setError(response.error)
          setStaff([])
        } else {
          setStaff(response.data || [])
          setError(null)
        }
      } catch (err) {
        setError("Failed to load staff data")
        setStaff([])
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [])

  if (loading) {
    return (
      <div className="bg-white border border-[#EBE6DD] p-10">
        <div className="mb-10">
          <h3 className="text-3xl font-['Playfair_Display'] mb-2">Workforce Ledger</h3>
          <p className="text-[10px] uppercase tracking-widest text-[#8C877D]">Authorized Personnel & Drivers</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-4 h-4 animate-spin text-[#8C877D]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-[#EBE6DD] p-10">
        <div className="mb-10">
          <h3 className="text-3xl font-['Playfair_Display'] mb-2">Workforce Ledger</h3>
          <p className="text-[10px] uppercase tracking-widest text-[#8C877D]">Authorized Personnel & Drivers</p>
        </div>
        <p className="text-[#8C877D] text-sm text-center py-10">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#EBE6DD] p-10">
      <div className="mb-10">
        <h3 className="text-3xl font-['Playfair_Display'] mb-2">Workforce Ledger</h3>
        <p className="text-[10px] uppercase tracking-widest text-[#8C877D]">Authorized Personnel & Drivers</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className={staffStyle.label}>Name</TableHead>
            <TableHead className={staffStyle.label}>Role</TableHead>
            <TableHead className={staffStyle.label}>License / ID</TableHead>
            <TableHead className={staffStyle.label}>Performance</TableHead>
            <TableHead className={`${staffStyle.label} text-right`}>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.length > 0 ? staff.map((member: any) => (
            <TableRow key={member.id} className="hover:bg-[#FBFBF9] border-none transition-colors">
              <TableCell className={staffStyle.cell}>{member.name}</TableCell>
              <TableCell className={staffStyle.cell}>{member.role}</TableCell>
              <TableCell className={staffStyle.cell}>{member.driverProfile?.licenseNumber || member.email.split('@')[0]}</TableCell>
              <TableCell className={staffStyle.cell}>{member.driverProfile?.performance.toFixed(1) || 'N/A'} / 5.0</TableCell>
              <TableCell className={`${staffStyle.cell} text-right`}>
                <Badge className="rounded-none border border-black bg-transparent text-black text-[9px] uppercase font-bold">
                  {member.driverProfile ? 'Verified' : 'Authorized'}
                </Badge>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow className="hover:bg-transparent border-none">
              <TableCell colSpan={5} className="text-center py-12 text-[#C4BFAF] italic">No staff members found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default StaffDirectory