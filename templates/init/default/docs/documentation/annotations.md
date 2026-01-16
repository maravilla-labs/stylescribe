---
title: Component Annotations
navtitle: Annotations
order: 5
---

Stylescribe uses JSDoc-style annotations to document your components. These annotations are parsed from your SCSS/CSS files to generate interactive documentation.

## Basic Structure

Annotations are placed in a comment block at the top of your component file:

```scss
/**
 * @title Button
 * @description A versatile button component for user interactions.
 * @group Actions
 * @order 1
 */
.ds-button {
  // Your component styles...
}
```

## Core Annotations

### @title (required)

The display name of the component.

```scss
/**
 * @title Primary Button
 */
```

### @description

A detailed description of the component. Multi-line descriptions continue on subsequent lines.

```scss
/**
 * @description A versatile button component for user interactions.
 *   Supports multiple visual styles and sizes for different contexts.
 */
```

### @navtitle

The name shown in navigation (shorter than title if needed).

```scss
/**
 * @title Primary Action Button
 * @navtitle Button
 */
```

### @group

The category for organizing components. Components with the same group are displayed together.

```scss
/**
 * @group Actions
 */
```

Common groups:
- **Actions** - Buttons, links, interactive elements
- **Containment** - Cards, panels, modals
- **Communication** - Alerts, badges, toasts
- **Navigation** - Menus, tabs, breadcrumbs
- **Forms** - Inputs, selects, checkboxes

### @order

Numeric order within the group (lower numbers appear first).

```scss
/**
 * @order 1
 */
```

## Status Annotations

### @verified

Marks a component as production-ready. Displays a "Verified" badge.

```scss
/**
 * @verified true
 */
```

### @draft

Marks a component as work-in-progress. Displays a "Draft" badge.

```scss
/**
 * @draft true
 */
```

## Accessibility Annotations

### @role

The ARIA role of the component for screen readers.

```scss
/**
 * @role button
 */
```

### @maintag

The primary HTML element that should be used.

```scss
/**
 * @maintag button
 */
```

## Structure Annotations

### @variations

Primary variants of the component (displayed as tabs in docs).

```scss
/**
 * @variations primary, secondary, outline, danger
 */
```

### @additional_variations

Additional modifiers like sizes (displayed separately).

```scss
/**
 * @additional_variations sm, lg, block, loading
 */
```

### @elements

BEM elements within the component.

```scss
/**
 * @elements icon, label, spinner
 */
```

## Composition Annotations

### @dependencies

Other components this component depends on. Creates links in the documentation.

```scss
/**
 * @title Chat Window
 * @dependencies chat-bubble, chat-input, avatar, badge
 */
```

This annotation is powerful for showing how components compose together to build complex interfaces.

## Examples Annotation

### @examples

Live code examples for the documentation. Each example has a title, optional description, and code.

> **ℹ️ Class Prefix**
>
> Always use `ds-` as the class prefix throughout your SCSS files and examples. Stylescribe automatically transforms `ds-` to your configured `classPrefix` during documentation generation.

**Example:**

```scss
/**
 * @examples
 * - title: Primary Button
 *   code: <button class="ds-button ds-button--primary">Click me</button>
 * - title: Button with Icon
 *   code: |
 *     <button class="ds-button ds-button--primary">
 *       <svg class="ds-button__icon">...</svg>
 *       <span class="ds-button__label">Favorite</span>
 *     </button>
 */
```

**Tips for examples:**
- Use `ds-` prefix consistently in both SCSS selectors and example HTML
- Use `|` for multi-line code blocks
- Keep examples focused on one concept each
- Include common use cases
- Use proper SVG icons instead of emoji or text placeholders

## Complete Example

Here's a fully annotated component:

```scss
/**
 * @title Button
 * @description A versatile button component for user interactions.
 *   Supports multiple visual styles and sizes for different contexts.
 * @navtitle Button
 * @group Actions
 * @order 1
 * @verified true
 * @role button
 * @maintag button
 * @variations primary, secondary, outline, danger
 * @additional_variations sm, lg, block, loading
 * @elements icon, label, spinner
 * @examples
 * - title: Primary Button
 *   description: The main call-to-action button style
 *   code: <button class="ds-button ds-button--primary"><span class="ds-button__label">Click me</span></button>
 * - title: Loading State
 *   description: Shows progress during async operations
 *   code: |
 *     <button class="ds-button ds-button--primary ds-button--loading" disabled>
 *       <span class="ds-button__spinner"></span>
 *       <span class="ds-button__label">Processing...</span>
 *     </button>
 */

// Note: Use ds- in SCSS selectors, but ds- in @examples code
.ds-button {
  display: inline-flex;
  align-items: center;
  // ... styles
}
```

## Design Tokens in Examples

The documentation automatically detects CSS custom properties used in your components. Reference tokens with `var(--token-name)`:

```scss
.ds-button {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
}
```

These will be shown in the component's "Design Tokens" section.
