'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, MessageSquare, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { aiAnalyticsAPI } from '@/lib/api';
import { ChatInput } from '@/Components/ai-analytics/ChatInput';
import { ChatThread, ChatTurn } from '@/Components/ai-analytics/ChatThread';
import { AIResponse } from '@/Components/ai-analytics/AIResponseCard';

interface SessionSummary {
  sessionId: string;
  title: string;
  domain?: string;
  createdAt: string;
  lastActivity: string;
  turnCount: number;
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

export default function AIAnalyticsPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load sessions on mount
  const loadSessions = useCallback(async () => {
    const res = await aiAnalyticsAPI.listSessions();
    if (res.data) setSessions(res.data as SessionSummary[]);
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  // Create a new session and select it
  const createNewSession = async () => {
    const res = await aiAnalyticsAPI.createSession();
    if (res.data?.sessionId) {
      setActiveSessionId(res.data.sessionId);
      setHistory([]);
      setError(null);
      await loadSessions();
    }
  };

  // Send query
  const handleSend = async (message: string) => {
    // Auto-create session if none
    let sid = activeSessionId;
    if (!sid) {
      const res = await aiAnalyticsAPI.createSession();
      if (!res.data?.sessionId) { setError('Failed to create session.'); return; }
      sid = res.data.sessionId;
      setActiveSessionId(sid);
    }

    setHistory(prev => [...prev, { role: 'user', content: message }]);
    setIsThinking(true);
    setError(null);

    try {
      const res = await aiAnalyticsAPI.query(sid as string, message);
      if (res.error) {
        setHistory(prev => [...prev, { role: 'assistant', content: res.error, isError: true }]);
      } else if (res.data) {
        setHistory(prev => [...prev, { role: 'assistant', response: res.data as AIResponse }]);
        // Update session title in sidebar
        await loadSessions();
      }
    } catch {
      setHistory(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.', isError: true }]);
    } finally {
      setIsThinking(false);
    }
  };

  // Delete a session
  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(sessionId);
    await aiAnalyticsAPI.deleteSession(sessionId);
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setHistory([]);
    }
    await loadSessions();
    setDeletingId(null);
  };

  const formatTimeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#F5F4F0] font-['Inter',_sans-serif] overflow-hidden">

      {/* ─── LEFT SIDEBAR: Conversation History ─── */}
      <div className={`flex flex-col bg-white border-r border-[#E5E3DD] transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'} shrink-0`}>

        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#E5E3DD] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#1A1A1A]">Conversations</h2>
            <p className="text-[10px] text-[#8C877D] mt-0.5">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={createNewSession}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1A1A1A] text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MessageSquare className="w-8 h-8 text-[#DCD7CB] mb-3" />
              <p className="text-xs text-[#8C877D]">No conversations yet.<br />Ask your first question!</p>
            </div>
          )}
          {sessions.map(session => (
            <button
              key={session.sessionId}
              onClick={() => { setActiveSessionId(session.sessionId); setHistory([]); setError(null); }}
              className={`w-full text-left p-3 rounded-xl transition-all duration-150 group relative ${
                activeSessionId === session.sessionId
                  ? 'bg-[#1A1A1A] text-white'
                  : 'hover:bg-[#F5F4F0] text-[#1A1A1A]'
              }`}
            >
              <div className="flex items-start gap-2.5 pr-6">
                <MessageSquare className={`w-4 h-4 shrink-0 mt-0.5 ${activeSessionId === session.sessionId ? 'text-white/70' : 'text-[#8C877D]'}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-medium leading-snug truncate ${activeSessionId === session.sessionId ? 'text-white' : 'text-[#1A1A1A]'}`}>
                    {session.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {session.domain && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide ${
                        activeSessionId === session.sessionId
                          ? 'bg-white/20 text-white'
                          : DOMAIN_COLORS[session.domain] ?? DOMAIN_COLORS.general
                      }`}>
                        {session.domain}
                      </span>
                    )}
                    <span className={`text-[10px] ${activeSessionId === session.sessionId ? 'text-white/50' : 'text-[#AEABA5]'}`}>
                      {formatTimeAgo(session.lastActivity)}
                    </span>
                    {session.turnCount > 0 && (
                      <span className={`text-[10px] ${activeSessionId === session.sessionId ? 'text-white/50' : 'text-[#AEABA5]'}`}>
                        · {session.turnCount}q
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* Delete Button */}
              <button
                onClick={(e) => handleDelete(session.sessionId, e)}
                disabled={deletingId === session.sessionId}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150 ${
                  activeSessionId === session.sessionId
                    ? 'hover:bg-white/20 text-white/70 hover:text-white'
                    : 'hover:bg-red-50 text-[#AEABA5] hover:text-red-500'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </button>
          ))}
        </div>

        {/* Security Badge */}
        <div className="p-4 border-t border-[#E5E3DD]">
          <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-emerald-700 leading-snug font-medium">
              Read-only access. No passwords, personal data, or vehicle IDs are ever exposed.
            </p>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Bar */}
        <div className="flex-none flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5E3DD] shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="p-1.5 rounded-lg hover:bg-[#F5F4F0] text-[#8C877D] hover:text-[#1A1A1A] transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <div>
              <h1 className="text-sm font-bold text-[#1A1A1A]">
                {sessions.find(s => s.sessionId === activeSessionId)?.title ?? 'AI Analytics Dashboard'}
              </h1>
              <p className="text-[10px] text-[#8C877D]">Powered by Llama 3.3 · Read-only</p>
            </div>
          </div>
          {activeSessionId && (
            <button
              onClick={createNewSession}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#E5E3DD] text-[#8C877D] hover:text-[#1A1A1A] hover:bg-[#F5F4F0] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New chat
            </button>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 text-red-600 px-6 py-2.5 text-xs border-b border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        {/* Chat Thread */}
        <ChatThread
          history={history}
          isThinking={isThinking}
          onFollowUp={handleSend}
        />

        {/* Input Area */}
        <div className="flex-none bg-white border-t border-[#E5E3DD] p-4">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSend={handleSend} disabled={isThinking} />
            <p className="text-center text-[10px] text-[#AEABA5] mt-2 font-medium">
              Press Enter to send · Shift+Enter for new line · AI reads all data tables securely
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
