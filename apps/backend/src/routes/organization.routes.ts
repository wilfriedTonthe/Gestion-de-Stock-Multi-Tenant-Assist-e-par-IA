import { Router } from 'express';
import {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationUsers,
  getOrganizationWarehouses,
  createOrganizationAdmin,
  getGlobalStats,
} from '../controllers/organization.controller.js';
import { authenticate, hasPermission } from '../middlewares/auth.middleware.js';

const router = Router();

// Toutes les routes nécessitent l'authentification et la permission MANAGE_ORGANIZATIONS (superadmin)
router.use(authenticate);
router.use(hasPermission('MANAGE_ORGANIZATIONS'));

// Stats globales de la plateforme
router.get('/stats/global', getGlobalStats);

// CRUD organisations
router.get('/', getOrganizations);
router.get('/:id', getOrganization);
router.post('/', createOrganization);
router.put('/:id', updateOrganization);
router.delete('/:id', deleteOrganization);

// Sous-ressources d'une organisation
router.get('/:id/users', getOrganizationUsers);
router.get('/:id/warehouses', getOrganizationWarehouses);
router.post('/:id/admin', createOrganizationAdmin);

export default router;
