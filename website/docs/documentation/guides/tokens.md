---
title: Design Tokens & Theming
navtitle: Tokens & Theming
slug: tokens
order: 1
---

Design tokens are the foundation of StyleScribe. They define your design system's colors, spacing, typography, and more in a single source of truth. This guide covers how to structure tokens, create themes, and build component-specific token files.

## Token Basics

StyleScribe uses the W3C Design Tokens Community Group (DTCG) format. Tokens are JSON objects with `$value` and optional `$type`:

```json
{
  "color": {
    "primary": {
      "$value": "#3b82f6",
      "$type": "color",
      "$description": "Primary brand color"
    }
  }
}
```

This generates the CSS variable: `--color-primary: #3b82f6;`

### Token References

Tokens can reference other tokens using `{path.to.token}`:

```json
{
  "color": {
    "brand": { "$value": "#3b82f6" },
    "primary": { "$value": "{color.brand}" },
    "primary-light": { "$value": "tint({color.brand}, 20%)" }
  }
}
```

This creates a dependency chain — changing `color.brand` updates all referencing tokens.

## Token Structure

A well-organized token file has three layers:

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. PRIMITIVES (Raw values)                                         │
│     color.brand: #3b82f6                                            │
│     color.neutral.100: #f3f4f6                                      │
│     spacing.4: 1rem                                                 │
├─────────────────────────────────────────────────────────────────────┤
│  2. SEMANTIC (Purpose-based)                                        │
│     color.semantic.text: {color.neutral.900}                        │
│     color.semantic.surface: {color.neutral.50}                      │
│     color.semantic.border: {color.neutral.200}                      │
├─────────────────────────────────────────────────────────────────────┤
│  3. COMPONENT (Component-specific)                                  │
│     button.background: {color.semantic.surface}                     │
│     button.primary.background: {color.primary.500}                  │
│     card.border: {color.semantic.border}                            │
└─────────────────────────────────────────────────────────────────────┘
```

### Why This Structure?

1. **Primitives** — Raw color scales, spacing units. Rarely change.
2. **Semantic** — Purpose-based tokens. Themes override these.
3. **Component** — Fine-grained control per component. Customizers override these.

## Creating Your Token File

### Basic Structure

Create `tokens/design-tokens.json`:

```json
{
  "$meta": {
    "name": "My Design System",
    "version": "1.0.0"
  },

  "color": {
    "brand": { "$value": "#3b82f6", "$type": "color" },

    "primary": {
      "50": { "$value": "tint({color.brand}, 95%)", "$type": "color" },
      "100": { "$value": "tint({color.brand}, 80%)", "$type": "color" },
      "500": { "$value": "{color.brand}", "$type": "color" },
      "600": { "$value": "shade({color.brand}, 20%)", "$type": "color" },
      "900": { "$value": "shade({color.brand}, 80%)", "$type": "color" }
    },

    "semantic": {
      "background": { "$value": "#ffffff", "$type": "color" },
      "surface": { "$value": "{color.primary.50}", "$type": "color" },
      "text": { "$value": "{color.neutral.900}", "$type": "color" },
      "text-muted": { "$value": "{color.neutral.500}", "$type": "color" },
      "border": { "$value": "{color.neutral.200}", "$type": "color" }
    }
  },

  "spacing": {
    "xs": { "$value": "0.25rem", "$type": "dimension" },
    "sm": { "$value": "0.5rem", "$type": "dimension" },
    "md": { "$value": "1rem", "$type": "dimension" },
    "lg": { "$value": "1.5rem", "$type": "dimension" },
    "xl": { "$value": "2rem", "$type": "dimension" }
  }
}
```

### Token Functions

StyleScribe provides 46 functions for programmatic tokens:

```json
{
  "color": {
    "primary-light": { "$value": "tint({color.brand}, 20%)" },
    "primary-dark": { "$value": "shade({color.brand}, 20%)" },
    "primary-muted": { "$value": "alpha({color.brand}, 0.5)" },
    "text-on-primary": { "$value": "accessibleText({color.brand})" }
  },
  "font": {
    "size-fluid": { "$value": "fluidType(16px, 24px, 320px, 1280px)" }
  }
}
```

See [Design Tokens Reference](../reference/design-tokens.html) for all 46 functions.

## Component Tokens

For fine-grained customization, create component-specific token files in `tokens/components/`.

### Why Component Tokens?

Instead of this (global tokens only):

```scss
.ds-button--primary {
  background: var(--color-primary-500);  // Hard to override per-component
}
```

Use component tokens:

```scss
.ds-button--primary {
  background: var(--button-primary-background);  // Easy to customize
}
```

### Creating a Component Token File

Create `tokens/components/button.json`:

```json
{
  "$meta": {
    "name": "button",
    "description": "Button component tokens"
  },
  "button": {
    "background": {
      "default": { "$value": "transparent", "$type": "color" },
      "hover": { "$value": "{button.background.default}", "$type": "color" }
    },
    "text": {
      "default": { "$value": "{color.semantic.text}", "$type": "color" }
    },
    "primary": {
      "background": { "$value": "{color.primary.500}", "$type": "color" },
      "background-hover": { "$value": "{color.primary.600}", "$type": "color" },
      "text": { "$value": "#ffffff", "$type": "color" }
    },
    "danger": {
      "background": { "$value": "{color.danger.base}", "$type": "color" },
      "text": { "$value": "#ffffff", "$type": "color" }
    }
  }
}
```

This generates:
- `--button-background-default`
- `--button-background-hover`
- `--button-primary-background`
- `--button-primary-text`
- etc.

### Using Component Tokens in SCSS

```scss
.ds-button {
  background: var(--button-background-default);
  color: var(--button-text-default);

  &:hover {
    background: var(--button-background-hover);
  }

  &--primary {
    background: var(--button-primary-background);
    color: var(--button-primary-text);

    &:hover {
      background: var(--button-primary-background-hover);
    }
  }
}
```

## Creating Themes

Themes override semantic tokens to change the entire look of your system.

### Dark Mode Theme

Create `tokens/dark.json`:

```json
{
  "$meta": {
    "name": "dark",
    "mode": "dark",
    "description": "Dark mode overrides"
  },
  "color": {
    "semantic": {
      "background": { "$value": "#1a1a2e", "$type": "color" },
      "surface": { "$value": "#16213e", "$type": "color" },
      "text": { "$value": "#eaeaea", "$type": "color" },
      "text-muted": { "$value": "#a0a0a0", "$type": "color" },
      "border": { "$value": "#3a3a5c", "$type": "color" }
    }
  }
}
```

Register in your main token file:

```json
{
  "$meta": {
    "name": "My Design System",
    "themes": [
      {
        "name": "dark",
        "file": "./dark.json",
        "mode": "dark"
      }
    ]
  }
}
```

Dark mode activates with `[data-theme="dark"]` on `<html>` or parent element.

### Brand Theme

For a different brand color scheme, create `tokens/brand-acme.json`:

```json
{
  "$meta": {
    "name": "brand-acme",
    "description": "ACME Corp brand colors"
  },
  "color": {
    "brand": { "$value": "#e11d48", "$type": "color" },
    "primary": {
      "50": { "$value": "tint({color.brand}, 95%)", "$type": "color" },
      "500": { "$value": "{color.brand}", "$type": "color" },
      "600": { "$value": "shade({color.brand}, 20%)", "$type": "color" }
    }
  }
}
```

Register it:

```json
{
  "$meta": {
    "themes": [
      { "name": "dark", "file": "./dark.json", "mode": "dark" },
      { "name": "acme", "file": "./brand-acme.json" }
    ]
  }
}
```

### Theme with Dark Mode

For a brand that needs both light and dark:

```json
{
  "$meta": {
    "themes": [
      { "name": "dark", "file": "./dark.json", "mode": "dark" },
      { "name": "acme", "file": "./brand-acme.json" },
      { "name": "acme-dark", "file": "./brand-acme-dark.json", "mode": "dark" }
    ]
  }
}
```

Create `tokens/brand-acme-dark.json` combining brand colors with dark backgrounds:

```json
{
  "$meta": {
    "name": "acme-dark",
    "mode": "dark"
  },
  "color": {
    "brand": { "$value": "#fb7185", "$type": "color" },
    "semantic": {
      "background": { "$value": "#1f1f1f", "$type": "color" },
      "surface": { "$value": "#2a2a2a", "$type": "color" },
      "text": { "$value": "#f5f5f5", "$type": "color" }
    }
  }
}
```

### Using CLI for Themes

```bash
# Add a new theme
stylescribe add-theme acme --file=./tokens/brand-acme.json

