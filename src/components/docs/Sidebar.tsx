import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Leaf, Moon, Sun, ChevronDown, BookOpen, Compass, Lightbulb, GitBranch, X, Menu } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type NavItem = { label: string; href: string; active?: boolean };
type NavSection = { title: string; icon: React.ComponentType<{ className?: string }>; items: NavItem[]; defaultOpen?: boolean };

const sections: NavSection[] = [
  {
    title: "Documentação",
    icon: BookOpen,
    defaultOpen: true,
    items: [
      { label: "Introdução", href: "/", active: true },
    ],
  },
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredSections = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return sections;
    
    return sections.map(section => ({
      ...section,
      items: section.items.filter(item => 
        item.label.toLowerCase().includes(term) || 
        section.title.toLowerCase().includes(term)
      )
    })).filter(section => section.items.length > 0);
  }, [searchTerm]);

  const onSelect = (href: string) => {
    navigate({ to: href as any });
    setSearchOpen(false);
    onClose();
  };

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
          <div className="flex-1">
            <div className="text-sm font-bold tracking-tight text-foreground uppercase">DOCUMENTAÇÃO</div>
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
            onClick={() => setSearchOpen(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-sage bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-sage-soft/50 hover:text-forest transition-all"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Pesquisar...</span>
          </button>
        </div>

        {/* Search Modal */}
        <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
          <CommandInput 
            placeholder="Digite para pesquisar..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            {filteredSections.map((section) => (
              <CommandGroup key={section.title} heading={section.title}>
                {section.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    onSelect={() => onSelect(item.href)}
                    className="cursor-pointer"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </CommandDialog>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {sections.map((s) => <Section key={s.title} section={s} />)}
        </nav>

        {/* Footer */}
        <div className="border-t border-sage px-4 py-3 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">© DOCUMENTAÇÃO</span>
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
