import * as XLSX from 'xlsx';

export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: any, row: any) => string;
}

export function exportToExcel(
  data: any[],
  columns: ExportColumn[],
  filename: string,
  sheetName: string = 'Sheet1'
) {
  // Transform data according to columns
  const exportData = data.map(row => {
    const exportRow: any = {};
    columns.forEach(col => {
      const value = row[col.key];
      exportRow[col.label] = col.format ? col.format(value, row) : value;
    });
    return exportRow;
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate and download file
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToCSV(
  data: any[],
  columns: ExportColumn[],
  filename: string
) {
  // Transform data according to columns
  const exportData = data.map(row => {
    const exportRow: any = {};
    columns.forEach(col => {
      const value = row[col.key];
      exportRow[col.label] = col.format ? col.format(value, row) : value;
    });
    return exportRow;
  });

  // Convert to CSV
  const headers = columns.map(col => col.label);
  const csvContent = [
    headers.join(','),
    ...exportData.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // Download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export configurations for different entity types
export const warehouseExportColumns: ExportColumn[] = [
  { key: 'code', label: 'Warehouse Code' },
  { key: 'name', label: 'Name' },
  { key: 'warehouseType', label: 'Type' },
  { key: 'address', label: 'Address' },
  { key: 'contactPerson', label: 'Contact Person' },
  { key: 'contactPhone', label: 'Contact Phone' },
  { key: 'contactEmail', label: 'Contact Email' },
  { key: 'isActive', label: 'Status', format: (value) => value ? 'Active' : 'Inactive' },
  { key: 'totalCapacityWeight', label: 'Weight Capacity (kg)' },
  { key: 'totalCapacityVolume', label: 'Volume Capacity (m³)' },
];

export const floorExportColumns: ExportColumn[] = [
  { key: 'code', label: 'Floor Code' },
  { key: 'name', label: 'Name' },
  { key: 'warehouseName', label: 'Warehouse' },
  { key: 'levelNo', label: 'Level Number' },
  { key: 'accessType', label: 'Access Type' },
  { key: 'length', label: 'Length (m)' },
  { key: 'width', label: 'Width (m)' },
  { key: 'height', label: 'Height (m)' },
  { key: 'temperatureControlled', label: 'Temperature Controlled', format: (value) => value ? 'Yes' : 'No' },
  { key: 'minTemp', label: 'Min Temperature (°C)' },
  { key: 'maxTemp', label: 'Max Temperature (°C)' },
  { key: 'hazardousAllowed', label: 'Hazardous Allowed', format: (value) => value ? 'Yes' : 'No' },
  { key: 'restrictedAccess', label: 'Restricted Access', format: (value) => value ? 'Yes' : 'No' },
  { key: 'isActive', label: 'Status', format: (value) => value ? 'Active' : 'Inactive' },
];

export const zoneExportColumns: ExportColumn[] = [
  { key: 'name', label: 'Zone Name' },
  { key: 'warehouseName', label: 'Warehouse' },
  { key: 'floorName', label: 'Floor' },
  { key: 'zoneType', label: 'Zone Type' },
  { key: 'pickPriority', label: 'Pick Priority' },
  { key: 'putAwayPriority', label: 'Put Away Priority' },
  { key: 'fastMovingZone', label: 'Fast Moving', format: (value) => value ? 'Yes' : 'No' },
  { key: 'temperatureControlled', label: 'Temperature Controlled', format: (value) => value ? 'Yes' : 'No' },
  { key: 'hazardous', label: 'Hazardous', format: (value) => value ? 'Yes' : 'No' },
  { key: 'restrictedAccess', label: 'Restricted Access', format: (value) => value ? 'Yes' : 'No' },
  { key: 'maxWeight', label: 'Max Weight (kg)' },
  { key: 'maxVolume', label: 'Max Volume (m³)' },
  { key: 'isActive', label: 'Status', format: (value) => value ? 'Active' : 'Inactive' },
];

export const rackExportColumns: ExportColumn[] = [
  { key: 'rackCode', label: 'Rack Code' },
  { key: 'zoneName', label: 'Zone Name' },
  { key: 'rackType', label: 'Rack Type' },
  { key: 'aisle', label: 'Aisle' },
  { key: 'pickSequence', label: 'Pick Sequence' },
  { key: 'barcodeTag', label: 'Barcode Tag' },
  { key: 'maxWeight', label: 'Max Weight (kg)' },
  { key: 'maxVolume', label: 'Max Volume (m³)' },
  { key: 'isActive', label: 'Status', format: (value) => value ? 'Active' : 'Inactive' },
];

export const shelfExportColumns: ExportColumn[] = [
  { key: 'shelfCode', label: 'Shelf Code' },
  { key: 'rackCode', label: 'Rack Code' },
  { key: 'levelNo', label: 'Level Number' },
  { key: 'pickSequence', label: 'Pick Sequence' },
  { key: 'barcodeTag', label: 'Barcode Tag' },
  { key: 'maxWeight', label: 'Max Weight (kg)' },
  { key: 'maxVolume', label: 'Max Volume (m³)' },
  { key: 'isActive', label: 'Status', format: (value) => value ? 'Active' : 'Inactive' },
];

export const binExportColumns: ExportColumn[] = [
  { key: 'binCode', label: 'Bin Code' },
  { key: 'warehouseName', label: 'Warehouse' },
  { key: 'shelfCode', label: 'Shelf Code' },
  { key: 'binType', label: 'Bin Type' },
  { key: 'capacityQty', label: 'Capacity Quantity' },
  { key: 'capacityWeight', label: 'Capacity Weight (kg)' },
  { key: 'capacityVolume', label: 'Capacity Volume (m³)' },
  { key: 'pickSequence', label: 'Pick Sequence' },
  { key: 'barcodeTag', label: 'Barcode Tag' },
  { key: 'blocked', label: 'Blocked', format: (value) => value ? 'Yes' : 'No' },
  { key: 'blockReason', label: 'Block Reason' },
  { key: 'hazardousAllowed', label: 'Hazardous Allowed', format: (value) => value ? 'Yes' : 'No' },
  { key: 'isActive', label: 'Status', format: (value) => value ? 'Active' : 'Inactive' },
];