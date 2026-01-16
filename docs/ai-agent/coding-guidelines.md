# Coding Guidelines

Best practices and conventions for developing with Stylescribe.

## Component Development

### File Structure

Each component lives in its own folder:

```
sass/components/
├── button/
│   └── button.scss
├── card/
│   └── card.scss
└── alert/
    └── alert.scss
```

### CRITICAL: Component Creation Workflow

**Follow these steps IN ORDER when creating a new component:**

#### Step 1: Check Existing Components
Read existing components in `sass/components/` to understand:
- Patterns used in the project
- What components already exist (to avoid duplication)
- Dependencies you might need

#### Step 2: Check Existing Tokens
**ALWAYS read `tokens/design-tokens.json` BEFORE writing any CSS.**

Find the exact token paths available:
```
color.semantic.text      → --color-semantic-text
color.primary.500        → --color-primary-500
spacing.scale.md         → --spacing-scale-md
font.size.lg             → --font-size-lg
```

#### Step 3: Use MCP Tool to Scaffold
**USE the `stylescribe_create_component` MCP tool to scaffold the component:**

```
stylescribe_create_component({
  name: "hero",
  group: "Containment"
})
```

This creates both files with correct structure:
- `sass/components/hero/hero.scss`
- `tokens/components/hero.json`

**DO NOT manually create directories or files with mkdir/touch. ALWAYS use the MCP tool.**

#### Step 4: Customize the Scaffolded Files
After scaffolding, edit the generated files:

1. **Edit `tokens/components/{name}.json`** - Add component-specific tokens
2. **Edit `sass/components/{name}/{name}.scss`** - Add variations, elements, examples

#### Step 5: Add Dependencies
If your component uses other components (like buttons in a hero), add `@dependencies`:

```scss
/**
 * @dependencies button, card
 */
```

### MCP Tools Available

**ALWAYS use MCP tools instead of manual file operations:**

| Task | MCP Tool | NOT This |
|------|----------|----------|
| Create component | `stylescribe_create_component` | `mkdir`, `touch`, manual Write |
| Create page | `stylescribe_create_page` | Manual file creation |
| Validate tokens | `stylescribe_validate_tokens` | Manual inspection |
| Add theme | `stylescribe_add_theme` | Manual JSON editing |

### Component Template

```scss
/**
 * @title ComponentName
 * @description Clear, concise description
 * @group GroupName
 * @order 1
 *
 * @variations
 * - name: primary
 *   description: Main action
 * - name: secondary
 *   description: Secondary action
 *
 * @elements
 * - name: icon
 *   description: Leading/trailing icon
 * - name: label
 *   description: Text content
 *
 * @examples
 * - title: Basic Usage
 *   code: |
 *     <button class="ds-button">Click me</button>
 */

.ds-button {
  // ===== Component Tokens =====
  // ALWAYS include font-family for component isolation
  --button-font: var(--font-family-base);
  --button-bg: var(--color-semantic-surface);
  --button-text: var(--color-semantic-text);
  --button-border: var(--color-semantic-border);
  --button-padding-x: var(--spacing-scale-md);
  --button-padding-y: var(--spacing-scale-xs);
  --button-radius: var(--border-radius-md);
  --button-font-weight: var(--font-weight-medium);

  // ===== Base Styles =====
  // ALWAYS set font-family first for component isolation
  font-family: var(--button-font);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-scale-xs);
  padding: var(--button-padding-y) var(--button-padding-x);
  background: var(--button-bg);
  color: var(--button-text);
  border: 1px solid var(--button-border);
  border-radius: var(--button-radius);
  font-weight: var(--button-font-weight);
  cursor: pointer;

  // ===== Elements =====
  &__icon {
    flex-shrink: 0;
  }

  &__label {
    // Usually just inherits, define if needed
  }

  // ===== States =====
  &:hover:not(:disabled) {
    --button-bg: var(--color-surface-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  // ===== Variations (token overrides ONLY) =====
  &--primary {
    --button-bg: var(--color-primary);
    --button-text: var(--color-primary-text);
    --button-border: var(--color-primary);
  }

  &--secondary {
    --button-bg: var(--color-secondary);
    --button-text: var(--color-secondary-text);
    --button-border: var(--color-secondary);
  }

  &--outline {
    --button-bg: transparent;
    --button-text: var(--color-primary);
    --button-border: var(--color-primary);
  }

  &--large {
    --button-padding-x: var(--space-6);
    --button-padding-y: var(--space-3);
    --button-radius: var(--radius-lg);
  }

  &--small {
    --button-padding-x: var(--space-3);
    --button-padding-y: var(--space-1);
    --button-radius: var(--radius-sm);
  }
}
```

