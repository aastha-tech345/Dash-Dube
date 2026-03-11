<<<<<<< HEAD
# Project Refactoring Guide

## Overview
Is project ko refactor kiya gaya hai taaki code reusable ho aur API integration easy ho jaye.

## Structure

### 1. Types (`src/types/inventory.ts`)
Sabhi data models ek jagah defined hain:
- `Product` - Product information
- `StockTransaction` - Stock in/out transactions
- `Warehouse` - Warehouse details
- `Zone` - Zone information

### 2. API Service (`src/services/api.ts`)
Centralized API calls:
```typescript
import { apiService } from '@/services/api';

// Products fetch karna
const products = await apiService.getProducts({ search: 'laptop', category: 'Electronics' });

// Product update karna
await apiService.updateProduct('PRO-001', { status: 'Inactive' });

// Stock transaction create karna
await apiService.createStockTransaction({
  productId: 'PRO-001',
  quantity: 50,
  type: 'in',
  warehouse: 'WH-MAIN-01',
  // ...
});
```

### 3. Custom Hooks

#### `useProducts(search?, category?)`
Products ko fetch aur manage karne ke liye:
```typescript
const { products, loading, error, refetch, updateProductStatus } = useProducts('laptop', 'Electronics');
```

#### `useStockTransactions(type?)`
Stock transactions manage karne ke liye:
```typescript
const { transactions, loading, createTransaction } = useStockTransactions('in');

// New transaction create karna
await createTransaction({
  productId: 'PRO-001',
  productName: 'MacBook Pro',
  quantity: 10,
  type: 'in',
  warehouse: 'WH-MAIN-01',
  reference: 'PO-2024-001',
  date: new Date().toISOString(),
});
```

#### `useWarehouses()` & `useZones(warehouseCode?)`
Warehouses aur zones fetch karne ke liye:
```typescript
const { warehouses, loading } = useWarehouses();
const { zones } = useZones('WH-MAIN-01');
```

### 4. Reusable Components

#### `ProductTable`
Products ko table format mein display karta hai:
```typescript
<ProductTable
  products={products}
  loading={loading}
  onStatusToggle={(id, status) => updateProductStatus(id, status)}
/>
```

#### `ProductFilters`
Search aur category filters:
```typescript
<ProductFilters
  search={search}
  onSearchChange={setSearch}
  categories={['Electronics', 'Furniture']}
  selectedCategory={category}
  onCategoryChange={setCategory}
/>
```

#### `StockTransactionForm`
Stock in/out record karne ke liye form:
```typescript
<StockTransactionForm
  type="in"
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

#### `StockTransactionList`
Transactions ko list format mein display karta hai:
```typescript
<StockTransactionList
  transactions={transactions}
  loading={loading}
/>
```

## Backend Integration

Abhi mock data use ho raha hai. Real API integrate karne ke liye:

1. `.env` file mein API URL add karo:
```env
VITE_API_URL=https://your-api.com/api
```

2. `src/services/api.ts` mein API calls already ready hain
3. Custom hooks automatically API service use karenge
4. Mock data ko comment out kar do hooks mein

## Example: New Page Banana

```typescript
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductTable from '@/components/inventory/ProductTable';
import ProductFilters from '@/components/inventory/ProductFilters';

export default function MyNewPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  
  const { products, loading, updateProductStatus } = useProducts(search, category || undefined);

  return (
    <div>
      <h1>My Page</h1>
      
      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        categories={['Electronics', 'Furniture']}
        selectedCategory={category}
        onCategoryChange={setCategory}
      />
      
      <ProductTable
        products={products}
        loading={loading}
        onStatusToggle={updateProductStatus}
      />
    </div>
  );
}
```

## Benefits

1. **Reusable Components** - Ek baar banao, kahin bhi use karo
2. **Easy API Integration** - Sirf `api.ts` mein changes karo
3. **Centralized Logic** - Business logic hooks mein hai
4. **Type Safety** - TypeScript types se errors kam honge
5. **Easy Testing** - Har component alag se test kar sakte ho
6. **Maintainable** - Code samajhna aur update karna easy hai
=======
# Project Refactoring Guide

## Overview
Is project ko refactor kiya gaya hai taaki code reusable ho aur API integration easy ho jaye.

## Structure

### 1. Types (`src/types/inventory.ts`)
Sabhi data models ek jagah defined hain:
- `Product` - Product information
- `StockTransaction` - Stock in/out transactions
- `Warehouse` - Warehouse details
- `Zone` - Zone information

### 2. API Service (`src/services/api.ts`)
Centralized API calls:
```typescript
import { apiService } from '@/services/api';

