# Programmable Design Token Functions

Stylescribe provides **46 built-in functions** that transform design token values at build time. Create entire color scales from a single brand color, generate fluid typography with CSS `clamp()`, and ensure accessibility compliance automatically.

## Table of Contents

- [How Functions Work](#how-functions-work)
- [Color Functions (15)](#color-functions)
- [Accessibility Functions (8)](#accessibility-functions)
- [Typography Functions (8)](#typography-functions)
- [Math Functions (15)](#math-functions)
- [Advanced Patterns](#advanced-patterns)

---

## How Functions Work

Functions are evaluated at build time, transforming dynamic expressions into static CSS values:

```json
{
  "primary-light": { "$value": "tint({color.brand}, 80%)" }
}
```

**Output:**
```css
--primary-light: #d0e2fd;
```

### Function Syntax

```
functionName(arg1, arg2, ...)
```

**With token references:**
```json
"color-light": { "$value": "tint({color.primary}, 50%)" }
```

**Nested functions:**
```json
"accessible-link": { "$value": "ensureContrast(shade({color.brand}, 20%), {color.background}, 4.5)" }
```

**Object arguments:**
```json
"adjusted": { "$value": "adjust({color.brand}, { l: 10, c: -5, h: 30 })" }
```

### Token References

Reference other tokens using `{path.to.token}`:

```json
{
  "color": {
    "brand": { "$value": "#6366f1" },
    "primary-light": { "$value": "tint({color.brand}, 80%)" }
  }
}
```

---

## Color Functions

All color functions use **OKLCH color space** for perceptually uniform results. Colors are automatically converted to hex for CSS output.

### tint(color, amount)

Lightens a color by mixing with white in OKLCH space.

| Parameter | Type | Description |
|-----------|------|-------------|
| `color` | string | Any valid color (hex, rgb, hsl, oklch) |
| `amount` | string | Percentage 0-100% |

```json
{
  "primary-50": { "$value": "tint({color.brand}, 95%)" },
  "primary-100": { "$value": "tint({color.brand}, 80%)" },
  "primary-200": { "$value": "tint({color.brand}, 60%)" }
}
```

### shade(color, amount)

Darkens a color while preserving hue in OKLCH space.

| Parameter | Type | Description |
|-----------|------|-------------|
| `color` | string | Any valid color |
| `amount` | string | Percentage 0-100% |

```json
{
  "primary-600": { "$value": "shade({color.brand}, 20%)" },
  "primary-700": { "$value": "shade({color.brand}, 40%)" },
  "primary-900": { "$value": "shade({color.brand}, 80%)" }
}
```

### mix(color1, color2, ratio)

Blends two colors in OKLCH space.

| Parameter | Type | Description |
|-----------|------|-------------|
| `color1` | string | First color |
| `color2` | string | Second color |
| `ratio` | string | Mix ratio 0-1 (0 = color1, 1 = color2) |

```json
{
  "purple": { "$value": "mix(#ff0000, #0000ff, 0.5)" },
  "warm-gray": { "$value": "mix({color.neutral.500}, {color.warning}, 0.1)" }
}
```

### adjust(color, adjustments)

Fine-tune color properties in OKLCH space.

| Parameter | Type | Description |
|-----------|------|-------------|
| `color` | string | Base color |
| `adjustments` | object | `{ l: lightness, c: chroma, h: hue }` (additive) |

```json
{
  "vibrant": { "$value": "adjust({color.brand}, { l: 5, c: 10 })" },
  "warmer": { "$value": "adjust({color.brand}, { h: -15 })" }
}
```

Adjustments are additive: `l` is 0-100, `c` is 0-100, `h` is degrees.

### alpha(color, opacity)

Sets color transparency.

| Parameter | Type | Description |
|-----------|------|-------------|
| `color` | string | Base color |
| `opacity` | string | Alpha value 0-1 or percentage |

```json
{
  "overlay-light": { "$value": "alpha({color.neutral.900}, 0.1)" },
  "overlay-medium": { "$value": "alpha({color.neutral.900}, 50%)" }
}
```

**Output:** `rgba(33, 37, 41, 0.1)`

### complement(color)

Returns the complementary color (180 hue rotation).

```json
{
  "accent": { "$value": "complement({color.brand})" }
}
```

### saturate(color, amount)

Increases color saturation (chroma).

| Parameter | Type | Description |
|-----------|------|-------------|
| `color` | string | Base color |
| `amount` | string | Percentage 0-100% |

```json
{
  "vivid-primary": { "$value": "saturate({color.brand}, 30%)" }
}
```

### desaturate(color, amount)

Decreases color saturation (chroma).

```json
{
  "muted-primary": { "$value": "desaturate({color.brand}, 50%)" },
  "disabled": { "$value": "desaturate({color.primary}, 80%)" }
}
```

### invert(color)

Inverts lightness while preserving hue.

```json
{
  "inverted-bg": { "$value": "invert({color.background})" }
}
```

### grayscale(color)

Converts to grayscale (zero chroma).

```json
{
  "disabled-text": { "$value": "grayscale({color.primary})" }
}
```

### darkMode(color, options?)

Auto-generates dark mode variant. Light colors become dark, dark colors become light.

| Parameter | Type | Description |
|-----------|------|-------------|
| `color` | string | Light mode color |
| `options` | object | Optional: `{ preserveHue: true, chromaAdjust: -10 }` |

```json
{
  "dark": {
    "surface": { "$value": "darkMode({color.surface})" },
    "text": { "$value": "darkMode({color.text})" }
  }
}
```

### colorScale(baseColor, steps?)

Generates a complete color scale (like Radix or Tailwind).

| Parameter | Type | Description |
|-----------|------|-------------|
| `baseColor` | string | Base color for scale |
| `steps` | number | Number of steps (default: 12) |

```json
{
  "scale": { "$value": "colorScale({color.brand}, 12)" }
}
```

**Returns:** `{ step1, step2, ..., step12 }`

### lighten(color, amount)

Increases lightness by percentage (additive).

```json
{
  "lighter": { "$value": "lighten({color.brand}, 20%)" }
}
```

### darken(color, amount)

Decreases lightness by percentage (additive).

```json
{
  "darker": { "$value": "darken({color.brand}, 20%)" }
}
```

### hueRotate(color, degrees)

Rotates hue by degrees.

| Parameter | Type | Description |
|-----------|------|-------------|
| `color` | string | Base color |
| `degrees` | number | Degrees to rotate (-360 to 360) |

```json
{
  "analogous-1": { "$value": "hueRotate({color.brand}, 30)" },
  "analogous-2": { "$value": "hueRotate({color.brand}, -30)" }
}
```

---

## Accessibility Functions

Ensure WCAG compliance automatically.

### contrastRatio(foreground, background)

Calculates WCAG contrast ratio between two colors.

| Parameter | Type | Description |
|-----------|------|-------------|
| `foreground` | string | Text/foreground color |
| `background` | string | Background color |

**Returns:** Number from 1 to 21

```json
{
  "link-contrast": { "$value": "contrastRatio({color.link}, {color.background})" }
}
```

### meetsContrast(foreground, background, level)

Checks if colors meet WCAG contrast requirements.

| Parameter | Type | Description |
|-----------|------|-------------|
| `foreground` | string | Text color |
| `background` | string | Background color |
| `level` | string | `"AA"` (4.5:1) or `"AAA"` (7:1) |

**Returns:** `"true"` or `"false"`

```json
{
  "passes-aa": { "$value": "meetsContrast({color.text}, {color.background}, AA)" }
}
```

### accessibleText(background, preferLight?)

**Killer Feature:** Returns black or white based on which has better contrast with the background.

| Parameter | Type | Description |
|-----------|------|-------------|
| `background` | string | Background color |
| `preferLight` | string | Optional: `"true"` to prefer white when equal |

```json
{
  "on-primary": { "$value": "accessibleText({color.primary})" },
  "on-warning": { "$value": "accessibleText({color.warning})" },
  "on-success": { "$value": "accessibleText({color.success})" }
}
```

For blue (#0d6efd) returns white. For yellow (#ffc107) returns black.

### ensureContrast(color, against, minContrast?)

Adjusts color lightness to meet minimum contrast ratio.

| Parameter | Type | Description |
|-----------|------|-------------|
| `color` | string | Color to adjust |
| `against` | string | Reference color |
| `minContrast` | number | Minimum ratio (default: 4.5) |

```json
{
  "safe-link": { "$value": "ensureContrast({color.primary}, {color.background}, 4.5)" }
}
```

### luminance(color)

Returns relative luminance (0-1).

```json
{
  "bg-luminance": { "$value": "luminance({color.background})" }
}
```

### isLight(color)

Returns `"true"` if luminance > 0.5.

```json
{
  "bg-is-light": { "$value": "isLight({color.background})" }
}
```

### isDark(color)

Returns `"true"` if luminance <= 0.5.

```json
{
  "bg-is-dark": { "$value": "isDark({color.background})" }
}
```

### accessiblePair(baseColor, level?)

Returns an accessible background + text color pair.

| Parameter | Type | Description |
|-----------|------|-------------|
| `baseColor` | string | Base color |
| `level` | string | `"AA"` or `"AAA"` (default: AA) |

**Returns:** `{ background, text }`

```json
{
  "pair": { "$value": "accessiblePair({color.brand}, AA)" }
}
```

---

## Typography Functions

### fluidType(minSize, maxSize, minViewport?, maxViewport?)

**Killer Feature:** Generates CSS `clamp()` for fluid responsive typography.

| Parameter | Type | Description |
|-----------|------|-------------|
| `minSize` | string | Minimum font size |
| `maxSize` | string | Maximum font size |
| `minViewport` | string | Min viewport (default: `"320px"`) |
| `maxViewport` | string | Max viewport (default: `"1280px"`) |

```json
{
  "font-size": {
    "base": { "$value": "fluidType(1rem, 1.125rem)" },
    "heading-1": { "$value": "fluidType(2rem, 4rem)" },
    "hero": { "$value": "fluidType(3rem, 6rem, 375px, 1440px)" }
  }
}
```

**Output:**
```css
--font-size-heading-1: clamp(2rem, 2.0833vw + 1.5833rem, 4rem);
```

The font scales smoothly between viewport sizes with no media queries needed.

### modularScale(base, step, ratio)

Calculates size using modular scale.

| Parameter | Type | Description |
|-----------|------|-------------|
| `base` | string | Base size |
| `step` | number | Scale step (can be negative) |
| `ratio` | string/number | Scale ratio name or number |

**Available ratios:**
- `minorSecond` (1.067)
- `majorSecond` (1.125)
- `minorThird` (1.2)
- `majorThird` (1.25)
- `perfectFourth` (1.333)
- `augmentedFourth` (1.414)
- `perfectFifth` (1.5)
- `goldenRatio` (1.618)
- `majorSixth` (1.667)
- `octave` (2)

```json
{
  "size-sm": { "$value": "modularScale(1rem, -1, majorThird)" },
  "size-lg": { "$value": "modularScale(1rem, 1, majorThird)" },
  "size-xl": { "$value": "modularScale(1rem, 2, majorThird)" }
}
```

### typeScale(baseSize, ratio, steps)

Generates complete type scale with semantic names.

| Parameter | Type | Description |
|-----------|------|-------------|
| `baseSize` | string | Base font size |
| `ratio` | string/number | Scale ratio |
| `steps` | number | Steps above base |

**Returns:** `{ xs, sm, base, lg, xl, 2xl, 3xl, ... }`

```json
{
  "scale": { "$value": "typeScale(1rem, majorThird, 6)" }
}
```

### fluidSpace(minSpace, maxSpace, minViewport?, maxViewport?)

Generates fluid spacing using `clamp()`.

```json
{
  "section-padding": { "$value": "fluidSpace(2rem, 6rem)" },
  "container-gap": { "$value": "fluidSpace(1rem, 2rem, 375px, 1440px)" }
}
```

### lineHeight(fontSize, baseLineHeight?)

Calculates optimal line height (larger text needs tighter leading).

| Parameter | Type | Description |
|-----------|------|-------------|
| `fontSize` | string | Font size |
| `baseLineHeight` | number | Base line height (default: 1.5) |

```json
{
  "lh-body": { "$value": "lineHeight(1rem)" },
  "lh-heading": { "$value": "lineHeight(3rem)" }
}
```

### optimalMeasure(fontSize)

Returns optimal line length in `ch` units (45-75 characters).

```json
{
  "measure": { "$value": "optimalMeasure(1rem)" }
}
```

**Output:** `65ch`

### responsiveType(minSize, midSize, maxSize)

Returns object with breakpoint and fluid variants.

**Returns:** `{ mobile, tablet, desktop, fluidMobileTablet, fluidTabletDesktop, fluidFull }`

### letterSpacing(fontSize)

Calculates optimal letter-spacing (larger text needs tighter tracking).

```json
{
  "tracking-heading": { "$value": "letterSpacing(3rem)" },
  "tracking-body": { "$value": "letterSpacing(1rem)" }
}
```

---

## Math Functions

### multiply(value, multiplier)

Multiplies a dimension.

```json
{
  "spacing-2x": { "$value": "multiply({spacing.base}, 2)" },
  "half-size": { "$value": "multiply({font.size.base}, 0.5)" }
}
```

### divide(value, divisor)

Divides a dimension.

```json
{
  "quarter": { "$value": "divide({spacing.xl}, 4)" }
}
```

### add(value1, value2)

Adds dimensions (auto-converts units).

```json
{
  "combined": { "$value": "add({spacing.md}, {spacing.sm})" },
  "mixed-units": { "$value": "add(1rem, 8px)" }
}
```

### subtract(value1, value2)

Subtracts dimensions.

```json
{
  "reduced": { "$value": "subtract({spacing.lg}, {spacing.xs})" }
}
```

### round(value, precision?)

Rounds to decimal places.

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | string | Dimension to round |
| `precision` | number | Decimal places (default: 2) |

```json
{
  "clean": { "$value": "round(multiply({spacing.base}, 1.3333), 2)" }
}
```

### floor(value, precision?)

Rounds down.

```json
{
  "floored": { "$value": "floor(multiply({spacing.base}, 1.7))" }
}
```

### ceil(value, precision?)

Rounds up.

```json
{
  "ceiled": { "$value": "ceil(multiply({spacing.base}, 1.3))" }
}
```

### min(value1, value2)

Returns smaller value.

```json
{
  "constrained": { "$value": "min({spacing.dynamic}, 2rem)" }
}
```

### max(value1, value2)

Returns larger value.

```json
{
  "minimum": { "$value": "max({spacing.tiny}, 0.5rem)" }
}
```

### clamp(value, minVal, maxVal)

Clamps between bounds.

```json
{
  "bounded": { "$value": "clamp({spacing.responsive}, 1rem, 4rem)" }
}
```

### convert(value, toUnit, baseFontSize?)

Converts between units (px, rem, em).

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | string | Dimension to convert |
| `toUnit` | string | Target unit |
| `baseFontSize` | number | Base font size in px (default: 16) |

```json
{
  "in-rem": { "$value": "convert(24px, rem)" },
  "in-px": { "$value": "convert(1.5rem, px)" }
}
```

### mod(value, divisor)

Modulo (remainder).

```json
{
  "remainder": { "$value": "mod(10rem, 3)" }
}
```

### abs(value)

Absolute value.

```json
{
  "positive": { "$value": "abs(negate({spacing.md}))" }
}
```

### negate(value)

Negates value.

```json
{
  "negative-margin": { "$value": "negate({spacing.md})" }
}
```

### percent(value, percentage)

Calculates percentage of value.

```json
{
  "quarter": { "$value": "percent({spacing.xl}, 25%)" },
  "third": { "$value": "percent({container.width}, 33.333)" }
}
```

---

## Advanced Patterns

### Nested Functions

Functions can be nested for complex operations:

```json
{
  "accessible-primary": {
    "$value": "ensureContrast(shade({color.brand}, 20%), {color.background}, 4.5)"
  },
  "vibrant-complement": {
    "$value": "saturate(complement({color.brand}), 20%)"
  }
}
```

### Complete Color System from One Color

Create an entire color palette from a single brand color:

```json
{
  "color": {
    "brand": { "$value": "#6366f1", "$description": "Single source of truth" },
    "primary": {
      "50": { "$value": "tint({color.brand}, 95%)" },
      "100": { "$value": "tint({color.brand}, 85%)" },
      "200": { "$value": "tint({color.brand}, 70%)" },
      "300": { "$value": "tint({color.brand}, 50%)" },
      "400": { "$value": "tint({color.brand}, 25%)" },
      "500": { "$value": "{color.brand}" },
      "600": { "$value": "shade({color.brand}, 15%)" },
      "700": { "$value": "shade({color.brand}, 30%)" },
      "800": { "$value": "shade({color.brand}, 50%)" },
      "900": { "$value": "shade({color.brand}, 70%)" },
      "950": { "$value": "shade({color.brand}, 85%)" },
      "on-light": { "$value": "accessibleText({color.primary.100})" },
      "on-base": { "$value": "accessibleText({color.brand})" },
      "on-dark": { "$value": "accessibleText({color.primary.900})" }
    }
  }
}
```

### Spacing Scale with Math

```json
{
  "spacing": {
    "base": { "$value": "1rem" },
    "3xs": { "$value": "multiply({spacing.base}, 0.125)" },
    "2xs": { "$value": "multiply({spacing.base}, 0.25)" },
    "xs": { "$value": "multiply({spacing.base}, 0.5)" },
    "sm": { "$value": "multiply({spacing.base}, 0.75)" },
    "md": { "$value": "{spacing.base}" },
    "lg": { "$value": "multiply({spacing.base}, 1.5)" },
    "xl": { "$value": "multiply({spacing.base}, 2)" },
    "2xl": { "$value": "multiply({spacing.base}, 3)" },
    "3xl": { "$value": "multiply({spacing.base}, 4)" }
  }
}
```

### Fluid Typography System

```json
{
  "font": {
    "size": {
      "xs": { "$value": "fluidType(0.75rem, 0.875rem)" },
      "sm": { "$value": "fluidType(0.875rem, 1rem)" },
      "base": { "$value": "fluidType(1rem, 1.125rem)" },
      "lg": { "$value": "fluidType(1.125rem, 1.25rem)" },
      "xl": { "$value": "fluidType(1.25rem, 1.5rem)" },
      "2xl": { "$value": "fluidType(1.5rem, 2rem)" },
      "3xl": { "$value": "fluidType(2rem, 2.5rem)" },
      "4xl": { "$value": "fluidType(2.5rem, 3.5rem)" },
      "5xl": { "$value": "fluidType(3rem, 4.5rem)" }
    }
  }
}
```

### Auto Dark Mode

Generate dark mode automatically from light theme:

```json
{
  "light": {
    "background": { "$value": "#ffffff" },
    "surface": { "$value": "#f8f9fa" },
    "text": { "$value": "#212529" },
    "primary": { "$value": "#0d6efd" }
  },
  "dark": {
    "background": { "$value": "darkMode({light.background})" },
    "surface": { "$value": "darkMode({light.surface})" },
    "text": { "$value": "darkMode({light.text})" },
    "primary": { "$value": "darkMode({light.primary})" }
  }
}
```

---

## Disabling Functions

To disable function processing for a token file, set `$meta.functions` to `false`:

```json
{
  "$meta": {
    "functions": false
  }
}
```

Unknown functions return the original value with a console warning.
