import { useQuery } from '@tanstack/react-query';
import { Package, Warehouse, Boxes, AlertTriangle, TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { stockService } from '../services/stock.service';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: stockService.getDashboardStats,
  });

  const { data: alerts } = useQuery({
    queryKey: ['stock-alerts'],
    queryFn: stockService.getAlerts,
  });

  const { data: movements } = useQuery({
    queryKey: ['recent-movements'],
    queryFn: stockService.getMovements,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'entry': return 'Entrée';
      case 'exit': return 'Sortie';
      default: return 'Transfert';
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entry': return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case 'exit': return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <Boxes className="h-5 w-5 text-blue-500" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'entry': return 'text-emerald-600';
      case 'exit': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec gradient */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Bonjour, {user?.firstName} 👋
              </h1>
              <p className="text-purple-100">Voici un aperçu de votre inventaire</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Activity className="h-5 w-5" />
            <span className="font-medium">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Produits</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalProducts || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Références actives</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
              <Package className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Entrepôts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalWarehouses || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Sites de stockage</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30">
              <Warehouse className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Stock Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalStockItems || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Unités en stock</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/30">
              <Boxes className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Alertes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.lowStockAlerts || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Stock bas</p>
            </div>
            <div className={`p-4 rounded-2xl shadow-lg ${
              (stats?.lowStockAlerts || 0) > 0 
                ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30' 
                : 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-400/30'
            }`}>
              <AlertTriangle className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes Stock Bas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Alertes Stock Bas</h2>
                <p className="text-xs text-gray-500">{alerts?.length || 0} produits en alerte</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            {alerts && alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert._id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {alert.productId?.name || 'Produit inconnu'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {alert.warehouseId?.name || 'Entrepôt inconnu'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{alert.quantity}</p>
                      <p className="text-xs text-gray-500">unités</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-gray-500">Aucune alerte de stock</p>
                <p className="text-xs text-gray-400 mt-1">Tous vos produits sont bien approvisionnés</p>
              </div>
            )}
          </div>
        </div>

        {/* Mouvements Récents */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Mouvements Récents</h2>
                <p className="text-xs text-gray-500">Dernières opérations de stock</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            {movements && movements.length > 0 ? (
              <div className="space-y-3">
                {movements.slice(0, 5).map((movement) => (
                  <div
                    key={movement._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        movement.type === 'entry' ? 'bg-emerald-100' :
                        movement.type === 'exit' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {getMovementIcon(movement.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {movement.productId?.name || 'Produit'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getMovementTypeLabel(movement.type)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getMovementColor(movement.type)}`}>
                        {movement.type === 'entry' ? '+' : movement.type === 'exit' ? '-' : ''}
                        {movement.quantity}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(movement.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Boxes className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500">Aucun mouvement récent</p>
                <p className="text-xs text-gray-400 mt-1">Les mouvements de stock apparaîtront ici</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
