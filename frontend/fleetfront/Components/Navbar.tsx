"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Truck } from 'lucide-react'

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled
            ? 'bg-[#F9F8F4]/95 backdrop-blur-md py-4 border-b border-[#DCD7CB]'
            : 'bg-transparent py-8 border-b border-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">


                <Link href="/" className="flex items-center gap-4 group">
                    <div className="w-10 h-10 border border-[#1A1A1A] flex items-center justify-center text-[#1A1A1A] transition-transform duration-700 group-hover:rotate-[360deg] bg-transparent">
                        <Truck className="w-5 h-5" strokeWidth={1} />
                    </div>
                    <span className="text-xl font-['Playfair_Display',serif] tracking-tighter font-bold text-[#1A1A1A]">
                        Fleet<span className="italic font-light">OS</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-10">
                    <Link href="#features" className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] hover:text-[#1A1A1A] transition-colors relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-[1px] after:bg-[#1A1A1A] hover:after:w-full after:transition-all after:duration-300">
                        Solutions
                    </Link>
                    <Link href="#about" className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] hover:text-[#1A1A1A] transition-colors relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-[1px] after:bg-[#1A1A1A] hover:after:w-full after:transition-all after:duration-300">
                        Philosophy
                    </Link>

                    <div className="h-4 w-[1px] bg-[#DCD7CB] mx-2"></div>

                    <Link href="/login" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D] hover:text-[#1A1A1A] transition-colors">
                        Login
                    </Link>
                    <Link href="/Signup" className="bg-[#1A1A1A] text-[#F9F8F4] px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#333333] transition-all duration-300 rounded-none border border-[#1A1A1A]">
                        Join Now
                    </Link>
                </div>

                <button
                    className="md:hidden text-[#1A1A1A] focus:outline-none"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X strokeWidth={1} /> : <Menu strokeWidth={1} />}
                </button>
            </div>


            <div className={`md:hidden absolute top-full left-0 w-full bg-[#F9F8F4] border-b border-[#DCD7CB] transition-all duration-500 overflow-hidden ${mobileMenuOpen ? 'max-h-[500px] border-t border-[#DCD7CB]' : 'max-h-0 border-t-0'
                }`}>
                <div className="px-6 py-8 flex flex-col gap-6">
                    <Link href="#features" className="text-3xl font-['Playfair_Display',serif] text-[#1A1A1A] border-b border-[#EBE6DD] pb-4" onClick={() => setMobileMenuOpen(false)}>
                        Solutions
                    </Link>
                    <Link href="#about" className="text-3xl font-['Playfair_Display',serif] text-[#1A1A1A] border-b border-[#EBE6DD] pb-4" onClick={() => setMobileMenuOpen(false)}>
                        Philosophy
                    </Link>
                    <Link href="/login" className="text-3xl font-['Playfair_Display',serif] text-[#8C877D] border-b border-[#EBE6DD] pb-4" onClick={() => setMobileMenuOpen(false)}>
                        Operator Login
                    </Link>

                    <Link href="/Signup" className="bg-[#1A1A1A] text-[#F9F8F4] mt-4 p-5 text-center text-[10px] uppercase tracking-[0.3em] font-bold rounded-none" onClick={() => setMobileMenuOpen(false)}>
                        Join Now
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default Navbar