import { Router } from 'express';
import { createSale, getSale, listSales } from '../controllers/saleController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', listSales);
router.get('/:id', getSale);
router.post('/', createSale);

export default router;
