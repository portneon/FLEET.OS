"use client"
import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const Sidebar = () => {
    const pathname = usePathname();

    const navItems = [
        { name: 'Overview', path: '/dashboard' },
        { name: 'Fleet', path: '/dashboard/fleet' },
        { name: 'Staff', path: '/dashboard/staff' },
        { name: 'Financials', path: '/dashboard/finance' }
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-[#EBE6DD] bg-[#FBFBF9] p-6 min-h-screen">
            <div className="mb-12">
                <h1 className="text-2xl font-['Playfair_Display',serif] tracking-tight">FleetOS</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mt-1">Admin Console</p>
            </div>
            <nav className="flex flex-col gap-4 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname?.startsWith(item.path));
                    return (
                        <Link 
                            key={item.name} 
                            href={item.path} 
                            className={`text-sm font-light tracking-wide py-2 border-b transition-colors ${isActive ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#8C877D] hover:text-[#1A1A1A]'}`}
                        >
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}

export default Sidebar;
