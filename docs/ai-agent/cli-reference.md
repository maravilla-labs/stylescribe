# Stylescribe CLI Reference

Complete reference for all Stylescribe CLI commands.

## Commands Overview

| Command | Description |
|---------|-------------|
| `stylescribe init` | Initialize a new Stylescribe project |
| `stylescribe dev` | Start development server with hot reload |
| `stylescribe build` | Compile SCSS and generate documentation |
| `stylescribe docs` | Generate static documentation site |
| `stylescribe screenshots` | Generate screenshots for search thumbnails |
| `stylescribe tokens` | Design token operations |
| `stylescribe create-component` | Scaffold a new component |
| `stylescribe create-page` | Create a documentation page |
| `stylescribe add-theme` | Add a new theme |
| `stylescribe eject-theme` | Export theme configuration |

---

## stylescribe init

Initialize a new Stylescribe project with default structure.

```bash
stylescribe init [directory]
```

**Options:**
- `--yes, -y` - Skip prompts and use defaults
- `--name` - Project name
- `--description` - Project description
- `--dark` - Include dark mode support (default: true)
- `--theme-variant` - Include example theme variant
- `--prefix` - CSS class prefix (default: 'ds-')

**Examples:**
```bash
# Interactive setup
stylescribe init my-design-system

# Non-interactive with defaults
stylescribe init my-design-system -y

# With specific options
stylescribe init my-ds --name "My Design System" --prefix "my-"
```

**Creates:**
- `sass/` - SCSS source files with example components
- `tokens/` - Design tokens in W3C DTCG format
- `docs/` - Documentation markdown files
- `static/` - Static assets (images, fonts)
- `.stylescriberc.json` - Configuration file
- `package.json` - Project dependencies and scripts

---

## stylescribe dev

Start development server with hot reload.

```bash
stylescribe dev [options]
```

**Options:**
- `--source` - Source directory for SCSS (default: './sass')
- `--build-target` - Build output directory (default: '.stylescribe_dev')
- `--docs` - Documentation directory (default: './docs')
- `--port` - Server port (default: 4142)
- `--open` - Open browser automatically

**Examples:**
```bash
# Start with defaults
stylescribe dev

# Custom source and port
stylescribe dev --source ./src/styles --port 3000
```

**Behavior:**
- Compiles SCSS files and extracts annotations
- Watches for file changes
- Broadcasts changes via Socket.io for instant updates
- Serves at http://localhost:4142

---

## stylescribe build

Compile SCSS and generate component documentation.

```bash
stylescribe build [options]
```

**Options:**
- `--source` - Source directory for SCSS (default: './sass')
- `--output` - Output directory (default: './dist')

**Examples:**
```bash
stylescribe build
stylescribe build --source ./src/scss --output ./build
```

---

## stylescribe docs

Generate static documentation site.

```bash
stylescribe docs [options]
```

**Options:**
- `--source` - Source directory for SCSS
- `--build-target` - Build directory
- `--output` - Output directory for static site (default: './site')

**Examples:**
```bash
stylescribe docs
stylescribe docs --output ./documentation
```

---

## stylescribe screenshots

Generate screenshots for components, blocks, pages, and documentation. Screenshots appear as thumbnails in search results.

```bash
stylescribe screenshots [options]
```

**Prerequisites:** Requires Playwright. On first run, StyleScribe prompts to install it automatically.

**Options:**
- `--source` - Source directory (default: './sass')
- `--output` - Output directory, must run `stylescribe docs` first (default: './site')
- `--changed-only` - Only regenerate changed items (default: true)
- `--force` - Regenerate all screenshots, ignoring cache
- `--parallel` - Number of parallel browser workers (default: 4)
- `--viewport` - Viewport size as WxH (default: '800x600')
- `--format` - Image format: png, webp, jpeg (default: 'png')
- `--type` - What to screenshot: all, components, blocks, pages, docs (default: 'all')
- `--debug` - Enable debug mode

**Examples:**
```bash
# Generate all screenshots
stylescribe screenshots

# Only components
stylescribe screenshots --type=components

# Only documentation pages
stylescribe screenshots --type=docs

# Force regenerate all
stylescribe screenshots --force

# Debug mode
stylescribe screenshots --debug
```

