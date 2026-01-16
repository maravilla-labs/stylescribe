---
title: Accessibility
navtitle: Accessibility
order: 4
---

Accessibility is a core principle of our design system. We strive to make all components usable by everyone, regardless of ability or context.

## WCAG Compliance

Our design system targets **WCAG 2.1 Level AA** compliance. This includes:

- **Perceivable** - Information must be presentable in ways users can perceive
- **Operable** - User interface components must be operable
- **Understandable** - Information and UI operation must be understandable
- **Robust** - Content must be robust enough for assistive technologies

## Color & Contrast

### Minimum Contrast Ratios

| Element Type | Ratio | Standard |
|--------------|-------|----------|
| Body text | 4.5:1 | WCAG AA |
| Large text (18px+) | 3:1 | WCAG AA |
| UI components | 3:1 | WCAG AA |
| Focus indicators | 3:1 | WCAG AA |

### Don't Rely on Color Alone

Always provide additional indicators beyond color:

```html
<!-- Good: Icon + color for status -->
<span class="alert alert--success">
    <span class="alert__icon">✓</span>
    Success! Your changes have been saved.
</span>

<!-- Avoid: Color only -->
<span style="color: green;">Saved</span>
```

## Keyboard Navigation

All interactive components support keyboard navigation:

| Component | Keys |
|-----------|------|
| Buttons | `Enter`, `Space` to activate |
| Links | `Enter` to follow |
| Menus | `Arrow keys` to navigate, `Escape` to close |
| Modals | `Tab` to cycle focus, `Escape` to close |

### Focus Management

Focus indicators are always visible:

```css
/* Our buttons have clear focus styles */
.btn:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
}
```

## Screen Reader Support

### Semantic HTML

Use proper HTML elements for their intended purpose:

```html
<!-- Good: Semantic elements -->
<nav aria-label="Main navigation">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
    </ul>
</nav>

<!-- Avoid: Non-semantic elements -->
<div class="nav">
    <div onclick="navigate('/')">Home</div>
</div>
```

### ARIA Labels

Provide context when visual meaning isn't available:

```html
<!-- Icon-only button needs a label -->
<button class="btn btn--icon" aria-label="Close dialog">
    <span class="btn__icon">×</span>
</button>

<!-- Form fields need labels -->
<label for="email">Email address</label>
<input type="email" id="email" name="email">
```

### Live Regions

Announce dynamic content changes:

```html
<div role="status" aria-live="polite">
    <!-- Content announced to screen readers -->
    Form submitted successfully!
</div>
```

## Motion & Animation

### Reduced Motion

Respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

Our components automatically respect this preference.

## Testing Tools

We recommend these tools for accessibility testing:

- **axe DevTools** - Browser extension for automated testing
- **WAVE** - Web accessibility evaluation tool
- **Lighthouse** - Built into Chrome DevTools
- **VoiceOver/NVDA** - Screen reader testing

## Checklist

Use this checklist when implementing components:

- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Links have descriptive text
- [ ] Color contrast meets standards
- [ ] Focus is visible and logical
- [ ] Keyboard navigation works
- [ ] Tested with screen reader
- [ ] Respects prefers-reduced-motion
