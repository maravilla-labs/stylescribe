---
title: Design Tokens
navtitle: Design Tokens
slug: design-tokens
order: 4
---

StyleScribe supports the W3C Design Tokens Community Group (DTCG) format with 46 programmable token functions.

## Token Format

Tokens use the W3C DTCG JSON format with `$value` and optional `$type`:

```json
{
  "color": {
    "primary": {
      "$value": "#3b82f6",
      "$type": "color",
      "$description": "Primary brand color"
    }
  }
}
```

## Token Types

| Type | Description | Example |
|------|-------------|---------|
| `color` | Colors in any format | `#3b82f6`, `rgb(59, 130, 246)`, `oklch(0.6 0.15 250)` |
| `dimension` | Sizes with units | `16px`, `1rem`, `2em` |
| `duration` | Animation timing | `200ms`, `0.3s` |
| `fontFamily` | Font stacks | `"Inter, sans-serif"` |
| `fontWeight` | Font weights | `400`, `700` |
| `number` | Unitless numbers | `1.5`, `0.8` |
| `shadow` | Box shadows | Structured object |
| `gradient` | Gradients | Structured object |
| `cubicBezier` | Easing functions | `[0.4, 0, 0.2, 1]` |
| `asset` | Icons/images | `~bootstrap-icons/icons/trash.svg` |

## Token References

Reference other tokens using `{path.to.token}` syntax:

```json
{
  "color": {
    "primary": { "$value": "#3b82f6" },
    "primary-light": { "$value": "tint({color.primary}, 20%)" },
    "button-bg": { "$value": "{color.primary}" }
  }
}
```

## Token Functions

StyleScribe includes 46 programmable functions organized into categories.

### Color Functions (15)

| Function | Description | Example |
|----------|-------------|---------|
| `tint(color, amount)` | Lighten by mixing with white | `tint({color.primary}, 20%)` |
| `shade(color, amount)` | Darken by mixing with black | `shade({color.primary}, 20%)` |
| `mix(color1, color2, weight)` | Mix two colors | `mix({color.red}, {color.blue}, 50%)` |
| `alpha(color, opacity)` | Set opacity | `alpha({color.primary}, 0.5)` |
| `lighten(color, amount)` | Increase lightness | `lighten({color.primary}, 10%)` |
| `darken(color, amount)` | Decrease lightness | `darken({color.primary}, 10%)` |
| `saturate(color, amount)` | Increase saturation | `saturate({color.gray}, 20%)` |
| `desaturate(color, amount)` | Decrease saturation | `desaturate({color.primary}, 20%)` |
| `complement(color)` | Get complementary color | `complement({color.primary})` |
| `invert(color)` | Invert color | `invert({color.primary})` |
| `grayscale(color)` | Convert to grayscale | `grayscale({color.primary})` |
| `hueRotate(color, degrees)` | Rotate hue | `hueRotate({color.primary}, 180)` |
| `colorScale(color, steps)` | Generate color scale | `colorScale({color.primary}, 9)` |
| `darkMode(light, dark)` | Theme-aware color | `darkMode({color.white}, {color.gray-900})` |
| `adjust(color, props)` | Adjust color properties | `adjust({color.primary}, {lightness: 10})` |

### Accessibility Functions (8)

| Function | Description | Example |
|----------|-------------|---------|
| `accessibleText(bg)` | Get readable text color | `accessibleText({color.primary})` |
| `contrastRatio(fg, bg)` | Calculate contrast ratio | `contrastRatio({color.text}, {color.bg})` |
| `meetsContrast(fg, bg, level)` | Check WCAG compliance | `meetsContrast({color.text}, {color.bg}, "AA")` |
| `ensureContrast(fg, bg, ratio)` | Adjust for minimum contrast | `ensureContrast({color.text}, {color.bg}, 4.5)` |
| `luminance(color)` | Get relative luminance | `luminance({color.primary})` |
| `isLight(color)` | Check if light | `isLight({color.bg})` |
| `isDark(color)` | Check if dark | `isDark({color.bg})` |
| `accessiblePair(base)` | Generate accessible pair | `accessiblePair({color.primary})` |

### Typography Functions (8)

| Function | Description | Example |
|----------|-------------|---------|
| `fluidType(min, max, minVw, maxVw)` | Fluid typography | `fluidType(16px, 24px, 320px, 1280px)` |
| `modularScale(base, ratio, step)` | Modular scale value | `modularScale(16px, 1.25, 3)` |
| `typeScale(base, scale, levels)` | Generate type scale | `typeScale(16px, 1.25, 6)` |
| `fluidSpace(min, max, minVw, maxVw)` | Fluid spacing | `fluidSpace(8px, 16px, 320px, 1280px)` |
| `lineHeight(fontSize, ratio)` | Calculate line height | `lineHeight(16px, 1.5)` |
| `optimalMeasure(fontSize)` | Optimal line length | `optimalMeasure(16px)` |
| `responsiveType(sizes)` | Responsive font sizes | `responsiveType({sm: 14px, md: 16px, lg: 18px})` |
| `letterSpacing(fontSize)` | Calculate letter spacing | `letterSpacing(48px)` |

