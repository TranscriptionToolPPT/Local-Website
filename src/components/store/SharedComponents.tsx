import { STATUS_CFG, type OrderStatus } from "@/lib/constants";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  const colorMap: Record<string, string> = {
    warning: "bg-warning-soft text-warning border-warning/30",
    primary: "bg-primary-soft text-primary border-primary/30",
    purple: "bg-purple-soft text-purple border-purple/30",
    success: "bg-success-soft text-success border-success/30",
    destructive: "bg-destructive-soft text-destructive border-destructive/30",
  };

  return (
    <span className={`${colorMap[cfg.color]} border rounded-full px-3 py-0.5 text-[11px] font-extrabold inline-flex items-center gap-1`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export function ActionBtn({
  label,
  colorClass,
  onClick,
  outline,
}: {
  label: string;
  colorClass: string;
  onClick: () => void;
  outline?: boolean;
}) {
  const base = outline
    ? `bg-transparent border ${colorClass} hover:brightness-105`
    : `${colorClass} text-white hover:brightness-105`;
  return (
    <button
      onClick={onClick}
      className={`${base} border-none cursor-pointer transition-all duration-150 rounded-xl font-bold px-[18px] py-[9px] text-xs hover:-translate-y-0.5 active:translate-y-0`}
    >
      {label}
    </button>
  );
}
