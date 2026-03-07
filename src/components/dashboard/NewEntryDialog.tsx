import { X, Package, Building2, Map, Grid3X3 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const actions = [
  { icon: Package, color: "stat-icon-blue", title: "Add New Product", desc: "Register new items into the system with SKUs and specifications." },
  { icon: Building2, color: "stat-icon-purple", title: "Create Warehouse", desc: "Initialize a new physical or virtual storage facility location." },
  { icon: Map, color: "stat-icon-yellow", title: "Define Zone", desc: "Organize warehouse floor space into logical staging or storage areas." },
  { icon: Grid3X3, color: "stat-icon-green", title: "Configure Bin/Rack", desc: "Set up specific storage units, shelf levels, and individual bin coordinates." },
];

export default function NewEntryDialog({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/30 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-lg font-semibold">New Entry</h2>
              <p className="text-sm text-muted-foreground">Select an action to continue with warehouse setup or inventory management.</p>
            </div>
            <button onClick={onClose} className="mt-1"><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            {actions.map((a) => (
              <button key={a.title} className="text-left border border-border rounded-xl p-4 hover:border-primary/40 transition-colors">
                <div className={`stat-icon ${a.color} mb-3`}><a.icon className="w-5 h-5" /></div>
                <div className="text-sm font-semibold text-foreground">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{a.desc}</div>
              </button>
            ))}
          </div>

          <div className="mt-5 text-center">
            <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}
