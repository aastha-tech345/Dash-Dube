import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { warehouseApi } from "@/services/warehouseApi";
import { useToast } from "@/hooks/use-toast";
import type { BinRequest, BinResponse, WareHouseResponse, ShelfResponse } from "@/types/api";

export default function CreateBin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [warehouses, setWarehouses] = useState<WareHouseResponse[]>([]);
  const [shelves, setShelves] = useState<ShelfResponse[]>([]);
  const [formData, setFormData] = useState<BinRequest>({
    warehouseId: 0,
    shelfId: 0,
    binCode: '',
    binType: 'STORAGE',
    capacityQty: 0,
    capacityWeight: 0,
    capacityVolume: 0,
    pickSequence: 1,
    hazardousAllowed: false,
    isActive: true,
    blocked: false,
    description: '',
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (isEditMode && editId) {
      loadBinForEdit(parseInt(editId));
    }
  }, [isEditMode, editId]);

  useEffect(() => {
    if (formData.warehouseId > 0) {
      fetchShelves();
    }
  }, [formData.warehouseId]);

  const loadBinForEdit = async (id: number) => {
    try {
      setInitialLoading(true);
      const bin = await warehouseApi.getBinById(id);
      
      setFormData({
        warehouseId: bin.warehouseId,
        shelfId: bin.shelfId,
        binCode: bin.binCode,
        binType: bin.binType as any,
        capacityQty: bin.capacityQty || 0,
        capacityWeight: bin.capacityWeight || 0,
        capacityVolume: bin.capacityVolume || 0,
        pickSequence: bin.pickSequence || 1,
        hazardousAllowed: bin.hazardousAllowed || false,
        isActive: bin.isActive,
        blocked: bin.blocked || false,
        blockReason: bin.blockReason || '',
        description: bin.description || '',
      });
    } catch (err) {
      console.error('Failed to load bin for editing:', err);
      setError('Failed to load bin data for editing');
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

  const fetchShelves = async () => {
    try {
      const data = await warehouseApi.getShelves();
      // Note: ShelfResponse doesn't have warehouseId, so we'll show all shelves
      // In a real implementation, you might need to fetch shelves by rack and then filter by warehouse
      setShelves(data);
    } catch (error) {
      console.error('Failed to fetch shelves:', error);
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

      console.log(`${isEditMode ? 'Updating' : 'Creating'} bin data:`, formData);

      let result;
      if (isEditMode && editId) {
        result = await warehouseApi.updateBin(parseInt(editId), formData);
        console.log('Bin updated successfully:', result);
        toast({
          title: "Success",
          description: "Bin updated successfully!",
          variant: "default",
        });
      } else {
        result = await warehouseApi.createBin(formData);
        console.log('Bin created successfully:', result);
        toast({
          title: "Success",
          description: "Bin created successfully!",
          variant: "default",
        });
      }
      
      navigate('/infrastructure');
    } catch (err) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} bin:`, err);
      
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} bin`;
      
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

  const handleInputChange = (field: keyof BinRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="w-full">
      {initialLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading bin data...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Infrastructure &gt; Bins &gt; {isEditMode ? 'Edit' : 'Create New'} Bin
              </p>
              <div className="flex items-center gap-3">
                <Link to="/infrastructure" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <h1 className="page-title">{isEditMode ? 'Edit' : 'Create New'} Bin</h1>
                  <p className="page-subtitle">
                    {isEditMode ? 'Update bin information and settings.' : 'Define a new storage bin within your warehouse shelf.'}
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
                  <label className="text-xs font-medium mb-1 block">Shelf *</label>
                  <select 
                    className="input-field"
                    value={formData.shelfId}
                    onChange={(e) => handleInputChange('shelfId', parseInt(e.target.value))}
                    required
                    disabled={!formData.warehouseId}
                  >
                    <option value={0}>Select Shelf</option>
                    {shelves.map((shelf) => (
                      <option key={shelf.id} value={shelf.id}>
                        {shelf.shelfCode} (Level {shelf.levelNo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Bin Code *</label>
                  <input 
                    className="input-field" 
                    placeholder="e.g. B-A-001-L1-P1"
                    value={formData.binCode}
                    onChange={(e) => handleInputChange('binCode', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Bin Type</label>
                  <select 
                    className="input-field"
                    value={formData.binType}
                    onChange={(e) => handleInputChange('binType', e.target.value)}
                  >
                    <option value="STORAGE">Storage</option>
                    <option value="RECEIVING">Receiving</option>
                    <option value="QC">QC</option>
                    <option value="QUARANTINE">Quarantine</option>
                    <option value="DISPATCH">Dispatch</option>
                    <option value="DAMAGE">Damage</option>
                    <option value="RETURNS">Returns</option>
                  </select>
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
                </div>
              </div>
            </div>

            {/* Capacity Specifications */}
            <div className="form-section">
              <h3 className="form-section-title">Capacity Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Capacity Quantity</label>
                  <input 
                    className="input-field" 
                    type="number"
                    min="0"
                    value={formData.capacityQty}
                    onChange={(e) => handleInputChange('capacityQty', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Capacity Weight (kg)</label>
                  <input 
                    className="input-field" 
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.capacityWeight}
                    onChange={(e) => handleInputChange('capacityWeight', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Capacity Volume (m³)</label>
                  <input 
                    className="input-field" 
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.capacityVolume}
                    onChange={(e) => handleInputChange('capacityVolume', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Special Settings */}
            <div className="form-section">
              <h3 className="form-section-title">Special Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Hazardous Materials Allowed</div>
                    <div className="text-xs text-muted-foreground">Allow storage of hazardous materials in this bin</div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleInputChange('hazardousAllowed', !formData.hazardousAllowed)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${formData.hazardousAllowed ? "bg-primary" : "bg-border"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform ${formData.hazardousAllowed ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Blocked</div>
                    <div className="text-xs text-muted-foreground">Block this bin from receiving new inventory</div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleInputChange('blocked', !formData.blocked)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${formData.blocked ? "bg-primary" : "bg-border"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform ${formData.blocked ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
                {formData.blocked && (
                  <div>
                    <label className="text-xs font-medium mb-1 block">Block Reason</label>
                    <input 
                      className="input-field"
                      placeholder="Reason for blocking this bin..."
                      value={formData.blockReason || ''}
                      onChange={(e) => handleInputChange('blockReason', e.target.value)}
                    />
                  </div>
                )}
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
                  placeholder="Additional notes about this bin..."
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
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Bin' : 'Create Bin')}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}