# Add dark variant
stylescribe add-theme acme-dark --file=./tokens/brand-acme-dark.json --mode=dark
```

## Token Workflow

### Step 1: Define Primitives

Start with raw values — your color palette, spacing scale, font sizes:

```json
{
  "color": {
    "brand": { "$value": "#3b82f6" },
    "neutral": {
      "50": { "$value": "#fafafa" },
      "900": { "$value": "#171717" }
    }
  }
}
```

### Step 2: Create Semantic Layer

Map primitives to purposes:

```json
{
  "color": {
    "semantic": {
      "text": { "$value": "{color.neutral.900}" },
      "background": { "$value": "{color.neutral.50}" }
    }
  }
}
```

### Step 3: Add Component Tokens (Optional)

For components needing fine control:

```bash
mkdir -p tokens/components
```

Create `tokens/components/card.json`:

```json
{
  "card": {
    "background": { "$value": "{color.semantic.surface}" },
    "border": { "$value": "{color.semantic.border}" },
    "shadow": { "$value": "{shadow.sm}" }
  }
}
```

### Step 4: Create Themes

Override semantic tokens for different modes/brands.

### Step 5: Validate

```bash
stylescribe tokens validate
```

## Best Practices

### 1. Use Semantic Names

```json
// ✅ Good - describes purpose
"color.semantic.text-muted"
"color.semantic.surface"
"color.danger.base"

