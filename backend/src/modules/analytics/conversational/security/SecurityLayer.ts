import { BLOCKED_FIELDS, BLOCKED_MODELS, ROLE_DOMAIN_ACCESS, AnalyticsDomain } from '../config/analyticsConfig';

export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
}

// Simple in-memory rate limiter per org
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export class SecurityLayer {

  /**
   * Validate incoming analytics request.
   * Checks: orgId present, role allowed for domain, rate limit not exceeded.
   */
  static validateRequest(
    orgId: string,
    role: string,
    domain: AnalyticsDomain,
    query: string
  ): SecurityCheckResult {

    if (!orgId || orgId.trim() === '') {
      return { allowed: false, reason: 'Organization ID is required.' };
    }

    // Role-domain access check
    const allowedDomains = ROLE_DOMAIN_ACCESS[role] || [];
    if (!allowedDomains.includes(domain) && !allowedDomains.includes('general' as AnalyticsDomain)) {
      return {
        allowed: false,
        reason: `Role '${role}' does not have access to '${domain}' analytics.`,
      };
    }

    // Prompt injection / blocked model keyword check
    const queryLower = query.toLowerCase();
    for (const blocked of BLOCKED_MODELS) {
      if (queryLower.includes(blocked)) {
        return {
          allowed: false,
          reason: `Access to '${blocked}' data is restricted.`,
        };
      }
    }

    // Rate limit: 15 queries/minute per org
    const now = Date.now();
    const entry = rateLimitStore.get(orgId);
    if (entry) {
      if (now < entry.resetAt) {
        if (entry.count >= 15) {
          return { allowed: false, reason: 'Rate limit exceeded. Please wait a moment.' };
        }
        entry.count++;
      } else {
        rateLimitStore.set(orgId, { count: 1, resetAt: now + 60_000 });
      }
    } else {
      rateLimitStore.set(orgId, { count: 1, resetAt: now + 60_000 });
    }

    return { allowed: true };
  }

  /**
   * Strip all blocked fields from any object (deep).
   * This is applied to every tool result before it reaches the LLM or client.
   */
  static stripBlockedFields<T>(data: T): T {
    if (Array.isArray(data)) {
      return data.map((item) => SecurityLayer.stripBlockedFields(item)) as unknown as T;
    }
    if (data !== null && typeof data === 'object') {
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        if (!BLOCKED_FIELDS.has(key.toLowerCase())) {
          cleaned[key] = SecurityLayer.stripBlockedFields(value);
        }
      }
      return cleaned as T;
    }
    return data;
  }

  /**
   * Sanitise a user query before passing to LLM.
   * Trims, length-limits, and strips obvious injection patterns.
   */
  static sanitiseQuery(query: string): string {
    let q = query.trim().slice(0, 500); // max 500 chars
    // Remove markdown/code blocks that might confuse the LLM
    q = q.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
    // Remove prompt injection attempts
    q = q.replace(/ignore previous instructions?/gi, '');
    q = q.replace(/system:/gi, '');
    return q.trim();
  }
}
