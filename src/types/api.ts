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
export type ProductSourceType = 'STANDALONE' | 'CRM_PRODUCT' | 'RAW_MATERIAL' | 'SEMIFINISHED' | 'FINISHED_GOOD';

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
  // Source linking
  sourceType: ProductSourceType;
  warehouseId?: number;
  crmProductId?: number;
  rawMaterialId?: number;
  semifinishedId?: number;
  finishedGoodId?: number;
  // Stock levels
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  stockQuantity?: number;
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
  sourceType?: ProductSourceType;
  warehouseId?: number;
  warehouseName?: string;
  crmProductId?: number;
  rawMaterialId?: number;
  semifinishedId?: number;
  finishedGoodId?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  stockQuantity?: number;
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
  warehouseType: 'NORMAL' | 'COLD_STORAGE' | 'HAZMAT' | 'PRODUCTION' | 'RETAIL_STORE' | 'BONDED' | 'DISTRIBUTION_CENTER';
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
        'SALES_DISPATCH' | 'TRANSFER_DISPATCH' | 'TRANSFER_RECEIVE' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'SCRAP' |
        'STOCK_ADJUSTMENT';
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

// ─── Transfer Order Types ───────────────────────────────────────────────────
export type TransferStatus = 'DRAFT' | 'APPROVED' | 'DISPATCHED' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';

export interface TransferItemRequest {
  productId: number;
  batchId?: number;
  requestedQty: number;
  sourceBinId?: number;
  destinationBinId?: number;
  remarks?: string;
}

export interface TransferOrderRequest {
  sourceWarehouseId: number;
  destinationWarehouseId: number;
  requestedDate: string;
  remarks?: string;
  items: TransferItemRequest[];
}

export interface TransferDispatchItem {
  productId: number;
  batchId?: number;
  dispatchedQty: number;
  sourceBinId?: number;
  remarks?: string;
}

export interface TransferReceiveItem {
  productId: number;
  batchId?: number;
  receivedQty: number;
  destinationBinId?: number;
  remarks?: string;
}

export interface TransferOrderResponse {
  id: number;
  sourceWarehouseId: number;
  sourceWarehouseName: string;
  destinationWarehouseId: number;
  destinationWarehouseName: string;
  requestedDate: string;
  status: TransferStatus;
  remarks?: string;
  items: TransferItemResponse[];
  createdAt: string;
}

export interface TransferItemResponse {
  id: number;
  productId: number;
  productName: string;
  batchId?: number;
  batchNumber?: string;
  requestedQty: number;
  dispatchedQty?: number;
  receivedQty?: number;
  sourceBinId?: number;
  sourceBinCode?: string;
  destinationBinId?: number;
  destinationBinCode?: string;
  remarks?: string;
}

// ─── Stock Alert Types ───────────────────────────────────────────────────────
export interface StockAlertResponse {
  productId: number;
  productName: string;
  sku: string;
  warehouseId: number;
  warehouseName: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  alertType: 'LOW_STOCK' | 'OVERSTOCK' | 'EXPIRY_SOON';
  expiryDate?: string;
  batchNumber?: string;
}

// ─── Costing Types ───────────────────────────────────────────────────────────
export interface CostingSummaryResponse {
  productId: number;
  productName: string;
  sku: string;
  warehouseId?: number;
  warehouseName?: string;
  totalQuantity: number;
  averageCost: number;
  totalValue: number;
  lastMovementAt?: string;
}

// ─── Dashboard Types ─────────────────────────────────────────────────────────
export interface DashboardStatsResponse {
  totalProducts: number;
  totalWarehouses: number;
  totalStockValue: number;
  lowStockCount: number;
  overstockCount: number;
  pendingTransfers: number;
  todayMovements: number;
  recentMovements?: InventoryMovementResponse[];
}

