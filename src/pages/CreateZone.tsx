import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function CreateZone() {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Infrastructure &gt; Zones &gt; Create New Zone</p>
          <div className="flex items-center gap-3">
            <Link to="/infrastructure" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="page-title">Create New Zone</h1>
              <p className="page-subtitle">Define a new operational area within your warehouse infrastructure.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Details */}
      <div className="form-section">
        <h3 className="form-section-title">
          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">i</span>
          Basic Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Warehouse Selection</label>
            <select className="input-field"><option>Select Warehouse</option><option>WH-MAIN-01</option><option>WH-COLD-02</option></select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Zone Name</label>
            <input className="input-field" placeholder="e.g. FAST-PICK-A" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Zone Type</label>
            <select className="input-field"><option>STORAGE</option><option>PICKING</option><option>REFRIGERATED</option><option>STAGING</option><option>QUALITY_CONTROL</option></select>
          </div>
        </div>
      </div>

      {/* Operational Priorities */}
      <div className="form-section">
        <h3 className="form-section-title">Operational Priorities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Pick Priority</label>
            <input className="input-field" defaultValue="1 (highest)" />
            <p className="text-xs text-muted-foreground mt-1">Determines sequence for automated picking routes.</p>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Put Away Priority</label>
            <input className="input-field" defaultValue="1 (highest)" />
            <p className="text-xs text-muted-foreground mt-1">Determines preferred zones for incoming stock.</p>
          </div>
        </div>
      </div>

      {/* Environmental + Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="form-section mb-0">
          <h3 className="form-section-title">Environmental Controls</h3>
          <div className="space-y-4">
            <ToggleRow label="Temperature Controlled" defaultOn={false} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Min Temp (°C)</label>
                <input className="input-field" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Max Temp (°C)</label>
                <input className="input-field" />
              </div>
            </div>
          </div>
        </div>
        <div className="form-section mb-0">
          <h3 className="form-section-title">Capacity Limits</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Max Weight Capacity (kg)</label>
              <input className="input-field" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Max Volume (m³)</label>
              <input className="input-field" />
            </div>
          </div>
        </div>
      </div>

      {/* Special Handling */}
      <div className="form-section">
        <h3 className="form-section-title">
          <span className="text-amber-500">⚠</span> Special Handling
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ToggleRow label="Hazardous Materials" sub="Requires specialized safety equipment" defaultOn={false} />
            <div>
              <label className="text-xs font-medium mb-1 block">Hazard Class</label>
              <select className="input-field"><option>None</option></select>
            </div>
          </div>
          <div>
            <ToggleRow label="Restricted Access" sub="Limits entry to personnel with specific zone-clearance badges." defaultOn={false} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link to="/infrastructure" className="btn-outline">Cancel</Link>
        <button className="btn-primary">Create Zone</button>
      </div>
    </div>
  );
}

function ToggleRow({ label, sub, defaultOn = false }: { label: string; sub?: string; defaultOn?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
      <button className={`w-10 h-5 rounded-full transition-colors relative ${defaultOn ? "bg-primary" : "bg-border"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform ${defaultOn ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}
