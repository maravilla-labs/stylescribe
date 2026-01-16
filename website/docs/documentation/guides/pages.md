---
title: Documentation Pages
navtitle: Pages
slug: pages
order: 2.6
---

Pages are Markdown files for written documentation. They support frontmatter, custom templates, and integrate with the navigation system.

## Creating Pages

### File Structure

Pages live in the `docs/` directory:

```
docs/
├── index.md                    # Homepage
├── getting-started.md          # Top-level page
├── changelog.md
└── guides/                     # Folder creates navigation section
    ├── index.md                # Folder index page
    ├── installation.md
    └── configuration.md
```

### Basic Page

```markdown
---
title: Getting Started
navtitle: Get Started
slug: getting-started
order: 1
---

Your documentation content here...
```

### Frontmatter Options

| Property | Description |
|----------|-------------|
| `title` | Page title (shown in browser tab, heading) |
| `navtitle` | Short name for navigation (optional) |
| `slug` | URL path (defaults to filename) |
| `order` | Sort order in navigation |
| `template` | Which template to use |

## Navigation System

StyleScribe automatically generates navigation from your `docs/` folder structure.

### How It Works

```
docs/
├── index.md          → Homepage (special template)
├── about.md          → Top navigation item
├── guides/           → Dropdown in top nav
│   ├── index.md      → Dropdown landing page
│   ├── setup.md      → Dropdown item
│   └── config.md     → Dropdown item
└── reference/        → Another dropdown
    ├── index.md
    └── api.md
```

**Result:**
- Top nav: Home | About | Guides ▾ | Reference ▾
- Guides dropdown: Setup, Config
- Reference dropdown: API

### Folder Index Pages

Each folder should have an `index.md`:

```markdown
---
title: Guides
navtitle: Guides
order: 2
---

Overview of guides...
```

The folder's `navtitle` becomes the dropdown label.

### Controlling Order

Use `order` in frontmatter:

```markdown
---
title: Installation
order: 1
---
```

Lower numbers appear first.

## Templates

Different templates provide different layouts and features.

### Available Templates

| Template | Use Case | Features |
|----------|----------|----------|
| `pages` | Standard docs | Left sidebar, table of contents |
| `page-wide` | Full-width content | No sidebar, wide layout |
| `tokens` | Design tokens | Token display grid |
| `tokens-wide` | Tokens full-width | Wide token display |
| `fullpage` | Custom layouts | Minimal wrapper |
| `index` | Homepage only | Hero, component grid |

### Selecting a Template

```markdown
---
title: Design Tokens
template: tokens
---
```

### Template Differences

#### `pages` (default)

Standard documentation layout:
- Left sidebar with section navigation
- Table of contents from headings
- Narrow content width for readability

```markdown
---
title: Installation Guide
template: pages
---
```

#### `page-wide`

Full-width content:
- No left sidebar
- Wide content area
- Good for tables, diagrams, comparisons

```markdown
---
title: Component Comparison
template: page-wide
---
```

#### `tokens`

Design token display:
- Renders tokens from your token file
- Color swatches, typography samples
- Grouped by category

```markdown
---
title: Design Tokens
template: tokens
tokensFile: ./tokens/design-tokens.json
---
```

#### `tokens-wide`

Wide token display:
- Same as `tokens` but full-width
- Better for large token sets

### Custom Token File

Display tokens from a specific file:

```markdown
---
title: Brand Colors
template: tokens
tokensFile: ./tokens/brand.json
---
```

## Special Pages

### Homepage (`index.md`)

The root `index.md` uses a special template with:
- Hero section
- Component library grid (optional)
- Custom CTA buttons

```markdown
---
title: My Design System
listComponents: false
hero:
  badge: v2.0
  tagline: A modern design system
  cta:
    - text: Get Started
      href: getting-started.html
    - text: Components
      href: components/index.html
---
```

### Components Page

To add a Components section to navigation:

```markdown
---
title: Components
navtitle: Components
type: component
order: 5
---

This section shows all documented components.
```

The `type: component` tells StyleScribe to render the components index.

### Tokens Page

```markdown
---
title: Design Tokens
navtitle: Tokens
template: tokens
order: 6
---
```

## Sidebar Navigation

Pages in folders get automatic sidebar navigation showing sibling pages.

### Sidebar Behavior

- **Folder pages**: Show sidebar with other pages in folder
- **Top-level pages**: No sidebar (only top nav)
- **Homepage**: No sidebar

### Example Structure

```
docs/guides/
├── index.md        # Shows sidebar with: Setup, Config, Advanced
├── setup.md
├── config.md
└── advanced.md
```

## Full Pages (HTML)

For complete page templates (login, dashboard), use the `pages/` directory:

```
pages/
└── login/
    ├── login.html
    └── login.scss
```

These render as full standalone pages, separate from documentation.

### Full Page HTML

```html
<!--
title: Login Page
description: Authentication page template
group: Auth
-->

<!DOCTYPE html>
<html>
<head>
  <title>Login</title>
  <link rel="stylesheet" href="../css/bundle.all.css">
</head>
<body>
  <main class="ds-container">
    <form class="ds-card">
      <!-- Login form -->
    </form>
  </main>
</body>
</html>
```

## Markdown Features

### Syntax Highlighting

~~~markdown
```scss
.button {
  background: var(--color-primary);
}
```
~~~

### Tables

```markdown
| Feature | Support |
|---------|---------|
| Tables | Yes |
| Lists | Yes |
```

### Links

```markdown
[Internal link](./other-page.html)
[External link](https://example.com)
```

### HTML in Markdown

You can embed HTML for custom layouts:

```markdown
## Features

<div class="grid grid-cols-2 gap-4">
  <div class="card">Feature 1</div>
  <div class="card">Feature 2</div>
</div>
```

## Configuration

Configure pages in `.stylescriberc.json`:

```json
{
  "pages": {
    "source": "pages",
    "groupOrder": ["Auth", "Dashboard", "Settings"]
  }
}
```

## Best Practices

### Organize by Topic

```
docs/
├── getting-started.md
├── concepts/
│   ├── index.md
│   ├── tokens.md
│   └── components.md
├── guides/
│   ├── index.md
│   ├── theming.md
│   └── customization.md
└── reference/
    ├── index.md
    ├── cli.md
    └── config.md
```

### Use Descriptive Slugs

```markdown
---
title: Getting Started with StyleScribe
slug: getting-started
---
```

### Keep Navigation Shallow

- Maximum 2 levels (top nav + dropdown)
- Use `order` to control sequence
- Group related pages in folders