---

## Component Isolation

**Components must be self-contained and work in isolation (e.g., in iframes, preview panels).**

### Required Base Styles

Every component MUST include these in its base styles:

```scss
.ds-component {
  // ===== Component Tokens =====
  --component-font: var(--font-family-base);  // REQUIRED
  --component-bg: var(--color-semantic-surface);
  --component-text: var(--color-semantic-text);
  // ... other tokens

  // ===== Base Styles =====
  font-family: var(--component-font);  // REQUIRED - first property!
  background: var(--component-bg);
  color: var(--component-text);
  // ... other styles
}
```

### Why font-family is Required

1. **Iframe isolation**: Components in preview iframes don't inherit parent fonts
2. **Portability**: Components can be dropped into any context
3. **Predictability**: No surprises from inherited styles

### Checklist for Component Base Styles

Every component base class should have:
- [ ] `font-family: var(--component-font)` - Typography
- [ ] `color: var(--component-text)` - Text color
- [ ] `background: var(--component-bg)` - Background (even if transparent)

---

## Naming Conventions

### CSS Class Prefix - IMPORTANT

**ALWAYS use `ds-` prefix in source SCSS files.** The configured prefix (e.g., `sol-`, `acme-`) is applied automatically at build time.

```scss
// ✅ CORRECT - Always use ds- in source files
.ds-button { }
.ds-card { }
.ds-alert { }

// ❌ WRONG - Never use configured prefix in source
.sol-button { }  // NO! Use ds-button
.acme-card { }   // NO! Use ds-card

// ❌ WRONG - Never omit prefix
.button { }      // NO! Use ds-button
```

**How it works:**
1. You write `.ds-button` in your SCSS source
2. At build time, `ds-` is replaced with the configured `classPrefix` from `.stylescriberc.json`
3. Output CSS contains `.sol-button` (or whatever prefix is configured)

This ensures consistent source code across all projects while allowing per-project customization.

### BEM Naming

Always use `ds-` prefix with BEM naming:

```
.ds-{block}__{element}--{modifier}
```

| Part | Usage | Example |
|------|-------|---------|
| Block | Component name | `.ds-button` |
| Element | Child part (use `__`) | `.ds-button__icon` |
| Modifier | Variation (use `--`) | `.ds-button--primary` |

### Token Naming

```
--{category}-{property}-{variant}
```

Examples:
- `--color-primary`
- `--color-primary-hover`
- `--space-4`
- `--font-size-lg`
- `--radius-md`

### Component Token Naming

```
--{component}-{property}
```

Examples:
- `--button-bg`
- `--button-text`
- `--card-padding`
- `--alert-border`

### CRITICAL: Use Existing Global Tokens

**Before creating a component, check what tokens exist in `tokens/design-tokens.json`.**

Tokens are nested, so `color.semantic.text` becomes `--color-semantic-text`.

**Common token paths (verify against your project):**
```scss
// Colors - check actual paths in design-tokens.json
--color-semantic-background    // NOT --color-background
--color-semantic-surface       // NOT --color-surface
--color-semantic-text          // NOT --color-text
--color-semantic-text-muted    // NOT --color-text-muted
--color-semantic-border        // NOT --color-border
--color-primary-500            // NOT --color-primary
--color-neutral-900            // Darkest neutral

// Spacing - nested under scale
--spacing-scale-sm             // NOT --spacing-sm
--spacing-scale-md             // NOT --spacing-md
--spacing-scale-lg             // NOT --spacing-lg
--spacing-scale-xl             // NOT --spacing-xl
--spacing-scale-2xl
--spacing-scale-3xl

// Typography
--font-size-base               // NOT --text-base
--font-size-lg
--font-size-xl
--font-size-2xl
--font-size-3xl
--font-weight-bold
--font-lineHeight-tight        // NOT --line-height-tight
--font-lineHeight-normal

// Border
--border-radius-md             // NOT --radius-md
--border-radius-lg
```

**Always read `tokens/design-tokens.json` to verify exact token paths before writing component CSS.**

---

## Token-Driven Pattern

### Core Principles

1. **Behavior on base class, tokens on variations**
2. **NO inline fallbacks** - Reference tokens directly without CSS fallbacks
3. **Component defaults in JSON** - Define customizable defaults in `tokens/components/*.json`

