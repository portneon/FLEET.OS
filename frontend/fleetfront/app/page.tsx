"use client"

import React, { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Truck, Users, Banknote, ShieldCheck, Zap, Globe, ArrowRight } from 'lucide-react'
import Navbar from '@/Components/Navbar'
import Footer from '@/Components/Footer'

export default function Home() {
  useEffect(() => {
    // Wake up the Render backend instance on landing
    const wakeUpBackend = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
        // Ping the root of the backend (removing /api if present to hit the "/" route)
        const rootUrl = baseUrl.replace('/api', '/');
        await fetch(rootUrl, { mode: 'no-cors' });
        console.log('Backend wake-up signal sent.');
      } catch (e) {
        // Silent fail
      }
    };
    wakeUpBackend();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#000000] font-sans selection:bg-[#000000] selection:text-[#FFFFFF]">
      <Navbar />


      <section className="relative min-h-[90vh] pt-10 flex flex-col lg:flex-row border-b border-[#FFFFFF]">

        {/* Text Half */}
        <div className="flex-1 flex flex-col justify-center px-6 py-20 lg:p-20 xl:p-32 z-10">
          <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#FFFFFF] mb-8">
            FleetOS — Edition 1.0
          </h3>
          <h1 className="text-6xl md:text-8xl xl:text-[9rem] font-['Playfair_Display',serif] leading-[0.9] tracking-tighter text-[#000000]">
            Precision <br />
            <span className="italic font-light text-[#000000]">in Motion.</span>
          </h1>
          <p className="mt-12 text-[#FFFFFF] text-lg md:text-xl font-light max-w-md leading-relaxed">
            The premier architecture for orchestrated fleet operations. Managing assets, personnel, and capital with absolute clarity.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mt-16">
            <Link href="/Signup" className="bg-[#000000] text-[#FFFFFF] px-10 py-5 text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-[#000000] transition-all duration-500 flex items-center justify-center gap-4 rounded-none">
              Enroll Now <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
            <Link href="/login" className="border border-[#FFFFFF] bg-transparent text-[#000000] px-10 py-5 text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-[#FFFFFF] transition-all duration-500 flex items-center justify-center rounded-none">
              Operator Login
            </Link>
          </div>
        </div>


        <div className="flex-1 relative lg:border-l border-[#FFFFFF] bg-[#FFFFFF] p-6 lg:p-12 flex items-center justify-center">
          <div className="relative w-full h-[60vh] lg:h-full min-h-[500px] border border-[#FFFFFF] overflow-hidden group">

            <Image
              src="/image1.png"
              alt="Luxury Fleet Logistics"
              layout="fill"
              objectFit="cover"
              priority
              className="grayscale group-hover:grayscale-0 transition-all duration-1000 object-center scale-105 group-hover:scale-100"
            />
          </div>
        </div>
      </section>

      {/* VALUE PROP SECTION - The "Swiss Grid" approach */}
      <section id="features" className="bg-[#FFFFFF] border-b border-[#FFFFFF]">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Header Block */}
          <div className="p-12 lg:p-24 border-b lg:border-b-0 lg:border-r border-[#FFFFFF] flex flex-col justify-center">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#FFFFFF] mb-6">Structural Excellence</h3>
            <h2 className="text-4xl md:text-5xl font-['Playfair_Display',serif] leading-tight">
              Built for the <br />Modern <span className="italic font-light text-[#000000]">Transportation Era.</span>
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, title: "Secure Data", desc: "Enterprise-grade encryption for all identities." },
              { icon: Zap, title: "Direct Logic", desc: "No bloat. High-performance API orchestration." },
              { icon: Globe, title: "Universal Hub", desc: "Manage regional fleets from one interface." },
              { icon: Activity, title: "99.9% Uptime", desc: "Unwavering operational integrity and stability." } // Replaced the pulsing UI block with a clean typographic feature
            ].map((item, i) => (
              <div
                key={i}
                className={`p-10 lg:p-12 group hover:bg-[#FFFFFF] transition-colors duration-500
                  ${i % 2 === 0 ? 'border-b sm:border-r border-[#FFFFFF]' : 'border-b border-[#FFFFFF]'}
                  ${i > 1 ? 'sm:border-b-0' : ''}
                `}
              >
                {/* strokeWidth={1} makes the icons look like delicate ink drawings */}
                <item.icon className="w-8 h-8 mb-8 text-[#000000]" strokeWidth={1} />
                <h4 className="text-[10px] uppercase tracking-widest font-semibold mb-3">{item.title}</h4>
                <p className="text-sm text-[#FFFFFF] font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES - Table of Contents Style */}
      <section className="py-24 lg:py-32 bg-[#FFFFFF]">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">

          <div className="mb-20">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#FFFFFF] mb-4">Comprehensive Suite</h3>
            <h2 className="text-4xl md:text-5xl font-['Playfair_Display',serif]">Operational Modules.</h2>
          </div>

          <div className="flex flex-col border-t border-[#000000]">
            {[
              { number: "01", title: "Vehicle Gallery", desc: "High-level manifest management for buses, trucks, and vans.", link: "/dashboard/fleet" },
              { number: "02", title: "Workforce Ledger", desc: "Sophisticated personnel management and role-based provisioning.", link: "/dashboard/staff" },
              { number: "03", title: "Finance Hub", desc: "Precision tracking of yields, expenditures, and net performance.", link: "/dashboard/finance" }
            ].map((module, i) => (
              <Link
                href={module.link}
                key={i}
                className="group flex flex-col md:flex-row md:items-center justify-between py-10 border-b border-[#FFFFFF] hover:bg-[#FFFFFF] transition-colors px-4 -mx-4"
              >
                <div className="flex items-start md:items-center gap-8 md:gap-16 mb-4 md:mb-0">
                  <span className="text-xs font-['Playfair_Display',serif] italic text-[#FFFFFF]">{module.number}</span>
                  <h4 className="text-2xl lg:text-4xl font-['Playfair_Display',serif] group-hover:italic transition-all duration-300">
                    {module.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between md:w-1/2 ml-12 md:ml-0">
                  <p className="text-sm text-[#FFFFFF] font-light leading-relaxed max-w-xs">
                    {module.desc}
                  </p>
                  <ArrowRight className="w-5 h-5 text-[#FFFFFF] group-hover:text-[#000000] group-hover:translate-x-2 transition-all duration-300" strokeWidth={1} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      <section className="py-32 lg:py-48 bg-[#000000] text-[#FFFFFF] text-center px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-['Playfair_Display',serif] mb-12 italic font-light tracking-tight text-[#FFFFFF]">
            Ready to orchestrate your fleet?
          </h2>
          <Link href="/Signup" className="inline-block bg-[#FFFFFF] text-[#000000] px-16 py-6 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#FFFFFF] transition-all duration-500 rounded-none">
            Begin Digital Transformation
          </Link>
          <p className="mt-12 text-[#FFFFFF] text-[10px] uppercase tracking-widest">
            Enterprise setup takes less than 2 minutes.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}


import { Activity } from 'lucide-react';