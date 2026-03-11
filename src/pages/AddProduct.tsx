import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Upload, Loader2 } from "lucide-react";
import { warehouseApi } from "@/services/warehouseApi";
import { WareProductRequest } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

export default function AddProduct() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);
  const [uoms, setUoms] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  const [formData, setFormData] = useState<WareProductRequest>({
    sku: "",
    name: "",
    barcode: "",
    description: "",
    categoryId: 0,
    brand: "",
    model: "",
    purchasePrice: 0,
    salePrice: 0,
    taxInclusive: false,
    batchTracking: false,
    serialTracking: false,
    expiryTracking: false,
    isActive: true,
    uomId: 0,
    locationId: 0,
  });

  useEffect(() => {
    loadDropdownData();
    if (editId) {
      loadProductData(Number(editId));
    }
  }, [editId]);

  const loadDropdownData = async () => {
    try {
      const [categoriesData, taxesData, uomsData, locationsData] = await Promise.all([
        warehouseApi.getCategories(),
        warehouseApi.getTaxes(),
        warehouseApi.getUoMs(),
        warehouseApi.getLocations(),
      ]);
      setCategories(categoriesData);
      setTaxes(taxesData);
      setUoms(uomsData);
      setLocations(locationsData);
    } catch (error) {
      console.error("Failed to load dropdown data:", error);
      toast({
        title: "Error",
        description: "Failed to load form data. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const loadProductData = async (id: number) => {
    setLoadingData(true);
    try {
      const product = await warehouseApi.getProductById(id);
      setFormData({
        sku: product.sku,
        name: product.name,
        barcode: product.barcode,
        description: product.description || "",
        categoryId: product.categoryId,
        subCategoryId: product.subCategoryId,
        brand: product.brand || "",
        model: product.model || "",
        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice,
        taxInclusive: product.taxInclusive,
        batchTracking: product.batchTracking,
        serialTracking: product.serialTracking,
        expiryTracking: product.expiryTracking,
        isActive: product.isActive,
        uomId: product.uomId,
        taxId: product.taxId,
        locationId: product.locationId,
      });
      
      if (product.categoryId) {
        loadSubCategories(product.categoryId);
      }
      
      if (product.imageUrl) {
        setImagePreview(product.imageUrl);
      }
    } catch (error) {
      console.error("Failed to load product:", error);
      toast({
        title: "Error",
        description: "Failed to load product data",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadSubCategories = async (categoryId: number) => {
    try {
      const data = await warehouseApi.getSubCategories(categoryId);
      setSubCategories(data);
    } catch (error) {
      console.error("Failed to load subcategories:", error);
    }
  };

  const handleCategoryChange = (categoryId: number) => {
    setFormData({ ...formData, categoryId, subCategoryId: undefined });
    if (categoryId) {
      loadSubCategories(categoryId);
    } else {
      setSubCategories([]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submitted", formData);
    
    // Validation
    if (!formData.name || !formData.sku || !formData.barcode) {
      toast({
        title: "Validation Error",
        description: "Please fill in Product Name, SKU, and Barcode",
        variant: "destructive",
      });
      return;
    }

    if (!formData.categoryId || formData.categoryId === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a Category",
        variant: "destructive",
      });
      return;
    }

    if (!formData.uomId || formData.uomId === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a Unit of Measure",
        variant: "destructive",
      });
      return;
    }

    if (!formData.locationId || formData.locationId === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a Location",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Note: Image upload would need a separate endpoint
      // For now, we'll just save the product data
      if (editId) {
        await warehouseApi.updateProduct(Number(editId), formData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await warehouseApi.createProduct(formData);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }
      navigate("/inventory");
    } catch (error: any) {
      console.error("Failed to save product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title">{editId ? "Edit Product" : "Add New Product"}</h1>
          </div>
        </div>

        {/* Image Upload */}
        <div className="form-section">
          <h3 className="form-section-title">Product Image</h3>
          <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center relative">
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="max-h-48 rounded" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  <label htmlFor="image-upload" className="text-primary font-medium cursor-pointer">
                    Click to upload
                  </label> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP (MAX. 800×400px)</p>
              </>
            )}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
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
                <label className="text-xs font-medium text-foreground mb-1 block">Product Name *</label>
                <input 
                  className="input-field" 
                  placeholder="e.g. Wireless Keyboard K10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">SKU *</label>
                <input 
                  className="input-field" 
                  placeholder="WKK-001"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Barcode (EAN/UPC) *</label>
                <input 
                  className="input-field" 
                  placeholder="123456789012"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Category *</label>
                <select 
                  className="input-field"
                  value={formData.categoryId || ""}
                  onChange={(e) => handleCategoryChange(Number(e.target.value))}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Sub Category</label>
                <select 
                  className="input-field"
                  value={formData.subCategoryId || ""}
                  onChange={(e) => setFormData({ ...formData, subCategoryId: Number(e.target.value) || undefined })}
                  disabled={!formData.categoryId}
                >
                  <option value="">Select Sub Category</option>
                  {subCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Brand</label>
                <input 
                  className="input-field" 
                  placeholder="Brand name"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Model</label>
                <input 
                  className="input-field" 
                  placeholder="Model number"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
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
                  <label className="text-xs font-medium text-foreground mb-1 block">Purchase Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <input 
                      type="number"
                      step="0.01"
                      className="input-field pl-7"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Sale Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <input 
                      type="number"
                      step="0.01"
                      className="input-field pl-7"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Tax</label>
                <select 
                  className="input-field"
                  value={formData.taxId || ""}
                  onChange={(e) => setFormData({ ...formData, taxId: Number(e.target.value) || undefined })}
                >
                  <option value="">Select Tax</option>
                  {taxes.map((tax) => (
                    <option key={tax.id} value={tax.id}>{tax.name} ({tax.percentage}%)</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input 
                  type="checkbox" 
                  className="accent-primary"
                  checked={formData.taxInclusive}
                  onChange={(e) => setFormData({ ...formData, taxInclusive: e.target.checked })}
                /> 
                Prices include tax
              </label>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Unit of Measure *</label>
                <select 
                  className="input-field"
                  value={formData.uomId || ""}
                  onChange={(e) => setFormData({ ...formData, uomId: Number(e.target.value) })}
                  required
                >
                  <option value="">Select UoM</option>
                  {uoms.map((uom) => (
                    <option key={uom.id} value={uom.id}>{uom.name} ({uom.shortName})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Location *</label>
                <select 
                  className="input-field"
                  value={formData.locationId || ""}
                  onChange={(e) => setFormData({ ...formData, locationId: Number(e.target.value) })}
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking */}
        <div className="form-section">
          <h3 className="form-section-title">Tracking & Inventory</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                className="accent-primary"
                checked={formData.batchTracking}
                onChange={(e) => setFormData({ ...formData, batchTracking: e.target.checked })}
              />
              Enable Batch Tracking
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                className="accent-primary"
                checked={formData.serialTracking}
                onChange={(e) => setFormData({ ...formData, serialTracking: e.target.checked })}
              />
              Enable Serial Number Tracking
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                className="accent-primary"
                checked={formData.expiryTracking}
                onChange={(e) => setFormData({ ...formData, expiryTracking: e.target.checked })}
              />
              Enable Expiry Date Tracking
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                className="accent-primary"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Product is Active
            </label>
          </div>
          <div className="mt-4">
            <label className="text-xs font-medium text-foreground mb-1 block">Description</label>
            <textarea 
              className="input-field min-h-[100px]"
              placeholder="Product description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link to="/inventory" className="btn-outline">Cancel</Link>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon /> {editId ? "Update" : "Save"} Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function SaveIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
