import { Router } from 'express';
import { createSupplier, listSuppliers, updateSupplier } from '../controllers/supplierController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOwner } from '../middleware/roles.js';

const router = Router();

router.use(requireAuth, requireOwner);

router.get('/', listSuppliers);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);

export default router;
