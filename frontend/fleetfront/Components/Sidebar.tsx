"use client"
import React, { useState } from 'react'

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div
            className={`transition-all duration-500 ease-in-out bg-[#1A1A1A] border-r border-[#2A2A2A] min-h-screen flex flex-col ${isCollapsed ? 'w-20' : 'w-64'} md:relative fixed z-50`}
        >
            <div className={`flex items-center p-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && <h1 className="text-[#F9F8F4] font-['Playfair_Display',_serif] text-2xl tracking-wide shrink-0">FleetOS</h1>}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-[#8C877D] hover:text-[#F9F8F4] transition-colors p-2 shrink-0 flex items-center justify-center"
                >
                    {isCollapsed ? '→' : '←'}
                </button>
            </div>

            <nav className={`flex flex-col gap-6 p-6 mt-8 ${isCollapsed ? 'items-center' : 'items-start'}`}>
                <a href="#overview" className="flex items-center gap-4 text-[#8C877D] group hover:text-[#F9F8F4] transition-colors outline-none">
                    <span className="text-xl">⊞</span>
                    {!isCollapsed && <span className="text-xs uppercase tracking-[0.2em] font-semibold">Overview</span>}
                </a>

                <a href="#fleet" className="flex items-center gap-4 text-[#8C877D] group hover:text-[#F9F8F4] transition-colors outline-none">
                    <span className="text-xl">⚇</span>
                    {!isCollapsed && <span className="text-xs uppercase tracking-[0.2em] font-semibold">Fleet</span>}
                </a>

                <a href="/dashboard" className="flex items-center gap-4 text-[#F9F8F4] transition-colors relative outline-none">
                    <span className="text-xl">⚙</span>
                    {!isCollapsed && <span className="text-xs uppercase tracking-[0.2em] font-semibold">Register Staff</span>}
                    {/* Active page indicator */}
                    <div className={`absolute ${isCollapsed ? 'left-[-32px]' : 'left-[-24px]'} w-1 h-full bg-[#DCD7CB]`}></div>
                </a>
            </nav>
        </div>
    )
}

export default Sidebar
