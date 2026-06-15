export interface KPICard {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'red' | 'blue' | 'amber' | 'purple';
}

export interface ChartSpec {
  type: 'bar' | 'line' | 'area' | 'pie' | 'donut';
  title: string;
  data: { label: string; value: number; [key: string]: any }[];
  xKey: string;
  yKey: string;
}

export interface TableSpec {
  title: string;
  columns: { key: string; label: string; type?: 'number' | 'currency' | 'percent' | 'string' }[];
  rows: Record<string, any>[];
}

export interface AIAnalyticsResponse {
  sessionId: string;
  query: string;
  title: string;
  domain: string;
  toolUsed: string;
  kpiCards: KPICard[];
  charts: ChartSpec[];
  tables: TableSpec[];
  insights: string[];
  narrative: string;
  recommendations: string[];
  followUps: string[];
  reasoning?: string;
  noDataFound?: boolean;
}

export class ResultFormatter {
  static format(
    sessionId: string,
    query: string,
    domain: string,
    toolName: string,
    toolData: any,
    narrative: string,
    insights: string[],
    recommendations: string[],
    reasoning?: string,
    followUps: string[] = []
  ): AIAnalyticsResponse {
    const kpiCards: KPICard[] = [];
    const charts: ChartSpec[] = [];
    const tables: TableSpec[] = [];

    // ── aggregateMetric ──────────────────────────────────────────────────────
    if (toolName === 'aggregateMetric' && toolData) {
      kpiCards.push({
        label: ResultFormatter.friendlyMetricLabel(toolData.metric),
        value: toolData.currency ? ResultFormatter.formatCurrency(toolData.value) : toolData.value,
        unit: toolData.unit ?? toolData.currency ?? undefined,
        color: 'blue',
      });
    }

    // ── computeKPI ───────────────────────────────────────────────────────────
    if (toolName === 'computeKPI' && toolData) {
      if (toolData.kpi === 'profit_margin') {
        kpiCards.push(
          { label: 'Revenue', value: ResultFormatter.formatCurrency(toolData.revenue), color: 'green' },
          { label: 'Expenses', value: ResultFormatter.formatCurrency(toolData.expenses), color: 'red' },
          { label: 'Net Profit', value: ResultFormatter.formatCurrency(toolData.profit), color: toolData.profit >= 0 ? 'green' : 'red' },
          { label: 'Profit Margin', value: `${toolData.profitMargin}%`, color: toolData.profitMargin >= 20 ? 'green' : toolData.profitMargin >= 5 ? 'amber' : 'red' },
        );
        charts.push({
          type: 'bar',
          title: 'Revenue vs Expenses vs Profit',
          data: [
            { label: 'Revenue', value: toolData.revenue },
            { label: 'Expenses', value: toolData.expenses },
            { label: 'Profit', value: toolData.profit },
          ],
          xKey: 'label',
          yKey: 'value',
        });
      } else if (toolData.kpi === 'trip_completion_rate' || toolData.kpi === 'trip_cancellation_rate') {
        kpiCards.push(
          { label: 'Total Trips', value: toolData.totalTrips, color: 'blue' },
          { label: 'Completed', value: toolData.completedTrips, color: 'green' },
          { label: 'Cancelled', value: toolData.cancelledTrips, color: 'red' },
          { label: 'Completion Rate', value: `${toolData.completionRate}%`, color: 'blue' },
        );
        charts.push({
          type: 'pie',
          title: 'Trip Status Distribution',
          data: [
            { label: 'Completed', value: toolData.completedTrips },
            { label: 'Cancelled', value: toolData.cancelledTrips },
            { label: 'Other', value: toolData.totalTrips - toolData.completedTrips - toolData.cancelledTrips },
          ],
          xKey: 'label',
          yKey: 'value',
        });
      } else if (toolData.kpi === 'fleet_utilization_rate') {
        kpiCards.push(
          { label: 'Total Vehicles', value: toolData.totalVehicles, color: 'blue' },
          { label: 'Active Vehicles', value: toolData.activeVehicles, color: 'green' },
          { label: 'Utilization Rate', value: `${toolData.utilizationRate}%`, color: toolData.utilizationRate >= 70 ? 'green' : 'amber' },
        );
      } else {
        // Generic KPI
        Object.entries(toolData).forEach(([k, v]) => {
          if (k !== 'kpi' && typeof v === 'number') {
            kpiCards.push({ label: ResultFormatter.friendlyMetricLabel(k), value: v, color: 'blue' });
          }
        });
      }
    }

    // ── timeSeriesMetric ─────────────────────────────────────────────────────
    if (toolName === 'timeSeriesMetric' && toolData?.series) {
      charts.push({
        type: 'line',
        title: `${ResultFormatter.friendlyMetricLabel(toolData.metric)} over time (${toolData.granularity})`,
        data: toolData.series.map((s: any) => ({ label: s.label, value: s.value })),
        xKey: 'label',
        yKey: 'value',
      });
    }

    // ── groupMetric ──────────────────────────────────────────────────────────
    if (toolName === 'groupMetric' && Array.isArray(toolData) && toolData.length > 0) {
      const first = toolData[0];
      const hasAmount = 'total' in first;
      charts.push({
        type: 'bar',
        title: 'Breakdown',
        data: toolData.map((r: any) => ({
          label: r.label ?? r.category ?? r.routeName ?? r.vehicleId ?? r.driverId ?? 'Unknown',
          value: hasAmount ? r.total : r.count,
        })),
        xKey: 'label',
        yKey: 'value',
      });
      tables.push({
        title: 'Detailed Breakdown',
        columns: Object.keys(first).map((k) => ({
          key: k,
          label: ResultFormatter.friendlyMetricLabel(k),
          type: (k === 'total' || k === 'totalCost') ? 'currency' : typeof first[k] === 'number' ? 'number' : 'string',
        })),
        rows: toolData,
      });
    }

    // ── rankEntities ─────────────────────────────────────────────────────────
    if (toolName === 'rankEntities' && Array.isArray(toolData) && toolData.length > 0) {
      const first = toolData[0];
      charts.push({
        type: 'bar',
        title: 'Ranking',
        data: toolData.map((r: any) => ({
          label: `#${r.rank} ${r.name ?? r.vehicleId ?? r.driverId ?? r.customerId ?? ''}`,
          value: r.total ?? r.totalCost ?? r.count ?? 0,
        })),
        xKey: 'label',
        yKey: 'value',
      });
      tables.push({
        title: 'Ranked Results',
        columns: Object.keys(first).map((k) => ({
          key: k,
          label: ResultFormatter.friendlyMetricLabel(k),
          type: (k === 'total' || k === 'totalCost') ? 'currency' : typeof first[k] === 'number' ? 'number' : 'string',
        })),
        rows: toolData,
      });
    }

    // ── statusDistribution ───────────────────────────────────────────────────
    if (toolName === 'statusDistribution' && toolData?.distribution) {
      charts.push({
        type: 'pie',
        title: `${toolData.entity} Status Distribution`,
        data: toolData.distribution.map((d: any) => ({ label: d.status, value: d.count })),
        xKey: 'label',
        yKey: 'value',
      });
      if (toolData.distribution.some((d: any) => d.totalAmount !== undefined)) {
        kpiCards.push(...toolData.distribution.map((d: any) => ({
          label: d.status,
          value: ResultFormatter.formatCurrency(d.totalAmount),
          color: d.status === 'PAID' ? 'green' : d.status === 'OVERDUE' ? 'red' : 'amber',
        })));
      }
    }

    let noDataFound = false;

    // ── dynamicSqlQuery (Spec-driven and Heuristic Formatting) ───────────────
    if (toolName === 'dynamicSqlQuery' && toolData) {
      const data = toolData.result;
      const vis = toolData.visualization || {};
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        noDataFound = true;
      } else if (Array.isArray(data) && data.length === 1 && Object.values(data[0]).every(v => v === null || v === undefined)) {
        noDataFound = true;
      }

      if (!noDataFound && Array.isArray(data) && data.length > 0) {
        const first = data[0];
        const keys = Object.keys(first);

        const type = vis.type || 'table';
        const title = vis.title || 'Query Results';

        if (type === 'kpi') {
          Object.entries(first).forEach(([k, v]) => {
            if (typeof v === 'number') {
              const friendlyLabel = ResultFormatter.friendlyMetricLabel(k);
              const isCurrency = friendlyLabel.toLowerCase().includes('revenue') || 
                               friendlyLabel.toLowerCase().includes('cost') || 
                               friendlyLabel.toLowerCase().includes('total') || 
                               friendlyLabel.toLowerCase().includes('profit');
              kpiCards.push({ 
                label: friendlyLabel, 
                value: isCurrency ? ResultFormatter.formatCurrency(v) : v, 
                color: 'blue' 
              });
            } else if (typeof v === 'string') {
              kpiCards.push({ label: ResultFormatter.friendlyMetricLabel(k), value: v, color: 'purple' });
            }
          });
        } else if (type === 'bar' || type === 'line' || type === 'pie' || type === 'donut' || type === 'area') {
          const xKey = vis.xKey || keys[0];
          const yKey = vis.yKey || keys.find(k => typeof first[k] === 'number') || keys[0];
          
          charts.push({
            type: (type === 'bar' || type === 'line' || type === 'pie' || type === 'donut' || type === 'area') ? type as any : 'bar',
            title,
            data: data.map((r: any) => ({
              label: String(r[xKey]),
              value: Number(r[yKey]) || 0
            })),
            xKey: 'label',
            yKey: 'value'
          });

          tables.push({
            title: 'Detailed Breakdown',
            columns: keys.map(k => ({ 
              key: k, 
              label: ResultFormatter.friendlyMetricLabel(k),
              type: typeof first[k] === 'number' ? 'number' : 'string'
            })),
            rows: data
          });
        } else {
          tables.push({
            title,
            columns: keys.map(k => ({ 
              key: k, 
              label: ResultFormatter.friendlyMetricLabel(k),
              type: typeof first[k] === 'number' ? 'number' : 'string'
            })),
            rows: data
          });
        }
      }
    }

