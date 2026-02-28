import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Factory, Warehouse as WarehouseIcon, Store, MapPin, Mail, X, Search } from 'lucide-react';
import { stockService } from '../services/stock.service';
import type { Warehouse } from '../types';

const typeConfig = {
  factory: { icon: Factory, label: 'Usine', color: 'from-orange-500 to-amber-500', bg: 'bg-orange-100', text: 'text-orange-600' },
  warehouse: { icon: WarehouseIcon, label: 'Entrepôt', color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-100', text: 'text-blue-600' },
  store: { icon: Store, label: 'Boutique', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-100', text: 'text-emerald-600' },
};

export default function Warehouses() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: stockService.getWarehouses,
  });

  const createMutation = useMutation({
    mutationFn: stockService.createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Warehouse> }) =>
      stockService.updateWarehouse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setIsModalOpen(false);
      setEditingWarehouse(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: stockService.deleteWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });

  const filteredWarehouses = warehouses?.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: warehouses?.length || 0,
    factories: warehouses?.filter(w => w.type === 'factory').length || 0,
    warehouses: warehouses?.filter(w => w.type === 'warehouse').length || 0,
    stores: warehouses?.filter(w => w.type === 'store').length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <WarehouseIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Entrepôts</h1>
              <p className="text-emerald-100">Gérez vos sites de stockage</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingWarehouse(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Nouvel Entrepôt
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <WarehouseIcon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Factory className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.factories}</p>
              <p className="text-xs text-gray-500">Usines</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <WarehouseIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.warehouses}</p>
              <p className="text-xs text-gray-500">Entrepôts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Store className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.stores}</p>
              <p className="text-xs text-gray-500">Boutiques</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un entrepôt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWarehouses?.map((warehouse) => {
          const config = typeConfig[warehouse.type] || typeConfig.warehouse;
          const IconComponent = config.icon;
          
          return (
            <div key={warehouse._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${config.color} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{warehouse.name}</h3>
                      <p className="text-white/80 text-sm">{config.label}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                    <div className="text-sm">
                      <p>{warehouse.address}</p>
                      <p className="font-medium">{warehouse.city}, {warehouse.country}</p>
                    </div>
                  </div>
                  
                  {warehouse.managerEmail && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-emerald-600">{warehouse.managerEmail}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setEditingWarehouse(warehouse);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Supprimer cet entrepôt ?')) {
                        deleteMutation.mutate(warehouse._id);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWarehouses?.length === 0 && (
        <div className="text-center py-12">
          <WarehouseIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun entrepôt trouvé</p>
        </div>
      )}

      {isModalOpen && (
        <WarehouseModal
          warehouse={editingWarehouse}
          onClose={() => {
            setIsModalOpen(false);
            setEditingWarehouse(null);
          }}
          onSubmit={(data) => {
            if (editingWarehouse) {
              updateMutation.mutate({ id: editingWarehouse._id, data });
            } else {
              createMutation.mutate(data as Omit<Warehouse, '_id' | 'isActive'>);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

function WarehouseModal({
  warehouse,
  onClose,
  onSubmit,
  isLoading,
}: {
  warehouse: Warehouse | null;
  onClose: () => void;
  onSubmit: (data: Partial<Warehouse>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: warehouse?.name || '',
    type: warehouse?.type || 'warehouse',
    address: warehouse?.address || '',
    city: warehouse?.city || '',
    country: warehouse?.country || '',
    managerEmail: warehouse?.managerEmail || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <WarehouseIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">
                {warehouse ? 'Modifier l\'entrepôt' : 'Nouvel entrepôt'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="wh-name" className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              id="wh-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Entrepôt Central"
              required
            />
          </div>
          <div>
            <label htmlFor="wh-type" className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              id="wh-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Warehouse['type'] })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="factory">🏭 Usine</option>
              <option value="warehouse">📦 Entrepôt</option>
              <option value="store">🏪 Boutique</option>
            </select>
          </div>
          <div>
            <label htmlFor="wh-address" className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
            <input
              id="wh-address"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="123 Rue Example"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="wh-city" className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
              <input
                id="wh-city"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Paris"
                required
              />
            </div>
            <div>
              <label htmlFor="wh-country" className="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
              <input
                id="wh-country"
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="France"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="wh-email" className="block text-sm font-medium text-gray-700 mb-1">Email du gestionnaire</label>
            <input
              id="wh-email"
              type="email"
              value={formData.managerEmail}
              onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="manager@example.com"
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
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
