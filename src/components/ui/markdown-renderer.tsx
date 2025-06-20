import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div className={cn('markdown-renderer', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // rehypePlugins={[rehypeRaw]}
        components={{
          // Override default components for better styling
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold " {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold " {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-base font-bold" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 className="text-sm font-bold" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 className="text-xs font-bold" {...props} />
          ),
          p: ({ node, ...props }) => <p className="" {...props} />,
          a: ({ node, ...props }) => (
            <a className="text-primary hover:underline" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5" {...props} />
          ),
          li: ({ node, ...props }) => <li className="" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-muted pl-3 italic "
              {...props}
            />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code
                  className="bg-muted px-1 py-0.5 rounded text-sm font-mono break-words"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <div className="max-w-full overflow-x-auto">
                <pre className="bg-muted rounded-md">
                  <code
                    className="text-sm font-mono whitespace-pre-wrap break-words"
                    {...props}
                  >
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full divide-y divide-border" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-muted" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-border" {...props} />
          ),
          tr: ({ node, ...props }) => <tr className="" {...props} />,
          th: ({ node, ...props }) => (
            <th
              className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-2"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 text-sm" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="border-t border-border" {...props} />
          ),
          img: ({ node, ...props }) => (
            <img className="max-w-full h-auto rounded-md " {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
