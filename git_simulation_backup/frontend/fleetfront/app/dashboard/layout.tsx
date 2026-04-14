import React from 'react'
import Sidebar from '../../Components/Sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-[#F9F8F4]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-h-screen transition-all duration-500 overflow-y-auto w-full">
                {children}
            </main>
        </div>
    )
}
