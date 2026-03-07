import { Search } from "lucide-react";

interface Props {
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ placeholder = "Search...", className = "" }: Props) {
  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        className="input-field pl-9"
      />
    </div>
  );
}
