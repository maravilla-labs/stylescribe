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

## Component-Specific Tokens

For complex components, you can create dedicated token files that reference global tokens using the `{path.to.token}` syntax.

### Token Reference Syntax

Use curly braces to reference other tokens:

```json
{
  "progress": {
    "fill": {
      "default": {
        "$value": "{color.primary}",
        "$type": "color"
      },
      "success": {
        "$value": "{color.success}",
        "$type": "color"
      }
    },
    "track": {
      "height": {
        "$value": "{spacing.sm}",
        "$type": "dimension"
      }
    }
  }
}
```

**Reference format:** `{category.token-name}` or `{category.subcategory.token-name}`

Examples:
- `{color.primary}` → References the primary color
- `{spacing.md}` → References medium spacing
- `{font.size.sm}` → References small font size
- `{border.radius.full}` → References full border radius

### Example: Progress Bar Component Tokens

The Progress Bar component (`tokens/components/progress.json`) demonstrates component-specific tokens:

```json
{
  "$meta": {
    "name": "progress",
    "description": "Design tokens for the Progress Bar component"
  },
  "progress": {
    "track": {
      "background": {
        "$value": "{color.light}",
        "$type": "color",
        "$description": "Progress track background color"
      },
      "height": {
        "$value": "{spacing.sm}",
        "$type": "dimension",
        "$description": "Progress bar height"
      }
    },
    "fill": {
      "default": { "$value": "{color.primary}", "$type": "color" },
      "success": { "$value": "{color.success}", "$type": "color" },
      "warning": { "$value": "{color.warning}", "$type": "color" },
      "danger": { "$value": "{color.danger}", "$type": "color" }
    }
  }
}
```

### Benefits of Component Tokens

| Benefit | Description |
|---------|-------------|
| **Single source of truth** | Change global tokens and component tokens update automatically |
| **Clear intent** | Document which values each component uses |
| **Encapsulation** | Keep component-specific decisions with the component |
| **Flexibility** | Override component tokens per theme without changing global tokens |

### When to Use Component Tokens

- Components with multiple visual states (success, warning, danger)
- Components with many customizable properties
- Components that need theme-specific overrides
- Shared components across multiple projects

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

---

## Programmable Token Functions

Stylescribe extends W3C Design Tokens with **46 programmable functions** that transform your tokens at build time. No runtime JavaScript required.

### Why Programmable Tokens?

- **Single source of truth** - Change one value, derived values update automatically
- **Consistent palettes** - Generate color scales from a single brand color
- **Responsive typography** - CSS `clamp()` values generated automatically
- **Accessibility built-in** - Auto-generate WCAG-compliant text colors
- **Less manual work** - Let functions calculate spacing, sizes, and colors

### Function Syntax

Functions are used as token values:

```json
{
  "color": {
    "brand": { "$value": "#6366f1" },
    "primary-light": { "$value": "tint({color.brand}, 80%)" }
  }
}
```

Functions can be **nested**:

```json
{
  "color": {
    "accessible-brand": { "$value": "ensureContrast(tint({color.brand}, 20%), #ffffff, 4.5)" }
  }
}
```

### Killer Features

#### 1. Fluid Typography with `fluidType()`

Generate responsive `clamp()` values that scale smoothly between viewport sizes:

```json
{
  "font": {
    "size-base": { "$value": "fluidType(0.875rem, 1rem)" },
    "size-xl": { "$value": "fluidType(1.25rem, 2rem)" },
    "size-hero": { "$value": "fluidType(2rem, 4rem)" }
  }
}
```

**Output:**
```css
--font-size-base: clamp(0.875rem, 0.2vw + 0.83rem, 1rem);
--font-size-xl: clamp(1.25rem, 1.25vw + 1rem, 2rem);
--font-size-hero: clamp(2rem, 3.33vw + 1.33rem, 4rem);
```

#### 2. Automatic Accessible Text with `accessibleText()`

Automatically choose white or black text based on background luminance:

