import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Warehouse,
  Package,
  ArrowLeftRight,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  Boxes,
  Users,
  Shield,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { RolePermissions } from '../types';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  permission?: keyof RolePermissions;
  roles?: string[];
}

// Navigation pour les utilisateurs normaux (pas superadmin)
const regularNavItems: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/warehouses', icon: Warehouse, label: 'Entrepôts' },
  { to: '/products', icon: Package, label: 'Produits', permission: 'canManageProducts' },
  { to: '/inventory', icon: Boxes, label: 'Inventaire' },
  { to: '/movements', icon: ArrowLeftRight, label: 'Mouvements', permission: 'canDoStockMovements' },
  { to: '/alerts', icon: AlertTriangle, label: 'Alertes', roles: ['admin', 'manager'] },
  { to: '/users', icon: Users, label: 'Utilisateurs', permission: 'canManageUsers' },
];

// Navigation pour le superadmin
const superAdminNavItems: NavItem[] = [
  { to: '/admin', icon: Shield, label: 'Tableau de bord' },
];

// Labels des rôles en français
const roleLabels: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  staff: 'Magasinier',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, hasPermission, hasRole } = useAuth();
  const navigate = useNavigate();

  // Filtrer les items de navigation selon le rôle
  const navItems = useMemo(() => {
    // Le superadmin a son propre menu
    if (user?.role === 'superadmin') {
      return superAdminNavItems;
    }
    
    // Pour les autres utilisateurs, filtrer selon les permissions
    return regularNavItems.filter((item) => {
      // Si pas de restriction, afficher
      if (!item.permission && !item.roles) return true;
      
      // Vérifier la permission
      if (item.permission && hasPermission(item.permission)) return true;
      
      // Vérifier les rôles
      if (item.roles && user && item.roles.includes(user.role)) return true;
      
      return false;
    });
  }, [hasPermission, hasRole, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Boxes className="h-8 w-8 text-primary-600" />
            <span className="font-bold text-xl text-gray-900">StockManager</span>
          </div>
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-medium">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-primary-600 font-medium">
                {user?.role && roleLabels[user.role]}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8">
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Gestion de Stock Multi-Tenant
          </h1>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
