const items = [
  { label: "Overview", href: "#overview", active: true },
  { label: "Why Verdant", href: "#why-verdant" },
  { label: "Architecture diagram", href: "#architecture" },
  { label: "A minimal example", href: "#example" },
  { label: "Next steps", href: "#next-steps" },
];

export function TableOfContents() {
  return (
    <aside className="fixed right-0 top-0 hidden h-screen w-[220px] xl:block">
      <div className="px-6 pt-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-4">
          On this page
        </p>
        <ul className="space-y-1 border-l border-sage">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={`relative -ml-px block border-l-2 py-1.5 pl-3 text-[13px] transition-colors duration-150 ${
                  item.active
                    ? "border-primary text-forest font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-sage-medium"
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-6 border-t border-sage">
          <a
            href="#"
            className="flex items-center gap-2 text-[12px] text-muted-foreground hover:text-forest transition-colors"
          >
            <span className="h-1 w-1 rounded-full bg-sage-medium" />
            Edit this page
          </a>
          <a
            href="#"
            className="mt-2 flex items-center gap-2 text-[12px] text-muted-foreground hover:text-forest transition-colors"
          >
            <span className="h-1 w-1 rounded-full bg-sage-medium" />
            Report an issue
          </a>
        </div>
      </div>
    </aside>
  );
}
