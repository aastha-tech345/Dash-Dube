import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { warehouseApi } from "@/services/warehouseApi";
import { useToast } from "@/hooks/use-toast";
import type { WareHouseRequest, WareHouseResponse } from "@/types/api";

export default function CreateWarehouse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [formData, setFormData] = useState<WareHouseRequest>({
    code: '',
    name: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    qcRequired: false,
    binTrackingEnabled: true,
    isActive: true,
    description: '',
    warehouseType: 'NORMAL',
    defaultPickStrategy: 'FIFO',
    allowNegativeStock: false,
    openTime: '08:00:00',
    closeTime: '20:00:00',
    latitude: 0,
    longitude: 0,
    totalCapacityWeight: 10000,
    totalCapacityVolume: 5000,
    locationId: 1,
  });

  // Load warehouse data for editing
  useEffect(() => {
    if (isEditMode && editId) {
      loadWarehouseForEdit(parseInt(editId));
    }
  }, [isEditMode, editId]);

  const loadWarehouseForEdit = async (id: number) => {
    try {
      setInitialLoading(true);
      const warehouse = await warehouseApi.getWarehouseById(id);
      
      // Convert warehouse response to request format
      setFormData({
        code: warehouse.code,
        name: warehouse.name,
        address: warehouse.address,
        contactPerson: warehouse.contactPerson || '',
        contactPhone: warehouse.contactPhone || '',
        contactEmail: warehouse.contactEmail || '',
        qcRequired: warehouse.qcRequired,
        binTrackingEnabled: warehouse.binTrackingEnabled,
        isActive: warehouse.isActive,
        description: warehouse.description || '',
        warehouseType: warehouse.warehouseType as any,
        defaultPickStrategy: warehouse.defaultPickStrategy as any,
        allowNegativeStock: warehouse.allowNegativeStock,
        openTime: warehouse.openTime || '08:00:00',
        closeTime: warehouse.closeTime || '20:00:00',
        latitude: warehouse.latitude || 0,
        longitude: warehouse.longitude || 0,
        totalCapacityWeight: warehouse.totalCapacityWeight || 10000,
        totalCapacityVolume: warehouse.totalCapacityVolume || 5000,
        locationId: warehouse.locationId,
      });
    } catch (err) {
      console.error('Failed to load warehouse for editing:', err);
      setError('Failed to load warehouse data for editing');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Refresh token in warehouseApi
      warehouseApi.refreshToken();

      console.log(`${isEditMode ? 'Updating' : 'Creating'} warehouse data:`, formData);

      let result;
      if (isEditMode && editId) {
        // Update existing warehouse
        result = await warehouseApi.updateWarehouse(parseInt(editId), formData);
        console.log('Warehouse updated successfully:', result);
        toast({
          title: "Success",
          description: "Warehouse updated successfully!",
          variant: "default",
        });
      } else {
        // Create new warehouse
        result = await warehouseApi.createWarehouse(formData);
        console.log('Warehouse created successfully:', result);
        toast({
          title: "Success",
          description: "Warehouse created successfully!",
          variant: "default",
        });
      }
      
      // Navigate back to infrastructure page
      navigate('/infrastructure');
    } catch (err) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} warehouse:`, err);
      
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} warehouse`;
      
      if (err instanceof Error) {
        if (err.message.includes('405')) {
          errorMessage = `The warehouse ${isEditMode ? 'update' : 'creation'} endpoint is not available on the server yet. Please contact your administrator.`;
        } else if (err.message.includes('401') || err.message.includes('403')) {
          errorMessage = 'Authentication failed. Please login again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof WareHouseRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="w-full">
      {initialLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading warehouse data...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Warehouse Management &gt; Infrastructure Setup &gt; {isEditMode ? 'Edit' : 'Create'} Warehouse
              </p>
              <div className="flex items-center gap-3">
                <Link to="/infrastructure" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <h1 className="page-title">{isEditMode ? 'Edit' : 'Create New'} Warehouse</h1>
                  <p className="page-subtitle">
                    {isEditMode ? 'Update warehouse information and settings.' : 'Register a new physical facility in the global network.'}
                  </p>
                </div>
              </div>
            </div>
            <Link to="/infrastructure" className="text-sm text-muted-foreground hover:text-foreground">Back to Infrastructure</Link>
          </div>

      {/* Error Message */}
      {error && (
        <div className="form-section mb-6 p-4 bg-red-50 border-red-200">
          <p className="text-red-600 text-sm">Error: {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="form-section">
          <h3 className="form-section-title">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">i</span>
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Warehouse Code *</label>
              <input 
                className="input-field" 
                placeholder="e.g. WH-USA-001"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Warehouse Name *</label>
              <input 
                className="input-field" 
                placeholder="e.g. California Central Hub"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Warehouse Type</label>
              <select 
                className="input-field"
                value={formData.warehouseType}
                onChange={(e) => handleInputChange('warehouseType', e.target.value)}
              >
                <option value="NORMAL">Normal</option>
                <option value="COLD_STORAGE">Cold Storage</option>
                <option value="BONDED">Bonded</option>
                <option value="DISTRIBUTION_CENTER">Distribution Center</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-medium mb-1 block">Address *</label>
            <input 
              className="input-field" 
              placeholder="Full warehouse address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Contact + Operational */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="form-section mb-0">
            <h3 className="form-section-title">Contact Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Contact Person</label>
                <input 
                  className="input-field" 
                  placeholder="Full name"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Phone Number</label>
                  <input 
                    className="input-field" 
                    placeholder="+1 (555) 000-0000"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Email Address</label>
                  <input 
                    className="input-field" 
                    placeholder="email@example.com"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section mb-0">
            <h3 className="form-section-title">Operational Settings</h3>
            <div className="space-y-4">
              <ToggleRow 
                label="Quality Control (QC) Required" 
                sub="Enable mandatory check for incoming stock" 
                value={formData.qcRequired}
                onChange={(value) => handleInputChange('qcRequired', value)}
              />
              <ToggleRow 
                label="Bin Tracking" 
                sub="Track items at the individual bin level" 
                value={formData.binTrackingEnabled}
                onChange={(value) => handleInputChange('binTrackingEnabled', value)}
              />
              <ToggleRow 
                label="Allow Negative Stock" 
                sub="Allow sales if physical stock is unavailable" 
                value={formData.allowNegativeStock}
                onChange={(value) => handleInputChange('allowNegativeStock', value)}
              />
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="form-section">
          <h3 className="form-section-title">Capacity & Logistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Operating Hours (Start)</label>
              <input 
                className="input-field" 
                type="time"
                value={formData.openTime}
                onChange={(e) => handleInputChange('openTime', e.target.value + ':00')}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Operating Hours (End)</label>
              <input 
                className="input-field" 
                type="time"
                value={formData.closeTime}
                onChange={(e) => handleInputChange('closeTime', e.target.value + ':00')}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Total Capacity Weight (kg)</label>
              <input 
                className="input-field" 
                type="number"
                value={formData.totalCapacityWeight}
                onChange={(e) => handleInputChange('totalCapacityWeight', parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Latitude</label>
              <input 
                className="input-field" 
                type="number"
                step="0.000001"
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Longitude</label>
              <input 
                className="input-field" 
                type="number"
                step="0.000001"
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Total Capacity Volume (m³)</label>
              <input 
                className="input-field" 
                type="number"
                value={formData.totalCapacityVolume}
                onChange={(e) => handleInputChange('totalCapacityVolume', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Pick Strategy */}
        <div className="form-section">
          <h3 className="form-section-title">Pick Strategy</h3>
          <div>
            <label className="text-xs font-medium mb-1 block">Default Pick Strategy</label>
            <select 
              className="input-field max-w-sm"
              value={formData.defaultPickStrategy}
              onChange={(e) => handleInputChange('defaultPickStrategy', e.target.value)}
            >
              <option value="FIFO">FIFO (First In First Out)</option>
              <option value="LIFO">LIFO (Last In First Out)</option>
              <option value="FEFO">FEFO (First Expired First Out)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="form-section">
          <h3 className="form-section-title">Description</h3>
          <div>
            <label className="text-xs font-medium mb-1 block">Additional Notes</label>
            <textarea 
              className="input-field" 
              rows={3}
              placeholder="Any additional information about this warehouse..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>
        </div>

          <div className="flex items-center justify-end gap-3">
            <Link to="/infrastructure" className="btn-outline">Cancel</Link>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Warehouse' : 'Save Warehouse')}
            </button>
          </div>
        </form>
        </>
      )}
    </div>
  );
}

function ToggleRow({ 
  label, 
  sub, 
  value, 
  onChange 
}: { 
  label: string; 
  sub: string; 
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <button 
        type="button"
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors relative ${value ? "bg-primary" : "bg-border"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform ${value ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}
