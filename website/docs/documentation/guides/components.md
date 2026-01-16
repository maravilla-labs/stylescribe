---
title: Components
navtitle: Components
slug: components
order: 2
---

Components are the building blocks of your design system. In StyleScribe, you document components directly in your SCSS files using annotations.

## Creating a Component

### File Structure

Each component lives in its own folder:

```
sass/components/
└── button/
    └── button.scss
```

The folder name becomes the component's slug (URL path).

### Basic Annotations

Add a documentation block at the top of your SCSS file:

```scss
/**
 * @title Button
 * @description Interactive button element for user actions
 * @group Actions
 */
.ds-button {
  /* styles */
}
```

### Required Annotations

| Annotation | Description |
|------------|-------------|
| `@title` | Display name in documentation |
| `@description` | What the component does |
| `@group` | Category for navigation (Actions, Forms, Layout, etc.) |

### Using the CLI

The fastest way to create a component:

```bash
stylescribe create-component button --group="Actions"
```

This creates the folder structure and a starter SCSS file with annotations.

## Variations

Variations are modifier classes that change appearance.

### Simple Format

```scss
@variations primary, secondary, danger, outline, ghost
```

### With Descriptions

```scss
@variations
- name: primary
  description: Main call-to-action, use sparingly per page
- name: secondary
  description: Secondary actions, less visual weight
- name: danger
  description: Destructive actions like delete
- name: outline
  description: Bordered style, transparent background
- name: ghost
  description: Minimal styling, blends with background
```

### How Variations Render

StyleScribe generates a preview for each variation. **The first `@example` is used as the template** — the variation class is swapped in automatically.

For nested components (dropdown, modal, tabs), ensure your first example has the complete HTML structure:

```scss
@examples
- title: Basic Dropdown
  code: |
    <div class="ds-dropdown">
      <button class="ds-dropdown__trigger">Open</button>
      <div class="ds-dropdown__menu">
        <button class="ds-dropdown__item">Edit</button>
        <button class="ds-dropdown__item">Delete</button>
      </div>
    </div>
```

## Elements

Elements are BEM child elements (e.g., `button__icon`, `button__label`).

### Simple Format

```scss
@elements icon, label, spinner
```

### With Custom HTML

For proper rendering in the interactive playground:

```scss
@elements
- name: icon
  description: Leading icon
  html: <span class="{{class}} ds-icon ds-icon--add"></span>
- name: label
  description: Button text
  html: <span class="{{class}}">Button</span>
- name: spinner
  description: Loading indicator
  html: <span class="{{class}} ds-spinner"></span>
```

The `{{class}}` placeholder is replaced with the full BEM class.

## Examples

Examples show your component in action with real code.

```scss
@examples
- title: Primary Button
  description: Use for main actions
  code: |
    <button class="ds-button ds-button--primary">
      <span class="ds-button__label">Submit</span>
    </button>

- title: With Icon
  code: |
    <button class="ds-button ds-button--primary">
      <span class="ds-button__icon ds-icon ds-icon--add"></span>
      <span class="ds-button__label">Add Item</span>
    </button>

- title: Button Group
  fullWidth: true
  code: |
    <div class="ds-button-group">
      <button class="ds-button">One</button>
      <button class="ds-button">Two</button>
      <button class="ds-button">Three</button>
    </div>
```

### Example Properties

| Property | Description |
|----------|-------------|
| `title` | Example name (required) |
| `description` | Optional explanation |
| `code` | HTML code (use `\|` for multiline) |
| `fullWidth` | Render at full width (default: false) |

## Dependencies

If your component uses other components, declare them:

```scss
@dependencies icon, spinner
```

This ensures the required CSS is loaded in previews.

## Complete Example

