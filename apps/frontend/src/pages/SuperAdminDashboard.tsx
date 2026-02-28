import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Users,
  Warehouse,
  Package,
  Plus,
  Eye,
  Trash2,
  UserPlus,
  X,
  CheckCircle,
  XCircle,
  TrendingUp,
  Globe,
  Shield,
  Lock,
  Unlock,
  Search,
  BarChart3,
  Activity,
} from 'lucide-react';
import { organizationService, Organization, CreateOrganizationData, CreateAdminData } from '../services/organization.service';

export default function SuperAdminDashboard() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreateOrganizationData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    adminEmail: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: '',
  });
  const [adminFormData, setAdminFormData] = useState<CreateAdminData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationService.getAll,
  });

  const { data: globalStats } = useQuery({
    queryKey: ['globalStats'],
    queryFn: organizationService.getGlobalStats,
  });

  const { data: orgDetails } = useQuery({
    queryKey: ['organization', selectedOrg?._id],
    queryFn: () => organizationService.getById(selectedOrg!._id),
    enabled: !!selectedOrg && showDetailsModal,
  });

  const createMutation = useMutation({
    mutationFn: organizationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['globalStats'] });
      setShowCreateModal(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: organizationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['globalStats'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      organizationService.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: CreateAdminData }) =>
      organizationService.createAdmin(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', selectedOrg?._id] });
      setShowAddAdminModal(false);
      setAdminFormData({ email: '', password: '', firstName: '', lastName: '' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      adminEmail: '',
      adminPassword: '',
      adminFirstName: '',
      adminLastName: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrg) {
      createAdminMutation.mutate({ orgId: selectedOrg._id, data: adminFormData });
    }
  };

  const handleDelete = (org: Organization) => {
    if (confirm(`⚠️ ATTENTION: Supprimer définitivement "${org.name}" et TOUTES ses données (utilisateurs, entrepôts, produits, stocks) ?`)) {
      deleteMutation.mutate(org._id);
    }
  };

  const handleToggleStatus = (org: Organization) => {
    const action = org.isActive ? 'bloquer' : 'débloquer';
    if (confirm(`${org.isActive ? '🔒' : '🔓'} Voulez-vous ${action} l'entreprise "${org.name}" ?`)) {
      toggleStatusMutation.mutate({ id: org._id, isActive: !org.isActive });
    }
  };

  const openDetails = (org: Organization) => {
    setSelectedOrg(org);
    setShowDetailsModal(true);
  };

  const filteredOrganizations = organizations?.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeOrgs = organizations?.filter(o => o.isActive).length || 0;
  const blockedOrgs = organizations?.filter(o => !o.isActive).length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-white text-lg">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Shield className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Super Admin</h1>
                <p className="text-purple-100">Gestion de la plateforme Inventory Manager</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              Nouvelle Entreprise
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Entreprises</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{globalStats?.stats.organizations || 0}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">{activeOrgs} actives</span>
                  {blockedOrgs > 0 && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">{blockedOrgs} bloquées</span>
                  )}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Utilisateurs</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{globalStats?.stats.users || 0}</p>
                <p className="text-xs text-gray-400 mt-2">Sur toutes les entreprises</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Entrepôts</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{globalStats?.stats.warehouses || 0}</p>
                <p className="text-xs text-gray-400 mt-2">Total plateforme</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl">
                <Warehouse className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Produits</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{globalStats?.stats.products || 0}</p>
                <p className="text-xs text-gray-400 mt-2">Références uniques</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl">
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Stocks</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{globalStats?.stats.stocks || 0}</p>
                <p className="text-xs text-gray-400 mt-2">Entrées de stock</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Globe className="h-4 w-4" />
              <span>{filteredOrganizations?.length || 0} entreprises</span>
            </div>
          </div>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredOrganizations?.map((org) => (
            <div
              key={org._id}
              className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transform hover:scale-[1.02] transition-all ${
                org.isActive ? 'border-gray-100 hover:border-purple-200' : 'border-red-200 bg-red-50/30'
              }`}
            >
              {/* Card Header */}
              <div className={`p-4 ${org.isActive ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{org.name}</h3>
                      <p className="text-white/80 text-sm">{org.slug}</p>
                    </div>
                  </div>
                  {!org.isActive && (
                    <div className="px-3 py-1 bg-white/20 rounded-full">
                      <span className="text-white text-xs font-medium flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Bloquée
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-sm">{org.email}</span>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-600">
                        <Users className="h-4 w-4" />
                        <span className="font-bold">{org.stats?.users || 0}</span>
                      </div>
                      <p className="text-xs text-gray-500">Utilisateurs</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-purple-600">
                        <Warehouse className="h-4 w-4" />
                        <span className="font-bold">{org.stats?.warehouses || 0}</span>
                      </div>
                      <p className="text-xs text-gray-500">Entrepôts</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-orange-600">
                        <Package className="h-4 w-4" />
                        <span className="font-bold">{org.stats?.products || 0}</span>
                      </div>
                      <p className="text-xs text-gray-500">Produits</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openDetails(org)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Voir détails"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrg(org);
                          setShowAddAdminModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ajouter admin"
                      >
                        <UserPlus className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(org)}
                        className={`p-2 rounded-lg transition-colors ${
                          org.isActive
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={org.isActive ? 'Bloquer' : 'Débloquer'}
                      >
                        {org.isActive ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(org)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrganizations?.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">Aucune entreprise trouvée</h3>
            <p className="text-gray-400 mt-2">
              {searchTerm ? 'Modifiez votre recherche' : 'Créez votre première entreprise'}
            </p>
          </div>
        )}
      </div>

      {/* Modal Création Organisation */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Nouvelle Entreprise</h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  Informations Entreprise
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="TechStore SARL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email entreprise *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="contact@techstore.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="123 Rue Example, Paris"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-purple-600" />
                  Administrateur de l'entreprise
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={formData.adminFirstName}
                      onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      required
                      value={formData.adminLastName}
                      onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Dupont"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email admin *</label>
                    <input
                      type="email"
                      required
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="admin@techstore.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
                    <input
                      type="password"
                      required
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg"
                >
                  {createMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Création...
                    </span>
                  ) : (
                    "Créer l'entreprise"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détails Organisation */}
      {showDetailsModal && selectedOrg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className={`sticky top-0 p-6 rounded-t-3xl ${
              selectedOrg.isActive
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedOrg.name}</h2>
                    <p className="text-white/80">{selectedOrg.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!selectedOrg.isActive && (
                    <span className="px-4 py-2 bg-white/20 rounded-xl text-white font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Entreprise Bloquée
                    </span>
                  )}
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Stats */}
              {orgDetails?.stats && (
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-blue-700">{orgDetails.stats.users}</p>
                    <p className="text-sm text-blue-600">Utilisateurs</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl text-center">
                    <Warehouse className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-purple-700">{orgDetails.stats.warehouses}</p>
                    <p className="text-sm text-purple-600">Entrepôts</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-2xl text-center">
                    <Package className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-orange-700">{orgDetails.stats.products}</p>
                    <p className="text-sm text-orange-600">Produits</p>
                  </div>
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-2xl text-center">
                    <Activity className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-teal-700">{orgDetails.stats.stocks}</p>
                    <p className="text-sm text-teal-600">Stocks</p>
                  </div>
                </div>
              )}

              {/* Utilisateurs */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Utilisateurs ({orgDetails?.users?.length || 0})
                </h3>
                <div className="bg-gray-50 rounded-2xl overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nom</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rôle</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Entrepôt</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orgDetails?.users?.map((user: any) => (
                        <tr key={user._id} className="border-t border-gray-200 hover:bg-gray-100">
                          <td className="px-4 py-3">
                            <span className="font-medium">{user.firstName} {user.lastName}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              user.role === 'admin' ? 'bg-red-100 text-red-700' :
                              user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {user.warehouseId?.name || '-'}
                          </td>
                          <td className="px-4 py-3">
                            {user.isActive ? (
                              <span className="flex items-center gap-1 text-green-600 text-sm">
                                <CheckCircle className="h-4 w-4" /> Actif
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-600 text-sm">
                                <XCircle className="h-4 w-4" /> Inactif
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Entrepôts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Warehouse className="h-5 w-5 text-purple-600" />
                  Entrepôts ({orgDetails?.warehouses?.length || 0})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {orgDetails?.warehouses?.map((wh: any) => (
                    <div key={wh._id} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-2xl border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-xl">
                          <Warehouse className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{wh.name}</p>
                          <p className="text-sm text-gray-500">{wh.city}, {wh.country}</p>
                          <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                            wh.type === 'factory' ? 'bg-orange-100 text-orange-700' :
                            wh.type === 'warehouse' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {wh.type === 'factory' ? 'Usine' : wh.type === 'warehouse' ? 'Entrepôt' : 'Boutique'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter Admin */}
      {showAddAdminModal && selectedOrg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <UserPlus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Ajouter un Admin</h2>
                    <p className="text-white/80 text-sm">{selectedOrg.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddAdminModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>
            <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={adminFormData.firstName}
                    onChange={(e) => setAdminFormData({ ...adminFormData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                  <input
                    type="text"
                    required
                    value={adminFormData.lastName}
                    onChange={(e) => setAdminFormData({ ...adminFormData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
                <input
                  type="password"
                  required
                  value={adminFormData.password}
                  onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createAdminMutation.isPending}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg"
                >
                  {createAdminMutation.isPending ? 'Création...' : "Créer l'admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
