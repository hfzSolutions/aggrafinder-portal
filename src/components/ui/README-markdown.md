# Markdown Renderer Component

This document provides guidance on how to use the Markdown Renderer component in the application.

## Overview

The `MarkdownRenderer` component allows you to render markdown content with proper formatting, including:

- Headers (# Heading)
- Lists (ordered and unordered)
- Links and images
- Code blocks and inline code
- Tables
- Blockquotes
- Bold, italic, and strikethrough text
- And more

## Usage

### Basic Usage

```tsx
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

function MyComponent() {
  const markdownContent = '# Hello World\n\nThis is **bold** text.';

  return (
    <div>
      <MarkdownRenderer content={markdownContent} />
    </div>
  );
}
```

### With Custom Styling

```tsx
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

function MyComponent() {
  const markdownContent = '# Hello World\n\nThis is **bold** text.';

  return (
    <div>
      <MarkdownRenderer
        content={markdownContent}
        className="custom-markdown-styles"
      />
    </div>
  );
}
```

## Utility Functions

The application includes utility functions for working with markdown content:

### `containsMarkdown(text: string): boolean`

Detects if a string contains markdown formatting.

```tsx
import { containsMarkdown } from '@/lib/markdown';

const hasMarkdown = containsMarkdown(text);
```

### `processText(text: string): string`

Safely processes text that might contain markdown. If the text contains markdown, it's returned as-is for rendering with a markdown component. If not, basic formatting like bullet points is applied.

```tsx
import { processText } from '@/lib/markdown';

const formattedText = processText(text);
```

## Intelligent Rendering Pattern

For components that may receive content with or without markdown, use this pattern:

```tsx
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { containsMarkdown, processText } from '@/lib/markdown';

function ContentDisplay({ content }) {
  return (
    <div>
      {containsMarkdown(content) ? (
        <MarkdownRenderer content={content} />
      ) : (
        processText(content)
      )}
    </div>
  );
}
```

## Styling

The markdown renderer includes default styles in `src/styles/markdown.css`. These styles are automatically applied to all markdown content rendered with the `MarkdownRenderer` component.

If you need to customize the styles for a specific use case, you can pass a custom className to the component and define your styles in your CSS file.
