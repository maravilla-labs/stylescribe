# Design Tokens Reference

Stylescribe uses W3C Design Tokens Community Group (DTCG) format with powerful build-time functions for color manipulation, typography, and math operations.

## Token File Structure

### Basic Structure

```json
{
  "$meta": {
    "name": "My Design System",
    "version": "1.0.0",
    "themes": [
      { "name": "dark", "file": "./dark.json", "mode": "dark" }
    ]
  },
  "color": {
    "primary": {
      "$value": "#0d6efd",
      "$type": "color",
      "$description": "Primary brand color"
    }
  }
}
```

### Token Properties

- `$value` - **Required.** The token value
- `$type` - Token type (color, dimension, fontFamily, etc.)
- `$description` - Human-readable description

### Supported Types

| Type | Example Value |
|------|---------------|
| `color` | `#0d6efd`, `rgb(13, 110, 253)`, `oklch(0.6 0.15 250)` |
| `dimension` | `16px`, `1rem`, `0.5em` |
| `fontFamily` | `"Inter", sans-serif` |
| `fontWeight` | `400`, `bold` |
| `duration` | `200ms`, `0.3s` |
| `cubicBezier` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `number` | `1.5`, `0` |
| `shadow` | `0 4px 6px rgba(0,0,0,0.1)` |
| `typography` | Object with font properties |

---

## Token References

Reference other tokens using `{path.to.token}` syntax:

```json
{
  "color": {
    "primary": { "$value": "#0d6efd", "$type": "color" },
    "primary-hover": { "$value": "{color.primary}", "$type": "color" }
  }
}
```

References are resolved at build time.

---

## Token Functions

Stylescribe processes functions in token values at build time. Use `functionName(arg1, arg2)` syntax.

### Color Functions (15)

#### tint(color, amount)
Lighten a color by mixing with white.

```json
{ "$value": "tint(#0d6efd, 20%)" }  // → lighter blue
{ "$value": "tint({color.primary}, 50%)" }
```

#### shade(color, amount)
Darken a color by reducing lightness.

```json
{ "$value": "shade(#0d6efd, 20%)" }  // → darker blue
```

#### mix(color1, color2, ratio)
Blend two colors in OKLCH space.

```json
{ "$value": "mix(#ff0000, #0000ff, 50%)" }  // → purple
```

#### alpha(color, opacity)
Set color transparency.

```json
{ "$value": "alpha(#0d6efd, 0.5)" }  // → rgba with 50% opacity
{ "$value": "alpha({color.primary}, 80%)" }
```

#### lighten(color, amount)
Increase color lightness.

```json
{ "$value": "lighten(#0d6efd, 20%)" }
```

#### darken(color, amount)
Decrease color lightness.

```json
{ "$value": "darken(#0d6efd, 20%)" }
```

#### saturate(color, amount)
Increase color saturation/chroma.

```json
{ "$value": "saturate(#888888, 50%)" }
```

#### desaturate(color, amount)
Decrease color saturation/chroma.

```json
{ "$value": "desaturate(#ff0000, 50%)" }
```

#### complement(color)
Get complementary color (180° hue rotation).

```json
{ "$value": "complement(#0d6efd)" }  // → orange
```

#### invert(color)
Invert color lightness.

```json
{ "$value": "invert(#0d6efd)" }
```

#### grayscale(color)
Remove all chroma (convert to gray).

```json
{ "$value": "grayscale(#0d6efd)" }
```

#### hueRotate(color, degrees)
Rotate hue by degrees.

```json
{ "$value": "hueRotate(#0d6efd, 90)" }  // → rotate 90 degrees
```

#### adjust(color, adjustments)
Fine-tune OKLCH properties.

```json
{ "$value": "adjust(#0d6efd, { l: 10, c: -5, h: 30 })" }
```

#### darkMode(color, options)
Auto-generate dark mode variant.

```json
{ "$value": "darkMode(#0d6efd)" }
{ "$value": "darkMode(#ffffff, { chromaAdjust: -10 })" }
```

#### colorScale(baseColor, steps)
Generate a complete color scale.

```json
{ "$value": "colorScale(#0d6efd, 12)" }  // → object with step1-step12
```

---

### Contrast Functions (8)

#### contrastRatio(foreground, background)
Calculate WCAG contrast ratio (1-21).

