import React from 'react';
import { CustomMarkdownRenderer } from '@/components/ui/custom-markdown-renderer';

const testMarkdown = `# Custom Markdown Renderer Demo

This is a **custom markdown renderer** with *enhanced spacing* and ~~flexibility~~.

## Features

- Better spacing between elements
- Enhanced typography
- Flexible styling options
- **Bold text** and *italic text* support
- \`inline code\` with proper styling
- Table support with proper formatting

### Code Blocks

\`\`\`javascript
function greetUser(name) {
  console.log(\`Hello, \${name}!\`);
  return true;
}
\`\`\`

### Lists

1. First ordered item
2. Second ordered item
   - Nested unordered item
   - Another nested item
3. Third ordered item

### Tables

| Criteria | Apple | Orange |
|----------|-------|--------|
| Taste | Sweet/tart | Sweet/tangy |
| Skin Color | Red, green, yellow | Orange |
| Flesh Color | White or pale green | Pink or orange |
| Texture | Firm and crisp | Juicy and soft |
| Flavor Profile | Often described as refreshing | Known for citrusy and zesty |
| Common Uses | Snacking, baking, sauce, cider | Juicing, salads, desserts |
| Origin | Central Asia, Europe | Southeast Asia, Europe |

| Risk | Likelihood | Impact | Mitigation |
|------|------------|---------|------------|
| Resource Shortage | High | Medium | Cross-train team members; secure backup resources |
| Scope Creep | Medium | High | Define change control process; prioritize features |
| External Delay | Low | Medium | Build buffer into timeline; track dependencies |

### Blockquotes

> This is a blockquote with enhanced styling
> that spans multiple lines and looks great!

### Links and More

Check out [this link](https://example.com) for more information.

---

The renderer provides better control over spacing, typography, and overall presentation compared to library-based solutions.`;

export function MarkdownDemo() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Custom Markdown Renderer Demo</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Raw Markdown</h2>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
            {testMarkdown}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Rendered Output</h2>
          <div className="border rounded-lg p-4 bg-background max-h-96 overflow-auto">
            <CustomMarkdownRenderer
              content={testMarkdown}
              enableAnimations={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
