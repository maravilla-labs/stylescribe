---
title: Customization
navtitle: Customization
slug: customization
order: 4
---

StyleScribe offers multiple levels of customization, from simple theme switching to complete template overrides.

## Quick Theme Switch

The easiest way to customize your documentation site is to choose a built-in theme preset.

```json
{
  "branding": {
    "name": "My Design System",
    "theme": "dracula"
  }
}
```

That's it! No ejecting, no configuration files to copy.

### Available Presets

| Preset | Description |
|--------|-------------|
| `default` | Purple/indigo gradient with light background |
| `dracula` | Dark purple with pink accents |
| `nord` | Arctic, bluish palette |
| `oneDark` | Atom's dark theme colors |
| `solarized` | Classic developer theme |
| `ocean` | Deep blue with teal accents |

Preview any preset without modifying your config:

```bash
stylescribe eject-theme dracula --show
```

---

## Custom Theme Classes

Need more control? Eject a theme to customize its Tailwind classes.

### When to Eject

- **Just want a different preset?** Set `"theme": "nord"` in config — no eject needed
- **Want custom colors or gradients?** Eject and modify the Tailwind classes

### Ejecting a Theme

```bash
# Eject the dracula theme for customization
stylescribe eject-theme dracula
```

This adds the full theme object to your `.stylescriberc.json`:

```json
{
  "branding": {
    "theme": {
      "preset": "dracula",
      "hero": {
        "background": "bg-[#282a36]",
        "text": "text-[#f8f8f2]",
        "tagline": "text-[#6272a4]",
        "badge": "bg-[#bd93f9]/20 text-[#bd93f9]"
      },
      "nav": {
        "background": "bg-[#282a36]",
        "link": "text-[#f8f8f2]/80 hover:text-[#bd93f9]",
        "linkActive": "text-[#bd93f9]"
      },
      "card": {
        "background": "bg-[#44475a]",
        "border": "border-[#6272a4]/30",
        "text": "text-[#f8f8f2]"
      },
      "sidebar": {
        "background": "bg-[#282a36]",
        "link": "text-[#f8f8f2]/70 hover:text-[#bd93f9]",
        "linkActive": "text-[#bd93f9] font-medium"
      },
      "button": {
        "primary": "bg-[#bd93f9] hover:bg-[#bd93f9]/80 text-[#282a36]",
        "secondary": "bg-[#44475a] hover:bg-[#6272a4] text-[#f8f8f2]"
      },
      "footer": {
        "background": "bg-[#21222c]",
        "text": "text-[#6272a4]"
      }
    }
  }
}
```

### Theme Sections

| Section | Controls |
|---------|----------|
| `hero` | Homepage hero area (background, text, tagline, badge, CTA buttons) |
| `nav` | Top navigation bar |
| `card` | Component cards and content boxes |
| `sidebar` | Navigation sidebar |
| `button` | Primary and secondary buttons |
| `footer` | Page footer |
| `badge` | Status badges and tags |

### Example: Custom Brand Colors

```json
{
  "branding": {
    "theme": {
      "preset": "default",
      "hero": {
        "background": "bg-gradient-to-br from-[#1a365d] to-[#2d3748]",
        "text": "text-white"
      },
      "button": {
        "primary": "bg-[#ed8936] hover:bg-[#dd6b20] text-white"
      }
    }
  }
}
```

Partial overrides are merged with the base preset, so you only need to specify what you want to change.

---

## Template Overrides

For complete control over the documentation output, override the Handlebars templates. This is StyleScribe's most powerful customization feature.

### How It Works

StyleScribe checks your project's `.stylescribe/templates/` directory first. If a template exists there, it uses your version. Otherwise, it falls back to the built-in default.

**Override priority:**
1. `.stylescribe/templates/{template}.hbs` (your project)
2. `node_modules/stylescribe/templates/{template}.hbs` (default)

### Quick Start

```bash
# 1. Create the override directory
mkdir -p .stylescribe/templates/includes

# 2. Copy the template you want to modify
cp node_modules/stylescribe/templates/index.hbs .stylescribe/templates/

# 3. Edit your copy
# Changes take effect immediately with `stylescribe dev`
```

### Project Structure

```
my-project/
├── .stylescribe/
│   └── templates/
│       ├── index.hbs          # Override homepage
│       ├── component.hbs      # Override component pages
│       └── includes/
│           └── branding.hbs   # Custom partial
├── sass/
├── tokens/
└── docs/
```

### Available Templates

| Template | Purpose |
|----------|---------|
| `index.hbs` | Homepage |
| `component.hbs` | Individual component pages |
| `components-index.hbs` | Components listing page |
| `pages.hbs` | Documentation pages |
| `pages-index.hbs` | Pages listing |
| `block.hbs` | UI block template |
| `blocks-index.hbs` | Blocks listing |
| `tokens.hbs` | Design tokens page |
| `tokens-wide.hbs` | Full-width tokens page |
| `page-wide.hbs` | Wide layout for pages |
| `fullpage.hbs` | Full-page template |
| `preview-frame.hbs` | Component preview iframe |

### Partials

Reusable template fragments in `includes/`:

- `navigation.hbs` - Site navigation
- `theme-picker.hbs` - Theme switcher
- `token-color.hbs` - Color token display
- `token-typography.hbs` - Typography tokens
- `token-dimension.hbs` - Spacing/sizing tokens
- `token-shadow.hbs` - Shadow tokens
- `token-icon.hbs` - Icon tokens
- `token-gradient.hbs` - Gradient tokens

