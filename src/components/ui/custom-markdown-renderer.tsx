import React from 'react';
import { cn } from '@/lib/utils';
import '@/styles/custom-markdown.css';

interface CustomMarkdownRendererProps {
  content: string;
  className?: string;
  enableAnimations?: boolean;
  maxWidth?: string;
}

// Enhanced markdown parsing with better spacing and flexibility
export function CustomMarkdownRenderer({
  content,
  className,
  enableAnimations = true,
  maxWidth,
}: CustomMarkdownRendererProps) {
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
    let codeBlockContent = '';
    let inCodeBlock = false;
    let codeBlockLanguage = '';

    const flushList = () => {
      if (currentList) {
        const ListComponent = currentList.type === 'ul' ? 'ul' : 'ol';
        elements.push(
          <ListComponent
            key={`list-${elements.length}`}
            className={cn(
              'my-3 space-y-1',
              currentList.type === 'ul' ? 'list-disc pl-6' : 'list-decimal pl-6'
            )}
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {parseInlineMarkdown(item)}
              </li>
            ))}
          </ListComponent>
        );
        currentList = null;
      }
    };

    const flushCodeBlock = () => {
      if (inCodeBlock && codeBlockContent) {
        elements.push(
          <div key={`code-${elements.length}`} className="my-4">
            <pre className="bg-muted rounded-lg p-4 overflow-x-auto border">
              <code className="text-sm font-mono text-foreground whitespace-pre">
                {codeBlockContent.trim()}
              </code>
            </pre>
          </div>
        );
        codeBlockContent = '';
        inCodeBlock = false;
        codeBlockLanguage = '';
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Handle code blocks
      if (trimmedLine.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
        } else {
          flushList();
          inCodeBlock = true;
          codeBlockLanguage = trimmedLine.slice(3).trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent += line + '\n';
        continue;
      }

      // Empty line handling
      if (!trimmedLine) {
        flushList();
        // Add spacing for empty lines
        if (elements.length > 0) {
          const lastElement = elements[elements.length - 1];
          if (React.isValidElement(lastElement) && lastElement.type !== 'div') {
            elements.push(
              <div key={`space-${elements.length}`} className="h-2" />
            );
          }
        }
        continue;
      }

      // Headers
      const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        flushList();
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements;
        const headerClasses = {
          1: 'text-2xl font-bold mt-6 mb-4 text-foreground',
          2: 'text-xl font-bold mt-5 mb-3 text-foreground',
          3: 'text-lg font-semibold mt-4 mb-2 text-foreground',
          4: 'text-base font-semibold mt-3 mb-2 text-foreground',
          5: 'text-sm font-semibold mt-2 mb-1 text-foreground',
          6: 'text-xs font-semibold mt-2 mb-1 text-muted-foreground',
        };

        elements.push(
          <HeaderTag
            key={`header-${elements.length}`}
            className={headerClasses[level as keyof typeof headerClasses]}
          >
            {parseInlineMarkdown(text)}
          </HeaderTag>
        );
        continue;
      }

      // Blockquotes
      if (trimmedLine.startsWith('>')) {
        flushList();
        const quoteText = trimmedLine.slice(1).trim();
        elements.push(
          <blockquote
            key={`quote-${elements.length}`}
            className="border-l-4 border-primary/30 pl-4 py-2 my-3 italic text-muted-foreground bg-muted/30 rounded-r-md"
          >
            {parseInlineMarkdown(quoteText)}
          </blockquote>
        );
        continue;
      }

      // Horizontal rules
      if (
        trimmedLine.match(/^---+$/) ||
        trimmedLine.match(/^\*\*\*+$/) ||
        trimmedLine.match(/^___+$/)
      ) {
        flushList();
        elements.push(
          <hr key={`hr-${elements.length}`} className="my-6 border-border" />
        );
        continue;
      }

      // Unordered lists
      const ulMatch = trimmedLine.match(/^[-*+]\s+(.+)$/);
      if (ulMatch) {
        if (!currentList || currentList.type !== 'ul') {
          flushList();
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(ulMatch[1]);
        continue;
      }

      // Ordered lists
      const olMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
      if (olMatch) {
        if (!currentList || currentList.type !== 'ol') {
          flushList();
          currentList = { type: 'ol', items: [] };
        }
        currentList.items.push(olMatch[1]);
        continue;
      }

      // Regular paragraphs and table detection
      flushList();
      if (trimmedLine) {
        // Check if this might be part of a table
        if (trimmedLine.includes('|')) {
          // Look ahead to see if we have table content
          const tableLines = [];
          let currentIndex = i;

          // Collect all consecutive lines that contain pipes
          while (
            currentIndex < lines.length &&
            lines[currentIndex].trim() &&
            lines[currentIndex].includes('|')
          ) {
            tableLines.push(lines[currentIndex]);
            currentIndex++;
          }

          if (tableLines.length >= 2) {
            // We have a potential table, parse it
            const [headerLine, separatorLine, ...dataLines] = tableLines;

            // Check if second line is a separator (contains hyphens and pipes)
            if (
              separatorLine &&
              /^\s*\|?[\s\-:|]+\|?[\s\-:|]*$/.test(separatorLine.trim())
            ) {
              // Parse headers - remove leading/trailing pipes and split
              const cleanHeaderLine = headerLine
                .trim()
                .replace(/^\|/, '')
                .replace(/\|$/, '');
              const headers = cleanHeaderLine.split('|').map((h) => h.trim());

              // Parse data rows
              const rows = dataLines.map((line) => {
                const cleanLine = line
                  .trim()
                  .replace(/^\|/, '')
                  .replace(/\|$/, '');
                const cells = cleanLine.split('|').map((cell) => cell.trim());

                // Ensure we have the same number of cells as headers
                while (cells.length < headers.length) {
                  cells.push('');
                }

                return cells.slice(0, headers.length); // Truncate if too many cells
              });

              elements.push(
                <div
                  key={`table-${elements.length}`}
                  className="my-4 overflow-x-auto"
                >
                  <table className="min-w-full border-collapse border border-border rounded-lg">
                    <thead className="bg-muted/50">
                      <tr>
                        {headers.map((header, idx) => (
                          <th
                            key={idx}
                            className="border border-border px-3 py-2 text-left font-semibold text-sm"
                          >
                            {parseInlineMarkdown(header)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-muted/20">
                          {row.map((cell, cellIdx) => (
                            <td
                              key={cellIdx}
                              className="border border-border px-3 py-2 text-sm"
                            >
                              {parseInlineMarkdown(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );

              // Skip the processed table lines
              i = currentIndex - 1;
              continue;
            }
          }
        }

        // Regular paragraph
        elements.push(
          <p
            key={`p-${elements.length}`}
            className="leading-relaxed my-2 text-foreground"
          >
            {parseInlineMarkdown(trimmedLine)}
          </p>
        );
      }
    }

    // Flush any remaining content
    flushList();
    flushCodeBlock();

    return elements;
  };

  const parseInlineMarkdown = (text: string): React.ReactNode => {
    // Handle inline code first (to avoid conflicts with other formatting)
    let parts: (string | React.ReactNode)[] = [text];

    // Inline code
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return [part];
      const codeRegex = /`([^`]+)`/g;
      const segments: (string | React.ReactNode)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = codeRegex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          segments.push(part.slice(lastIndex, match.index));
        }
        segments.push(
          <code
            key={`code-${match.index}`}
            className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono border"
          >
            {match[1]}
          </code>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < part.length) {
        segments.push(part.slice(lastIndex));
      }

      return segments;
    });

    // Bold text
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return [part];
      const boldRegex = /\*\*([^*]+)\*\*/g;
      const segments: (string | React.ReactNode)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          segments.push(part.slice(lastIndex, match.index));
        }
        segments.push(
          <strong key={`bold-${match.index}`} className="font-semibold">
            {match[1]}
          </strong>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < part.length) {
        segments.push(part.slice(lastIndex));
      }

      return segments;
    });

    // Italic text
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return [part];
      const italicRegex = /\*([^*]+)\*/g;
      const segments: (string | React.ReactNode)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = italicRegex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          segments.push(part.slice(lastIndex, match.index));
        }
        segments.push(
          <em key={`italic-${match.index}`} className="italic">
            {match[1]}
          </em>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < part.length) {
        segments.push(part.slice(lastIndex));
      }

      return segments;
    });

    // Strikethrough
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return [part];
      const strikeRegex = /~~([^~]+)~~/g;
      const segments: (string | React.ReactNode)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = strikeRegex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          segments.push(part.slice(lastIndex, match.index));
        }
        segments.push(
          <del
            key={`strike-${match.index}`}
            className="line-through opacity-75"
          >
            {match[1]}
          </del>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < part.length) {
        segments.push(part.slice(lastIndex));
      }

      return segments;
    });

    // Links
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return [part];
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const segments: (string | React.ReactNode)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          segments.push(part.slice(lastIndex, match.index));
        }
        segments.push(
          <a
            key={`link-${match.index}`}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            {match[1]}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < part.length) {
        segments.push(part.slice(lastIndex));
      }

      return segments;
    });

    return <>{parts}</>;
  };

  return (
    <div
      className={cn(
        'custom-markdown-renderer space-y-1',
        !enableAnimations && 'no-animations',
        className
      )}
      style={maxWidth ? { maxWidth } : undefined}
    >
      {parseMarkdown(content)}
    </div>
  );
}
