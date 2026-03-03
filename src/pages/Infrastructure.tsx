import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Filter, Download, Pencil, Trash2, Eye, Layers, CheckCircle } from "lucide-react";
import { warehouses, zones, racks, shelves } from "@/data/mockData";
import StatusBadge from "@/components/shared/StatusBadge";
import SearchBar from "@/components/shared/SearchBar";
import Pagination from "@/components/shared/Pagination";

const tabs = ["Warehouses", "Zones", "Racks", "Shelves", "Bins"];
const tabIcons: Record<string, React.ElementType> = { Warehouses: Layers, Zones: Layers, Racks: Layers, Shelves: Layers, Bins: Layers };

const features = [
  { icon: Eye, color: "stat-icon-blue", title: "Hierarchical View", desc: "Easily map your warehouse from global location down to individual picking bins." },
  { icon: Layers, color: "stat-icon-purple", title: "Smart Mapping", desc: "Automatic rack numbering based on zone configuration saves time during setup." },
  { icon: CheckCircle, color: "stat-icon-green", title: "Capacity Tracking", desc: "Monitor shelf load limits and bin volume utilization in real-time." },
];

export default function Infrastructure() {
  const [activeTab, setActiveTab] = useState("Warehouses");

  const createLabel = activeTab === "Warehouses" ? "Create Warehouse" :
    activeTab === "Zones" ? "Create Zone" :
    activeTab === "Racks" ? "Create Rack" : `Create ${activeTab.slice(0, -1)}`;

  const createLink = activeTab === "Warehouses" ? "/infrastructure/create-warehouse" :
    activeTab === "Zones" ? "/infrastructure/create-zone" : "#";

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Warehouse Management &gt; Infrastructure Setup</p>
          <h1 className="page-title text-xl">Warehouse Infrastructure Setup</h1>
          <p className="page-subtitle">Configure and manage your physical warehouse structure, from buildings to individual bins.</p>
        </div>
        <Link to={createLink} className="btn-primary flex items-center gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" /> {createLabel}
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mt-4 mb-6">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-item ${activeTab === tab ? "active" : ""}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="section-card mb-6">
        <div className="flex items-center justify-between gap-4">
          <SearchBar placeholder={`Search ${activeTab.toLowerCase()}...`} className="max-w-sm" />
          <div className="flex items-center gap-2">
            <button className="btn-outline flex items-center gap-1.5 text-xs"><Filter className="w-3.5 h-3.5" /> Filters</button>
            <button className="btn-outline flex items-center gap-1.5 text-xs"><Download className="w-3.5 h-3.5" /> Export</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="section-card mb-6 overflow-x-auto">
        {activeTab === "Warehouses" && <WarehousesTable />}
        {activeTab === "Zones" && <ZonesTable />}
        {activeTab === "Racks" && <RacksTable />}
        {activeTab === "Shelves" && <ShelvesTable />}
        {activeTab === "Bins" && <div className="p-8 text-center text-muted-foreground text-sm">No bins configured yet.</div>}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((f) => (
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

function ActionButtons() {
  return (
    <div className="flex items-center gap-1">
      <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
      <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-muted"><Trash2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
    </div>
  );
}

function WarehousesTable() {
  return (
    <>
      <table className="data-table">
        <thead><tr><th>Warehouse Code</th><th>Name</th><th>Type</th><th>Zones Count</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {warehouses.map((w) => (
            <tr key={w.code}>
              <td className="text-primary font-medium text-xs">{w.code}</td>
              <td>{w.name}</td>
              <td className="text-muted-foreground">{w.type}</td>
              <td>{w.zones}</td>
              <td><StatusBadge status={w.status} /></td>
              <td><ActionButtons /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination current={1} total={3} showingText="Showing 1 to 5 of 24 warehouses" />
    </>
  );
}

function ZonesTable() {
  return (
    <>
      <table className="data-table">
        <thead><tr><th>Zone Name</th><th>Warehouse</th><th>Type</th><th>Pick Priority</th><th>Put Away Priority</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {zones.map((z) => (
            <tr key={z.name}>
              <td className="text-primary font-medium text-xs">{z.name}</td>
              <td className="text-muted-foreground">{z.warehouse}</td>
              <td>{z.type}</td>
              <td>{z.pickPriority}</td>
              <td>{z.putAwayPriority}</td>
              <td><StatusBadge status={z.status} /></td>
              <td><ActionButtons /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination current={1} total={2} showingText="Showing 1 to 5 of 12 zones" />
    </>
  );
}

function RacksTable() {
  return (
    <>
      <table className="data-table">
        <thead><tr><th>Rack Code</th><th>Zone Name</th><th>Rack Type</th><th>Aisle</th><th>Pick Sequence</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {racks.map((r) => (
            <tr key={r.code}>
              <td className="text-primary font-medium text-xs">{r.code}</td>
              <td>{r.zone}</td>
              <td>{r.type}</td>
              <td className="text-muted-foreground">{r.aisle}</td>
              <td>{r.pickSeq}</td>
              <td><StatusBadge status={r.status} /></td>
              <td><ActionButtons /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination current={1} total={3} showingText="Showing 1 to 5 of 128 racks" />
    </>
  );
}

function ShelvesTable() {
  return (
    <>
      <table className="data-table">
        <thead><tr><th>Shelf Code</th><th>Rack Code</th><th>Level Number</th><th>Pick Sequence</th><th>Max Weight</th><th>Actions</th></tr></thead>
        <tbody>
          {shelves.map((s) => (
            <tr key={s.code}>
              <td className="text-primary font-medium text-xs">{s.code}</td>
              <td className="text-muted-foreground">{s.rack}</td>
              <td>{s.level}</td>
              <td>{s.pickSeq}</td>
              <td>{s.maxWeight}</td>
              <td><ActionButtons /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination current={1} total={3} showingText="Showing 1 to 5 of 24 shelves" />
    </>
  );
}
