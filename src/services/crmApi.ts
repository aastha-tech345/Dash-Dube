import type {
  CrmSalesProductRequest, CrmSalesProductResponse,
  PaginatedResponse,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class CrmApiService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options?.headers as Record<string, string> | undefined),
      },
    };
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `API Error: ${response.status}`);
    }
    if (response.status === 204) return undefined as T;
    return response.json();
  }

  getSalesProducts(params?: { page?: number; size?: number }): Promise<PaginatedResponse<CrmSalesProductResponse>> {
    const p = new URLSearchParams({ page: String(params?.page ?? 0), size: String(params?.size ?? 10) });
    return this.request(`/api/crm/sales-products?${p}`);
  }

  getSalesProductById(id: number): Promise<CrmSalesProductResponse> {
    return this.request(`/api/crm/sales-products/${id}`);
  }

  createSalesProduct(data: CrmSalesProductRequest, image?: File): Promise<CrmSalesProductResponse> {
    if (image) {
      const token = localStorage.getItem('auth_token');
      const form = new FormData();
      form.append('product', JSON.stringify(data));
      form.append('image', image);
      return fetch(`${API_BASE_URL}/api/crm/sales-products`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      }).then(r => { if (!r.ok) return r.text().then(t => { throw new Error(t); }); return r.json(); });
    }
    return this.request('/api/crm/sales-products', { method: 'POST', body: JSON.stringify(data) });
  }

  updateSalesProduct(id: number, data: CrmSalesProductRequest, image?: File): Promise<CrmSalesProductResponse> {
    if (image) {
      const token = localStorage.getItem('auth_token');
      const form = new FormData();
      form.append('product', JSON.stringify(data));
      form.append('image', image);
      return fetch(`${API_BASE_URL}/api/crm/sales-products/${id}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      }).then(r => { if (!r.ok) return r.text().then(t => { throw new Error(t); }); return r.json(); });
    }
    return this.request(`/api/crm/sales-products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  deleteSalesProduct(id: number): Promise<void> {
    return this.request(`/api/crm/sales-products/${id}`, { method: 'DELETE' });
  }

  getProductImageUrl(id: number): string {
    return `${API_BASE_URL}/api/crm/sales-products/${id}/image`;
  }

  getProductBarcodeUrl(id: number): string {
    return `${API_BASE_URL}/api/crm/sales-products/${id}/barcode`;
  }
}

export const crmApi = new CrmApiService();
