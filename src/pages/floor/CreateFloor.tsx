import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { warehouseApi } from "@/services/warehouseApi";
import { useToast } from "@/hooks/use-toast";
import type { FloorRequest, FloorResponse, WareHouseResponse } from "@/types/api";

export default function CreateFloor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [warehouses, setWarehouses] = useState<WareHouseResponse[]>([]);
  const [formData, setFormData] = useState<FloorRequest>({
    warehouseId: 0,
    code: '',
    name: '',
    description: '',
    levelNo: 1,
    length: 0,
    width: 0,
    height: 0,
    accessType: 'NONE',
    temperatureControlled: false,
    minTemp: null,
    maxTemp: null,
    hazardousAllowed: false,
    restrictedAccess: false,
    isDefaultFloor: false,
    isActive: true,
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (isEditMode && editId) {
      loadFloorForEdit(parseInt(editId));
    }
  }, [isEditMode, editId]);

  const loadFloorForEdit = async (id: number) => {
    try {
      setInitialLoading(true);
      const floor = await warehouseApi.getFloorById(id);
      
      setFormData({
        warehouseId: floor.warehouseId,
        code: floor.code,
        name: floor.name,
        description: floor.description || '',
        levelNo: floor.levelNo,
        length: floor.length || 0,
        width: floor.width || 0,
        height: floor.height || 0,
        accessType: floor.accessType as any,
        temperatureControlled: floor.temperatureControlled,
        minTemp: floor.minTemp,
        maxTemp: floor.maxTemp,
        hazardousAllowed: floor.hazardousAllowed,
        restrictedAccess: floor.restrictedAccess,
        isDefaultFloor: floor.isDefaultFloor,
        isActive: floor.isActive,
      });
    } catch (err) {
      console.error('Failed to load floor for editing:', err);
      setError('Failed to load floor data for editing');
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
      const submitData: FloorRequest = {
        ...formData,
        minTemp: formData.temperatureControlled ? formData.minTemp : null,
        maxTemp: formData.temperatureControlled ? formData.maxTemp : null,
        length: formData.length || undefined,
        width: formData.width || undefined,
        height: formData.height || undefined,
      };

      console.log(`${isEditMode ? 'Updating' : 'Creating'} floor data:`, submitData);

      let result;
      if (isEditMode && editId) {
        // Update existing floor
        result = await warehouseApi.updateFloor(parseInt(editId), submitData);
        console.log('Floor updated successfully:', result);
        toast({
          title: "Success",
          description: "Floor updated successfully!",
          variant: "default",
        });
      } else {
        // Create new floor
        result = await warehouseApi.createFloor(submitData);
        console.log('Floor created successfully:', result);
        toast({
          title: "Success",
          description: "Floor created successfully!",
          variant: "default",
        });
      }
      
      // Navigate back to infrastructure page with Floors tab active
      navigate('/infrastructure?tab=Floors');
    } catch (err) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} floor:`, err);
      
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} floor`;
      
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

  const handleInputChange = (field: keyof FloorRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="w-full">
      {initialLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading floor data...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Infrastructure &gt; Floors &gt; {isEditMode ? 'Edit' : 'Create New'} Floor
              </p>
              <div className="flex items-center gap-3">
                <Link to="/infrastructure" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <h1 className="page-title">{isEditMode ? 'Edit' : 'Create New'} Floor</h1>
                  <p className="page-subtitle">
                    {isEditMode ? 'Update floor information and settings.' : 'Define a new floor level within your warehouse infrastructure.'}
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
                  <label className="text-xs font-medium mb-1 block">Floor Code *</label>
                  <input 
                    className="input-field" 
                    placeholder="e.g. FL-1"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Floor Name *</label>
                  <input 
                    className="input-field" 
                    placeholder="e.g. First Floor"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Level Number *</label>
                  <input 
                    className="input-field" 
                    type="number"
                    min="0"
                    value={formData.levelNo}
                    onChange={(e) => handleInputChange('levelNo', parseInt(e.target.value))}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Floor level (0 = Ground, 1 = First Floor, etc.)</p>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Access Type</label>
                  <select 
                    className="input-field"
                    value={formData.accessType}
                    onChange={(e) => handleInputChange('accessType', e.target.value)}
                  >
                    <option value="NONE">None</option>
                    <option value="STAIRS">Stairs</option>
                    <option value="ELEVATOR">Elevator</option>
                    <option value="RAMP">Ramp</option>
                    <option value="FORKLIFT_LIFT">Forklift Lift</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs font-medium mb-1 block">Description</label>
                <textarea 
                  className="input-field" 
                  rows={3}
                  placeholder="Additional notes about this floor..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
            </div>

            {/* Physical Dimensions */}
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">📐</span>
                Physical Dimensions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Length (m)</label>
                  <input 
                    className="input-field" 
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.length || ''}
                    onChange={(e) => handleInputChange('length', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Width (m)</label>
                  <input 
                    className="input-field" 
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.width || ''}
                    onChange={(e) => handleInputChange('width', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Height (m)</label>
                  <input 
                    className="input-field" 
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.height || ''}
                    onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Environmental Controls */}
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">🌡</span>
                Environmental Controls
              </h3>
              <div className="space-y-4">
                <ToggleRow 
                  label="Temperature Controlled" 
                  sub="Enable climate control for this floor"
                  value={formData.temperatureControlled}
                  onChange={(value) => handleInputChange('temperatureControlled', value)}
                />
                {formData.temperatureControlled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Min Temperature (°C)</label>
                      <input 
                        className="input-field" 
                        type="number"
                        step="0.1"
                        value={formData.minTemp || ''}
                        onChange={(e) => handleInputChange('minTemp', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Max Temperature (°C)</label>
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

            {/* Special Settings */}
            <div className="form-section">
              <h3 className="form-section-title">
                <span className="text-amber-500">⚠</span> Special Settings
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <ToggleRow 
                    label="Hazardous Materials Allowed" 
                    sub="Allow storage of hazardous materials on this floor" 
                    value={formData.hazardousAllowed}
                    onChange={(value) => handleInputChange('hazardousAllowed', value)}
                  />
                  <ToggleRow 
                    label="Restricted Access" 
                    sub="Limit access to authorized personnel only" 
                    value={formData.restrictedAccess}
                    onChange={(value) => handleInputChange('restrictedAccess', value)}
                  />
                </div>
                <div className="space-y-4">
                  <ToggleRow 
                    label="Default Floor" 
                    sub="Set as the default floor for this warehouse" 
                    value={formData.isDefaultFloor}
                    onChange={(value) => handleInputChange('isDefaultFloor', value)}
                  />
                  <ToggleRow 
                    label="Active Status" 
                    sub="Floor is operational and available for use" 
                    value={formData.isActive}
                    onChange={(value) => handleInputChange('isActive', value)}
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
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Floor' : 'Create Floor')}
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