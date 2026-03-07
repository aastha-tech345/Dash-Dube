import { Search } from 'lucide-react';

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function ProductFilters({
  search,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
}: ProductFiltersProps) {
  return (
    <div className="section-card mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products, SKU..."
            className="input-field pl-9"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(selectedCategory === cat ? null : cat)}
            className={`btn-outline text-xs ${
              selectedCategory === cat ? "ring-2 ring-primary/30" : ""
            }`}
          >
            {cat}
          </button>
        ))}
        {selectedCategory && (
          <button
            onClick={() => onCategoryChange(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