### Math Functions (15)

| Function | Description | Example |
|----------|-------------|---------|
| `multiply(a, b)` | Multiply values | `multiply({spacing.base}, 2)` |
| `divide(a, b)` | Divide values | `divide({spacing.lg}, 2)` |
| `add(a, b)` | Add values | `add({spacing.sm}, {spacing.xs})` |
| `subtract(a, b)` | Subtract values | `subtract({spacing.lg}, {spacing.sm})` |
| `round(value)` | Round to nearest integer | `round(16.7px)` |
| `floor(value)` | Round down | `floor(16.7px)` |
| `ceil(value)` | Round up | `ceil(16.3px)` |
| `min(a, b)` | Minimum value | `min({spacing.sm}, 8px)` |
| `max(a, b)` | Maximum value | `max({spacing.sm}, 8px)` |
| `clamp(min, val, max)` | Clamp value | `clamp(12px, {spacing.base}, 24px)` |
| `convert(value, unit)` | Convert units | `convert(16px, rem)` |
| `mod(a, b)` | Modulo | `mod(17, 5)` |
| `abs(value)` | Absolute value | `abs(-16px)` |
| `negate(value)` | Negate value | `negate({spacing.md})` |
| `percent(value, total)` | Calculate percentage | `percent(4, 12)` |

## Structured Token Types

### Shadows

Shadows use structured objects:

```json
{
  "shadow": {
    "sm": {
      "$type": "shadow",
      "$value": {
        "offsetX": "0px",
        "offsetY": "1px",
        "blur": "2px",
        "spread": "0px",
        "color": "alpha({color.black}, 0.1)"
      }
    },
    "md": {
      "$type": "shadow",
      "$value": [
        {
          "offsetX": "0px",
          "offsetY": "4px",
          "blur": "6px",
          "spread": "-1px",
          "color": "alpha({color.black}, 0.1)"
        },
        {
          "offsetX": "0px",
          "offsetY": "2px",
          "blur": "4px",
          "spread": "-2px",
          "color": "alpha({color.black}, 0.05)"
        }
      ]
    },
    "inset": {
      "$type": "shadow",
      "$value": {
        "offsetX": "0px",
        "offsetY": "2px",
        "blur": "4px",
        "spread": "0px",
        "color": "alpha({color.black}, 0.06)",
        "inset": true
      }
    }
  }
}
```

### Gradients

Gradients use structured objects for interoperability:

```json
{
  "gradient": {
    "brand": {
      "$type": "gradient",
      "$value": {
        "type": "linear",
        "angle": "135deg",
        "colorStops": [
          { "color": "{color.primary.400}", "position": 0 },
          { "color": "{color.primary.600}", "position": 1 }
        ]
      }
    },
    "radial": {
      "$type": "gradient",
      "$value": {
        "type": "radial",
        "shape": "circle",
        "colorStops": [
          { "color": "{color.primary.300}", "position": 0 },
          { "color": "transparent", "position": 1 }
        ]
      }
    }
  }
}
```

### Icons (Assets)

Icons are defined as asset tokens:

```json
{
  "assets": {
    "icons": {
      "actions": {
        "delete": {
          "$value": "~bootstrap-icons/icons/trash.svg",
          "$type": "asset",
          "$description": "Delete action icon"
        }
      }
    }
  }
}
```

Generates CSS variable: `--assets-icons-actions-delete`

## Token Organization

### Single File

```
tokens/
└── design-tokens.json
```

### Multi-File with Includes

```json
// .stylescriberc.json
{
  "tokens": {
    "source": "tokens/design-tokens.json",
    "include": ["tokens/components/*.json"]
  }
}
```

```
tokens/
├── design-tokens.json    # Base tokens
├── dark.json             # Dark theme overrides
└── components/
    ├── button.json       # Component-specific tokens
    └── card.json
```

## Theme Support

Add themes in the token file's `$meta`:

```json
{
  "$meta": {
    "themes": ["dark", "comic"]
  },
  "color": {
    "primary": { "$value": "#3b82f6" }
  }
}
```

Theme files override base tokens:

```json
// tokens/dark.json
{
  "color": {
    "semantic": {
      "surface": { "$value": "#1a1a2e" },
      "text": { "$value": "#eaeaea" }
    }
  }
}
```

## CLI Commands

```bash
# Validate tokens
stylescribe tokens validate -i ./tokens.json

# Export to CSS
stylescribe tokens export -i ./tokens.json -f css -o ./vars.css

# Export to SCSS
stylescribe tokens export -i ./tokens.json -f scss -o ./_tokens.scss

# Merge files
stylescribe tokens merge -i "./tokens/*.json" -o ./merged.json
```
