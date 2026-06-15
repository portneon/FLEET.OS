import { PrismaClient } from '@prisma/client';
import { AnalyticsTool } from '../ToolRegistry';

/**
 * Tables that have a direct `organizationId` column.
 * For tables NOT in this set, the LLM must join to a parent table that does.
 */
const TABLES_WITH_ORG_ID = new Set([
  'user', 'vehicle', 'fleet', 'route', 'stop', 'booking',
  'trip', 'transaction', 'customer', 'invoice', 'expense',
  'receivable', 'payable',
]);

export const dynamicSqlQueryTool: AnalyticsTool = {
  name: 'dynamicSqlQuery',
  description: 'Fallback tool to execute raw, read-only SQL queries when predefined tools do not match the user intent. The backend automatically enforces tenant isolation — do NOT include organizationId in the query.',
  domains: ['finance', 'fleet', 'trips', 'drivers', 'customers', 'operations', 'general'],
  parameters: [
    {
      name: 'sql',
      type: 'string',
      required: true,
      description: 'Standard MySQL SELECT query. Do NOT include organizationId filters — the engine injects them automatically.',
    },
    {
      name: 'visualization',
      type: 'string',
      required: true,
      description: 'JSON string specifying visualization configuration: { "type": "table" | "bar" | "line" | "pie" | "kpi", "title": "...", "xKey"?: "...", "yKey"?: "..." }',
    },
  ],

  async execute(params, orgId, prisma: PrismaClient) {
    const { sql, visualization: visJson } = params;

    if (!sql || typeof sql !== 'string') {
      throw new Error('Invalid SQL parameter. A query string is required.');
    }

    // ── 1. Strip SQL comments and normalize whitespace ───────────────────────
    let cleanedSql = sql
      .replace(/\/\*[\s\S]*?\*\//g, '')   // block comments
      .replace(/--.*$/gm, '')             // line comments
      .replace(/\s+/g, ' ')               // collapse whitespace
      .trim();

    // ── 2. Enforce SELECT-only (after stripping comments) ───────────────────
    if (!/^select\b/i.test(cleanedSql)) {
      throw new Error('Security policy violation: Only SELECT queries are permitted.');
    }

    const forbiddenKeywords = [
      /\binsert\b/i, /\bupdate\b/i, /\bdelete\b/i, /\bdrop\b/i,
      /\balter\b/i, /\bcreate\b/i, /\btruncate\b/i, /\bgrant\b/i,
      /\breplace\b/i, /\bmerge\b/i, /\bexecute\b/i, /\bcall\b/i,
    ];

    for (const pattern of forbiddenKeywords) {
      if (pattern.test(cleanedSql)) {
        throw new Error('Security policy violation: Mutation or administrative SQL statements are blocked.');
      }
    }

    // ── 3. Auto-inject tenant isolation (organizationId) ────────────────────
    //    Parse FROM / JOIN to find tables and their aliases.
    //    For the first table that has organizationId, inject WHERE/AND condition.
    const bindParams: any[] = [];
    console.log('[dynamicSqlQuery] Raw SQL from LLM:', cleanedSql);
    const injected = injectTenantFilter(cleanedSql, orgId, bindParams);

    if (!injected.success) {
      console.error('[dynamicSqlQuery] Could not inject tenant filter:', injected.reason);
      throw new Error('Security policy violation: Could not enforce tenant isolation for this query.');
    }

    const finalSql = injected.sql;
    console.log('[dynamicSqlQuery] Final SQL with tenant filter:', finalSql);

    // ── 4. Parse visualization spec ─────────────────────────────────────────
    let visualizationSpec: any = { type: 'table', title: 'Query Results' };
    if (visJson && typeof visJson === 'string') {
      try {
        visualizationSpec = JSON.parse(visJson.trim());
      } catch {
        visualizationSpec = { type: 'table', title: 'Query Results' };
      }
    } else if (visJson && typeof visJson === 'object') {
      visualizationSpec = visJson;
    }

    // ── 5. Run raw query via Prisma ─────────────────────────────────────────
    try {
      const result = await prisma.$queryRawUnsafe(finalSql, ...bindParams);

      // Return empty array explicitly if null
      const rows = Array.isArray(result) ? result : [];

      return {
        result: rows,
        visualization: visualizationSpec,
      };
    } catch (err: any) {
      console.error('[dynamicSqlQuery] SQL Execution failed:', err.message);
      throw new Error('The query could not be processed. Please try rephrasing your question.');
    }
  },
};

// ─── Helper: Extract table references from SQL ──────────────────────────────

interface TableRef {
  table: string;       // actual table name (case-insensitive match)
  alias: string;       // alias used in query, or table name itself
}

/**
 * SQL keywords that should never be treated as table aliases.
 */
const SQL_KEYWORDS = new Set([
  'select', 'from', 'where', 'on', 'and', 'or', 'not', 'in', 'as',
  'left', 'right', 'inner', 'outer', 'cross', 'natural', 'full',
  'group', 'order', 'by', 'limit', 'having', 'union', 'all',
  'join', 'set', 'into', 'values', 'between', 'like', 'is', 'null',
  'asc', 'desc', 'distinct', 'case', 'when', 'then', 'else', 'end',
  'exists', 'any', 'some', 'with',
]);

/**
 * Parse FROM and JOIN clauses to extract table names and aliases.
 * Handles: FROM Table t, FROM Table AS t, JOIN Table t ON ..., etc.
 */
function parseTableRefs(sql: string): TableRef[] {
  const refs: TableRef[] = [];
  // Match FROM/JOIN <table> [AS] [alias]
  const pattern = /(?:from|join)\s+(\w+)(?:\s+(?:as\s+)?(\w+))?/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(sql)) !== null) {
    const table = match[1];
    let alias = match[2] || table;
    // Skip if the table name itself is a SQL keyword
    if (SQL_KEYWORDS.has(table.toLowerCase())) continue;
    // If alias is a SQL keyword, it's not actually an alias — it's the next clause
    if (SQL_KEYWORDS.has(alias.toLowerCase())) {
      alias = table; // use the table name as alias
    }
    refs.push({ table, alias });
  }
  return refs;
}

