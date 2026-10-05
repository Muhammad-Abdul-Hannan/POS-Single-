import { Router } from 'express';
import {
    createSupplier,
    getLedger,
    listPayments,
    listSuppliers,
    recordPayment,
    updateSupplier,
} from '../controllers/supplierController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOwner } from '../middleware/roles.js';

const router = Router();

router.use(requireAuth, requireOwner);

router.get('/', listSuppliers);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);
router.post('/:id/payments', recordPayment);
router.get('/:id/payments', listPayments);
router.get('/:id/ledger', getLedger);

export default router;