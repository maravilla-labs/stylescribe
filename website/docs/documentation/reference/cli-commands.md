---
title: CLI Commands
navtitle: CLI Commands
slug: cli-commands
order: 1
---

StyleScribe provides 13 CLI commands for managing your design system documentation.

## Core Commands

### `stylescribe init [directory]`

Initialize a new StyleScribe project with interactive prompts or flags.

```bash
# Interactive setup
stylescribe init

# Quick setup with defaults
stylescribe init my-project --yes

# Full customization
stylescribe init my-docs \
  --name="My Design System" \
  --dark \
  --theme-variant="brand" \
  --prefix="ui-" \
  --claude
```

| Option | Description |
|--------|-------------|
| `--yes, -y` | Skip prompts, use defaults |
| `--name` | Project name |
| `--description` | Project description |
| `--dark` | Enable dark mode |
| `--theme-variant` | Add custom theme variant |
| `--prefix` | CSS class prefix |
| `--claude` | Generate CLAUDE.md for AI assistance |

---

### `stylescribe dev`

Start the development server with hot reload.

```bash
# Default (watches ./sass, serves on port 4142)
stylescribe dev

# Custom source directory
stylescribe dev --source=./src/styles

# Enable screenshot generation
stylescribe dev --screenshots
```

| Option | Default | Description |
|--------|---------|-------------|
| `--source, -s` | `./sass` | Source SCSS directory |
| `--build-target, -b` | `./build` | Build output directory |
| `--watch, -w` | `true` | Watch for changes |
| `--screenshots` | `false` | Generate component screenshots |

The dev server:
- Compiles SCSS with custom importers
- Extracts component annotations
- Processes markdown documentation
- Hot reloads the browser on changes

---

### `stylescribe build`

Generate production-ready CSS bundles.

```bash
# Default build
stylescribe build

# Custom output
stylescribe build --output=./dist/css
```

| Option | Default | Description |
|--------|---------|-------------|
| `--source, -s` | `./sass` | Source SCSS directory |
| `--output, -o` | `./build` | Output directory |
| `--bundles` | `true` | Generate bundle files |

**Output structure:**

```
build/
├── base.css              # Base styles
├── components/           # Individual component CSS
└── css/
    ├── bundle.all.css    # Everything combined
    ├── bundle.dark.css   # Dark theme bundle
    ├── all-components.css
    ├── themes.css
    └── themes/
        └── dark.css
```

---

### `stylescribe docs`

Generate a complete static documentation site.

```bash
# Generate to ./site
stylescribe docs

# Custom output with screenshots
stylescribe docs --output=./public --screenshots
```

| Option | Default | Description |
|--------|---------|-------------|
| `--source, -s` | `./sass` | Source SCSS directory |
| `--output, -o` | `./site` | Output directory |
| `--build-target, -b` | `./build` | Build directory |
| `--watch, -w` | `false` | Watch mode |
| `--screenshots` | `false` | Generate screenshots after build |

---

## Component & Page Commands

### `stylescribe create-component <name>`

Scaffold a new component with annotation template.

```bash
# Create button component in Actions group
stylescribe create-component button --group="Actions"

# With custom source directory
stylescribe create-component card --group="Layout" --source=./src/components
```

| Option | Default | Description |
|--------|---------|-------------|
| `--group, -g` | *required* | Component group/category |
| `--source, -s` | `./sass/components` | Components directory |
| `--with-tokens` | `true` | Include token boilerplate |

**Creates:**

```
sass/components/button/
└── button.scss
```

---

### `stylescribe create-page <name>`

Create a new documentation page.

```bash
# Create usage guide
stylescribe create-page usage --title="Usage Guide"

# Custom output directory
stylescribe create-page api-reference --output=./content
```

| Option | Default | Description |
|--------|---------|-------------|
| `--title, -t` | Derived from name | Page title |
| `--output, -o` | `./docs` | Output directory |

---

## Token Commands

### `stylescribe tokens <action>`

Manage W3C Design Tokens.

#### `tokens extract`

Extract CSS custom properties to DTCG format.

```bash
stylescribe tokens extract -i ./src/tokens.css -o ./tokens.json
```

#### `tokens export`

Export tokens to CSS, SCSS, or Style Dictionary.

```bash
# Export to CSS
stylescribe tokens export -i ./tokens.json -f css -o ./variables.css

# Export to SCSS
stylescribe tokens export -i ./tokens.json -f scss -o ./_tokens.scss

# Export to Style Dictionary
stylescribe tokens export -i ./tokens.json -f style-dictionary -o ./sd-tokens.json
```

#### `tokens validate`

Validate a token file against W3C DTCG spec.

```bash
stylescribe tokens validate -i ./tokens/design-tokens.json
```

#### `tokens convert`

Convert between formats.

```bash
stylescribe tokens convert -i ./tokens.json -f scss -o ./tokens.scss
```

