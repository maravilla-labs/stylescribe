# Component Annotations Reference

Stylescribe uses JSDoc-style comment annotations to generate documentation from SCSS/CSS files. This guide covers all available annotations and their syntax.

## Basic Syntax

Annotations are placed in a comment block at the top of a component file.

**IMPORTANT:** Always use `ds-` prefix for class names in source files. The configured prefix is applied at build time.

```scss
/**
 * @title Button
 * @description Primary interactive element for actions
 * @group Actions
 * @order 1
 */
.ds-button {
  // styles - always use ds- prefix!
}
```

## Core Annotations

### @title
**Required.** The display name of the component.

```scss
@title Button
@title Card Container
```

### @description
A brief description of the component's purpose and usage.

```scss
@description Primary interactive element for user actions and form submissions.
```

### @group
Category for organizing components in navigation. Components with the same group are displayed together.

```scss
@group Actions
@group Containment
@group Communication
```

Configure group order in `.stylescriberc.json`:
```json
{
  "components": {
    "groupOrder": ["Actions", "Containment", "Communication"]
  }
}
```

### @order
Numeric order within the group (lower = first).

```scss
@order 1
```

---

## Variations (Array Syntax)

### @variations
Define component variations/modifiers. Keys ending in 's' are parsed as arrays.

**Simple syntax** (comma-separated):
```scss
@variations primary, secondary, success, warning, danger
```

**YAML-style syntax** (detailed):
```scss
@variations
- name: primary
  description: Main action button
  example: |
    <button class="btn btn--primary">Primary</button>
- name: secondary
  description: Secondary actions
  example: |
    <button class="btn btn--secondary">Secondary</button>
- name: outline
  description: Ghost/outline style
  example: |
    <button class="btn btn--outline">Outline</button>
```

Each variation object can have:
- `name` - Variation identifier (required)
- `description` - What this variation is for
- `example` - HTML example (use `|` for multi-line)

---

## Elements (BEM)

### @elements
Define component sub-elements (BEM elements). Elements are automatically rendered in the "All Variations" preview section.

**Simple syntax**:
```scss
@elements icon, label, content
```

**YAML-style syntax** (with descriptions):
```scss
@elements
- name: icon
  description: Leading icon container
- name: label
  description: Button text
- name: content
  description: Main content area
```

### Custom Element Rendering with `html:` or `pug:`

**IMPORTANT:** By default, elements render as `<div class="...">ElementName</div>` in variation previews. For proper icon rendering, use `html:` or `pug:` to define custom markup.

The `{{class}}` placeholder is replaced with the full BEM class (e.g., `ds-button__icon`).

**With `html:`** - for icons and custom markup:
```scss
@elements
- name: icon
  description: Leading icon using mask-image
  html: <span class="{{class}} ds-icon ds-icon--add"></span>
- name: label
  description: Button text
  html: <span class="{{class}}">Button</span>
- name: spinner
  description: Loading spinner
  html: <span class="{{class}} ds-icon ds-icon--loader ds-icon--spin"></span>
```

**With `pug:`** - cleaner syntax alternative:
```scss
@elements
- name: icon
  description: SVG icon
  pug: span.{{class}}.ds-icon.ds-icon--add
- name: label
  pug: span.{{class}} Button
```

### How Variation Previews Work

When Stylescribe generates the "All Variations" preview for each `@variation`, it:

1. Creates wrapper element using `@maintag` (or `div` by default)
2. Adds classes: `ds-component ds-component--{variation}`
3. Loops through ALL `@elements` and renders each one inside
4. Uses `html:`/`pug:` config if provided, otherwise renders fallback text

**Example:** Given `@variations primary, secondary` and the elements above:

```html
<!-- primary variation preview -->
<button class="ds-btn ds-btn--primary">
  <span class="ds-btn__icon ds-icon ds-icon--add"></span>
  <span class="ds-btn__label">Button</span>
</button>

<!-- secondary variation preview -->
<button class="ds-btn ds-btn--secondary">
  <span class="ds-btn__icon ds-icon ds-icon--add"></span>
  <span class="ds-btn__label">Button</span>
</button>
```

**When to use `html:`/`pug:`:**
- Icons (SVG tokens with mask-image technique)
- Elements with nested HTML structure
- Custom placeholder content for previews
- Any element that needs more than plain text in variation previews

---

## Examples

### @examples
Define live HTML examples for the documentation.

**CRITICAL: Use YAML list format with `title` and `code` keys. Do NOT put raw HTML directly after @examples.**

```scss
// ✅ CORRECT - YAML list format with title and code
@examples
- title: Basic Button
  description: Standard button usage
  code: |
    <button class="ds-btn">Click me</button>
- title: With Icon
  description: Button with leading icon
  code: |
    <button class="ds-btn ds-btn--primary">
      <span class="ds-btn__icon">+</span>
      <span class="ds-btn__label">Add Item</span>
    </button>
```

```scss
// ❌ WRONG - Raw HTML without YAML structure
@examples
<button class="ds-btn">Click me</button>

// ❌ WRONG - Multiple @examples annotations
@examples
<button class="ds-btn">One</button>
@examples
<button class="ds-btn">Two</button>
```

