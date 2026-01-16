---
title: Reference
navtitle: Reference
order: 4
---

Technical reference documentation for StyleScribe. Use this section to look up specific syntax, options, and APIs.

## Reference Guides

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-8">
<a href="./annotations.html" class="block p-4 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950 dark:hover:bg-purple-900 transition-colors">
<h3 class="font-semibold text-purple-700 dark:text-purple-300 mb-1">Annotations</h3>
<p class="text-sm text-purple-600 dark:text-purple-400">JSDoc-style component documentation syntax</p>
</a>
<a href="./cli-commands.html" class="block p-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:hover:bg-blue-900 transition-colors">
<h3 class="font-semibold text-blue-700 dark:text-blue-300 mb-1">CLI Commands</h3>
<p class="text-sm text-blue-600 dark:text-blue-400">Complete reference for all 13 CLI commands</p>
</a>
<a href="./configuration.html" class="block p-4 rounded-xl border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 dark:border-cyan-900 dark:bg-cyan-950 dark:hover:bg-cyan-900 transition-colors">
<h3 class="font-semibold text-cyan-700 dark:text-cyan-300 mb-1">Configuration</h3>
<p class="text-sm text-cyan-600 dark:text-cyan-400">.stylescriberc.json options</p>
</a>
<a href="./design-tokens.html" class="block p-4 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-900 dark:bg-green-950 dark:hover:bg-green-900 transition-colors">
<h3 class="font-semibold text-green-700 dark:text-green-300 mb-1">Design Tokens</h3>
<p class="text-sm text-green-600 dark:text-green-400">W3C DTCG format and 46 token functions</p>
</a>
<a href="./icons.html" class="block p-4 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:hover:bg-amber-900 transition-colors">
<h3 class="font-semibold text-amber-700 dark:text-amber-300 mb-1">Icons</h3>
<p class="text-sm text-amber-600 dark:text-amber-400">CSS mask-image icons from npm packages</p>
</a>
</div>

## What's in Reference?

Reference documentation is **information-oriented** — it describes how things work without explaining when to use them. It's organized for quick lookup.

| Document | Contains |
|----------|----------|
| [Annotations](./annotations.html) | All `@annotation` tags, syntax, examples |
| [CLI Commands](./cli-commands.html) | All 13 commands with options and examples |
| [Configuration](./configuration.html) | Every `.stylescriberc.json` option |
| [Design Tokens](./design-tokens.html) | W3C DTCG format, 46 functions, types |
| [Icons](./icons.html) | Supported packages, token format, CLI tools |

## Quick Lookup

### Common Annotations

```scss
@title        // Display name (required)
@description  // Component purpose (required)
@group        // Navigation category (required)
@variations   // Modifier classes
@elements     // BEM child elements
@examples     // Code samples
@dependencies // Required components
```

### Key CLI Commands

```bash
stylescribe init         # Create new project
stylescribe dev          # Development server
stylescribe build        # Compile CSS
stylescribe docs         # Generate static site
stylescribe tokens       # Token operations
```

### Config Quick Reference

```json
{
  "classPrefix": "ds-",
  "source": "./sass/components",
  "output": "./dist",
  "tokens": { "input": "./tokens/design-tokens.json" }
}
```

## See Also

- [Tutorials](../tutorials/index.html) — Learn by building
- [Guides](../guides/index.html) — Task-oriented how-tos