    return {
      sessionId,
      query,
      title: ResultFormatter.buildTitle(query, toolName, domain),
      domain,
      toolUsed: toolName,
      kpiCards,
      charts,
      tables,
      insights,
      narrative: noDataFound ? 'No data found matching your query.' : narrative,
      recommendations,
      followUps,
      reasoning,
      noDataFound,
    };
  }

  private static buildTitle(query: string, toolName: string, domain: string): string {
    const q = query.length > 60 ? query.slice(0, 60) + '…' : query;
    return q.charAt(0).toUpperCase() + q.slice(1);
  }

  private static formatCurrency(v: number): string {
    return `₹${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }

  static friendlyMetricLabel(key: string): string {
    const map: Record<string, string> = {
      metric: 'Metric', value: 'Value', totalRevenue: 'Total Revenue',
      totalExpenses: 'Total Expenses', totalProfit: 'Net Profit', revenue: 'Revenue',
      expenses: 'Expenses', profit: 'Profit', profitMargin: 'Profit Margin',
      completionRate: 'Completion Rate', cancellationRate: 'Cancellation Rate',
      utilizationRate: 'Utilization Rate', totalVehicles: 'Total Vehicles',
      activeVehicles: 'Active Vehicles', totalTrips: 'Total Trips',
      completedTrips: 'Completed Trips', cancelledTrips: 'Cancelled Trips',
      count: 'Count', total: 'Total Amount', totalCost: 'Total Cost',
      totalLiters: 'Fuel Liters', vehicleId: 'Vehicle ID', driverId: 'Driver ID',
      routeId: 'Route ID', routeName: 'Route', rank: 'Rank', label: 'Label',
      category: 'Category', status: 'Status', name: 'Name', type: 'Type',
      successRate: 'Success Rate', paidRate: 'Paid Rate', expenseRatio: 'Expense Ratio',
    };
    return map[key] ?? key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
  }
}