**Required YAML structure for each example:**
- `title` - Example name **(REQUIRED)**
- `description` - Explanation of the example (optional)
- `code` - HTML code **(REQUIRED)** - use `|` for multi-line
- `height` - Explicit height for preview iframe (optional, e.g., "400px", "auto")

**Multi-line code example:**
```scss
@examples
- title: Card with Actions
  description: Full card with header and footer
  code: |
    <div class="ds-card">
      <div class="ds-card__header">Title</div>
      <div class="ds-card__body">Content here</div>
      <div class="ds-card__footer">
        <button class="ds-btn">Action</button>
      </div>
    </div>
```

**Explicit height for viewport-based components:**

For components that use `min-height: 100vh` or similar viewport units (like auth layouts, modals, or full-page layouts), set an explicit height to prevent the preview iframe from being too tall:

```scss
@examples
- title: Auth Layout
  description: Full-page login layout
  height: 500px
  code: |
    <div class="ds-auth-layout ds-auth-layout--centered">
      <div class="ds-auth-layout__content">...</div>
    </div>
```

Use `height: auto` to allow unlimited auto-resize (no 600px cap).

---

## Additional Annotations

### @dependencies
List other components this component depends on (uses in examples or requires).

```scss
@dependencies button, icon
@dependencies card
```

When your component's examples include other components (like buttons in a hero), declare them:

```scss
/**
 * @title Hero
 * @dependencies button
 * @examples
 * - title: Hero with CTA
 *   code: |
 *     <div class="ds-hero">
 *       <button class="ds-btn ds-btn--primary">Get Started</button>
 *     </div>
 */
```

### @deprecated
Mark a component as deprecated.

```scss
@deprecated Use Button instead
```

### @see
Reference related components or documentation.

```scss
@see ButtonGroup
@see https://design-system.example.com/buttons
```

### @since
Version when the component was introduced.

```scss
@since 1.0.0
```

### @status
Component development status.

```scss
@status stable
@status experimental
@status deprecated
```

---

## Reserved Keys

The following key is automatically populated and cannot be used as annotations:

- `cssVars` - Automatically extracted CSS custom properties used in the component

---

## Complete Example

**Note:** Always use `ds-` prefix in source SCSS. HTML examples in annotations should use the prefix that will be in the compiled output (configured via `classPrefix`).

```scss
/**
 * @title Alert
 * @description Contextual feedback messages for user actions
 * @group Communication
 * @order 2
 * @status stable
 * @since 1.0.0
 *
 * @variations
 * - name: info
 *   description: Informational messages
 *   example: |
 *     <div class="ds-alert ds-alert--info">
 *       <span class="ds-alert__icon">i</span>
 *       <p class="ds-alert__content">This is an info alert.</p>
 *     </div>
 * - name: success
 *   description: Success/confirmation messages
 *   example: |
 *     <div class="ds-alert ds-alert--success">
 *       <span class="ds-alert__icon">✓</span>
 *       <p class="ds-alert__content">Action completed successfully.</p>
 *     </div>
 * - name: warning
 *   description: Warning messages
 * - name: danger
 *   description: Error messages
 *
 * @elements
 * - name: icon
 *   description: Status icon
 * - name: content
 *   description: Alert message text
 * - name: close
 *   description: Dismiss button
 *
 * @examples
 * - title: Dismissible Alert
 *   description: Alert with close button
 *   code: |
 *     <div class="ds-alert ds-alert--info">
 *       <span class="ds-alert__icon">i</span>
 *       <p class="ds-alert__content">Click the X to dismiss.</p>
 *       <button class="ds-alert__close">&times;</button>
 *     </div>
 */

.ds-alert {
  --alert-bg: var(--color-surface);
  --alert-border: var(--color-border);
  --alert-text: var(--color-text);

  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--alert-bg);
  border: 1px solid var(--alert-border);
  color: var(--alert-text);

  &__icon {
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    margin: 0;
  }

  &__close {
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
  }

  // Variations - only override tokens
  &--info {
    --alert-bg: var(--color-info-subtle);
    --alert-border: var(--color-info);
    --alert-text: var(--color-info-text);
  }

  &--success {
    --alert-bg: var(--color-success-subtle);
    --alert-border: var(--color-success);
    --alert-text: var(--color-success-text);
  }

  &--warning {
    --alert-bg: var(--color-warning-subtle);
    --alert-border: var(--color-warning);
    --alert-text: var(--color-warning-text);
  }

  &--danger {
    --alert-bg: var(--color-danger-subtle);
    --alert-border: var(--color-danger);
    --alert-text: var(--color-danger-text);
  }
}
```

---

## Best Practices

1. **Always use `ds-` prefix** - Source files always use `ds-`, compiled output uses configured prefix
2. **Always include @title and @group** - Required for proper navigation
3. **Use YAML syntax for complex data** - Better readability for variations/examples
4. **Provide meaningful examples** - Show real-world usage patterns
5. **Document token dependencies** - Note which design tokens the component uses
6. **Keep descriptions concise** - One sentence for description, details in examples
7. **Use consistent naming** - Follow BEM conventions for elements
8. **NO inline fallbacks** - Reference tokens directly: `var(--token)` NOT `var(--token, fallback)`
9. **Component tokens in JSON** - Define customizable defaults in `tokens/components/*.json`