### CRITICAL: No Inline Fallbacks

**NEVER use inline fallbacks like `var(--token, fallback)`.**

```scss
// ✅ CORRECT - Reference tokens directly, no fallbacks
.ds-hero {
  --hero-padding: var(--spacing-xl);
  --hero-bg: var(--color-surface);
  --hero-text: var(--color-text);
}

// ❌ WRONG - Inline fallbacks are forbidden
.ds-hero {
  --hero-padding: var(--spacing-xl, 4rem);     // NO! No fallback!
  --hero-bg: var(--color-surface, #f8f9fa);    // NO! No fallback!
  --hero-text: var(--color-text, #212529);     // NO! No fallback!
}
```

**Why no fallbacks?**
- Fallbacks hide missing tokens instead of failing visibly
- They duplicate values that should be in the token system
- They make theming harder (fallback ignores theme changes)
- They encourage hardcoded values

### Component Token Files

For customizable component defaults, create `tokens/components/{name}.json`:

```json
{
  "$meta": {
    "name": "hero",
    "description": "Design tokens for the Hero component"
  },
  "hero": {
    "padding": {
      "$value": "{spacing.xl}",
      "$type": "dimension",
      "$description": "Hero section padding"
    },
    "background": {
      "$value": "{color.surface}",
      "$type": "color",
      "$description": "Hero background color"
    }
  }
}
```

Then in SCSS, reference the global tokens:

```scss
.ds-hero {
  --hero-padding: var(--spacing-xl);
  --hero-bg: var(--color-surface);

  padding: var(--hero-padding);
  background: var(--hero-bg);
}
```

### Do This

```scss
.ds-card {
  // Define tokens referencing global tokens (NO fallbacks)
  --card-bg: var(--color-surface);
  --card-border: var(--color-border);
  --card-padding: var(--spacing-md);

  // Use component tokens for all styling
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  padding: var(--card-padding);

  // Variations only override tokens
  &--elevated {
    --card-bg: var(--color-background);
  }

  &--compact {
    --card-padding: var(--spacing-sm);
  }
}
```

### Don't Do This

```scss
// ❌ BAD: Inline fallbacks
.ds-card {
  --card-bg: var(--color-surface, white);      // NO fallbacks!
  --card-padding: var(--spacing-md, 1rem);     // NO fallbacks!
}

// ❌ BAD: Behavior in variations
.ds-card {
  padding: 16px;
  background: white;

  &--elevated {
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);  // Behavior, not token
    transform: translateY(-2px);             // Behavior, not token
  }

  &--compact {
    padding: 8px;           // Duplicates base behavior
    font-size: 14px;        // Behavior in variation
  }
}
```

---

## Accessibility

### Focus States

Always provide visible focus indicators:

```scss
.ds-button {
  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}
```

### Color Contrast

Use token functions to ensure contrast:

```json
{
  "color": {
    "text-on-primary": {
      "$value": "accessibleText({color.primary})",
      "$type": "color"
    }
  }
}
```

### Interactive Elements

- Buttons: minimum 44x44px touch target
- Links: distinguishable from text (underline or color)
- Form inputs: visible labels, error states

```scss
.ds-button {
  min-height: 44px;
  min-width: 44px;
}
```

### Screen Reader Support

Use semantic HTML and ARIA attributes in examples:

```scss
/**
 * @examples
 * - title: Icon Button
 *   code: |
 *     <button class="ds-button ds-button--icon" aria-label="Close">
 *       <span class="ds-button__icon">×</span>
 *     </button>
 */
```

---

## Responsive Design

### Container Queries for Components

```scss
.ds-card {
  container-type: inline-size;
  container-name: card;

  @container card (min-width: 400px) {
    // Layout changes
  }
}
```

### Media Queries for Layout

Reserve `@media` for page-level layout:

```scss
// In layout components or utilities
.page-layout {
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 250px 1fr;
  }
}
```

---

## Performance

### Avoid Deep Nesting

```scss
// ❌ BAD: Too deep
.ds-card {
  .ds-card__header {
    .ds-card__title {
      .ds-card__icon {
        // 4 levels deep
      }
    }
  }
}

// ✅ GOOD: Flat structure
.ds-card { }
.ds-card__header { }
.ds-card__title { }
.ds-card__icon { }
```

### Use CSS Custom Properties Efficiently

Define component tokens once, reference everywhere:

