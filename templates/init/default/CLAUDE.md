# CLAUDE.md

## Project Overview

{{projectName}} - {{description}}

## Quick Commands

```bash
npm run dev     # Start dev server at http://localhost:4142
npm run build   # Build CSS and documentation
npm run docs    # Generate static documentation site
```

## Architecture

- **CSS Layers:** reset → base → components → utilities
- **Token-driven components:** Variants only set tokens, never behavior
- **BEM naming:** `.ds-block__element--modifier`

## IMPORTANT: Class Prefix Rule

**ALWAYS use `ds-` prefix in source SCSS files.** The configured prefix (`{{prefix}}`) is applied automatically at build time.

```scss
// ✅ CORRECT - Always use ds- in source
.ds-button { }
.ds-card { }

// ❌ WRONG - Never use configured prefix in source
.{{prefix}}button { }  // NO!
```

## Key Patterns

### Token-Driven Components (NO Inline Fallbacks!)

**CRITICAL: Never use inline fallbacks like `var(--token, fallback)`.**

```scss
// ✅ CORRECT - Direct token reference, no fallbacks
.ds-component {
  --component-bg: var(--color-surface);
  --component-padding: var(--spacing-md);

  background: var(--component-bg);
  padding: var(--component-padding);

  // Variations ONLY override tokens
  &--primary {
    --component-bg: var(--color-primary);
  }
}

// ❌ WRONG - Inline fallbacks are forbidden
.ds-component {
  --component-bg: var(--color-surface, #f8f9fa);   // NO!
  --component-padding: var(--spacing-md, 1rem);    // NO!
}
```

For customizable defaults, create `tokens/components/{name}.json`.

### CRITICAL: Read Tokens First

**Before writing component CSS, ALWAYS read `tokens/design-tokens.json` to find correct token paths.**

Tokens are nested: `color.semantic.text` → `--color-semantic-text`

```scss
// ❌ WRONG - Flat names may not exist
--component-text: var(--color-text);

// ✅ CORRECT - Use actual nested paths
--component-text: var(--color-semantic-text);
```

### Component Isolation (REQUIRED)

**Components MUST be self-contained and work in isolation (iframes, preview panels).**

Every component MUST include `font-family` as the first style:

```scss
.ds-component {
  /* ===== Component Tokens ===== */
  --component-font: var(--font-family-base);
  --component-bg: var(--color-semantic-surface);
  --component-text: var(--color-semantic-text);

  /* ===== Base Styles ===== */
  font-family: var(--component-font);  /* REQUIRED - First style! */
  background: var(--component-bg);
  color: var(--component-text);
}
```

**Why font-family is required:** Components in preview iframes don't inherit parent fonts. Without explicit font-family, text renders in browser defaults (Times New Roman).

### Accessibility & Color Contrast

**ALWAYS use accessibility tokens for text on colored backgrounds:**

```scss
.ds-component {
  // Default state - semantic tokens handle light/dark mode
  --component-bg: var(--color-semantic-surface);
  --component-text: var(--color-semantic-text);

  // Primary variation - USE accessibility tokens for contrast
  &--primary {
    --component-bg: var(--color-primary-500);
    --component-text: var(--color-accessibility-on-primary);  // ✅ Ensures readable text
  }

  // Dark variation
  &--dark {
    --component-bg: var(--color-neutral-900);
    --component-text: var(--color-accessibility-on-dark);  // ✅ Light text on dark
  }
}
```

**Rules:**
- `--color-accessibility-on-primary` - Readable text on primary color
- `--color-accessibility-on-dark` - Light text for dark backgrounds
- `--color-semantic-text` / `--color-semantic-text-muted` - Auto-adapts to light/dark mode
- NEVER hardcode colors like `#fff` or `white` - use tokens!

### Dark Mode Support

Dark mode works via the `[data-theme="dark"]` selector. For automatic dark mode support:

**CRITICAL: Use matching token paths in your dark theme file**

Your `tokens/dark.json` must override the SAME paths your components use:

