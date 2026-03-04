import React from 'react';
import { TableColumn } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

// Warehouses Table Configuration
export const warehousesColumns: TableColumn[] = [
  {
    key: 'code',
    label: 'Warehouse Code',
  },
  {
    key: 'name',
    label: 'Name',
  },
  {
    key: 'warehouseType',
    label: 'Type',
    render: (value) => <span className="text-muted-foreground">{value}</span>
  },
  {
    key: 'zonesCount',
    label: 'Zones Count',
    render: (value, row) => <span className="text-muted-foreground">{value || '0'} Zones</span>
  },
  {
    key: 'isActive',
    label: 'Status',
    render: (value) => <StatusBadge status={value ? 'Active' : 'Inactive'} />
  }
];

// Zones Table Configuration
export const zonesColumns: TableColumn[] = [
  {
    key: 'name',
    label: 'Zone Name',
  },
  {
    key: 'warehouseName',
    label: 'Warehouse',
    render: (value) => <span className="text-muted-foreground">{value}</span>
  },
  {
    key: 'floorName',
    label: 'Floor',
    render: (value) => <span className="text-xs">{value}</span>
  },
  {
    key: 'zoneType',
    label: 'Type',
  },
  {
    key: 'pickPriority',
    label: 'Pick Priority',
  },
  {
    key: 'isActive',
    label: 'Status',
    render: (value) => <StatusBadge status={value ? 'Active' : 'Inactive'} />
  }
];

// Racks Table Configuration
export const racksColumns: TableColumn[] = [
  {
    key: 'rackCode',
    label: 'Rack Code',
  },
  {
    key: 'zoneName',
    label: 'Zone Name',
  },
  {
    key: 'rackType',
    label: 'Rack Type',
  },
  {
    key: 'aisle',
    label: 'Aisle',
    render: (value) => <span className="text-muted-foreground">{value || '-'}</span>
  },
  {
    key: 'pickSequence',
    label: 'Pick Sequence',
  },
  {
    key: 'isActive',
    label: 'Status',
    render: (value) => <StatusBadge status={value ? 'Active' : 'Inactive'} />
  }
];

// Shelves Table Configuration
export const shelvesColumns: TableColumn[] = [
  {
    key: 'shelfCode',
    label: 'Shelf Code',
  },
  {
    key: 'rackCode',
    label: 'Rack Code',
    render: (value) => <span className="text-muted-foreground">{value}</span>
  },
  {
    key: 'levelNo',
    label: 'Level Number',
  },
  {
    key: 'pickSequence',
    label: 'Pick Sequence',
  },
  {
    key: 'maxWeight',
    label: 'Max Weight',
    render: (value) => value ? `${value} kg` : '-'
  },
  {
    key: 'isActive',
    label: 'Status',
    render: (value) => <StatusBadge status={value ? 'Active' : 'Inactive'} />
  }
];

// Bins Table Configuration
export const binsColumns: TableColumn[] = [
  {
    key: 'binCode',
    label: 'Bin Code',
  },
  {
    key: 'warehouseName',
    label: 'Warehouse',
    render: (value) => <span className="text-muted-foreground">{value}</span>
  },
  {
    key: 'shelfCode',
    label: 'Shelf',
    render: (value) => <span className="text-xs">{value}</span>
  },
  {
    key: 'binType',
    label: 'Type',
  },
  {
    key: 'capacityQty',
    label: 'Capacity',
    render: (value) => `${value} units`
  },
  {
    key: 'status',
    label: 'Status',
    render: (value, row) => {
      const status = row.isActive && !row.blocked ? 'Active' : 'Inactive';
      return <StatusBadge status={status} />;
    }
  }
];

// Products Table Configuration (for inventory)
export const productsColumns: TableColumn[] = [
  {
    key: 'id',
    label: 'Product ID',
    width: '120px',
  },
  {
    key: 'name',
    label: 'Name',
    width: '200px',
  },
  {
    key: 'sub',
    label: 'Sub Category',
    width: '150px',
    render: (value) => <span className="text-muted-foreground">{value}</span>
  },
  {
    key: 'category',
    label: 'Category',
    width: '120px',
  },
  {
    key: 'purchasePrice',
    label: 'Purchase Price',
    width: '120px',
  },
  {
    key: 'salePrice',
    label: 'Sale Price',
    width: '120px',
  },
  {
    key: 'status',
    label: 'Status',
    width: '100px',
  }
];

// Stock Transactions Table Configuration
export const stockTransactionsColumns: TableColumn[] = [
  {
    key: 'id',
    label: 'Transaction ID',
    width: '120px',
  },
  {
    key: 'productName',
    label: 'Product',
    width: '200px',
  },
  {
    key: 'type',
    label: 'Type',
    width: '80px',
    render: (value) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        value === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value.toUpperCase()}
      </span>
    )
  },
  {
    key: 'quantity',
    label: 'Quantity',
    width: '100px',
    render: (value) => <span className="font-medium">{value}</span>
  },
  {
    key: 'warehouse',
    label: 'Warehouse',
    width: '150px',
    render: (value) => <span className="text-muted-foreground">{value}</span>
  },
  {
    key: 'date',
    label: 'Date',
    width: '120px',
    render: (value) => new Date(value).toLocaleDateString()
  },
  {
    key: 'reference',
    label: 'Reference',
    width: '120px',
    render: (value) => <span className="text-xs text-muted-foreground">{value}</span>
  }
];