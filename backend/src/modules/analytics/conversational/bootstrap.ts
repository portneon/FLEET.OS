/**
 * Tool Bootstrap — registers all analytics tools into the ToolRegistry at startup.
 * Import and call bootstrapTools() once during app initialization.
 */
import { ToolRegistry } from './tools/ToolRegistry';
import { aggregateMetricTool } from './tools/implementations/aggregateMetric';
import { groupMetricTool }     from './tools/implementations/groupMetric';
import { timeSeriesMetricTool } from './tools/implementations/timeSeriesMetric';
import { rankEntitiesTool }    from './tools/implementations/rankEntities';
import { computeKPITool }      from './tools/implementations/computeKPI';
import { statusDistributionTool } from './tools/implementations/statusDistribution';
import { dynamicPrismaQueryTool } from './tools/implementations/dynamicPrismaQuery';

export function bootstrapTools(): void {
  ToolRegistry.register(aggregateMetricTool);
  ToolRegistry.register(groupMetricTool);
  ToolRegistry.register(timeSeriesMetricTool);
  ToolRegistry.register(rankEntitiesTool);
  ToolRegistry.register(computeKPITool);
  ToolRegistry.register(statusDistributionTool);
  ToolRegistry.register(dynamicPrismaQueryTool);
  console.log('[AIAnalytics] Tools registered:', ToolRegistry.getAll().map(t => t.name).join(', '));
}
