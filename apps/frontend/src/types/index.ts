export type UserRole = 'superadmin' | 'admin' | 'manager' | 'staff';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  warehouseId?: Warehouse;
  organizationId?: string;
  isActive: boolean;
}

// Permissions par rôle
export const ROLE_PERMISSIONS = {
  superadmin: {
    canManageOrganizations: true,
    canConfigureOrganization: false,
    canManageWarehouses: false,
    canManageUsers: false,
    canManageProducts: false,
    canAdjustThresholds: false,
    canDoStockMovements: false,
    canViewReports: true,
    canViewGlobalDashboard: true,
  },
  admin: {
    canManageOrganizations: false,
    canConfigureOrganization: true,
    canManageWarehouses: true,
    canManageUsers: true,
    canManageProducts: true,
    canAdjustThresholds: true,
    canDoStockMovements: true,
    canViewReports: true,
    canViewGlobalDashboard: true,
  },
  manager: {
    canManageOrganizations: false,
    canConfigureOrganization: false,
    canManageWarehouses: false,
    canManageUsers: false,
    canManageProducts: false,
    canAdjustThresholds: true,
    canDoStockMovements: true,
    canViewReports: true,
    canViewGlobalDashboard: false,
  },
  staff: {
    canManageOrganizations: false,
    canConfigureOrganization: false,
    canManageWarehouses: false,
    canManageUsers: false,
    canManageProducts: false,
    canAdjustThresholds: false,
    canDoStockMovements: true,
    canViewReports: false,
    canViewGlobalDashboard: false,
  },
} as const;

export type RolePermissions = typeof ROLE_PERMISSIONS[UserRole];

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface Warehouse {
  _id: string;
  name: string;
  type: 'factory' | 'warehouse' | 'store';
  address: string;
  city: string;
  country: string;
  managerEmail?: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  minThreshold: number;
  price?: number;
  isActive: boolean;
}

export interface Stock {
  _id: string;
  productId: Product;
  warehouseId: Warehouse;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastUpdated: string;
}

export interface StockMovement {
  _id: string;
  productId: Product;
  sourceWarehouseId?: Warehouse;
  destinationWarehouseId?: Warehouse;
  type: 'entry' | 'exit' | 'transfer';
  quantity: number;
  reason?: string;
  reference?: string;
  performedBy: { firstName: string; lastName: string };
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalWarehouses: number;
  totalStockItems: number;
  lowStockAlerts: number;
}

export interface AuthResponse {
  token: string;
  user: User;
  organization?: Organization;
}
