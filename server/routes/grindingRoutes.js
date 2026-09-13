import { Router } from 'express';
import { createGrindingLog, listGrindingLogs } from '../controllers/grindingController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', listGrindingLogs);
router.post('/', createGrindingLog);

export default router;
