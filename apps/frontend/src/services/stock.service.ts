import api from './api';
import type { Stock, StockMovement, DashboardStats, Warehouse, Product } from '../types';

export const stockService = {
  async getStocks(): Promise<Stock[]> {
    const response = await api.get<Stock[]>('/stocks');
    return response.data;
  },

  async getStocksByWarehouse(warehouseId: string): Promise<Stock[]> {
    const response = await api.get<Stock[]>(`/stocks/warehouse/${warehouseId}`);
    return response.data;
  },

  async getAlerts(): Promise<Stock[]> {
    const response = await api.get<Stock[]>('/stocks/alerts');
    return response.data;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/stocks/dashboard');
    return response.data;
  },

  async getMovements(): Promise<StockMovement[]> {
    const response = await api.get<StockMovement[]>('/movements');
    return response.data;
  },

  async createEntry(data: {
    productId: string;
    warehouseId: string;
    quantity: number;
    reason?: string;
    reference?: string;
  }): Promise<void> {
    await api.post('/movements/entry', data);
  },

  async createExit(data: {
    productId: string;
    warehouseId: string;
    quantity: number;
    reason?: string;
    reference?: string;
  }): Promise<void> {
    await api.post('/movements/exit', data);
  },

  async createTransfer(data: {
    productId: string;
    sourceWarehouseId: string;
    destinationWarehouseId: string;
    quantity: number;
    reason?: string;
    reference?: string;
  }): Promise<void> {
    await api.post('/movements/transfer', data);
  },

  async getWarehouses(): Promise<Warehouse[]> {
    const response = await api.get<Warehouse[]>('/warehouses');
    return response.data;
  },

  async createWarehouse(data: Omit<Warehouse, '_id' | 'isActive'>): Promise<Warehouse> {
    const response = await api.post<Warehouse>('/warehouses', data);
    return response.data;
  },

  async updateWarehouse(id: string, data: Partial<Warehouse>): Promise<Warehouse> {
    const response = await api.put<Warehouse>(`/warehouses/${id}`, data);
    return response.data;
  },

  async deleteWarehouse(id: string): Promise<void> {
    await api.delete(`/warehouses/${id}`);
  },

  async getProducts(): Promise<Product[]> {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },

  async createProduct(data: Omit<Product, '_id' | 'isActive'>): Promise<Product> {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
