import { Router } from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUsersByWarehouse,
} from '../controllers/user.controller.js';
import { authenticate, hasPermission } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.get('/', hasPermission('MANAGE_USERS'), getUsers);
router.get('/:id', hasPermission('MANAGE_USERS'), getUser);
router.post('/', hasPermission('MANAGE_USERS'), createUser);
router.put('/:id', hasPermission('MANAGE_USERS'), updateUser);
router.delete('/:id', hasPermission('MANAGE_USERS'), deleteUser);

// Manager can see users in their warehouse
router.get('/warehouse/:warehouseId', hasPermission('VIEW_REPORTS'), getUsersByWarehouse);

export default router;
