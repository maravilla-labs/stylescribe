---
title: Design Guidelines
navtitle: Guidelines
order: 3
---

This guide outlines best practices and guidelines for using the design system effectively.

## Naming Conventions

### BEM Methodology

We follow the BEM (Block, Element, Modifier) naming convention:

```css
/* Block */
.card { }

/* Element (double underscore) */
.card__title { }
.card__body { }

/* Modifier (double dash) */
.card--featured { }
.card--compact { }
```

### Token Naming

Design tokens follow a hierarchical naming pattern:

```
--{category}-{property}-{variant}

Examples:
--color-primary
--color-text-secondary
--spacing-md
--border-radius-lg
```

## Component Guidelines

### Do's

- **Use semantic HTML** - Choose appropriate elements (`<button>`, `<nav>`, `<article>`)
- **Apply design tokens** - Use `var(--token-name)` instead of hard-coded values
- **Follow BEM naming** - Maintain consistency with the naming convention
- **Keep specificity low** - Avoid nesting selectors deeply
- **Consider accessibility** - Include proper ARIA attributes and focus states

### Don'ts

- **Don't override component internals** - Work with the public API (modifiers)
- **Don't use `!important`** - It makes styles difficult to override
- **Don't mix naming conventions** - Stick to BEM throughout
- **Don't hard-code colors/spacing** - Always use design tokens
- **Don't forget hover/focus states** - Interactive elements need visual feedback

## CSS Best Practices

### Use Custom Properties

```css
/* Good */
.component {
    padding: var(--spacing-md);
    color: var(--color-text);
}

/* Avoid */
.component {
    padding: 16px;
    color: #333333;
}
```

### Prefer Composition

Build complex components by combining simpler ones:

```html
<!-- Compose components together -->
<div class="card card--featured">
    <div class="card__body">
        <button class="btn btn--primary btn--sm">
            Action
        </button>
    </div>
</div>
```

### Responsive Design

Use CSS custom properties for responsive breakpoints:

```css
.component {
    padding: var(--spacing-sm);
}

@media (min-width: 768px) {
    .component {
        padding: var(--spacing-md);
    }
}

@media (min-width: 1024px) {
    .component {
        padding: var(--spacing-lg);
    }
}
```

## Accessibility Checklist

- [ ] Color contrast meets WCAG AA standards (4.5:1 for text)
- [ ] Interactive elements have visible focus indicators
- [ ] Form inputs have associated labels
- [ ] Images have meaningful alt text
- [ ] Page structure uses proper heading hierarchy
- [ ] Touch targets are at least 44x44 pixels

## Version Compatibility

When updating the design system:

1. Check the changelog for breaking changes
2. Update your override styles if needed
3. Test in all supported browsers
4. Verify accessibility requirements
