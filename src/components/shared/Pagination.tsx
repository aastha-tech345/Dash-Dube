import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  current: number;
  total: number;
  showingText?: string;
}

export default function Pagination({ current, total, showingText }: Props) {
  return (
    <div className="flex items-center justify-between mt-4">
      {showingText && <span className="text-xs text-muted-foreground">{showingText}</span>}
      <div className="flex items-center gap-1 ml-auto">
        <button className="pagination-btn"><ChevronLeft className="w-4 h-4" /></button>
        {Array.from({ length: total }, (_, i) => (
          <button key={i} className={`pagination-btn ${i + 1 === current ? "active" : ""}`}>
            {i + 1}
          </button>
        ))}
        <button className="pagination-btn"><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
