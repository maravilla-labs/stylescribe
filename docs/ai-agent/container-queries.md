# Container Queries Guide

Container queries allow components to adapt based on their container size rather than the viewport. This is essential for truly reusable components in modern design systems.

## When to Use Container Queries

| Use Case | Recommendation |
|----------|----------------|
| Component internal layout changes | `@container` |
| Page-level layout changes | `@media` |
| Component in different contexts (sidebar vs main) | `@container` |
| Global breakpoints (mobile/desktop nav) | `@media` |
| Card layout switching | `@container` |

**Rule of thumb:** If the layout change depends on where the component is placed, use `@container`. If it depends on the device/viewport, use `@media`.

---

## Basic Syntax

### 1. Define a Container

```scss
.ds-card {
  // Create a container context
  container-type: inline-size;
  container-name: card;

  // Rest of styles...
}
```

### 2. Query the Container

```scss
.ds-card {
  container-type: inline-size;
  container-name: card;

  &__layout {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);

    // When card container is at least 400px wide
    @container card (min-width: 400px) {
      flex-direction: row;
    }

    // When card container is at least 600px wide
    @container card (min-width: 600px) {
      gap: var(--space-6);
    }
  }
}
```

---

## Container Types

### `inline-size`
Most common. Enables queries based on the container's width.

```scss
.wrapper {
  container-type: inline-size;
}
```

### `size`
Enables queries based on both width and height.

```scss
.wrapper {
  container-type: size;
}

@container (min-width: 400px) and (min-height: 300px) {
  // ...
}
```

### `normal`
Default. No containment (cannot query this container).

---

## Practical Examples

### Responsive Card

```scss
/**
 * @title Card
 * @description Responsive card component
 * @group Containment
 */

.ds-card {
  container-type: inline-size;
  container-name: card;

  --card-padding: var(--space-4);
  --card-gap: var(--space-3);

  display: flex;
  flex-direction: column;
  padding: var(--card-padding);
  gap: var(--card-gap);
  background: var(--color-surface);
  border-radius: var(--radius-md);

  &__media {
    aspect-ratio: 16 / 9;
    border-radius: var(--radius-sm);
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  // Horizontal layout when card is wide enough
  @container card (min-width: 480px) {
    flex-direction: row;
    --card-gap: var(--space-4);

    .ds-card__media {
      flex: 0 0 200px;
      aspect-ratio: 1;
    }

    .ds-card__content {
      flex: 1;
    }
  }
}
```

### Responsive Navigation

```scss
.ds-nav {
  container-type: inline-size;
  container-name: nav;

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  &__item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
  }

  &__label {
    // Hidden by default in narrow containers
    display: none;
  }

  // When nav container is wide enough, show labels
  @container nav (min-width: 200px) {
    .ds-nav__list {
      flex-direction: column;
    }

    .ds-nav__label {
      display: block;
    }
  }

  // Horizontal layout for very wide containers
  @container nav (min-width: 600px) {
    .ds-nav__list {
      flex-direction: row;
    }
  }
}
```

### Responsive Grid

```scss
.ds-grid {
  container-type: inline-size;
  container-name: grid;

  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;

  @container grid (min-width: 400px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @container grid (min-width: 700px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @container grid (min-width: 1000px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## Container Query Units

Use container-relative units for fluid sizing:

| Unit | Description |
|------|-------------|
| `cqw` | 1% of container width |
| `cqh` | 1% of container height |
| `cqi` | 1% of container inline size |
| `cqb` | 1% of container block size |
| `cqmin` | Smaller of cqi or cqb |
| `cqmax` | Larger of cqi or cqb |

### Example: Fluid Typography

```scss
.ds-card {
  container-type: inline-size;

  &__title {
    // Font size scales with container width
    // Minimum 1rem, maximum 2rem, fluid in between
    font-size: clamp(1rem, 5cqi, 2rem);
  }
}
```

---

## Named vs Anonymous Containers

### Named Container (Recommended)

```scss
.wrapper {
  container-type: inline-size;
  container-name: wrapper;
}

@container wrapper (min-width: 400px) {
  // Only matches containers named "wrapper"
}
```

### Anonymous Container

```scss
.wrapper {
  container-type: inline-size;
}

@container (min-width: 400px) {
  // Matches nearest ancestor container
}
```

**Recommendation:** Always name containers to avoid unexpected matches.

---

## Combining with Token-Driven Pattern

Container queries work well with component tokens:

```scss
.ds-hero {
  container-type: inline-size;
  container-name: hero;

  // Component tokens with responsive defaults
  --hero-padding: var(--space-6);
  --hero-gap: var(--space-4);
  --hero-title-size: var(--font-size-2xl);

  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--hero-padding);
  gap: var(--hero-gap);

  &__title {
    font-size: var(--hero-title-size);
  }

  // Update tokens based on container size
  @container hero (min-width: 600px) {
    --hero-padding: var(--space-8);
    --hero-gap: var(--space-6);
    --hero-title-size: var(--font-size-4xl);

    flex-direction: row;
    text-align: left;
  }

  @container hero (min-width: 900px) {
    --hero-padding: var(--space-12);
    --hero-gap: var(--space-8);
    --hero-title-size: var(--font-size-5xl);
  }
}
```

---

## Best Practices

1. **Name your containers** - Prevents unexpected query matches
2. **Use `inline-size`** - Most common, least side effects
3. **Place container on wrapper** - Not the element being styled
4. **Combine with component tokens** - Update tokens, not properties
5. **Start mobile-first** - Base styles for smallest container
6. **Test in different contexts** - Sidebar, main content, modals
7. **Don't nest container queries deeply** - Keep it simple

---

## Browser Support

Container queries are supported in all modern browsers:
- Chrome 105+
- Firefox 110+
- Safari 16+

For older browsers, the base (non-queried) styles apply as fallback.

---

## Example: Complete Component

```scss
/**
 * @title Profile Card
 * @description User profile card that adapts to container width
 * @group Identity
 */

.ds-profile-card {
  container-type: inline-size;
  container-name: profile-card;

  // Component tokens
  --profile-padding: var(--space-4);
  --profile-gap: var(--space-3);
  --profile-avatar-size: 64px;
  --profile-direction: column;
  --profile-align: center;
  --profile-text-align: center;

  display: flex;
  flex-direction: var(--profile-direction);
  align-items: var(--profile-align);
  gap: var(--profile-gap);
  padding: var(--profile-padding);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  text-align: var(--profile-text-align);

  &__avatar {
    width: var(--profile-avatar-size);
    height: var(--profile-avatar-size);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  &__name {
    font-weight: var(--font-weight-semibold);
  }

  &__role {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  // Horizontal layout for wider containers
  @container profile-card (min-width: 300px) {
    --profile-direction: row;
    --profile-align: flex-start;
    --profile-text-align: left;
  }

  // Larger avatar for even wider containers
  @container profile-card (min-width: 400px) {
    --profile-avatar-size: 80px;
    --profile-padding: var(--space-6);
    --profile-gap: var(--space-4);
  }
}
```
