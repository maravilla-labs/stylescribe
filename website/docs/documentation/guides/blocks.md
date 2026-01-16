---
title: UI Blocks
navtitle: Blocks
slug: blocks
order: 2.5
---

Blocks are reusable UI patterns composed of multiple components. While components are atomic building blocks, blocks show how they work together in real-world patterns.

## What Are Blocks?

Blocks are **HTML-first** — you write the markup directly instead of documenting SCSS. This makes them ideal for:

- Login forms
- Search bars
- Navigation headers
- Card layouts
- Hero sections
- Feature grids

## Creating a Block

### File Structure

```
blocks/
└── auth-form/
    ├── auth-form.html     # Required: Block markup
    ├── auth-form.scss     # Optional: Block-specific styles
    └── README.md          # Optional: Additional documentation
```

### Block HTML

Create an HTML file with frontmatter:

```html
<!--
title: Authentication Form
description: Login and registration form pattern
group: Forms
order: 1
-->

<form class="ds-card ds-card--padded">
  <h2 class="ds-text ds-text--heading-md">Sign In</h2>

  <div class="ds-form-field">
    <label class="ds-label">Email</label>
    <input type="email" class="ds-input" placeholder="you@example.com">
  </div>

  <div class="ds-form-field">
    <label class="ds-label">Password</label>
    <input type="password" class="ds-input">
  </div>

  <button type="submit" class="ds-button ds-button--primary ds-button--full">
    Sign In
  </button>

  <p class="ds-text ds-text--sm ds-text--muted">
    Don't have an account? <a href="#" class="ds-link">Sign up</a>
  </p>
</form>
```

### Block Frontmatter

Use HTML comments with YAML frontmatter:

```html
<!--
title: Search Bar
description: Global search with autocomplete
group: Navigation
order: 2
variations:
  - name: compact
    description: Smaller version for headers
  - name: expanded
    description: Full-width with filters
-->
```

| Property | Description |
|----------|-------------|
| `title` | Display name (required) |
| `description` | What the block does |
| `group` | Category for navigation |
| `order` | Sort order within group |
| `variations` | Block variations (optional) |

## Optional SCSS

Add block-specific styles that aren't in your component library:

```scss
/* blocks/auth-form/auth-form.scss */

.auth-form {
  max-width: 400px;
  margin: 0 auto;

  &__divider {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    color: var(--color-semantic-text-muted);

    &::before,
    &::after {
      content: '';
      flex: 1;
      border-top: 1px solid var(--color-semantic-border);
    }
  }
}
```

## Block Variations

Define variations in frontmatter:

```html
<!--
title: Hero Section
variations:
  - name: centered
    description: Centered text and CTA
  - name: split
    description: Image on one side, content on other
  - name: video
    description: Background video instead of image
-->
```

Then include variation markup in your HTML:

```html
<!-- Default variation -->
<section class="hero">
  <h1>Welcome</h1>
  <p>Hero content here</p>
</section>

<!-- variation: centered -->
<section class="hero hero--centered">
  <h1>Centered Hero</h1>
  <p>Content centered</p>
</section>

<!-- variation: split -->
<section class="hero hero--split">
  <div class="hero__content">
    <h1>Split Hero</h1>
  </div>
  <div class="hero__image">
    <img src="..." alt="">
  </div>
</section>
```

## Configuration

Configure blocks in `.stylescriberc.json`:

```json
{
  "blocks": {
    "source": "blocks",
    "groupOrder": ["Forms", "Navigation", "Content", "Layout"]
  }
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `source` | `"blocks"` | Directory containing blocks |
| `groupOrder` | `[]` | Order of groups in navigation |

## Blocks vs Components

| | Components | Blocks |
|---|------------|--------|
| **Source** | SCSS with annotations | HTML with frontmatter |
| **Purpose** | Atomic, reusable elements | Composed patterns |
| **Variations** | CSS modifier classes | Different HTML structures |
| **Styles** | Required | Optional |
| **Examples** | In annotations | The HTML is the example |

## Using the CLI

```bash
# Create a new block
stylescribe create-block hero --group="Marketing"

# Build blocks
stylescribe build

# Dev server includes blocks
stylescribe dev
```

## Best Practices

### Use Your Components

Blocks should compose existing components rather than duplicating styles:

```html
<!-- Good: Uses component classes -->
<div class="ds-card">
  <h2 class="ds-text ds-text--heading-md">Title</h2>
  <button class="ds-button ds-button--primary">Action</button>
</div>

<!-- Avoid: Custom one-off styles -->
<div class="custom-card">
  <h2 style="font-size: 1.5rem">Title</h2>
  <button style="background: blue">Action</button>
</div>
```

### Keep Blocks Focused

Each block should demonstrate one pattern:

```
blocks/
├── auth-form/           # Login/register pattern
├── search-bar/          # Search with suggestions
├── pricing-table/       # Pricing comparison
└── feature-grid/        # Feature highlights
```

### Document Context

Use the description to explain when to use the block:

```html
<!--
title: Pricing Table
description: |
  Compare pricing tiers side-by-side. Best used on dedicated
  pricing pages. For inline pricing, use the Price component instead.
group: Marketing
-->
```

## Navigation

Blocks appear in a separate "Blocks" section in navigation. They use the same grouping and ordering system as components.

To add blocks to your site's top navigation, ensure you have blocks defined and the navigation will automatically include them.
