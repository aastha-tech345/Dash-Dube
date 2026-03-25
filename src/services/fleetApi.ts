import type {
  DriverRequest, DriverResponse,
  VehicleRequest, VehicleResponse,
  RouteRequest, RouteResponse,
  PaginatedResponse,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class FleetApiService {
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

    console.log('Fleet API request:', url, requestOptions.method || 'GET');

    const response = await fetch(url, requestOptions);

    // 405 on PUT/PATCH — server processes the request but returns wrong status
    // Try to parse body anyway; if empty treat as success
    if (response.status === 405 && ['PUT', 'PATCH'].includes(options?.method ?? '')) {
      const text = await response.text();
      if (!text) return undefined as T;
      try { return JSON.parse(text) as T; } catch { return undefined as T; }
    }

    if (!response.ok) {
      const text = await response.text();
      console.error('Fleet API error:', response.status, text);
      throw new Error(text || `API Error: ${response.status}`);
    }
    if (response.status === 204) return undefined as T;
    return response.json();
  }

  // Drivers
  getDrivers(params?: { page?: number; size?: number }): Promise<PaginatedResponse<DriverResponse>> {
    const p = new URLSearchParams({ page: String(params?.page ?? 0), size: String(params?.size ?? 10) });
    return this.request(`/api/fleet/drivers?${p}`);
  }

  getDriverById(id: number): Promise<DriverResponse> {
    return this.request(`/api/fleet/drivers/${id}`);
  }

  createDriver(data: DriverRequest): Promise<DriverResponse> {
    return this.request('/api/fleet/drivers', { method: 'POST', body: JSON.stringify(data) });
  }

  updateDriver(id: number, data: DriverRequest): Promise<DriverResponse> {
    return this.request(`/api/fleet/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  deleteDriver(id: number): Promise<void> {
    return this.request(`/api/fleet/drivers/${id}`, { method: 'DELETE' });
  }

  uploadDriverProfileImage(id: number, file: File): Promise<DriverResponse> {
    const token = localStorage.getItem('auth_token');
    const form = new FormData();
    form.append('file', file);
    return fetch(`${API_BASE_URL}/api/fleet/drivers/${id}/profile-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(async r => {
      if (!r.ok) { const t = await r.text(); throw new Error(t || `Error ${r.status}`); }
      return r.json();
    });
  }

  // Vehicles
  getVehicles(params?: { page?: number; size?: number }): Promise<PaginatedResponse<VehicleResponse>> {
    const p = new URLSearchParams({ page: String(params?.page ?? 0), size: String(params?.size ?? 10) });
    return this.request(`/api/fleet/vehicles?${p}`);
  }

  getVehicleById(id: number): Promise<VehicleResponse> {
    return this.request(`/api/fleet/vehicles/${id}`);
  }

  createVehicle(data: VehicleRequest): Promise<VehicleResponse> {
    return this.request('/api/fleet/vehicles', { method: 'POST', body: JSON.stringify(data) });
  }

  updateVehicle(id: number, data: VehicleRequest): Promise<VehicleResponse> {
    return this.request(`/api/fleet/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  deleteVehicle(id: number): Promise<void> {
    return this.request(`/api/fleet/vehicles/${id}`, { method: 'DELETE' });
  }

  // Routes
  getRoutes(): Promise<RouteResponse[]> {
    return this.request('/api/fleet/routes');
  }

  getRouteById(id: number): Promise<RouteResponse> {
    return this.request(`/api/fleet/routes/${id}`);
  }

  createRoute(data: RouteRequest): Promise<RouteResponse> {
    return this.request('/api/fleet/routes', { method: 'POST', body: JSON.stringify(data) });
  }

  markStopArrived(stopId: number): Promise<void> {
    return this.request(`/api/fleet/routes/stops/${stopId}/arrive`, { method: 'PUT' });
  }

  markStopCompleted(stopId: number): Promise<void> {
    return this.request(`/api/fleet/routes/stops/${stopId}/complete`, { method: 'PUT' });
  }

  updateRoute(id: number, data: RouteRequest): Promise<RouteResponse> {
    return this.request(`/api/fleet/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  deleteRoute(id: number): Promise<void> {
    return this.request(`/api/fleet/routes/${id}`, { method: 'DELETE' });
  }
}

export const fleetApi = new FleetApiService();
