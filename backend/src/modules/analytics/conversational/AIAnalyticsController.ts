import { Request, Response } from 'express';
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
      const { message, sessionId } = req.body as { message: string; sessionId?: string };

      if (!message?.trim()) {
        res.status(400).json({ error: 'message is required.' });
        return;
      }

      const query = message.trim();
      const domain = 'general'; // Defaulting domain to bypass complex domain classification

      // 1. Get or create session
      const session = SessionStore.getOrCreate(sessionId, orgId);
      SessionStore.updateDomain(session.sessionId, domain);

      // 2. Build conversation context for LLM
      const context = SessionStore.buildContextSummary(session);

      // 3. Give LLM ALL tool signatures so it picks the best one
      const allTools = ToolRegistry.getAll();
      const toolNames = allTools.map(t => t.name);
      const signatures = ToolRegistry.getSignatures(toolNames);

      // 4. LLM selects tool + params
      const selection = await GroqRouter.selectTool(query, domain, signatures, context, toolNames);

      // 5. Execute selected tool via Prisma
      const result = await ToolRegistry.execute(selection.tool, selection.params, orgId, prisma);
      if (!result.success) {
        res.status(500).json({ error: result.error ?? 'Tool execution failed.' });
        return;
      }

      // 6. Check for empty data BEFORE NarrativeGenerator
      //    dynamicSqlQuery returns { result: [...], visualization: {...} }
      //    Other tools return arrays or objects directly
      const isEmptyData = (d: any): boolean => {
        if (!d) return true;
        if (Array.isArray(d) && d.length === 0) return true;
        // dynamicSqlQuery shape: { result: [...], visualization: {...} }
        if (d.result !== undefined) {
          if (!d.result) return true;
          if (Array.isArray(d.result) && d.result.length === 0) return true;
          // Check for single row where all values are null (e.g. SUM on empty set)
          if (Array.isArray(d.result) && d.result.length === 1) {
            const row = d.result[0];
            const allNull = Object.values(row).every(v => v === null || v === undefined);
            if (allNull) return true;
          }
        }
        return false;
      };
      const isEmpty = isEmptyData(result.data);

      let narrative = '';
      let insights: string[] = [];
      let recommendations: string[] = [];
      let followUps: string[] = [];

      if (!isEmpty) {
        // Only generate narratives if we actually have data
        const resultSummary = NarrativeGenerator.buildResultSummary(selection.tool, result.data);
        const narrativeResult = await NarrativeGenerator.generate(query, domain, selection.tool, resultSummary);
        narrative = narrativeResult.narrative;
        insights = narrativeResult.insights;
        recommendations = narrativeResult.recommendations;
        
        // Follow ups can be bundled or generated separately. We'll generate them now if we have data.
        followUps = await NarrativeGenerator.generateFollowUps(query, domain, resultSummary);
      }

      // 7. Format into structured dashboard response
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

      // Set empty state explicit flag if needed
      if (isEmpty) {
        response.noDataFound = true;
      }

      // 8. Persist conversation turns
      SessionStore.addTurn(session.sessionId, { role: 'user', content: query, domain, timestamp: new Date() });
      SessionStore.addTurn(session.sessionId, { role: 'assistant', content: narrative || 'No data found.', tool: selection.tool, domain, timestamp: new Date() });

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
