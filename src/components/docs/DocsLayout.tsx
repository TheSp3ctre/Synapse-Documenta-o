import { useState, useMemo } from "react";
import { useNavigate, Outlet } from "@tanstack/react-router";
import { DocsSidebar, MobileMenuButton } from "@/components/docs/Sidebar";
import { getDocSections } from "@/lib/docs";
import { BookOpen } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface DocsLayoutProps {
  children?: React.ReactNode;
}

export function DocsLayout({ children }: DocsLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredSections = useMemo(() => {
    const sections = getDocSections();
    const term = searchTerm.toLowerCase();
    if (!term) return sections;

    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(term) || section.title.toLowerCase().includes(term),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [searchTerm]);

  const onSelect = (href: string) => {
    navigate({ to: href as string });
    setSearchOpen(false);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <DocsSidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSearchOpen={() => {
          setMenuOpen(false);
          setSearchOpen(true);
        }}
      />

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

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-sage bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <MobileMenuButton onClick={() => setMenuOpen(true)} />
          <img src="/LOGO.png" alt="Logo" className="h-5 w-auto object-contain" />
        </div>
      </header>

      <main className="lg:pl-[260px]">{children || <Outlet />}</main>
    </div>
  );
}