```json
{
  "color": {
    "primary": { "$value": "#6366f1" },
    "on-primary": { "$value": "accessibleText({color.primary})" },

    "warning": { "$value": "#f59e0b" },
    "on-warning": { "$value": "accessibleText({color.warning})" }
  }
}
```

**Output:**
```css
--color-primary: #6366f1;
--color-on-primary: #ffffff;  /* White for dark background */
--color-warning: #f59e0b;
--color-on-warning: #000000;  /* Black for light background */
```

#### 3. Color Scales with `tint()` and `shade()`

Generate entire color palettes from a single brand color:

```json
{
  "color": {
    "brand": { "$value": "#6366f1" },
    "primary-50": { "$value": "tint({color.brand}, 95%)" },
    "primary-100": { "$value": "tint({color.brand}, 85%)" },
    "primary-200": { "$value": "tint({color.brand}, 70%)" },
    "primary-500": { "$value": "{color.brand}" },
    "primary-700": { "$value": "shade({color.brand}, 30%)" },
    "primary-900": { "$value": "shade({color.brand}, 70%)" }
  }
}
```

#### 4. Spacing from Base Unit with `multiply()`

Define a base spacing and derive all other sizes:

```json
{
  "spacing": {
    "base": { "$value": "1rem" },
    "xs": { "$value": "multiply({spacing.base}, 0.25)" },
    "sm": { "$value": "multiply({spacing.base}, 0.5)" },
    "md": { "$value": "{spacing.base}" },
    "lg": { "$value": "multiply({spacing.base}, 1.5)" },
    "xl": { "$value": "multiply({spacing.base}, 2)" }
  }
}
```

### All 46 Functions Reference

#### Color Functions (15)

| Function | Description | Example |
|----------|-------------|---------|
| `tint(color, %)` | Mix with white | `tint(#0066cc, 50%)` |
| `shade(color, %)` | Mix with black | `shade(#0066cc, 30%)` |
| `mix(color1, color2, ratio)` | Blend two colors | `mix(#ff0000, #0000ff, 0.5)` |
| `alpha(color, opacity)` | Set transparency | `alpha(#000, 0.5)` |
| `complement(color)` | 180° hue rotation | `complement(#0066cc)` |
| `hueRotate(color, degrees)` | Rotate hue | `hueRotate(#ff0000, 120)` |
| `saturate(color, %)` | Increase saturation | `saturate(#888, 50%)` |
| `desaturate(color, %)` | Decrease saturation | `desaturate(#ff0000, 30%)` |
| `lighten(color, %)` | Increase lightness | `lighten(#333, 20%)` |
| `darken(color, %)` | Decrease lightness | `darken(#ccc, 20%)` |
| `grayscale(color)` | Remove saturation | `grayscale(#ff6600)` |
| `invert(color)` | Invert color | `invert(#ffffff)` |
| `darkMode(color)` | Optimize for dark bg | `darkMode(#ffffff)` |

#### Accessibility Functions (8)

| Function | Description | Example |
|----------|-------------|---------|
| `accessibleText(bg)` | Auto white/black text | `accessibleText(#0066cc)` |
| `contrastRatio(fg, bg)` | Calculate ratio | `contrastRatio(#000, #fff)` → 21 |
| `meetsContrast(fg, bg, level)` | Check WCAG | `meetsContrast(#666, #fff, 'AA')` |
| `ensureContrast(fg, bg, ratio)` | Adjust to meet ratio | `ensureContrast(#888, #fff, 4.5)` |
| `luminance(color)` | Get luminance (0-1) | `luminance(#808080)` |
| `isLight(color)` | Check if light | `isLight(#ffffff)` → 'true' |
| `isDark(color)` | Check if dark | `isDark(#000000)` → 'true' |

#### Typography Functions (8)

| Function | Description | Example |
|----------|-------------|---------|
| `fluidType(min, max)` | Responsive clamp() | `fluidType(1rem, 2rem)` |
| `fluidSpace(min, max)` | Fluid spacing | `fluidSpace(1rem, 3rem)` |
| `modularScale(base, step, ratio)` | Type scale | `modularScale(1rem, 2, majorThird)` |

