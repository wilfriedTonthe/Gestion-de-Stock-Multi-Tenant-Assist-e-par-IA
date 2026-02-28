import api from './api';

export interface Warehouse {
  _id: string;
  name: string;
  type: 'factory' | 'warehouse' | 'store';
  address: string;
  city: string;
  country: string;
  managerEmail?: string;
  isActive: boolean;
  createdAt: string;
}

export const warehouseService = {
  getAll: async (): Promise<Warehouse[]> => {
    const response = await api.get('/warehouses');
    return response.data;
  },

  getById: async (id: string): Promise<Warehouse> => {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  },

  create: async (data: Partial<Warehouse>): Promise<Warehouse> => {
    const response = await api.post('/warehouses', data);
    return response.data.warehouse;
  },

  update: async (id: string, data: Partial<Warehouse>): Promise<Warehouse> => {
    const response = await api.put(`/warehouses/${id}`, data);
    return response.data.warehouse;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/warehouses/${id}`);
  },
};
