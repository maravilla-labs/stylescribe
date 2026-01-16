# CSS Architecture Guide

Stylescribe promotes a token-driven, layer-based CSS architecture that ensures consistency, maintainability, and easy theming.

## CSS Layers

Use `@layer` to control cascade order:

```scss
@layer reset, base, components, utilities;
```

| Layer | Purpose | Example |
|-------|---------|---------|
| `reset` | Normalize browser defaults | Box-sizing, margins |
| `base` | Global element styles | Typography, links |
| `components` | Component styles | Buttons, cards, alerts |
| `utilities` | Single-purpose helpers | `.hidden`, `.flex` |

### Layer Declaration

In your main SCSS file:

```scss
// base.scss
@layer reset, base, components, utilities;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }
}

@layer base {
  body {
    font-family: var(--font-family-base);
    font-size: var(--font-size-base);
    line-height: var(--line-height-base);
    color: var(--color-text);
    background: var(--color-background);
  }
}
```

---

## Token-Driven Components

### Core Principles

1. **Behavior on base class, tokens on variations**
2. **NO inline fallbacks** - Reference tokens directly
3. **Component defaults in JSON** - Define in `tokens/components/*.json`

### CRITICAL: No Inline Fallbacks

**NEVER use `var(--token, fallback)` with inline fallbacks.**

```scss
// ✅ CORRECT - Direct token reference
--component-padding: var(--spacing-md);

// ❌ WRONG - Inline fallback
--component-padding: var(--spacing-md, 1rem);
```

### The Pattern

```scss
.component {
  // 1. Define component tokens (NO inline fallbacks!)
  --component-bg: var(--color-surface);
  --component-border: var(--color-border);
  --component-text: var(--color-text);
  --component-padding: var(--spacing-md);
  --component-radius: var(--border-radius-md);

  // 2. Use tokens for all styling
  background: var(--component-bg);
  border: 1px solid var(--component-border);
  color: var(--component-text);
  padding: var(--component-padding);
  border-radius: var(--component-radius);

  // 3. Variations ONLY override tokens
  &--primary {
    --component-bg: var(--color-primary);
    --component-border: var(--color-primary);
    --component-text: var(--color-primary-text);
  }

  &--large {
    --component-padding: var(--spacing-lg);
    --component-radius: var(--border-radius-lg);
  }
}
```

### Component Token Files

For customizable defaults, create `tokens/components/{name}.json`:

```json
{
  "$meta": { "name": "card" },
  "card": {
    "background": { "$value": "{color.semantic.surface}", "$type": "color" },
    "padding": { "$value": "{spacing.scale.md}", "$type": "dimension" }
  }
}
```

### CRITICAL: Read Tokens First

**Before writing component CSS, ALWAYS read `tokens/design-tokens.json` to find correct token paths.**

Tokens are nested, so `color.semantic.text` becomes `--color-semantic-text`.

```scss
// ❌ WRONG - Assuming flat token names
--component-text: var(--color-text);          // May not exist!
--component-padding: var(--spacing-md);       // May not exist!

// ✅ CORRECT - Using actual nested paths
--component-text: var(--color-semantic-text);
--component-padding: var(--spacing-scale-md);
```

### Why This Pattern?

1. **Single source of truth** - All styling uses tokens
2. **Easy theming** - Override tokens, not properties
3. **Predictable cascade** - Variations don't fight specificity
4. **Better DX** - See all customization points at a glance
5. **Visible failures** - Missing tokens fail visibly, not silently

### Anti-Pattern (Don't Do This)

```scss
// ❌ BAD: Inline fallbacks hide missing tokens
.button {
  --button-padding: var(--spacing-md, 16px);  // NO!
  --button-bg: var(--color-surface, white);    // NO!
}

// ❌ BAD: Behavior mixed into variations
.button {
  padding: 8px 16px;
  background: #e0e0e0;

  &--primary {
    padding: 8px 16px;  // Duplicated
    background: #0d6efd;
    font-weight: bold;  // Behavior in variation!
  }

  &--large {
    padding: 12px 24px;
    font-size: 18px;    // Behavior in variation!
  }
}
```

---

## BEM Naming Convention

Use Block-Element-Modifier with `ds-` prefix.

### IMPORTANT: Always Use `ds-` Prefix

**In source SCSS files, ALWAYS use `ds-` prefix.** The configured prefix (e.g., `sol-`, `acme-`) is applied automatically at build time.

```scss
// ✅ CORRECT - Always use ds- in source files
.ds-button { }
.ds-card { }

// ❌ WRONG - Never use configured prefix in source
.sol-button { }  // NO! Use ds-button
.acme-card { }   // NO! Use ds-card
```

