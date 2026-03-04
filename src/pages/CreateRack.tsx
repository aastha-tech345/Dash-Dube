import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { warehouseApi } from "@/services/warehouseApi";
import { useToast } from "@/hooks/use-toast";
import type { RackRequest, ZoneResponse } from "@/types/api";

export default function CreateRack() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const [formData, setFormData] = useState<RackRequest>({
    zoneId: 0,
    rackCode: '',
    rackType: 'STORAGE',
    aisle: '',
    pickSequence: 1,
    maxWeight: 0,
    maxVolume: 0,
    isActive: true,
    description: '',
  });

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    if (isEditMode && editId) {
      loadRackForEdit(parseInt(editId));
    }
  }, [isEditMode, editId]);

  const loadRackForEdit = async (id: number) => {
    try {
      setInitialLoading(true);
      const rack = await warehouseApi.getRackById(id);
      
      setFormData({
        zoneId: rack.zoneId,
        rackCode: rack.rackCode,
        rackType: rack.rackType as any,
        aisle: rack.aisle || '',
        pickSequence: rack.pickSequence || 1,
        maxWeight: rack.maxWeight || 0,
        maxVolume: rack.maxVolume || 0,
        isActive: rack.isActive,
        description: rack.description || '',
      });
    } catch (err) {
      console.error('Failed to load rack for editing:', err);
      setError('Failed to load rack data for editing');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchZones = async () => {
    try {
      const data = await warehouseApi.getZones();
      setZones(data);
    } catch (error) {
      console.error('Failed to fetch zones:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      warehouseApi.refreshToken();

      console.log(`${isEditMode ? 'Updating' : 'Creating'} rack data:`, formData);

      let result;
      if (isEditMode && editId) {
        result = await warehouseApi.updateRack(parseInt(editId), formData);
        console.log('Rack updated successfully:', result);
        toast({
          title: "Success",
          description: "Rack updated successfully!",
          variant: "default",
        });
      } else {
        result = await warehouseApi.createRack(formData);
        console.log('Rack created successfully:', result);
        toast({
          title: "Success",
          description: "Rack created successfully!",
          variant: "default",
        });
      }
      
      navigate('/infrastructure');
    } catch (err) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} rack:`, err);
      
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} rack`;
      
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

  const handleInputChange = (field: keyof RackRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="w-full">
      {initialLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading rack data...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Infrastructure &gt; Racks &gt; {isEditMode ? 'Edit' : 'Create New'} Rack
              </p>
              <div className="flex items-center gap-3">
                <Link to="/infrastructure" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <h1 className="page-title">{isEditMode ? 'Edit' : 'Create New'} Rack</h1>
                  <p className="page-subtitle">
                    {isEditMode ? 'Update rack information and settings.' : 'Define a new storage rack within your warehouse zone.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

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
                  <label className="text-xs font-medium mb-1 block">Zone Selection *</label>
                  <select 
                    className="input-field"
                    value={formData.zoneId}
                    onChange={(e) => handleInputChange('zoneId', parseInt(e.target.value))}
                    required
                  >
                    <option value={0}>Select Zone</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} ({zone.zoneType})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Rack Code *</label>
                  <input 
                    className="input-field" 
                    placeholder="e.g. R-A-001"
                    value={formData.rackCode}
                    onChange={(e) => handleInputChange('rackCode', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Rack Type</label>
                  <select 
                    className="input-field"
                    value={formData.rackType}
                    onChange={(e) => handleInputChange('rackType', e.target.value)}
                  >
                    <option value="STORAGE">Storage</option>
                    <option value="PALLET">Pallet</option>
                    <option value="CANTILEVER">Cantilever</option>
                    <option value="MEZZANINE">Mezzanine</option>
                    <option value="MOBILE">Mobile</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Aisle</label>
                  <input 
                    className="input-field" 
                    placeholder="e.g. A1, B2"
                    value={formData.aisle}
                    onChange={(e) => handleInputChange('aisle', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Pick Sequence</label>
                  <input 
                    className="input-field" 
                    type="number"
                    min="1"
                    value={formData.pickSequence}
                    onChange={(e) => handleInputChange('pickSequence', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Determines sequence for automated picking routes.</p>
                </div>
              </div>
            </div>

            {/* Capacity Limits */}
            <div className="form-section">
              <h3 className="form-section-title">Capacity Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Max Weight (kg)</label>
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

            {/* Additional Settings */}
            <div className="form-section">
              <h3 className="form-section-title">Additional Settings</h3>
              <div>
                <label className="text-xs font-medium mb-1 block">Description</label>
                <textarea 
                  className="input-field" 
                  rows={3}
                  placeholder="Additional notes about this rack..."
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
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Rack' : 'Create Rack')}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}