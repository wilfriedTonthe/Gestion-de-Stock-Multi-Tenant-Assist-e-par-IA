import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Package, Warehouse, CheckCircle, TrendingDown } from 'lucide-react';
import { stockService } from '../services/stock.service';
import type { Stock } from '../types';

export default function Alerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['stock-alerts'],
    queryFn: stockService.getAlerts,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  const criticalAlerts = alerts?.filter((a: Stock) => a.quantity < (a.productId?.minThreshold || 10) * 0.5) || [];
  const warningAlerts = alerts?.filter((a: Stock) => a.quantity >= (a.productId?.minThreshold || 10) * 0.5) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 text-white shadow-lg ${
        alerts && alerts.length > 0 
          ? 'bg-gradient-to-r from-red-600 to-orange-600' 
          : 'bg-gradient-to-r from-green-600 to-emerald-600'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              {alerts && alerts.length > 0 ? (
                <AlertTriangle className="h-8 w-8" />
              ) : (
                <CheckCircle className="h-8 w-8" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Alertes Stock Bas</h1>
              <p className={alerts && alerts.length > 0 ? 'text-red-100' : 'text-green-100'}>
                {alerts && alerts.length > 0 
                  ? `${alerts.length} produit(s) en dessous du seuil minimum`
                  : 'Tous vos stocks sont au-dessus du seuil minimum'
                }
              </p>
            </div>
          </div>
          {alerts && alerts.length > 0 && (
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-white/20 rounded-xl">
                <p className="text-3xl font-bold">{criticalAlerts.length}</p>
                <p className="text-xs text-red-100">Critiques</p>
              </div>
              <div className="text-center px-4 py-2 bg-white/20 rounded-xl">
                <p className="text-3xl font-bold">{warningAlerts.length}</p>
                <p className="text-xs text-orange-100">Avertissements</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {alerts && alerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert: Stock) => {
            const threshold = alert.productId?.minThreshold || 10;
            const percentage = Math.min((alert.quantity / threshold) * 100, 100);
            const isCritical = alert.quantity < threshold * 0.5;
            
            return (
              <div
                key={alert._id}
                className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-lg ${
                  isCritical ? 'border-red-200' : 'border-orange-200'
                }`}
              >
                {/* Card Header */}
                <div className={`p-4 ${isCritical ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-orange-500 to-amber-500'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">
                        {alert.productId?.name || 'Produit inconnu'}
                      </h3>
                      <p className="text-white/80 text-sm font-mono">
                        {alert.productId?.sku || 'N/A'}
                      </p>
                    </div>
                    {isCritical && (
                      <span className="px-2 py-1 bg-white/20 rounded-lg text-xs font-medium text-white">
                        CRITIQUE
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Warehouse className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{alert.warehouseId?.name || 'Entrepôt inconnu'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{alert.productId?.category || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Stock actuel</p>
                        <p className={`text-3xl font-bold ${isCritical ? 'text-red-600' : 'text-orange-600'}`}>
                          {alert.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Seuil minimum</p>
                        <p className="text-xl font-bold text-gray-400">{threshold}</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isCritical 
                              ? 'bg-gradient-to-r from-red-500 to-red-600' 
                              : 'bg-gradient-to-r from-orange-500 to-amber-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-400">0</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6 shadow-lg shadow-green-500/30">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Aucune alerte</h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Tous vos produits sont au-dessus du seuil minimum de stock. Continuez ainsi !
          </p>
        </div>
      )}
    </div>
  );
}