```json
// tokens/dark.json - Override semantic tokens
{
  "color": {
    "semantic": {
      "surface": { "$value": "#1a1a2e" },
      "text": { "$value": "#eaeaea" },
      "text-muted": { "$value": "#a0a0a0" },
      "border": { "$value": "#3a3a5c" }
    }
  }
}
```

Components then automatically adapt:

```scss
.ds-component {
  // These change when [data-theme="dark"] is applied
  --component-bg: var(--color-semantic-surface);
  --component-text: var(--color-semantic-text);
}
```

**If dark mode isn't working:** Check that dark.json token paths match what components use. Flat paths (`color.surface`) won't override nested paths (`color.semantic.surface`).

### Container Queries

Use `@container` for component-internal responsiveness:

```scss
.ds-card {
  container-type: inline-size;
  container-name: card;

  @container card (min-width: 400px) {
    flex-direction: row;
  }
}
```

## Creating Components - FOLLOW THESE STEPS

**Step 1:** Check existing components in `sass/components/`

**Step 2:** Read `tokens/design-tokens.json` to find available tokens

**Step 3:** **USE MCP TOOL** `stylescribe_create_component` to scaffold:
```
stylescribe_create_component({ name: "hero", group: "Containment" })
```
**DO NOT use mkdir/touch/manual file creation. ALWAYS use the MCP tool.**

**Step 4:** Edit the scaffolded files to add variations, elements, examples

**Step 5:** Add `@dependencies` if using other components

### Required Annotations
- `@title` - Display name
- `@description` - What it does
- `@group` - Category (Actions, Containment, etc.)
- `@examples` - YAML format with `title` and `code` (REQUIRED!)

### Optional Annotations
- `@variations` - Available modifiers (if component has variants like `--primary`, `--secondary`)
- `@elements` - BEM elements (if component has child elements like `__icon`, `__label`)
- `@dependencies` - Other components used (if this component uses other components)

### @variations and @elements Formats

**Simple format** (comma-separated) - for quick lists:
```scss
@variations primary, secondary, danger, ghost
@elements icon, label, content
```

**YAML format** - when you want to add descriptions:
```scss
@variations
- name: primary
  description: Main call-to-action, use sparingly
- name: secondary
  description: Secondary actions, less visual emphasis
- name: danger
  description: Destructive actions like delete
- name: ghost
  description: Minimal styling, blends with background

@elements
- name: icon
  description: Optional leading icon (16x16)
- name: label
  description: Button text, required for accessibility
```

**YAML format with custom HTML** - for proper element rendering in previews:
```scss
@elements
- name: icon
  description: SVG icon using mask-image technique
  html: |
    <span class="{{class}}" style="display:inline-block;width:1em;height:1em;background:currentColor;mask-image:var(--assets-icons-actions-add);-webkit-mask-image:var(--assets-icons-actions-add);mask-size:contain;-webkit-mask-size:contain;"></span>
- name: label
  description: Button text content
  html: <span class="{{class}}">Label</span>
```

The `{{class}}` placeholder is replaced with the full BEM class (e.g., `ds-btn__icon`).

**Alternative: Pug syntax** for cleaner templates:
```scss
@elements
- name: icon
  description: SVG icon
  pug: span.{{class}}(style="display:inline-block;width:1em;height:1em;background:currentColor")
- name: label
  pug: span.{{class}} Label
```

Use `html` or `pug` when you need icons, SVGs, or specific markup to display correctly in the Interactive Playground and All Variations section.

### @examples Format (CRITICAL)
```scss
@examples
- title: Example Name
  code: |
    <div class="ds-component">Content</div>
```

**NEVER put raw HTML after @examples. ALWAYS use YAML list with title/code.**

## Design Tokens

- Edit `tokens/design-tokens.json` (W3C DTCG format)
- Use `{reference.path}` for token references
- Available functions: `tint()`, `shade()`, `alpha()`, `fluidType()`, etc.

### Token Function Examples

