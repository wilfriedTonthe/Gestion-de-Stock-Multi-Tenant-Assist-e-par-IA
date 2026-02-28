import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser, UserRole } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
  organizationId?: string;
  warehouseId?: string;
}

interface JwtPayload {
  userId: string;
  organizationId?: string;
  warehouseId?: string;
}

// Définition des permissions par rôle
export const PERMISSIONS: Record<string, UserRole[]> = {
  // Gestion des entreprises (Super Admin uniquement)
  MANAGE_ORGANIZATIONS: ['superadmin'],
  
  // Configuration entreprise (Admin uniquement)
  CONFIGURE_ORGANIZATION: ['admin'],
  
  // Gestion des entrepôts (Admin uniquement)
  MANAGE_WAREHOUSES: ['admin'],
  
  // Gestion des utilisateurs (Admin uniquement)
  MANAGE_USERS: ['admin'],
  
  // Gestion des produits (Admin uniquement)
  MANAGE_PRODUCTS: ['admin'],
  
  // Ajuster seuils d'alerte (Admin + Manager)
  ADJUST_THRESHOLDS: ['admin', 'manager'],
  
  // Mouvements de stock (tous sauf superadmin qui ne gère pas l'inventaire directement)
  STOCK_MOVEMENTS: ['superadmin', 'admin', 'manager', 'staff'],
  
  // Consulter rapports (Super Admin + Admin + Manager pour le sien)
  VIEW_REPORTS: ['superadmin', 'admin', 'manager'],
  
  // Voir le dashboard global (Super Admin + Admin)
  VIEW_GLOBAL_DASHBOARD: ['superadmin', 'admin'],
  
  // Voir le dashboard entrepôt (tous les rôles authentifiés)
  VIEW_WAREHOUSE_DASHBOARD: ['superadmin', 'admin', 'manager', 'staff'],
};

export type Permission = keyof typeof PERMISSIONS;

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Access token required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'default_secret';

    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.userId).populate('warehouseId');

    if (!user || !user.isActive) {
      res.status(401).json({ message: 'User not found or inactive' });
      return;
    }

    req.user = user;
    req.organizationId = decoded.organizationId;
    req.warehouseId = decoded.warehouseId;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Autorisation par rôles
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Not authorized for this action' });
      return;
    }

    next();
  };
};

// Autorisation par permission
export const hasPermission = (permission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({ message: `Permission denied: ${permission}` });
      return;
    }

    next();
  };
};

// Middleware pour restreindre l'accès à l'entrepôt assigné (pour manager et staff)
export const restrictToWarehouse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  // Super Admin et Admin ont accès à tout
  if (req.user.role === 'superadmin' || req.user.role === 'admin') {
    next();
    return;
  }

  // Manager et Staff doivent avoir un warehouseId assigné
  if (!req.user.warehouseId) {
    res.status(403).json({ message: 'No warehouse assigned to this user' });
    return;
  }

  // Ajouter le warehouseId à la requête pour filtrage
  req.warehouseId = req.user.warehouseId.toString();
  next();
};

// Vérifier si l'utilisateur peut accéder à un entrepôt spécifique
export const canAccessWarehouse = (warehouseId: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Super Admin et Admin ont accès à tout
    if (req.user.role === 'superadmin' || req.user.role === 'admin') {
      next();
      return;
    }

    // Manager et Staff ne peuvent accéder qu'à leur entrepôt
    if (req.user.warehouseId?.toString() !== warehouseId) {
      res.status(403).json({ message: 'Access denied to this warehouse' });
      return;
    }

    next();
  };
};
