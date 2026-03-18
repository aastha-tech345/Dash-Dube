import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BarcodeModalProps {
  sku: string;
  productName: string;
  onClose: () => void;
}

export default function BarcodeModal({ sku, productName, onClose }: BarcodeModalProps) {
  const [barcodeSrc, setBarcodeSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBarcode = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://thegtrgroup.com/api';
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/warehouse/products/barcode/${sku}`, {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        });
        if (!response.ok) throw new Error(`Failed to fetch barcode: ${response.statusText}`);
        const blob = await response.blob();
        setBarcodeSrc(URL.createObjectURL(blob));
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to load barcode',
          variant: 'destructive',
        });
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchBarcode();
    return () => { if (barcodeSrc) URL.revokeObjectURL(barcodeSrc); };
  }, [sku]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-80 flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between w-full">
          <span className="font-semibold text-sm">{productName}</span>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{sku}</p>
        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        ) : barcodeSrc ? (
          <img src={barcodeSrc} alt={`Barcode for ${sku}`} className="w-full" />
        ) : null}
      </div>
    </div>
  );
}
