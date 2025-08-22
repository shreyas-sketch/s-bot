import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg md:text-2xl font-bold mb-3 md:mb-4 mt-4 md:mt-6 text-primary border-b-2 border-primary pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base md:text-xl font-semibold mb-2 md:mb-3 mt-4 md:mt-5 text-secondary flex items-center">
              <span className="mr-2 text-primary">▶</span>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm md:text-lg font-medium mb-2 mt-3 md:mt-4 text-accent">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 md:mb-4 leading-relaxed text-sm md:text-base text-foreground">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6 ml-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 md:space-y-3 mb-4 md:mb-6 ml-4 list-decimal">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start space-x-3 text-sm md:text-base leading-relaxed text-foreground">
              <span className="text-primary font-bold text-base md:text-lg leading-none mt-1 flex-shrink-0">●</span>
              <span>{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-primary">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-secondary">{children}</em>
          ),
          code: ({ children }) => (
            <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-primary">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <table className="w-full border-collapse border border-border rounded-lg overflow-hidden mb-6 shadow-sm">
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-semibold text-sm md:text-base bg-primary text-primary-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-t border-border px-4 py-3 text-sm md:text-base">
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 ml-2 mb-4 italic bg-primary/5 text-muted-foreground p-4 rounded-r-lg">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};