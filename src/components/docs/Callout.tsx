import { Info, AlertTriangle, Sparkles } from "lucide-react";

type Variant = "info" | "warning" | "tip";

const config = {
  info: {
    icon: Info,
    label: "Note",
    borderClass: "border-l-primary",
    bgClass: "bg-sage-soft/30",
    iconClass: "text-primary",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    borderClass: "border-l-amber-500",
    bgClass: "bg-amber-50/50",
    iconClass: "text-amber-600",
  },
  tip: {
    icon: Sparkles,
    label: "Tip",
    borderClass: "border-l-forest",
    bgClass: "bg-sage-soft/40",
    iconClass: "text-forest",
  },
};

export function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
}) {
  const c = config[variant];
  const Icon = c.icon;
  return (
    <div
      className={`my-6 flex gap-3 rounded-r-lg border-l-[3px] ${c.borderClass} ${c.bgClass} px-4 py-3.5`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${c.iconClass}`} />
      <div className="flex-1 text-[14.5px] leading-relaxed text-foreground">
        {title && <div className="mb-1 font-semibold text-foreground">{title}</div>}
        {children}
      </div>
    </div>
  );
}
