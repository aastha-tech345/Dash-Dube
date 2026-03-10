# API Integration Guide

## Setup

### 1. Environment Configuration

Create `.env` file in project root:

```env
VITE_API_URL=http://localhost:8080
```

### 2. Authentication

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        tenantId: 'your-tenant-id',
        email: 'user@example.com',
        password: 'password123'
      });
      // Token automatically saved and used in all API calls
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

## Using Hooks

### Products

```typescript
import { useWarehouseProducts } from '@/hooks/useWarehouseProducts';

function ProductsPage() {
  const { products, loading, error, createProduct, updateProduct, deleteProduct } = useWarehouseProducts();

  // Create new product
  const handleCreate = async () => {
    await createProduct({
      sku: 'SKU-001',
      name: 'Product Name',
      barcode: '1234567890',
      categoryId: 1,
      purchasePrice: 100,
      salePrice: 150,
      taxInclusive: true,
      batchTracking: false,
      serialTracking: false,
      expiryTracking: false,
      isActive: true,
      uomId: 1,
      locationId: 1
    });
  };

  // Update product
  const handleUpdate = async (id: number) => {
    await updateProduct(id, {
      // ... product data
    });
  };

  // Delete product
  const handleDelete = async (id: number) => {
    await deleteProduct(id);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Warehouses

```typescript
import { useWarehouses } from '@/hooks/useWarehouseData';

function WarehousesPage() {
  const { warehouses, loading, error } = useWarehouses();

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {warehouses.map(wh => (
        <div key={wh.id}>
          {wh.name} - {wh.code}
        </div>
      ))}
    </div>
  );
}
```

### Floors, Zones, Racks, Shelves, Bins

```typescript
import { useFloors, useZones, useRacks, useShelves, useBins } from '@/hooks/useWarehouseData';

function InfrastructurePage() {
  const { floors } = useFloors(warehouseId); // Optional warehouseId filter
  const { zones } = useZones();
  const { racks } = useRacks();
  const { shelves } = useShelves();
  const { bins } = useBins();

  // Use the data...
}
```

### Inventory Movements

```typescript
import { useInventoryMovements } from '@/hooks/useInventoryMovements';

function StockInPage() {
  const { movements, loading, createMovement } = useInventoryMovements();

  const handleStockIn = async () => {
    await createMovement({
      movementNo: 'MOV-001',
      type: 'INWARD',
      status: 'AVAILABLE',
      productId: 1,
      warehouseId: 1,
      binId: 1,
      uomId: 1,
      quantity: 100,
      unitCost: 50,
      totalCost: 5000,
      referenceType: 'PO',
      referenceId: 123,
      remarks: 'Stock received from supplier'
    });
  };

  return <button onClick={handleStockIn}>Record Stock In</button>;
}
```

## Direct API Calls

If you need more control, use the API service directly:

```typescript
import { warehouseApi } from '@/services/warehouseApi';

// Get products with pagination
const result = await warehouseApi.getProductsPaginated(0, 20, 'name,asc');

// Get product by barcode
const product = await warehouseApi.getProductByBarcode('1234567890');

// Get warehouse by code
const warehouse = await warehouseApi.getWarehouseByCode('WH-001');

// Get bins by type
const storageBins = await warehouseApi.getBinsByType('STORAGE');

// Get inventory movements by status
const availableStock = await warehouseApi.getInventoryMovementsByStatus('AVAILABLE');
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Login and get JWT token

### Products
- `GET /api/warehouse/products` - Get all products
- `GET /api/warehouse/products/paginated` - Get paginated products
- `GET /api/warehouse/products/{id}` - Get product by ID
- `GET /api/warehouse/products/barcode/{barcode}` - Get product by barcode
- `POST /api/warehouse/products` - Create product
- `PUT /api/warehouse/products/{id}` - Update product
- `DELETE /api/warehouse/products/{id}` - Delete product

### Batches
- `GET /api/warehouse/batches/product/{productId}` - Get batches by product
- `POST /api/warehouse/batches` - Create batch
- `PUT /api/warehouse/batches/{id}` - Update batch
- `DELETE /api/warehouse/batches/{id}` - Delete batch

### Serials
- `GET /api/warehouse/serials/{serial}` - Get serial by number
- `POST /api/warehouse/serials` - Create serial
- `PUT /api/warehouse/serials/{id}` - Update serial
- `DELETE /api/warehouse/serials/{id}` - Delete serial