interface InjectionResult {
  success: boolean;
  sql: string;
  reason?: string;
}

/**
 * Injects `AND <alias>.organizationId = ?` into the SQL query for the first
 * table found that has an organizationId column.
 * If the query has no WHERE clause, injects `WHERE <alias>.organizationId = ?`.
 */
function injectTenantFilter(sql: string, orgId: string, bindParams: any[]): InjectionResult {
  // Also handle legacy :orgId placeholders (in case the LLM still adds them)
  if (/:orgId/i.test(sql)) {
    const patched = sql.replace(/:orgId/gi, '?');
    const count = (sql.match(/:orgId/gi) || []).length;
    for (let i = 0; i < count; i++) bindParams.push(orgId);
    return { success: true, sql: patched };
  }

  const refs = parseTableRefs(sql);
  if (refs.length === 0) {
    return { success: false, sql, reason: 'No tables found in query.' };
  }

  // Find the first table reference that has organizationId
  const target = refs.find(r => TABLES_WITH_ORG_ID.has(r.table.toLowerCase()));

  if (!target) {
    // None of the referenced tables have organizationId directly.
    // This means the LLM should have joined to a parent table.
    // As a safety fallback, reject the query.
    return {
      success: false,
      sql,
      reason: `None of the referenced tables (${refs.map(r => r.table).join(', ')}) have organizationId.`,
    };
  }

  const filterExpr = `${target.alias}.organizationId = ?`;
  bindParams.push(orgId);

  // Check if there's already a WHERE clause
  // We need to find the right WHERE — not one inside a subquery
  const whereMatch = sql.match(/\bWHERE\b/i);

  if (whereMatch) {
    // Insert after WHERE: WHERE <existing conditions> AND <our filter>
    // Find the position of WHERE and inject right after the keyword
    const whereIdx = sql.search(/\bWHERE\b/i);
    const afterWhere = whereIdx + 5; // "WHERE" is 5 chars
    const injectedSql = sql.slice(0, afterWhere) + ` ${filterExpr} AND` + sql.slice(afterWhere);
    return { success: true, sql: injectedSql };
  } else {
    // No WHERE clause. We need to insert one before GROUP BY / ORDER BY / LIMIT / HAVING
    const insertBeforePattern = /\b(GROUP\s+BY|ORDER\s+BY|LIMIT|HAVING|UNION)\b/i;
    const insertMatch = sql.match(insertBeforePattern);

    if (insertMatch && insertMatch.index !== undefined) {
      const injectedSql = sql.slice(0, insertMatch.index) + `WHERE ${filterExpr} ` + sql.slice(insertMatch.index);
      return { success: true, sql: injectedSql };
    } else {
      // No GROUP BY / ORDER BY either — append WHERE at end
      return { success: true, sql: `${sql} WHERE ${filterExpr}` };
    }
  }
}
