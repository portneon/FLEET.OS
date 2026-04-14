"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Truck, Users, Banknote, ShieldCheck, Zap, Globe, ArrowRight } from 'lucide-react'
import Navbar from '@/Components/Navbar'
import Footer from '@/Components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#1A1A1A] font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/image1.png"
            alt="Luxury Fleet Logistics"
            layout="fill"
            objectFit="cover"
            priority
            className="brightness-[0.8] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/80 via-[#1A1A1A]/40 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full pt-20">
          <div className="max-w-2xl">
            <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/70 mb-6 animate-in slide-in-from-left-4 duration-1000">
              Introducing FleetOS 1.0
            </h3>
            <h1 className="text-5xl md:text-8xl font-['Playfair_Display',serif] text-white leading-[1.1] tracking-tight mb-8 animate-in slide-in-from-left-6 duration-1000 delay-100">
              Precision in <br />
              <span className="italic font-light">Motion.</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl font-light mb-12 max-w-lg leading-relaxed animate-in slide-in-from-left-8 duration-1000 delay-200">
              The premier SaaS architecture for orchestrated fleet operations. Managing assets, personnel, and capital with architectural elegance.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 animate-in slide-in-from-bottom-4 duration-1000 delay-500">
              <Link href="/Signup" className="bg-white text-[#1A1A1A] px-10 py-6 text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#EBE6DD] transition-all duration-300 flex items-center justify-center gap-3">
                Enroll Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="border border-white/30 backdrop-blur-sm text-white px-10 py-6 text-xs uppercase tracking-[0.2em] font-bold hover:bg-white/10 transition-all duration-300 flex items-center justify-center">
                Operator Login
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce opacity-40">
          <div className="w-[1px] h-12 bg-white"></div>
          <span className="text-[8px] uppercase tracking-[0.5em] text-white vertical-rl">Scroll</span>
        </div>
      </section>

      {/* VALUE PROP SECTION */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8C877D] mb-6">Structural Excellence</h3>
              <h2 className="text-4xl md:text-5xl font-['Playfair_Display',serif] mb-12 leading-tight">Built for the Modern <br /><span className="italic font-light">Transportation Era.</span></h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                {[
                  { icon: ShieldCheck, title: "Secure Data", desc: "Enterprise-grade encryption for all fleet identities." },
                  { icon: Zap, title: "Direct Logic", desc: "No bloat. High-performance API orchestration." },
                  { icon: Globe, title: "Universal Hub", desc: "Manage multi-regional fleets from one interface." }
                ].map((item, i) => (
                  <div key={i} className="group">
                    <item.icon className="w-6 h-6 mb-4 text-[#C4BFAF] group-hover:text-[#1A1A1A] transition-colors" />
                    <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">{item.title}</h4>
                    <p className="text-xs text-[#8C877D] font-light leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-square bg-[#F9F8F4] overflow-hidden group">
              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 w-32 h-32 border border-[#EBE6DD] z-0"></div>
              <div className="absolute bottom-10 left-10 w-48 h-48 border border-[#EBE6DD] z-0"></div>

              <div className="relative z-10 p-12 h-full flex flex-col justify-center">
                <div className="bg-white p-8 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-[#EBE6DD]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] uppercase tracking-widest font-bold">System Online</span>
                  </div>
                  <div className="space-y-4">
                    <div className="h-1 bg-[#F9F8F4] w-full"></div>
                    <div className="h-1 bg-[#F9F8F4] w-3/4"></div>
                    <div className="h-1 bg-[#1A1A1A] w-1/2"></div>
                  </div>
                  <div className="mt-12 text-3xl font-['Playfair_Display',serif]">99.9%</div>
                  <div className="text-[9px] uppercase tracking-widest text-[#8C877D] mt-2">Operational Integrity</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULE CARDS */}
      <section className="py-32 bg-[#F9F8F4]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-24">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#8C877D] mb-6 text-center">Comprehensive Suite</h3>
            <h2 className="text-4xl md:text-5xl font-['Playfair_Display',serif]">Operational Modules.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Truck,
                title: "Vehicle Gallery",
                desc: "High-level manifest management for buses, trucks, and vans.",
                link: "/dashboard/fleet"
              },
              {
                icon: Users,
                title: "Workforce Ledger",
                desc: "Sophisticated personnel management and role-based provisioning.",
                link: "/dashboard/staff"
              },
              {
                icon: Banknote,
                title: "Finance Hub",
                desc: "Precision tracking of yields, expenditures, and net performance.",
                link: "/dashboard/finance"
              }
            ].map((module, i) => (
              <div key={i} className="bg-white border border-[#EBE6DD] p-12 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] hover:-translate-y-2 group">
                <div className="w-12 h-12 bg-[#F9F8F4] flex items-center justify-center mb-8 group-hover:bg-[#1A1A1A] group-hover:text-white transition-all duration-500">
                  <module.icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-['Playfair_Display',serif] font-bold mb-4">{module.title}</h4>
                <p className="text-sm text-[#8C877D] font-light leading-relaxed mb-8">
                  {module.desc}
                </p>
                <Link href="/login" className="text-[10px] uppercase tracking-[0.2em] font-bold inline-flex items-center gap-2 group/btn hover:text-[#C4BFAF] transition-colors">
                  Explore Module <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-40 bg-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-5xl md:text-7xl font-['Playfair_Display',serif] mb-12 italic font-light tracking-tight">
            Ready to orchestrate your fleet?
          </h2>
          <Link href="/Signup" className="inline-block bg-[#1A1A1A] text-white px-16 py-8 text-xs uppercase tracking-[0.3em] font-bold hover:bg-[#333] transition-all duration-500 hover:shadow-2xl">
            Begin Digital Transformation
          </Link>
          <p className="mt-8 text-[#8C877D] text-[10px] uppercase tracking-widest">
            Enterprise setup takes less than 2 minutes.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
