import { Router } from 'express';
import { login, me, createUser, listUsers } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOwner } from '../middleware/roles.js';

const router = Router();

router.post('/login', login);
router.get('/me', requireAuth, me);
router.get('/users', requireAuth, requireOwner, listUsers);
router.post('/users', requireAuth, requireOwner, createUser);

export default router;
