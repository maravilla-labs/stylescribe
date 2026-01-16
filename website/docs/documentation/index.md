---
title: Documentation
navtitle: Documentation
order: 1
---

StyleScribe generates documentation from three types of content: **Components**, **Blocks**, and **Pages**. Each serves a different purpose in your design system documentation.

## Core Concepts

### Components

Components are documented directly in your CSS/SCSS files using JSDoc-style annotations. This keeps documentation close to the code and ensures it stays in sync.

```scss
/**
 * @title Button
 * @description Interactive button for user actions
 * @group Actions
 * @variations primary, secondary, danger
 * @examples
 * - title: Primary Button
 *   code: |
 *     <button class="btn btn--primary">Click me</button>
 */
.btn {
  /* styles */
}
```

StyleScribe extracts these annotations and generates:
- Interactive preview with live playground
- All variations rendered automatically
- CSS variable documentation
- Code examples with syntax highlighting

**Learn more:** [Creating Components](./guides/components.html)

### Blocks

Blocks are reusable UI patterns composed of multiple components. Unlike components, blocks are defined as HTML files with optional SCSS.

```
blocks/
├── auth-form/
│   ├── auth-form.html    # Block markup
│   └── auth-form.scss    # Optional styles
└── search-bar/
    └── search-bar.html
```

Blocks appear in a separate section of your documentation, showing how components work together.

**Learn more:** [Creating Blocks](./guides/blocks.html)

### Pages

Pages are Markdown files for written documentation. They support frontmatter for metadata and can use different templates.

```markdown
---
title: Getting Started
navtitle: Get Started
order: 1
---

Your documentation content here...
```

Pages can include:
- Markdown content with syntax highlighting
- Design token displays
- Custom templates for different layouts

**Learn more:** [Creating Pages](./guides/pages.html)

## Documentation Inside CSS

The key principle of StyleScribe is **documentation lives with code**. Instead of maintaining separate documentation files, you annotate your stylesheets directly.

### Why This Approach?

1. **Always in sync** — Documentation updates when code changes
2. **Single source of truth** — No drift between docs and implementation
3. **Developer-friendly** — Write docs while writing CSS
4. **Automatic extraction** — Build process generates the documentation site

### Annotation Syntax

Annotations use JSDoc-style comments:

```scss
/**
 * @title Alert
 * @description Feedback messages for user actions
 * @group Communication
 * @order 2
 *
 * @variations
 * - name: success
 *   description: Positive feedback
 * - name: error
 *   description: Error messages
 *
 * @elements icon, content, close
 *
 * @examples
 * - title: Success Alert
 *   code: |
 *     <div class="alert alert--success">
 *       <span class="alert__content">Saved!</span>
 *     </div>
 */
.alert { /* ... */ }
```

**Learn more:** [Annotation Reference](./reference/annotations.html)

## Variations

Variations are modifier classes that change a component's appearance. Define them with `@variations` and StyleScribe automatically generates previews for each.

```scss
@variations primary, secondary, danger, ghost
```

Or with descriptions:

```scss
@variations
- name: primary
  description: Main call-to-action, use sparingly
- name: secondary
  description: Secondary actions
- name: danger
  description: Destructive actions like delete
```

**Important:** The first `@example` is used as a template for all variation previews. For nested components (dropdown, modal, tabs), ensure your first example shows the complete HTML structure.

## Project Structure

A typical StyleScribe project:

```
my-design-system/
├── sass/
│   └── components/
│       ├── button/
│       │   └── button.scss    # Annotated component
│       └── card/
│           └── card.scss
├── blocks/
│   └── hero/
│       └── hero.html          # UI block
├── pages/
│   └── login/
│       └── login.html         # Full page template
├── tokens/
│   └── design-tokens.json     # W3C DTCG format
├── docs/
│   ├── index.md               # Homepage
│   └── getting-started.md     # Documentation pages
└── .stylescriberc.json        # Configuration
```

## Next Steps

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mt-8">
<a href="./getting-started.html" class="block p-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:hover:bg-blue-900 transition-colors">
<h3 class="font-semibold text-blue-700 dark:text-blue-300 mb-1">Getting Started</h3>
<p class="text-sm text-blue-600 dark:text-blue-400">Install and create your first project</p>
</a>
<a href="./tutorials/index.html" class="block p-4 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:hover:bg-indigo-900 transition-colors">
<h3 class="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Tutorials</h3>
<p class="text-sm text-indigo-600 dark:text-indigo-400">Learn by building real components</p>
</a>
<a href="./guides/index.html" class="block p-4 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-900 dark:bg-green-950 dark:hover:bg-green-900 transition-colors">
<h3 class="font-semibold text-green-700 dark:text-green-300 mb-1">Guides</h3>
<p class="text-sm text-green-600 dark:text-green-400">How to create components, blocks, pages</p>
</a>
<a href="./reference/index.html" class="block p-4 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950 dark:hover:bg-purple-900 transition-colors">
<h3 class="font-semibold text-purple-700 dark:text-purple-300 mb-1">Reference</h3>
<p class="text-sm text-purple-600 dark:text-purple-400">Annotations, CLI, tokens, configuration</p>
</a>
</div>
