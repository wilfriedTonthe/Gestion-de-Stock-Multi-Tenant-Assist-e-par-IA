import { Router } from 'express';
import {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from '../controllers/warehouse.controller.js';
import { authenticate, hasPermission } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Tous les utilisateurs authentifiés peuvent voir les entrepôts
router.get('/', getWarehouses);
router.get('/:id', getWarehouse);

// Seul l'admin peut créer/modifier/supprimer des entrepôts
router.post('/', hasPermission('MANAGE_WAREHOUSES'), createWarehouse);
router.put('/:id', hasPermission('MANAGE_WAREHOUSES'), updateWarehouse);
router.delete('/:id', hasPermission('MANAGE_WAREHOUSES'), deleteWarehouse);

export default router;