// ─── Report Types ────────────────────────────────────────────────────────────
export interface StockLedgerEntry {
  movementId: number;
  movementNo: string;
  type: string;
  quantity: number;
  qtyBefore: number;
  qtyAfter: number;
  unitCost?: number;
  totalCost?: number;
  referenceType?: string;
  referenceId?: number;
  warehouseName: string;
  binCode?: string;
  remarks?: string;
  movementAt: string;
}

export interface StockValuationEntry {
  productId: number;
  productName: string;
  sku: string;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  averageCost: number;
  totalValue: number;
}

// ─── Fleet Types ─────────────────────────────────────────────────────────────
export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'ON_LEAVE';
export type LicenseType = 'LMV' | 'HMV' | 'HPMV' | 'TRANS';

export interface DriverRequest {
  employeeCode: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  joiningDate?: string;
  emergencyContact?: string;
  licenseNumber: string;
  licenseType: LicenseType;
  licenseExpiry: string;
  status: DriverStatus;
  assignedVehicleId?: number;
  notes?: string;
}

export interface DriverResponse {
  id: number;
  employeeCode: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  joiningDate?: string;
  emergencyContact?: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiry: string;
  status: DriverStatus;
  assignedVehicleId?: number;
  assignedVehiclePlate?: string;
  profileImageUrl?: string;
  notes?: string;
  createdAt: string;
}

export type VehicleType = 'TRUCK' | 'VAN' | 'BIKE' | 'CAR' | 'TEMPO';
export type FuelType = 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC';

export interface VehicleRequest {
  plateNumber: string;
  vehicleType: VehicleType;
  make: string;
  model: string;
  year: number;
  color?: string;
  vinNumber?: string;
  fuelType: FuelType;
  capacityWeight?: number;
  capacityVolume?: number;
  odometerReading?: number;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  registrationExpiry?: string;
  assignedDriverId?: number;
  notes?: string;
}

export interface VehicleResponse {
  id: number;
  plateNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  vinNumber?: string;
  fuelType: string;
  capacityWeight?: number;
  capacityVolume?: number;
  odometerReading?: number;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  registrationExpiry?: string;
  assignedDriverId?: number;
  assignedDriverName?: string;
  notes?: string;
  createdAt: string;
}

export interface RouteStop {
  deliveryOrderId: number;
  stopOrder: number;
  customerName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  estimatedArrival?: string;
}

export interface RouteStopResponse {
  id: number;
  deliveryOrderId: number;
  stopOrder: number;
  customerName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  estimatedArrival?: string;
  status: 'PENDING' | 'ARRIVED' | 'COMPLETED';
  arrivedAt?: string;
  completedAt?: string;
}

export interface RouteRequest {
  routeName: string;
  driverId: number;
  vehicleId: number;
  routeDate: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalDistanceKm?: number;
  estimatedDurationMins?: number;
  stops: RouteStop[];
}

export interface RouteResponse {
  id: number;
  routeName: string;
  driverId: number;
  driverName: string;
  vehicleId: number;
  vehiclePlateNumber: string;
  routeDate: string;
  status: string;
  totalDistanceKm?: number;
  estimatedDurationMins?: number;
  stops: RouteStopResponse[];
  createdAt: string;
}

// ─── Sales / Delivery Order Types ────────────────────────────────────────────
export type DeliveryOrderStatus =
  | 'DRAFT' | 'CONFIRMED' | 'PICKING' | 'PACKED'
  | 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface DeliveryOrderItem {
  crmProductId?: number;
  productId?: number;
  itemCode?: string;
  itemName?: string;
  categoryId?: number;
  subcategoryId?: number;
  quantity: number;
  unitPrice: number;
  taxPercentage?: number;
  taxValue?: number;
  taxExempt?: boolean;
}

