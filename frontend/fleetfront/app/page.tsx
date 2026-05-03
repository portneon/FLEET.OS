"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MoveUpRight, ChevronDown } from 'lucide-react'

const platformModules = [
  {
    num: "I",
    category: "Asset Ledger",
    title: "The Immutable Fleet Core.",
    themeText: "text-[#0A1128]", 
    themeBorder: "border-[#0A1128]/20",
    intro: "The Asset Ledger is the definitive source of truth for your physical inventory. Unlike a simple list, the Ledger treats every vehicle as a high-value asset with a unique lifecycle.",
    features: [
      { name: "Precision Registration", desc: "Every vehicle is onboarded via a strict 17-character VIN verification, ensuring no data duplication or integrity errors." },
      { name: "Segmented Profiles", desc: "Tailored data structures for varied asset classes, including Buses (with seating capacity), Trucks, and Vans." },
      { name: "Status Orchestration", desc: "Move assets between IDLE, ACTIVE, and MAINTENANCE states to maintain optimal fleet availability." },
      { name: "Historical Telemetry", desc: "A forensic record of every kilometer traveled, every telemetry ping, and every assignment, localized to your organization." }
    ]
  },
  {
    num: "II",
    category: "Workforce",
    title: "Strategic Personnel Management.",
    themeText: "text-[#5B1824]", // Deep Burgundy
    themeBorder: "border-[#5B1824]/20",
    intro: "The Workforce module transforms \"staffing\" into \"talent optimization,\" specifically designed for the complexities of logistics and transit.",
    features: [
      { name: "Credential Intelligence", desc: "Dedicated Driver Profiles that track verified license numbers and professional years of experience." },
      { name: "Performance Index", desc: "An automated performance scoring system (starting at a 5.0 baseline) that evolves based on operational telemetry and trip success." },
      { name: "Availability Lifecycle", desc: "Real-time status tracking (AVAILABLE, ON_TRIP, OFF_DUTY) ensures dispatchers always have the right personnel." },
      { name: "Personnel Security", desc: "Enterprise-grade authentication and the ability to instantly toggle workspace access for sensitive roles." }
    ]
  },
  {
    num: "III",
    category: "Transit Route",
    title: "Precision Network Engineering.",
    themeText: "text-[#1E352F]", // Forest Green
    themeBorder: "border-[#1E352F]/20",
    intro: "Transit Route is the architectural layer of your operations, allowing for the design and execution of complex logistics networks.",
    features: [
      { name: "Atomic Sequencing", desc: "Create routes with high-precision GPS stops. The system supports sequence shifting without breaking logic." },
      { name: "Geospatial Validation", desc: "Every stop is validated against international coordinate standards, ensuring drivers are never siloed by bad data." },
      { name: "Dynamic Route Planning", desc: "Define the operational path first, then refine stops as your network matures. Supports at-least-2-stop validation." },
      { name: "Network Synergy", desc: "Seamlessly connects routes to historical trip data, providing a feedback loop on which paths are most efficient." }
    ]
  },
  {
    num: "IV",
    category: "Finance Hub",
    title: "The Fiscal Command Center.",
    themeText: "text-[#C5A059]", // Royal Gold
    themeBorder: "border-[#C5A059]/40",
    intro: "The Finance Hub provides a \"God-view\" of your organization’s fiscal health, moving beyond simple accounting to strategic profit analysis.",
    features: [
      { name: "Dual-Ledger Integrity", desc: "Automated categorization of every dollar as INCOME or EXPENSE, strictly tied to your organizational identity." },
      { name: "Real-time Dynamics", desc: "Instant calculations of Revenue, Operational Expenses, and Net Profit, presented via a centralized summary." },
      { name: "Categorical Auditing", desc: "Pre-built categories for the logistics industry, including FUEL, MAINTENANCE, REVENUE, SALARY, and INSURANCE." },
      { name: "Historical Ledger", desc: "A permanent, searchable audit trail of every financial transaction, ensuring transparency and accountability." }
    ]
  }
];

export default function Home() {
  const [isManifestoExpanded, setIsManifestoExpanded] = useState(false);

  // Helper function to handle expanding the manifesto and scrolling to the specific section
  const handleScrollToModule = (categoryId: string) => {
    const formattedId = `module-${categoryId.replace(/\s+/g, '-').toLowerCase()}`;

    if (!isManifestoExpanded) {
      setIsManifestoExpanded(true);
    }

    // Wait slightly for React to mount the expanded DOM before scrolling
    setTimeout(() => {
      const element = document.getElementById(formattedId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] text-[#111317] font-sans selection:bg-[#111317] selection:text-[#FDFBF7] overflow-x-hidden scroll-smooth">

      {/* CUSTOM CSS FOR GRAIN & CINEMATIC MOTION */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .paper-grain::before {
          content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 50;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          opacity: 0; animation: fadeInUp 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-100 { animation-delay: 150ms; }
        .delay-200 { animation-delay: 300ms; }
        .delay-300 { animation-delay: 450ms; }
      `}} />
      <div className="paper-grain absolute inset-0 mix-blend-overlay fixed"></div>

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* =========================================
            1. EDITORIAL MASTHEAD
            ========================================= */}
        <header className="w-full px-8 py-8 flex justify-between items-end border-b border-[#111317]/20 animate-fade-in-up">
          <Link href="/" className="text-3xl md:text-5xl font-['Playfair_Display',_serif] font-bold tracking-tighter text-[#0A1128] leading-none hover:text-[#C5A059] transition-colors duration-500">
            FLEET.OS
          </Link>

          <div className="flex gap-12 text-[9px] uppercase tracking-[0.2em] font-bold text-[#111317]">
            <span className="hidden md:inline-block border-b border-[#111317] pb-1">Pune, India</span>
            <span className="hidden md:inline-block border-b border-[#111317] pb-1">April 2026 Issue</span>
            <Link href="/login" className="hover:text-[#C5A059] transition-colors duration-500 pb-1">Sign In</Link>
          </div>
        </header>

        {/* =========================================
            2. HERO SPREAD (Home Cover)
            ========================================= */}
        <section className="px-8 pt-32 pb-24 md:pb-40 flex flex-col items-center border-b border-[#111317]/20 animate-fade-in-up delay-100">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#888888] mb-12">
            Vol. I — Enterprise Logistics
          </p>
          <h1 className="text-[5rem] md:text-[9rem] lg:text-[12rem] font-['Playfair_Display',_serif] leading-[0.8] tracking-tighter text-center text-[#111317]">
            The Art of <br />
            <span className="italic text-[#C5A059] font-light pr-8 md:pr-16">Motion.</span>
          </h1>

          <div className="w-full max-w-5xl mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 text-[#333333] animate-fade-in-up delay-200 px-4 md:px-0">
            <p className="text-sm leading-loose text-justify font-medium">
              An elegant architecture for commercial transit. We have deliberately stripped away the visual noise of traditional software, leaving only precision, clarity, and absolute control over your global assets. This is not merely a tool; it is a philosophy of logistics.
            </p>
            <p className="text-sm leading-loose text-justify font-medium">
              Every interface, from the workforce ledger to financial telemetry, has been painstakingly typeset and engineered to reduce cognitive load. By embracing restraint, we elevate the operator's ability to command the fleet.
            </p>
          </div>
        </section>

        {/* =========================================
            3. LOOKBOOK SPREAD (Image Reveal)
            ========================================= */}
        <section className="px-6 py-32 bg-[#0A1128] text-[#FDFBF7] relative overflow-hidden animate-fade-in-up delay-300">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            <div className="flex flex-col justify-center">
              <h2 className="text-4xl md:text-6xl font-['Playfair_Display',_serif] leading-[1.1] mb-12">
                Engineered for the <br /> <span className="italic text-[#FDFBF7]/60">modern operator.</span>
              </h2>

              <div className="text-sm text-[#FDFBF7]/80 font-light leading-relaxed mb-12">
                <span className="float-left text-7xl font-['Playfair_Display',_serif] leading-[0.7] pr-4 pt-2 text-[#C5A059]">O</span>
                ur philosophy dictates that enterprise software should feel like an extension of human intent. We have crafted an environment where data breathes freely. Every interaction is considered, every pixel justified.
              </div>

              <Link href="/Signup" className="group inline-flex items-center gap-4 text-[9px] uppercase tracking-[0.2em] font-bold border-b border-[#FDFBF7]/30 pb-2 w-max hover:border-[#C5A059] hover:text-[#C5A059] transition-all duration-500">
                Explore the Architecture <MoveUpRight className="w-3 h-3 text-[#C5A059] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" strokeWidth={2} />
              </Link>
            </div>

            <div className="relative group w-full">
              <div className="relative h-[70vh] w-full bg-[#FDFBF7] shadow-2xl overflow-hidden">
                <Image
                  src="/image1.png"
                  alt="Editorial presentation"
                  layout="fill"
                  objectFit="cover"
                  className="mix-blend-multiply opacity-90 group-hover:opacity-100 transition-all duration-[2000ms] ease-out group-hover:scale-105"
                />
              </div>
            </div>

          </div>
        </section>

        {/* =========================================
            4. THE INDEX (Home Table of Contents)
            ========================================= */}
        <section className="px-6 pt-32 pb-16 bg-[#FDFBF7]">
          <div className="max-w-6xl mx-auto">
            <div className="border-b border-[#111317]/10 pb-6 mb-12 flex justify-between items-end">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#0A1128]">
                Index of Capabilities
              </h3>
              <span className="text-[9px] font-mono text-[#C5A059] font-bold">04 ENTRIES</span>
            </div>

            <div className="flex flex-col">
              {platformModules.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleScrollToModule(item.category)}
                  className="group flex flex-col md:flex-row md:items-center justify-between py-12 border-b border-[#111317]/10 hover:border-[#111317]/30 transition-colors duration-700 cursor-pointer px-4 -mx-4 hover:bg-[#F4F1E9]"
                >

                  <div className="flex items-center gap-8 md:gap-16 w-full md:w-1/2">
                    <span className={`text-xl font-['Playfair_Display',_serif] italic text-[#888888] w-8 group-hover:${item.themeText} transition-colors duration-700`}>
                      {item.num}.
                    </span>
                    <h4 className="text-3xl md:text-5xl font-['Playfair_Display',_serif] text-[#111317] group-hover:translate-x-4 transition-transform duration-[800ms] ease-out">
                      {item.category}
                    </h4>
                  </div>

                  <div className="mt-6 md:mt-0 flex justify-between items-center w-full md:w-1/2 md:pl-12">
                    <p className="text-xs font-medium text-[#555555] leading-relaxed max-w-sm group-hover:text-[#111317] transition-colors duration-700">
                      {item.intro.substring(0, 80)}...
                    </p>
                    <ArrowRight className={`w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:-rotate-45 transition-all duration-[800ms] ease-out ${item.themeText}`} strokeWidth={2} />
                  </div>

                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================
            5. THE EXPAND BRIDGE (Seamless Gradient Fade)
            ========================================= */}
        {!isManifestoExpanded && (
          <section className="relative w-full border-t border-[#111317]/20 bg-[#FDFBF7] overflow-hidden flex flex-col items-center h-[55vh]">

            {/* Crisp Document Preview (Top half is perfectly visible) */}
            <div className="w-full select-none pointer-events-none">
              <div className="text-center pt-16 mb-16">
                <h2 className="text-3xl font-['Playfair_Display',_serif] italic text-[#C5A059]">The Documentation</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[70vh]">
                <div className="md:col-span-3 flex flex-col p-8 md:p-12 bg-[#F4F1E9]/30">
                  <span className="text-[8rem] md:text-[12rem] font-['Playfair_Display',_serif] italic leading-[0.7] text-[#0A1128]">I.</span>
                </div>
                <div className="md:col-span-5 p-8 md:p-16 xl:p-24 flex flex-col justify-start">
                  <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#888888] mb-8">Asset Ledger Overview</h3>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-['Playfair_Display',_serif] leading-[1.1] mb-12 text-[#0A1128]">The Immutable Fleet Core.</h2>
                  <div className="text-sm text-[#333333] font-medium leading-[2.2] text-justify block">
                    <span className="float-left text-6xl font-['Playfair_Display',_serif] leading-[0.8] mr-4 mt-2 text-[#0A1128]">T</span>
                    he Asset Ledger is the definitive source of truth for your physical inventory. Unlike a simple list, the Ledger treats every vehicle as a high-value asset with a unique lifecycle.
                  </div>
                </div>
              </div>
            </div>

            {/* Seamless Gradient Fade to obscure the text */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FDFBF7]/80 to-[#FDFBF7] z-10 pointer-events-none"></div>
            {/* Solid anchor block at the very bottom to ensure the text totally vanishes */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#FDFBF7] z-10 pointer-events-none"></div>

            {/* The Action Button */}
            <div className="absolute bottom-16 z-20">
              <button
                onClick={() => setIsManifestoExpanded(true)}
                className="group flex flex-col items-center gap-4 text-[9px] uppercase tracking-[0.3em] font-bold text-[#111317] hover:text-[#C5A059] transition-colors duration-500"
              >
                <span className="border-b border-[#111317]/20 group-hover:border-[#C5A059] pb-2 transition-colors duration-500">
                  Unlock the Architecture Manifesto
                </span>
                <ChevronDown className="w-5 h-5 animate-bounce mt-2 text-[#C5A059]" strokeWidth={1.5} />
              </button>
            </div>

          </section>
        )}

        {/* =========================================
            6. DETAILED MODULES (Expanded State)
            ========================================= */}
        {isManifestoExpanded && (
          <main className="w-full bg-[#FDFBF7] border-t border-[#111317]/20 pt-16">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-3xl font-['Playfair_Display',_serif] italic text-[#C5A059]">The Documentation</h2>
            </div>

            {platformModules.map((mod) => {
              const firstLetter = mod.intro.charAt(0);
              const restOfIntro = mod.intro.slice(1);
              const sectionId = `module-${mod.category.replace(/\s+/g, '-').toLowerCase()}`;

              return (
                <article
                  key={mod.num}
                  id={sectionId}
                  className="w-full border-b border-[#111317]/20 animate-fade-in-up scroll-mt-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 min-h-[70vh]">

                    {/* Column 1: The Massive Numeral & Folio */}
                    <div className="md:col-span-3 flex flex-col justify-between p-8 md:p-12 border-b md:border-b-0 md:border-r border-[#111317]/20 bg-[#F4F1E9]/30">
                      <span className={`text-[8rem] md:text-[12rem] font-['Playfair_Display',_serif] italic leading-[0.7] ${mod.themeText}`}>
                        {mod.num}.
                      </span>
                      <div className="mt-12 md:mt-0 flex items-center gap-4 origin-left md:-rotate-90 md:translate-y-24 md:translate-x-4">
                        <span className="w-8 h-[1px] bg-[#111317]/30"></span>
                        <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#888888] whitespace-nowrap">
                          Section {mod.num} — {mod.category}
                        </span>
                      </div>
                    </div>

                    {/* Column 2: The Article Intro with Fixed Drop Cap */}
                    <div className="md:col-span-5 p-8 md:p-16 xl:p-24 border-b md:border-b-0 md:border-r border-[#111317]/20 flex flex-col justify-center">
                      <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#888888] mb-8">
                        {mod.category} Overview
                      </h3>
                      <h2 className={`text-4xl md:text-5xl lg:text-6xl font-['Playfair_Display',_serif] leading-[1.1] mb-12 ${mod.themeText}`}>
                        {mod.title}
                      </h2>

                      <div className="text-sm text-[#333333] font-medium leading-[2.2] text-justify block">
                        <span className={`float-left text-6xl font-['Playfair_Display',_serif] leading-[0.8] mr-4 mt-2 ${mod.themeText}`}>
                          {firstLetter}
                        </span>
                        {restOfIntro}
                      </div>
                    </div>

                    {/* Column 3: The Feature Index */}
                    <div className="md:col-span-4 p-8 md:p-16 flex flex-col justify-center bg-[#FDFBF7]">
                      <div className="flex flex-col h-full justify-center">
                        {mod.features.map((feature, fIdx) => (
                          <div key={fIdx} className={`py-6 ${fIdx !== 0 ? `border-t ${mod.themeBorder}` : ''}`}>
                            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111317] mb-3">
                              {feature.name}
                            </h4>
                            <p className="text-xs text-[#555555] leading-relaxed font-light text-justify">
                              {feature.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </article>
              );
            })}
          </main>
        )}
        <footer className="px-8 py-32 bg-[#111317] text-[#FDFBF7] flex flex-col items-center justify-center text-center relative overflow-hidden">
          <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#888888] mb-12 z-10">
            End of Document
          </p>
          <h2 className="text-5xl md:text-[7rem] font-['Playfair_Display',_serif] leading-[0.9] mb-16 tracking-tighter text-[#FDFBF7] z-10">
            Orchestrate the <br className="hidden md:block" /> <span className="italic text-[#C5A059]">Network.</span>
          </h2>
          <Link href="/Signup" className="inline-block bg-[#C5A059] text-[#111317] px-12 py-5 text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-[#FDFBF7] transition-colors duration-500 shadow-2xl z-10">
            Initialize Fleet.OS
          </Link>

          {/* Subtle Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#FDFBF7]/5 font-['Playfair_Display',_serif] text-[15rem] md:text-[30rem] font-bold pointer-events-none select-none w-full text-center tracking-tighter">
            END
          </div>
        </footer>

      </div>
    </div>
  )
}