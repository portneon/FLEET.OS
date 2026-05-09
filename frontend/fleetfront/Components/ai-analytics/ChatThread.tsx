'use client';

import React, { useRef, useEffect } from 'react';
import { User, Bot, AlertCircle } from 'lucide-react';
import { AIResponseCard, AIResponse } from './AIResponseCard';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content?: string;
  response?: AIResponse;
  isError?: boolean;
}

interface ChatThreadProps {
  history: ChatTurn[];
  isThinking: boolean;
  onFollowUp?: (question: string) => void;
}

const EXAMPLE_QUERIES = [
  'What is our total revenue this month?',
  'Show top 5 vehicles by maintenance cost',
  'What is our trip completion rate?',
  'Break down expenses by category',
  'What is our profit margin?',
  'Show me overdue invoices',
];

export function ChatThread({ history, isThinking, onFollowUp }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isThinking]);

  if (history.length === 0 && !isThinking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
        <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] flex items-center justify-center mb-5 shadow-xl">
          <Bot className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">FleetOS AI Analytics</h2>
        <p className="text-sm text-[#8C877D] max-w-sm mb-8 leading-relaxed">
          Ask any question about your fleet data. I'll generate a full analytics dashboard with charts, KPIs, and insights.
        </p>
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
          {EXAMPLE_QUERIES.map((q, i) => (
            <button
              key={i}
              onClick={() => onFollowUp?.(q)}
              className="text-xs px-3.5 py-2 rounded-lg bg-white border border-[#E5E3DD] text-[#4A4A4A] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-all duration-200"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
      {history.map((turn, idx) => (
        <div key={idx} className={`flex gap-3 ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {turn.role === 'user' ? (
            <div className="flex items-end gap-2.5 max-w-[75%]">
              <div className="bg-[#1A1A1A] text-white px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed shadow-sm">
                {turn.content}
              </div>
              <div className="w-8 h-8 rounded-full bg-[#E5E3DD] flex items-center justify-center shrink-0 mb-0.5">
                <User className="w-4 h-4 text-[#4A4A4A]" />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-5xl">
              {turn.isError ? (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{turn.content}</p>
                </div>
              ) : turn.response ? (
                <AIResponseCard response={turn.response} onFollowUp={onFollowUp} />
              ) : (
                <div className="bg-white border border-[#E5E3DD] rounded-2xl px-4 py-3 text-sm text-[#4A4A4A]">
                  {turn.content}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {isThinking && (
        <div className="flex gap-3 justify-start">
          <div className="max-w-5xl bg-white border border-[#E5E3DD] rounded-2xl px-5 py-4 flex items-center gap-3 shadow-sm">
            <div className="flex gap-1.5">
              {[0, 150, 300].map(delay => (
                <div key={delay} className="w-2 h-2 rounded-full bg-[#1A1A1A] animate-bounce" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </div>
            <span className="text-xs font-medium text-[#8C877D] uppercase tracking-wide">Analyzing your data…</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
