import { Router } from 'express';
import { createExpense, deleteExpense, listExpenses } from '../controllers/expenseController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOwner } from '../middleware/roles.js';

const router = Router();

router.use(requireAuth, requireOwner);

router.get('/', listExpenses);
router.post('/', createExpense);
router.delete('/:id', deleteExpense);

export default router;
