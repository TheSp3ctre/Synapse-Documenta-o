import { ChevronRight } from "lucide-react";

export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3 w-3 text-sage-medium" />}
          <span
            className={
              i === items.length - 1
                ? "text-forest font-medium"
                : "hover:text-forest transition-colors cursor-pointer"
            }
          >
            {item}
          </span>
        </span>
      ))}
    </nav>
  );
}
