
"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const StaffDirectory = () => {
  const staffStyle = {
    label: "text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D] border-b border-[#EBE6DD] pb-4",
    cell: "py-6 text-sm font-light text-[#1A1A1A] border-b border-[#F5F2ED]"
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
          <TableRow className="hover:bg-[#FBFBF9] border-none transition-colors">
            <TableCell className={staffStyle.cell}>Arjun Kumar</TableCell>
            <TableCell className={staffStyle.cell}>Driver</TableCell>
            <TableCell className={staffStyle.cell}>DL-9928110</TableCell>
            <TableCell className={staffStyle.cell}>4.8 / 5.0</TableCell>
            <TableCell className={`${staffStyle.cell} text-right`}>
              <Badge className="rounded-none border border-black bg-transparent text-black text-[9px] uppercase font-bold">Verified</Badge>
            </TableCell>
          </TableRow>
          {/* More rows... */}
        </TableBody>
      </Table>
    </div>
  )
}