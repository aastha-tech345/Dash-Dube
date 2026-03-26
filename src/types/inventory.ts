export interface Product {
  id: string;
  sku?: string;
  name: string;
  sub: string;
  category: string;
  purchasePrice: string;
  salePrice: string;
  status: 'Active' | 'Inactive';
}

export interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  type: 'in' | 'out';
  warehouse: string;
  zone?: string;
  date: string;
  reference: string;
  notes?: string;
}

export interface Warehouse {
  id?: number;
  code: string;
  name: string;
  type: string;
  zones?: string;
  status: string;
  address?: string;
  capacity?: number;
  currentUtilization?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Zone {
  name: string;
  warehouse: string;
  type: string;
  pickPriority: number;
  putAwayPriority: number;
  status: string;
}
