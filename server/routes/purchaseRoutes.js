import { Router } from 'express';
import { createPurchase, listPurchases } from '../controllers/purchaseController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOwner } from '../middleware/roles.js';

const router = Router();

router.use(requireAuth, requireOwner);

router.get('/', listPurchases);
router.post('/', createPurchase);

export default router;