// ❌ Avoid - describes appearance
"color.gray-500"
"color.light-background"
```

### 2. Keep Primitives Stable

Primitives should rarely change. When rebranding, update `color.brand` and let references cascade.

### 3. Theme at Semantic Level

Override semantic tokens, not primitives:

```json
// ✅ Good - dark theme overrides semantic
{
  "color": {
    "semantic": {
      "text": { "$value": "#eaeaea" }
    }
  }
}

// ❌ Avoid - overriding primitives breaks references
{
  "color": {
    "neutral": {
      "900": { "$value": "#eaeaea" }
    }
  }
}
```

### 4. Use Component Tokens for Variations

If a component has many variants (button with 5+ states), use component tokens for maintainability.

### 5. Document with $description

```json
{
  "button": {
    "primary": {
      "background": {
        "$value": "{color.primary.500}",
        "$description": "Primary CTA button - use sparingly, max 1 per page"
      }
    }
  }
}
```

## Configuration

Configure tokens in `.stylescriberc.json`:

```json
{
  "tokens": {
    "input": "./tokens/design-tokens.json",
    "output": "./dist/tokens.css",
    "componentTokensDir": "./tokens/components"
  }
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `input` | `tokens/design-tokens.json` | Main token file |
| `output` | `dist/tokens.css` | CSS output |
| `componentTokensDir` | `tokens/components` | Component token files |

## Next Steps

- [Design Tokens Reference](../reference/design-tokens.html) — All 46 token functions
- [Components Guide](./components.html) — Use tokens in components
- [Icon Component Tutorial](../tutorials/icon-component.html) — Practical example
