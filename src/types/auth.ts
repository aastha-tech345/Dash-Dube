export interface LoginRequest {
  tenantId: string;
  email: string;
  password: string;
}

export interface Module {
  id: number;
  name: string;
  key: string;
}

export interface LoginResponse {
  token: string;
  roles: string[];
  modules: Module[];
}

export interface User {
  token: string;
  roles: string[];
  modules: Module[];
}