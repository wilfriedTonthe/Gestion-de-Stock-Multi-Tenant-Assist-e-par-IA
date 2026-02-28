import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Boxes, Package, Warehouse, AlertTriangle, CheckCircle } from 'lucide-react';
import { stockService } from '../services/stock.service';
import type { Stock } from '../types';

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');

  const { data: stocks, isLoading } = useQuery({
    queryKey: ['stocks'],
    queryFn: stockService.getStocks,
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: stockService.getWarehouses,
  });

  const filteredStocks = stocks?.filter((stock: Stock) => {
    const matchesSearch =
      stock.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.productId?.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse =
      !selectedWarehouse || stock.warehouseId?._id === selectedWarehouse;
    return matchesSearch && matchesWarehouse;
  });

  const totalQuantity = stocks?.reduce((sum: number, s: Stock) => sum + s.quantity, 0) || 0;
  const lowStockCount = stocks?.filter((s: Stock) => s.quantity < (s.productId?.minThreshold || 10)).length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Boxes className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Inventaire</h1>
            <p className="text-purple-100">Vue d'ensemble des stocks par entrepôt</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Boxes className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stocks?.length || 0}</p>
              <p className="text-xs text-gray-500">Lignes de stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalQuantity}</p>
              <p className="text-xs text-gray-500">Unités totales</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Warehouse className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{warehouses?.length || 0}</p>
              <p className="text-xs text-gray-500">Entrepôts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${lowStockCount > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              {lowStockCount > 0 ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
              <p className="text-xs text-gray-500">Stocks bas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
            />
          </div>
          <div className="relative">
            <Warehouse className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="pl-12 pr-8 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 min-w-[200px] appearance-none"
              aria-label="Filtrer par entrepôt"
            >
              <option value="">Tous les entrepôts</option>
              {warehouses?.map((warehouse) => (
                <option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Produit</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Entrepôt</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantité</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Réservé</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Disponible</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStocks?.map((stock: Stock) => {
              const isLow = stock.quantity < (stock.productId?.minThreshold || 10);
              const available = stock.quantity - stock.reservedQuantity;
              return (
                <tr key={stock._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">{stock.productId?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-3 py-1 rounded-lg border border-purple-100">
                      {stock.productId?.sku || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-gray-600">
                      <Warehouse className="h-4 w-4 text-gray-400" />
                      {stock.warehouseId?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-lg font-bold text-gray-900">{stock.quantity}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">{stock.reservedQuantity}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-lg font-bold text-purple-600">{available}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                        isLow
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-green-100 text-green-700 border border-green-200'
                      }`}
                    >
                      {isLow ? (
                        <>
                          <AlertTriangle className="h-3 w-3" /> Stock bas
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3" /> OK
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!filteredStocks || filteredStocks.length === 0) && (
          <div className="text-center py-12">
            <Boxes className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun stock trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
