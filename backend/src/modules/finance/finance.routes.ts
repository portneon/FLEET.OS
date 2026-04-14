import { Router } from 'express';
import { FinanceController } from './controllers/FinanceController';

const router = Router();
const financeController = new FinanceController();

router.get('/summary', financeController.getSummary);
router.post('/record', financeController.addTransaction);

export default router;