export interface DeliveryOrderRequest {
  deliveryOrderDate: string;
  shipmentDate?: string;
  customerId: number;
  salesOrderId?: number;
  reference?: string;
  poNumber?: string;
  salespersonId?: number;
  warehouseId: number;
  status: DeliveryOrderStatus;
  totalDiscount?: number;
  otherCharges?: number;
  termsAndConditions?: string;
  notes?: string;
  emailTo?: string;
  template?: string;
  routeNotes?: string;
  driverId?: number;
  vehicleId?: number;
  items: DeliveryOrderItem[];
}

export interface DeliveryOrderResponse {
  id: number;
  deliveryOrderNumber: string;
  deliveryOrderDate: string;
  shipmentDate?: string;
  customerId: number;
  customerName: string;
  salesOrderId?: number;
  reference?: string;
  poNumber?: string;
  salespersonId?: number;
  salespersonName?: string;
  warehouseId: number;
  warehouseName: string;
  status: DeliveryOrderStatus;
  totalDiscount?: number;
  otherCharges?: number;
  netTotal?: number;
  notes?: string;
  routeNotes?: string;
  driverId?: number;
  driverName?: string;
  vehicleId?: number;
  vehiclePlateNumber?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  items: DeliveryOrderItemResponse[];
  createdAt: string;
}

export interface DeliveryOrderItemResponse {
  id: number;
  productId?: number;
  productName?: string;
  itemCode?: string;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxPercentage?: number;
  taxValue?: number;
}

// ─── POD Types ───────────────────────────────────────────────────────────────
export type PODStatus = 'DELIVERED' | 'PARTIAL' | 'REJECTED';

export interface PODRequest {
  status: PODStatus;
  receivedByName: string;
  receivedByPhone?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  remarks?: string;
  rejectionReason?: string;
}

export interface PODResponse {
  id: number;
  deliveryOrderId: number;
  status: PODStatus;
  receivedByName: string;
  receivedByPhone?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  remarks?: string;
  rejectionReason?: string;
  signatureUrl?: string;
  photoUrl?: string;
  createdAt: string;
}

// ─── CRM Sales Product Types ──────────────────────────────────────────────────
export type CrmItemType = 'PRODUCT' | 'SERVICE';

export interface CrmSalesProductRequest {
  itemType: CrmItemType;
  isPurchase: boolean;
  isSales: boolean;
  itemCode: string;
  name: string;
  description?: string;
  unitOfMeasure?: string;
  reorderLimit?: number;
  vatClassificationCode?: string;
  purchasePrice: number;
  salesPrice: number;
  tax?: string;
  taxRate?: number;
}

export interface CrmSalesProductResponse {
  id: number;
  itemType: CrmItemType;
  isPurchase: boolean;
  isSales: boolean;
  itemCode: string;
  name: string;
  description?: string;
  unitOfMeasure?: string;
  reorderLimit?: number;
  vatClassificationCode?: string;
  purchasePrice: number;
  salesPrice: number;
  tax?: string;
  taxRate?: number;
  imageUrl?: string;
  createdAt: string;
}

// ─── Production — Raw Material Types ─────────────────────────────────────────
export interface RawMaterialRequest {
  itemCode: string;
  name: string;
  itemType: 'PRODUCT' | 'SERVICE';
  forPurchase: boolean;
  forSales: boolean;
  categoryId?: number;
  subCategoryId?: number;
  barcode?: string;
  description?: string;
  issueUnitId?: number;
  purchaseUnitId?: number;
  unitRelation?: number;
  reorderLimit?: number;
  taxId?: number;
  purchasePrice: number;
  salesPrice?: number;
  stockQuantity?: number;
  discontinued?: boolean;
}

export interface RawMaterialResponse {
  id: number;
  itemCode: string;
  name: string;
  itemType: string;
  forPurchase: boolean;
  forSales: boolean;
  categoryId?: number;
  categoryName?: string;
  subCategoryId?: number;
  subCategoryName?: string;
  barcode?: string;
  description?: string;
  issueUnitId?: number;
  purchaseUnitId?: number;
  unitRelation?: number;
  reorderLimit?: number;
  taxId?: number;
  tax?: number;          // backend may return as "tax" instead of "taxId"
  taxCode?: string;
  taxName?: string;
  taxRate?: number;
  purchasePrice: number;
  salesPrice?: number;
  stockQuantity: number;
  discontinued: boolean;
  imageUrl?: string;
  createdAt: string;
}

