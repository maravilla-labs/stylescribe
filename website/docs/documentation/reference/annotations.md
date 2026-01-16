---
title: Annotations
navtitle: Annotations
slug: annotations
order: 1
---

StyleScribe uses JSDoc-style annotations in CSS/SCSS comments to generate component documentation.

## Basic Syntax

Annotations start with `@` and appear in CSS block comments:

```scss
/**
 * @title Button
 * @description A clickable button element
 * @group Actions
 */
.btn {
  /* styles */
}
```

## Required Annotations

Every component needs at minimum:

| Annotation | Description |
|------------|-------------|
| `@title` | Display name in documentation |
| `@description` | What the component does |
| `@group` | Category for navigation |

## All Annotations

### Metadata

| Annotation | Type | Description |
|------------|------|-------------|
| `@title` | string | Display name |
| `@description` | string (multiline) | Detailed description |
| `@navtitle` | string | Short name for navigation |
| `@group` | string | Category grouping |
| `@order` | number | Sort order within group |
| `@verified` | boolean | Production-ready flag |
| `@draft` | boolean | Work-in-progress flag |

### Semantic

| Annotation | Type | Description |
|------------|------|-------------|
| `@role` | string | ARIA role for examples |
| `@maintag` | string | Primary HTML tag (default: div) |
| `@classname` | string | Override auto-detected class |

### Component Structure

| Annotation | Type | Description |
|------------|------|-------------|
| `@variations` | array | Modifier classes |
| `@additional_variations` | array | Extra modifiers |
| `@elements` | array | BEM child elements |
| `@dependencies` | array | Required components |
| `@examples` | array | Code examples |

## Annotation Formats

### Simple Values

```scss
@title Button
@description A clickable button
@group Actions
@order 1
@verified true
```

### Comma-Separated Arrays

Keys ending in 's' are parsed as arrays:

```scss
@variations primary, secondary, danger, ghost
@elements icon, label, content
@dependencies icon, spinner
```

### YAML Arrays

For more detail, use YAML format:

```scss
@variations
- name: primary
  description: Main call-to-action
- name: secondary
  description: Secondary actions
- name: danger
  description: Destructive actions
```

### Elements with Custom HTML

**Why use `html:` or `pug:`?** By default, elements render as generic placeholders like `<div class="...">Icon</div>` in the "All Variations" preview section. This looks broken for components with icons. Use `html:` to define proper markup.

The `{{class}}` placeholder is replaced with the full BEM class (e.g., `ds-btn__icon` becomes `sol-btn__icon` after prefix transformation).

**Using the Icon Component (Recommended):**

If you have an icon component, use it in your element HTML:
```scss
@elements
- name: icon
  description: Button icon
  html: <span class="{{class}} ds-icon ds-icon--add"></span>
- name: label
  description: Button text
  html: <span class="{{class}}">Button</span>
```

This approach:
- Uses your existing icon component (`ds-icon`)
- Inherits color via `currentColor`
- Scales with text using `em` units
- Works with all your defined icon tokens

**Inline SVG (Alternative):**
```scss
@elements
- name: icon
  description: SVG icon
  html: <svg class="{{class}}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
- name: label
  description: Button text
  html: <span class="{{class}}">Button</span>
```

**Pug syntax** for cleaner templates:
```scss
@elements
- name: icon
  pug: span.{{class}}.ds-icon.ds-icon--add
- name: label
  pug: span.{{class}} Button
```

> **Tip:** See the [Icons Guide](/documentation/guides/icons) for how to add icon tokens to your design system.

### How Variation Previews Work

Stylescribe uses **the first `@example` as a template** for all variation previews. This preserves proper HTML nesting for complex components.

**How it works:**
1. Takes the HTML from your first `@example`
2. Removes any existing variation classes (e.g., `--open`, `--active`)
3. Adds the new variation class (e.g., `--primary`, `--scrollable`)
4. If no examples exist, falls back to flat element generation

**Example:** Given this first example:
```html
<div class="dropdown">
  <button class="dropdown__trigger">Open</button>
  <div class="dropdown__menu">
    <button class="dropdown__item">Edit</button>
    <button class="dropdown__item">Delete</button>
  </div>
</div>
```

The "scrollable" variation preview becomes:
```html
<div class="dropdown dropdown--scrollable">
  <button class="dropdown__trigger">Open</button>
  <div class="dropdown__menu">
    <button class="dropdown__item">Edit</button>
    <button class="dropdown__item">Delete</button>
  </div>
</div>
```

### Why First Example Matters (Critical for Nested Components)

**Simple components** (button, badge, input) work with flat structures. But **nested components** (dropdown, modal, tabs, accordion) require proper HTML hierarchy.

**Problem without examples:** Elements render as flat siblings:
```html
<!-- BROKEN: Menu items outside the menu! -->
<div class="dropdown dropdown--scrollable">
  <button class="dropdown__trigger">Open</button>
  <div class="dropdown__menu"></div>          <!-- Empty! -->
  <button class="dropdown__item">Edit</button> <!-- Should be inside menu -->
</div>
```

