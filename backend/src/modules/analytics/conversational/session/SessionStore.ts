import { v4 as uuidv4 } from 'uuid';
import { RATE_LIMIT } from '../config/analyticsConfig';

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  tool?: string;
  domain?: string;
  timestamp: Date;
}

export interface SessionSummary {
  sessionId: string;
  title: string;            // First user question (truncated)
  domain?: string;
  createdAt: Date;
  lastActivity: Date;
  turnCount: number;
}

export interface ConversationSession {
  sessionId: string;
  organizationId: string;
  title: string;
  domain?: string;
  activeFilters: Record<string, any>;
  history: ConversationTurn[];
  createdAt: Date;
  lastActivity: Date;
}

// In-memory store (Phase 1 — replace with Redis for Phase 2)
const sessions = new Map<string, ConversationSession>();

// Cleanup stale sessions every 10 minutes
setInterval(() => {
  const cutoffMs = RATE_LIMIT.sessionTTLMinutes * 60 * 1000;
  const cutoff = Date.now() - cutoffMs;
  for (const [id, session] of sessions.entries()) {
    if (session.lastActivity.getTime() < cutoff) {
      sessions.delete(id);
    }
  }
}, 10 * 60 * 1000);

export const SessionStore = {
  create(organizationId: string, title?: string): ConversationSession {
    const session: ConversationSession = {
      sessionId: uuidv4(),
      organizationId,
      title: title ?? 'New conversation',
      domain: undefined,
      activeFilters: {},
      history: [],
      createdAt: new Date(),
      lastActivity: new Date(),
    };
    sessions.set(session.sessionId, session);
    return session;
  },

  get(sessionId: string): ConversationSession | undefined {
    return sessions.get(sessionId);
  },

  getOrCreate(sessionId: string | undefined, organizationId: string): ConversationSession {
    if (sessionId) {
      const existing = sessions.get(sessionId);
      if (existing && existing.organizationId === organizationId) {
        return existing;
      }
    }
    return SessionStore.create(organizationId);
  },

  /** Return all sessions for an org, sorted by most recent activity */
  listForOrg(organizationId: string): SessionSummary[] {
    const result: SessionSummary[] = [];
    for (const session of sessions.values()) {
      if (session.organizationId === organizationId) {
        result.push({
          sessionId: session.sessionId,
          title: session.title,
          domain: session.domain,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity,
          turnCount: session.history.filter(t => t.role === 'user').length,
        });
      }
    }
    return result.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  },

  addTurn(sessionId: string, turn: ConversationTurn): void {
    const session = sessions.get(sessionId);
    if (!session) return;

    // Auto-set title from first user message
    if (turn.role === 'user' && session.title === 'New conversation') {
      session.title = turn.content.length > 60
        ? turn.content.slice(0, 57) + '…'
        : turn.content;
    }

    session.history.push(turn);
    // Keep last N turns for context window budget
    const max = RATE_LIMIT.maxHistoryTurns * 2;
    if (session.history.length > max) {
      session.history = session.history.slice(-max);
    }
    session.lastActivity = new Date();
  },

  updateDomain(sessionId: string, domain: string): void {
    const session = sessions.get(sessionId);
    if (session) {
      session.domain = domain;
      session.lastActivity = new Date();
    }
  },

  delete(sessionId: string): void {
    sessions.delete(sessionId);
  },

  getHistory(sessionId: string): ConversationTurn[] {
    return sessions.get(sessionId)?.history ?? [];
  },

  /** Compact text context for the LLM — only summaries, never raw data */
  buildContextSummary(session: ConversationSession): string {
    if (session.history.length === 0) return '';
    return session.history
      .slice(-6)
      .map(t => `${t.role === 'user' ? 'User' : 'AI'}: ${t.content.slice(0, 250)}`)
      .join('\n');
  },
};
