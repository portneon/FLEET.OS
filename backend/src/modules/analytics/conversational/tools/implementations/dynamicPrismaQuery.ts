import { PrismaClient } from '@prisma/client';
import { AnalyticsTool } from '../ToolRegistry';
import { ALLOWED_MODELS } from '../../config/analyticsConfig';

export const dynamicPrismaQueryTool: AnalyticsTool = {
  name: 'dynamicPrismaQuery',
  description: 'Fallback tool to execute dynamic, read-only Prisma queries when predefined tools do not match the user intent.',
  domains: ['finance', 'fleet', 'trips', 'drivers', 'customers', 'operations', 'general'],
  parameters: [
    { name: 'model',  type: 'string', required: true, description: 'The Prisma model to query. Use camelCase (e.g. "transaction", "fuelLog", "maintenanceLog").' },
    { name: 'action', type: 'string', required: true, description: 'Prisma action: findMany | findFirst | count | aggregate | groupBy' },
    { name: 'args',   type: 'string', required: true, description: 'JSON string of Prisma query arguments (where, select, orderBy, take, by, _sum, etc.)' },
  ],

  async execute(params, orgId, prisma: PrismaClient) {
    const { action, args: argsJson } = params;

    // ── 1. Normalize model name ───────────────────────────────────────────────
    // The LLM may send 'Transaction', 'transaction', 'TRANSACTION', etc.
    // Prisma client exposes models as camelCase properties (prisma.transaction).
    // We lowercase the input and find the matching Prisma client key.
    const modelRaw: string = String(params.model);
    const modelKey = Object.keys(prisma).find(
      k => k.toLowerCase() === modelRaw.toLowerCase()
    );

    if (!modelKey || !ALLOWED_MODELS.includes(modelKey as any)) {
      throw new Error(
        `Method not allowed: Access to model '${modelRaw}' is forbidden. ` +
        `Allowed models: ${ALLOWED_MODELS.join(', ')}`
      );
    }

    // ── 2. Validate action (read-only safeguard) ─────────────────────────────
    const allowedActions = ['findMany', 'findFirst', 'count', 'aggregate', 'groupBy'];
    if (!allowedActions.includes(action)) {
      throw new Error(`Method not allowed: Action '${action}' is not permitted. Must be one of: ${allowedActions.join(', ')}`);
    }

    // ── 3. Parse args ─────────────────────────────────────────────────────────
    // The LLM may pass args as:
    //   a) An already-parsed object  { by: ['category'], _sum: { amount: true } }
    //   b) A valid JSON string        '{"by":["category"],"_sum":{"amount":true}}'
    //   c) A double-escaped string    '{"by":[\\"category\\"]}'  (rare but happens)
    //   d) null / undefined           → treated as empty object
    let args: any = {};
    if (argsJson === null || argsJson === undefined || argsJson === '') {
      args = {};
    } else if (typeof argsJson === 'object') {
      // Already an object — use directly
      args = argsJson;
    } else if (typeof argsJson === 'string') {
      const trimmed = argsJson.trim();
      if (trimmed === '' || trimmed === '{}') {
        args = {};
      } else {
        // First attempt: direct parse
        try {
          args = JSON.parse(trimmed);
        } catch {
          // Second attempt: the string might be double-escaped
          try {
            args = JSON.parse(JSON.parse(`"${trimmed.replace(/^"|"$/g, '')}"`));
          } catch {
            // Third attempt: strip outer quotes if present and try once more
            try {
              const unquoted = trimmed.replace(/^['"]|['"]$/g, '');
              args = JSON.parse(unquoted);
            } catch {
              throw new Error(
                `Invalid args format. Expected a JSON object or valid JSON string. Received: ${String(argsJson).slice(0, 200)}`
              );
            }
          }
        }
      }
    }

    // ── 4. Forcible tenant isolation ──────────────────────────────────────────
    // organizationId is ALWAYS injected — the LLM cannot override this.
    args.where = { ...(args.where ?? {}), organizationId: orgId };

    // ── 5. Cap result size ────────────────────────────────────────────────────
    if (action === 'findMany' && !args.take) {
      args.take = 50; // default limit
    }
    if (action === 'findMany' && args.take > 100) {
      args.take = 100; // hard cap
    }

    // ── 6. Execute via Prisma ─────────────────────────────────────────────────
    try {
      // @ts-ignore – dynamic access; modelKey is validated above
      const result = await (prisma as any)[modelKey][action](args);
      return result;
    } catch (err: any) {
      throw new Error(`Dynamic query failed on ${modelKey}.${action}: ${err.message}`);
    }
  },
};