```json
{
  "color": {
    "primary-light": { "$value": "tint({color.primary}, 20%)" },
    "primary-dark": { "$value": "shade({color.primary}, 20%)" },
    "primary-text": { "$value": "accessibleText({color.primary})" }
  },
  "font": {
    "size-fluid": { "$value": "fluidType(16px, 24px, 320px, 1280px)" }
  }
}
```

### W3C DTCG Gradient Tokens

Gradients use structured objects (not raw CSS strings) for interoperability:

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
    "radial-glow": {
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

**Gradient types:** `linear`, `radial`, `conic`
**Color stops:** Support color references like `{color.primary.500}`

### W3C DTCG Shadow Tokens

Shadows use structured objects with color references and functions:

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
        "color": "alpha({color.black}, 0.05)"
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
          "color": "alpha({color.black}, 0.1)"
        }
      ]
    },
    "brand": {
      "$type": "shadow",
      "$value": {
        "offsetX": "0px",
        "offsetY": "4px",
        "blur": "14px",
        "spread": "0px",
        "color": "alpha({color.brand}, 0.4)"
      }
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

**Shadow features:**
- Use `alpha({color.black}, 0.1)` for transparent shadows with color references
- Array values for layered/multiple shadows
- `"inset": true` for inset shadows
- All dimension values support token references

## External Libraries (headIncludes)

**IMPORTANT:** External libraries (fonts, font icons, third-party CSS) that are NOT bundled must be added to `.stylescriberc.json`:

```json
{
  "headIncludes": {
    "css": [
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    ]
  }
}
```

**When to use headIncludes:**
- Web fonts (Google Fonts, Adobe Fonts, custom fonts)
- Font icon libraries (Font Awesome, Material Icons, Bootstrap Icons font version)
- Any CDN-hosted CSS the design system depends on

**When NOT needed:**
- SVG icon tokens (bundled as base64 in CSS)
- npm packages processed by Stylescribe build
- Local SCSS/CSS files in your source directory

If a component requires an external library (e.g., font icons), remind the user to add it to `headIncludes.css` in their config.

## MCP Resources

This project has an MCP server. Query documentation:

- `stylescribe://docs/cli-commands` - CLI command reference
- `stylescribe://docs/annotations` - Component annotation guide
- `stylescribe://docs/tokens` - Token functions reference (46 functions)
- `stylescribe://docs/css-architecture` - CSS patterns and layers
- `stylescribe://docs/container-queries` - @container patterns
- `stylescribe://docs/theming` - Dark mode and theme variants
- `stylescribe://docs/config` - Configuration options
- `stylescribe://docs/coding-guidelines` - Best practices

## MCP Tools

- `stylescribe_create_component` - Scaffold new component
- `stylescribe_create_page` - Create documentation page
- `stylescribe_validate_tokens` - Validate token file
- `stylescribe_add_theme` - Add new theme
- `stylescribe_export_tokens` - Export tokens to CSS/SCSS
- `stylescribe_icons_list` - List installed icon packages
- `stylescribe_icons_search` - Search for icons by name
- `stylescribe_icons_get_path` - Get token path for an icon
- `stylescribe_icons_discover` - List all icons in a package

## Icon Assets (W3C DTCG)

Icons are defined as design tokens under `assets.icons` with `$type: "asset"`.

### Discovering Icons

Use MCP tools to find available icons:
```
stylescribe_icons_list()           // List installed packages
stylescribe_icons_search("trash")  // Search by name
stylescribe_icons_get_path({ package: "bootstrap-icons", icon: "trash" })
```

Or CLI:
```bash
stylescribe icons list
stylescribe icons search -q trash
stylescribe icons path -p bootstrap-icons -i trash
```

### Supported Icon Packages

| Package | Install | Path Pattern |
|---------|---------|--------------|
| Bootstrap Icons | `npm i bootstrap-icons` | `~bootstrap-icons/icons/{name}.svg` |
| Lucide | `npm i lucide-static` | `~lucide-static/icons/{name}.svg` |
| Heroicons | `npm i heroicons` | `~heroicons/24/outline/{name}.svg` |
| Feather | `npm i feather-icons` | `~feather-icons/dist/icons/{name}.svg` |

### Adding Icon Tokens

Add to `tokens/design-tokens.json` under `assets.icons`:

```json
{
  "assets": {
    "icons": {
      "actions": {
        "delete": {
          "$value": "~bootstrap-icons/icons/trash.svg",
          "$type": "asset",
          "$description": "Delete action"
        }
      }
    }
  }
}
```

This generates CSS variable: `--assets-icons-actions-delete`

### Using Icons in Components (mask-image)

Icons use CSS `mask-image` for styling with `currentColor`:

```scss
.ds-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: currentColor;  // Inherits text color
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;

  &--delete {
    mask-image: var(--assets-icons-actions-delete);
    -webkit-mask-image: var(--assets-icons-actions-delete);
  }
}
```

### Icon Swappability

Use semantic names (not icon names) so sources are swappable:

```json
// Easy to swap: change value, components stay the same
"delete": { "$value": "~bootstrap-icons/icons/trash.svg" }  // or
"delete": { "$value": "~lucide-static/icons/trash.svg" }
```

### Icon Component Requirements (CRITICAL)

**ALWAYS support BOTH SVG and font icons with the same tokens.** Users may use SVG tokens, font icons (Font Awesome), or framework icons interchangeably.

**Key principles:**
1. **Use `currentColor`** - Works for both SVG (`background-color`) and fonts (`color`)
2. **Use `em` units for size** - Icons scale with text, not fixed `px`/`rem`
3. **Use fluid sizing tokens** - Same approach as typography with `clamp()`

```scss
.ds-icon {
  /* ===== Icon Tokens ===== */
  --icon-size: 1em;                    // Scales with parent font-size
  --icon-color: currentColor;          // Inherits text color - works for BOTH SVG and font!

  /* ===== Base Styles (ALL icon types) ===== */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size);
  height: var(--icon-size);
  color: var(--icon-color);            // For font icons + inline SVGs
  fill: var(--icon-color);             // For inline SVGs
  line-height: 1;

  /* ===== SVG Token Icons (mask-image) ===== */
  // mask-image SVGs use background-color, which inherits from currentColor
  background-color: var(--icon-color);
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;

  /* ===== SVG Icon Variants - CREATE ONE FOR EACH ICON TOKEN ===== */
  &--delete {
    mask-image: var(--assets-icons-actions-delete);
    -webkit-mask-image: var(--assets-icons-actions-delete);
  }

  &--edit {
    mask-image: var(--assets-icons-actions-edit);
    -webkit-mask-image: var(--assets-icons-actions-edit);
  }

  &--search {
    mask-image: var(--assets-icons-actions-search);
    -webkit-mask-image: var(--assets-icons-actions-search);
  }

  // ... add more icon variants for each token in assets.icons

  /* ===== Font Icon Support ===== */
  // When using font icons, disable mask-image background
  // REMINDER: Font library must be in headIncludes.css config!
  &--font {
    background-color: transparent;
    font-family: var(--icon-font-family, 'Font Awesome 6 Free');
    font-weight: 900;
    -webkit-font-smoothing: antialiased;
  }

  /* ===== Size Variants (em-based, scales with context) ===== */
  &--sm { --icon-size: 0.75em; }
  &--lg { --icon-size: 1.5em; }
  &--xl { --icon-size: 2em; }
}
```

**Why this works for both:**
- `color: currentColor` → font icons inherit text color
- `fill: currentColor` → inline SVGs inherit text color
- `background-color: currentColor` → mask-image SVGs inherit text color
- All three use the SAME `--icon-color` token!

```jsx
// All these inherit the same color from parent
<button style={{ color: 'red' }}>
  <Icon name="delete" />           // SVG token - works
  <Icon name="delete" font />      // Font icon - works
  <Icon><Trash /></Icon>           // Framework - works
</button>
```
