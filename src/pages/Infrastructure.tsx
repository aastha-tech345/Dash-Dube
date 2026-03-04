import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Filter, Download, Search, Pencil, Trash2 } from "lucide-react";
import { useWarehouses, useZones, useRacks, useShelves, useBins } from "@/hooks/useWarehouseData";
import { warehouseApi } from "@/services/warehouseApi";
import DataTable, { TableAction } from "@/components/shared/DataTable";
import { useToast } from "@/hooks/use-toast";

import { 
  warehousesColumns, 
  zonesColumns, 
  racksColumns, 
  shelvesColumns, 
  binsColumns 
} from "@/data/tableConfigs";
import type { WareHouseResponse, ZoneResponse, RackResponse, ShelfResponse, BinResponse } from "@/types/api";

import { Eye, Layers, CheckCircle } from "lucide-react";

const tabs = ["Warehouses", "Zones", "Racks", "Shelves", "Bins"];

const features = [
  { icon: Eye, color: "stat-icon-blue", title: "Hierarchical View", desc: "Easily map your warehouse from global location down to individual picking bins." },
  { icon: Layers, color: "stat-icon-purple", title: "Smart Mapping", desc: "Automatic rack numbering based on zone configuration saves time during setup." },
  { icon: CheckCircle, color: "stat-icon-green", title: "Capacity Tracking", desc: "Monitor shelf load limits and bin volume utilization in real-time." },
];

export default function Infrastructure() {
  const [activeTab, setActiveTab] = useState("Warehouses");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch data from API
  const { warehouses, loading: whLoading, error: whError, refetch: refetchWarehouses } = useWarehouses();
  const { zones, loading: zoneLoading, error: zoneError, refetch: refetchZones } = useZones();
  const { racks, loading: rackLoading, error: rackError, refetch: refetchRacks } = useRacks();
  const { shelves, loading: shelfLoading, error: shelfError, refetch: refetchShelves } = useShelves();
  const { bins, loading: binLoading, error: binError, refetch: refetchBins } = useBins();

  const loading = whLoading || zoneLoading || rackLoading || shelfLoading || binLoading;
  const error = whError || zoneError || rackError || shelfError || binError;

  const createLabel = activeTab === "Warehouses" ? "Create Warehouse" :
    activeTab === "Zones" ? "Create Zone" :
    activeTab === "Racks" ? "Create Rack" : `Create ${activeTab.slice(0, -1)}`;

  const createLink = activeTab === "Warehouses" ? "/infrastructure/create-warehouse" :
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

  // Search function for API data
  const searchData = (data: any[], searchTerm: string, type: string) => {
    if (!searchTerm) return data;
    
    const term = searchTerm.toLowerCase();
    
    switch (type) {
      case 'Warehouses':
        return data.filter((item: WareHouseResponse) => 
          item.name?.toLowerCase().includes(term) ||
          item.code?.toLowerCase().includes(term) ||
          item.address?.toLowerCase().includes(term) ||
          item.warehouseType?.toLowerCase().includes(term)
        );
      case 'Zones':
        return data.filter((item: ZoneResponse) => 
          item.name?.toLowerCase().includes(term) ||
          item.warehouseName?.toLowerCase().includes(term) ||
          item.zoneType?.toLowerCase().includes(term) ||
          item.floorName?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term)
        );
      case 'Racks':
        return data.filter((item: RackResponse) => 
          item.rackCode?.toLowerCase().includes(term) ||
          item.zoneName?.toLowerCase().includes(term) ||
          item.rackType?.toLowerCase().includes(term) ||
          item.aisle?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term)
        );
      case 'Shelves':
        return data.filter((item: ShelfResponse) => 
          item.shelfCode?.toLowerCase().includes(term) ||
          item.rackCode?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term)
        );
      case 'Bins':
        return data.filter((item: BinResponse) => 
          item.binCode?.toLowerCase().includes(term) ||
          item.shelfCode?.toLowerCase().includes(term) ||
          item.warehouseName?.toLowerCase().includes(term) ||
          item.binType?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term)
        );
      default:
        return data;
    }
  };

  // Get filtered data based on active tab and search
  const getFilteredData = () => {
    switch (activeTab) {
      case "Warehouses":
        return searchData(warehouses, search, "Warehouses");
      case "Zones":
        return searchData(zones, search, "Zones");
      case "Racks":
        return searchData(racks, search, "Racks");
      case "Shelves":
        return searchData(shelves, search, "Shelves");
      case "Bins":
        return searchData(bins, search, "Bins");
      default:
        return [];
    }
  };

  // Get columns based on active tab
  const getColumns = () => {
    switch (activeTab) {
      case "Warehouses":
        return warehousesColumns;
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
        {["Warehouses", "Zones", "Racks", "Shelves", "Bins"].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearch(""); }}
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
              <button className="btn-outline flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5" /> Filters
              </button>
              <button className="btn-outline flex items-center gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
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