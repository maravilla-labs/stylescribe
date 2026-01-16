# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stylescribe is a style guide generator for CSS/SCSS design systems with W3C Design Token support. It parses annotated stylesheets to generate interactive documentation with live reload capabilities and multi-theme support.

## Common Commands

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format

# Test with the example project
cd example && npm run dev     # Start dev server at http://localhost:4142
cd example && npm run build   # Test build command
cd example && npm run docs    # Test full documentation generation

# Link for local CLI development
npm link                      # Makes 'stylescribe' command use local version
```

## Architecture

### CLI Entry Point
- `bin/stylescribe.js` - Yargs CLI setup, registers all 13 commands

### Commands (`commands/`)
Each command exports `{ command, desc, builder, handler }`:

**Core Build:**
- `dev.js` - Development server with hot reload (Express + Socket.io)
- `build.js` - SCSS compilation and annotation extraction, generates CSS bundles
- `docs.js` - Static documentation site generation

**Project Setup:**
- `init.js` - Initialize new project with starter templates
- `createComponent.js` - Scaffold new component with SCSS template
- `createPage.js` - Create documentation page

**Tokens & Themes:**
- `tokens.js` - W3C Design Tokens (extract/export/validate/convert/merge)
- `addTheme.js` - Add new theme variant
- `ejectTheme.js` - Extract theme for customization

**Advanced:**
- `icons.js` - SVG icon system with npm package support
- `screenshots.js` - Playwright-based component screenshots
- `serve.js` - Serve static documentation
- `mcp.js` - Model Context Protocol server integration

### Core Utilities (`utils/`)

**Build Pipeline:**
- `fileOperations.js` - Main orchestrator: SCSS compilation (sass-embedded), Handlebars templating, file watching (chokidar). Exports `BuildEvents` EventEmitter and `DEV_SERVER_ROOT = '.stylescribe_dev'`
- `devserver.js` - Express server with Socket.io hot reload (default port: 4142)

**Parsing & Processing:**
- `annotations.js` - Parses JSDoc-style `@annotation` comments from CSS. Keys ending in 's' are parsed as arrays. Extracts CSS custom properties used (`cssVars`)
- `tokens.js` - W3C DTCG format support with 46 programmable token functions

**Modular Utilities:**
- `components/builder.js` - Aggregates component data into `components.json`
- `blocks/builder.js` - Handles UI blocks (HTML-first, docs-only content)
- `pages/builder.js` - Processes documentation pages with front-matter
- `scss/compiler.js` - SCSS compilation with custom importers (~ for node_modules, SVG to base64)
- `tokens/processor.js` - Token function evaluation (46 functions: color, accessibility, typography, math)
- `config/loader.js` - Loads `.stylescriberc.json` configuration
- `templates/handlebars.js` - Handlebars instance with helpers
- `navigation/builder.js` - Navigation structure from docs
- `search/indexBuilder.js` - Lunr.js search index generation
- `pathResolver.js` - Template path resolution with user override support

### Template System
- Default templates in `templates/` (Handlebars `.hbs` files)
- Users can override by creating `.stylescribe/templates/` in their project
- Partials loaded from `templates/includes/`
- Handlebars helpers: `eq`, `prettyprint`, `nl2br`, `capitalizeFirst`, `json`, `itemName`, `itemDescription`
- Tech stack: Handlebars + Pug, Tailwind CSS 4, Alpine.js, HTMX

### Build Flow
1. SCSS files compiled via sass-embedded with custom importers (~ for node_modules, .svg auto-converted to base64)
2. Annotations extracted from CSS comment blocks
3. Component/block/page data aggregated
4. Theme CSS generated with `[data-theme="dark"]` selectors and `.theme-*` classes
5. Handlebars templates render HTML pages
6. Lunr search index built

## Code Style

- ES Modules only (`import`/`export`, not CommonJS)
- Always include `.js` extension in imports
- Use `async`/`await` over raw Promises
- Use `chalk` for colored console output
- Node.js 20+ required
- Tests use Vitest, located in `tests/`

## Key Patterns

### Adding a New CLI Command
1. Create `commands/myCommand.js` with exports: `command`, `desc`, `builder`, `handler`
2. Import and register in `bin/stylescribe.js`
3. Add tests in `tests/`

### Component Annotations
Components use JSDoc-style comments with `@annotation` syntax. Key annotations: `@title`, `@description`, `@group`, `@order`, `@verified`, `@draft`, `@variations`, `@additional_variations`, `@elements`, `@dependencies`, `@examples`, `@role`, `@maintag`, `@navtitle`. See `utils/annotations.js` for parsing logic.

### Variation Preview System
Variation previews use the **first `@example`** as a template to preserve proper HTML nesting. This is critical for compositional components like dropdown, modal, and tabs where elements must be nested.

**How it works:**
1. Takes the first `@example` code block
2. Removes any existing variation classes (e.g., `--open`)
3. Adds the new variation class (e.g., `--scrollable`)
4. Falls back to flat element generation only if no examples exist

**Why this matters:**
- Simple components (button, badge): Work with flat `@elements` generation
- Nested components (dropdown, tabs): Require proper HTML structure from `@examples`

### Class Prefix Convention
- Default prefix: `ds-`
- In `@examples` code blocks, always use `ds-` - it's automatically transformed to the configured `classPrefix` from `.stylescriberc.json`
- In SCSS selectors, use `{{prefix}}` for configurable prefixes

### Dev Server Root
During development, built files go to `.stylescribe_dev/` (exported as `DEV_SERVER_ROOT` from fileOperations.js).

### Programmable Token Functions
46 build-time functions in `utils/tokens/processor.js`:
- **Color (15):** tint, shade, mix, adjust, alpha, complement, saturate, desaturate, invert, grayscale, darkMode, colorScale, lighten, darken, hueRotate
- **Accessibility (8):** contrastRatio, meetsContrast, accessibleText, ensureContrast, luminance, isLight, isDark, accessiblePair
- **Typography (8):** fluidType, modularScale, typeScale, fluidSpace, lineHeight, optimalMeasure, responsiveType, letterSpacing
- **Math (15):** multiply, divide, add, subtract, round, floor, ceil, min, max, clamp, convert, mod, abs, negate, percent
