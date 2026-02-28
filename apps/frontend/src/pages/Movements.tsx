import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, ArrowLeftRight, Activity, Package, Calendar, User, X } from 'lucide-react';
import { stockService } from '../services/stock.service';
import type { StockMovement, Warehouse, Product } from '../types';

export default function Movements() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'entry' | 'exit' | 'transfer'>('entry');
  const queryClient = useQueryClient();

  const { data: movements, isLoading } = useQuery({
    queryKey: ['movements'],
    queryFn: stockService.getMovements,
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: stockService.getWarehouses,
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: stockService.getProducts,
  });

  const entryMutation = useMutation({
    mutationFn: stockService.createEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      setIsModalOpen(false);
    },
  });

  const exitMutation = useMutation({
    mutationFn: stockService.createExit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      setIsModalOpen(false);
    },
  });

  const transferMutation = useMutation({
    mutationFn: stockService.createTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      setIsModalOpen(false);
    },
  });

  const stats = {
    entries: movements?.filter((m: StockMovement) => m.type === 'entry').length || 0,
    exits: movements?.filter((m: StockMovement) => m.type === 'exit').length || 0,
    transfers: movements?.filter((m: StockMovement) => m.type === 'transfer').length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mouvements de Stock</h1>
              <p className="text-cyan-100">Historique des entrées, sorties et transferts</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMovementType('entry');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all shadow-lg"
            >
              <TrendingUp className="h-5 w-5" />
              Entrée
            </button>
            <button
              onClick={() => {
                setMovementType('exit');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all shadow-lg"
            >
              <TrendingDown className="h-5 w-5" />
              Sortie
            </button>
            <button
              onClick={() => {
                setMovementType('transfer');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-cyan-600 rounded-xl font-semibold hover:bg-cyan-50 transition-all shadow-lg"
            >
              <ArrowLeftRight className="h-5 w-5" />
              Transfert
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.entries}</p>
              <p className="text-xs text-gray-500">Entrées</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.exits}</p>
              <p className="text-xs text-gray-500">Sorties</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ArrowLeftRight className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.transfers}</p>
              <p className="text-xs text-gray-500">Transferts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Produit</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Source</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Destination</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantité</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Par</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {movements?.map((movement: StockMovement) => {
              const typeConfig = {
                entry: { icon: TrendingUp, label: 'Entrée', color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
                exit: { icon: TrendingDown, label: 'Sortie', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
                transfer: { icon: ArrowLeftRight, label: 'Transfert', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
              };
              const config = typeConfig[movement.type] || typeConfig.transfer;
              const IconComponent = config.icon;

              return (
                <tr key={movement._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${config.bg} ${config.color} border ${config.border}`}>
                      <IconComponent className="h-4 w-4" />
                      {config.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Package className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">{movement.productId?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {movement.sourceWarehouseId?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {movement.destinationWarehouseId?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-lg font-bold ${config.color}`}>
                      {movement.type === 'entry' ? '+' : movement.type === 'exit' ? '-' : ''}
                      {movement.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{movement.performedBy?.firstName} {movement.performedBy?.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(movement.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!movements || movements.length === 0) && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun mouvement enregistré</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <MovementModal
          type={movementType}
          warehouses={warehouses || []}
          products={products || []}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(data) => {
            if (movementType === 'entry') {
              entryMutation.mutate(data);
            } else if (movementType === 'exit') {
              exitMutation.mutate(data);
            } else {
              transferMutation.mutate(data as Parameters<typeof stockService.createTransfer>[0]);
            }
          }}
          isLoading={entryMutation.isPending || exitMutation.isPending || transferMutation.isPending}
        />
      )}
    </div>
  );
}

function MovementModal({
  type,
  warehouses,
  products,
  onClose,
  onSubmit,
  isLoading,
}: {
  type: 'entry' | 'exit' | 'transfer';
  warehouses: Warehouse[];
  products: Product[];
  onClose: () => void;
  onSubmit: (data: {
    productId: string;
    warehouseId?: string;
    sourceWarehouseId?: string;
    destinationWarehouseId?: string;
    quantity: number;
    reason?: string;
    reference?: string;
  }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '',
    sourceWarehouseId: '',
    destinationWarehouseId: '',
    quantity: 1,
    reason: '',
    reference: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'transfer') {
      onSubmit({
        productId: formData.productId,
        sourceWarehouseId: formData.sourceWarehouseId,
        destinationWarehouseId: formData.destinationWarehouseId,
        quantity: formData.quantity,
        reason: formData.reason,
        reference: formData.reference,
      });
    } else {
      onSubmit({
        productId: formData.productId,
        warehouseId: formData.warehouseId,
        quantity: formData.quantity,
        reason: formData.reason,
        reference: formData.reference,
      });
    }
  };

  const typeConfig = {
    entry: { icon: TrendingUp, title: 'Nouvelle entrée de stock', color: 'from-emerald-600 to-green-600' },
    exit: { icon: TrendingDown, title: 'Nouvelle sortie de stock', color: 'from-red-600 to-rose-600' },
    transfer: { icon: ArrowLeftRight, title: 'Nouveau transfert', color: 'from-cyan-600 to-blue-600' },
  };
  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className={`bg-gradient-to-r ${config.color} p-5 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">{config.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Fermer"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="mv-product" className="block text-sm font-medium text-gray-700 mb-1">Produit *</label>
            <select
              id="mv-product"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner un produit</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </div>

          {type === 'transfer' ? (
            <>
              <div>
                <label htmlFor="mv-source" className="block text-sm font-medium text-gray-700 mb-1">Entrepôt source *</label>
                <select
                  id="mv-source"
                  value={formData.sourceWarehouseId}
                  onChange={(e) => setFormData({ ...formData, sourceWarehouseId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse._id} value={warehouse._id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="mv-dest" className="block text-sm font-medium text-gray-700 mb-1">Entrepôt destination *</label>
                <select
                  id="mv-dest"
                  value={formData.destinationWarehouseId}
                  onChange={(e) => setFormData({ ...formData, destinationWarehouseId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse._id} value={warehouse._id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="mv-warehouse" className="block text-sm font-medium text-gray-700 mb-1">Entrepôt *</label>
              <select
                id="mv-warehouse"
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionner un entrepôt</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="mv-qty" className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
            <input
              id="mv-qty"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              min="1"
              required
            />
          </div>

          <div>
            <label htmlFor="mv-reason" className="block text-sm font-medium text-gray-700 mb-1">Raison</label>
            <input
              id="mv-reason"
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Réapprovisionnement, vente, etc."
            />
          </div>

          <div>
            <label htmlFor="mv-ref" className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
            <input
              id="mv-ref"
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="N° de commande, bon de livraison..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-5 py-2.5 bg-gradient-to-r ${config.color} text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-all`}
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
