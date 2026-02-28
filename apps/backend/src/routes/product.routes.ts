import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { authenticate, hasPermission } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Tous les utilisateurs authentifiés peuvent voir les produits
router.get('/', getProducts);
router.get('/:id', getProduct);

// Seul l'admin peut créer/modifier/supprimer des produits
router.post('/', hasPermission('MANAGE_PRODUCTS'), createProduct);
router.put('/:id', hasPermission('MANAGE_PRODUCTS'), updateProduct);
router.delete('/:id', hasPermission('MANAGE_PRODUCTS'), deleteProduct);

export default router;
