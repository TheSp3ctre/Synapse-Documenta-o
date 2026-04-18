import { useState, useEffect } from "react";
import { Search, Leaf, Moon, Sun, ChevronDown, BookOpen, Compass, Lightbulb, GitBranch, X, Menu } from "lucide-react";

type NavItem = { label: string; href: string; active?: boolean };
type NavSection = { title: string; icon: React.ComponentType<{ className?: string }>; items: NavItem[]; defaultOpen?: boolean };

const sections: NavSection[] = [
  {
    title: "Getting Started",
    icon: BookOpen,
    defaultOpen: true,
    items: [
      { label: "Introduction", href: "#", active: true },
      { label: "Installation", href: "#" },
      { label: "Quick Start", href: "#" },
      { label: "Project Structure", href: "#" },
    ],
  },
  {
    title: "Core Concepts",
    icon: Compass,
    defaultOpen: true,
    items: [
      { label: "Architecture", href: "#" },
      { label: "Data Model", href: "#" },
      { label: "Lifecycle", href: "#" },
    ],
  },
  {
    title: "Guides",
    icon: Lightbulb,
    defaultOpen: true,
    items: [
      { label: "Authentication", href: "#" },
      { label: "Deployment", href: "#" },
      { label: "Performance", href: "#" },
    ],
  },
  { title: "Flowcharts & Diagrams", icon: GitBranch, items: [{ label: "Request Flow", href: "#" }] },
];

function Section({ section }: { section: NavSection }) {
  const [open, setOpen] = useState(section.defaultOpen ?? false);
  const Icon = section.icon;

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="group flex w-full items-center gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-forest dark:hover:text-sage-medium transition-colors"
      >
        <Icon className="h-3 w-3 opacity-60" />
        <span className="flex-1 text-left">{section.title}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && (
        <ul className="relative ml-4 mt-1 border-l border-sage">
          {section.items.map((item) => (
            <li key={item.label} className="relative">
              <a
                href={item.href}
                className={`relative -ml-px flex items-center px-4 py-2 text-sm transition-all duration-150 ${
                  item.active
                    ? "border-l-2 border-primary bg-sage-soft/60 font-medium text-forest dark:text-sage-medium"
                    : "border-l-2 border-transparent text-foreground hover:bg-sage-soft/50 hover:text-forest dark:hover:text-sage-medium"
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface DocsSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function DocsSidebar({ open, onClose }: DocsSidebarProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("verdant-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored ? stored === "dark" : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("verdant-theme", next ? "dark" : "light");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-foreground/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-[280px] flex-col border-r border-sage bg-paper transition-transform duration-200 ease-out lg:w-[260px] lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-sage">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <Leaf className="h-4 w-4 text-primary" strokeWidth={2.2} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold tracking-tight text-foreground">Verdant</div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sage-soft hover:text-forest dark:hover:text-sage-medium transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search docs..."
              className="w-full rounded-lg border border-sage bg-background py-2 pl-9 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-sage-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-sage bg-paper px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">⌘K</kbd>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {sections.map((s) => <Section key={s.title} section={s} />)}
        </nav>

        {/* Footer */}
        <div className="border-t border-sage px-4 py-3 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">© Verdant Docs</span>
          <button
            onClick={toggleTheme}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sage-soft hover:text-forest dark:hover:text-sage-medium transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-sage-soft hover:text-forest dark:hover:text-sage-medium transition-colors lg:hidden"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