#### `tokens merge`

Merge multiple token files.

```bash
stylescribe tokens merge -i "./tokens/*.json" -o ./merged.json
```

| Option | Description |
|--------|-------------|
| `-i, --input` | Input file or glob pattern |
| `-o, --output` | Output file path |
| `-f, --format` | Output format: `json`, `css`, `scss`, `style-dictionary` |
| `--prefix` | Filter CSS variables by prefix |
| `--selector` | CSS selector (default: `:root`) |
| `--token-prefix` | Prefix for CSS variable names |

---

## Theme Commands

### `stylescribe add-theme <name>`

Add a new theme to your project.

```bash
# Add dark theme
stylescribe add-theme dark --dark

# Add theme extending another
stylescribe add-theme ocean --extends=dark
```

| Option | Default | Description |
|--------|---------|-------------|
| `--dark` | `false` | Mark as dark mode theme |
| `--extends` | - | Theme to extend from |
| `--tokens` | `tokens/design-tokens.json` | Base tokens file |
| `-o, --output` | `tokens` | Output directory |

---

### `stylescribe eject-theme [preset]`

Eject a theme preset for Tailwind class customization.

```bash
# List available presets
stylescribe eject-theme --list

# Preview theme classes
stylescribe eject-theme dracula --show

# Eject for customization
stylescribe eject-theme dracula
```

| Option | Alias | Description |
|--------|-------|-------------|
| `--list` | `-l` | List available theme presets |
| `--show` | `-s` | Show theme Tailwind classes without ejecting |

**Available presets:** `default`, `dracula`, `nord`, `oneDark`, `solarized`, `ocean`

**Tip:** For simple theme switching, just set `"branding": { "theme": "dracula" }` in your config — no eject needed.

See [Customization Guide](../guides/customization.html) for complete theming documentation.

---

## Icon Commands

### `stylescribe icons <action>`

Manage icon assets.

#### `icons list`

List installed icon packages.

```bash
stylescribe icons list
```

#### `icons search`

Search for icons by name.

```bash
stylescribe icons search -q "trash"
stylescribe icons search -q "arrow" --limit=20
```

#### `icons discover`

List all icons in a package.

```bash
stylescribe icons discover -p bootstrap-icons
```

#### `icons path`

Get the token path for a specific icon.

```bash
stylescribe icons path -p bootstrap-icons -i trash
# Output: ~bootstrap-icons/icons/trash.svg
```

#### `icons supported`

List all supported icon packages.

```bash
stylescribe icons supported
```

**Supported packages:**
- `bootstrap-icons`
- `lucide-static`
- `heroicons`
- `feather-icons`
- `@tabler/icons`

---

## Utility Commands

### `stylescribe serve`

Serve the generated documentation site.

```bash
# Serve ./site on port 4142
stylescribe serve

# Custom directory and port
stylescribe serve --dir=./public --port=3000
```

| Option | Default | Description |
|--------|---------|-------------|
| `-d, --dir` | `./site` | Directory to serve |
| `-p, --port` | `4142` | Port number |
| `-o, --open` | `true` | Open browser |
| `--host` | `localhost` | Host address |

---

### `stylescribe screenshots`

Generate screenshots for components, blocks, pages, and documentation. Screenshots appear as thumbnails in search results.

**Prerequisites:** Playwright is required. On first run, StyleScribe will prompt to install it automatically.

```bash
# Generate all screenshots (components, blocks, pages, docs)
stylescribe screenshots

# Only changed items
stylescribe screenshots --changed-only

# Specific type
stylescribe screenshots --type=components
stylescribe screenshots --type=docs

# Force regenerate all
stylescribe screenshots --force

# Debug mode
stylescribe screenshots --debug
```

| Option | Default | Description |
|--------|---------|-------------|
| `--source` | `./sass` | Source directory |
| `--output` | `./site` | Output directory (must run `stylescribe docs` first) |
| `--changed-only` | `true` | Only regenerate changed items |
| `--parallel` | `4` | Parallel browser workers |
| `--viewport` | `800x600` | Viewport size (WxH) |
| `--format` | `png` | Image format: `png`, `webp`, `jpeg` |
| `--type` | `all` | What to screenshot: `all`, `components`, `blocks`, `pages`, `docs` |
| `--force` | `false` | Regenerate all (ignore cache) |

**Output:** Screenshots are saved to `./static/screenshots/` with naming convention:
- Components: `component-{name}.png`
- Blocks: `block-{name}.png`
- Pages: `page-{name}.png`
- Docs: `page-{slug-with-dashes}.png`

**Search Integration:** Screenshots automatically appear as thumbnails in search results when available.

---

### `stylescribe mcp`

Start the MCP (Model Context Protocol) server for AI assistant integration.

```bash
stylescribe mcp
```

This is typically invoked automatically by AI tools like Claude Code. See [MCP Integration](./mcp-integration.html) for details.
