---
title: Design Tokens Guide
navtitle: Tokens Guide
order: 6
---

Design tokens are the single source of truth for your design system's visual values. This guide explains how to create, use, and manage design tokens with Stylescribe.

## What Are Design Tokens?

Design tokens are named values that represent design decisions:

- Colors (`--color-primary: #0d6efd`)
- Spacing (`--spacing-md: 16px`)
- Typography (`--font-size-base: 1rem`)
- Borders (`--border-radius-md: 8px`)
- Shadows (`--shadow-md: 0 4px 6px rgba(0,0,0,0.1)`)
- Transitions (`--transition-fast: 150ms ease`)

By using tokens instead of hard-coded values, you can:
- Maintain consistency across your application
- Enable theming and dark mode
- Make global changes from a single source

## Token File Structure

Stylescribe uses the W3C Design Tokens Community Group (DTCG) format:

```json
{
  "$meta": {
    "name": "My Design System",
    "themes": [
      { "name": "dark", "file": "./dark.json", "mode": "dark" }
    ]
  },
  "color": {
    "primary": {
      "$value": "#0d6efd",
      "$type": "color",
      "$description": "Primary brand color"
    }
  }
}
```

### Token Properties

| Property | Description |
|----------|-------------|
| `$value` | The token's value (required) |
| `$type` | Token type: color, dimension, fontFamily, fontWeight, shadow, duration |
| `$description` | Human-readable description |

### Token Types

- **color** - Hex, RGB, HSL color values
- **dimension** - Sizes with units (px, rem, em)
- **fontFamily** - Font stack strings
- **fontWeight** - Numeric weight values
- **shadow** - Box shadow values
- **duration** - Animation timing values

## Using Tokens in CSS

All tokens are exported as CSS custom properties:

```css
.my-component {
  /* Colors */
  color: var(--color-text);
  background-color: var(--color-surface);
  border-color: var(--color-border);

  /* Spacing */
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);

  /* Typography */
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);

  /* Borders */
  border-radius: var(--border-radius-md);
  border-width: var(--border-width);

  /* Shadows */
  box-shadow: var(--shadow-md);

  /* Transitions */
  transition: all var(--transition-fast);
}
```

## Nested Tokens

Tokens can be organized in groups:

```json
{
  "color": {
    "primary": { "$value": "#0d6efd", "$type": "color" },
    "primary-hover": { "$value": "#0b5ed7", "$type": "color" }
  },
  "spacing": {
    "xs": { "$value": "4px", "$type": "dimension" },
    "sm": { "$value": "8px", "$type": "dimension" },
    "md": { "$value": "16px", "$type": "dimension" }
  }
}
```

These become CSS variables with dashes:

```css
:root {
  --color-primary: #0d6efd;
  --color-primary-hover: #0b5ed7;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
}
```

## Theming with Tokens

### Dark Mode

Create a separate token file for dark mode:

**tokens/dark.json**
```json
{
  "$meta": {
    "name": "dark",
    "mode": "dark"
  },
  "color": {
    "background": { "$value": "#1a1a2e", "$type": "color" },
    "text": { "$value": "#eaeaea", "$type": "color" }
  }
}
```

Reference it in your main tokens file:

```json
{
  "$meta": {
    "themes": [
      { "name": "dark", "file": "./dark.json", "mode": "dark" }
    ]
  }
}
```

Dark mode tokens are applied with `[data-theme="dark"]`:

```css
[data-theme="dark"] {
  --color-background: #1a1a2e;
  --color-text: #eaeaea;
}
```

### Theme Variants

Create themed variations for different contexts:

```json
{
  "$meta": {
    "themes": [
      { "name": "dark", "file": "./dark.json", "mode": "dark" },
      { "name": "brand-a", "file": "./brand-a.json" }
    ]
  }
}
```

## CLI Commands

### Validate Tokens

Check your token file for errors:

```bash
stylescribe tokens validate -i ./tokens/design-tokens.json
```

### Export Tokens

Export tokens to different formats:

```bash
# CSS custom properties
stylescribe tokens export -i ./tokens/design-tokens.json -f css -o ./tokens/variables.css

# SCSS variables
stylescribe tokens export -i ./tokens/design-tokens.json -f scss -o ./tokens/_variables.scss

# Style Dictionary format
stylescribe tokens export -i ./tokens/design-tokens.json -f style-dictionary -o ./tokens/
```

### Extract Tokens

Extract tokens from existing CSS:

```bash
stylescribe tokens extract -i ./styles.css -o ./tokens/extracted.json
```

### Merge Tokens

Combine multiple token files:

```bash
stylescribe tokens merge -i ./tokens/base.json ./tokens/brand.json -o ./tokens/merged.json
```

## Best Practices

### 1. Use Semantic Names

```json
// Good - describes purpose
"color": {
  "text": { "$value": "#212529" },
  "text-muted": { "$value": "#6c757d" },
  "danger": { "$value": "#dc3545" }
}

// Avoid - describes appearance
"color": {
  "dark-gray": { "$value": "#212529" },
  "red": { "$value": "#dc3545" }
}
```

### 2. Create Scales

Define consistent scales for spacing and sizing:

```json
"spacing": {
  "xs": { "$value": "4px" },
  "sm": { "$value": "8px" },
  "md": { "$value": "16px" },
  "lg": { "$value": "24px" },
  "xl": { "$value": "32px" }
}
```

### 3. Add Descriptions

Document your tokens for team clarity:

```json
{
  "color": {
    "primary": {
      "$value": "#0d6efd",
      "$type": "color",
      "$description": "Primary brand color - used for main CTAs and links"
    }
  }
}
```

### 4. Test Theme Combinations

Ensure all themes maintain proper contrast and usability. Test:
- Light mode
- Dark mode
- High contrast mode (if supported)
- All brand variants
