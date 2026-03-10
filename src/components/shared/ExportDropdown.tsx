import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, FileSpreadsheet, FileText } from "lucide-react";

interface ExportDropdownProps {
  onExportExcel: () => void;
  onExportCSV: () => void;
  recordCount: number;
  entityName: string;
}

export default function ExportDropdown({ 
  onExportExcel, 
  onExportCSV, 
  recordCount, 
  entityName 
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-outline flex items-center gap-1.5 text-xs"
      >
        <Download className="w-3.5 h-3.5" />
        Export
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[200px] z-[100]">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-medium text-gray-600">
              Export {recordCount} {entityName.toLowerCase()}
            </p>
          </div>
          
          <button
            onClick={() => {
              onExportExcel();
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            <div>
              <div className="font-medium text-gray-900">Excel (.xlsx)</div>
              <div className="text-xs text-gray-500">Spreadsheet format with formulas</div>
            </div>
          </button>
          
          <button
            onClick={() => {
              onExportCSV();
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">CSV (.csv)</div>
              <div className="text-xs text-gray-500">Comma separated values</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}