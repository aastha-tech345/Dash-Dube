import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Filter, Download, Pencil, Trash2, Eye, Layers, CheckCircle, Search } from "lucide-react";
import { warehouses as initWarehouses, zones as initZones, racks as initRacks, shelves as initShelves } from "@/data/mockData";
import StatusBadge from "@/components/shared/StatusBadge";
import Pagination from "@/components/shared/Pagination";

const tabs = ["Warehouses", "Zones", "Racks", "Shelves", "Bins"];

const features = [
  { icon: Eye, color: "stat-icon-blue", title: "Hierarchical View", desc: "Easily map your warehouse from global location down to individual picking bins." },
  { icon: Layers, color: "stat-icon-purple", title: "Smart Mapping", desc: "Automatic rack numbering based on zone configuration saves time during setup." },
  { icon: CheckCircle, color: "stat-icon-green", title: "Capacity Tracking", desc: "Monitor shelf load limits and bin volume utilization in real-time." },
];

export default function Infrastructure() {
  const [activeTab, setActiveTab] = useState("Warehouses");
  const [search, setSearch] = useState("");
  const [warehouseData, setWarehouseData] = useState(initWarehouses);
  const [zoneData, setZoneData] = useState(initZones);
  const [rackData, setRackData] = useState(initRacks);
  const [shelfData, setShelfData] = useState(initShelves);

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
          <button key={tab} onClick={() => { setActiveTab(tab); setSearch(""); }} className={`tab-item ${activeTab === tab ? "active" : ""}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Search + Filters */}
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
            <button className="btn-outline flex items-center gap-1.5 text-xs"><Filter className="w-3.5 h-3.5" /> Filters</button>
            <button className="btn-outline flex items-center gap-1.5 text-xs"><Download className="w-3.5 h-3.5" /> Export</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="section-card mb-6 overflow-x-auto">
        {activeTab === "Warehouses" && <WarehousesTable data={warehouseData} search={search} onDelete={(code) => setWarehouseData((d) => d.filter((w) => w.code !== code))} />}
        {activeTab === "Zones" && <ZonesTable data={zoneData} search={search} onDelete={(name) => setZoneData((d) => d.filter((z) => z.name !== name))} />}
        {activeTab === "Racks" && <RacksTable data={rackData} search={search} onDelete={(code) => setRackData((d) => d.filter((r) => r.code !== code))} />}
        {activeTab === "Shelves" && <ShelvesTable data={shelfData} search={search} onDelete={(code) => setShelfData((d) => d.filter((s) => s.code !== code))} />}
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

function ActionButtons({ onDelete }: { onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
      <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-muted" onClick={onDelete}><Trash2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
    </div>
  );
}

function WarehousesTable({ data, search, onDelete }: { data: typeof initWarehouses; search: string; onDelete: (code: string) => void }) {
  const filtered = data.filter((w) => !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.code.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <table className="data-table">
        <thead><tr><th>Warehouse Code</th><th>Name</th><th>Type</th><th>Zones Count</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {filtered.map((w) => (
            <tr key={w.code}>
              <td className="text-primary font-medium text-xs">{w.code}</td>
              <td>{w.name}</td>
              <td className="text-muted-foreground">{w.type}</td>
              <td>{w.zones}</td>
              <td><StatusBadge status={w.status} /></td>
              <td><ActionButtons onDelete={() => onDelete(w.code)} /></td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan={6} className="text-center text-muted-foreground py-8">No results found.</td></tr>}
        </tbody>
      </table>
      {filtered.length > 0 && <Pagination current={1} total={1} showingText={`Showing ${filtered.length} of ${data.length} warehouses`} />}
    </>
  );
}

function ZonesTable({ data, search, onDelete }: { data: typeof initZones; search: string; onDelete: (name: string) => void }) {
  const filtered = data.filter((z) => !search || z.name.toLowerCase().includes(search.toLowerCase()) || z.warehouse.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <table className="data-table">
        <thead><tr><th>Zone Name</th><th>Warehouse</th><th>Type</th><th>Pick Priority</th><th>Put Away Priority</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {filtered.map((z) => (
            <tr key={z.name}>
              <td className="text-primary font-medium text-xs">{z.name}</td>
              <td className="text-muted-foreground">{z.warehouse}</td>
              <td>{z.type}</td>
              <td>{z.pickPriority}</td>
              <td>{z.putAwayPriority}</td>
              <td><StatusBadge status={z.status} /></td>
              <td><ActionButtons onDelete={() => onDelete(z.name)} /></td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-8">No results found.</td></tr>}
        </tbody>
      </table>
      {filtered.length > 0 && <Pagination current={1} total={1} showingText={`Showing ${filtered.length} of ${data.length} zones`} />}
    </>
  );
}

function RacksTable({ data, search, onDelete }: { data: typeof initRacks; search: string; onDelete: (code: string) => void }) {
  const filtered = data.filter((r) => !search || r.code.toLowerCase().includes(search.toLowerCase()) || r.zone.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <table className="data-table">
        <thead><tr><th>Rack Code</th><th>Zone Name</th><th>Rack Type</th><th>Aisle</th><th>Pick Sequence</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.code}>
              <td className="text-primary font-medium text-xs">{r.code}</td>
              <td>{r.zone}</td>
              <td>{r.type}</td>
              <td className="text-muted-foreground">{r.aisle}</td>
              <td>{r.pickSeq}</td>
              <td><StatusBadge status={r.status} /></td>
              <td><ActionButtons onDelete={() => onDelete(r.code)} /></td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-8">No results found.</td></tr>}
        </tbody>
      </table>
      {filtered.length > 0 && <Pagination current={1} total={1} showingText={`Showing ${filtered.length} of ${data.length} racks`} />}
    </>
  );
}

function ShelvesTable({ data, search, onDelete }: { data: typeof initShelves; search: string; onDelete: (code: string) => void }) {
  const filtered = data.filter((s) => !search || s.code.toLowerCase().includes(search.toLowerCase()) || s.rack.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <table className="data-table">
        <thead><tr><th>Shelf Code</th><th>Rack Code</th><th>Level Number</th><th>Pick Sequence</th><th>Max Weight</th><th>Actions</th></tr></thead>
        <tbody>
          {filtered.map((s) => (
            <tr key={s.code}>
              <td className="text-primary font-medium text-xs">{s.code}</td>
              <td className="text-muted-foreground">{s.rack}</td>
              <td>{s.level}</td>
              <td>{s.pickSeq}</td>
              <td>{s.maxWeight}</td>
              <td><ActionButtons onDelete={() => onDelete(s.code)} /></td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan={5} className="text-center text-muted-foreground py-8">No results found.</td></tr>}
        </tbody>
      </table>
      {filtered.length > 0 && <Pagination current={1} total={1} showingText={`Showing ${filtered.length} of ${data.length} shelves`} />}
    </>
  );
}
