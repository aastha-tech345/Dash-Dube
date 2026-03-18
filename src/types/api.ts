<<<<<<< HEAD
// Authentication Types
export interface LoginRequest {
  tenantId: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  roles: string[];
  modules: {
    id: number;
    name: string;
    key: string;
  }[];
}

// Product Types
export interface WareProductRequest {
  sku: string;
  name: string;
  barcode: string;
  barcodeImageUrl?: string;
  imageUrl?: string;
  description?: string;
  categoryId: number;
  subCategoryId?: number;
  brand?: string;
  model?: string;
  purchasePrice: number;
  salePrice: number;
  taxInclusive: boolean;
  batchTracking: boolean;
  serialTracking: boolean;
  expiryTracking: boolean;
  isActive: boolean;
  uomId: number;
  taxId?: number;
  locationId: number;
}

export interface WareProductResponse {
  id: number;
  sku: string;
  name: string;
  barcode: string;
  barcodeImageUrl?: string;
  imageUrl?: string;
  description?: string;
  categoryId: number;
  categoryName: string;
  subCategoryId?: number;
  subCategoryName?: string;
  brand?: string;
  model?: string;
  purchasePrice: number;
  salePrice: number;
  taxInclusive: boolean;
  batchTracking: boolean;
  serialTracking: boolean;
  expiryTracking: boolean;
  isActive: boolean;
  uomId: number;
  uomName: string;
  taxId?: number;
  taxName?: string;
  locationId: number;
  locationName: string;
  createdAt: string;
  updatedAt: string;
}

// Batch Types
export interface WareProductBatchRequest {
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  productId: number;
}

export interface WareProductBatchResponse {
  id: number;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  productId: number;
  productName: string;
  createdAt: string;
}

// Serial Types
export interface WareProductSerialRequest {
  serialNumber: string;
  batchId: number;
}

export interface WareProductSerialResponse {
  id: number;
  serialNumber: string;
  batchId: number;
  batchNumber: string;
  createdAt: string;
}

// Category Types
export interface WareCategoryRequest {
  name: string;
  description?: string;
}

export interface WareCategoryResponse {
  id: number;
  name: string;
  description?: string;
  subCategories?: WareSubCategoryResponse[];
}

export interface WareSubCategoryRequest {
  name: string;
  description?: string;
  categoryId: number;
}

export interface WareSubCategoryResponse {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  categoryName: string;
}

// Tax Types
export interface WareTaxRequest {
  name: string;
  percentage: number;
}

export interface WareTaxResponse {
  id: number;
  name: string;
  percentage: number;
}

// UoM Types
export interface UoMRequest {
  name: string;
  shortName: string;
}

export interface UoMResponse {
  id: number;
  name: string;
  shortName: string;
}

// Location Types
export interface LocationRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

