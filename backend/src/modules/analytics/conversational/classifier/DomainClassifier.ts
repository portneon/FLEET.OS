import { AnalyticsDomain } from '../config/analyticsConfig';

interface ClassificationResult {
  domain: AnalyticsDomain;
  confidence: 'high' | 'medium' | 'low';
  suggestedTools: string[];
}

// Keyword map: each domain has weighted keywords
const DOMAIN_KEYWORDS: Record<AnalyticsDomain, string[]> = {
  finance: [
    'revenue', 'profit', 'loss', 'income', 'expense', 'invoice', 'payment',
    'receivable', 'payable', 'margin', 'budget', 'cost', 'billing', 'tax',
    'salary', 'payroll', 'financial', 'cash', 'fund', 'money', 'earn',
    'q1', 'q2', 'q3', 'q4', 'quarterly', 'annual revenue', 'net profit',
    'gross', 'outstanding', 'overdue', 'paid', 'unpaid', 'debt',
  ],
  fleet: [
    'vehicle', 'fleet', 'bus', 'truck', 'van', 'maintenance', 'fuel',
    'repair', 'service', 'idle', 'utilization', 'depreciation', 'insurance',
    'odometer', 'mileage', 'kilometer', 'breakdown', 'uptime',
  ],
  trips: [
    'trip', 'route', 'dispatch', 'journey', 'ride', 'booking', 'cancel',
    'complete', 'schedule', 'departure', 'arrival', 'stop', 'passenger',
    'booking rate', 'completion rate', 'trip volume',
  ],
  drivers: [
    'driver', 'staff', 'performance', 'rating', 'score', 'experience',
    'driver utilization', 'driver pay', 'driver trip', 'best driver',
    'worst driver', 'top driver', 'driver ranking',
  ],
  customers: [
    'customer', 'client', 'customer growth', 'customer revenue', 'top customer',
    'individual', 'business customer', 'new customer', 'churn',
  ],
  operations: [
    'operation', 'punctuality', 'efficiency', 'on-time', 'delay', 'route efficiency',
    'kpi', 'operational', 'throughput', 'performance metric',
  ],
  general: [],
};

// Domain → default suggested tools
const DOMAIN_TOOLS: Record<AnalyticsDomain, string[]> = {
  finance: ['aggregateMetric', 'timeSeriesMetric', 'computeKPI', 'statusDistribution', 'groupMetric'],
  fleet: ['rankEntities', 'aggregateMetric', 'groupMetric', 'computeKPI'],
  trips: ['aggregateMetric', 'timeSeriesMetric', 'statusDistribution', 'groupMetric', 'computeKPI'],
  drivers: ['rankEntities', 'aggregateMetric', 'groupMetric'],
  customers: ['rankEntities', 'aggregateMetric', 'groupMetric', 'statusDistribution'],
  operations: ['computeKPI', 'timeSeriesMetric', 'aggregateMetric', 'groupMetric'],
  general: ['aggregateMetric', 'computeKPI', 'timeSeriesMetric'],
};

export class DomainClassifier {
  /**
   * Classify the query into an analytics domain using keyword scoring.
   * No LLM cost for this step.
   */
  static classify(query: string): ClassificationResult {
    const q = query.toLowerCase();
    const scores: Record<AnalyticsDomain, number> = {
      finance: 0,
      fleet: 0,
      trips: 0,
      drivers: 0,
      customers: 0,
      operations: 0,
      general: 0,
    };

    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS) as [AnalyticsDomain, string[]][]) {
      for (const kw of keywords) {
        if (q.includes(kw)) {
          scores[domain] += kw.includes(' ') ? 2 : 1; // multi-word match scores higher
        }
      }
    }

    // Find winner
    let topDomain: AnalyticsDomain = 'general';
    let topScore = 0;
    for (const [domain, score] of Object.entries(scores) as [AnalyticsDomain, number][]) {
      if (score > topScore) {
        topScore = score;
        topDomain = domain;
      }
    }

    const confidence: ClassificationResult['confidence'] =
      topScore >= 3 ? 'high' : topScore >= 1 ? 'medium' : 'low';

    return {
      domain: topDomain,
      confidence,
      suggestedTools: DOMAIN_TOOLS[topDomain],
    };
  }
}
