<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { warehouseApi } from '@/services/warehouseApi';
import type { WareProductRequest, WareCategoryResponse, UoMResponse, WareTaxResponse } from '@/types/api';

interface ProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProductForm({ onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<WareCategoryResponse[]>([]);
  const [uoms, setUoms] = useState<UoMResponse[]>([]);
  const [taxes, setTaxes] = useState<WareTaxResponse[]>([]);

  const [formData, setFormData] = useState<WareProductRequest>({
    sku: '',
    name: '',
    barcode: '',
    description: '',
    categoryId: 0,
    purchasePrice: 0,
    salePrice: 0,
    taxInclusive: false,
    batchTracking: false,
    serialTracking: false,
    expiryTracking: false,
    isActive: true,
    uomId: 0,
    locationId: 1,
  });

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [categoriesData, uomsData, taxesData] = await Promise.all([
        warehouseApi.getCategories(),
        warehouseApi.getUoMs(),
        warehouseApi.getTaxes(),
      ]);
      setCategories(categoriesData);
      setUoms(uomsData);
      setTaxes(taxesData);
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await warehouseApi.createProduct(formData);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">SKU *</label>
          <input
            type="text"
            className="input-field"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Barcode *</label>
          <input
            type="text"
            className="input-field"
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Product Name *</label>
        <input
          type="text"
          className="input-field"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="input-field"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <select
            className="input-field"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">UoM *</label>
          <select
            className="input-field"
            value={formData.uomId}
            onChange={(e) => setFormData({ ...formData, uomId: parseInt(e.target.value) })}
            required
          >
            <option value="">Select UoM</option>
            {uoms.map((uom) => (
              <option key={uom.id} value={uom.id}>
                {uom.name} ({uom.shortName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tax</label>
          <select
            className="input-field"
            value={formData.taxId || ''}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value ? parseInt(e.target.value) : undefined })}
          >
            <option value="">No tax</option>
            {taxes.map((tax) => (
              <option key={tax.id} value={tax.id}>
                {tax.name} ({tax.percentage}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Purchase Price *</label>
          <input
            type="number"
            step="0.01"
            className="input-field"
            value={formData.purchasePrice}
            onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sale Price *</label>
          <input
            type="number"
            step="0.01"
            className="input-field"
            value={formData.salePrice}
            onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.batchTracking}
            onChange={(e) => setFormData({ ...formData, batchTracking: e.target.checked })}
          />
          <span className="text-sm">Batch Tracking</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.serialTracking}
            onChange={(e) => setFormData({ ...formData, serialTracking: e.target.checked })}
          />
          <span className="text-sm">Serial Tracking</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.expiryTracking}
            onChange={(e) => setFormData({ ...formData, expiryTracking: e.target.checked })}
          />
          <span className="text-sm">Expiry Tracking</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.taxInclusive}
            onChange={(e) => setFormData({ ...formData, taxInclusive: e.target.checked })}
          />
          <span className="text-sm">Tax Inclusive</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <span className="text-sm">Active</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? 'Creating...' : 'Create Product'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-outline">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
=======
import { useState, useEffect } from 'react';
import { warehouseApi } from '@/services/warehouseApi';
import type { WareProductRequest, WareCategoryResponse, UoMResponse, WareTaxResponse } from '@/types/api';

interface ProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProductForm({ onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<WareCategoryResponse[]>([]);
  const [uoms, setUoms] = useState<UoMResponse[]>([]);
  const [taxes, setTaxes] = useState<WareTaxResponse[]>([]);

  const [formData, setFormData] = useState<WareProductRequest>({
    sku: '',
    name: '',
    barcode: '',
    description: '',
    categoryId: 0,
    purchasePrice: 0,
    salePrice: 0,
    taxInclusive: false,
    batchTracking: false,
    serialTracking: false,
    expiryTracking: false,
    isActive: true,
    uomId: 0,
    locationId: 1,
  });

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [categoriesData, uomsData, taxesData] = await Promise.all([
        warehouseApi.getCategories(),
        warehouseApi.getUoMs(),
        warehouseApi.getTaxes(),
      ]);
      setCategories(categoriesData);
      setUoms(uomsData);
      setTaxes(taxesData);
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await warehouseApi.createProduct(formData);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">SKU *</label>
          <input
            type="text"
            className="input-field"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Barcode *</label>
          <input
            type="text"
            className="input-field"
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Product Name *</label>
        <input
          type="text"
          className="input-field"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="input-field"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <select
            className="input-field"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">UoM *</label>
          <select
            className="input-field"
            value={formData.uomId}
            onChange={(e) => setFormData({ ...formData, uomId: parseInt(e.target.value) })}
            required
          >
            <option value="">Select UoM</option>
            {uoms.map((uom) => (
              <option key={uom.id} value={uom.id}>
                {uom.name} ({uom.shortName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tax</label>
          <select
            className="input-field"
            value={formData.taxId || ''}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value ? parseInt(e.target.value) : undefined })}
          >
            <option value="">No tax</option>
            {taxes.map((tax) => (
              <option key={tax.id} value={tax.id}>
                {tax.name} ({tax.percentage}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Purchase Price *</label>
          <input
            type="number"
            step="0.01"
            className="input-field"
            value={formData.purchasePrice}
            onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sale Price *</label>
          <input
            type="number"
            step="0.01"
            className="input-field"
            value={formData.salePrice}
            onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.batchTracking}
            onChange={(e) => setFormData({ ...formData, batchTracking: e.target.checked })}
          />
          <span className="text-sm">Batch Tracking</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.serialTracking}
            onChange={(e) => setFormData({ ...formData, serialTracking: e.target.checked })}
          />
          <span className="text-sm">Serial Tracking</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.expiryTracking}
            onChange={(e) => setFormData({ ...formData, expiryTracking: e.target.checked })}
          />
          <span className="text-sm">Expiry Tracking</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.taxInclusive}
            onChange={(e) => setFormData({ ...formData, taxInclusive: e.target.checked })}
          />
          <span className="text-sm">Tax Inclusive</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <span className="text-sm">Active</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? 'Creating...' : 'Create Product'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-outline">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
>>>>>>> origin/abhi-version
