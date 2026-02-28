import { Router } from 'express';
import {
  getMovements,
  createEntry,
  createExit,
  createTransfer,
} from '../controllers/movement.controller.js';
import { authenticate, hasPermission } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Voir les mouvements (admin, manager, staff)
router.get('/', hasPermission('STOCK_MOVEMENTS'), getMovements);

// Créer des mouvements (admin, manager, staff)
router.post('/entry', hasPermission('STOCK_MOVEMENTS'), createEntry);
router.post('/exit', hasPermission('STOCK_MOVEMENTS'), createExit);
router.post('/transfer', hasPermission('STOCK_MOVEMENTS'), createTransfer);

export default router;
