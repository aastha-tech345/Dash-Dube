import type { Product, StockTransaction, Warehouse, Zone } from '@/types/inventory';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://thegtrgroup.com/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}`);
    }

    return response.json();
  }

  // Products
  async getProducts(params?: { search?: string; category?: string }): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    
    return await this.request<Product[]>(`/warehouse/products?${queryParams}`);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    return await this.request<Product>('/warehouse/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return await this.request<Product>(`/warehouse/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  // Stock Transactions
  async getStockTransactions(params?: { type?: 'in' | 'out'; startDate?: string; endDate?: string }): Promise<StockTransaction[]> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    return await this.request<StockTransaction[]>(`/warehouse/stock-transactions?${queryParams}`);
  }

  async createStockTransaction(transaction: Omit<StockTransaction, 'id'>): Promise<StockTransaction> {
    return await this.request<StockTransaction>('/warehouse/stock-transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  // Warehouses
  async getWarehouses(): Promise<Warehouse[]> {
    return await this.request<Warehouse[]>('/warehouse/warehouses');
  }

  // Zones
  async getZones(warehouseCode?: string): Promise<Zone[]> {
    const query = warehouseCode ? `?warehouse=${warehouseCode}` : '';
    return await this.request<Zone[]>(`/warehouse/zones${query}`);
  }
}

export const apiService = new ApiService();
