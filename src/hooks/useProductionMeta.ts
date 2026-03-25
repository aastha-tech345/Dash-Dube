import { useState, useEffect } from 'react';
import { warehouseApi } from '@/services/warehouseApi';
import type { WareCategoryResponse, WareTaxResponse } from '@/types/api';

export function useProductionMeta() {
  const [categories, setCategories] = useState<WareCategoryResponse[]>([]);
  const [taxes, setTaxes] = useState<WareTaxResponse[]>([]);

  useEffect(() => {
    warehouseApi.getCategories().then(setCategories).catch(() => {});
    warehouseApi.getTaxes().then(setTaxes).catch(() => {});
  }, []);

  return { categories, taxes };
}