```json
{ "$value": "contrastRatio(#ffffff, #000000)" }  // → 21
```

#### meetsContrast(foreground, background, level)
Check if colors meet WCAG contrast (AA or AAA).

```json
{ "$value": "meetsContrast(#ffffff, #0d6efd, AA)" }  // → "true" or "false"
```

#### accessibleText(background, preferLight)
Get accessible text color (black or white) for background.

```json
{ "$value": "accessibleText(#0d6efd)" }  // → "#ffffff"
{ "$value": "accessibleText(#f0f0f0)" }  // → "#000000"
```

#### ensureContrast(color, against, minContrast)
Adjust color to meet minimum contrast against another color.

```json
{ "$value": "ensureContrast(#888888, #ffffff, 4.5)" }
```

#### luminance(color)
Get relative luminance (0-1).

```json
{ "$value": "luminance(#0d6efd)" }
```

#### isLight(color)
Check if color is light (luminance > 0.5).

```json
{ "$value": "isLight(#ffffff)" }  // → "true"
```

#### isDark(color)
Check if color is dark (luminance <= 0.5).

```json
{ "$value": "isDark(#000000)" }  // → "true"
```

#### accessiblePair(baseColor, level)
Get accessible background + text color pair.

```json
{ "$value": "accessiblePair(#0d6efd, AA)" }  // → { background, text }
```

---

### Typography Functions (8)

#### fluidType(minSize, maxSize, minViewport, maxViewport)
Generate CSS `clamp()` for fluid typography.

```json
{ "$value": "fluidType(16px, 24px, 320px, 1280px)" }
// → "clamp(1rem, 0.8333vw + 0.8333rem, 1.5rem)"
```

#### modularScale(base, step, ratio)
Calculate size using modular scale.

```json
{ "$value": "modularScale(1rem, 2, majorThird)" }  // → 1.5625rem
{ "$value": "modularScale(16px, -1, 1.25)" }  // → 12.8px
```

**Available ratios:**
- `minorSecond` (1.067)
- `majorSecond` (1.125)
- `minorThird` (1.2)
- `majorThird` (1.25)
- `perfectFourth` (1.333)
- `augmentedFourth` (1.414)
- `perfectFifth` (1.5)
- `goldenRatio` (1.618)
- `octave` (2)

#### typeScale(baseSize, ratio, steps)
Generate complete type scale object.

```json
{ "$value": "typeScale(1rem, majorThird, 4)" }
// → { xs, sm, base, lg, xl, 2xl, 3xl, 4xl }
```

#### fluidSpace(minSpace, maxSpace, minViewport, maxViewport)
Generate fluid spacing (same as fluidType).

```json
{ "$value": "fluidSpace(16px, 32px)" }
```

#### lineHeight(fontSize, baseLineHeight)
Calculate optimal line height for font size.

```json
{ "$value": "lineHeight(16px, 1.5)" }  // → "1.5"
{ "$value": "lineHeight(48px, 1.5)" }  // → "1.2" (tighter for large text)
```

#### optimalMeasure(fontSize)
Calculate optimal line length in `ch` units.

```json
{ "$value": "optimalMeasure(16px)" }  // → "65ch"
```

#### responsiveType(minSize, midSize, maxSize)
Generate responsive typography object with breakpoints.

```json
{ "$value": "responsiveType(14px, 16px, 18px)" }
```

#### letterSpacing(fontSize)
Calculate optimal letter-spacing.

```json
{ "$value": "letterSpacing(48px)" }  // → "-0.02em" (tighter for large)
{ "$value": "letterSpacing(12px)" }  // → "0.05em" (looser for small)
```

---

### Math Functions (15)

#### multiply(value, multiplier)
Multiply a dimension.

```json
{ "$value": "multiply(1rem, 2)" }  // → "2rem"
```

#### divide(value, divisor)
Divide a dimension.

```json
{ "$value": "divide(16px, 2)" }  // → "8px"
```

#### add(value1, value2)
Add dimensions (converts units if needed).

```json
{ "$value": "add(1rem, 8px)" }  // → "1.5rem"
```

#### subtract(value1, value2)
Subtract dimensions.

```json
{ "$value": "subtract(2rem, 1rem)" }  // → "1rem"
```

#### round(value, precision)
Round to decimal places.

```json
{ "$value": "round(1.567rem, 2)" }  // → "1.57rem"
```

