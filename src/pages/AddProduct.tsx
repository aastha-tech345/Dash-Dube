import { Link } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";

export default function AddProduct() {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Add New Product</h1>
        </div>
      </div>

      {/* Image Upload */}
      <div className="form-section">
        <h3 className="form-section-title">Product Image</h3>
        <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center">
          <Upload className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium cursor-pointer">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP (MAX. 800×400px)</p>
        </div>
      </div>

      {/* General Info + Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="form-section mb-0">
          <h3 className="form-section-title">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">i</span>
            General Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Product Name</label>
              <input className="input-field" placeholder="e.g. Wireless Keyboard K10" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">SKU</label>
              <input className="input-field" defaultValue="WKK-001" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Barcode (EAN/UPC)</label>
              <input className="input-field" defaultValue="123456789012" />
            </div>
          </div>
        </div>

        <div className="form-section mb-0">
          <h3 className="form-section-title">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">$</span>
            Pricing & Tax
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Purchase Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <input className="input-field pl-7" defaultValue="0.00" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Sale Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <input className="input-field pl-7" defaultValue="0.00" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Tax Percentage (%)</label>
              <select className="input-field">
                <option>0% (Exempt)</option>
                <option>5%</option>
                <option>10%</option>
                <option>18%</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="radio" name="tax" className="accent-primary" /> Prices include tax
            </label>
          </div>
        </div>
      </div>

      {/* Tracking */}
      <div className="form-section">
        <h3 className="form-section-title">Tracking & Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Batch Number</label>
            <input className="input-field" defaultValue="B-2024-001" />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Serial Number</label>
            <input className="input-field" defaultValue="SN-8829-XJ" />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Expiry Date</label>
            <input type="date" className="input-field" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link to="/inventory" className="btn-outline">Cancel</Link>
        <button className="btn-primary flex items-center gap-2">
          <RefreshIcon /> Save Product
        </button>
      </div>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}
