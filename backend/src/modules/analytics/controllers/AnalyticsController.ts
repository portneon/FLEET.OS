import { Request, Response } from 'express';
import { IAnalyticsService, AnalyticsPeriod } from '../interfaces/IAnalyticsService';

export class AnalyticsController {
  constructor(private analyticsService: IAnalyticsService) {}

  public getReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const orgId = req.headers['x-organization-id'] as string;
      if (!orgId) {
        res.status(400).json({ error: 'Organization ID is required' });
        return;
      }

      const period = (req.query.period as AnalyticsPeriod) || 'weekly';
      const customStart = req.query.customStart as string;
      const customEnd = req.query.customEnd as string;

      const report = await this.analyticsService.getReport(orgId, period, customStart, customEnd);
      res.status(200).json({
          data: report,
          message: 'Analytics report generated successfully'
      });
    } catch (error) {
       console.error('Analytics Report Error:', error);
       res.status(500).json({ error: 'Failed to generate analytics report' });
    }
  };
}