**Solution:** Structure your first `@example` correctly:
```scss
@examples
- title: Basic Menu
  code: |
    <div class="dropdown">
      <button class="dropdown__trigger">Open</button>
      <div class="dropdown__menu">
        <button class="dropdown__item">Edit</button>
        <button class="dropdown__item">Delete</button>
      </div>
    </div>
```

**Best practices for nested components:**
- First example MUST show complete nested HTML structure
- Include all key child elements in proper hierarchy
- Additional examples can show partial structures or specific states

### Elements with Custom HTML (Fallback)

When no `@examples` exist, Stylescribe falls back to flat element generation using `@elements`. Use `html:` or `pug:` to control how elements render:

**Without `html:`:**
```html
<button class="sol-btn sol-btn--primary">
  <div class="sol-btn__icon">Icon</div>      <!-- Generic fallback -->
  <div class="sol-btn__label">Label</div>    <!-- Generic fallback -->
</button>
```

**With `html:`:**
```html
<button class="sol-btn sol-btn--primary">
  <svg class="sol-btn__icon" ...>...</svg>    <!-- Proper SVG -->
  <span class="sol-btn__label">Button</span>  <!-- Proper span -->
</button>
```

> **Note:** For simple flat components, `@elements` with `html:` works well. For nested components, always provide a properly structured first `@example`.

## Examples Annotation

The `@examples` annotation is critical for:
- **Live previews** in the documentation
- **Interactive playground** for testing variations
- **Variation previews** (first example is used as template)

> **Important:** For nested components, structure your first example with complete HTML hierarchy. See "Why First Example Matters" above.

### Basic Format

```scss
@examples
- title: Default Button
  code: |
    <button class="btn">Click me</button>
```

### With Description

```scss
@examples
- title: Primary Button
  description: Use for main call-to-action
  code: |
    <button class="btn btn--primary">Submit</button>
```

### Multiple Examples

```scss
@examples
- title: Sizes
  code: |
    <button class="btn btn--sm">Small</button>
    <button class="btn">Default</button>
    <button class="btn btn--lg">Large</button>
- title: Variants
  code: |
    <button class="btn btn--primary">Primary</button>
    <button class="btn btn--secondary">Secondary</button>
```

### Full-Width Examples

```scss
@examples
- title: Card Grid
  fullWidth: true
  code: |
    <div class="grid">
      <div class="card">One</div>
      <div class="card">Two</div>
    </div>
```

## Complete Example

```scss
/**
 * @title Alert
 * @navtitle Alert
 * @description Contextual feedback messages for user actions
 * @group Communication
 * @order 2
 * @verified true
 *
 * @role alert
 * @maintag div
 *
 * @variations
 * - name: info
 *   description: Informational messages
 * - name: success
 *   description: Success confirmations
 * - name: warning
 *   description: Warning messages
 * - name: error
 *   description: Error messages
 *
 * @elements
 * - name: icon
 *   description: Status icon
 *   html: <span class="{{class}}">ℹ</span>
 * - name: content
 *   description: Message text
 *   html: <span class="{{class}}">Alert message</span>
 * - name: close
 *   description: Dismiss button
 *   html: <button class="{{class}}">&times;</button>
 *
 * @dependencies icon, button
 *
 * @examples
 * - title: Info Alert
 *   code: |
 *     <div class="alert alert--info">
 *       <span class="alert__content">This is an informational message.</span>
 *     </div>
 * - title: With Close Button
 *   code: |
 *     <div class="alert alert--success">
 *       <span class="alert__content">Action completed successfully!</span>
 *       <button class="alert__close">&times;</button>
 *     </div>
 */
.alert {
  /* Component tokens */
  --alert-bg: var(--color-semantic-surface);
  --alert-text: var(--color-semantic-text);
  --alert-border: var(--color-semantic-border);
  --alert-padding: var(--spacing-md);
  --alert-radius: var(--border-radius-md);

  /* Base styles */
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--alert-padding);
  background: var(--alert-bg);
  color: var(--alert-text);
  border: 1px solid var(--alert-border);
  border-radius: var(--alert-radius);

  /* Variants */
  &--info {
    --alert-bg: var(--color-info-50);
    --alert-text: var(--color-info-700);
    --alert-border: var(--color-info-200);
  }

  &--success {
    --alert-bg: var(--color-success-50);
    --alert-text: var(--color-success-700);
    --alert-border: var(--color-success-200);
  }
}

.alert__content {
  flex: 1;
}

.alert__close {
  /* close button styles */
}
```

## Parsing Rules

1. **Single values**: `@key value` assigns string
2. **Arrays**: Keys ending in 's' parse as comma-separated lists
3. **YAML**: Indented content after `@key` is parsed as YAML
4. **Multiline**: `@description` captures all text until next annotation
5. **CSS Variables**: Automatically extracted as `cssVars`

## Debugging

Run the build to see parsed annotations:

```bash
stylescribe build
cat build/components.json | jq '.components[0]'
```

Each component's JSON includes all parsed annotations plus:
- `cssVars`: Array of CSS custom properties used
- `file`: Source file path
- `css`: Compiled CSS
