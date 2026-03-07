interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const normalized = status.toLowerCase().replace(/\s+/g, "-");
  const classMap: Record<string, string> = {
    healthy: "status-healthy",
    active: "status-active",
    "low-stock": "status-low-stock",
    inactive: "status-inactive",
    maintenance: "status-maintenance",
    "in-maintenance": "status-in-maintenance",
  };

  return (
    <span className={`status-badge ${classMap[normalized] || "status-active"}`}>
      {status}
    </span>
  );
}
