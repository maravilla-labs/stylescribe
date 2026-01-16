---
title: Design Tokens
template: tokens
description: Visual reference for all design tokens in our system
navtitle: Tokens
order: 20
---

Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes. We use them in place of hard-coded values to ensure flexibility and consistency.

## How to Use Tokens

Reference tokens in your CSS using CSS custom properties:

```css
.my-component {
  color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
}
```

## Token Categories

Our design system includes the following token categories:

- **Colors** - Brand colors, semantic colors, and neutral palette
- **Spacing** - Consistent spacing scale for margins and padding
- **Typography** - Font families, sizes, and weights
- **Borders** - Border radius values for consistent rounding
- **Shadows** - Elevation and depth through box shadows
- **Transitions** - Duration values for animations
