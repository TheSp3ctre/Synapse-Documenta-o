import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DocsSidebar, MobileMenuButton } from "@/components/docs/Sidebar";
import { Breadcrumb } from "@/components/docs/Breadcrumb";

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

  return (
    <div className="min-h-screen bg-background">
      <DocsSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-sage bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <MobileMenuButton onClick={() => setMenuOpen(true)} />
          <span className="text-sm font-bold uppercase tracking-tight text-foreground">DOCUMENTAÇÃO</span>
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
