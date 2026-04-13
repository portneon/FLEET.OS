"use client"
import React from 'react'
import Link from 'next/link'
import { Truck, Globe, Mail, MessageCircle } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="bg-[#1A1A1A] text-[#F9F8F4] pt-24 pb-12 border-t border-[#DCD7CB]">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">

                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-4 mb-8 group w-fit">
                            <div className="w-10 h-10 border border-[#8C877D] flex items-center justify-center text-[#F9F8F4] transition-transform duration-700 group-hover:rotate-[360deg] bg-transparent">
                                <Truck className="w-5 h-5" strokeWidth={1} />
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
                        <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#F9F8F4] mb-8">Navigation</h4>
                        <div className="flex flex-col gap-4 text-sm font-light">
                            <Link href="/login" className="relative w-fit text-[#8C877D] hover:text-[#F9F8F4] transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-[#F9F8F4] hover:after:w-full after:transition-all after:duration-300">
                                Operator Login
                            </Link>
                            <Link href="/Signup" className="relative w-fit text-[#8C877D] hover:text-[#F9F8F4] transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-[#F9F8F4] hover:after:w-full after:transition-all after:duration-300">
                                Partner Enrollment
                            </Link>
                            <Link href="#" className="relative w-fit text-[#8C877D] hover:text-[#F9F8F4] transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-[#F9F8F4] hover:after:w-full after:transition-all after:duration-300">
                                Documentation
                            </Link>
                        </div>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#F9F8F4] mb-8">Connect</h4>
                        <div className="flex gap-6">
                            <Globe className="w-6 h-6 text-[#8C877D] hover:text-[#F9F8F4] cursor-pointer transition-transform hover:-translate-y-1 duration-300" strokeWidth={1} />
                            <Mail className="w-6 h-6 text-[#8C877D] hover:text-[#F9F8F4] cursor-pointer transition-transform hover:-translate-y-1 duration-300" strokeWidth={1} />
                            <MessageCircle className="w-6 h-6 text-[#8C877D] hover:text-[#F9F8F4] cursor-pointer transition-transform hover:-translate-y-1 duration-300" strokeWidth={1} />
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-[#333333] flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#8C877D]">© 2026 Lazy Fleets. All Rights Reserved.</p>
                    <div className="flex gap-8 text-[9px] uppercase tracking-[0.2em] text-[#8C877D]">
                        <Link href="#" className="hover:text-[#F9F8F4] transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-[#F9F8F4] transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer