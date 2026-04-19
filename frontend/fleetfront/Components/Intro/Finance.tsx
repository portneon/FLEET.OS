"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { Download, Filter, ArrowUpRight, ArrowDownRight, Loader2, ArrowRight } from 'lucide-react';
import { financeAPI } from '@/lib/api';

export default function FinancialLedger() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [summary, setSummary] = useState({ revenue: 0, expenses: 0, profit: 0 });
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, INCOME, EXPENSE

    const fetchLedger = useCallback(async () => {
        setLoading(true);
        try {
            // Assuming your API returns both summary and the full list of transactions
            const res = await financeAPI.getSummary();
            if (!res.error && res.data) {
                setSummary({
                    revenue: res.data.revenue || 0,
                    expenses: res.data.expenses || 0,
                    profit: res.data.profit || 0
                });
                setTransactions(res.data.recentActivity || []);
            }
        } catch (error) {
            console.error('Failed to fetch ledger:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLedger();
    }, [fetchLedger]);

    const filteredTransactions = transactions.filter(t => {
        if (activeFilter === 'ALL') return true;
        return t.type === activeFilter;
    });

    return (
        <div className="relative min-h-screen bg-[#FDFBF7] text-[#111317] font-sans selection:bg-[#C5A059] selection:text-[#FDFBF7] overflow-hidden">

            {/* CUSTOM CSS FOR GRAIN & CINEMATIC MOTION */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .paper-grain::before {
          content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 50;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}} />
            <div className="paper-grain absolute inset-0 mix-blend-overlay fixed"></div>

            <div className="relative z-10 flex flex-col h-screen">

                {/* EDITORIAL MASTHEAD */}
                <header className="w-full px-8 py-8 flex justify-between items-end border-b border-[#111317]/10 animate-fade-in-up">
                    <div className="flex flex-col gap-1 text-[9px] uppercase tracking-[0.2em] text-[#C5A059] font-bold">
                        <span>Corporate Treasury</span>
                        <span>Master Account</span>
                    </div>

                    <div className="flex gap-8 text-[9px] uppercase tracking-[0.2em] font-bold text-[#0A1128]">
                        <button className="flex items-center gap-2 hover:text-[#C5A059] transition-colors duration-500 pb-1 group">
                            <Download className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" strokeWidth={2} />
                            Export Folio
                        </button>
                    </div>
                </header>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 overflow-auto px-8 py-16 md:px-16 lg:px-24">

                    {/* TITLE & SUMMARY SECTION */}
                    <div className="mb-24 animate-fade-in-up delay-100">
                        <h1 className="text-6xl md:text-[6rem] font-['Playfair_Display',_serif] leading-[0.8] tracking-tighter text-[#0A1128] mb-16">
                            Financial <br />
                            <span className="italic text-[#C5A059] font-light pr-12">Ledger.</span>
                        </h1>

                        {/* Typography-Driven Stats (No Boxes) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 border-y border-[#111317]/10 divide-y md:divide-y-0 md:divide-x divide-[#111317]/10">

                            <div className="py-10 md:pr-12 group">
                                <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#888888] mb-4 flex items-center gap-2">
                                    Gross Yield <ArrowUpRight className="w-3 h-3 text-[#1E352F]" strokeWidth={2} />
                                </p>
                                <p className="text-4xl md:text-5xl font-['Playfair_Display',_serif] text-[#0A1128] group-hover:text-[#C5A059] transition-colors duration-500">
                                    ₹{summary.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            <div className="py-10 md:px-12 group">
                                <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#888888] mb-4 flex items-center gap-2">
                                    Operating Expenditures <ArrowDownRight className="w-3 h-3 text-[#5B1824]" strokeWidth={2} />
                                </p>
                                <p className="text-4xl md:text-5xl font-['Playfair_Display',_serif] text-[#0A1128] group-hover:text-[#5B1824] transition-colors duration-500">
                                    ₹{summary.expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            <div className="py-10 md:pl-12 group">
                                <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#C5A059] mb-4">
                                    Net Capital Margin
                                </p>
                                <p className="text-4xl md:text-5xl font-['Playfair_Display',_serif] text-[#0A1128] group-hover:text-[#1E352F] transition-colors duration-500">
                                    ₹{summary.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* THE LEDGER TABLE */}
                    <div className="animate-fade-in-up delay-200">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-[#111317]/10 pb-4">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#0A1128]">
                                Transaction History
                            </h3>

                            {/* Elegant Filters */}
                            <div className="flex gap-6 text-[9px] uppercase tracking-[0.2em] font-bold mt-6 md:mt-0">
                                {['ALL', 'INCOME', 'EXPENSE'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`pb-1 transition-all duration-300 ${activeFilter === filter
                                                ? 'text-[#C5A059] border-b border-[#C5A059]'
                                                : 'text-[#888888] hover:text-[#0A1128]'
                                            }`}
                                    >
                                        {filter === 'ALL' ? 'Complete Folio' : filter === 'INCOME' ? 'Yields Only' : 'OPEX Only'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-32 flex flex-col items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-[#C5A059]" strokeWidth={1.5} />
                                <p className="text-[9px] uppercase tracking-widest font-bold text-[#888888] mt-4">Auditing Records...</p>
                            </div>
                        ) : filteredTransactions.length === 0 ? (
                            <div className="py-32 flex flex-col items-center justify-center text-center">
                                <p className="text-lg font-['Playfair_Display',_serif] italic text-[#888888] mb-4">
                                    The ledger is currently immaculate.
                                </p>
                                <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#0A1128]">
                                    No transactions match the current criteria.
                                </p>
                            </div>
                        ) : (
                            <div className="w-full">
                                {/* Custom Editorial Table Layout */}
                                <div className="grid grid-cols-12 gap-4 pb-4 border-b border-[#111317]/10 text-[9px] uppercase tracking-[0.3em] font-bold text-[#888888]">
                                    <div className="col-span-2">Date</div>
                                    <div className="col-span-3">Category</div>
                                    <div className="col-span-5">Particulars</div>
                                    <div className="col-span-2 text-right">Value (₹)</div>
                                </div>

                                <div className="flex flex-col">
                                    {filteredTransactions.map((t, idx) => (
                                        <div
                                            key={t.id || idx}
                                            className="grid grid-cols-12 gap-4 py-6 border-b border-[#111317]/5 hover:bg-[#F4F1E9]/50 transition-colors duration-500 items-center group cursor-default"
                                        >
                                            <div className="col-span-2 font-mono text-[10px] text-[#555555]">
                                                {new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>

                                            <div className="col-span-3 text-[10px] uppercase tracking-[0.2em] font-bold text-[#0A1128]">
                                                {t.category}
                                            </div>

                                            <div className="col-span-5 text-sm font-light text-[#555555] pr-8 truncate">
                                                {t.description || '—'}
                                            </div>

                                            <div className="col-span-2 text-right font-['Playfair_Display',_serif] text-lg tracking-wide flex justify-end items-center gap-2">
                                                <span className={`${t.type === 'INCOME' ? 'text-[#1E352F]' : 'text-[#5B1824]'}`}>
                                                    {t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Decorative End Mark */}
                    {!loading && filteredTransactions.length > 0 && (
                        <div className="mt-16 flex justify-center animate-fade-in-up delay-300">
                            <div className="h-[1px] w-12 bg-[#C5A059]/50"></div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}