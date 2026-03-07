import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useWarehouses, useFloors, useZones, useRacks, useShelves, useBins } from "@/hooks/useWarehouseData";
import { warehouseApi } from "@/services/warehouseApi";
import DataTable, { TableAction } from "@/components/shared/DataTable";
import AdvancedFilters from "@/components/shared/AdvancedFilters";
import ExportDropdown from "@/components/shared/ExportDropdown";
import { useToast } from "@/hooks/use-toast";

import { 
  warehousesColumns,
  floorsColumns,
  zonesColumns, 
  racksColumns, 
  shelvesColumns, 
  abhiColumns,
  binsColumns 
} from "@/data/tableConfigs";

import {
  warehouseFilters,
  floorFilters,
  zoneFilters,
  rackFilters,
  shelfFilters,
  binFilters
} from "@/data/filterConfigs";

import {
  exportToExcel,
  exportToCSV,
  warehouseExportColumns,
  floorExportColumns,
  zoneExportColumns,
  rackExportColumns,
  shelfExportColumns,
  binExportColumns
} from "@/utils/exportUtils";

import type { WareHouseResponse, FloorResponse, ZoneResponse, RackResponse, ShelfResponse, BinResponse } from "@/types/api";

import { Eye, Layers, CheckCircle } from "lucide-react";

const tabs = ["Warehouses", "Floors", "Zones", "Racks", "Shelves", "Bins"];

const features = [
  { icon: Eye, color: "stat-icon-blue", title: "Hierarchical View", desc: "Easily map your warehouse from global location down to individual picking bins." },
  { icon: Layers, color: "stat-icon-purple", title: "Smart Mapping", desc: "Automatic rack numbering based on zone configuration saves time during setup." },
  { icon: CheckCircle, color: "stat-icon-green", title: "Capacity Tracking", desc: "Monitor shelf load limits and bin volume utilization in real-time." },
];

