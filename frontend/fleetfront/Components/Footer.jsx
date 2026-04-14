"use client"
import React from 'react'
import Link from 'next/link'
import { Truck, Globe, Mail, MessageCircle } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="bg-[#1A1A1A] text-[#F9F8F4] pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
                    
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 bg-white flex items-center justify-center text-[#1A1A1A]">
                                <Truck className="w-5 h-5" />
                            </div>
                            <span className="text-2xl font-['Playfair_Display',serif] tracking-tighter font-bold">
                                Fleet<span className="italic font-light">OS</span>
                            </span>
                        </Link>
                        <p className="max-w-md text-[#8C877D] text-sm leading-relaxed font-light">
                            Redefining logistics through architectural precision and data-driven intelligence. Built for the modern enterprise that values efficiency without compromise.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8C877D] mb-8">Navigation</h4>
                        <div className="flex flex-col gap-4 text-sm font-light">
                            <Link href="/login" className="hover:text-white transition-colors">Operator Login</Link>
                            <Link href="/Signup" className="hover:text-white transition-colors">Partner Enrollment</Link>
                            <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
                        </div>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8C877D] mb-8">Connect</h4>
                        <div className="flex gap-6">
                            <Globe className="w-5 h-5 text-[#8C877D] hover:text-white cursor-pointer transition-colors" />
                            <Mail className="w-5 h-5 text-[#8C877D] hover:text-white cursor-pointer transition-colors" />
                            <MessageCircle className="w-5 h-5 text-[#8C877D] hover:text-white cursor-pointer transition-colors" />
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-[#333] flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[9px] uppercase tracking-widest text-[#8C877D]">© 2024 FleetOS Technologies. All Rights Reserved.</p>
                    <div className="flex gap-8 text-[9px] uppercase tracking-widest text-[#8C877D]">
                        <Link href="#">Privacy Policy</Link>
                        <Link href="#">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
