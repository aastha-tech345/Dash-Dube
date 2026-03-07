import type { FilterOption } from '@/components/shared/AdvancedFilters';

// Warehouse filter configuration
export const warehouseFilters: FilterOption[] = [
  {
    key: 'warehouseType',
    label: 'Warehouse Type',
    type: 'select',
    options: [
      { value: 'NORMAL', label: 'Normal' },
      { value: 'COLD_STORAGE', label: 'Cold Storage' },
      { value: 'HAZMAT', label: 'Hazmat' },
      { value: 'PRODUCTION', label: 'Production' },
      { value: 'RETAIL_STORE', label: 'Retail Store' },
    ]
  },
  {
    key: 'isActive',
    label: 'Status',
    type: 'boolean'
  },
  {
    key: 'code',
    label: 'Warehouse Code',
    type: 'text'
  },
  {
    key: 'name',
    label: 'Warehouse Name',
    type: 'text'
  }
];

// Floor filter configuration
export const floorFilters: FilterOption[] = [
  {
    key: 'accessType',
    label: 'Access Type',
    type: 'select',
    options: [
      { value: 'NONE', label: 'None' },
      { value: 'STAIRS', label: 'Stairs' },
      { value: 'ELEVATOR', label: 'Elevator' },
      { value: 'RAMP', label: 'Ramp' },
      { value: 'FORKLIFT_LIFT', label: 'Forklift Lift' },
    ]
  },
  {
    key: 'temperatureControlled',
    label: 'Temperature Controlled',
    type: 'boolean'
  },
  {
    key: 'hazardousAllowed',
    label: 'Hazardous Allowed',
    type: 'boolean'
  },
  {
    key: 'restrictedAccess',
    label: 'Restricted Access',
    type: 'boolean'
  },
  {
    key: 'isActive',
    label: 'Status',
    type: 'boolean'
  },
  {
    key: 'code',
    label: 'Floor Code',
    type: 'text'
  },
  {
    key: 'name',
    label: 'Floor Name',
    type: 'text'
  },
  {
    key: 'warehouseName',
    label: 'Warehouse Name',
    type: 'text'
  }
];

// Zone filter configuration
export const zoneFilters: FilterOption[] = [
  {
    key: 'zoneType',
    label: 'Zone Type',
    type: 'select',
    options: [
      { value: 'STORAGE', label: 'Storage' },
      { value: 'RECEIVING', label: 'Receiving' },
      { value: 'QC', label: 'QC' },
      { value: 'QUARANTINE', label: 'Quarantine' },
      { value: 'DISPATCH', label: 'Dispatch' },
      { value: 'RETURNS', label: 'Returns' },
      { value: 'PRODUCTION_STAGING', label: 'Production Staging' },
    ]
  },
  {
    key: 'fastMovingZone',
    label: 'Fast Moving Zone',
    type: 'boolean'
  },
  {
    key: 'temperatureControlled',
    label: 'Temperature Controlled',
    type: 'boolean'
  },
  {
    key: 'hazardous',
    label: 'Hazardous',
    type: 'boolean'
  },
  {
    key: 'restrictedAccess',
    label: 'Restricted Access',
    type: 'boolean'
  },
  {
    key: 'isActive',
    label: 'Status',
    type: 'boolean'
  },
  {
    key: 'name',
    label: 'Zone Name',
    type: 'text'
  },
  {
    key: 'warehouseName',
    label: 'Warehouse Name',
    type: 'text'
  },
  {
    key: 'floorName',
    label: 'Floor Name',
    type: 'text'
  }
];

// Rack filter configuration
export const rackFilters: FilterOption[] = [
  {
    key: 'rackType',
    label: 'Rack Type',
    type: 'select',
    options: [
      { value: 'STORAGE', label: 'Storage' },
      { value: 'BULK_STORAGE', label: 'Bulk Storage' },
      { value: 'PICK_FACE', label: 'Pick Face' },
      { value: 'STAGING', label: 'Staging' },
    ]
  },
  {
    key: 'isActive',
    label: 'Status',
    type: 'boolean'
  },
  {
    key: 'rackCode',
    label: 'Rack Code',
    type: 'text'
  },
  {
    key: 'zoneName',
    label: 'Zone Name',
    type: 'text'
  },
  {
    key: 'aisle',
    label: 'Aisle',
    type: 'text'
  },
  {
    key: 'barcodeTag',
    label: 'Barcode Tag',
    type: 'text'
  }
];

// Shelf filter configuration
export const shelfFilters: FilterOption[] = [
  {
    key: 'isActive',
    label: 'Status',
    type: 'boolean'
  },
  {
    key: 'shelfCode',
    label: 'Shelf Code',
    type: 'text'
  },
  {
    key: 'rackCode',
    label: 'Rack Code',
    type: 'text'
  },
  {
    key: 'barcodeTag',
    label: 'Barcode Tag',
    type: 'text'
  }
];

// Bin filter configuration
export const binFilters: FilterOption[] = [
  {
    key: 'binType',
    label: 'Bin Type',
    type: 'select',
    options: [
      { value: 'STORAGE', label: 'Storage' },
      { value: 'RECEIVING', label: 'Receiving' },
      { value: 'QC', label: 'QC' },
      { value: 'QUARANTINE', label: 'Quarantine' },
      { value: 'DISPATCH', label: 'Dispatch' },
      { value: 'DAMAGE', label: 'Damage' },
      { value: 'RETURNS', label: 'Returns' },
    ]
  },
  {
    key: 'blocked',
    label: 'Blocked Status',
    type: 'boolean'
  },
  {
    key: 'hazardousAllowed',
    label: 'Hazardous Allowed',
    type: 'boolean'
  },
  {
    key: 'isActive',
    label: 'Status',
    type: 'boolean'
  },
  {
    key: 'binCode',
    label: 'Bin Code',
    type: 'text'
  },
  {
    key: 'warehouseName',
    label: 'Warehouse Name',
    type: 'text'
  },
  {
    key: 'shelfCode',
    label: 'Shelf Code',
    type: 'text'
  },
  {
    key: 'barcodeTag',
    label: 'Barcode Tag',
    type: 'text'
  }
];