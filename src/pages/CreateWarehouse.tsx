import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function CreateWarehouse() {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Warehouse Management &gt; Infrastructure Setup &gt; Create Warehouse</p>
          <div className="flex items-center gap-3">
            <Link to="/infrastructure" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="page-title">Create New Warehouse</h1>
              <p className="page-subtitle">Register a new physical facility in the global network.</p>
            </div>
          </div>
        </div>
        <Link to="/infrastructure" className="text-sm text-muted-foreground hover:text-foreground">Back to Infrastructure</Link>
      </div>

      {/* Basic Info */}
      <div className="form-section">
        <h3 className="form-section-title">
          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">i</span>
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Warehouse Code</label>
            <input className="input-field" placeholder="e.g. WH-USA-001" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Warehouse Name</label>
            <input className="input-field" placeholder="e.g. California Central Hub" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Warehouse Type</label>
            <select className="input-field"><option>Select Type</option><option>Main Facility</option><option>Refrigerated</option><option>3PL Partner</option><option>Processing</option><option>Satellite Facility</option></select>
          </div>
        </div>
      </div>

      {/* Contact + Operational */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="form-section mb-0">
          <h3 className="form-section-title">Contact Details</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Contact Person</label>
              <input className="input-field" placeholder="Full name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Phone Number</label>
                <input className="input-field" placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Email Address</label>
                <input className="input-field" placeholder="email@example.com" />
              </div>
            </div>
          </div>
        </div>

        <div className="form-section mb-0">
          <h3 className="form-section-title">Operational Settings</h3>
          <div className="space-y-4">
            <ToggleRow label="Quality Control (QC) Required" sub="Enable mandatory check for incoming stock" defaultOn={false} />
            <ToggleRow label="Bin Tracking" sub="Track items at the individual bin level" defaultOn={true} />
            <ToggleRow label="Allow Negative Stock" sub="Allow sales if physical stock is unavailable" defaultOn={false} />
          </div>
        </div>
      </div>

      {/* Capacity */}
      <div className="form-section">
        <h3 className="form-section-title">Capacity & Logistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Operating Hours (Start)</label>
            <input className="input-field" defaultValue="08:00 AM" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Operating Hours (End)</label>
            <input className="input-field" defaultValue="08:00 PM" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Total Capacity Weight (kg)</label>
            <input className="input-field" defaultValue="10000" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Latitude</label>
            <input className="input-field" defaultValue="34.0522" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Longitude</label>
            <input className="input-field" defaultValue="-118.2437" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Total Capacity Volume (m³)</label>
            <input className="input-field" defaultValue="5000" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link to="/infrastructure" className="btn-outline">Cancel</Link>
        <button className="btn-primary">Save Warehouse</button>
      </div>
    </div>
  );
}

function ToggleRow({ label, sub, defaultOn }: { label: string; sub: string; defaultOn: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <button className={`w-10 h-5 rounded-full transition-colors relative ${defaultOn ? "bg-primary" : "bg-border"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform ${defaultOn ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}