export interface LocationResponse {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

// Warehouse Types
export interface WareHouseRequest {
  code: string;
  name: string;
  address: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  qcRequired: boolean;
  binTrackingEnabled: boolean;
  isActive: boolean;
  description?: string;
  warehouseType: 'NORMAL' | 'COLD_STORAGE' | 'BONDED' | 'DISTRIBUTION_CENTER';
  defaultPickStrategy: 'FIFO' | 'LIFO' | 'FEFO';
  allowNegativeStock: boolean;
  openTime?: string;
  closeTime?: string;
  latitude?: number;
  longitude?: number;
  totalCapacityWeight?: number;
  totalCapacityVolume?: number;
  locationId: number;
}

export interface WareHouseResponse {
  id: number;
  code: string;
  name: string;
  address: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  qcRequired: boolean;
  binTrackingEnabled: boolean;
  isActive: boolean;
  description?: string;
  warehouseType: string;
  defaultPickStrategy: string;
  allowNegativeStock: boolean;
  openTime?: string;
  closeTime?: string;
  latitude?: number;
  longitude?: number;
  totalCapacityWeight?: number;
  totalCapacityVolume?: number;
  locationId: number;
  locationName: string;
  zonesCount?: number; // Number of zones in this warehouse
}

// Floor Types
export interface FloorRequest {
  warehouseId: number;
  code: string;
  name: string;
  description?: string;
  levelNo: number;
  length?: number;
  width?: number;
  height?: number;
  accessType: 'NONE' | 'STAIRS' | 'ELEVATOR' | 'RAMP' | 'FORKLIFT_LIFT';
  temperatureControlled: boolean;
  minTemp?: number;
  maxTemp?: number;
  hazardousAllowed: boolean;
  restrictedAccess: boolean;
  isDefaultFloor: boolean;
  isActive: boolean;
}

export interface FloorResponse {
  id: number;
  warehouseId: number;
  warehouseName: string;
  code: string;
  name: string;
  description?: string;
  levelNo: number;
  length?: number;
  width?: number;
  height?: number;
  accessType: string;
  temperatureControlled: boolean;
  minTemp?: number;
  maxTemp?: number;
  hazardousAllowed: boolean;
  restrictedAccess: boolean;
  isDefaultFloor: boolean;
  isActive: boolean;
}

// Zone Types
export interface ZoneRequest {
  warehouseId: number;
  floorId: number;
  name: string;
  zoneType: 'STORAGE' | 'RECEIVING' | 'QC' | 'QUARANTINE' | 'DISPATCH' | 'RETURNS' | 'PRODUCTION_STAGING';
  pickPriority: number;
  putAwayPriority: number;
  fastMovingZone: boolean;
  temperatureControlled: boolean;
  minTemp?: number;
  maxTemp?: number;
  hazardous: boolean;
  hazardClass?: string;
  restrictedAccess: boolean;
  isActive: boolean;
  maxWeight?: number;
  maxVolume?: number;
  description?: string;
}

export interface ZoneResponse {
  id: number;
  warehouseId: number;
  warehouseName: string;
  floorId: number;
  floorName: string;
  name: string;
  zoneType: string;
  pickPriority: number;
  putAwayPriority: number;
  fastMovingZone: boolean;
  temperatureControlled: boolean;
  minTemp?: number;
  maxTemp?: number;
  hazardous: boolean;
  hazardClass?: string;
  restrictedAccess: boolean;
  isActive: boolean;
  maxWeight?: number;
  maxVolume?: number;
  description?: string;
}

// Rack Types
export interface RackRequest {
  zoneId: number;
  rackCode: string;
  barcodeTag?: string;
  rackType: 'STORAGE' | 'BULK_STORAGE' | 'PICK_FACE' | 'STAGING';
  aisle?: string;
  pickSequence: number;
  maxWeight?: number;
  maxVolume?: number;
  isActive: boolean;
  description?: string;
}

export interface RackResponse {
  id: number;
  zoneId: number;
  zoneName: string;
  rackCode: string;
  barcodeTag: string;
  barcodeImageUrl?: string;
  rackType: string;
  aisle?: string;
  pickSequence: number;
  maxWeight?: number;
  maxVolume?: number;
  isActive: boolean;
  description?: string;
}

// Shelf Types
export interface ShelfRequest {
  rackId: number;
  shelfCode: string;
  barcodeTag?: string;
  levelNo: number;
  pickSequence: number;
  maxWeight?: number;
  maxVolume?: number;
  isActive: boolean;
  description?: string;
}

export interface ShelfResponse {
  id: number;
  rackId: number;
  rackCode: string;
  shelfCode: string;
  barcodeTag: string;
  barcodeImageUrl?: string;
  levelNo: number;
  pickSequence: number;
  maxWeight?: number;
  maxVolume?: number;
  isActive: boolean;
  description?: string;
}

// Bin Types
export interface BinRequest {
  shelfId: number;
  warehouseId: number;
  binCode: string;
  barcodeTag?: string;
  binType: 'STORAGE' | 'RECEIVING' | 'QC' | 'QUARANTINE' | 'DISPATCH' | 'DAMAGE' | 'RETURNS';
  capacityQty: number;
  capacityWeight?: number;
  capacityVolume?: number;
  isActive: boolean;
  blocked: boolean;
  blockReason?: string;
  pickSequence: number;
  hazardousAllowed: boolean;
  minTemp?: number;
  maxTemp?: number;
  description?: string;
}

export interface BinResponse {
  id: number;
  shelfId: number;
  shelfCode: string;
  warehouseId: number;
  warehouseName: string;
  binCode: string;
  barcodeTag: string;
  barcodeImageUrl?: string;
  binType: string;
  isActive: boolean;
  blocked: boolean;
  blockReason?: string;
  capacityQty: number;
  capacityWeight?: number;
  capacityVolume?: number;
  pickSequence: number;
  hazardousAllowed: boolean;
  minTemp?: number;
  maxTemp?: number;
  description?: string;
}

// Inventory Movement Types
export interface InventoryMovementRequest {
  movementNo: string;
  type: 'INWARD' | 'OUTWARD' | 'TRANSFER' | 'ADJUSTMENT' | 'PRODUCTION_ISSUE' | 'PRODUCTION_RECEIPT' | 
        'INBOUND_RECEIPT' | 'QC_ACCEPT' | 'QC_REJECT' | 'QC_HOLD' | 'PUT_AWAY' | 'PICK' | 'PACK' | 
        'DISPATCH' | 'TRANSFER_DISPATCH' | 'TRANSFER_RECEIVE' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'SCRAP';
  status: 'AVAILABLE' | 'UNDER_QC' | 'HOLD' | 'DAMAGED' | 'EXPIRED' | 'TRANSIT' | 'RESERVED' | 
          'ON_HOLD' | 'QUARANTINE' | 'ALLOCATED' | 'COMMITTED' | 'REJECTED';
  previousStatus?: string;
  newStatus?: string;
  productId?: number;
  rawMaterialId?: number;
  semifinishedId?: number;
  finishedGoodId?: number;
  batchId?: number;
  serialId?: number;
  warehouseId: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  binId?: number;
  sourceBinId?: number;
  destinationBinId?: number;
  uomId: number;
  quantity: number;
  qtyBefore?: number;
  qtyAfter?: number;
  unitCost?: number;
  totalCost?: number;
  referenceType?: string;
  referenceId?: number;
  remarks?: string;
  createdBy?: number;
  approvedBy?: number;
  movementAt?: string;
  deviceId?: string;
  clientTime?: string;
  syncStatus?: 'PENDING_SYNC' | 'SYNCED';
}

export interface InventoryMovementResponse {
  id: number;
  movementNo: string;
  type: string;
  status: string;
  previousStatus?: string;
  newStatus?: string;
  productId?: number;
  productName?: string;
  rawMaterialId?: number;
  rawMaterialName?: string;
  semifinishedId?: number;
  semifinishedName?: string;
  finishedGoodId?: number;
  finishedGoodName?: string;
  batchId?: number;
  batchNumber?: string;
  serialId?: number;
  serialNumber?: string;
  warehouseId: number;
  warehouseName: string;
  sourceWarehouseId?: number;
  sourceWarehouseName?: string;
  destinationWarehouseId?: number;
  destinationWarehouseName?: string;
  binId?: number;
  binCode?: string;
  sourceBinId?: number;
  sourceBinCode?: string;
  destinationBinId?: number;
  destinationBinCode?: string;
  uomId: number;
  uomName: string;
  quantity: number;
  qtyBefore?: number;
  qtyAfter?: number;
  unitCost?: number;
  totalCost?: number;
  referenceType?: string;
  referenceId?: number;
  remarks?: string;
  createdBy?: number;
  approvedBy?: number;
  movementAt?: string;
  createdAt: string;
  approvedAt?: string;
  deviceId?: string;
  clientTime?: string;
  syncStatus?: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
// Authentication Types
export interface LoginRequest {
  tenantId: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  roles: string[];
  modules: {
    id: number;
    name: string;
    key: string;
  }[];
}

// Product Types
export interface WareProductRequest {
  sku: string;
  name: string;
  barcode: string;
  barcodeImageUrl?: string;
  imageUrl?: string;
  description?: string;
  categoryId: number;
  subCategoryId?: number;
  brand?: string;
  model?: string;
  purchasePrice: number;
  salePrice: number;
  taxInclusive: boolean;
  batchTracking: boolean;
  serialTracking: boolean;
  expiryTracking: boolean;
  isActive: boolean;
  uomId: number;
  taxId?: number;
  locationId: number;
}

export interface WareProductResponse {
  id: number;
  sku: string;
  name: string;
  barcode: string;
  barcodeImageUrl?: string;
  imageUrl?: string;
  description?: string;
  categoryId: number;
  categoryName: string;
  subCategoryId?: number;
  subCategoryName?: string;
  brand?: string;
  model?: string;
  purchasePrice: number;
  salePrice: number;
  taxInclusive: boolean;
  batchTracking: boolean;
  serialTracking: boolean;
  expiryTracking: boolean;
  isActive: boolean;
  uomId: number;
  uomName: string;
  taxId?: number;
  taxName?: string;
  locationId: number;
  locationName: string;
  createdAt: string;
  updatedAt: string;
}

// Batch Types
export interface WareProductBatchRequest {
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  productId: number;
}

export interface WareProductBatchResponse {
  id: number;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  productId: number;
  productName: string;
  createdAt: string;
}

// Serial Types
export interface WareProductSerialRequest {
  serialNumber: string;
  batchId: number;
}

export interface WareProductSerialResponse {
  id: number;
  serialNumber: string;
  batchId: number;
  batchNumber: string;
  createdAt: string;
}

// Category Types
export interface WareCategoryRequest {
  name: string;
  description?: string;
}

export interface WareCategoryResponse {
  id: number;
  name: string;
  description?: string;
  subCategories?: WareSubCategoryResponse[];
}

export interface WareSubCategoryRequest {
  name: string;
  description?: string;
  categoryId: number;
}

export interface WareSubCategoryResponse {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  categoryName: string;
}

// Tax Types
export interface WareTaxRequest {
  name: string;
  percentage: number;
}

export interface WareTaxResponse {
  id: number;
  name: string;
  percentage: number;
}

// UoM Types
export interface UoMRequest {
  name: string;
  shortName: string;
}

export interface UoMResponse {
  id: number;
  name: string;
  shortName: string;
}

// Location Types
export interface LocationRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

export interface LocationResponse {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

// Warehouse Types
export interface WareHouseRequest {
  code: string;
  name: string;
  address: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  qcRequired: boolean;
  binTrackingEnabled: boolean;
  isActive: boolean;
  description?: string;
  warehouseType: 'NORMAL' | 'COLD_STORAGE' | 'BONDED' | 'DISTRIBUTION_CENTER';
  defaultPickStrategy: 'FIFO' | 'LIFO' | 'FEFO';
  allowNegativeStock: boolean;
  openTime?: string;
  closeTime?: string;
  latitude?: number;
  longitude?: number;
  totalCapacityWeight?: number;
  totalCapacityVolume?: number;
  locationId: number;
}

export interface WareHouseResponse {
  id: number;
  code: string;
  name: string;
  address: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  qcRequired: boolean;
  binTrackingEnabled: boolean;
  isActive: boolean;
  description?: string;
  warehouseType: string;
  defaultPickStrategy: string;
  allowNegativeStock: boolean;
  openTime?: string;
  closeTime?: string;
  latitude?: number;
  longitude?: number;
  totalCapacityWeight?: number;
  totalCapacityVolume?: number;
  locationId: number;
  locationName: string;
  zonesCount?: number; // Number of zones in this warehouse
}

// Floor Types
export interface FloorRequest {
  warehouseId: number;
  code: string;
  name: string;
  description?: string;
  levelNo: number;
  length?: number;
  width?: number;
  height?: number;
  accessType: 'NONE' | 'STAIRS' | 'ELEVATOR' | 'RAMP' | 'FORKLIFT_LIFT';
  temperatureControlled: boolean;
  minTemp?: number;
  maxTemp?: number;
  hazardousAllowed: boolean;
  restrictedAccess: boolean;
  isDefaultFloor: boolean;
  isActive: boolean;
}

export interface FloorResponse {
  id: number;
  warehouseId: number;
  warehouseName: string;
  code: string;
  name: string;
  description?: string;
  levelNo: number;
  length?: number;
  width?: number;
  height?: number;
  accessType: string;
  temperatureControlled: boolean;
  minTemp?: number;
  maxTemp?: number;
  hazardousAllowed: boolean;
  restrictedAccess: boolean;
  isDefaultFloor: boolean;
  isActive: boolean;
}

// Zone Types
export interface ZoneRequest {
  warehouseId: number;
  floorId: number;
  name: string;
  zoneType: 'STORAGE' | 'RECEIVING' | 'QC' | 'QUARANTINE' | 'DISPATCH' | 'RETURNS' | 'PRODUCTION_STAGING';
  pickPriority: number;
  putAwayPriority: number;
  fastMovingZone: boolean;
  temperatureControlled: boolean;
  minTemp?: number;
  maxTemp?: number;
  hazardous: boolean;
  hazardClass?: string;
  restrictedAccess: boolean;
  isActive: boolean;
  maxWeight?: number;
  maxVolume?: number;
  description?: string;
}

export interface ZoneResponse {
  id: number;
  warehouseId: number;
  warehouseName: string;
  floorId: number;
  floorName: string;
  name: string;
  zoneType: string;
  pickPriority: number;
  putAwayPriority: number;
  fastMovingZone: boolean;
  temperatureControlled: boolean;
  minTemp?: number;
  maxTemp?: number;
  hazardous: boolean;
  hazardClass?: string;
  restrictedAccess: boolean;
  isActive: boolean;
  maxWeight?: number;
  maxVolume?: number;
  description?: string;
}

// Rack Types
export interface RackRequest {
  zoneId: number;
  rackCode: string;
  barcodeTag?: string;
  rackType: 'STORAGE' | 'BULK_STORAGE' | 'PICK_FACE' | 'STAGING';
  aisle?: string;
  pickSequence: number;
  maxWeight?: number;
  maxVolume?: number;
  isActive: boolean;
  description?: string;
}

export interface RackResponse {
  id: number;
  zoneId: number;
  zoneName: string;
  rackCode: string;
  barcodeTag: string;
  barcodeImageUrl?: string;
  rackType: string;
  aisle?: string;
  pickSequence: number;
  maxWeight?: number;
  maxVolume?: number;
  isActive: boolean;
  description?: string;
}

// Shelf Types
export interface ShelfRequest {
  rackId: number;
  shelfCode: string;
  barcodeTag?: string;
  levelNo: number;
  pickSequence: number;
  maxWeight?: number;
  maxVolume?: number;
  isActive: boolean;
  description?: string;
}

export interface ShelfResponse {
  id: number;
  rackId: number;
  rackCode: string;
  shelfCode: string;
  barcodeTag: string;
  barcodeImageUrl?: string;
  levelNo: number;
  pickSequence: number;
  maxWeight?: number;
  maxVolume?: number;
  isActive: boolean;
  description?: string;
}

// Bin Types
export interface BinRequest {
  shelfId: number;
  warehouseId: number;
  binCode: string;
  barcodeTag?: string;
  binType: 'STORAGE' | 'RECEIVING' | 'QC' | 'QUARANTINE' | 'DISPATCH' | 'DAMAGE' | 'RETURNS';
  capacityQty: number;
  capacityWeight?: number;
  capacityVolume?: number;
  isActive: boolean;
  blocked: boolean;
  blockReason?: string;
  pickSequence: number;
  hazardousAllowed: boolean;
  minTemp?: number;
  maxTemp?: number;
  description?: string;
}

export interface BinResponse {
  id: number;
  shelfId: number;
  shelfCode: string;
  warehouseId: number;
  warehouseName: string;
  binCode: string;
  barcodeTag: string;
  barcodeImageUrl?: string;
  binType: string;
  isActive: boolean;
  blocked: boolean;
  blockReason?: string;
  capacityQty: number;
  capacityWeight?: number;
  capacityVolume?: number;
  pickSequence: number;
  hazardousAllowed: boolean;
  minTemp?: number;
  maxTemp?: number;
  description?: string;
}

// Inventory Movement Types
export interface InventoryMovementRequest {
  movementNo: string;
  type: 'INWARD' | 'OUTWARD' | 'TRANSFER' | 'ADJUSTMENT' | 'PRODUCTION_ISSUE' | 'PRODUCTION_RECEIPT' | 
        'INBOUND_RECEIPT' | 'QC_ACCEPT' | 'QC_REJECT' | 'QC_HOLD' | 'PUT_AWAY' | 'PICK' | 'PACK' | 
        'DISPATCH' | 'TRANSFER_DISPATCH' | 'TRANSFER_RECEIVE' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'SCRAP';
  status: 'AVAILABLE' | 'UNDER_QC' | 'HOLD' | 'DAMAGED' | 'EXPIRED' | 'TRANSIT' | 'RESERVED' | 
          'ON_HOLD' | 'QUARANTINE' | 'ALLOCATED' | 'COMMITTED' | 'REJECTED';
  previousStatus?: string;
  newStatus?: string;
  productId?: number;
  rawMaterialId?: number;
  semifinishedId?: number;
  finishedGoodId?: number;
  batchId?: number;
  serialId?: number;
  warehouseId: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  binId?: number;
  sourceBinId?: number;
  destinationBinId?: number;
  uomId: number;
  quantity: number;
  qtyBefore?: number;
  qtyAfter?: number;
  unitCost?: number;
  totalCost?: number;
  referenceType?: string;
  referenceId?: number;
  remarks?: string;
  createdBy?: number;
  approvedBy?: number;
  movementAt?: string;
  deviceId?: string;
  clientTime?: string;
  syncStatus?: 'PENDING_SYNC' | 'SYNCED';
}

export interface InventoryMovementResponse {
  id: number;
  movementNo: string;
  type: string;
  status: string;
  previousStatus?: string;
  newStatus?: string;
  productId?: number;
  productName?: string;
  rawMaterialId?: number;
  rawMaterialName?: string;
  semifinishedId?: number;
  semifinishedName?: string;
  finishedGoodId?: number;
  finishedGoodName?: string;
  batchId?: number;
  batchNumber?: string;
  serialId?: number;
  serialNumber?: string;
  warehouseId: number;
  warehouseName: string;
  sourceWarehouseId?: number;
  sourceWarehouseName?: string;
  destinationWarehouseId?: number;
  destinationWarehouseName?: string;
  binId?: number;
  binCode?: string;
  sourceBinId?: number;
  sourceBinCode?: string;
  destinationBinId?: number;
  destinationBinCode?: string;
  uomId: number;
  uomName: string;
  quantity: number;
  qtyBefore?: number;
  qtyAfter?: number;
  unitCost?: number;
  totalCost?: number;
  referenceType?: string;
  referenceId?: number;
  remarks?: string;
  createdBy?: number;
  approvedBy?: number;
  movementAt?: string;
  createdAt: string;
  approvedAt?: string;
  deviceId?: string;
  clientTime?: string;
  syncStatus?: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
>>>>>>> origin/abhi-version
