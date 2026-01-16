  <img src="website/static/stylescribe-logo.png" alt="Stylescribe Logo" height="55">

# Stylescribe

A modern, lightweight style guide generator for CSS/SCSS design systems with W3C Design Token support.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![License: MIT OR Apache-2.0](https://img.shields.io/badge/License-MIT%20OR%20Apache--2.0-blue.svg)](./LICENSE-MIT)

## Features

- **CSS/SCSS Documentation** - Generate beautiful documentation from annotated stylesheets
- **Interactive Playground** - Toggle variations, modifiers, and elements in real-time
- **W3C Design Tokens** - Import/export tokens in DTCG format
- **SVG Icon System** - Define icons as design tokens with auto-discovery from npm packages
- **Programmable Tokens** - 46 build-time functions for colors, typography, spacing, and accessibility
- **Fluid Typography** - Generate responsive `clamp()` values with `fluidType()`
- **Accessibility Colors** - Auto-generate WCAG-compliant text colors with `accessibleText()`
- **OKLCH Color Space** - Modern perceptually uniform color manipulation
- **Multi-Theme Support** - Define dark mode and theme variants directly in design tokens
- **Live Reload** - Hot-reload development server
- **Framework Agnostic** - Works with any CSS methodology (BEM, SUIT, etc.)
- **Customizable Templates** - Override Handlebars templates to match your brand

## Quick Start

```bash
# Install globally
npm install -g @maravilla-labs/stylescribe

# Or locally in your project
npm install @maravilla-labs/stylescribe --save-dev

# Start the dev server
stylescribe dev --source ./sass --build-target ./build
```

**Try the example:**
```bash
git clone https://github.com/maravilla-labs/stylescribe.git
cd stylescribe/example
npm install
npm run dev
# Open http://localhost:4142
```

## Documentation

- [Example Project](./example/) - Working example with sample components
- [Contributing Guide](./CONTRIBUTING.md) - How to develop locally and contribute

---

## Commands

### `stylescribe dev`

Start development server with live reload.

```bash
stylescribe dev --source ./sass --build-target ./build
```

| Option | Description | Default |
|--------|-------------|---------|
| `--source` | Source directory for CSS/SCSS | `./sass` |
| `--build-target` | Build output directory | `./build` |
| `--watch` | Watch for file changes | `true` |

### `stylescribe build`

Generate production-ready CSS bundles for distribution.

```bash
stylescribe build --source ./sass --output ./build
```

| Option | Description | Default |
|--------|-------------|---------|
| `--source` | Source directory for CSS/SCSS | `./sass` |
| `--output` | Output directory | `./build` |
| `--bundles` | Generate CSS bundles | `true` |

#### Build Output

```
build/
├── base.css                    # Base styles with CSS custom properties
├── components/                 # Individual component CSS
│   ├── button/button.css
│   ├── card/card.css
│   └── ...
└── css/
    ├── bundle.all.css          # Everything combined
    ├── bundle.light.css        # Base + components (light theme)
    ├── bundle.dark.css         # Base + components + dark theme
    ├── bundle.{variant}.css    # Per-theme bundles
    ├── all-components.css      # All components combined
    ├── themes.css              # All theme overrides
    └── themes/
        ├── dark.css            # Dark theme only
        └── {variant}.css       # Individual theme variants
```

#### Using the Output

**Option 1: All-in-one** (simplest)
```html
<link rel="stylesheet" href="bundle.all.css">
```

**Option 2: Base + pick your theme**
```html
<link rel="stylesheet" href="bundle.light.css">
<!-- or -->
<link rel="stylesheet" href="bundle.dark.css">
```

**Option 3: Modular** (smallest size)
```html
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="components/button/button.css">
<link rel="stylesheet" href="themes/dark.css"> <!-- optional -->
```

#### Theme Switching

Apply themes via `data-theme` attribute and/or CSS class:

```html
<!-- Light (default) -->
<html>

<!-- Dark mode -->
<html data-theme="dark">

<!-- Theme variant -->
<html class="theme-comic">

<!-- Dark + variant -->
<html data-theme="dark" class="theme-comic">
```

### `stylescribe docs`

Generate complete static documentation site.

```bash
stylescribe docs --source ./sass --build-target ./build --output ./site
```

### `stylescribe tokens`

Manage W3C Design Tokens.

```bash
# Extract tokens from CSS/SCSS
stylescribe tokens extract -i ./src/variables.css -o ./tokens.json

# Export to CSS custom properties
stylescribe tokens export -i ./tokens.json -f css -o ./variables.css

# Export to SCSS variables
stylescribe tokens convert -i ./tokens.json -f scss -o ./_tokens.scss

# Validate token file
stylescribe tokens validate -i ./tokens.json

# Merge multiple token files
stylescribe tokens merge -i "./tokens/*.json" -o ./merged.json
```

### `stylescribe create-component`

Scaffold a new component.

```bash
stylescribe create-component button --source ./sass/components --group Interactive
```

### `stylescribe create-page`

Create a new documentation page.

```bash
stylescribe create-page getting-started --docs ./docs --title "Getting Started"
```

### `stylescribe icons`

Discover and manage SVG icons from npm packages.

```bash
# List installed icon packages
stylescribe icons list

# Search for icons by name
stylescribe icons search -q trash

# Get token path for a specific icon
stylescribe icons path -p bootstrap-icons -i trash

# Discover all icons in a package
stylescribe icons discover -p lucide-static
```

---

## Project Structure

```
your-project/
├── sass/
│   └── components/
│       └── button/
│           └── button.scss    # Annotated component
├── docs/
│   └── index.md               # Homepage (markdown)
├── .stylescriberc.json        # Configuration
└── .stylelintrc.json          # Stylelint config
```

---

## Component Annotations

Document components using JSDoc-style comments:

```scss
/**
 * @title Button
 * @description Interactive button for user actions
 * @navtitle Button
 * @group Interactive
 * @order 1
 * @verified true
 * @role button
 * @maintag button
 * @variations primary, secondary, danger
 * @additional_variations sm, lg
 * @elements icon, label
 * @dependencies base-styles
 * @examples
 * - title: Primary Button
 *   description: Main call-to-action
 *   code: <button class="btn btn--primary">Click</button>
 */

.btn {
  // styles using CSS custom properties
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);

  &--primary {
    background: var(--color-primary);
  }

  &__icon {
    margin-right: var(--spacing-sm);
  }
}
```

### Class Prefix in Examples

**Important:** In `@examples` code blocks, always use `ds-` as the class prefix. Stylescribe automatically transforms `ds-` to your configured `classPrefix` from `.stylescriberc.json`.

```scss
// ✅ CORRECT - Use ds- in examples
/**
 * @examples
 * - title: Primary Button
 *   code: <button class="ds-btn ds-btn--primary">Click</button>
 */

// ❌ WRONG - Don't use {{prefix}} in examples
/**
 * @examples
 * - title: Primary Button
 *   code: <button class="{{prefix}}btn">Click</button>
 */
```

Use `{{prefix}}` only in SCSS selectors (not in example code):

```scss
// SCSS selectors use {{prefix}}
.{{prefix}}btn {
  // styles...
}
```

### Available Annotations

| Annotation | Description |
|------------|-------------|
| `@title` | Component display name |
| `@description` | Detailed description (supports multiline) |
| `@navtitle` | Short name for navigation |
| `@group` | Category for grouping components |
| `@order` | Sort order (lower = first) |
| `@verified` | Mark as production-ready (`true`/`false`) |
| `@draft` | Mark as work-in-progress (`true`/`false`) |
| `@role` | ARIA role for the component |
| `@maintag` | HTML tag to use (default: `div`) |
| `@variations` | Comma-separated variation names |
| `@additional_variations` | Extra modifiers (size, state) |
| `@elements` | BEM elements within the component |
| `@dependencies` | Other components this depends on |
| `@examples` | Code examples with title/description |

---

## Configuration

Create `.stylescriberc.json` in your project root:

```json
{
  "productionBasepath": "@myorg/design-system/",
  "headIncludes": {
    "css": [
      "./css/variables.css",
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    ]
  },
  "components": {
    "groupOrder": ["Foundation", "Interactive", "Layout"]
  },
  "packageFiles": [
    "~@myorg/tokens/variables.css:./css/"
  ]
}
```

### External Libraries (headIncludes)

Use `headIncludes.css` to add external stylesheets to your documentation. This is required for:

- **Web fonts** (Google Fonts, Adobe Fonts, etc.)
- **Font icon libraries** (Font Awesome, Material Icons, etc.)
- **Third-party CSS** not bundled with your design system

```json
{
  "headIncludes": {
    "css": [
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css",
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined",
      "./css/local-styles.css"
    ]
  }
}
```

Files are added to `<head>` in order. Use:
- Full URLs for CDN-hosted libraries
- Relative paths for local files (relative to your output directory)

### Options

| Property | Description |
|----------|-------------|
| `productionBasepath` | Import path prefix shown in docs |
| `headIncludes.css` | CSS files to include in `<head>` |
| `components.groupOrder` | Order of component groups in nav |
| `packageFiles` | Files to copy from node_modules (`~` prefix) |
| `tokensFile` | Path to design tokens file (default: `tokens/design-tokens.json`) |
| `themes.darkModeAttribute` | Attribute value for dark mode (default: `dark`) |
| `themes.themeClassPrefix` | CSS class prefix for themes (default: `theme-`) |
| `build.bundles.*` | Control which bundles are generated (see below) |

### Build Bundles

Control which CSS bundles are generated (all enabled by default):

```json
{
  "build": {
    "bundles": {
      "all": true,
      "perTheme": true,
      "allComponents": true,
      "themes": true,
      "themesIndividual": true
    }
  }
}
```

| Bundle | Output | Description |
|--------|--------|-------------|
| `all` | `bundle.all.css` | Everything combined |
| `perTheme` | `bundle.{theme}.css` | Separate bundle per theme |
| `allComponents` | `all-components.css` | All components, no themes |
| `themes` | `themes.css` | All themes combined |
| `themesIndividual` | `themes/*.css` | Individual theme files |

---

## Design Tokens

Stylescribe supports the [W3C Design Tokens Community Group](https://tr.designtokens.org/format/) format.

### Token File Format

```json
{
  "color": {
    "primary": {
      "$value": "#0d6efd",
      "$type": "color",
      "$description": "Primary brand color"
    }
  },
  "spacing": {
    "md": {
      "$value": "16px",
      "$type": "dimension"
    }
  }
}
```

### Supported Token Types

- `color` - Colors (#hex, rgb, hsl, oklch)
- `dimension` - Sizes (px, rem, em, %)
- `duration` - Animations (ms, s)
- `fontFamily` - Font stacks
- `fontWeight` - Font weights
- `number` - Unitless numbers
- `shadow` - Box shadows
- `cubicBezier` - Easing functions

### Multi-Theme Support

Define themes directly in your design tokens file. Themes can be inline (`$themes` key) or in separate files (via `$meta.themes` references).

**Option 1: Separate theme files (recommended for larger projects)**

```json
{
  "$meta": {
    "name": "My Design System",
    "themes": [
      { "name": "dark", "file": "./dark.json", "mode": "dark" },
      { "name": "comic", "file": "./comic.json" },
      { "name": "comic-dark", "file": "./comic-dark.json", "mode": "dark" }
    ]
  },
  "color": {
    "background": { "$value": "#ffffff", "$type": "color" },
    "primary": { "$value": "#0d6efd", "$type": "color" }
  }
}
```

**Theme file example (`dark.json`):**

**IMPORTANT:** Theme token paths must match your base tokens. If base uses `color.semantic.surface`, dark.json must also use `color.semantic.surface`:

```json
{
  "$meta": { "name": "dark", "mode": "dark" },
  "color": {
    "semantic": {
      "background": { "$value": "#1a1a2e", "$type": "color" },
      "surface": { "$value": "#16213e", "$type": "color" },
      "text": { "$value": "#eaeaea", "$type": "color" },
      "border": { "$value": "#3a3a5c", "$type": "color" }
    },
    "primary": {
      "500": { "$value": "#4dabf7", "$type": "color" }
    }
  }
}
```

**Option 2: Inline themes (for smaller projects)**

```json
{
  "color": {
    "background": { "$value": "#ffffff", "$type": "color" }
  },
  "$themes": {
    "dark": {
      "color": {
        "background": { "$value": "#1a1a2e", "$type": "color" }
      }
    }
  }
}
```

### Generated Theme CSS

Stylescribe generates CSS with selectors for each theme combination:

```css
/* Base tokens (light mode) */
:root {
  --color-semantic-background: #ffffff;
  --color-semantic-surface: #ffffff;
  --color-semantic-text: #212529;
}

/* Dark mode overrides */
[data-theme="dark"] {
  --color-semantic-background: #1a1a2e;
  --color-semantic-surface: #16213e;
  --color-semantic-text: #eaeaea;
}

/* Theme variants */
.theme-comic { --color-primary-500: #f97316; }

/* Dark + variant combined */
[data-theme="dark"].theme-comic { --color-primary-500: #fb923c; }
```

### Dark Mode Integration

Components automatically support dark mode when they use semantic tokens:

```scss
.ds-card {
  // These automatically change when data-theme="dark" is set
  --card-bg: var(--color-semantic-surface);
  --card-text: var(--color-semantic-text);

  background: var(--card-bg);
  color: var(--card-text);
}
```

**Enable dark mode in HTML:**
```html
<html data-theme="dark">
```

**JavaScript toggle:**
```javascript
document.documentElement.setAttribute('data-theme',
  document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
);
```

### Theme Picker

When themes are defined, component pages display a theme picker allowing users to:
- Toggle between light/dark/system mode
- Select theme variants (e.g., default, comic)
- Preview components in all theme combinations

### Theme Configuration

Optional overrides in `.stylescriberc.json`:

```json
{
  "themes": {
    "darkModeAttribute": "dark",
    "themeClassPrefix": "theme-"
  }
}
```

### Multi-File Token Organization

For larger projects, organize tokens across multiple files using glob patterns (similar to Style Dictionary):

```json
{
  "tokens": {
    "include": ["tokens/base/**/*.json"],
    "source": ["tokens/brand/**/*.json", "tokens/components/**/*.json"]
  }
}
```

**How it works:**
- `include` - Base/default tokens loaded first (establishes baseline)
- `source` - Primary tokens loaded second (overrides include)
- Files are merged alphabetically within each group
- Later files override earlier ones (deep merge)

**Example directory structure:**

```
tokens/
├── base/                    # Include (loaded first)
│   ├── colors.json
│   ├── spacing.json
│   └── typography.json
├── brand/                   # Source (overrides base)
│   └── colors.json          # Brand-specific color overrides
├── components/              # Source (component-specific tokens)
│   ├── button.json
│   └── card.json
├── dark.json                # Theme file (via $meta.themes)
└── comic.json               # Theme variant
```

**Single file (backward compatible):**

```json
{
  "tokensFile": "tokens/design-tokens.json"
}
```

---

## Programmable Design Tokens

Stylescribe extends W3C Design Tokens with **46 programmable functions** that transform your tokens at build time. No runtime JavaScript required - values are computed and output as standard CSS.

### Highlights

**Fluid Typography** - Generate responsive `clamp()` values automatically:
```json
{
  "font-size": {
    "heading": { "$value": "fluidType(1.5rem, 3rem)" }
  }
}
```
Outputs: `--font-size-heading: clamp(1.5rem, 2.5vw + 1rem, 3rem);`

**Accessibility Automation** - Auto-generate WCAG-compliant text colors:
```json
{
  "color": {
    "primary": { "$value": "#0d6efd" },
    "on-primary": { "$value": "accessibleText({color.primary})" }
  }
}
```
Outputs: `--color-on-primary: #ffffff;` (or `#000000` for light backgrounds)

**Color Scales from One Value** - Derive entire palettes using OKLCH color space:
```json
{
  "color": {
    "brand": { "$value": "#6366f1" },
    "primary-100": { "$value": "tint({color.brand}, 80%)" },
    "primary-900": { "$value": "shade({color.brand}, 80%)" }
  }
}
```

### All 46 Functions

| Category | Functions |
|----------|-----------|
| **Color** (15) | `tint`, `shade`, `mix`, `adjust`, `alpha`, `complement`, `saturate`, `desaturate`, `invert`, `grayscale`, `darkMode`, `colorScale`, `lighten`, `darken`, `hueRotate` |
| **Accessibility** (8) | `contrastRatio`, `meetsContrast`, `accessibleText`, `ensureContrast`, `luminance`, `isLight`, `isDark`, `accessiblePair` |
| **Typography** (8) | `fluidType`, `modularScale`, `typeScale`, `fluidSpace`, `lineHeight`, `optimalMeasure`, `responsiveType`, `letterSpacing` |
| **Math** (15) | `multiply`, `divide`, `add`, `subtract`, `round`, `floor`, `ceil`, `min`, `max`, `clamp`, `convert`, `mod`, `abs`, `negate`, `percent` |

### Examples

**Modular Type Scale:**
```json
{
  "font": {
    "size-lg": { "$value": "modularScale(1rem, 1, majorThird)" },
    "size-xl": { "$value": "modularScale(1rem, 2, majorThird)" }
  }
}
```

**Spacing from Base Unit:**
```json
{
  "spacing": {
    "base": { "$value": "1rem" },
    "sm": { "$value": "multiply({spacing.base}, 0.5)" },
    "lg": { "$value": "multiply({spacing.base}, 1.5)" }
  }
}
```

**WCAG Contrast Enforcement:**
```json
{
  "color": {
    "link": { "$value": "ensureContrast(#0066cc, #ffffff, 4.5)" }
  }
}
```

See the [Design Tokens Documentation](./docs/design-tokens.md) for the complete function reference with all parameters and examples.

---

## Template Customization

Override default templates by creating files in `.stylescribe/templates/`:

```
.stylescribe/
└── templates/
    ├── component.hbs      # Component page
    ├── index.hbs          # Homepage
    ├── pages.hbs          # Documentation pages
    └── includes/
        ├── branding.hbs   # Logo/branding partial
        └── homepage_header.hbs
```

### Handlebars Helpers

| Helper | Usage |
|--------|-------|
| `{{eq a b}}` | Equality check |
| `{{prettyprint code}}` | Format HTML |
| `{{nl2br text}}` | Newlines to `<br>` |
| `{{capitalizeFirst text}}` | Capitalize first letter |
| `{{json data}}` | JSON stringify |

---

## SVG Imports

Import SVGs directly in SCSS - they're converted to base64 data URLs:

```scss
@import "../../icons/check.svg";

.icon-check {
  background-image: url($check);
}
```

---

## SVG Icon System

Stylescribe provides a powerful icon system using design tokens. Icons from npm packages (Bootstrap Icons, Lucide, Heroicons, etc.) are embedded as base64 SVG data URIs and exposed as CSS custom properties.

### Why Design Tokens for Icons?

- **Swappable** - Change icon sources without touching components
- **Documented** - Icons appear in your design system docs automatically
- **Optimized** - Only icons you define are included (no bloat)
- **Stylable** - Use CSS `mask-image` for color inheritance

### Supported Icon Packages

| Package | Install | Path Pattern |
|---------|---------|--------------|
| Bootstrap Icons | `npm i bootstrap-icons` | `~bootstrap-icons/icons/{name}.svg` |
| Lucide | `npm i lucide-static` | `~lucide-static/icons/{name}.svg` |
| Heroicons | `npm i heroicons` | `~heroicons/24/outline/{name}.svg` |
| Feather | `npm i feather-icons` | `~feather-icons/dist/icons/{name}.svg` |
| Tabler Icons | `npm i @tabler/icons` | `~@tabler/icons/icons/{name}.svg` |

### Defining Icon Tokens

Add icons to `tokens/design-tokens.json` under `assets.icons` (W3C DTCG format):

```json
{
  "assets": {
    "icons": {
      "actions": {
        "delete": {
          "$value": "~bootstrap-icons/icons/trash.svg",
          "$type": "asset",
          "$description": "Delete action"
        },
        "edit": {
          "$value": "~lucide-static/icons/pencil.svg",
          "$type": "asset"
        }
      },
      "navigation": {
        "home": {
          "$value": "~lucide-static/icons/house.svg",
          "$type": "asset"
        }
      }
    }
  }
}
```

This generates CSS custom properties:
- `--assets-icons-actions-delete`
- `--assets-icons-actions-edit`
- `--assets-icons-navigation-home`

### Using Icons in Components

Icons use CSS `mask-image` so they inherit color from `currentColor`:

```scss
.ds-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: currentColor;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;

  &--delete {
    mask-image: var(--assets-icons-actions-delete);
    -webkit-mask-image: var(--assets-icons-actions-delete);
  }

  &--home {
    mask-image: var(--assets-icons-navigation-home);
    -webkit-mask-image: var(--assets-icons-navigation-home);
  }
}
```

**Usage in HTML:**
```html
<span class="ds-icon ds-icon--delete"></span>
<span class="ds-icon ds-icon--home" style="color: blue;"></span>

<!-- Icons inherit button text color -->
<button class="ds-btn ds-btn--danger">
  <span class="ds-icon ds-icon--delete"></span>
  Delete
</button>
```

### Discovering Icons

Use the CLI to find available icons:

```bash
# List installed icon packages
stylescribe icons list

# Search for icons
stylescribe icons search -q arrow

# Get the token path for an icon
stylescribe icons path -p bootstrap-icons -i trash
# Output: ~bootstrap-icons/icons/trash.svg
```

### Icon Swappability

Use semantic names (e.g., "delete" not "trash") so you can swap icon sources:

```json
// Switch from Bootstrap to Lucide - components unchanged
"delete": { "$value": "~bootstrap-icons/icons/trash.svg" }
// becomes
"delete": { "$value": "~lucide-static/icons/trash.svg" }
```

### Framework Integration

Icons defined in design tokens work in **any framework** - just use the CSS classes:

```jsx
// React - use CSS classes directly
<span className="ds-icon ds-icon--delete" />

// Or create a wrapper component
function Icon({ name, className }) {
  return <span className={`ds-icon ds-icon--${name} ${className || ''}`} />;
}

<Icon name="delete" />
<Icon name="home" className="text-blue-500" />
```

```vue
<!-- Vue -->
<span class="ds-icon ds-icon--delete" />
```

The icons inherit `currentColor`, so they automatically match your text color or can be styled with CSS.

### Supporting Multiple Icon Types

Design systems often need to support SVG tokens, font icons (Font Awesome), and framework components. A well-structured Icon component handles all three with the same color/size tokens.

**Recommended approach:**
- Use `currentColor` for color - works for SVG (`background-color`), fonts (`color`), and inline SVGs (`fill`)
- Use `em` units for sizing - icons scale with text automatically
- Use CSS custom properties for tokens - same tokens work across all icon types

```scss
.ds-icon {
  // Tokens - same for all icon types
  --icon-size: 1em;
  --icon-color: currentColor;

  // Base styles
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size);
  height: var(--icon-size);
  color: var(--icon-color);            // Font icons
  fill: var(--icon-color);             // Inline SVGs
  background-color: var(--icon-color); // mask-image SVGs

  // SVG mask properties
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;

  // SVG token variants
  &--delete {
    mask-image: var(--assets-icons-actions-delete);
  }

  // Font icon mode - disable mask background
  // Requires font library in headIncludes (see Configuration)
  &--font {
    background-color: transparent;
    font-family: 'Font Awesome 6 Free';
    font-weight: 900;
  }

  // Flexible sizing (em-based, scales with context)
  &--sm { --icon-size: 0.75em; }
  &--lg { --icon-size: 1.5em; }
}
```

```jsx
// Universal component - all inherit parent's color
<button style={{ color: 'red' }}>
  <Icon name="delete" />           {/* SVG token */}
  <Icon name="delete" font />      {/* Font icon */}
  <Icon><Trash /></Icon>           {/* Framework */}
</button>
```

This approach lets teams:
- Use consistent color/size tokens across all icon types
- Support SVG tokens, font icons, and framework components
- Scale icons naturally with surrounding text

---

## Stylelint Integration

Create `.stylelintrc.json`:

```json
{
  "extends": "stylelint-config-standard-scss"
}
```

Or use an empty config to disable linting:

```json
{
  "rules": {}
}
```

---

## Requirements

- Node.js 18.0.0 or higher
- npm or yarn

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Development setup
- How to test changes locally
- Code style guidelines
- Pull request process

---

## License

Licensed under either of:

- Apache License, Version 2.0 ([LICENSE-APACHE](./LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
- MIT License ([LICENSE-MIT](./LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.

Copyright 2019-2026 Maravilla Labs

---

## Links

- [GitHub Repository](https://github.com/maravilla-labs/stylescribe)
- [Report Issues](https://github.com/maravilla-labs/stylescribe/issues)
- [Example Project](./example/)
