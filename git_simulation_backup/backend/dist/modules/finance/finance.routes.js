"use strict";
// src/modules/finance/finance.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceRoute = void 0;
const express_1 = require("express");
class FinanceRoute {
    financeController;
    path = '/finance';
    router = (0, express_1.Router)();
    constructor(financeController) {
        this.financeController = financeController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/summary', this.financeController.getSummary);
        this.router.post('/record', this.financeController.addTransaction);
    }
}
exports.FinanceRoute = FinanceRoute;
