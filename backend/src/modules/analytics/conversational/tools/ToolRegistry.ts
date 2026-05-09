import { PrismaClient } from '@prisma/client';
import { SecurityLayer } from '../security/SecurityLayer';

export interface ToolParam {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'enum';
  required: boolean;
  description: string;
  enumValues?: string[];
}

export interface AnalyticsTool {
  name: string;
  description: string;
  domains: string[];
  parameters: ToolParam[];
  execute: (params: Record<string, any>, orgId: string, prisma: PrismaClient) => Promise<any>;
}

// Registry: name → tool definition
const registry = new Map<string, AnalyticsTool>();

export const ToolRegistry = {
  register(tool: AnalyticsTool): void {
    registry.set(tool.name, tool);
  },

  get(name: string): AnalyticsTool | undefined {
    return registry.get(name);
  },

  getForDomains(domains: string[]): AnalyticsTool[] {
    const tools: AnalyticsTool[] = [];
    for (const tool of registry.values()) {
      if (tool.domains.some((d) => domains.includes(d) || d === 'general')) {
        tools.push(tool);
      }
    }
    return tools;
  },

  getAll(): AnalyticsTool[] {
    return Array.from(registry.values());
  },

  /**
   * Execute a named tool safely.
   * Strips blocked fields from result before returning.
   */
  async execute(
    toolName: string,
    params: Record<string, any>,
    orgId: string,
    prisma: PrismaClient
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const tool = registry.get(toolName);
    if (!tool) {
      return { success: false, error: `Unknown tool: ${toolName}` };
    }

    try {
      const raw = await tool.execute(params, orgId, prisma);
      const safe = SecurityLayer.stripBlockedFields(raw);
      return { success: true, data: safe };
    } catch (err: any) {
      console.error(`[ToolRegistry] Error executing ${toolName}:`, err.message);
      return { success: false, error: `Tool execution failed: ${err.message}` };
    }
  },

  /**
   * Return compact tool signatures for the LLM prompt (no implementation details).
   */
  getSignatures(toolNames: string[]): object[] {
    return toolNames.map((name) => {
      const tool = registry.get(name);
      if (!tool) return { name, description: 'unknown' };
      return {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      };
    });
  },
};
