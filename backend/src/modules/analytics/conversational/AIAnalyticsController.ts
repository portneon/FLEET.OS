import { Request, Response } from 'express';
import { DomainClassifier } from './classifier/DomainClassifier';
import { SecurityLayer } from './security/SecurityLayer';
import { ToolRegistry } from './tools/ToolRegistry';
import { GroqRouter } from './llm/GroqRouter';
import { NarrativeGenerator } from './llm/NarrativeGenerator';
import { SessionStore } from './session/SessionStore';
import { ResultFormatter } from './formatters/ResultFormatter';
import { prisma } from '../../../prisma';

export class AIAnalyticsController {

  // ─── POST /ai-analytics/query ──────────────────────────────────────────────
  public query = async (req: Request, res: Response): Promise<void> => {
    try {
      const orgId = req.headers['x-organization-id'] as string;
      const role  = (req.headers['x-user-role'] as string) ?? 'ADMIN';
      const { message, sessionId } = req.body as { message: string; sessionId?: string };

      if (!message?.trim()) {
        res.status(400).json({ error: 'message is required.' });
        return;
      }

      // 1. Sanitise query
      const query = SecurityLayer.sanitiseQuery(message);

      // 2. Classify domain (keyword-based, no LLM cost)
      const { domain, suggestedTools } = DomainClassifier.classify(query);

      // 3. Security validation
      const check = SecurityLayer.validateRequest(orgId, role, domain, query);
      if (!check.allowed) {
        res.status(403).json({ error: check.reason });
        return;
      }

      // 4. Get or create session (session persists across queries)
      const session = SessionStore.getOrCreate(sessionId, orgId);
      SessionStore.updateDomain(session.sessionId, domain);

      // 5. Build conversation context for LLM (text summaries only — no raw DB data)
      const context = SessionStore.buildContextSummary(session);

      // 6. Give LLM ALL tool signatures so it picks the best one based on intent
      const allTools = ToolRegistry.getAll();
      const toolNames = allTools.map(t => t.name);
      const signatures = ToolRegistry.getSignatures(toolNames);

      // 7. LLM selects tool + params (read-only, sees only schema + query)
      const selection = await GroqRouter.selectTool(query, domain, signatures, context, toolNames);

      // 8. Execute selected tool via Prisma (always enforces orgId in every query)
      const result = await ToolRegistry.execute(selection.tool, selection.params, orgId, prisma);
      if (!result.success) {
        res.status(500).json({ error: result.error ?? 'Tool execution failed.' });
        return;
      }

      // 9. Build compact summary for narrative (LLM NEVER sees full raw records)
      const resultSummary = NarrativeGenerator.buildResultSummary(selection.tool, result.data);

      // 10. Generate AI narrative + follow-up suggestions
      const { narrative, insights, recommendations } = await NarrativeGenerator.generate(
        query, domain, selection.tool, resultSummary
      );

      // 11. Generate AI follow-up question suggestions
      const followUps = await NarrativeGenerator.generateFollowUps(query, domain, resultSummary);

      // 12. Format into structured dashboard response
      const response = ResultFormatter.format(
        session.sessionId,
        query,
        domain,
        selection.tool,
        result.data,
        narrative,
        insights,
        recommendations,
        selection.reasoning,
        followUps
      );

      // 13. Persist conversation turns
      SessionStore.addTurn(session.sessionId, { role: 'user', content: query, domain, timestamp: new Date() });
      SessionStore.addTurn(session.sessionId, { role: 'assistant', content: narrative, tool: selection.tool, domain, timestamp: new Date() });

      res.status(200).json({ data: response });
    } catch (err: any) {
      console.error('[AIAnalyticsController] query error:', err.message);
      res.status(500).json({ error: 'Internal analytics error.' });
    }
  };

  // ─── GET /ai-analytics/sessions ────────────────────────────────────────────
  public listSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      const orgId = req.headers['x-organization-id'] as string;
      if (!orgId) { res.status(400).json({ error: 'Organization ID required.' }); return; }
      const sessions = SessionStore.listForOrg(orgId);
      res.status(200).json({ data: sessions });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to list sessions.' });
    }
  };

  // ─── POST /ai-analytics/session ────────────────────────────────────────────
  public createSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const orgId = req.headers['x-organization-id'] as string;
      if (!orgId) { res.status(400).json({ error: 'Organization ID required.' }); return; }
      const session = SessionStore.create(orgId);
      res.status(201).json({ data: { sessionId: session.sessionId, title: session.title } });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create session.' });
    }
  };

  // ─── DELETE /ai-analytics/session/:id ──────────────────────────────────────
  public deleteSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const orgId = req.headers['x-organization-id'] as string;
      const session = SessionStore.get(id);
      if (!session || session.organizationId !== orgId) {
        res.status(404).json({ error: 'Session not found.' }); return;
      }
      SessionStore.delete(id);
      res.status(200).json({ message: 'Session deleted.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete session.' });
    }
  };

  // ─── GET /ai-analytics/session/:id/history ─────────────────────────────────
  public getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const orgId = req.headers['x-organization-id'] as string;
      const session = SessionStore.get(id);
      if (!session || session.organizationId !== orgId) {
        res.status(404).json({ error: 'Session not found.' }); return;
      }
      res.status(200).json({ data: SessionStore.getHistory(id) });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve history.' });
    }
  };
}
