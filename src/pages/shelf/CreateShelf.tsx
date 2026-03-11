import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { warehouseApi } from "@/services/warehouseApi";
import { useToast } from "@/hooks/use-toast";
import type { ShelfRequest, ShelfResponse, RackResponse } from "@/types/api";

export default function CreateShelf() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [racks, setRacks] = useState<RackResponse[]>([]);
  const [formData, setFormData] = useState<ShelfRequest>({
    rackId: 0,
    shelfCode: '',
    barcodeTag: '',
    levelNo: 1,
    pickSequence: 1,
    maxWeight: 0,
    maxVolume: 0,
    isActive: true,
    description: '',
  });

  useEffect(() => {
    fetchRacks();
  }, []);

  useEffect(() => {
    if (isEditMode && editId) {
      loadShelfForEdit(parseInt(editId));
    }
  }, [isEditMode, editId]);

  const loadShelfForEdit = async (id: number) => {
    try {
      setInitialLoading(true);
      const shelf = await warehouseApi.getShelfById(id);
      
      setFormData({
        rackId: shelf.rackId,
        shelfCode: shelf.shelfCode,
        barcodeTag: shelf.barcodeTag || '',
        levelNo: shelf.levelNo || 1,
        pickSequence: shelf.pickSequence || 1,
        maxWeight: shelf.maxWeight || 0,
        maxVolume: shelf.maxVolume || 0,
        isActive: shelf.isActive,
        description: shelf.description || '',
      });
    } catch (err) {
      console.error('Failed to load shelf for editing:', err);
      setError('Failed to load shelf data for editing');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchRacks = async () => {
    try {
      const data = await warehouseApi.getRacks();
      setRacks(data);
    } catch (error) {
      console.error('Failed to fetch racks:', error);
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

      console.log(`${isEditMode ? 'Updating' : 'Creating'} shelf data:`, formData);

      let result;
      if (isEditMode && editId) {
        result = await warehouseApi.updateShelf(parseInt(editId), formData);
        console.log('Shelf updated successfully:', result);
        toast({
          title: "Success",
          description: "Shelf updated successfully!",
          variant: "default",
        });
      } else {
        result = await warehouseApi.createShelf(formData);
        console.log('Shelf created successfully:', result);
        toast({
          title: "Success",
          description: "Shelf created successfully!",
          variant: "default",
        });
      }
      
      // Navigate to Infrastructure page with Shelves tab active
      navigate('/infrastructure?tab=Shelves');
    } catch (err) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} shelf:`, err);
      
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} shelf`;
      
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

  const handleInputChange = (field: keyof ShelfRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="w-full">
      {initialLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading shelf data...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Infrastructure &gt; Shelves &gt; {isEditMode ? 'Edit' : 'Create New'} Shelf
              </p>
              <div className="flex items-center gap-3">
                <Link to="/infrastructure" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <h1 className="page-title">{isEditMode ? 'Edit' : 'Create New'} Shelf</h1>
                  <p className="page-subtitle">
                    {isEditMode ? 'Update shelf information and settings.' : 'Define a new storage shelf within your warehouse rack.'}
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
                  <label className="text-xs font-medium mb-1 block">Rack Selection *</label>
                  <select 
                    className="input-field"
                    value={formData.rackId}
                    onChange={(e) => handleInputChange('rackId', parseInt(e.target.value))}
                    required
                  >
                    <option value={0}>Select Rack</option>
                    {racks.map((rack) => (
                      <option key={rack.id} value={rack.id}>
                        {rack.rackCode} ({rack.rackType})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Shelf Code *</label>
                  <input 
                    className="input-field" 
                    placeholder="e.g. S-A-001-L1"
                    value={formData.shelfCode}
                    onChange={(e) => handleInputChange('shelfCode', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Level Number</label>
                  <input 
                    className="input-field" 
                    type="number"
                    min="1"
                    value={formData.levelNo}
                    onChange={(e) => handleInputChange('levelNo', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Pick Sequence</label>
                  <input 
                    className="input-field" 
                    type="number"
                    min="1"
                    value={formData.pickSequence}
                    onChange={(e) => handleInputChange('pickSequence', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Determines the order for picking operations.</p>
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
                  placeholder="Additional notes about this shelf..."
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
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Shelf' : 'Create Shelf')}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}