#### floor(value, precision)
Round down.

```json
{ "$value": "floor(1.9rem)" }  // → "1rem"
```

#### ceil(value, precision)
Round up.

```json
{ "$value": "ceil(1.1rem)" }  // → "2rem"
```

#### min(value1, value2)
Get smaller value.

```json
{ "$value": "min(1rem, 20px)" }  // → "1rem"
```

#### max(value1, value2)
Get larger value.

```json
{ "$value": "max(1rem, 20px)" }  // → "20px"
```

#### clamp(value, min, max)
Clamp value between bounds.

```json
{ "$value": "clamp(24px, 16px, 32px)" }  // → "24px"
```

#### convert(value, toUnit, baseFontSize)
Convert between units.

```json
{ "$value": "convert(16px, rem)" }  // → "1rem"
{ "$value": "convert(2rem, px)" }   // → "32px"
```

#### mod(value, divisor)
Get remainder.

```json
{ "$value": "mod(17px, 4)" }  // → "1px"
```

#### abs(value)
Absolute value.

```json
{ "$value": "abs(-16px)" }  // → "16px"
```

#### negate(value)
Negate value.

```json
{ "$value": "negate(16px)" }  // → "-16px"
```

#### percent(value, percentage)
Calculate percentage of value.

```json
{ "$value": "percent(100px, 50%)" }  // → "50px"
```

---

## Nested Functions

Functions can be nested:

```json
{
  "color": {
    "primary-hover": {
      "$value": "shade(tint({color.primary}, 10%), 5%)"
    }
  }
}
```

---

## Theme Files

Create theme files that override base tokens:

**tokens/dark.json:**
```json
{
  "$meta": {
    "name": "dark",
    "mode": "dark"
  },
  "color": {
    "background": { "$value": "#1a1a2e", "$type": "color" },
    "text": { "$value": "#eaeaea", "$type": "color" },
    "primary": { "$value": "tint({color.primary}, 20%)", "$type": "color" }
  }
}
```

Reference in base tokens:
```json
{
  "$meta": {
    "themes": [
      { "name": "dark", "file": "./dark.json", "mode": "dark" }
    ]
  }
}
```

---

## Component Tokens

### Structure

Create component-specific tokens in `tokens/components/{name}.json`:

```
tokens/
├── design-tokens.json      # Global tokens
├── dark.json               # Theme override
└── components/
    ├── button.json         # Button-specific tokens
    ├── card.json           # Card-specific tokens
    └── progress.json       # Progress bar tokens
```

### Component Token File

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
    },
    "title": {
      "size": {
        "$value": "{font.size.3xl}",
        "$type": "dimension",
        "$description": "Hero title font size"
      }
    }
  }
}
```

### CRITICAL: No Inline Fallbacks in SCSS

**When referencing tokens in SCSS, NEVER use inline fallbacks.**

```scss
// ✅ CORRECT - Direct token reference
.ds-hero {
  --hero-padding: var(--spacing-xl);
  --hero-bg: var(--color-surface);
}

// ❌ WRONG - Inline fallbacks are forbidden
.ds-hero {
  --hero-padding: var(--spacing-xl, 4rem);     // NO!
  --hero-bg: var(--color-surface, #f8f9fa);    // NO!
}
```

**Why no fallbacks?**
- Fallbacks hide missing tokens instead of failing visibly
- They duplicate values that belong in the token system
- They make theming harder (fallback ignores theme overrides)

### Creating Components with Tokens

Use the CLI to scaffold both SCSS and token file:

```bash
stylescribe create-component hero --group "Layout"
```

This creates:
- `sass/components/hero/hero.scss` - Component styles
- `tokens/components/hero.json` - Component tokens

---

## Best Practices

1. **Use references over hardcoded values** - `{color.primary}` instead of `#0d6efd`
2. **Define base tokens first** - Colors, spacing, typography primitives
3. **Use semantic naming** - `color.danger` not `color.red`
4. **Leverage functions for consistency** - `tint()`, `shade()` for color variations
5. **Document tokens** - Always add `$description`
6. **Validate regularly** - `stylescribe tokens validate`
7. **No inline fallbacks** - Reference tokens directly, never `var(--token, fallback)`
8. **Component tokens in JSON** - Customizable defaults go in `tokens/components/*.json`
