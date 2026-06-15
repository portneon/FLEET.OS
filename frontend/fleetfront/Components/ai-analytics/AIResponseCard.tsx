'use client';

import React from 'react';
import { Sparkles, TrendingUp, Target, ChevronRight, Database, Clock } from 'lucide-react';
import { KPIChip, KPICard } from './KPIChip';
import { DynamicChart, ChartSpec } from './DynamicChart';
import { DataTable, TableSpec } from './DataTable';

export interface AIResponse {
  sessionId: string;
  query: string;
  title: string;
  domain: string;
  toolUsed: string;
  kpiCards: KPICard[];
  charts: ChartSpec[];
  tables: TableSpec[];
  narrative: string;
  insights: string[];
  recommendations: string[];
  followUps: string[];
  reasoning?: string;
  noDataFound?: boolean;
}

const DOMAIN_COLORS: Record<string, string> = {
  finance: 'bg-emerald-100 text-emerald-700',
  fleet: 'bg-blue-100 text-blue-700',
  trips: 'bg-purple-100 text-purple-700',
  drivers: 'bg-amber-100 text-amber-700',
  customers: 'bg-rose-100 text-rose-700',
  operations: 'bg-slate-100 text-slate-700',
  general: 'bg-gray-100 text-gray-700',
};

interface AIResponseCardProps {
  response: AIResponse;
  onFollowUp?: (question: string) => void;
}

export function AIResponseCard({ response, onFollowUp }: AIResponseCardProps) {
  const hasKPIs = response.kpiCards?.length > 0;
  const hasCharts = response.charts?.length > 0;
  const hasTables = response.tables?.length > 0;
  const hasInsights = response.insights?.length > 0;
  const hasRecs = response.recommendations?.length > 0;
  const hasFollowUps = response.followUps?.length > 0;

  const domainClass = DOMAIN_COLORS[response.domain] ?? DOMAIN_COLORS.general;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E3DD] shadow-sm overflow-hidden">

      {/* ── Card Header ── */}
      <div className="px-6 py-4 bg-[#F9F8F4] border-b border-[#E5E3DD] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-base font-semibold text-[#1A1A1A] truncate">{response.title}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${domainClass}`}>
            {response.domain}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#E5E3DD] text-[#4A4A4A] uppercase tracking-wide flex items-center gap-1">
            <Database className="w-2.5 h-2.5" />{response.toolUsed}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-7">

        {/* ── AI Narrative ── */}
        <div className="bg-gradient-to-r from-[#F9F8F4] to-white border border-[#E5E3DD] rounded-xl p-4">
          <p className="text-sm text-[#2A2A2A] leading-relaxed">{response.narrative}</p>
        </div>

        {/* ── Empty State ── */}
        {response.noDataFound && (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4 bg-[#F9F8F4] border border-dashed border-[#DCD7CB] rounded-xl">
            <Database className="w-8 h-8 text-[#AEABA5] mb-3" />
            <h4 className="text-sm font-semibold text-[#1A1A1A] mb-1">No Data Found</h4>
            <p className="text-xs text-[#8C877D] max-w-sm">
              The query executed successfully but returned zero rows or null metrics for this organization.
            </p>
          </div>
        )}

        {/* ── KPI Cards ── */}
        {!response.noDataFound && hasKPIs && (
          <div className={`grid gap-3 ${
            response.kpiCards.length === 1 ? 'grid-cols-1 max-w-xs' :
            response.kpiCards.length === 2 ? 'grid-cols-2' :
            response.kpiCards.length === 3 ? 'grid-cols-3' :
            'grid-cols-2 md:grid-cols-4'
          }`}>
            {response.kpiCards.map((kpi, i) => <KPIChip key={i} {...kpi} />)}
          </div>
        )}

        {/* ── Charts & Tables ── */}
        {!response.noDataFound && (hasCharts || hasTables) && (
          <div className={`grid gap-6 ${hasCharts && hasTables ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
            {hasCharts && response.charts.map((chart, i) => (
              <div key={i} className="flex flex-col">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8C877D] mb-3">{chart.title}</h4>
                <div className="h-[260px] border border-[#E5E3DD] rounded-xl bg-[#FDFCF9] p-3">
                  <DynamicChart spec={chart} />
                </div>
              </div>
            ))}
            {hasTables && response.tables.map((table, i) => (
              <div key={i} className="flex flex-col">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8C877D] mb-3">{table.title}</h4>
                <DataTable spec={table} />
              </div>
            ))}
          </div>
        )}

        {/* ── Insights & Recommendations ── */}
        {!response.noDataFound && (hasInsights || hasRecs) && (
          <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-[#F0EFEA]">
            {hasInsights && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-[#4A90D9]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">Key Insights</span>
                </div>
                {response.insights.map((ins, i) => (
                  <div key={i} className="flex gap-2.5 text-sm text-[#4A4A4A]">
                    <span className="text-[#4A90D9] mt-0.5 font-bold shrink-0">•</span>
                    <span className="leading-snug">{ins}</span>
                  </div>
                ))}
              </div>
            )}
            {hasRecs && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">Recommendations</span>
                </div>
                {response.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-2.5 text-sm text-[#4A4A4A]">
                    <span className="text-emerald-500 mt-0.5 font-bold shrink-0">→</span>
                    <span className="leading-snug">{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Follow-up Suggestions ── */}
        {hasFollowUps && onFollowUp && (
          <div className="pt-2 border-t border-[#F0EFEA]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8C877D] mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Follow-up questions
            </p>
            <div className="flex flex-wrap gap-2">
              {response.followUps.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onFollowUp(q)}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-[#F9F8F4] hover:bg-[#1A1A1A] hover:text-white text-[#4A4A4A] border border-[#E5E3DD] hover:border-[#1A1A1A] transition-all duration-200 group"
                >
                  <span className="text-left">{q}</span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
