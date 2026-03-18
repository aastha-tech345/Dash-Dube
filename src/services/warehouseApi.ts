import type {
  LoginRequest,
  LoginResponse,
  WareProductRequest,
  WareProductResponse,
  WareProductBatchRequest,
  WareProductBatchResponse,
  WareProductSerialRequest,
  WareProductSerialResponse,
  WareCategoryRequest,
  WareCategoryResponse,
  WareSubCategoryRequest,
  WareSubCategoryResponse,
  WareTaxRequest,
  WareTaxResponse,
  UoMRequest,
  UoMResponse,
  LocationRequest,
  LocationResponse,
  WareHouseRequest,
  WareHouseResponse,
  FloorRequest,
  FloorResponse,
  ZoneRequest,
  ZoneResponse,
  RackRequest,
  RackResponse,
  ShelfRequest,
  ShelfResponse,
  BinRequest,
  BinResponse,
  InventoryMovementRequest,
  InventoryMovementResponse,
  PaginatedResponse,
} from '@/types/api';

// Use empty string for Vite proxy, or full URL if VITE_API_URL is set
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class WarehouseApiService {
  constructor() {
    // No need to store token in instance variable
    // Always read fresh from localStorage
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const requestOptions = {
      headers: this.getHeaders(),
      ...options,
    };

    console.log('Making API request:', {
      url,
      method: options?.method || 'GET',
      headers: requestOptions.headers,
      body: options?.body
    });

    try {
      const response = await fetch(url, requestOptions);

      console.log('API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        // Handle authentication errors
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          throw new Error('Authentication failed. Please login again.');
        }
        
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to perform this action.');
        }
        
        throw new Error(errorText || `API Error: ${response.status} ${response.statusText}`);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();
      console.log('API response data:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token in localStorage
    localStorage.setItem('auth_token', response.token);
    
    // Store user data
    localStorage.setItem('user_data', JSON.stringify({
      roles: response.roles,
      modules: response.modules
    }));
    
    return response;
  }

  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  refreshToken() {
    // Token is always read fresh from localStorage in getHeaders()
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  // Products
  async getProducts(): Promise<WareProductResponse[]> {
    return this.request<WareProductResponse[]>('/warehouse/products');
  }
  async getProductsPaginated(page = 0, size = 10, sort?: string): Promise<PaginatedResponse<WareProductResponse>> {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (sort) params.append('sort', sort);
    return this.request<PaginatedResponse<WareProductResponse>>(`/warehouse/products/paginated?${params}`);
  }

  async getProductById(id: number): Promise<WareProductResponse> {
    return this.request<WareProductResponse>(`/warehouse/products/${id}`);
  }

  async getProductByBarcode(barcode: string): Promise<WareProductResponse> {
    return this.request<WareProductResponse>(`/warehouse/products/barcode/${barcode}`);
  }

  async createProduct(product: WareProductRequest): Promise<WareProductResponse> {
    return this.request<WareProductResponse>('/warehouse/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: number, product: WareProductRequest): Promise<WareProductResponse> {
    return this.request<WareProductResponse>(`/warehouse/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: number): Promise<void> {
    return this.request<void>(`/warehouse/products/${id}`, { method: 'DELETE' });
  }

  // Batches
  async getBatchesByProduct(productId: number): Promise<WareProductBatchResponse[]> {
    return this.request<WareProductBatchResponse[]>(`/warehouse/batches/product/${productId}`);
  }

  async createBatch(batch: WareProductBatchRequest): Promise<WareProductBatchResponse> {
    return this.request<WareProductBatchResponse>('/warehouse/batches', {
      method: 'POST',
      body: JSON.stringify(batch),
    });
  }

  async updateBatch(id: number, batch: WareProductBatchRequest): Promise<WareProductBatchResponse> {
    return this.request<WareProductBatchResponse>(`/warehouse/batches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(batch),
    });
  }

  async deleteBatch(id: number): Promise<void> {
    return this.request<void>(`/warehouse/batches/${id}`, { method: 'DELETE' });
  }

  // Serials
  async getSerialByNumber(serial: string): Promise<WareProductSerialResponse> {
    return this.request<WareProductSerialResponse>(`/warehouse/serials/${serial}`);
  }

  async createSerial(serial: WareProductSerialRequest): Promise<WareProductSerialResponse> {
    return this.request<WareProductSerialResponse>('/warehouse/serials', {
      method: 'POST',
      body: JSON.stringify(serial),
    });
  }

  async updateSerial(id: number, serial: WareProductSerialRequest): Promise<WareProductSerialResponse> {
    return this.request<WareProductSerialResponse>(`/warehouse/serials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serial),
    });
  }

  async deleteSerial(id: number): Promise<void> {
    return this.request<void>(`/warehouse/serials/${id}`, { method: 'DELETE' });
  }

  // Categories
  async getCategories(): Promise<WareCategoryResponse[]> {
    return this.request<WareCategoryResponse[]>('/warehouse/categories');
  }

  async getCategoryById(id: number): Promise<WareCategoryResponse> {
    return this.request<WareCategoryResponse>(`/warehouse/categories/${id}`);
  }

  async createCategory(category: WareCategoryRequest): Promise<WareCategoryResponse> {
    return this.request<WareCategoryResponse>('/warehouse/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: number, category: WareCategoryRequest): Promise<WareCategoryResponse> {
    return this.request<WareCategoryResponse>(`/warehouse/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: number): Promise<void> {
    return this.request<void>(`/warehouse/categories/${id}`, { method: 'DELETE' });
  }

  // Sub-Categories
  async getSubCategories(categoryId?: number): Promise<WareSubCategoryResponse[]> {
    const url = categoryId 
      ? `/warehouse/subcategories?categoryId=${categoryId}`
      : '/warehouse/subcategories';
    return this.request<WareSubCategoryResponse[]>(url);
  }

  async createSubCategory(subCategory: WareSubCategoryRequest): Promise<WareSubCategoryResponse> {
    return this.request<WareSubCategoryResponse>('/warehouse/subcategories', {
      method: 'POST',
      body: JSON.stringify(subCategory),
    });
  }

  async updateSubCategory(id: number, subCategory: WareSubCategoryRequest): Promise<WareSubCategoryResponse> {
    return this.request<WareSubCategoryResponse>(`/warehouse/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subCategory),
    });
  }

  async deleteSubCategory(id: number): Promise<void> {
    return this.request<void>(`/warehouse/subcategories/${id}`, { method: 'DELETE' });
  }

  // Taxes
  async getTaxes(): Promise<WareTaxResponse[]> {
    return this.request<WareTaxResponse[]>('/warehouse/taxes');
  }

  async createTax(tax: WareTaxRequest): Promise<WareTaxResponse> {
    return this.request<WareTaxResponse>('/warehouse/taxes', {
      method: 'POST',
      body: JSON.stringify(tax),
    });
  }

  async updateTax(id: number, tax: WareTaxRequest): Promise<WareTaxResponse> {
    return this.request<WareTaxResponse>(`/warehouse/taxes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tax),
    });
  }

  async deleteTax(id: number): Promise<void> {
    return this.request<void>(`/warehouse/taxes/${id}`, { method: 'DELETE' });
  }

  // UoM
  async getUoMs(): Promise<UoMResponse[]> {
    return this.request<UoMResponse[]>('/warehouse/uom');
  }

  async createUoM(uom: UoMRequest): Promise<UoMResponse> {
    return this.request<UoMResponse>('/warehouse/uom', {
      method: 'POST',
      body: JSON.stringify(uom),
    });
  }

  async updateUoM(id: number, uom: UoMRequest): Promise<UoMResponse> {
    return this.request<UoMResponse>(`/warehouse/uom/${id}`, {
      method: 'PUT',
      body: JSON.stringify(uom),
    });
  }

  async deleteUoM(id: number): Promise<void> {
    return this.request<void>(`/warehouse/uom/${id}`, { method: 'DELETE' });
  }

  // Locations
  async getLocations(): Promise<LocationResponse[]> {
    return this.request<LocationResponse[]>('/locations');
  }

  async createLocation(location: LocationRequest): Promise<LocationResponse> {
    return this.request<LocationResponse>('/locations', {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }

  async updateLocation(id: number, location: LocationRequest): Promise<LocationResponse> {
    return this.request<LocationResponse>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  }

  // Warehouses
  async getWarehouses(): Promise<WareHouseResponse[]> {
    return this.request<WareHouseResponse[]>('/warehouse/warehouses');
  }

  async getWarehouseById(id: number): Promise<WareHouseResponse> {
    return this.request<WareHouseResponse>(`/warehouse/warehouses/${id}`);
  }

  async getWarehouseByCode(code: string): Promise<WareHouseResponse> {
    return this.request<WareHouseResponse>(`/warehouse/warehouses/code/${code}`);
  }

  async getWarehousesByStatus(isActive: boolean): Promise<WareHouseResponse[]> {
    return this.request<WareHouseResponse[]>(`/warehouse/warehouses/status?isActive=${isActive}`);
  }

  async getWarehousesByType(type: string): Promise<WareHouseResponse[]> {
    return this.request<WareHouseResponse[]>(`/warehouse/warehouses/type/${type}`);
  }

  async createWarehouse(warehouse: WareHouseRequest): Promise<WareHouseResponse> {
    console.log('Creating warehouse with data:', warehouse);
    
    return this.request<WareHouseResponse>('/warehouse/warehouses', {
      method: 'POST',
      body: JSON.stringify(warehouse),
    });
  }

  async updateWarehouse(id: number, warehouse: WareHouseRequest): Promise<WareHouseResponse> {
    return this.request<WareHouseResponse>(`/warehouse/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(warehouse),
    });
  }

  async deleteWarehouse(id: number): Promise<void> {
    return this.request<void>(`/warehouse/warehouses/${id}`, { method: 'DELETE' });
  }

  // Floors
  async getFloors(): Promise<FloorResponse[]> {
    return this.request<FloorResponse[]>('/warehouse/floors');
  }

  async getFloorById(id: number): Promise<FloorResponse> {
    return this.request<FloorResponse>(`/warehouse/floors/${id}`);
  }

  async getFloorsByStatus(isActive: boolean): Promise<FloorResponse[]> {
    return this.request<FloorResponse[]>(`/warehouse/floors/status?isActive=${isActive}`);
  }

  async getFloorsByWarehouse(warehouseId: number): Promise<FloorResponse[]> {
    return this.request<FloorResponse[]>(`/warehouse/floors/warehouse/${warehouseId}`);
  }

  async createFloor(floor: FloorRequest): Promise<FloorResponse> {
    return this.request<FloorResponse>('/warehouse/floors', {
      method: 'POST',
      body: JSON.stringify(floor),
    });
  }

  async updateFloor(id: number, floor: FloorRequest): Promise<FloorResponse> {
    return this.request<FloorResponse>(`/warehouse/floors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(floor),
    });
  }

  async deleteFloor(id: number): Promise<void> {
    return this.request<void>(`/warehouse/floors/${id}`, { method: 'DELETE' });
  }

  // Zones - All operations use /warehouse/zones as per API documentation
  async getZones(): Promise<ZoneResponse[]> {
    return this.request<ZoneResponse[]>('/warehouse/zones');
  }

  async getZoneById(id: number): Promise<ZoneResponse> {
    return this.request<ZoneResponse>(`/warehouse/zones/${id}`);
  }

  async getZonesByStatus(isActive: boolean): Promise<ZoneResponse[]> {
    return this.request<ZoneResponse[]>(`/warehouse/zones/status?isActive=${isActive}`);
  }

  async getZonesByType(type: string): Promise<ZoneResponse[]> {
    return this.request<ZoneResponse[]>(`/warehouse/zones/type/${type}`);
  }

  async createZone(zone: ZoneRequest): Promise<ZoneResponse> {
    console.log('Creating zone with data:', zone);
    return this.request<ZoneResponse>('/warehouse/zones', {
      method: 'POST',
      body: JSON.stringify(zone),
    });
  }

  async updateZone(id: number, zone: ZoneRequest): Promise<ZoneResponse> {
    return this.request<ZoneResponse>(`/warehouse/zones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(zone),
    });
  }

  async deleteZone(id: number): Promise<void> {
    return this.request<void>(`/warehouse/zones/${id}`, { method: 'DELETE' });
  }

  // Racks
  async getRacks(): Promise<RackResponse[]> {
    return this.request<RackResponse[]>('/warehouse/racks');
  }

  async getRackById(id: number): Promise<RackResponse> {
    return this.request<RackResponse>(`/warehouse/racks/${id}`);
  }

  async getRacksByStatus(isActive: boolean): Promise<RackResponse[]> {
    return this.request<RackResponse[]>(`/warehouse/racks/status?isActive=${isActive}`);
  }

  async getRacksByType(type: string): Promise<RackResponse[]> {
    return this.request<RackResponse[]>(`/warehouse/racks/type/${type}`);
  }

  async getRackByBarcode(barcode: string): Promise<RackResponse> {
    return this.request<RackResponse>(`/warehouse/racks/barcode/${barcode}`);
  }

  async createRack(rack: RackRequest): Promise<RackResponse> {
    return this.request<RackResponse>('/warehouse/racks', {
      method: 'POST',
      body: JSON.stringify(rack),
    });
  }

  async updateRack(id: number, rack: RackRequest): Promise<RackResponse> {
    return this.request<RackResponse>(`/warehouse/racks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rack),
    });
  }

  async deleteRack(id: number): Promise<void> {
    return this.request<void>(`/warehouse/racks/${id}`, { method: 'DELETE' });
  }

  // Shelves
  async getShelves(): Promise<ShelfResponse[]> {
    return this.request<ShelfResponse[]>('/warehouse/shelves');
  }

  async getShelfById(id: number): Promise<ShelfResponse> {
    return this.request<ShelfResponse>(`/warehouse/shelves/${id}`);
  }

  async getShelvesByStatus(isActive: boolean): Promise<ShelfResponse[]> {
    return this.request<ShelfResponse[]>(`/warehouse/shelves/status?isActive=${isActive}`);
  }

  async getShelfByBarcode(barcode: string): Promise<ShelfResponse> {
    return this.request<ShelfResponse>(`/warehouse/shelves/barcode/${barcode}`);
  }

  async createShelf(shelf: ShelfRequest): Promise<ShelfResponse> {
    return this.request<ShelfResponse>('/warehouse/shelves', {
      method: 'POST',
      body: JSON.stringify(shelf),
    });
  }

  async updateShelf(id: number, shelf: ShelfRequest): Promise<ShelfResponse> {
    return this.request<ShelfResponse>(`/warehouse/shelves/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shelf),
    });
  }

  async deleteShelf(id: number): Promise<void> {
    return this.request<void>(`/warehouse/shelves/${id}`, { method: 'DELETE' });
  }

  // Bins
  async getBins(): Promise<BinResponse[]> {
    return this.request<BinResponse[]>('/warehouse/bins');
  }

  async getBinsPaginated(page = 0, size = 10): Promise<PaginatedResponse<BinResponse>> {
    return this.request<PaginatedResponse<BinResponse>>(`/warehouse/bins/paginated?page=${page}&size=${size}`);
  }

  async getBinById(id: number): Promise<BinResponse> {
    return this.request<BinResponse>(`/warehouse/bins/${id}`);
  }

  async getBinsByStatus(isActive: boolean): Promise<BinResponse[]> {
    return this.request<BinResponse[]>(`/warehouse/bins/active?isActive=${isActive}`);
  }

  async getBinsByType(type: string): Promise<BinResponse[]> {
    return this.request<BinResponse[]>(`/warehouse/bins/type/${type}`);
  }

  async getBinByBarcode(barcode: string): Promise<BinResponse> {
    return this.request<BinResponse>(`/warehouse/bins/barcode/${barcode}`);
  }

  async createBin(bin: BinRequest): Promise<BinResponse> {
    return this.request<BinResponse>('/warehouse/bins', {
      method: 'POST',
      body: JSON.stringify(bin),
    });
  }

  async updateBin(id: number, bin: BinRequest): Promise<BinResponse> {
    return this.request<BinResponse>(`/warehouse/bins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bin),
    });
  }

  async deleteBin(id: number): Promise<void> {
    return this.request<void>(`/warehouse/bins/${id}`, { method: 'DELETE' });
  }

  // Inventory Movements
  async getInventoryMovements(): Promise<InventoryMovementResponse[]> {
    return this.request<InventoryMovementResponse[]>('/warehouse/inventory-movements');
  }

  async getInventoryMovementById(id: number): Promise<InventoryMovementResponse> {
    return this.request<InventoryMovementResponse>(`/warehouse/inventory-movements/${id}`);
  }

  async getInventoryMovementsByStatus(status: string): Promise<InventoryMovementResponse[]> {
    return this.request<InventoryMovementResponse[]>(`/warehouse/inventory-movements/status/${status}`);
  }

  async getInventoryMovementsByWarehouse(warehouseId: number): Promise<InventoryMovementResponse[]> {
    return this.request<InventoryMovementResponse[]>(`/warehouse/inventory-movements/warehouse/${warehouseId}`);
  }

  async createInventoryMovement(movement: InventoryMovementRequest): Promise<InventoryMovementResponse> {
    return this.request<InventoryMovementResponse>('/warehouse/inventory-movements', {
      method: 'POST',
      body: JSON.stringify(movement),
    });
  }

  async updateInventoryMovementQuantity(id: number, quantity: number): Promise<InventoryMovementResponse> {
    return this.request<InventoryMovementResponse>(`/warehouse/inventory-movements/${id}/quantity?quantity=${quantity}`, {
      method: 'PATCH',
    });
  }

  async deleteInventoryMovement(id: number): Promise<void> {
    return this.request<void>(`/warehouse/inventory-movements/${id}`, { method: 'DELETE' });
  }
}



export const warehouseApi = new WarehouseApiService();
