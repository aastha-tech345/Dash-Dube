<<<<<<< HEAD
export interface Product {
  id: string;
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
  code: string;
  name: string;
  type: string;
  zones: string;
  status: string;
}

export interface Zone {
  name: string;
  warehouse: string;
  type: string;
  pickPriority: number;
  putAwayPriority: number;
  status: string;
}
=======
export interface Product {
  id: string;
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
  code: string;
  name: string;
  type: string;
  zones: string;
  status: string;
}

export interface Zone {
  name: string;
  warehouse: string;
  type: string;
  pickPriority: number;
  putAwayPriority: number;
  status: string;
}
>>>>>>> origin/abhi-version
