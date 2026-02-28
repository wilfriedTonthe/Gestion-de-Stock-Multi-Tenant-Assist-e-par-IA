import api from './api';

export interface OrganizationStats {
  users: number;
  warehouses: number;
  products: number;
  stocks?: number;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  stats?: OrganizationStats;
}

export interface GlobalStats {
  stats: {
    organizations: number;
    users: number;
    warehouses: number;
    products: number;
    stocks: number;
  };
  recentOrganizations: Organization[];
}

export interface CreateOrganizationData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
}

export interface CreateAdminData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const organizationService = {
  getAll: async (): Promise<Organization[]> => {
    const response = await api.get('/organizations');
    return response.data;
  },

  getById: async (id: string): Promise<Organization> => {
    const response = await api.get(`/organizations/${id}`);
    return response.data;
  },

  getGlobalStats: async (): Promise<GlobalStats> => {
    const response = await api.get('/organizations/stats/global');
    return response.data;
  },

  create: async (data: CreateOrganizationData): Promise<Organization> => {
    const response = await api.post('/organizations', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Organization>): Promise<Organization> => {
    const response = await api.put(`/organizations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/organizations/${id}`);
  },

  getUsers: async (id: string) => {
    const response = await api.get(`/organizations/${id}/users`);
    return response.data;
  },

  getWarehouses: async (id: string) => {
    const response = await api.get(`/organizations/${id}/warehouses`);
    return response.data;
  },

  createAdmin: async (orgId: string, data: CreateAdminData) => {
    const response = await api.post(`/organizations/${orgId}/admin`, data);
    return response.data;
  },
};
