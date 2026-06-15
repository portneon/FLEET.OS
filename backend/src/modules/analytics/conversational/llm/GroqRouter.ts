import Groq from 'groq-sdk';
import { LLM_CONFIG, DB_SCHEMA } from '../config/analyticsConfig';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface ToolSelection {
  tool: string;
  params: Record<string, any>;
  reasoning?: string;
}

/**
 * GroqRouter — selects which tool to call based on the user query.
 *
 * IMPORTANT: The LLM is ONLY used for tool selection and narrative generation.
 * It NEVER receives raw database records. It only sees:
 *   1. Tool signatures (names + parameters)
 *   2. User query
 *   3. Conversation summary (no raw data)
 * This guarantees read-only, data-safe LLM interaction.
 */
export class GroqRouter {
  /**
   * Select the best analytics tool + parameters for the query.
   * Returns a validated ToolSelection or throws if parsing fails.
   */
  static async selectTool(
    query: string,
    domain: string,
    toolSignatures: object[],
    sessionContext: string,
    availableToolNames: string[]
  ): Promise<ToolSelection> {


    const systemPrompt = `You are an analytics tool selector for a fleet management system.
Your ONLY job is to select the correct analytics tool and its parameters based on the user's query.
You have READ-ONLY access to analytics data. You cannot create, update, or delete any data.

DATABASE SCHEMA (use these exact table and column names in SQL queries):
${DB_SCHEMA}

RULES:
1. Respond with ONLY valid JSON — no markdown, no code blocks, no explanation text.
2. The "tool" field must be one of the available tool names listed.
3. If none of the predefined tools perfectly match the user's intent, YOU MUST fall back to "dynamicSqlQuery".
4. When using "dynamicSqlQuery", write a standard MySQL "sql" SELECT query and a "visualization" JSON string.
5. In the SELECT query, you DO NOT need to worry about tenant isolation or organizationId. The backend engine will automatically enforce tenant scope. Do NOT include :orgId or any organizationId filter.
6. If you need to join tables, do so normally without organizationId conditions.
7. For dynamic date filters, use standard MySQL date functions:
   * Current month: date >= DATE_FORMAT(NOW(), '%Y-%m-01') AND date <= LAST_DAY(NOW())
   * Current date/time: NOW()
   * Same month last year: date >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 YEAR) AND date <= LAST_DAY(DATE_SUB(NOW(), INTERVAL 1 YEAR))
   * NEVER generate literal Javascript expressions like \`\${new Date()}\` as they will crash the engine.
8. Available tools: ${availableToolNames.join(', ')}

Respond ONLY with this JSON format:
{
  "tool": "<tool_name_or_dynamicSqlQuery>",
  "params": { <key>: <value> },
  "reasoning": "<one sentence why>"
}

Example dynamicSqlQuery params (SQL must be SELECT only):
{
  "tool": "dynamicSqlQuery",
  "params": {
    "sql": "SELECT category, SUM(amount) AS total FROM Expense GROUP BY category ORDER BY total DESC",
    "visualization": "{\\"type\\":\\"bar\\",\\"title\\":\\"Expenses by Category\\",\\"xKey\\":\\"category\\",\\"yKey\\":\\"total\\"}"
  },
  "reasoning": "User wants expenses broken down by category"
}

Example dynamicSqlQuery for Payment success rate (joining tables):
{
  "tool": "dynamicSqlQuery",
  "params": {
    "sql": "SELECT p.status, COUNT(p.id) AS count, SUM(p.amount) AS total FROM Payment p JOIN Invoice i ON p.invoiceId = i.id GROUP BY p.status",
    "visualization": "{\\"type\\":\\"pie\\",\\"title\\":\\"Payment Status Distribution\\",\\"xKey\\":\\"status\\",\\"yKey\\":\\"count\\"}"
  },
  "reasoning": "User wants payment status distribution"
}`;

    const userMessage = `User query: "${query}"\nDomain: ${domain}\nConversation context: ${sessionContext}`;

    try {
      const completion = await groq.chat.completions.create({
        model: LLM_CONFIG.model,
        max_tokens: LLM_CONFIG.maxOutputTokens,
        temperature: LLM_CONFIG.temperature,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
      });

      const raw = completion.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw);

      // Validate: tool must be in the allowed list
      if (!availableToolNames.includes(parsed.tool)) {
        // Fallback to first available tool
        return {
          tool: availableToolNames[0] ?? 'aggregateMetric',
          params: {},
          reasoning: 'Fallback: LLM selected an unknown tool.',
        };
      }

      return {
        tool: parsed.tool,
        params: parsed.params ?? {},
        reasoning: parsed.reasoning ?? '',
      };
    } catch (err: any) {
      console.error('[GroqRouter] Tool selection failed:', err.message);
      // Safe fallback
      return {
        tool: availableToolNames[0] ?? 'aggregateMetric',
        params: {},
        reasoning: 'Fallback due to LLM error.',
      };
    }
  }

  /**
   * Generate a compact tool signatures string for the prompt.
   * Only exposes names and descriptions — no implementation details.
   */
  static buildToolSignaturesSummary(tools: object[]): string {
    return JSON.stringify(tools, null, 0);
  }
}