export default function Infrastructure() {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || "Warehouses");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabFromUrl && tabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Clear filters when tab changes
  useEffect(() => {
    setFilters({});
    setSearch("");
  }, [activeTab]);

  // Fetch data from API
  const { warehouses, loading: whLoading, error: whError, refetch: refetchWarehouses } = useWarehouses();
  const { floors, loading: floorLoading, error: floorError, refetch: refetchFloors } = useFloors();
  const { zones, loading: zoneLoading, error: zoneError, refetch: refetchZones } = useZones();
  const { racks, loading: rackLoading, error: rackError, refetch: refetchRacks } = useRacks();
  const { shelves, loading: shelfLoading, error: shelfError, refetch: refetchShelves } = useShelves();
  const { bins, loading: binLoading, error: binError, refetch: refetchBins } = useBins();

  const loading = whLoading || floorLoading || zoneLoading || rackLoading || shelfLoading || binLoading;
  const error = whError || floorError || zoneError || rackError || shelfError || binError;

  const createLabel = activeTab === "Warehouses" ? "Create Warehouse" :
    activeTab === "Floors" ? "Create Floor" :
    activeTab === "Zones" ? "Create Zone" :
    activeTab === "Racks" ? "Create Rack" :
    `Create ${activeTab.slice(0, -1)}`;

  const createLink = activeTab === "Warehouses" ? "/infrastructure/create-warehouse" :
    activeTab === "Floors" ? "/infrastructure/create-floor" :
    activeTab === "Zones" ? "/infrastructure/create-zone" :
    activeTab === "Racks" ? "/infrastructure/create-rack" :
    activeTab === "Shelves" ? "/infrastructure/create-shelf" :
    activeTab === "Bins" ? "/infrastructure/create-bin" : "#";

  const handleCreateClick = () => {
    navigate(createLink);
  };

  // CRUD Operations
  const handleDelete = async (row: any) => {
    const entityType = activeTab.slice(0, -1); // Remove 's' from end
    
    if (!confirm(`Are you sure you want to delete this ${entityType.toLowerCase()}?`)) return;

    try {
      switch (activeTab) {
        case 'Warehouses':
          await warehouseApi.deleteWarehouse(row.id);
          refetchWarehouses();
          break;
        case 'Floors':
          await warehouseApi.deleteFloor(row.id);
          refetchFloors();
          break;
        case 'Zones':
          await warehouseApi.deleteZone(row.id);
          refetchZones();
          break;
        case 'Racks':
          await warehouseApi.deleteRack(row.id);
          refetchRacks();
          break;
        case 'Shelves':
          await warehouseApi.deleteShelf(row.id);
          refetchShelves();
          break;
        case 'Bins':
          await warehouseApi.deleteBin(row.id);
          refetchBins();
          break;
      }
      
      toast({
        title: "Success",
        description: `${entityType} deleted successfully!`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${entityType.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (row: any) => {
    switch (activeTab) {
      case 'Warehouses':
        navigate(`/infrastructure/create-warehouse?edit=${row.id}`);
        break;
      case 'Floors':
        navigate(`/infrastructure/create-floor?edit=${row.id}`);
        break;
      case 'Zones':
        navigate(`/infrastructure/create-zone?edit=${row.id}`);
        break;
      case 'Racks':
        navigate(`/infrastructure/create-rack?edit=${row.id}`);
        break;
      case 'Shelves':
        navigate(`/infrastructure/create-shelf?edit=${row.id}`);
        break;
      case 'Bins':
        navigate(`/infrastructure/create-bin?edit=${row.id}`);
        break;
    }
  };

  const handleEditSuccess = () => {
    // Refresh the appropriate data based on active tab
    switch (activeTab) {
      case 'Warehouses':
        refetchWarehouses();
        break;
      case 'Floors':
        refetchFloors();
        break;
      case 'Zones':
        refetchZones();
        break;
      case 'Racks':
        refetchRacks();
        break;
      case 'Shelves':
        refetchShelves();
        break;
      case 'Bins':
        refetchBins();
        break;
    }
  };

  // Enhanced search and filter function
  const searchAndFilterData = (data: any[], searchTerm: string, activeFilters: Record<string, any>, type: string) => {
    let filteredData = [...data];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      
      switch (type) {
        case 'Warehouses':
          filteredData = filteredData.filter((item: WareHouseResponse) => 
            item.name?.toLowerCase().includes(term) ||
            item.code?.toLowerCase().includes(term) ||
            item.address?.toLowerCase().includes(term) ||
            item.warehouseType?.toLowerCase().includes(term)
          );
          break;
        case 'Floors':
          filteredData = filteredData.filter((item: FloorResponse) => 
            item.name?.toLowerCase().includes(term) ||
            item.code?.toLowerCase().includes(term) ||
            item.warehouseName?.toLowerCase().includes(term) ||
            item.accessType?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term)
          );
          break;
        case 'Zones':
          filteredData = filteredData.filter((item: ZoneResponse) => 
            item.name?.toLowerCase().includes(term) ||
            item.warehouseName?.toLowerCase().includes(term) ||
            item.zoneType?.toLowerCase().includes(term) ||
            item.floorName?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term)
          );
          break;
        case 'Racks':
          filteredData = filteredData.filter((item: RackResponse) => 
            item.rackCode?.toLowerCase().includes(term) ||
            item.zoneName?.toLowerCase().includes(term) ||
            item.rackType?.toLowerCase().includes(term) ||
            item.aisle?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term)
          );
          break;
        case 'Shelves':
          filteredData = filteredData.filter((item: ShelfResponse) => 
            item.shelfCode?.toLowerCase().includes(term) ||
            item.rackCode?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term)
          );
          break;
        case 'Bins':
          filteredData = filteredData.filter((item: BinResponse) => 
            item.binCode?.toLowerCase().includes(term) ||
            item.shelfCode?.toLowerCase().includes(term) ||
            item.warehouseName?.toLowerCase().includes(term) ||
            item.binType?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term)
          );
          break;
      }
    }

    // Apply advanced filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        filteredData = filteredData.filter(item => {
          const itemValue = item[key];
          
          // Handle boolean filters
          if (typeof value === 'boolean') {
            return itemValue === value;
          }
          
          // Handle string filters (case insensitive)
          if (typeof value === 'string') {
            if (typeof itemValue === 'string') {
              return itemValue.toLowerCase().includes(value.toLowerCase());
            }
            return itemValue === value;
          }
          
          return itemValue === value;
        });
      }
    });

    return filteredData;
  };

  // Get filtered data based on active tab, search, and filters
  const getFilteredData = () => {
    switch (activeTab) {
      case "Warehouses":
        return searchAndFilterData(warehouses, search, filters, "Warehouses");
      case "Floors":
        return searchAndFilterData(floors, search, filters, "Floors");
      case "Zones":
        return searchAndFilterData(zones, search, filters, "Zones");
      case "Racks":
        return searchAndFilterData(racks, search, filters, "Racks");
      case "Shelves":
        return searchAndFilterData(shelves, search, filters, "Shelves");
      case "Bins":
        return searchAndFilterData(bins, search, filters, "Bins");
      default:
        return [];
    }
  };

  // Get columns based on active tab
  const getColumns = () => {
    switch (activeTab) {
      case "Warehouses":
        return warehousesColumns;
      case "Floors":
        return floorsColumns;
      case "Zones":
        return zonesColumns;
      case "Racks":
        return racksColumns;
      case "Shelves":
        return shelvesColumns;
      case "Bins":
        return binsColumns;
      default:
        return [];
    }
  };

  // Get filter configuration based on active tab
  const getFilterConfig = () => {
    switch (activeTab) {
      case "Warehouses":
        return warehouseFilters;
      case "Floors":
        return floorFilters;
      case "Zones":
        return zoneFilters;
      case "Racks":
        return rackFilters;
      case "Shelves":
        return shelfFilters;
      case "Bins":
        return binFilters;
      default:
        return [];
    }
  };

  // Export functions
  const handleExportExcel = () => {
    const data = getFilteredData();
    const timestamp = new Date().toISOString().split('T')[0];
    
    let exportColumns, filename;
    
    switch (activeTab) {
      case "Warehouses":
        exportColumns = warehouseExportColumns;
        filename = `warehouses_${timestamp}`;
        break;
      case "Floors":
        exportColumns = floorExportColumns;
        filename = `floors_${timestamp}`;
        break;
      case "Zones":
        exportColumns = zoneExportColumns;
        filename = `zones_${timestamp}`;
        break;
      case "Racks":
        exportColumns = rackExportColumns;
        filename = `racks_${timestamp}`;
        break;
      case "Shelves":
        exportColumns = shelfExportColumns;
        filename = `shelves_${timestamp}`;
        break;
      case "Bins":
        exportColumns = binExportColumns;
        filename = `bins_${timestamp}`;
        break;
      default:
        return;
    }

    exportToExcel(data, exportColumns, filename, activeTab);
    
    toast({
      title: "Export Successful",
      description: `${data.length} ${activeTab.toLowerCase()} exported to Excel`,
      variant: "default",
    });
  };

  const handleExportCSV = () => {
    const data = getFilteredData();
    const timestamp = new Date().toISOString().split('T')[0];
    
    let exportColumns, filename;
    
    switch (activeTab) {
      case "Warehouses":
        exportColumns = warehouseExportColumns;
        filename = `warehouses_${timestamp}`;
        break;
      case "Floors":
        exportColumns = floorExportColumns;
        filename = `floors_${timestamp}`;
        break;
      case "Zones":
        exportColumns = zoneExportColumns;
        filename = `zones_${timestamp}`;
        break;
      case "Racks":
        exportColumns = rackExportColumns;
        filename = `racks_${timestamp}`;
        break;
      case "Shelves":
        exportColumns = shelfExportColumns;
        filename = `shelves_${timestamp}`;
        break;
      case "Bins":
        exportColumns = binExportColumns;
        filename = `bins_${timestamp}`;
        break;
      default:
        return;
    }

    exportToCSV(data, exportColumns, filename);
    
    toast({
      title: "Export Successful",
      description: `${data.length} ${activeTab.toLowerCase()} exported to CSV`,
      variant: "default",
    });
  };

  // Define table actions
  const tableActions: TableAction[] = [
    {
      icon: <Pencil className="w-3.5 h-3.5" />,
      label: 'Edit',
      onClick: handleEdit,
    },
    {
      icon: <Trash2 className="w-3.5 h-3.5" />,
      label: 'Delete',
      onClick: handleDelete,
      variant: 'danger' as const,
    }
  ];

  const filteredData = getFilteredData();
  const columns = getColumns();

  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Warehouse Management &gt; Infrastructure Setup</p>
          <h1 className="page-title text-xl">Warehouse Infrastructure Setup</h1>
          <p className="page-subtitle">Configure and manage your physical warehouse structure, from buildings to individual bins.</p>
        </div>
        <button 
          onClick={handleCreateClick}
          className="btn-primary flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> {createLabel}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mt-4 mb-6">
        {["Warehouses", "Floors", "Zones", "Racks", "Shelves", "Bins"].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); }}
            className={`tab-item ${activeTab === tab ? "active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      {!loading && (
        <div className="section-card mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                className="input-field pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <AdvancedFilters
                filters={getFilterConfig()}
                activeFilters={filters}
                onFiltersChange={setFilters}
                onClearFilters={() => setFilters({})}
              />
              <ExportDropdown
                onExportExcel={handleExportExcel}
                onExportCSV={handleExportCSV}
                recordCount={filteredData.length}
                entityName={activeTab}
              />
            </div>
          </div>
        </div>
      )}

      {/* Data Table - Full Width */}
      <div className="w-full">
        <DataTable
          columns={columns}
          data={filteredData}
          loading={loading}
          error={error}
          actions={tableActions}
          emptyMessage={`No ${activeTab.toLowerCase()} found`}
          showingText={`Showing ${filteredData.length} of ${filteredData.length} ${activeTab.toLowerCase()}`}
        />
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {[
          { icon: Eye, color: "stat-icon-blue", title: "Hierarchical View", desc: "Easily map your warehouse from global location down to individual picking bins." },
          { icon: Layers, color: "stat-icon-purple", title: "Smart Mapping", desc: "Automatic rack numbering based on zone configuration saves time during setup." },
          { icon: CheckCircle, color: "stat-icon-green", title: "Capacity Tracking", desc: "Monitor shelf load limits and bin volume utilization in real-time." },
        ].map((f) => (
          <div key={f.title} className="feature-card">
            <div className={`feature-card-icon ${f.color}`}><f.icon className="w-5 h-5" /></div>
            <div>
              <div className="text-sm font-semibold">{f.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}