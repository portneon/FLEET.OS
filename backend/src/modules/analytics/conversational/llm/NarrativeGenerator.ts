import Groq from 'groq-sdk';
import { LLM_CONFIG } from '../config/analyticsConfig';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface NarrativeResult {
  narrative: string;
  insights: string[];
  recommendations: string[];
}

/**
 * NarrativeGenerator — generates human-readable summaries and follow-up suggestions.
 * SECURITY: LLM ONLY receives pre-computed summary numbers — never raw DB records.
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
5. Respond ONLY with valid JSON — no markdown, no code blocks.

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
   */
  static async generateFollowUps(
    query: string,
    domain: string,
    resultSummary: string
  ): Promise<string[]> {
    const systemPrompt = `You are a business intelligence assistant for a fleet management company.
Given a user's analytics query and the result summary, generate 3-4 short, natural follow-up questions the user might want to ask next.
These should be specific, actionable, and related to drilling deeper into the data.

Respond ONLY with valid JSON:
{ "followUps": ["question 1", "question 2", "question 3", "question 4"] }`;

    const userMessage = `User asked: "${query}"\nDomain: ${domain}\nResult summary: ${resultSummary.slice(0, 400)}`;

    try {
      const completion = await groq.chat.completions.create({
        model: LLM_CONFIG.model,
        max_tokens: 200,
        temperature: 0.6,
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
    if (Array.isArray(data)) {
      const top3 = data.slice(0, 3);
      return `Array of ${data.length} items. Top items: ${JSON.stringify(top3)}`;
    }
    const str = JSON.stringify(data);
    return str.length > 1000 ? str.slice(0, 1000) + '...' : str;
  }
}
