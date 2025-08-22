import React from 'react';

interface MarkdownComponentProps {
  children?: React.ReactNode;
}

interface MarkdownTableProps {
  children?: React.ReactNode;
}

export const MarkdownComponents = {
  h1: ({ children }: MarkdownComponentProps) => (
    <h1 className="text-lg md:text-2xl font-bold mb-3 md:mb-4 mt-4 md:mt-6 text-stock-analysis border-b-2 border-current pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: MarkdownComponentProps) => (
    <h2 className="text-base md:text-xl font-semibold mb-2 md:mb-3 mt-4 md:mt-5 text-options-trading flex items-center before:content-['▶'] before:mr-2 before:text-stock-analysis">
      {children}
    </h2>
  ),
  h3: ({ children }: MarkdownComponentProps) => (
    <h3 className="text-sm md:text-lg font-semibold mb-2 mt-3 md:mt-4 text-warning">
      {children}
    </h3>
  ),
  p: ({ children }: MarkdownComponentProps) => (
    <p className="mb-3 md:mb-4 leading-relaxed text-sm md:text-base text-foreground">
      {children}
    </p>
  ),
  strong: ({ children }: MarkdownComponentProps) => (
    <strong className="font-bold text-stock-analysis">
      {children}
    </strong>
  ),
  em: ({ children }: MarkdownComponentProps) => (
    <em className="italic text-options-trading">
      {children}
    </em>
  ),
  table: ({ children }: MarkdownTableProps) => (
    <div className="overflow-x-auto my-4 md:my-6">
      <table className="w-full border-collapse border border-border rounded-lg overflow-hidden shadow-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: MarkdownComponentProps) => (
    <thead className="bg-stock-analysis text-white">
      {children}
    </thead>
  ),
  th: ({ children }: MarkdownComponentProps) => (
    <th className="px-4 py-3 text-left font-semibold text-sm md:text-base">
      {children}
    </th>
  ),
  td: ({ children }: MarkdownComponentProps) => (
    <td className="border-t border-border px-4 py-3 text-sm md:text-base">
      {children}
    </td>
  ),
  tr: ({ children }: MarkdownComponentProps) => (
    <tr className="even:bg-muted/30">
      {children}
    </tr>
  ),
  ul: ({ children }: MarkdownComponentProps) => (
    <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6 ml-4">
      {children}
    </ul>
  ),
  li: ({ children }: MarkdownComponentProps) => (
    <li className="flex items-start space-x-3 text-sm md:text-base leading-relaxed text-foreground before:content-['●'] before:text-stock-analysis before:font-bold before:text-base before:md:text-lg before:leading-none before:mt-1 before:flex-shrink-0">
      <span className="flex-1">{children}</span>
    </li>
  ),
  ol: ({ children }: MarkdownComponentProps) => (
    <ol className="space-y-2 md:space-y-3 mb-4 md:mb-6 ml-6 list-decimal">
      {children}
    </ol>
  ),
  blockquote: ({ children }: MarkdownComponentProps) => (
    <blockquote className="border-l-4 border-accent pl-4 ml-2 mb-4 italic p-4 rounded-r-lg bg-accent/5 text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ children }: MarkdownComponentProps) => (
    <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-accent">
      {children}
    </code>
  ),
  pre: ({ children }: MarkdownComponentProps) => (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
      {children}
    </pre>
  ),
  hr: ({ children }: MarkdownComponentProps) => (
    <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-stock-analysis to-transparent" />
  ),
};