**Output paths:**
- Components: `static/screenshots/component-{name}.png`
- Blocks: `static/screenshots/block-{name}.png`
- Pages: `static/screenshots/page-{name}.png`
- Docs: `static/screenshots/page-{slug-with-dashes}.png`

**Workflow:**
1. Run `stylescribe docs` to generate the site first
2. Run `stylescribe screenshots` to capture screenshots
3. Screenshots are cached - only changed items regenerate
4. Use `--force` to regenerate all screenshots

---

## stylescribe tokens

Manage W3C Design Tokens (DTCG format).

```bash
stylescribe tokens <action> [options]
```

**Actions:**
- `extract` - Extract tokens from CSS/SCSS files
- `export` - Export tokens to CSS/SCSS/JSON
- `validate` - Validate token file against W3C spec
- `convert` - Convert between formats
- `merge` - Merge multiple token files

**Options:**
- `--input, -i` - Input file or directory
- `--output, -o` - Output file path
- `--format, -f` - Output format: json, css, scss, style-dictionary
- `--prefix` - Filter CSS variables by prefix
- `--selector` - CSS selector for output (default: ':root')
- `--token-prefix` - Prefix to add to all CSS variable names

**Examples:**
```bash
# Extract tokens from CSS
stylescribe tokens extract -i ./src/tokens.css -o ./tokens.json

# Export tokens to CSS
stylescribe tokens export -i ./tokens.json -f css -o ./variables.css

# Validate token file
stylescribe tokens validate -i ./tokens.json

# Convert to SCSS
stylescribe tokens convert -i ./tokens.json -f scss -o ./tokens.scss

# Merge multiple token files
stylescribe tokens merge -i "./tokens/*.json" -o ./merged.json
```

---

## stylescribe create-component

Scaffold a new component.

```bash
stylescribe create-component <name> [options]
```

**Options:**
- `--source` - Source directory for components (default: './sass/components')
- `--group` - Component group (default: 'Components')

**Examples:**
```bash
stylescribe create-component button
stylescribe create-component modal --group "Containment"
```

**Creates:**
```
sass/components/<name>/
  └── <name>.scss    # Component with annotation template
```

---

## stylescribe create-page

Create a documentation page.

```bash
stylescribe create-page <name> [options]
```

**Options:**
- `--title` - Page title
- `--output` - Output directory (default: './docs')

**Examples:**
```bash
stylescribe create-page getting-started --title "Getting Started"
stylescribe create-page changelog
```

---

## stylescribe add-theme

Add a new theme to the project.

```bash
stylescribe add-theme <name> [options]
```

**Options:**
- `--dark` - Mark as dark mode theme (default: false)
- `--extends` - Theme to extend from
- `--tokens` - Path to base tokens file (default: 'tokens/design-tokens.json')
- `--output, -o` - Output directory for theme file (default: 'tokens')

**Examples:**
```bash
# Add a dark mode theme
stylescribe add-theme dark --dark

# Add a variant theme
stylescribe add-theme ocean

# Add a theme extending another
stylescribe add-theme ocean-dark --dark --extends ocean
```

**Creates:**
- Theme file at `tokens/<name>.json`
- Updates `design-tokens.json` with theme reference

---

## stylescribe eject-theme

Export theme configuration for customization.

```bash
stylescribe eject-theme <name> [options]
```

---

## Configuration (.stylescriberc.json)

See [Configuration Reference](./config-reference.md) for all options.

```json
{
  "productionBasepath": "@my-design-system/",
  "classPrefix": "ds-",
  "headIncludes": {
    "css": ["./base.css"]
  },
  "components": {
    "groupOrder": ["Actions", "Containment", "Communication"]
  },
  "tokens": {
    "source": "tokens/design-tokens.json",
    "include": ["tokens/components/*.json"]
  },
  "branding": {
    "name": "My Design System",
    "logo": "logo.png",
    "favicon": "favicon.png"
  },
  "static": "static"
}
```

---

## Common Workflows

### Create a new design system
```bash
stylescribe init my-design-system
cd my-design-system
npm install
npm run dev
```

### Add a new component
```bash
stylescribe create-component card --group "Containment"
# Edit sass/components/card/card.scss
```

### Add dark mode
```bash
stylescribe add-theme dark --dark
# Edit tokens/dark.json
```

### Build for production
```bash
npm run build
npm run docs
```
