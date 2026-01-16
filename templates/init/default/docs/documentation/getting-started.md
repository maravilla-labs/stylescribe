---
title: Getting Started
navtitle: Getting Started
order: 1
---

Welcome to the design system documentation. This guide will help you get up and running.

## Installation

```bash
npm install
npm run dev
```

This starts the development server with hot reload at [http://localhost:4142](http://localhost:4142).

## Using Components

Add component classes to your HTML:

```html
<button class="ds-button ds-button--primary">
  <span class="ds-button__label">Click me</span>
</button>

<div class="ds-card ds-card--default">
  <div class="ds-card__body">
    <div class="ds-card__title">Card Title</div>
    <div class="ds-card__description">Card content goes here.</div>
  </div>
</div>
```

## Using Design Tokens

All design tokens are available as CSS custom properties:

```css
.my-custom-element {
  color: var(--color-text);
  background: var(--color-surface);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
}
```

## Building for Production

Generate production-ready CSS bundles:

```bash
npm run build
```

This creates:
- `dist/bundle.all.css` - Everything combined
- `dist/themes.css` - All theme overrides
- `dist/all-components.css` - All components

## Documentation Site

Generate a static documentation site:

```bash
npm run docs
```

The site is output to the `./site` directory.

## Next Steps

- Browse the [Components](../components.html) to see available UI elements
- Review the [Design Tokens](../tokens.html) for styling values
- Check the [Changelog](../changelog.html) for recent updates
