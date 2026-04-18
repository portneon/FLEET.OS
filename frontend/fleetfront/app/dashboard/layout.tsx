"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../Components/Sidebar'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
        
        if (!token || !userStr) {
            router.push('/login')
            return
        }

        try {
            const user = JSON.parse(userStr)
            // Strict role check for Admin
            if (user.role !== 'ADMIN') {
                router.push('/login')
                return
            }
            setAuthorized(true)
        } catch (e) {
            router.push('/login')
        }
    }, [router])

    if (!authorized) {
        return (
            <div className="min-h-screen bg-[#F9F8F4] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A] mb-4" strokeWidth={1} />
                <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#8C877D]">Verifying Security Clearance...</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-[#F9F8F4]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-h-screen transition-all duration-500 overflow-y-auto w-full">
                {children}
            </main>
        </div>
    )
}