```scss
/**
 * @title Button
 * @navtitle Button
 * @description Interactive button for user actions with multiple variants
 * @group Actions
 * @order 1
 * @verified true
 *
 * @variations
 * - name: primary
 *   description: Main call-to-action
 * - name: secondary
 *   description: Secondary actions
 * - name: danger
 *   description: Destructive actions
 * - name: outline
 *   description: Bordered, transparent background
 * - name: ghost
 *   description: Minimal styling
 * - name: sm
 *   description: Small size
 * - name: lg
 *   description: Large size
 *
 * @elements
 * - name: icon
 *   description: Optional icon
 *   html: <span class="{{class}} ds-icon ds-icon--add"></span>
 * - name: label
 *   description: Button text
 *   html: <span class="{{class}}">Button</span>
 * - name: spinner
 *   description: Loading state indicator
 *   html: <span class="{{class}} ds-spinner ds-spinner--sm"></span>
 *
 * @dependencies icon, spinner
 *
 * @examples
 * - title: Primary Button
 *   code: |
 *     <button class="ds-button ds-button--primary">
 *       <span class="ds-button__label">Get Started</span>
 *     </button>
 * - title: With Icon
 *   code: |
 *     <button class="ds-button ds-button--secondary">
 *       <span class="ds-button__icon ds-icon ds-icon--download"></span>
 *       <span class="ds-button__label">Download</span>
 *     </button>
 * - title: Loading State
 *   code: |
 *     <button class="ds-button ds-button--primary" disabled>
 *       <span class="ds-button__spinner ds-spinner ds-spinner--sm"></span>
 *       <span class="ds-button__label">Saving...</span>
 *     </button>
 */

@layer components {
  .ds-button {
    /* Component tokens */
    --button-bg: var(--color-semantic-surface);
    --button-text: var(--color-semantic-text);
    --button-border: var(--color-semantic-border);
    --button-radius: var(--border-radius-md);
    --button-padding-x: var(--spacing-md);
    --button-padding-y: var(--spacing-sm);

    /* Base styles */
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--button-padding-y) var(--button-padding-x);
    background: var(--button-bg);
    color: var(--button-text);
    border: 1px solid var(--button-border);
    border-radius: var(--button-radius);
    font-family: var(--font-family-base);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      filter: brightness(0.95);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Variations */
    &--primary {
      --button-bg: var(--color-primary-500);
      --button-text: var(--color-accessibility-on-primary);
      --button-border: var(--color-primary-500);
    }

    &--secondary {
      --button-bg: var(--color-neutral-100);
      --button-text: var(--color-neutral-700);
      --button-border: var(--color-neutral-200);
    }

    &--danger {
      --button-bg: var(--color-danger-500);
      --button-text: white;
      --button-border: var(--color-danger-500);
    }

    /* Size variants */
    &--sm {
      --button-padding-x: var(--spacing-sm);
      --button-padding-y: var(--spacing-xs);
      font-size: var(--font-size-sm);
    }

    &--lg {
      --button-padding-x: var(--spacing-lg);
      --button-padding-y: var(--spacing-md);
      font-size: var(--font-size-lg);
    }
  }
}
```

## Adding to Navigation

Components are automatically grouped by their `@group` annotation. Control the order within a group with `@order`:

```scss
@group Actions
@order 1  // First in the Actions group
```

### Group Order

Configure group order in `.stylescriberc.json`:

```json
{
  "components": {
    "groupOrder": ["Actions", "Forms", "Layout", "Feedback", "Navigation"]
  }
}
```

## Class Prefix

Use `ds-` prefix in your source files. The configured prefix is applied at build time:

```json
{
  "classPrefix": "myapp-"
}
```

Source: `.ds-button` → Output: `.myapp-button`

## Additional Annotations

| Annotation | Description |
|------------|-------------|
| `@navtitle` | Short name for navigation |
| `@order` | Sort order within group |
| `@verified` | Mark as production-ready |
| `@draft` | Mark as work-in-progress |
| `@role` | ARIA role for examples |
| `@maintag` | Primary HTML tag (default: div) |
| `@classname` | Override auto-detected class name |

See [Annotations Reference](../reference/annotations.html) for complete documentation.