> **Note:** `fluidType()` and `fluidSpace()` are mathematically identical - both generate CSS `clamp()` values. The separate names exist for semantic clarity in your token files. Use `fluidType()` for font sizes and `fluidSpace()` for margins/padding.

**Available scale ratios:** `minorSecond` (1.067), `majorSecond` (1.125), `minorThird` (1.2), `majorThird` (1.25), `perfectFourth` (1.333), `augmentedFourth` (1.414), `perfectFifth` (1.5), `goldenRatio` (1.618)

#### Math Functions (15)

| Function | Description | Example |
|----------|-------------|---------|
| `multiply(dim, factor)` | Multiply | `multiply(1rem, 1.5)` → 1.5rem |
| `divide(dim, divisor)` | Divide | `divide(2rem, 2)` → 1rem |
| `add(dim1, dim2)` | Add (same units) | `add(1rem, 0.5rem)` → 1.5rem |
| `subtract(dim1, dim2)` | Subtract | `subtract(2rem, 0.5rem)` → 1.5rem |
| `round(dim, precision)` | Round decimals | `round(1.234rem, 2)` → 1.23rem |
| `convert(dim, unit)` | Convert units | `convert(16px, rem)` → 1rem |
| `percent(dim, %)` | Percentage of | `percent(100px, 50%)` → 50px |
| `clamp(min, pref, max)` | Constrain value | `clamp(1rem, 2rem, 3rem)` |
| `abs(dim)` | Absolute value | `abs(-1rem)` → 1rem |
| `negate(dim)` | Negate value | `negate(1rem)` → -1rem |

### Common Patterns

#### Complete Color System

```json
{
  "color": {
    "brand": { "$value": "#6366f1" },

    "primary": {
      "50": { "$value": "tint({color.brand}, 95%)" },
      "100": { "$value": "tint({color.brand}, 85%)" },
      "500": { "$value": "{color.brand}" },
      "900": { "$value": "shade({color.brand}, 70%)" }
    },

    "accent": { "$value": "complement({color.brand})" },
    "on-primary": { "$value": "accessibleText({color.primary.500})" },

    "overlay": {
      "light": { "$value": "alpha({color.neutral.900}, 0.1)" },
      "dark": { "$value": "alpha({color.neutral.900}, 0.8)" }
    }
  }
}
```

#### Responsive Typography Scale

```json
{
  "font": {
    "size": {
      "xs": { "$value": "fluidType(0.75rem, 0.8125rem)" },
      "sm": { "$value": "fluidType(0.8125rem, 0.875rem)" },
      "base": { "$value": "fluidType(0.875rem, 1rem)" },
      "lg": { "$value": "fluidType(1rem, 1.25rem)" },
      "xl": { "$value": "fluidType(1.25rem, 1.5rem)" },
      "2xl": { "$value": "fluidType(1.5rem, 2rem)" },
      "hero": { "$value": "fluidType(2.5rem, 4rem)" }
    }
  }
}
```

#### Proportional Spacing System

```json
{
  "spacing": {
    "base": { "$value": "1rem" },
    "3xs": { "$value": "multiply({spacing.base}, 0.125)" },
    "2xs": { "$value": "multiply({spacing.base}, 0.25)" },
    "xs": { "$value": "multiply({spacing.base}, 0.5)" },
    "sm": { "$value": "multiply({spacing.base}, 0.75)" },
    "md": { "$value": "{spacing.base}" },
    "lg": { "$value": "multiply({spacing.base}, 1.5)" },
    "xl": { "$value": "multiply({spacing.base}, 2)" },
    "2xl": { "$value": "multiply({spacing.base}, 3)" },
    "3xl": { "$value": "multiply({spacing.base}, 4)" }
  }
}
```

### Tips

1. **Start with base values** - Define brand color, base spacing, and base font size first
2. **Use references** - `{color.brand}` keeps your system connected
3. **Leverage accessibility functions** - Let `accessibleText()` handle contrast decisions
4. **Test fluid values** - Resize your browser to see `fluidType()` in action
5. **Keep it simple** - Not every token needs a function; use them where they add value
