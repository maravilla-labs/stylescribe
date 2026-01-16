---
title: StyleScribe
navtitle: Home
slug: index
order: 0
listComponents: false
hero:
  badge: Documentation Generator
  tagline: A modern style guide generator for CSS/SCSS design systems with W3C Design Token support. Parse annotated stylesheets to generate interactive documentation with live reload.
  icon: stylescribe-logo.png
  cta:
    - text: Get Started
      href: getting-started.html
    - text: View Guides
      href: guides/index.html
---

**StyleScribe** is a CLI tool that generates beautiful, interactive documentation from your CSS/SCSS files and design tokens.

## Quick Links

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 not-prose mb-8">
<a href="./getting-started.html" class="block p-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:hover:bg-blue-900 transition-colors">
<h3 class="font-semibold text-blue-700 dark:text-blue-300 mb-1">Getting Started</h3>
<p class="text-sm text-blue-600 dark:text-blue-400">Installation and first project</p>
</a>
<a href="./documentation/reference/cli-commands.html" class="block p-4 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-900 dark:bg-green-950 dark:hover:bg-green-900 transition-colors">
<h3 class="font-semibold text-green-700 dark:text-green-300 mb-1">CLI Commands</h3>
<p class="text-sm text-green-600 dark:text-green-400">All 13 commands explained</p>
</a>
<a href="./documentation/reference/design-tokens.html" class="block p-4 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950 dark:hover:bg-purple-900 transition-colors">
<h3 class="font-semibold text-purple-700 dark:text-purple-300 mb-1">Design Tokens</h3>
<p class="text-sm text-purple-600 dark:text-purple-400">W3C DTCG format & 46 functions</p>
</a>
<a href="./documentation/guides/mcp-integration.html" class="block p-4 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950 dark:hover:bg-orange-900 transition-colors">
<h3 class="font-semibold text-orange-700 dark:text-orange-300 mb-1">MCP Integration</h3>
<p class="text-sm text-orange-600 dark:text-orange-400">AI assistant support</p>
</a>
</div>

## Key Features

### Annotated Stylesheets
Document your CSS/SCSS components using JSDoc-style annotations. StyleScribe extracts metadata, variations, examples, and more.

```scss
/**
 * @title Button
 * @description Interactive button for user actions
 * @group Actions
 * @variations primary, secondary, danger
 * @examples
 * - title: Primary
 *   code: <button class="btn btn--primary">Click</button>
 */
.btn { /* ... */ }
```

### W3C Design Tokens
Full support for W3C Design Tokens Community Group (DTCG) format with 46 programmable functions for colors, typography, and more.

```json
{
  "color": {
    "primary": { "$value": "#3b82f6" },
    "primary-light": { "$value": "tint({color.primary}, 20%)" },
    "text-on-primary": { "$value": "accessibleText({color.primary})" }
  }
}
```

### Live Development
Hot reload development server watches your files and updates the browser instantly. No manual refresh needed.

```bash
stylescribe dev --watch
```

### MCP Integration
Built-in Model Context Protocol server for AI assistants like Claude Code. Get intelligent suggestions and automate component creation.

## Installation

```bash
npm install -g stylescribe
stylescribe init my-docs
cd my-docs
npm run dev
```

## Project Types

StyleScribe supports multiple documentation use cases:

| Type | Description |
|------|-------------|
| **Design System** | Full component library with tokens, variants, and examples |
| **Documentation Site** | Markdown-based docs with optional components |
| **Style Guide** | CSS documentation with live previews |

## More Resources

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
<a href="./documentation/reference/annotations.html" class="block p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
<h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-1">Annotations</h3>
<p class="text-sm text-gray-600 dark:text-gray-400">Component documentation syntax</p>
</a>
<a href="./documentation/guides/customization.html" class="block p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
<h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-1">Customization</h3>
<p class="text-sm text-gray-600 dark:text-gray-400">Themes and template overrides</p>
</a>
<a href="./documentation/reference/configuration.html" class="block p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
<h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-1">Configuration</h3>
<p class="text-sm text-gray-600 dark:text-gray-400">.stylescriberc.json options</p>
</a>
</div>