// ─── Production — Semi-Finished Types ────────────────────────────────────────
export interface SemiFinishedRequest {
  itemCode: string;
  name: string;
  itemType: 'PRODUCT' | 'SERVICE';
  forPurchase: boolean;
  forSales: boolean;
  isRoll?: boolean;
  isScrapItem?: boolean;
  categoryId?: number;
  subCategoryId?: number;
  barcode?: string;
  description?: string;
  issueUnitId?: number;
  purchaseUnitId?: number;
  unitRelation?: number;
  wastagePercentage?: number;
  reorderLimit?: number;
  stockQuantity?: number;
  taxId?: number;
  isTaxInclusive?: boolean;
  purchasePrice: number;
  salesPrice?: number;
}

export interface SemiFinishedResponse {
  id: number;
  itemCode: string;
  name: string;
  itemType: string;
  forPurchase: boolean;
  forSales: boolean;
  isRoll: boolean;
  roll?: boolean;          // backend may return as "roll" instead of "isRoll"
  isScrapItem: boolean;
  scrapItem?: boolean;     // backend may return as "scrapItem" instead of "isScrapItem"
  categoryId?: number;
  categoryName?: string;
  subCategoryId?: number;
  subCategoryName?: string;
  barcode?: string;
  description?: string;
  issueUnitId?: number;
  purchaseUnitId?: number;
  unitRelation?: number;
  wastagePercentage?: number;
  reorderLimit?: number;
  stockQuantity: number;
  taxId?: number;
  tax?: number;
  taxCode?: string;
  taxName?: string;
  taxRate?: number;
  isTaxInclusive: boolean;
  taxInclusive?: boolean;  // backend may return as "taxInclusive" instead of "isTaxInclusive"
  purchasePrice: number;
  salesPrice?: number;
  imageUrl?: string;
  createdAt: string;
}

// ─── Production — Finished Good Types ────────────────────────────────────────
export interface FinishedGoodRequest {
  name: string;
  itemCode: string;
  barcode?: string;
  hsnSacCode?: string;
  description?: string;
  inventoryTypeId?: number;
  itemType: 'PRODUCT' | 'SERVICE';
  forPurchase: boolean;
  forSales: boolean;
  isTaxInclusive?: boolean;
  categoryId?: number;
  subCategoryId?: number;
  issueUnitId?: number;
  purchaseUnitId?: number;
  taxId?: number;
  unitRelation?: number;
  tolerancePercentage?: number;
  reorderLimit?: number;
  stockQuantity?: number;
  purchasePrice: number;
  salesPrice: number;
}

export interface FinishedGoodResponse {
  id: number;
  name: string;
  itemCode: string;
  barcode?: string;
  hsnSacCode?: string;
  description?: string;
  inventoryTypeId?: number;
  itemType: string;
  forPurchase: boolean;
  forSales: boolean;
  taxInclusive: boolean;       // API returns "taxInclusive" not "isTaxInclusive"
  isTaxInclusive?: boolean;    // keep for backward compat
  categoryId?: number;
  categoryName?: string;
  subCategoryId?: number;
  subCategoryName?: string;
  issueUnitId?: number;
  purchaseUnitId?: number;
  taxId?: number;
  taxCode?: string;
  taxRate?: number;
  taxName?: string;
  unitRelation?: number;
  tolerancePercentage?: number;
  reorderLimit?: number;
  stockQuantity: number;
  purchasePrice: number;
  salesPrice: number;
  imageUrl?: string;
  createdAt: string;
}