```scss
.ds-button {
  --button-padding: var(--space-4);

  padding: var(--button-padding);

  &__icon {
    margin-inline: calc(var(--button-padding) * -0.25);
  }
}
```

### Minimize Specificity

The layer system handles cascade. Avoid `!important`:

```scss
// ❌ BAD
.ds-button--primary {
  background: blue !important;
}

// ✅ GOOD
.ds-button--primary {
  --button-bg: var(--color-primary);
}
```

---

## Documentation

### Required Annotations

Every component must have:

1. `@title` - Display name
2. `@description` - What it does
3. `@group` - Category

### Good Descriptions

```scss
// ✅ GOOD
@description Displays contextual feedback messages for user actions with support for multiple severity levels.

// ❌ BAD
@description Alert component
```

### CRITICAL: @examples Format

**Always use YAML list format with `title` and `code` keys. Never put raw HTML directly after @examples.**

```scss
// ✅ CORRECT - YAML list with title and code
/**
 * @examples
 * - title: Form Submission Success
 *   description: Show after successful form submission
 *   code: |
 *     <div class="ds-alert ds-alert--success">
 *       <span class="ds-alert__icon">✓</span>
 *       <p class="ds-alert__content">Your changes have been saved.</p>
 *     </div>
 * - title: Warning Alert
 *   code: |
 *     <div class="ds-alert ds-alert--warning">
 *       <p class="ds-alert__content">Please review your input.</p>
 *     </div>
 */

// ❌ WRONG - Raw HTML without YAML structure
/**
 * @examples
 * <div class="ds-alert">...</div>
 */

// ❌ WRONG - Multiple @examples annotations
/**
 * @examples
 * <div class="ds-alert">One</div>
 * @examples
 * <div class="ds-alert">Two</div>
 */
```

**Each example MUST have:**
- `title` - Display name for the example
- `code` - The HTML code (use `|` for multi-line)

---

## Code Style

### SCSS Formatting

- 2 space indentation
- One property per line
- Blank line before nested rules
- Group related properties

```scss
.ds-component {
  // Layout
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  // Box model
  padding: var(--component-padding);
  margin: 0;

  // Visual
  background: var(--component-bg);
  border-radius: var(--component-radius);

  // Typography
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);

  // States
  &:hover {
    // ...
  }

  // Elements
  &__child {
    // ...
  }

  // Variations
  &--variant {
    // ...
  }
}
```

### Comment Guidelines

```scss
// ===== Section Header =====

// Brief explanation for complex logic
```

---

## Dark Mode Compatibility

### How Dark Mode Works

1. Base tokens defined in `design-tokens.json` go to `:root`
2. Dark theme tokens from `dark.json` go to `[data-theme="dark"]`
3. When `<html data-theme="dark">` is set, dark tokens override base tokens

### CRITICAL: Token Path Matching

**Dark theme tokens must use the SAME nested paths as base tokens!**

```scss
// Component uses nested path from base tokens
.ds-card {
  --card-bg: var(--color-semantic-surface);  // from color.semantic.surface
  --card-text: var(--color-semantic-text);   // from color.semantic.text
}
```

**dark.json must override the same paths:**
```json
{
  "color": {
    "semantic": {
      "surface": { "$value": "#16213e" },
      "text": { "$value": "#eaeaea" }
    }
  }
}
```

**NOT flat paths (this won't work!):**
```json
{
  "color": {
    "surface": { "$value": "#16213e" },
    "text": { "$value": "#eaeaea" }
  }
}
```

### Accessibility Tokens for Dark Backgrounds

When a variation has a colored background, use accessibility tokens:

```scss
.ds-button {
  --button-bg: var(--color-semantic-surface);
  --button-text: var(--color-semantic-text);

  &--primary {
    --button-bg: var(--color-primary-500);
    --button-text: var(--color-accessibility-on-primary);  // ✅ Ensures contrast
  }
}
```

### Testing Dark Mode

1. Run `npm run dev`
2. Open browser dev tools
3. Add `data-theme="dark"` to `<html>` element
4. Verify all components display correctly with proper contrast

---

## Testing Checklist

Before committing a component:

- [ ] All annotations present (@title, @description, @group)
- [ ] Examples render correctly
- [ ] Works in light and dark mode
- [ ] Focus states visible
- [ ] Passes contrast requirements
- [ ] Container queries work as expected
- [ ] No hardcoded colors (use tokens)
- [ ] No `!important` usage
- [ ] Variations only override tokens