### Structure

```
.ds-{block}__{element}--{modifier}
```

- Block: `.ds-button`
- Element: `.ds-button__icon`
- Modifier: `.ds-button--primary`

### Guidelines

```scss
// Block - The component
.ds-card {
  // ...
}

// Element - Parts of the component (use __)
.ds-card__header {
  // ...
}

.ds-card__body {
  // ...
}

.ds-card__footer {
  // ...
}

// Modifier - Variations (use --)
.ds-card--elevated {
  // Only override tokens
}

.ds-card--compact {
  // Only override tokens
}
```

### Nesting in SCSS

```scss
.ds-card {
  --card-padding: var(--space-4);

  padding: var(--card-padding);

  &__header {
    padding: var(--card-padding);
    border-bottom: 1px solid var(--color-border);
  }

  &__body {
    padding: var(--card-padding);
  }

  &--compact {
    --card-padding: var(--space-2);
  }
}
```

---

## Component Structure Template

```scss
/**
 * @title ComponentName
 * @description Brief description
 * @group GroupName
 * @variations
 * - name: variant1
 *   description: What it does
 * @elements
 * - name: element1
 *   description: What it is
 */

.ds-component {
  // ===== Component Tokens =====
  --component-bg: var(--color-surface);
  --component-text: var(--color-text);
  --component-border: var(--color-border);
  --component-padding: var(--space-4);
  --component-gap: var(--space-2);
  --component-radius: var(--radius-md);
  --component-shadow: var(--shadow-sm);
  --component-transition: var(--transition-fast);

  // ===== Base Styles =====
  display: flex;
  flex-direction: column;
  gap: var(--component-gap);
  padding: var(--component-padding);
  background: var(--component-bg);
  color: var(--component-text);
  border: 1px solid var(--component-border);
  border-radius: var(--component-radius);
  box-shadow: var(--component-shadow);
  transition: all var(--component-transition);

  // ===== Elements =====
  &__header {
    // Element styles
  }

  &__body {
    flex: 1;
  }

  &__footer {
    // Element styles
  }

  // ===== States =====
  &:hover {
    --component-shadow: var(--shadow-md);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  // ===== Variations (token overrides only) =====
  &--primary {
    --component-bg: var(--color-primary);
    --component-text: var(--color-primary-text);
    --component-border: var(--color-primary);
  }

  &--large {
    --component-padding: var(--space-6);
    --component-gap: var(--space-4);
    --component-radius: var(--radius-lg);
  }

  &--elevated {
    --component-shadow: var(--shadow-lg);
  }
}
```

---

## Responsive Design

### Use @container for Component-Internal Responsiveness

```scss
.ds-card {
  container-type: inline-size;
  container-name: card;

  &__layout {
    display: flex;
    flex-direction: column;

    @container card (min-width: 400px) {
      flex-direction: row;
    }
  }
}
```

See [Container Queries Guide](./container-queries.md) for details.

### Use @media for Layout-Level Responsiveness

```scss
// In utilities or layout components
.container {
  max-width: 100%;
  padding: var(--space-4);

  @media (min-width: 768px) {
    max-width: 720px;
    margin: 0 auto;
  }

  @media (min-width: 1024px) {
    max-width: 960px;
  }
}
```

---

## Design Token Integration

### Global Tokens (base.scss)

```scss
:root {
  // Spacing scale
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  // Border radius
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;

  // Shadows
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  // Transitions
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
}
```

### Theme Support

```scss
// Light mode (default)
:root {
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-text: #212529;
  --color-border: #dee2e6;
}

// Dark mode
[data-theme="dark"] {
  --color-background: #1a1a2e;
  --color-surface: #16213e;
  --color-text: #eaeaea;
  --color-border: #2d3748;
}
```

---

## File Organization

```
sass/
├── base.scss              # Layers, reset, typography
├── components/
│   ├── button/
│   │   └── button.scss    # Single component per folder
│   ├── card/
│   │   └── card.scss
│   └── alert/
│       └── alert.scss
└── utilities/
    └── utilities.scss     # Helper classes
```

---

## Best Practices Summary

1. **Declare layers** - `@layer reset, base, components, utilities`
2. **Define component tokens** - All customizable values as CSS custom properties
3. **Base class = behavior** - Layout, structure, interactions
4. **Variation = tokens only** - Never add behavior in modifiers
5. **Use BEM naming** - Clear, predictable class names
6. **Prefer @container** - For component-internal responsiveness
7. **Use semantic tokens** - `--color-danger` not `--color-red`
8. **Document with annotations** - @title, @group, @variations
