import Groq from 'groq-sdk';
import { LLM_CONFIG } from '../config/analyticsConfig';

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
const DB_SCHEMA = `
Models & Key Fields (all implicitly filtered by organizationId):
- User: email, role(ADMIN,DISPATCHER,DRIVER,FINANCE)
- DriverProfile: userId, licenseNumber, experience, performance, status(AVAILABLE,ON_TRIP,OFF_DUTY)
- Vehicle: vin, type(BUS,TRUCK,VAN), licensePlate, seatingCapacity, status, purchasePrice, purchaseDate, residualValue, insuranceCost, loanAmount, monthlyEmi
- Fleet: name
- Route: name
- Stop: name, latitude, longitude
- Booking: tripId, userId, amount, status(CONFIRMED,CANCELLED,COMPLETED)
- Trip: routeId, vehicleId, driverId, status(SCHEDULED,IN_PROGRESS,COMPLETED,CANCELLED), scheduledStart, actualStart, actualEnd
- Transaction: amount, type(INCOME,EXPENSE), category, date
- Customer: name, email, phone, customerType(INDIVIDUAL,BUSINESS)
- Invoice: customerId, tripId, subtotal, tax, total, status(PENDING,PAID,OVERDUE,CANCELLED), issuedAt, dueDate
- Payment: invoiceId, amount, method, status
- Expense: vehicleId, driverId, tripId, category(FUEL,MAINTENANCE,SALARY,INSURANCE,TAX,TOLL,RENT,OTHER), amount, expenseDate
- FuelLog: vehicleId, tripId, liters, cost, odometer, filledAt
- MaintenanceLog: vehicleId, maintenanceType, cost, servicedAt
- Payroll: driverId, month, baseSalary, bonus, deductions, netPay
- Receivable: invoiceId, amountDue, dueDate, status
- Payable: vendor, amount, dueDate, status
`;

    const systemPrompt = `You are an analytics tool selector for a fleet management system.
Your ONLY job is to select the correct analytics tool and its parameters based on the user's query.
You have READ-ONLY access to analytics data. You cannot create, update, or delete any data.

RULES:
1. Respond with ONLY valid JSON — no markdown, no code blocks, no explanation text.
2. The "tool" field must be one of the available tool names listed.
3. If none of the predefined tools perfectly match the user's intent, YOU MUST fall back to "dynamicPrismaQuery".
4. When using "dynamicPrismaQuery", write a valid Prisma query using "model", "action" (findMany, aggregate, count, groupBy), and "args". Only use models and fields from the schema below.
5. All dates must be converted to ISO strings.

Schema Reference for dynamicPrismaQuery:
${DB_SCHEMA}

Available tools: ${availableToolNames.join(', ')}

Session context (for follow-up queries): ${sessionContext || 'None — this is a fresh query.'}

Respond ONLY with this JSON format:
{
  "tool": "<tool_name_or_dynamicPrismaQuery>",
  "params": { <key>: <value> },
  "reasoning": "<one sentence why>"
}
Example dynamicPrismaQuery params (args must be a JSON OBJECT, NOT a string):
{
  "tool": "dynamicPrismaQuery",
  "params": {
    "model": "expense",
    "action": "groupBy",
    "args": { "by": ["category"], "_sum": { "amount": true }, "orderBy": { "_sum": { "amount": "desc" } } }
  },
  "reasoning": "User wants expenses grouped by category"
}`;

    const userMessage = `User query: "${query}"\nDomain: ${domain}`;

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
