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
        <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-[#F9F8F4]/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-8'}`}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                
          
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-[#1A1A1A] flex items-center justify-center text-white transition-transform duration-500 group-hover:rotate-12">
                        <Truck className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-['Playfair_Display',serif] tracking-tighter font-bold text-[#1A1A1A]">
                        Fleet<span className="italic font-light">OS</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-12">
                    <Link href="#features" className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] hover:text-[#1A1A1A] transition-colors">Solutions</Link>
                    <Link href="#about" className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] hover:text-[#1A1A1A] transition-colors">Philosophy</Link>
                    
                    <div className="h-4 w-[1px] bg-[#EBE6DD]"></div>

                    <Link href="/login" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C877D] hover:text-[#1A1A1A] transition-colors">Login</Link>
                    <Link href="/Signup" className="bg-[#1A1A1A] text-white px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#333] transition-all duration-300">
                        Enroll Now
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button 
                    className="md:hidden text-[#1A1A1A]"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#F9F8F4] absolute top-full left-0 w-full p-8 border-b border-[#EBE6DD] flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
                    <Link href="/login" className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">Login</Link>
                    <Link href="/Signup" className="bg-[#1A1A1A] text-white p-4 text-center text-[10px] uppercase tracking-[0.2em] font-bold">Enroll Now</Link>
                </div>
            )}
        </nav>
    )
}

export default Navbar
