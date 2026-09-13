import { Router } from 'express';
import {
  getDailySales,
  getDashboardSummary,
  getLowStock,
  getProfitLoss,
  getTopProducts,
} from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOwner } from '../middleware/roles.js';

const router = Router();

router.use(requireAuth, requireOwner);

router.get('/dashboard', getDashboardSummary);
router.get('/profit-loss', getProfitLoss);
router.get('/daily-sales', getDailySales);
router.get('/top-products', getTopProducts);
router.get('/low-stock', getLowStock);

export default router;
