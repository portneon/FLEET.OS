import { Router } from 'express';
import { AnalyticsController } from './controllers/AnalyticsController';

export class AnalyticsRoute {
    public router = Router();

    constructor(private analyticsController: AnalyticsController) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/analytics/report', this.analyticsController.getReport);
    }
}
