import { Router } from 'express';
import { AIAnalyticsController } from './AIAnalyticsController';

export class AIAnalyticsRoute {
  public router = Router();
  private controller: AIAnalyticsController;

  constructor() {
    this.controller = new AIAnalyticsController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/ai-analytics/query',            this.controller.query);
    this.router.get('/ai-analytics/sessions',          this.controller.listSessions);
    this.router.post('/ai-analytics/session',          this.controller.createSession);
    this.router.delete('/ai-analytics/session/:id',   this.controller.deleteSession);
    this.router.get('/ai-analytics/session/:id/history', this.controller.getHistory);
  }
}
