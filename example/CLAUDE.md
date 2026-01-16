# CLAUDE.md

## Project Overview

Styles Scribe Example - A design system built with Stylescribe.

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

**ALWAYS use `ds-` prefix in source SCSS files.** The configured prefix (`sol-`) is applied automatically at build time.

```scss
// ✅ CORRECT - Always use ds- in source
.ds-button { }
.ds-card { }

// ❌ WRONG - Never use configured prefix in source
.sol-button { }  // NO!
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
- `@variations` - Available modifiers
- `@elements` - BEM elements
- `@dependencies` - Other components used
- `@examples` - YAML format with `title` and `code` (REQUIRED!)

### @examples Format (CRITICAL FOR VARIATIONS!)
```scss
@examples
- title: Example Name
  code: |
    <div class="ds-component">Content</div>
```

**NEVER put raw HTML after @examples. ALWAYS use YAML list with title/code.**

### Why @examples Matter for Variations

**The first `@example` is used as a template for all variation previews.** This is critical for nested/compositional components.

```scss
// ✅ GOOD - First example shows full structure (dropdown)
@examples
- title: Basic Menu
  code: |
    <div class="ds-dropdown">
      <button class="ds-dropdown__trigger">Open</button>
      <div class="ds-dropdown__menu">
        <button class="ds-dropdown__item">Item 1</button>
        <button class="ds-dropdown__item">Item 2</button>
      </div>
    </div>

// ❌ BAD - Flat structure breaks variation previews
@examples
- title: Just Trigger
  code: |
    <button class="ds-dropdown__trigger">Open</button>
```

**For nested components (dropdown, modal, tabs, accordion):**
- First example MUST show complete nested HTML structure
- Variation previews reuse this structure with the variation class applied
- Without proper nesting, variation previews will be broken

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