// Products fetch karna
const products = await apiService.getProducts({ search: 'laptop', category: 'Electronics' });

// Product update karna
await apiService.updateProduct('PRO-001', { status: 'Inactive' });

// Stock transaction create karna
await apiService.createStockTransaction({
  productId: 'PRO-001',
  quantity: 50,
  type: 'in',
  warehouse: 'WH-MAIN-01',
  // ...
});
```

### 3. Custom Hooks

#### `useProducts(search?, category?)`
Products ko fetch aur manage karne ke liye:
```typescript
const { products, loading, error, refetch, updateProductStatus } = useProducts('laptop', 'Electronics');
```

#### `useStockTransactions(type?)`
Stock transactions manage karne ke liye:
```typescript
const { transactions, loading, createTransaction } = useStockTransactions('in');

// New transaction create karna
await createTransaction({
  productId: 'PRO-001',
  productName: 'MacBook Pro',
  quantity: 10,
  type: 'in',
  warehouse: 'WH-MAIN-01',
  reference: 'PO-2024-001',
  date: new Date().toISOString(),
});
```

#### `useWarehouses()` & `useZones(warehouseCode?)`
Warehouses aur zones fetch karne ke liye:
```typescript
const { warehouses, loading } = useWarehouses();
const { zones } = useZones('WH-MAIN-01');
```

### 4. Reusable Components

#### `ProductTable`
Products ko table format mein display karta hai:
```typescript
<ProductTable
  products={products}
  loading={loading}
  onStatusToggle={(id, status) => updateProductStatus(id, status)}
/>
```

#### `ProductFilters`
Search aur category filters:
```typescript
<ProductFilters
  search={search}
  onSearchChange={setSearch}
  categories={['Electronics', 'Furniture']}
  selectedCategory={category}
  onCategoryChange={setCategory}
/>
```

#### `StockTransactionForm`
Stock in/out record karne ke liye form:
```typescript
<StockTransactionForm
  type="in"
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

#### `StockTransactionList`
Transactions ko list format mein display karta hai:
```typescript
<StockTransactionList
  transactions={transactions}
  loading={loading}
/>
```

## Backend Integration

Abhi mock data use ho raha hai. Real API integrate karne ke liye:

1. `.env` file mein API URL add karo:
```env
VITE_API_URL=https://your-api.com/api
```

2. `src/services/api.ts` mein API calls already ready hain
3. Custom hooks automatically API service use karenge
4. Mock data ko comment out kar do hooks mein

## Example: New Page Banana

```typescript
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductTable from '@/components/inventory/ProductTable';
import ProductFilters from '@/components/inventory/ProductFilters';

export default function MyNewPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  
  const { products, loading, updateProductStatus } = useProducts(search, category || undefined);

  return (
    <div>
      <h1>My Page</h1>
      
      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        categories={['Electronics', 'Furniture']}
        selectedCategory={category}
        onCategoryChange={setCategory}
      />
      
      <ProductTable
        products={products}
        loading={loading}
        onStatusToggle={updateProductStatus}
      />
    </div>
  );
}
```

## Benefits

1. **Reusable Components** - Ek baar banao, kahin bhi use karo
2. **Easy API Integration** - Sirf `api.ts` mein changes karo
3. **Centralized Logic** - Business logic hooks mein hai
4. **Type Safety** - TypeScript types se errors kam honge
5. **Easy Testing** - Har component alag se test kar sakte ho
6. **Maintainable** - Code samajhna aur update karna easy hai
>>>>>>> origin/abhi-version
