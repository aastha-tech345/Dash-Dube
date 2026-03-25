import type {
  RawMaterialRequest, RawMaterialResponse,
  SemiFinishedRequest, SemiFinishedResponse,
  FinishedGoodRequest, FinishedGoodResponse,
  PaginatedResponse,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class ProductionApiService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('auth_token');
    const url = `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers as Record<string, string> | undefined),
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status}: ${text || res.statusText}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
  }

  private async multipartRequest<T>(url: string, method: string, form: FormData): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers: this.getAuthHeader(),
      body: form,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status}: ${text || res.statusText}`);
    }
    return res.json();
  }

  // ── Raw Materials ──────────────────────────────────────────────────────────
  getRawMaterials(params?: { page?: number; size?: number }): Promise<PaginatedResponse<RawMaterialResponse>> {
    const p = new URLSearchParams({ page: String(params?.page ?? 0), size: String(params?.size ?? 20) });
    return this.request(`/api/production/raw-materials?${p}`);
  }

  getRawMaterialById(id: number): Promise<RawMaterialResponse> {
    return this.request(`/api/production/raw-materials/${id}`);
  }

  getRawMaterialByCode(code: string): Promise<RawMaterialResponse> {
    return this.request(`/api/production/raw-materials/by-item-code/${encodeURIComponent(code)}`);
  }

  createRawMaterial(data: RawMaterialRequest, image?: File): Promise<RawMaterialResponse> {
    return this.multipartRequest('/api/production/raw-materials', 'POST', this.buildRawMaterialForm(data, image));
  }

  updateRawMaterial(id: number, data: Partial<RawMaterialRequest>, image?: File): Promise<RawMaterialResponse> {
    return this.multipartRequest(`/api/production/raw-materials/${id}`, 'PUT', this.buildRawMaterialForm(data as RawMaterialRequest, image));
  }

  updateRawMaterialStock(id: number, quantity: number): Promise<RawMaterialResponse> {
    return this.request(`/api/production/raw-materials/${id}/stock-quantity?quantity=${quantity}`, { method: 'PUT' });
  }

  deleteRawMaterial(id: number): Promise<void> {
    return this.request(`/api/production/raw-materials/${id}`, { method: 'DELETE' });
  }

  getRawMaterialImageUrl(id: number): string {
    return `${API_BASE_URL}/api/production/raw-materials/${id}/image`;
  }

  getRawMaterialBarcodeImageUrl(id: number): string {
    return `${API_BASE_URL}/api/production/raw-materials/${id}/barcode-image`;
  }

  exportRawMaterials(): Promise<Blob> {
    return fetch(`${API_BASE_URL}/api/production/raw-materials/export`, {
      headers: this.getAuthHeader(),
    }).then(r => {
      if (!r.ok) return r.text().then(t => { throw new Error(`${r.status}: ${t}`); });
      return r.blob();
    });
  }

  downloadBulkTemplate(): Promise<Blob> {
    return fetch(`${API_BASE_URL}/api/production/raw-materials/bulk-template`, {
      headers: this.getAuthHeader(),
    }).then(r => {
      if (!r.ok) return r.text().then(t => { throw new Error(`${r.status}: ${t}`); });
      return r.blob();
    });
  }

  bulkImportRawMaterials(file: File): Promise<unknown> {
    const form = new FormData();
    form.append('file', file);
    return this.multipartRequest('/api/production/raw-materials/bulk', 'POST', form);
  }

  private buildRawMaterialForm(data: Partial<RawMaterialRequest>, image?: File): FormData {
    const form = new FormData();
    const str = (k: string, v: unknown) => { if (v !== undefined && v !== null && v !== '') form.append(k, String(v)); };
    const num = (k: string, v: number | undefined | null) => { if (v !== undefined && v !== null) form.append(k, String(v)); };
    str('itemCode', data.itemCode);
    str('name', data.name);
    str('itemType', data.itemType ?? 'PRODUCT');
    form.append('forPurchase', String(data.forPurchase ?? false));
    form.append('forSales', String(data.forSales ?? false));
    num('categoryId', data.categoryId);
    num('subCategoryId', data.subCategoryId);
    str('barcode', data.barcode);
    str('description', data.description);
    num('issueUnitId', data.issueUnitId);
    num('purchaseUnitId', data.purchaseUnitId);
    num('unitRelation', data.unitRelation);
    num('reorderLimit', data.reorderLimit);
    num('taxId', data.taxId);
    num('purchasePrice', data.purchasePrice);
    num('salesPrice', data.salesPrice);
    num('stockQuantity', data.stockQuantity);
    form.append('discontinued', String(data.discontinued ?? false));
    if (image) form.append('image', image);
    return form;
  }

  // ── Semi-Finished ──────────────────────────────────────────────────────────
  getSemiFinished(params?: { page?: number; size?: number }): Promise<PaginatedResponse<SemiFinishedResponse>> {
    const p = new URLSearchParams({ page: String(params?.page ?? 0), size: String(params?.size ?? 20) });
    return this.request(`/api/production/semi-finished?${p}`);
  }

  getSemiFinishedById(id: number): Promise<SemiFinishedResponse> {
    return this.request(`/api/production/semi-finished/${id}`);
  }

  createSemiFinished(data: SemiFinishedRequest, image?: File): Promise<SemiFinishedResponse> {
    return this.multipartRequest('/api/production/semi-finished', 'POST', this.buildSemiFinishedForm(data, image));
  }

  updateSemiFinished(id: number, data: Partial<SemiFinishedRequest>, image?: File): Promise<SemiFinishedResponse> {
    return this.multipartRequest(`/api/production/semi-finished/${id}`, 'PUT', this.buildSemiFinishedForm(data as SemiFinishedRequest, image));
  }

  deleteSemiFinished(id: number): Promise<void> {
    return this.request(`/api/production/semi-finished/${id}`, { method: 'DELETE' });
  }

  getSemiFinishedImageUrl(id: number): string {
    return `${API_BASE_URL}/api/production/semi-finished/${id}/image`;
  }

  private buildSemiFinishedForm(data: Partial<SemiFinishedRequest>, image?: File): FormData {
    const form = new FormData();
    const str = (k: string, v: unknown) => { if (v !== undefined && v !== null && v !== '') form.append(k, String(v)); };
    const num = (k: string, v: number | undefined | null) => { if (v !== undefined && v !== null) form.append(k, String(v)); };
    str('itemCode', data.itemCode);
    str('name', data.name);
    str('itemType', data.itemType ?? 'PRODUCT');
    form.append('forPurchase', String(data.forPurchase ?? false));
    form.append('forSales', String(data.forSales ?? false));
    form.append('isRoll', String(data.isRoll ?? false));
    form.append('isScrapItem', String(data.isScrapItem ?? false));
    num('categoryId', data.categoryId);
    num('subCategoryId', data.subCategoryId);
    str('barcode', data.barcode);
    str('description', data.description);
    num('issueUnitId', data.issueUnitId);
    num('purchaseUnitId', data.purchaseUnitId);
    num('unitRelation', data.unitRelation);
    num('wastagePercentage', data.wastagePercentage);
    num('reorderLimit', data.reorderLimit);
    num('stockQuantity', data.stockQuantity);
    num('taxId', data.taxId);
    form.append('isTaxInclusive', String(data.isTaxInclusive ?? false));
    num('purchasePrice', data.purchasePrice);
    num('salesPrice', data.salesPrice);
    if (image) form.append('image', image);
    return form;
  }

  // ── Finished Goods ─────────────────────────────────────────────────────────
  getFinishedGoods(params?: { page?: number; size?: number }): Promise<PaginatedResponse<FinishedGoodResponse>> {
    const p = new URLSearchParams({ page: String(params?.page ?? 0), size: String(params?.size ?? 20) });
    return this.request(`/api/production/finished-goods?${p}`);
  }

  getFinishedGoodById(id: number): Promise<FinishedGoodResponse> {
    return this.request(`/api/production/finished-goods/${id}`);
  }

  createFinishedGood(data: FinishedGoodRequest, image?: File): Promise<FinishedGoodResponse> {
    return this.multipartRequest('/api/production/finished-goods', 'POST', this.buildFinishedGoodForm(data, image));
  }

  updateFinishedGood(id: number, data: Partial<FinishedGoodRequest>, image?: File): Promise<FinishedGoodResponse> {
    return this.multipartRequest(`/api/production/finished-goods/${id}`, 'PUT', this.buildFinishedGoodForm(data as FinishedGoodRequest, image));
  }

  deleteFinishedGood(id: number): Promise<void> {
    return this.request(`/api/production/finished-goods/${id}`, { method: 'DELETE' });
  }

  getFinishedGoodImageUrl(id: number): string {
    return `${API_BASE_URL}/api/production/finished-goods/${id}/image`;
  }

  private buildFinishedGoodForm(data: Partial<FinishedGoodRequest>, image?: File): FormData {
    const form = new FormData();
    const str = (k: string, v: unknown) => { if (v !== undefined && v !== null && v !== '') form.append(k, String(v)); };
    const num = (k: string, v: number | undefined | null) => { if (v !== undefined && v !== null) form.append(k, String(v)); };
    str('name', data.name);
    str('itemCode', data.itemCode);
    str('barcode', data.barcode);
    str('hsnSacCode', data.hsnSacCode);
    str('description', data.description);
    num('inventoryTypeId', data.inventoryTypeId);
    str('itemType', data.itemType ?? 'PRODUCT');
    form.append('forPurchase', String(data.forPurchase ?? false));
    form.append('forSales', String(data.forSales ?? false));
    form.append('isTaxInclusive', String(data.isTaxInclusive ?? false));
    num('categoryId', data.categoryId);
    num('subCategoryId', data.subCategoryId);
    num('issueUnitId', data.issueUnitId);
    num('purchaseUnitId', data.purchaseUnitId);
    num('taxId', data.taxId);
    num('unitRelation', data.unitRelation);
    num('tolerancePercentage', data.tolerancePercentage);
    num('reorderLimit', data.reorderLimit);
    num('stockQuantity', data.stockQuantity);
    num('purchasePrice', data.purchasePrice);
    num('salesPrice', data.salesPrice);
    if (image) form.append('imageFile', image);
    return form;
  }
}

export const productionApi = new ProductionApiService();