### Example: Custom Homepage

```handlebars
{{!-- .stylescribe/templates/index.hbs --}}
<!DOCTYPE html>
<html lang="en" data-theme="{{theme}}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{branding.name}}</title>
  {{#each headIncludes.css}}
  <link rel="stylesheet" href="{{this}}">
  {{/each}}
  <link rel="stylesheet" href="./css/bundle.all.css">
</head>
<body>
  {{> navigation}}

  <main class="container">
    <h1>{{branding.name}}</h1>

    {{#if hero}}
    <div class="hero">
      <span class="badge">{{hero.badge}}</span>
      <p>{{hero.tagline}}</p>
    </div>
    {{/if}}

    <div class="content">
      {{{content}}}
    </div>

    <h2>Components</h2>
    <div class="component-grid">
      {{#each components}}
      <a href="./components/{{this.slug}}.html" class="card">
        <h3>{{this.title}}</h3>
        <p>{{this.description}}</p>
      </a>
      {{/each}}
    </div>
  </main>

  {{> theme-picker}}
  <script src="./js/main.js"></script>
</body>
</html>
```

---

## Handlebars Helpers

StyleScribe provides these custom helpers for use in templates:

### Comparison Helpers

```handlebars
{{!-- Equality --}}
{{#if (eq type "color")}}
  <div class="color-swatch" style="background: {{value}}"></div>
{{/if}}

{{!-- Greater than --}}
{{#if (gt components.length 10)}}
  <a href="./all.html">View all</a>
{{/if}}
```

### String Helpers

```handlebars
{{!-- Capitalize --}}
<h2>{{capitalizeFirst group}} Components</h2>

{{!-- Lowercase --}}
<a href="#{{lowercase group}}">{{group}}</a>

{{!-- Newlines to <br> --}}
<p>{{nl2br description}}</p>
```

### Array Helpers

```handlebars
{{!-- Length --}}
<span>{{length components}} components</span>

{{!-- Sum lengths of grouped arrays --}}
<span>{{sumLengths groups}} total</span>

{{!-- First N items --}}
{{#each (take components 5)}}
  <a href="{{this.href}}">{{this.title}}</a>
{{/each}}
```

### Data Helpers

```handlebars
{{!-- Format HTML --}}
<pre><code>{{prettyprint example.code}}</code></pre>

{{!-- JSON stringify --}}
<script>const data = {{json components}};</script>

{{!-- Extract from items --}}
{{#each variations}}
  <span>{{itemName this}}</span>
  {{#if (hasDescription this)}}
    <small>{{itemDescription this}}</small>
  {{/if}}
{{/each}}
```

---

## Template Data

Each template receives different data from the build process.

### All Templates

```javascript
{
  branding: {
    name: "My Design System",
    logo: "logo.png",
    favicon: "favicon.ico"
  },
  navigation: [...],
  theme: "light",
  themes: ["light", "dark"],
  headIncludes: {
    css: [...],
    js: [...]
  }
}
```

### Component Template

```javascript
{
  // ...common
  component: {
    title: "Button",
    description: "...",
    group: "Actions",
    variations: [...],
    elements: [...],
    examples: [...],
    css: "...",
    cssVars: [...]
  }
}
```

### Page Template

```javascript
{
  // ...common
  page: {
    title: "Getting Started",
    slug: "getting-started",
    content: "<p>...</p>",
    frontmatter: {...}
  }
}
```

### Tokens Template

```javascript
{
  // ...common
  tokens: {
    color: {...},
    spacing: {...},
    typography: {...}
  },
  tokenCategories: ["color", "spacing", "typography", ...]
}
```

---

## Creating Custom Partials

Add reusable partials in `.stylescribe/templates/includes/`:

```handlebars
{{!-- .stylescribe/templates/includes/component-card.hbs --}}
<article class="component-card">
  <h3>{{title}}</h3>
  <p>{{description}}</p>
  {{#if verified}}
    <span class="badge badge--success">Verified</span>
  {{/if}}
  {{#if draft}}
    <span class="badge badge--warning">Draft</span>
  {{/if}}
</article>
```

Use in templates:

```handlebars
{{#each components}}
  {{> component-card this}}
{{/each}}
```

---

## Frontmatter Options

Control page behavior with frontmatter in your markdown files.

### Template Selection

```markdown
---
title: Design Tokens
template: tokens-wide
---
```

Available templates: `pages` (default), `page-wide`, `tokens`, `tokens-wide`, `fullpage`

### Homepage Options

For `index.md`:

```markdown
---
title: My Design System
listComponents: false
hero:
  enabled: true
  badge: "v2.0"
  tagline: "A modern design system"
  icon: "logo.png"
  cta:
    - text: Get Started
      href: getting-started.html
    - text: Components
      href: components/index.html
---
```

### Page Layout

```markdown
---
title: Wide Content
template: page-wide
tokensFile: ./custom-tokens.json
---
```

---

## Static Assets

Templates can reference static assets:

```handlebars
<img src="./static/{{branding.logo}}" alt="{{branding.name}}">
```

Configure static directory in `.stylescriberc.json`:

```json
{
  "static": "static"
}
```

Files in `static/` are copied to the output root.
