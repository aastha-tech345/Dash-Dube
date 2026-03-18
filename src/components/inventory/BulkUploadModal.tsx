import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, FileSpreadsheet, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkUploadModal({ onClose, onSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = (f: File) => {
    const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!allowed.includes(f.type) && !f.name.match(/\.(xlsx|xls)$/i)) {
      toast({ title: 'Invalid file', description: 'Please upload an Excel file (.xlsx or .xls)', variant: 'destructive' });
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://thegtrgroup.com/api';
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/warehouse/products/export`, {
        method: 'POST',
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body: formData,
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || `Upload failed: ${response.statusText}`);
      }
      setDone(true);
      toast({ title: 'Success', description: 'Products uploaded successfully' });
      onSuccess();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Upload failed',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-[420px] flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-base">Add Multiple Products</span>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
            file ? 'border-emerald-400 bg-emerald-50' : 'border-muted-foreground/30 hover:border-primary/50'
          }`}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {done ? (
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          ) : file ? (
            <FileSpreadsheet className="w-10 h-10 text-emerald-500" />
          ) : (
            <Upload className="w-10 h-10 text-muted-foreground" />
          )}
          <p className="text-sm font-medium text-center">
            {done ? 'Upload complete' : file ? file.name : 'Click or drag & drop Excel file here'}
          </p>
          {!file && <p className="text-xs text-muted-foreground">.xlsx or .xls supported</p>}
          {file && !done && (
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB — click to change</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded border hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading || done}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {uploading ? 'Uploading...' : done ? 'Uploaded' : 'Upload'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
