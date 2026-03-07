import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { warehouseApi } from "@/services/warehouseApi";
import { useToast } from "@/hooks/use-toast";
import type { ZoneRequest, ZoneResponse, WareHouseResponse, FloorResponse } from "@/types/api";

export default function CreateZone() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [warehouses, setWarehouses] = useState<WareHouseResponse[]>([]);
  const [floors, setFloors] = useState<FloorResponse[]>([]);
  const [formData, setFormData] = useState<ZoneRequest>({
    warehouseId: 0,
    floorId: 0,
    name: '',
    zoneType: 'STORAGE',
    pickPriority: 1,
    putAwayPriority: 1,
    fastMovingZone: false,
    temperatureControlled: false,
    minTemp: null,
    maxTemp: null,
    hazardous: false,
    hazardClass: null,
    restrictedAccess: false,
    isActive: true,
    maxWeight: 0,
    maxVolume: 0,
    description: '',
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (isEditMode && editId) {
      loadZoneForEdit(parseInt(editId));
    }
  }, [isEditMode, editId]);

  useEffect(() => {
    if (formData.warehouseId > 0) {
      fetchFloors(formData.warehouseId);
    }
  }, [formData.warehouseId]);

  const loadZoneForEdit = async (id: number) => {
    try {
      setInitialLoading(true);
      const zone = await warehouseApi.getZoneById(id);
      
      setFormData({
        warehouseId: zone.warehouseId,
        floorId: zone.floorId,
        name: zone.name,
        zoneType: zone.zoneType as any,
        pickPriority: zone.pickPriority,
        putAwayPriority: zone.putAwayPriority,
        fastMovingZone: zone.fastMovingZone,
        temperatureControlled: zone.temperatureControlled,
        minTemp: zone.minTemp,
        maxTemp: zone.maxTemp,
        hazardous: zone.hazardous,
        hazardClass: zone.hazardClass,
        restrictedAccess: zone.restrictedAccess,
        isActive: zone.isActive,
        maxWeight: zone.maxWeight || 0,
        maxVolume: zone.maxVolume || 0,
        description: zone.description || '',
      });
    } catch (err) {
      console.error('Failed to load zone for editing:', err);
      setError('Failed to load zone data for editing');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await warehouseApi.getWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    }
  };

  const fetchFloors = async (warehouseId: number) => {
    try {
      console.log('Fetching floors for warehouse:', warehouseId);
      const data = await warehouseApi.getFloorsByWarehouse(warehouseId);
      console.log('Floors fetched:', data);
      setFloors(data);
      
      // If no floors exist, show message
      if (data.length === 0) {
        console.warn('No floors found for warehouse ID:', warehouseId);
        toast({
          title: "No Floors Found",
          description: "Please create a floor for this warehouse first.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Failed to fetch floors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch floors. Please try again.",
        variant: "destructive",
      });
      setFloors([]);
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

      // Prepare data - ensure null values for optional fields when not used
      const submitData: ZoneRequest = {
        ...formData,
        minTemp: formData.temperatureControlled ? formData.minTemp : null,
        maxTemp: formData.temperatureControlled ? formData.maxTemp : null,
        hazardClass: formData.hazardous ? formData.hazardClass : null,
      };

      console.log(`${isEditMode ? 'Updating' : 'Creating'} zone data:`, submitData);

      let result;
      if (isEditMode && editId) {
        // Update existing zone
        result = await warehouseApi.updateZone(parseInt(editId), submitData);
        console.log('Zone updated successfully:', result);
        toast({
          title: "Success",
          description: "Zone updated successfully!",
          variant: "default",
        });
      } else {
        // Create new zone
        result = await warehouseApi.createZone(submitData);
        console.log('Zone created successfully:', result);
        toast({
          title: "Success",
          description: "Zone created successfully!",
          variant: "default",
        });
      }
      
      // Navigate back to infrastructure page with Zones tab active
      navigate('/infrastructure?tab=Zones');
    } catch (err) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} zone:`, err);
      
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} zone`;
      
      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.includes('403')) {
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

  const handleInputChange = (field: keyof ZoneRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="w-full">
      {initialLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading zone data...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Infrastructure &gt; Zones &gt; {isEditMode ? 'Edit' : 'Create New'} Zone
              </p>
              <div className="flex items-center gap-3">
                <Link to="/infrastructure" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <h1 className="page-title">{isEditMode ? 'Edit' : 'Create New'} Zone</h1>
                  <p className="page-subtitle">
                    {isEditMode ? 'Update zone information and settings.' : 'Define a new operational area within your warehouse infrastructure.'}
                  </p>
                </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="form-section mb-6 p-4 bg-red-50 border-red-200">
          <p className="text-red-600 text-sm">Error: {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Details */}
        <div className="form-section">
          <h3 className="form-section-title">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">i</span>
            Basic Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Warehouse Selection *</label>
              <select 
                className="input-field"
                value={formData.warehouseId}
                onChange={(e) => handleInputChange('warehouseId', parseInt(e.target.value))}
                required
              >
                <option value={0}>Select Warehouse</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Floor *</label>
              <div className="flex gap-2">
                <select 
                  className="input-field flex-1"
                  value={formData.floorId}
                  onChange={(e) => handleInputChange('floorId', parseInt(e.target.value))}
                  required
                  disabled={!formData.warehouseId}
                >
                  <option value={0}>
                    {!formData.warehouseId ? 'Select Warehouse First' : floors.length === 0 ? 'No Floors Available' : 'Select Floor'}
                  </option>
                  {floors.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name} (Level {floor.levelNo})
                    </option>
                  ))}
                </select>
                {formData.warehouseId > 0 && floors.length === 0 && (
                  <Link 
                    to="/infrastructure?tab=Floors" 
                    className="btn-outline whitespace-nowrap"
                    title="Create Floor First"
                  >
                    + Floor
                  </Link>
                )}
              </div>
              {formData.warehouseId > 0 && floors.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No floors found. Please create a floor for this warehouse first.
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Zone Name *</label>
              <input 
                className="input-field" 
                placeholder="e.g. FAST-PICK-A"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-medium mb-1 block">Zone Type</label>
            <select 
              className="input-field max-w-sm"
              value={formData.zoneType}
              onChange={(e) => handleInputChange('zoneType', e.target.value)}
            >
              <option value="STORAGE">Storage</option>
              <option value="RECEIVING">Receiving</option>
              <option value="QC">QC (Quality Control)</option>
              <option value="QUARANTINE">Quarantine</option>
              <option value="DISPATCH">Dispatch</option>
              <option value="RETURNS">Returns</option>
              <option value="PRODUCTION_STAGING">Production Staging</option>
            </select>
          </div>
        </div>

        {/* Operational Priorities */}
        <div className="form-section">
          <h3 className="form-section-title">Operational Priorities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Pick Priority</label>
              <input 
                className="input-field" 
                type="number"
                min="1"
                value={formData.pickPriority}
                onChange={(e) => handleInputChange('pickPriority', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground mt-1">Determines sequence for automated picking routes.</p>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Put Away Priority</label>
              <input 
                className="input-field" 
                type="number"
                min="1"
                value={formData.putAwayPriority}
                onChange={(e) => handleInputChange('putAwayPriority', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground mt-1">Determines preferred zones for incoming stock.</p>
            </div>
          </div>
        </div>

        {/* Environmental + Capacity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="form-section mb-0">
            <h3 className="form-section-title">Environmental Controls</h3>
            <div className="space-y-4">
              <ToggleRow 
                label="Temperature Controlled" 
                value={formData.temperatureControlled}
                onChange={(value) => handleInputChange('temperatureControlled', value)}
              />
              {formData.temperatureControlled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Min Temp (°C)</label>
                    <input 
                      className="input-field" 
                      type="number"
                      step="0.1"
                      value={formData.minTemp || ''}
                      onChange={(e) => handleInputChange('minTemp', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Max Temp (°C)</label>
                    <input 
                      className="input-field" 
                      type="number"
                      step="0.1"
                      value={formData.maxTemp || ''}
                      onChange={(e) => handleInputChange('maxTemp', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="form-section mb-0">
            <h3 className="form-section-title">Capacity Limits</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Max Weight Capacity (kg)</label>
                <input 
                  className="input-field" 
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxWeight}
                  onChange={(e) => handleInputChange('maxWeight', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Max Volume (m³)</label>
                <input 
                  className="input-field" 
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxVolume}
                  onChange={(e) => handleInputChange('maxVolume', parseFloat(e.target.value))}
                />
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
              <ToggleRow 
                label="Hazardous Materials" 
                sub="Requires specialized safety equipment" 
                value={formData.hazardous}
                onChange={(value) => handleInputChange('hazardous', value)}
              />
              {formData.hazardous && (
                <div>
                  <label className="text-xs font-medium mb-1 block">Hazard Class</label>
                  <input 
                    className="input-field"
                    placeholder="e.g., Class 3 - Flammable Liquids"
                    value={formData.hazardClass || ''}
                    onChange={(e) => handleInputChange('hazardClass', e.target.value)}
                  />
                </div>
              )}
            </div>
            <div>
              <ToggleRow 
                label="Restricted Access" 
                sub="Limits entry to personnel with specific zone-clearance badges." 
                value={formData.restrictedAccess}
                onChange={(value) => handleInputChange('restrictedAccess', value)}
              />
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="form-section">
          <h3 className="form-section-title">Additional Settings</h3>
          <div className="space-y-4">
            <ToggleRow 
              label="Fast Moving Zone" 
              sub="Prioritize this zone for high-velocity items" 
              value={formData.fastMovingZone}
              onChange={(value) => handleInputChange('fastMovingZone', value)}
            />
            <div>
              <label className="text-xs font-medium mb-1 block">Description</label>
              <textarea 
                className="input-field" 
                rows={3}
                placeholder="Additional notes about this zone..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link to="/infrastructure" className="btn-outline">Cancel</Link>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Zone' : 'Create Zone')}
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
  sub?: string; 
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
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
