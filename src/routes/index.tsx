import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Leaf } from "lucide-react";
import { DocsSidebar } from "@/components/docs/Sidebar";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import flowchart from "@/assets/flowchart-intro.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Introduction — Verdant Docs" },
      { name: "description", content: "Welcome to Verdant — a calm, precise framework for building sustainable software." },
      { property: "og:title", content: "Introduction — Verdant Docs" },
      { property: "og:description", content: "Welcome to Verdant — a calm, precise framework for building sustainable software." },
    ],
  }),
  component: IntroductionPage,
});

const installCode = `# Install Verdant with your preferred package manager
npm install @verdant/core @verdant/cli

# Initialize a new project
npx verdant init my-garden --template minimal
cd my-garden && npm run dev`;

function IntroductionPage() {
  return (
    <div className="min-h-screen bg-background">
      <DocsSidebar />
      <TableOfContents />

      {/* Mobile top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-sage bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Leaf className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold">Verdant</span>
        </div>
        <span className="text-[11px] text-muted-foreground">v2.1.0</span>
      </header>

      <main className="lg:pl-[260px] xl:pr-[220px]">
        <div className="mx-auto max-w-[768px] px-6 py-12 md:px-12 md:py-16">
          <Breadcrumb items={["Docs", "Getting Started", "Introduction"]} />

          <div className="mt-6 flex items-center gap-2">
            <Leaf className="h-4 w-4 text-sage-medium" strokeWidth={2} />
            <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
              Getting Started
            </span>
          </div>

          <h1 className="mt-3 text-[36px] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground">
            Introduction
          </h1>
          <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">
            A calm, precise framework for building sustainable software — designed to grow with your team.
          </p>

          <div className="mt-12 prose-content">
            <section id="overview">
              <h2 className="mt-12 text-[24px] font-semibold tracking-[-0.01em] text-foreground">Overview</h2>
              <p className="mt-4 text-[16px] leading-[1.7] text-foreground">
                Verdant is a documentation-first toolkit for designing resilient applications. It draws inspiration
                from the way ecosystems balance growth and constraint — favoring clarity over cleverness, and
                composition over magic. Every primitive in the library is small, observable, and intentionally boring.
              </p>
              <p className="mt-4 text-[16px] leading-[1.7] text-foreground">
                Whether you're prototyping a single endpoint or operating a multi-region platform, Verdant gives you
                the same vocabulary: <em className="not-italic font-medium text-forest">flows</em>,{" "}
                <em className="not-italic font-medium text-forest">surfaces</em>, and{" "}
                <em className="not-italic font-medium text-forest">roots</em>. These three primitives compose into
                everything else.
              </p>
            </section>

            <section id="why-verdant">
              <h2 className="mt-12 text-[24px] font-semibold tracking-[-0.01em] text-foreground">Why Verdant</h2>
              <p className="mt-4 text-[16px] leading-[1.7] text-foreground">
                Most frameworks optimize for the first ten minutes of a project. Verdant optimizes for the next ten
                years. We invest in <code className="rounded bg-code-bg px-1.5 py-0.5 text-[14px] text-forest">predictable defaults</code>,
                clear failure modes, and documentation that ages gracefully. The result is software that feels less
                like a thicket and more like a garden you actually want to tend.
              </p>

              <Callout variant="info" title="A note on philosophy">
                Verdant follows the principle of <em className="not-italic font-medium">minimum viable abstraction</em>.
                If a feature can be expressed with the standard library, it should be — and we'll show you how, rather
                than wrapping it in our own API.
              </Callout>
            </section>

            <section id="architecture">
              <h2 className="mt-12 text-[24px] font-semibold tracking-[-0.01em] text-foreground">
                Architecture diagram
              </h2>
              <p className="mt-4 text-[16px] leading-[1.7] text-foreground">
                The diagram below illustrates how a request flows through a typical Verdant application. Each node
                represents a primitive that you can inspect, override, or replace independently.
              </p>

              <figure className="mt-8">
                <div className="overflow-hidden rounded-lg border border-sage bg-paper" style={{ boxShadow: "0 1px 3px rgba(45,106,62,0.08)" }}>
                  <img
                    src={flowchart}
                    alt="Diagram showing Verdant request flow with sage and forest green nodes"
                    width={1280}
                    height={768}
                    loading="lazy"
                    className="w-full"
                  />
                </div>
                <figcaption className="mt-3 text-center text-[13px] text-muted-foreground">
                  Figure 1 — A request travels from <span className="text-forest">surface</span> through{" "}
                  <span className="text-forest">flows</span> before settling at the <span className="text-forest">root</span>.
                </figcaption>
              </figure>
            </section>

            <section id="example">
              <h2 className="mt-12 text-[24px] font-semibold tracking-[-0.01em] text-foreground">
                A minimal example
              </h2>
              <p className="mt-4 text-[16px] leading-[1.7] text-foreground">
                Install the CLI and scaffold your first garden. The command below creates a new project with the{" "}
                <code className="rounded bg-code-bg px-1.5 py-0.5 text-[14px] text-forest">minimal</code> template —
                roughly 40 lines of generated code, all of which you're encouraged to read.
              </p>
              <CodeBlock language="bash" code={installCode} />
              <p className="mt-4 text-[16px] leading-[1.7] text-foreground">
                Open <code className="rounded bg-code-bg px-1.5 py-0.5 text-[14px] text-forest">http://localhost:3000</code>{" "}
                in your browser. You should see a single page with a heading and a counter — the smallest application
                Verdant can produce.
              </p>
            </section>

            <section id="next-steps">
              <h2 className="mt-12 text-[24px] font-semibold tracking-[-0.01em] text-foreground">Next steps</h2>
              <p className="mt-4 text-[16px] leading-[1.7] text-foreground">
                From here, the path branches. If you'd like a guided tour, continue to the Quick Start. If you prefer
                to learn by reading, the Core Concepts section is written to be read end-to-end.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <a href="#" className="group rounded-lg border border-sage bg-paper p-5 transition-all duration-150 hover:border-sage-medium hover:bg-sage-soft/30">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Next</div>
                  <div className="mt-1.5 flex items-center gap-1.5 font-medium text-forest">
                    Installation
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </a>
                <a href="#" className="group rounded-lg border border-sage bg-paper p-5 transition-all duration-150 hover:border-sage-medium hover:bg-sage-soft/30">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Read</div>
                  <div className="mt-1.5 flex items-center gap-1.5 font-medium text-forest">
                    Core Concepts
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </a>
              </div>
            </section>

            <div className="mt-16 flex items-center justify-between border-t border-sage pt-6 text-[13px] text-muted-foreground">
              <span>Last updated April 12, 2026</span>
              <span className="flex items-center gap-1.5">
                <Leaf className="h-3 w-3 text-sage-medium" />
                Verdant v2.1.0
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
