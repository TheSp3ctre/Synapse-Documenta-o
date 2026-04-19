import { useState, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DocsSidebar, MobileMenuButton, sections } from "@/components/docs/Sidebar";
import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { BookOpen } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Introdução — Documentação" },
      { name: "description", content: "Documentação oficial da solução." },
      { property: "og:title", content: "Introdução — Documentação" },
      { property: "og:description", content: "Documentação oficial da solução." },
    ],
  }),
  component: IntroductionPage,
});

function IntroductionPage() {
  const [menuOpen, setMenuOpen] = useState(false);
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

      <main className="lg:pl-[260px]">
        <div className="mx-auto max-w-[768px] px-5 py-10 sm:px-8 md:px-12 md:py-16">
          <Breadcrumb items={["Documentação", "Introdução"]} />

          <h1 className="mt-6 text-[28px] sm:text-[36px] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground">
            Introdução
          </h1>
          
          <div className="mt-8 prose-content">
            <p className="text-[16px] sm:text-[17px] leading-relaxed text-foreground">
              O propósito desta página é documentar a solução, servindo como uma introdução ao sistema e suas funcionalidades.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
