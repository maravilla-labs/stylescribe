---
title: CSS Architecture
description: Modern CSS principles powering our design system
order: 2
---

# CSS Architecture

This design system uses modern CSS patterns that enable **multi-brand theming**, **dark mode support**, and **maintainable component variants**. Understanding these principles will help you extend the system effectively.

## Core Principles

### 1. CSS Layers for Cascade Control

We use `@layer` to establish a predictable cascade order:

```css
@layer reset, tokens, base, components, utilities;
```

**Why layers matter:**
- **Predictable specificity** - Later layers win regardless of selector complexity
- **Safe overrides** - Utility classes always beat component styles
- **Team scalability** - Different teams can work on different layers

```scss
/* Components always override base styles */
@layer base {
  button { color: inherit; }
}

@layer components {
  .ds-btn { color: var(--btn-text); }
}

/* Utilities always override components */
@layer utilities {
  .text-white { color: white !important; }
}
```

### 2. Token-Driven Component Architecture

Each component defines **internal tokens** that control its appearance and behavior. Variants only change token values—never behavior.

```scss
@layer components {
  .ds-btn {
    /* Internal token defaults */
    --btn-bg: transparent;
    --btn-bg-hover: var(--btn-bg);
    --btn-text: var(--color-text);
    --btn-shadow: none;
    --btn-shadow-hover: var(--btn-shadow);

    /* Styles use tokens */
    background: var(--btn-bg);
    color: var(--btn-text);
    box-shadow: var(--btn-shadow);

    /* Behavior defined ONCE */
    &:hover:not(:disabled) {
      background: var(--btn-bg-hover);
      box-shadow: var(--btn-shadow-hover);
    }
  }

  /* Variants ONLY set tokens */
  .ds-btn--primary {
    --btn-bg: var(--color-primary-500);
    --btn-bg-hover: var(--color-primary-600);
    --btn-text: white;
    --btn-shadow: var(--shadow-sm);
    --btn-shadow-hover: var(--shadow-md);
  }
}
```

**Why this pattern matters:**

| Anti-Pattern ❌ | Token-Driven ✅ |
|----------------|-----------------|
| Each variant repeats hover/active logic | Behavior defined once on base class |
| Hard to add new states consistently | New states automatically work for all variants |
| Bug fixes require updating every variant | Fix once, fixed everywhere |
| Global tokens pollute `:root` | Tokens scoped to component |

### 3. Multi-Brand & Multi-Tenant Ready

Because variants only set tokens, you can override them at any level:

```scss
/* Brand override */
.brand-acme .ds-btn--primary {
  --btn-bg: var(--acme-brand-color);
  --btn-bg-hover: var(--acme-brand-color-dark);
}

/* Dark theme override */
[data-theme="dark"] .ds-btn--primary {
  --btn-bg: var(--color-primary-400);
  --btn-bg-hover: var(--color-primary-300);
}

/* One-off instance override */
.hero-section .ds-btn--primary {
  --btn-shadow: var(--shadow-xl);
}
```

The hover behavior still works—you didn't have to redefine it!

## Anatomy of a Token-Driven Component

Here's the complete pattern used across all components:

```scss
@layer components {
  .ds-card {
    /* 1. Internal token defaults */
    --card-bg: var(--color-surface);
    --card-border: var(--color-border);
    --card-shadow: none;
    --card-shadow-hover: var(--card-shadow);
    --card-translate-y-hover: 0;

    /* 2. Base styles using tokens */
    background-color: var(--card-bg);
    border: 1px solid var(--card-border);
    box-shadow: var(--card-shadow);
    transform: translateY(0);

    /* 3. Explicit transitions (never 'all') */
    transition:
      box-shadow var(--transition-base),
      transform var(--transition-base);

    /* 4. State behavior using tokens */
    &:hover {
      box-shadow: var(--card-shadow-hover);
      transform: translateY(var(--card-translate-y-hover));
    }

    /* 5. Focus visible for accessibility */
    &:focus-visible {
      outline: 2px solid var(--color-primary-500);
      outline-offset: 2px;
    }
  }

  /* 6. Variants ONLY set tokens */
  .ds-card--elevated {
    --card-shadow: var(--shadow-md);
    --card-shadow-hover: var(--shadow-lg);
  }

  .ds-card--interactive {
    --card-translate-y-hover: -4px;
    --card-shadow-hover: var(--shadow-lg);
    cursor: pointer;
  }
}
```

## Best Practices

### DO ✅

```scss
/* Define token defaults on base class */
.ds-component {
  --component-bg: white;
  --component-bg-hover: var(--component-bg);
  background: var(--component-bg);

  &:hover {
    background: var(--component-bg-hover);
  }
}

/* Variants only set tokens */
.ds-component--dark {
  --component-bg: black;
  --component-bg-hover: #333;
}
```

### DON'T ❌

```scss
/* Don't repeat behavior in variants */
.ds-component--dark {
  background: black;

  &:hover {
    background: #333; /* Duplicated behavior! */
  }
}

/* Don't use transition: all */
.ds-component {
  transition: all 0.2s; /* Performance issue, unexpected animations */
}

/* Don't put component tokens in global :root */
:root {
  --btn-primary-bg: blue; /* Breaks multi-brand! */
}
```

## Adding New Components

When creating a new component, follow this checklist:

1. **Wrap in `@layer components`**
2. **Define internal tokens** with sensible defaults
3. **Use tokens in styles** (never hardcode colors, shadows, etc.)
4. **Define state behavior ONCE** using token references
5. **Add `:focus-visible`** for keyboard accessibility
6. **Use explicit transitions** (list each property)
7. **Variants only change tokens** (no behavior duplication)

## Adding New Variants

To add a new variant to an existing component:

```scss
/* Just set the tokens you need to change */
.ds-btn--success {
  --btn-bg: var(--color-success-base);
  --btn-bg-hover: var(--color-success-dark);
  --btn-text: white;
}
```

That's it! The hover effect, focus ring, disabled state, and loading spinner all work automatically because they're defined on the base class using tokens.

## Dark Theme Support

Components automatically support dark themes when you override the design tokens:

```scss
[data-theme="dark"] {
  /* Override semantic tokens */
  --color-surface: #1e293b;
  --color-border: #334155;
  --color-text: #f1f5f9;

  /* Component tokens inherit from semantic tokens */
  /* No component-specific overrides needed! */
}
```

For components that need specific dark mode adjustments:

```scss
[data-theme="dark"] .ds-alert--info {
  --alert-bg: #1e3a5f;
  --alert-border: #3b82f6;
  --alert-text: #93c5fd;
}
```

## Further Reading

- [Design Tokens Guide](/documentation/tokens-guide) - How to work with design tokens
- [Accessibility](/documentation/accessibility) - Inclusive design patterns
- [Getting Started](/documentation/getting-started) - Setup and installation
