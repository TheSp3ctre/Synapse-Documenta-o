import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { Breadcrumb } from "@/components/docs/Breadcrumb";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Import all markdown files as raw strings
const docs = import.meta.glob("../Documentacao/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const Route = createFileRoute("/docs/$slug")({
  component: DocPage,
});

function DocPage() {
  const { slug } = Route.useParams();
  const filePath = `../Documentacao/${slug}.md`;
  const content = docs[filePath];

  if (!content) {
    return (
      <DocsLayout>
        <div className="mx-auto max-w-[768px] px-5 py-10 sm:px-8 md:px-12 md:py-16">
          <h1 className="text-2xl font-bold">Documento não encontrado</h1>
          <p className="mt-4">O documento "{slug}" não existe ou foi removido.</p>
        </div>
      </DocsLayout>
    );
  }

  // Simple title extractor from markdown (# Title)
  const titleMatch = content.match(/^#\s+(.*)/m);
  const title = titleMatch ? titleMatch[1] : slug;

  return (
    <DocsLayout>
      <div className="mx-auto max-w-[768px] px-5 py-10 sm:px-8 md:px-12 md:py-16">
        <Breadcrumb items={["Documentação", title]} />

        <div className="mt-8 prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-h1:text-[28px] sm:prose-h1:text-[36px] prose-h2:text-[22px] sm:prose-h2:text-[26px] prose-p:text-[16px] sm:prose-p:text-[17px] prose-p:leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
    </DocsLayout>
  );
}
