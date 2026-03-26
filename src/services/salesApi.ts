import type {
  DeliveryOrderRequest, DeliveryOrderResponse,
  DeliveryOrderStatus, PODRequest, PODResponse,
  QuotationRequest, QuotationResponse, QuotationStatus,
  SalesOrderResponse,
  SalesInvoiceRequest, SalesInvoiceResponse,
  PaginatedResponse,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class SalesApiService {
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

    // Backend bug: returns 405 but still processes the request (POST/PATCH/PUT)
    if (response.status === 405 && ['POST', 'PATCH', 'PUT'].includes(options?.method ?? '')) {
      const text = await response.text();
      if (!text) return undefined as T;
      try { return JSON.parse(text) as T; } catch { return undefined as T; }
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `API Error: ${response.status}`);
    }
    if (response.status === 204) return undefined as T;
    return response.json();
  }

  // Delivery Orders
  getDeliveryOrders(params?: {
    page?: number; size?: number; search?: string;
    fromDate?: string; toDate?: string;
  }): Promise<PaginatedResponse<DeliveryOrderResponse>> {
    const p = new URLSearchParams({ page: String(params?.page ?? 0), size: String(params?.size ?? 10) });
    if (params?.search) p.append('search', params.search);
    if (params?.fromDate) p.append('fromDate', params.fromDate);
    if (params?.toDate) p.append('toDate', params.toDate);
    return this.request(`/api/sales/delivery-orders?${p}`);
  }

  getDeliveryOrderById(id: number): Promise<DeliveryOrderResponse> {
    return this.request(`/api/sales/delivery-orders/${id}`);
  }

  createDeliveryOrder(data: DeliveryOrderRequest, attachments?: File[]): Promise<DeliveryOrderResponse> {
    const token = localStorage.getItem('auth_token');
    const form = new FormData();
    form.append('data', JSON.stringify(data));
    attachments?.forEach(f => form.append('attachments', f));
    return fetch(`${API_BASE_URL}/api/sales/delivery-orders`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(async r => {
      if (r.status === 405) {
        const text = await r.text();
        if (!text) return undefined as unknown as DeliveryOrderResponse;
        try { return JSON.parse(text) as DeliveryOrderResponse; } catch { return undefined as unknown as DeliveryOrderResponse; }
      }
      if (!r.ok) return r.text().then(t => { throw new Error(t || `Error ${r.status}`); });
      return r.json();
    });
  }

  deleteDeliveryOrder(id: number): Promise<void> {
    return this.request(`/api/sales/delivery-orders/${id}`, { method: 'DELETE' });
  }

  updateDeliveryOrder(id: number, data: DeliveryOrderRequest, attachments?: File[]): Promise<DeliveryOrderResponse> {
    const token = localStorage.getItem('auth_token');
    const form = new FormData();
    form.append('data', JSON.stringify(data));
    attachments?.forEach(f => form.append('attachments', f));
    return fetch(`${API_BASE_URL}/api/sales/delivery-orders/${id}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(r => { if (!r.ok) return r.text().then(t => { throw new Error(t); }); return r.json(); });
  }

  updateStatus(id: number, status: DeliveryOrderStatus): Promise<DeliveryOrderResponse> {
    return this.request(`/api/sales/delivery-orders/${id}/status?status=${status}`, { method: 'PATCH' });
  }

  assignFleet(id: number, driverId: number, vehicleId: number): Promise<DeliveryOrderResponse> {
    return this.request(`/api/sales/delivery-orders/${id}/assign-fleet?driverId=${driverId}&vehicleId=${vehicleId}`, { method: 'PUT' });
  }

  startPicking(id: number): Promise<DeliveryOrderResponse> {
    return this.request(`/api/sales/delivery-orders/${id}/start-picking`, { method: 'PUT' });
  }

  confirmPacked(id: number): Promise<DeliveryOrderResponse> {
    return this.request(`/api/sales/delivery-orders/${id}/confirm-packed`, { method: 'PUT' });
  }

  dispatch(id: number): Promise<DeliveryOrderResponse> {
    return this.request(`/api/sales/delivery-orders/${id}/dispatch`, { method: 'PUT' });
  }

  markDelivered(id: number): Promise<DeliveryOrderResponse> {
    return this.request(`/api/sales/delivery-orders/${id}/mark-delivered`, { method: 'PUT' });
  }

  // POD
  submitPOD(doId: number, data: PODRequest, signature?: File, photo?: File): Promise<PODResponse> {
    const token = localStorage.getItem('auth_token');
    const form = new FormData();
    form.append('data', JSON.stringify(data));
    if (signature) form.append('signature', signature);
    if (photo) form.append('photo', photo);
    return fetch(`${API_BASE_URL}/api/sales/delivery-orders/${doId}/pod`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(r => { if (!r.ok) return r.text().then(t => { throw new Error(t); }); return r.json(); });
  }

  getPOD(doId: number): Promise<PODResponse> {
    return this.request(`/api/sales/delivery-orders/${doId}/pod`);
  }

  // ── Quotations ──────────────────────────────────────────────────────────────
  getQuotations(params?: { page?: number; size?: number }): Promise<PaginatedResponse<QuotationResponse>> {
    const p = new URLSearchParams({ page: String(params?.page ?? 0), size: String(params?.size ?? 10) });
    return this.request<PaginatedResponse<QuotationResponse>>(`/api/sales/quotations?${p}`).then(data => {
      console.log('GET /api/sales/quotations raw:', data);
      return data;
    });
  }

  getQuotationById(id: number): Promise<QuotationResponse> {
    return this.request(`/api/sales/quotations/${id}`);
  }

  createQuotation(data: QuotationRequest, attachments?: File[]): Promise<QuotationResponse> {
    const token = localStorage.getItem('auth_token');
    const form = new FormData();
    form.append('quotation', JSON.stringify(data));
    attachments?.forEach(f => form.append('attachments', f));
    return fetch(`${API_BASE_URL}/api/sales/quotations`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(async r => {
      // 405 workaround: backend processes but returns wrong status
      if (r.status === 405) {
        const text = await r.text();
        if (!text) return undefined as unknown as QuotationResponse;
        try { return JSON.parse(text) as QuotationResponse; } catch { return undefined as unknown as QuotationResponse; }
      }
      if (!r.ok) return r.text().then(t => { throw new Error(t || `API Error: ${r.status}`); });
      return r.json();
    });
  }

  updateQuotationStatus(id: number, status: QuotationStatus): Promise<QuotationResponse> {
    return this.request(`/api/sales/quotations/${id}/status?status=${status}`, { method: 'PATCH' });
  }

  deleteQuotation(id: number): Promise<void> {
    return this.request(`/api/sales/quotations/${id}`, { method: 'DELETE' });
  }

  // ── Sales Orders ────────────────────────────────────────────────────────────
  getSalesOrders(params?: { page?: number; size?: number }): Promise<PaginatedResponse<SalesOrderResponse>> {
    const p = new URLSearchParams({ page: String(params?.page ?? 0), size: String(params?.size ?? 10) });
    return this.request(`/api/sales/orders?${p}`);
  }

  getSalesOrderById(id: number): Promise<SalesOrderResponse> {
    return this.request(`/api/sales/orders/${id}`);
  }

  createSalesOrderFromQuotation(quotationId: number): Promise<SalesOrderResponse> {
    return this.request(`/api/sales/orders/from-quotation/${quotationId}`, { method: 'POST' });
  }

  // ── Sales Invoices ──────────────────────────────────────────────────────────
  getSalesInvoices(params?: { page?: number; size?: number }): Promise<PaginatedResponse<SalesInvoiceResponse>> {
    const p = new URLSearchParams({ page: String(params?.page ?? 0), size: String(params?.size ?? 10) });
    return this.request(`/api/sales/sales-invoices?${p}`);
  }

  getSalesInvoiceById(id: number): Promise<SalesInvoiceResponse> {
    return this.request(`/api/sales/sales-invoices/${id}`);
  }

  createSalesInvoice(data: SalesInvoiceRequest, attachments?: File[]): Promise<SalesInvoiceResponse> {
    const token = localStorage.getItem('auth_token');
    const form = new FormData();
    form.append('data', JSON.stringify(data));
    attachments?.forEach(f => form.append('attachments', f));
    return fetch(`${API_BASE_URL}/api/sales/sales-invoices`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(r => { if (!r.ok) return r.text().then(t => { throw new Error(t); }); return r.json(); });
  }

  getSalesInvoicePdfUrl(id: number): string {
    return `${API_BASE_URL}/api/sales/sales-invoices/pdf/${id}`;
  }

  deleteSalesInvoice(id: number): Promise<void> {
    return this.request(`/api/sales/sales-invoices/${id}`, { method: 'DELETE' });
  }
}

export const salesApi = new SalesApiService();
