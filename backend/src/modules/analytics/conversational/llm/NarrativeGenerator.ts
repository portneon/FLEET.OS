import Groq from 'groq-sdk';
import { LLM_CONFIG, DB_SCHEMA } from '../config/analyticsConfig';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface NarrativeResult {
  narrative: string;
  insights: string[];
  recommendations: string[];
}

/**
 * NarrativeGenerator — generates human-readable summaries and follow-up suggestions.
 * SECURITY: LLM ONLY receives pre-computed summary numbers — never raw DB records.
 *
 * NOTE: This class is ONLY called when there is actual data. Empty/no-data
 * results are handled upstream in AIAnalyticsController before reaching here.
 */
export class NarrativeGenerator {
  static async generate(
    query: string,
    domain: string,
    toolName: string,
    resultSummary: string
  ): Promise<NarrativeResult> {
    const systemPrompt = `You are a business intelligence analyst for a fleet and transport company.
You receive pre-computed analytics results and generate concise, actionable business narratives.

RULES:
1. Only interpret the numbers provided — do NOT invent or guess data.
2. Narrative: 2-3 sentences maximum. Be direct and specific about the numbers.
3. Provide 2-3 specific, actionable insights based ONLY on the numbers shown.
4. Provide 1-2 concrete recommendations.
5. If a value is 0 or null, say so directly — do NOT speculate about why.
6. NEVER mention internal tool names (like dynamicSqlQuery, aggregateMetric, etc.) in the narrative.
7. Respond ONLY with valid JSON — no markdown, no code blocks.

JSON format:
{
  "narrative": "<2-3 sentence business summary with specific numbers>",
  "insights": ["<specific insight 1>", "<specific insight 2>"],
  "recommendations": ["<actionable recommendation 1>"]
}`;

    const userMessage = `Domain: ${domain}\nUser asked: "${query}"\nTool used: ${toolName}\nComputed result:\n${resultSummary}`;

    try {
      const completion = await groq.chat.completions.create({
        model: LLM_CONFIG.model,
        max_tokens: LLM_CONFIG.narrativeMaxTokens,
        temperature: LLM_CONFIG.narrativeTemperature,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
      });

      const raw = completion.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw);
      return {
        narrative: parsed.narrative ?? 'Analytics computed successfully.',
        insights: Array.isArray(parsed.insights) ? parsed.insights.slice(0, 3) : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 2) : [],
      };
    } catch (err: any) {
      console.error('[NarrativeGenerator] Failed:', err.message);
      return { narrative: 'Analytics computed successfully.', insights: [], recommendations: [] };
    }
  }

  /**
   * Generate 3-4 natural follow-up questions the user might want to ask next.
   * These questions MUST be answerable using the actual database schema.
   */
  static async generateFollowUps(
    query: string,
    domain: string,
    resultSummary: string
  ): Promise<string[]> {
    const systemPrompt = `You are a business intelligence assistant for a fleet management company.
Given a user's analytics query and the result summary, generate 3-4 short, natural follow-up questions the user might want to ask next.

CRITICAL RULES:
1. Each follow-up question MUST be answerable using ONLY the database tables and fields listed below.
2. NEVER suggest questions about concepts, entities, or fields that do NOT exist in the schema (e.g. do NOT ask about "regions", "departments", "products", "services", "safety ratings", "customer satisfaction", "driver ratings" unless those columns exist).
3. Keep questions short (under 15 words) and natural-sounding.
4. Questions should drill deeper into the data the user just asked about OR explore related tables.

Database Schema:
${DB_SCHEMA}

Respond ONLY with valid JSON:
{ "followUps": ["question 1", "question 2", "question 3"] }`;

    const userMessage = `User asked: "${query}"\nDomain: ${domain}\nResult summary: ${resultSummary.slice(0, 400)}`;

    try {
      const completion = await groq.chat.completions.create({
        model: LLM_CONFIG.model,
        max_tokens: 200,
        temperature: 0.5,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
      });
      const raw = completion.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.followUps) ? parsed.followUps.slice(0, 4) : [];
    } catch {
      return [];
    }
  }

  /**
   * Compact summary of tool result — safe to send to LLM (never full raw records).
   */
  static buildResultSummary(toolName: string, data: any): string {
    if (!data) return 'No data returned.';

    // Handle dynamicSqlQuery shape: { result: [...], visualization: {...} }
    if (toolName === 'dynamicSqlQuery' && data.result) {
      const rows = data.result;
      if (!Array.isArray(rows) || rows.length === 0) return 'No data returned.';
      const top5 = rows.slice(0, 5);
      return `${rows.length} rows returned. Sample: ${JSON.stringify(top5)}`;
    }

    if (Array.isArray(data)) {
      if (data.length === 0) return 'No data returned.';
      const top5 = data.slice(0, 5);
      return `Array of ${data.length} items. Top items: ${JSON.stringify(top5)}`;
    }
    const str = JSON.stringify(data);
    return str.length > 1000 ? str.slice(0, 1000) + '...' : str;
  }
}
