import { Router } from 'express';
import {
  createCustomer,
  getLedger,
  listCustomers,
  listPayments,
  recordPayment,
  updateCustomer,
} from '../controllers/customerController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', listCustomers);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.post('/:id/payments', recordPayment);
router.get('/:id/payments', listPayments);
router.get('/:id/ledger', getLedger);

export default router;
