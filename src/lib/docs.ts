import React from "react";

// Import all markdown files from the Documentacao folder
export const docFiles = import.meta.glob("../Documentacao/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export type NavItem = { label: string; href: string };
export type NavSection = {
  title: string;
  icon?: React.ElementType;
  items: NavItem[];
  defaultOpen?: boolean;
};

export const getDocSections = (): NavSection[] => {
  const items = Object.entries(docFiles).map(([path, content]) => {
    const slug = path.split("/").pop()?.replace(".md", "") || "";
    const titleMatch = content.match(/^#\s+(.*)/m);
    const label = titleMatch
      ? titleMatch[1]
      : slug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
    return { label, href: `/docs/${slug}` };
  });

  return [
    {
      title: "Documentação",
      items: [{ label: "Introdução", href: "/" }, ...items],
      defaultOpen: true,
    },
  ];
};
