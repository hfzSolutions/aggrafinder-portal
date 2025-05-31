/**
 * Utility functions for working with markdown content
 */

/**
 * Detects if a string contains markdown formatting
 * @param text The text to check for markdown
 * @returns boolean indicating if markdown was detected
 */
export function containsMarkdown(text: string): boolean {
  if (!text) return false;

  // Common markdown patterns to detect
  const markdownPatterns = [
    /^#+\s.+$/m, // Headers
    /^\s*[*-]\s.+$/m, // Unordered lists
    /^\s*\d+\.\s.+$/m, // Ordered lists
    /\[.+?\]\(.+?\)/, // Links
    /!\[.+?\]\(.+?\)/, // Images
    /`{1,3}[^`]+`{1,3}/, // Code (inline or blocks)
    /^\s*>\s.+$/m, // Blockquotes
    /\*\*.+?\*\*/, // Bold
    /\*.+?\*/, // Italic
    /~~.+?~~/, // Strikethrough
    /^\s*---+\s*$/m, // Horizontal rules
    /\|.+\|.+\|/, // Tables
    /^```[\s\S]+?```$/m, // Code blocks
    /^\s*:::.*$/m, // Admonitions/callouts
    /\$\$.+?\$\$/s, // Math blocks
    /\$.+?\$/, // Inline math
  ];

  return markdownPatterns.some((pattern) => pattern.test(text));
}

/**
 * Safely processes text that might contain markdown
 * If the text contains markdown, it's returned as-is for rendering with a markdown component
 * If not, basic formatting like bullet points is applied
 *
 * @param text The text to process
 * @returns Processed text
 */
export function processText(text: string): string {
  if (!text) return '';

  // If it contains markdown, return as-is for markdown rendering
  if (containsMarkdown(text)) {
    return text;
  }

  // Otherwise apply basic formatting like bullet points
  return text.replace(/^[-*]\s/gm, '• ');
}
