import { Router } from 'express';
import {
  login,
  me,
  createUser,
  listUsers,
  changeOwnPassword,
  resetUserPassword,
  setUserActive,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOwner } from '../middleware/roles.js';

const router = Router();

router.post('/login', login);
router.get('/me', requireAuth, me);
router.get('/users', requireAuth, requireOwner, listUsers);
router.post('/users', requireAuth, requireOwner, createUser);
router.patch('/me/password', requireAuth, changeOwnPassword);
router.patch('/users/:id/password', requireAuth, requireOwner, resetUserPassword);
router.patch('/users/:id/status', requireAuth, requireOwner, setUserActive);

export default router;