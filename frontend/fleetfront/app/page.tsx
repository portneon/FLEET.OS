"use client"

import React, { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MoveUpRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#FDFBF7] text-[#111317] font-sans selection:bg-[#C5A059] selection:text-[#FDFBF7] overflow-hidden scroll-smooth">

      {/* CUSTOM CSS FOR GRAIN & CINEMATIC MOTION */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .paper-grain::before {
          content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 50;
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes revealLine {
          from { width: 0; }
          to { width: 3rem; }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-line {
          animation: revealLine 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `}} />
      <div className="paper-grain absolute inset-0 mix-blend-overlay"></div>

      <div className="relative z-10">

        {/* EDITORIAL MASTHEAD */}
        <nav className="w-full px-6 py-6 flex flex-col md:flex-row justify-between items-center md:items-end border-b border-[#111317]/10 animate-fade-in-up">
          <div className="hidden md:flex flex-col gap-1 text-[9px] uppercase tracking-[0.2em] text-[#C5A059] font-bold">
            <span>Vol. 1 — The Royal Edition</span>
            <span>Pune, Maharashtra. India</span>
          </div>

          <Link href="/" className="text-4xl md:text-6xl font-['Playfair_Display',_serif] font-bold tracking-tighter text-[#0A1128] leading-none mb-4 md:mb-0 hover:text-[#C5A059] transition-colors duration-500">
            FLEET.OS
          </Link>

          <div className="flex items-end gap-8 text-[9px] uppercase tracking-[0.2em] font-bold text-[#0A1128]">
            <Link href="/login" className="hover:text-[#C5A059] transition-colors duration-500 pb-1">Sign In</Link>
            <Link href="/Signup" className="border-b border-[#0A1128] pb-1 hover:text-[#C5A059] hover:border-[#C5A059] transition-colors duration-500">
              Subscribe
            </Link>
          </div>
        </nav>

        {/* THE COVER SPREAD */}
        <section className="px-6 pt-24 pb-32 flex flex-col items-center border-b border-[#111317]/10">
          <div className="flex items-center gap-4 mb-16 animate-fade-in-up delay-100">
            <div className="h-[1px] bg-[#C5A059] animate-line"></div>
            <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#C5A059]">
              Strategic Assets
            </p>
            <div className="h-[1px] bg-[#C5A059] animate-line"></div>
          </div>

          <h1 className="text-[5.5rem] md:text-[10rem] lg:text-[14rem] font-['Playfair_Display',_serif] leading-[0.75] tracking-tighter text-center text-[#0A1128] animate-fade-in-up delay-200">
            The Art of <br />
            {/* Rich Royal Brass/Gold */}
            <span className="italic text-[#C5A059] font-light pr-12 md:pr-24">Motion.</span>
          </h1>

          <div className="w-full max-w-4xl mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 text-[#333333] animate-fade-in-up delay-300">
            <p className="text-sm leading-loose text-justify font-medium">
              An elegant architecture for commercial transit. We have deliberately stripped away the visual noise of traditional software, leaving only precision, clarity, and absolute control over your global assets. This is not merely a tool; it is a philosophy of logistics.
            </p>
            <p className="text-sm leading-loose text-justify font-medium">
              Every interface, from the workforce ledger to financial telemetry, has been painstakingly typeset and engineered to reduce cognitive load. By embracing restraint, we elevate the operator's ability to command the fleet.
            </p>
          </div>
        </section>

        {/* THE LOOKBOOK - Deep Oxford Navy Background */}
        <section id="manifesto" className="px-6 py-32 bg-[#0A1128] text-[#FDFBF7] relative overflow-hidden">

          <div className="hidden xl:block absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[9px] uppercase tracking-[0.4em] text-[#C5A059]/60">
            Fig. 01 — Executive Overview
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            <div className="lg:col-span-4 lg:col-start-2 flex flex-col justify-center">
              <h2 className="text-3xl md:text-5xl font-['Playfair_Display',_serif] leading-[1.1] mb-12">
                Engineered for the <br /> <span className="italic text-[#FDFBF7]/60">modern operator.</span>
              </h2>

              <div className="text-sm text-[#FDFBF7]/80 font-light leading-relaxed mb-12">
                {/* Royal Gold Drop Cap */}
                <span className="float-left text-7xl font-['Playfair_Display',_serif] leading-[0.7] pr-4 pt-2 text-[#C5A059]">O</span>
                ur philosophy dictates that enterprise software should feel like an extension of human intent. We have crafted an environment where data breathes freely. Every interaction is considered, every pixel justified.
              </div>

              <Link href="/Signup" className="group inline-flex items-center gap-4 text-[9px] uppercase tracking-[0.2em] font-bold border-b border-[#FDFBF7]/30 pb-2 w-max hover:border-[#C5A059] hover:text-[#C5A059] transition-all duration-500">
                Explore the Architecture <MoveUpRight className="w-3 h-3 text-[#C5A059] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" strokeWidth={2} />
              </Link>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 relative group">
              <div className="relative h-[80vh] w-full bg-[#FDFBF7] p-4 shadow-2xl overflow-hidden">
                <div className="relative w-full h-full overflow-hidden bg-white">
                  <Image
                    src="/image1.png"
                    alt="Editorial presentation"
                    layout="fill"
                    objectFit="cover"
                    // Slow, cinematic zoom on hover
                    className="mix-blend-multiply opacity-90 group-hover:opacity-100 transition-all duration-[2000ms] ease-out group-hover:scale-110"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-4 text-[9px] uppercase tracking-widest text-[#FDFBF7]/50">
                <span>Plate No. 001</span>
                <span>The Console Workspace</span>
              </div>
            </div>
          </div>
        </section>

        {/* THE INDEX - High-End Corporate Colors */}
        <section id="modules" className="px-6 py-32 bg-[#FDFBF7]">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-16 border-b border-[#111317]/10 pb-4">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#0A1128]">
                Index of Capabilities
              </h3>
              <span className="text-[9px] font-mono text-[#C5A059] font-bold">04 ENTRIES</span>
            </div>

            <div className="flex flex-col">
              {[
                { num: "I", title: "Asset Ledger", desc: "A curated registry of heavy-duty vehicles, buses, and commercial vans.", color: "text-[#0A1128]" }, // Oxford Navy
                { num: "II", title: "Workforce", desc: "Cryptographic personnel management and elegant access provisioning.", color: "text-[#5B1824]" }, // Deep Burgundy
                { num: "III", title: "Transit Routes", desc: "Geographic waypoint mapping structured for absolute timing.", color: "text-[#1E352F]" }, // Forest Green
                { num: "IV", title: "Finance Hub", desc: "Precision calculation engine tracking yields and operational margins.", color: "text-[#C5A059]" }  // Royal Gold
              ].map((item, idx) => (
                <div key={idx} className="group flex flex-col md:flex-row md:items-center justify-between py-10 border-b border-[#111317]/10 hover:border-[#111317]/30 transition-colors duration-700 cursor-pointer px-4 -mx-4 hover:bg-[#F4F1E9]">

                  <div className="flex items-center gap-12 md:gap-24 w-full md:w-1/2">
                    <span className={`text-xl font-['Playfair_Display',_serif] italic text-[#888888] w-8 group-hover:${item.color} transition-colors duration-700`}>
                      {item.num}.
                    </span>
                    {/* Smooth slide to the right on hover */}
                    <h4 className="text-3xl md:text-5xl font-['Playfair_Display',_serif] text-[#111317] group-hover:translate-x-6 transition-transform duration-[800ms] ease-out">
                      {item.title}
                    </h4>
                  </div>

                  <div className="mt-4 md:mt-0 flex justify-between items-center w-full md:w-1/2 md:pl-12">
                    <p className="text-xs font-medium text-[#555555] leading-relaxed max-w-sm group-hover:text-[#111317] transition-colors duration-700">
                      {item.desc}
                    </p>
                    {/* Arrow smoothly spins and fades in */}
                    <ArrowRight className={`w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:-rotate-45 transition-all duration-[800ms] ease-out ${item.color}`} strokeWidth={2} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EDITORIAL BACK COVER - Deep Burgundy / Wine */}
        <footer className="px-6 py-24 bg-[#0A1128] text-[#FDFBF7] flex flex-col md:flex-row justify-between items-end gap-16 relative overflow-hidden">

          <div className="w-full md:w-auto z-10">
            <h2 className="text-6xl md:text-[7rem] font-['Playfair_Display',_serif] leading-[0.8] mb-12 tracking-tighter text-[#FDFBF7]">
              Initiate.
            </h2>
            <Link href="/Signup" className="inline-block bg-[#C5A059] text-[#0A1128] px-12 py-5 text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-[#FDFBF7] transition-colors duration-500 shadow-2xl hover:shadow-xl">
              Request Platform Access
            </Link>
          </div>

          <div className="flex flex-col items-start md:items-end gap-6 text-[9px] uppercase tracking-[0.2em] font-bold text-[#FDFBF7]/60 z-10">
            <div className="flex flex-col gap-2 md:text-right mb-8">
              <Link href="#" className="hover:text-[#C5A059] transition-colors duration-500">Data Privacy Documentation</Link>
              <Link href="#" className="hover:text-[#C5A059] transition-colors duration-500">Terms of Corporate Engagement</Link>
            </div>

            <div className="flex gap-4 items-center text-[#C5A059]">
              <div className="h-[1px] w-8 bg-[#C5A059]/50 hidden md:block"></div>
              <p>Fleet.OS // Designed in Pune.</p>
            </div>
          </div>

          {/* Subtle watermarked logo in the background of the footer */}
          <div className="absolute -bottom-12 -right-12 text-[#FDFBF7]/5 font-['Playfair_Display',_serif] text-[15rem] font-bold pointer-events-none select-none">
            F.OS
          </div>
        </footer>

      </div>
    </div>
  )
}