### Categories & Sub-Categories
- `GET /api/warehouse/categories` - Get all categories
- `POST /api/warehouse/categories` - Create category
- `GET /api/warehouse/subcategories?categoryId={id}` - Get sub-categories
- `POST /api/warehouse/subcategories` - Create sub-category

### Taxes & UoM
- `GET /api/warehouse/taxes` - Get all taxes
- `POST /api/warehouse/taxes` - Create tax
- `GET /api/warehouse/uom` - Get all UoMs
- `POST /api/warehouse/uom` - Create UoM

### Locations
- `GET /api/locations` - Get all locations
- `POST /api/locations` - Create location

### Warehouses
- `GET /api/warehouse/warehouses` - Get all warehouses
- `GET /api/warehouse/warehouses/{id}` - Get warehouse by ID
- `GET /api/warehouse/warehouses/code/{code}` - Get warehouse by code
- `GET /api/warehouse/warehouses/status?isActive={bool}` - Get by status
- `POST /api/warehouse/warehouses` - Create warehouse
- `PUT /api/warehouse/warehouses/{id}` - Update warehouse
- `DELETE /api/warehouse/warehouses/{id}` - Delete warehouse

### Floors
- `GET /api/warehouse/floors` - Get all floors
- `GET /api/warehouse/floors/warehouse/{warehouseId}` - Get floors by warehouse
- `POST /api/warehouse/floors` - Create floor
- `PUT /api/warehouse/floors/{id}` - Update floor
- `DELETE /api/warehouse/floors/{id}` - Delete floor

### Zones
- `GET /api/warehouse/zones` - Get all zones
- `GET /api/warehouse/zones/type/{type}` - Get zones by type
- `POST /api/warehouse/zones` - Create zone
- `PUT /api/warehouse/zones/{id}` - Update zone
- `DELETE /api/warehouse/zones/{id}` - Delete zone

### Racks
- `GET /api/warehouse/racks` - Get all racks
- `GET /api/warehouse/racks/barcode/{barcode}` - Get rack by barcode
- `POST /api/warehouse/racks` - Create rack
- `PUT /api/warehouse/racks/{id}` - Update rack
- `DELETE /api/warehouse/racks/{id}` - Delete rack

### Shelves
- `GET /api/warehouse/shelves` - Get all shelves
- `GET /api/warehouse/shelves/barcode/{barcode}` - Get shelf by barcode
- `POST /api/warehouse/shelves` - Create shelf
- `PUT /api/warehouse/shelves/{id}` - Update shelf
- `DELETE /api/warehouse/shelves/{id}` - Delete shelf

### Bins
- `GET /api/warehouse/bins` - Get all bins
- `GET /api/warehouse/bins/paginated` - Get paginated bins
- `GET /api/warehouse/bins/type/{type}` - Get bins by type
- `GET /api/warehouse/bins/barcode/{barcode}` - Get bin by barcode
- `POST /api/warehouse/bins` - Create bin
- `PUT /api/warehouse/bins/{id}` - Update bin
- `DELETE /api/warehouse/bins/{id}` - Delete bin

### Inventory Movements
- `GET /api/warehouse/inventory-movements` - Get all movements
- `GET /api/warehouse/inventory-movements/warehouse/{id}` - Get by warehouse
- `GET /api/warehouse/inventory-movements/status/{status}` - Get by status
- `POST /api/warehouse/inventory-movements` - Create movement
- `PATCH /api/warehouse/inventory-movements/{id}/quantity?quantity={qty}` - Update quantity
- `DELETE /api/warehouse/inventory-movements/{id}` - Delete movement

## Error Handling

```typescript
try {
  const product = await warehouseApi.getProductById(123);
} catch (error) {
  if (error instanceof Error) {
    console.error('API Error:', error.message);
    // Show error to user
  }
}
```

## Types

All TypeScript types are available in `src/types/api.ts`:

- `WareProductRequest` / `WareProductResponse`
- `WareHouseRequest` / `WareHouseResponse`
- `FloorRequest` / `FloorResponse`
- `ZoneRequest` / `ZoneResponse`
- `RackRequest` / `RackResponse`
- `ShelfRequest` / `ShelfResponse`
- `BinRequest` / `BinResponse`
- `InventoryMovementRequest` / `InventoryMovementResponse`
- And many more...

## Best Practices

1. Always use hooks for component-level data fetching
2. Use direct API calls for one-off operations
3. Handle loading and error states
4. Token is automatically included in all requests after login
5. Use TypeScript types for type safety
