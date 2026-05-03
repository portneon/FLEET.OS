"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { Loader2 } from "lucide-react";
import { financeAPI } from '@/lib/api';
import { TopBar } from '@/Components/ui/top-bar';
import OverviewTab from '@/Components/finance/OverviewTab';
import CustomersTab from '@/Components/finance/CustomersTab';
import InvoicesTab from '@/Components/finance/InvoicesTab';
import ExpensesTab from '@/Components/finance/ExpensesTab';
import FuelLogsTab from '@/Components/finance/FuelLogsTab';
import MaintenanceTab from '@/Components/finance/MaintenanceTab';
import PayrollTab from '@/Components/finance/PayrollTab';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'customers', label: 'Customers' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'fuel', label: 'Fuel Logs' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'payroll', label: 'Payroll' },
] as const;

type TabKey = typeof TABS[number]['key'];

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [dashboard, setDashboard] = useState<any>(null);
  const [receivables, setReceivables] = useState<any[]>([]);
  const [payables, setPayables] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Single global refresh function. Every tab calls this after any mutation
   * so dashboard KPIs, receivables, payables, and activity feed are always fresh.
   */
  const refresh = useCallback(async () => {
    const [dashRes, recvRes, payRes, actRes] = await Promise.all([
      financeAPI.getDashboard(),
      financeAPI.getReceivables(),
      financeAPI.getPayables(),
      financeAPI.getSummary(), // legacy table = audit trail of all transactions
    ]);
    if (!dashRes.error && dashRes.data) setDashboard(dashRes.data);
    if (!recvRes.error && recvRes.data) setReceivables(recvRes.data);
    if (!payRes.error && payRes.data) setPayables(payRes.data);
    if (!actRes.error && actRes.data) setActivity((actRes.data as any).recentActivity || []);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-[#1A1A1A]" strokeWidth={1.5} />
          <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#8C877D]">Aggregating Financials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F9F8F4] text-[#1A1A1A] font-sans h-full min-h-screen">
      <TopBar title="Financial Hub" />

      <div className="p-6 md:p-12 lg:p-16 flex-1 overflow-auto">
        {/* HEADER */}
        <div className="mb-10">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-2">
            Yield &amp; Expenditures
          </h3>
          <h2 className="text-5xl font-['Playfair_Display',_serif] tracking-tighter">
            Finance Hub.
          </h2>
        </div>

        {/* TAB BAR */}
        <div className="flex gap-1 mb-12 border-b border-[#DCD7CB] overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-semibold transition-colors whitespace-nowrap border-b-2 -mb-[1px] ${
                activeTab === tab.key
                  ? 'border-[#1A1A1A] text-[#1A1A1A]'
                  : 'border-transparent text-[#8C877D] hover:text-[#1A1A1A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT — all tabs receive onRefresh so any mutation triggers global state refresh */}
        {activeTab === 'overview' && (
          <OverviewTab dashboard={dashboard} receivables={receivables} payables={payables} activity={activity} onRefresh={refresh} />
        )}
        {activeTab === 'customers' && <CustomersTab onRefresh={refresh} />}
        {activeTab === 'invoices' && <InvoicesTab onRefresh={refresh} />}
        {activeTab === 'expenses' && <ExpensesTab onRefresh={refresh} />}
        {activeTab === 'fuel' && <FuelLogsTab onRefresh={refresh} />}
        {activeTab === 'maintenance' && <MaintenanceTab onRefresh={refresh} />}
        {activeTab === 'payroll' && <PayrollTab onRefresh={refresh} />}
      </div>
    </div>
  );
}