import React from 'react';

/**
 * Utility functions for working with markdown content
 */

/**
 * Detects if a string contains markdown formatting
 * Enhanced detection for our custom markdown renderer
 * @param text The text to check for markdown
 * @returns boolean indicating if markdown was detected
 */
export function containsMarkdown(text: string): boolean {
  if (!text) return false;

  // Enhanced markdown patterns for better detection
  const markdownPatterns = [
    /^#{1,6}\s.+$/m, // Headers (# ## ### etc.)
    /^\s*[-*+]\s.+$/m, // Unordered lists (- * +)
    /^\s*\d+\.\s.+$/m, // Ordered lists (1. 2. etc.)
    /\[.+?\]\(.+?\)/, // Links [text](url)
    /!\[.+?\]\(.+?\)/, // Images ![alt](url)
    /`{1,3}[^`]+`{1,3}/, // Code (inline or blocks)
    /^```[\s\S]*?```$/m, // Code blocks with language
    /^\s*>\s.+$/m, // Blockquotes
    /\*\*.+?\*\*/, // Bold **text**
    /\*.+?\*/, // Italic *text*
    /~~.+?~~/, // Strikethrough ~~text~~
    /^\s*---+\s*$/m, // Horizontal rules ---
    /^\s*\*\*\*+\s*$/m, // Horizontal rules ***
    /^\s*___+\s*$/m, // Horizontal rules ___
    /^\s*\|.+\|.+\|.*$/m, // Tables |col1|col2| (enhanced)
    /^\s*\|[-\s|:]+\|.*$/m, // Table separators |---|---|
    /^\s*:::.*$/m, // Admonitions/callouts
    /\$\$.+?\$\$/s, // Math blocks
    /\$.+?\$/, // Inline math
    /\\\w+/, // LaTeX commands
    /\n\s*\n/, // Multiple line breaks (indicates structured content)
  ];

  return markdownPatterns.some((pattern) => pattern.test(text));
}

/**
 * Safely processes text that might contain markdown
 * Enhanced processing for better text formatting
 * @param text The text to process
 * @returns Processed text with enhanced formatting
 */
export function processText(text: string): React.ReactNode {
  if (!text) return '';

  // If it contains markdown, return as-is for markdown rendering
  if (containsMarkdown(text)) {
    return text;
  }

  // Enhanced text processing with better formatting
  const lines = text.split('\n');
  const processedLines = lines.map((line, index) => {
    // Convert bullet points
    const bulletRegex = /^[-*+]\s+(.+)$/;
    if (bulletRegex.test(line.trim())) {
      return (
        <div key={index} className="flex items-start space-x-2 my-1">
          <span className="text-primary mt-1">•</span>
          <span className="flex-1">
            {line.trim().replace(bulletRegex, '$1')}
          </span>
        </div>
      );
    }

    // Convert numbered lists
    const numberedRegex = /^\d+\.\s+(.+)$/;
    if (numberedRegex.test(line.trim())) {
      const match = line.trim().match(numberedRegex);
      const number = line.trim().match(/^(\d+)\./)?.[1];
      return (
        <div key={index} className="flex items-start space-x-2 my-1">
          <span className="text-primary font-medium min-w-[1.5rem]">
            {number}.
          </span>
          <span className="flex-1">{match?.[1]}</span>
        </div>
      );
    }

    // Regular lines with better spacing
    if (line.trim()) {
      return (
        <div key={index} className="my-1 leading-relaxed">
          {line}
        </div>
      );
    }

    // Empty lines for spacing
    return <div key={index} className="h-2" />;
  });

  return <div className="space-y-0">{processedLines}</div>;
}
