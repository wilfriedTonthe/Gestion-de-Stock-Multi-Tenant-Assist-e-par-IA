import { Router } from 'express';
import {
  getStocks,
  getStocksByWarehouse,
  getStockAlerts,
  getDashboardStats,
} from '../controllers/stock.controller.js';
import { authenticate, hasPermission } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Stocks accessibles selon le rôle (filtré dans le controller)
router.get('/', getStocks);
router.get('/warehouse/:id', getStocksByWarehouse);

// Alertes - manager reçoit les alertes de son entrepôt
router.get('/alerts', getStockAlerts);

// Dashboard - admin voit tout, manager voit son entrepôt
router.get('/dashboard', hasPermission('VIEW_WAREHOUSE_DASHBOARD'), getDashboardStats);

export default router;
