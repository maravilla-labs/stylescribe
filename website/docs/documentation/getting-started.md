---
title: Getting Started
navtitle: Getting Started
slug: getting-started
order: 1
---

Get up and running with StyleScribe in minutes.

## Prerequisites

- **Node.js** 20.0.0 or higher
- **npm** or **pnpm**

## Installation

### Global Installation (Recommended)

```bash
npm install -g stylescribe
```

### Project-local Installation

```bash
npm install --save-dev stylescribe
```

## Create Your First Project

The `init` command scaffolds a new StyleScribe project with sensible defaults.

```bash
stylescribe init my-design-system
cd my-design-system
npm install
```

### Interactive Setup

Running `init` without flags starts an interactive wizard:

```bash
stylescribe init
```

You'll be prompted for:
- **Project name** - Your design system name
- **Dark mode** - Enable dark theme support
- **Theme variant** - Add a custom theme (e.g., "comic", "brand")
- **CSS prefix** - Class prefix for components (e.g., "ds-")
- **Claude Code support** - Generate CLAUDE.md for AI assistance

### Quick Setup

Skip prompts with flags:

```bash
stylescribe init my-docs --yes --dark --prefix="ui-"
```

## Project Structure

After initialization, you'll have:

```
my-design-system/
├── .stylescriberc.json    # Configuration
├── sass/
│   ├── base.scss          # Base styles & CSS layers
│   └── components/        # Component SCSS files
│       └── button/
│           └── button.scss
├── tokens/
│   └── design-tokens.json # W3C DTCG tokens
├── docs/
│   └── index.md           # Documentation pages
└── package.json
```

## Development Server

Start the live development server:

```bash
npm run dev
# or
stylescribe dev
```

Open [http://localhost:4142](http://localhost:4142) in your browser.

The dev server:
- Compiles SCSS to CSS
- Extracts component annotations
- Generates documentation pages
- Hot reloads on file changes

## Create a Component

Use the CLI to scaffold a new component:

```bash
stylescribe create-component alert --group="Communication"
```

This creates `sass/components/alert/alert.scss` with annotation template:

```scss
/**
 * @title Alert
 * @description Add a description
 * @group Communication
 * @examples
 * - title: Default
 *   code: |
 *     <div class="ds-alert">Content</div>
 */
.ds-alert {
  /* Component styles */
}
```

## Add Documentation Pages

Create markdown documentation:

```bash
stylescribe create-page usage-guide --title="Usage Guide"
```

This creates `docs/usage-guide.md`:

```markdown
---
title: Usage Guide
navtitle: Usage Guide
slug: usage-guide
order: 10
---

Your content here...
```

## Build for Production

Generate the static documentation site:

```bash
npm run docs
# or
stylescribe docs --output=./site
```

The `site/` folder contains your complete documentation ready for deployment.

## Next Steps

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mt-6">
<a href="./tutorials/icon-component.html" class="block p-4 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:hover:bg-indigo-900 transition-colors">
<h3 class="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Icon Component Tutorial</h3>
<p class="text-sm text-indigo-600 dark:text-indigo-400">Build your first component</p>
</a>
<a href="./guides/components.html" class="block p-4 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-900 dark:bg-green-950 dark:hover:bg-green-900 transition-colors">
<h3 class="font-semibold text-green-700 dark:text-green-300 mb-1">Components Guide</h3>
<p class="text-sm text-green-600 dark:text-green-400">Document your components</p>
</a>
<a href="./reference/cli-commands.html" class="block p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
<h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-1">CLI Commands</h3>
<p class="text-sm text-gray-600 dark:text-gray-400">Learn all available commands</p>
</a>
<a href="./reference/design-tokens.html" class="block p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
<h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-1">Design Tokens</h3>
<p class="text-sm text-gray-600 dark:text-gray-400">W3C DTCG format & functions</p>
</a>
</div>
