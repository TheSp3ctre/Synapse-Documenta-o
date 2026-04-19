import { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, BookOpen, Compass, GitBranch, X, Menu } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { getDocSections, NavSection } from "@/lib/docs";

export function DocsSidebar({
  open,
  onClose,
  onSearchOpen,
}: {
  open: boolean;
  onClose: () => void;
  onSearchOpen: () => void;
}) {
  const location = useLocation();

  // Organize files into sections
  const sections = useMemo(() => {
    const rawSections = getDocSections();
    // Add icons to sections
    return rawSections.map((s) => ({
      ...s,
      icon: s.title === "Documentação" ? BookOpen : s.title === "Arquitetura" ? GitBranch : Compass,
    })) as NavSection[];
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

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
          <div className="flex-1">
            <Link to="/">
              <img src="/LOGO.png" alt="Logo" className="h-6 w-auto object-contain" />
            </Link>
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
          <button
            onClick={onSearchOpen}
            className="flex w-full items-center gap-2 rounded-lg border border-sage bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-sage-soft/50 hover:text-forest transition-all"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Pesquisar...</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {sections.map((s) => (
            <Section key={s.title} section={s} currentPath={location.pathname} />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sage px-4 py-3 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">© DOCUMENTAÇÃO</span>
        </div>
      </aside>
    </>
  );
}

function Section({ section, currentPath }: { section: NavSection; currentPath: string }) {
  const isActive = (href: string) => currentPath === href;
  const hasActiveItem = section.items.some((item) => isActive(item.href));
  const [open, setOpen] = useState(section.defaultOpen || hasActiveItem);
  const Icon = section.icon;

  useEffect(() => {
    if (hasActiveItem) setOpen(true);
  }, [hasActiveItem]);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="group flex w-full items-center gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-forest dark:hover:text-sage-medium transition-colors"
      >
        <Icon className="h-3 w-3 opacity-60" />
        <span className="flex-1 text-left">{section.title}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <ul className="relative ml-4 mt-1 border-l border-sage">
          {section.items.map((item) => (
            <li key={item.href} className="relative">
              <Link
                to={item.href}
                className={`relative -ml-px flex items-center px-4 py-2 text-sm transition-all duration-150 ${
                  isActive(item.href)
                    ? "border-l-2 border-primary bg-sage-soft/60 font-medium text-forest dark:text-sage-medium"
                    : "border-l-2 border-transparent text-foreground hover:bg-sage-soft/50 hover:text-forest dark:hover:text-sage-medium"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
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
