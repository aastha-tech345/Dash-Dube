import { ReactNode } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import Pagination from './Pagination';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  render?: (value: any, row: any) => ReactNode;
}

export interface TableAction {
  icon: ReactNode;
  label: string;
  onClick: (row: any) => void;
  variant?: 'default' | 'danger';
}

interface DataTableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  error?: string | null;
  searchValue?: string;
  onSearch?: (value: string) => void;
  actions?: TableAction[];
  emptyMessage?: string;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showingText?: string;
}

export default function DataTable({
  columns,
  data,
  loading = false,
  error = null,
  searchValue = '',
  onSearch,
  actions = [],
  emptyMessage = 'No data found',
  showPagination = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showingText
}: DataTableProps) {
  const defaultActions: TableAction[] = [
    {
      icon: <Pencil className="w-3.5 h-3.5" />,
      label: 'Edit',
      onClick: (row) => console.log('Edit:', row),
    },
    {
      icon: <Trash2 className="w-3.5 h-3.5" />,
      label: 'Delete',
      onClick: (row) => console.log('Delete:', row),
      variant: 'danger' as const,
    }
  ];

  const tableActions = actions.length > 0 ? actions : defaultActions;

  const renderCellValue = (column: TableColumn, row: any) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    // Default rendering based on column key
    if (column.key === 'status' || column.key.includes('Status')) {
      return <StatusBadge status={value} />;
    }
    
    if (column.key.includes('Code') || column.key === 'code') {
      return <span className="text-primary font-medium text-xs">{value}</span>;
    }
    
    if (column.key.includes('Price') || column.key.includes('price')) {
      return <span className="font-medium">{value}</span>;
    }
    
    return value;
  };

  if (loading) {
    return (
      <div className="section-card p-12 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-card p-4 bg-red-50 border-red-200">
        <p className="text-red-600 text-sm">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
              {tableActions.length > 0 && (
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (tableActions.length > 0 ? 1 : 0)} 
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id || index} className="hover:bg-muted/50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm truncate">
                      {renderCellValue(column, row)}
                    </td>
                  ))}
                  {tableActions.length > 0 && (
                    <td className="px-4 py-3 w-24">
                      <div className="flex items-center gap-1">
                        {tableActions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            className={`w-7 h-7 rounded flex items-center justify-center hover:bg-muted ${
                              action.variant === 'danger' ? 'hover:text-red-600' : ''
                            }`}
                            onClick={() => action.onClick(row)}
                            title={action.label}
                          >
                            {action.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {showPagination && data.length > 0 && (
        <div className="px-4 py-3 border-t border-border">
          <Pagination 
            current={currentPage} 
            total={totalPages} 
            showingText={showingText || `Showing ${data.length} items`}
          />
        </div>
      )}
    </div>
  );
}