// ─── Quotation Types ──────────────────────────────────────────────────────────
export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';
export type QuotationType = 'STANDARD' | 'PROFORMA' | 'REVISED';

export interface QuotationItem {
  crmProductId?: number;
  itemCode?: string;
  itemName?: string;
  categoryId?: number;
  subcategoryId?: number;
  quantity: number;
  rate: number;
  taxPercentage?: number;
  taxValue?: number;
  isTaxExempt?: boolean;
}

export interface QuotationRequest {
  quotationDate: string;
  customerId: number;
  salespersonId?: number;
  reference?: string;
  expiryDate?: string;
  quotationType?: QuotationType;
  status: QuotationStatus;
  totalDiscount?: number;
  otherCharges?: number;
  termsAndConditions?: string;
  notes?: string;
  emailTo?: string;
  template?: string;
  items: QuotationItem[];
}

export interface QuotationItemResponse {
  id: number;
  crmProductId?: number;
  itemCode?: string;
  itemName?: string;
  quantity: number;
  rate: number;
  amount: number;
  taxPercentage?: number;
  taxValue?: number;
  isTaxExempt?: boolean;
}

export interface QuotationResponse {
  id: number;
  quotationNumber: string;
  quotationDate: string;
  customerId: number;
  customerName: string;
  salespersonId?: number;
  salespersonName?: string;
  reference?: string;
  expiryDate?: string;
  quotationType?: string;
  status: QuotationStatus;
  totalDiscount?: number;
  otherCharges?: number;
  subTotal?: number;
  totalTax?: number;
  netTotal?: number;
  termsAndConditions?: string;
  notes?: string;
  items: QuotationItemResponse[];
  createdAt: string;
}

// ─── Sales Order Types ────────────────────────────────────────────────────────
export type SalesOrderStatus = 'ORDERED' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'CONVERTED';

export interface SalesOrderResponse {
  id: number;
  salesOrderNumber: string;
  quotationId?: number;
  customerId: number;
  customerName: string;
  salespersonId?: number;
  salespersonName?: string;
  status: SalesOrderStatus;
  totalDiscount?: number;
  otherCharges?: number;
  subTotal?: number;
  totalTax?: number;
  netTotal?: number;
  notes?: string;
  items: QuotationItemResponse[];
  createdAt: string;
}

// ─── Sales Invoice Types ──────────────────────────────────────────────────────
export type InvoiceStatus = 'DRAFT' | 'OPEN' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';
export type SaleType = 'CASH' | 'CREDIT' | 'ADVANCE';

export interface SalesInvoiceItem {
  crmProductId?: number;
  itemCode?: string;
  itemName?: string;
  categoryId?: number;
  subcategoryId?: number;
  invoiceQuantity: number;
  rate: number;
  amount: number;
  taxPercentage?: number;
  taxValue?: number;
  isTaxExempt?: boolean;
}

export interface SalesInvoiceRequest {
  invoiceLedger?: string;
  invoiceDate: string;
  customerId: number;
  reference?: string;
  orderNumber?: string;
  customerPoNo?: string;
  customerPoDate?: string;
  saleType: SaleType;
  dueDate?: string;
  dateOfSupply?: string;
  salespersonId?: number;
  status: InvoiceStatus;
  subTotal?: number;
  totalDiscount?: number;
  grossTotal?: number;
  totalTax?: number;
  otherCharges?: number;
  netTotal?: number;
  termsAndConditions?: string;
  notes?: string;
  template?: string;
  emailTo?: string;
  items: SalesInvoiceItem[];
}

export interface SalesInvoiceResponse {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  customerId: number;
  customerName: string;
  saleType: SaleType;
  status: InvoiceStatus;
  dueDate?: string;
  subTotal?: number;
  totalDiscount?: number;
  totalTax?: number;
  otherCharges?: number;
  netTotal?: number;
  notes?: string;
  items: SalesInvoiceItem[];
  createdAt: string;
}
