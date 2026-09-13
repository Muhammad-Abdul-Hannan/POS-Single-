import { Router } from 'express';
import {
  adjustStock,
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from '../controllers/productController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOwner } from '../middleware/roles.js';

const router = Router();

router.use(requireAuth);

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', requireOwner, createProduct);
router.put('/:id', requireOwner, updateProduct);
router.patch('/:id/stock', requireOwner, adjustStock);
router.delete('/:id', requireOwner, deleteProduct);

export default router;
