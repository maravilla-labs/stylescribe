---
title: Guides
navtitle: Guides
order: 2
---

Task-focused guides for creating and customizing StyleScribe documentation.

## Foundation

<div class="grid grid-cols-1 md:grid-cols-1 gap-4 not-prose mb-8">
<a href="./tokens.html" class="block p-4 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:hover:bg-emerald-900 transition-colors">
<h3 class="font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Design Tokens & Theming</h3>
<p class="text-sm text-emerald-600 dark:text-emerald-400">Token structure, component tokens, dark mode, brand themes</p>
</a>
</div>

## Content Types

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose mb-8">
<a href="./components.html" class="block p-4 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:hover:bg-indigo-900 transition-colors">
<h3 class="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Components</h3>
<p class="text-sm text-indigo-600 dark:text-indigo-400">Document CSS components with annotations</p>
</a>
<a href="./blocks.html" class="block p-4 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950 dark:hover:bg-violet-900 transition-colors">
<h3 class="font-semibold text-violet-700 dark:text-violet-300 mb-1">UI Blocks</h3>
<p class="text-sm text-violet-600 dark:text-violet-400">Composed patterns from multiple components</p>
</a>
<a href="./pages.html" class="block p-4 rounded-xl border border-fuchsia-200 bg-fuchsia-50 hover:bg-fuchsia-100 dark:border-fuchsia-900 dark:bg-fuchsia-950 dark:hover:bg-fuchsia-900 transition-colors">
<h3 class="font-semibold text-fuchsia-700 dark:text-fuchsia-300 mb-1">Pages</h3>
<p class="text-sm text-fuchsia-600 dark:text-fuchsia-400">Markdown docs, templates, navigation</p>
</a>
</div>

## Customization

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-8">
<a href="./customization.html" class="block p-4 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950 dark:hover:bg-orange-900 transition-colors">
<h3 class="font-semibold text-orange-700 dark:text-orange-300 mb-1">Customization</h3>
<p class="text-sm text-orange-600 dark:text-orange-400">Themes, templates, and branding</p>
</a>
<a href="./mcp-integration.html" class="block p-4 rounded-xl border border-pink-200 bg-pink-50 hover:bg-pink-100 dark:border-pink-900 dark:bg-pink-950 dark:hover:bg-pink-900 transition-colors">
<h3 class="font-semibold text-pink-700 dark:text-pink-300 mb-1">MCP Integration</h3>
<p class="text-sm text-pink-600 dark:text-pink-400">AI assistant support with Claude Code</p>
</a>
</div>

## Quick Reference

### Core Workflow

```bash
# Initialize project
stylescribe init my-project

# Development with hot reload
stylescribe dev

# Create components
stylescribe create-component button --group="Actions"

# Generate static site
stylescribe docs
```

### Token Management

```bash
# Validate tokens
stylescribe tokens validate

# Export to CSS
stylescribe tokens export --format=css

# Add a new theme
stylescribe add-theme dark --file=./tokens/dark.json --mode=dark
```

### Icon Management

```bash
# List installed icon packages
stylescribe icons list

# Search for icons
stylescribe icons search -q "trash"

# Get icon token path
stylescribe icons path -p bootstrap-icons -i trash
```

### Screenshots

```bash
# Generate all screenshots (requires Playwright)
stylescribe screenshots

# Generate specific types
stylescribe screenshots --type=components
stylescribe screenshots --type=docs

# Force regenerate all
stylescribe screenshots --force
```

Screenshots appear as thumbnails in search results. Run `stylescribe docs` first, then `stylescribe screenshots`.

## Looking for Reference Docs?

Technical reference documentation is in the [Reference](../reference/index.html) section:

- [Annotations](../reference/annotations.html) — All annotation syntax
- [CLI Commands](../reference/cli-commands.html) — All 13 commands
- [Configuration](../reference/configuration.html) — All config options
- [Design Tokens](../reference/design-tokens.html) — Token format & 46 functions
- [Icons](../reference/icons.html) — Icon system reference
