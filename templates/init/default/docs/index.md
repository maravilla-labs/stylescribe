---
title: {{projectName}}
navtitle: Home
slug: index
order: 0
hero:
  badge: Design System Documentation
  tagline: A comprehensive collection of reusable components, design tokens, and guidelines for building consistent user interfaces.
  icon: stylescribe-logo.png
  cta:
    - text: Get Started
      href: documentation/getting-started.html
    - text: View Components
      href: "#components"
---

Welcome to **{{projectName}}** — {{description}}

## Quick Links

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 not-prose mb-8">
<a href="./documentation/getting-started.html" class="block p-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:hover:bg-blue-900 transition-colors">
<h3 class="font-semibold text-blue-700 dark:text-blue-300 mb-1">Getting Started</h3>
<p class="text-sm text-blue-600 dark:text-blue-400">Installation and setup</p>
</a>
<a href="./tokens.html" class="block p-4 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-900 dark:bg-green-950 dark:hover:bg-green-900 transition-colors">
<h3 class="font-semibold text-green-700 dark:text-green-300 mb-1">Design Tokens</h3>
<p class="text-sm text-green-600 dark:text-green-400">Colors, spacing, typography</p>
</a>
<a href="./components.html" class="block p-4 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950 dark:hover:bg-purple-900 transition-colors">
<h3 class="font-semibold text-purple-700 dark:text-purple-300 mb-1">Components</h3>
<p class="text-sm text-purple-600 dark:text-purple-400">UI component library</p>
</a>
<a href="./changelog.html" class="block p-4 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950 dark:hover:bg-orange-900 transition-colors">
<h3 class="font-semibold text-orange-700 dark:text-orange-300 mb-1">Changelog</h3>
<p class="text-sm text-orange-600 dark:text-orange-400">Release notes</p>
</a>
</div>

## Features

- **Design Tokens** - W3C Design Tokens Community Group (DTCG) format
- **Components** - Annotated SCSS components with live examples
- **Dark Mode** - Built-in theme support with CSS custom properties
- **Live Docs** - Auto-generated documentation with hot reload

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:4142](http://localhost:4142) in your browser.
