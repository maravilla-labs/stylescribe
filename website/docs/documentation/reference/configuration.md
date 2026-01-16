---
title: Configuration
navtitle: Configuration
slug: configuration
order: 3
---

Configure StyleScribe with `.stylescriberc.json` in your project root.

## Basic Configuration

```json
{
  "productionBasepath": "@myorg/design-system/",
  "classPrefix": "ds-",
  "tokensFile": "tokens/design-tokens.json"
}
```

## All Options

### productionBasepath

Base path for production asset URLs.

```json
{
  "productionBasepath": "@myorg/design-system/"
}
```

Used when generating import paths in documentation.

---

### classPrefix

CSS class prefix applied at build time.

```json
{
  "classPrefix": "ui-"
}
```

Source files use `ds-` prefix; the configured prefix replaces it in output.

---

### tokens

Token file configuration.

```json
{
  "tokens": {
    "source": "tokens/design-tokens.json",
    "include": [
      "tokens/components/*.json"
    ]
  }
}
```

| Property | Description |
|----------|-------------|
| `source` | Main token file |
| `include` | Additional token files (glob patterns) |

---

### tokensFile

Shorthand for single token file (alternative to `tokens.source`).

```json
{
  "tokensFile": "tokens/design-tokens.json"
}
```

---

### components

Component configuration.

```json
{
  "components": {
    "groupOrder": [
      "Foundation",
      "Actions",
      "Layout",
      "Communication"
    ]
  }
}
```

| Property | Description |
|----------|-------------|
| `groupOrder` | Order of component groups in navigation |

---

### themes

Theme configuration.

```json
{
  "themes": {
    "darkModeAttribute": "dark",
    "themeClassPrefix": "theme-"
  }
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `darkModeAttribute` | `"dark"` | Value for `data-theme` attribute |
| `themeClassPrefix` | `"theme-"` | Prefix for theme classes |

---

### branding

Branding assets, name, and documentation site theme.

```json
{
  "branding": {
    "name": "My Design System",
    "logo": "logo.png",
    "favicon": "favicon.ico",
    "theme": "dracula"
  }
}
```

| Property | Description |
|----------|-------------|
| `name` | Display name |
| `logo` | Logo image (in static directory) |
| `favicon` | Favicon image |
| `theme` | Documentation site UI theme (preset name or custom object) |

**Available Theme Presets:**

| Preset | Description |
|--------|-------------|
| `default` | Purple/indigo gradient |
| `dracula` | Dark purple with pink accents |
| `nord` | Arctic, bluish palette |
| `oneDark` | Atom's dark theme |
| `solarized` | Classic developer theme |
| `ocean` | Deep blue with teal accents |

**Custom Theme:**

For custom styling, eject a preset and modify Tailwind classes:

```bash
stylescribe eject-theme dracula
```

This adds the full theme object to your config for customization:

```json
{
  "branding": {
    "theme": {
      "preset": "dracula",
      "hero": {
        "background": "bg-[#282a36]",
        "text": "text-[#f8f8f2]"
      },
      "nav": {
        "background": "bg-[#282a36]"
      }
    }
  }
}
```

See [CLI Commands - eject-theme](./cli-commands.html#stylescribe-eject-theme-preset) for details.

---

### headIncludes

External assets to include in `<head>`.

```json
{
  "headIncludes": {
    "css": [
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700",
      "./base.css"
    ],
    "js": [
      "https://cdn.example.com/analytics.js"
    ]
  }
}
```

| Property | Description |
|----------|-------------|
| `css` | CSS files/URLs to include |
| `js` | JavaScript files/URLs to include |

---

### packageFiles

External package files to copy.

```json
{
  "packageFiles": [
    "~@myorg/tokens/variables.css:./css/"
  ]
}
```

Format: `~package/path:destination`

---

### static

Static files directory.

```json
{
  "static": "static"
}
```

Files are copied to output root.

---

### build

Build configuration.

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

| Bundle | Description |
|--------|-------------|
| `all` | Everything in one file (`bundle.all.css`) |
| `perTheme` | Per-theme bundles (`bundle.dark.css`) |
| `allComponents` | All components without themes |
| `themes` | All themes combined |
| `themesIndividual` | Individual theme files |

---

### screenshots

Screenshot configuration.

```json
{
  "screenshots": {
    "viewport": "800x600",
    "format": "png",
    "parallel": 4
  }
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `viewport` | `"800x600"` | Screenshot dimensions |
| `format` | `"png"` | Image format |
| `parallel` | `4` | Parallel workers |

---

## Complete Example

```json
{
  "productionBasepath": "@acme/design-system/",
  "classPrefix": "acme-",

  "tokens": {
    "source": "tokens/design-tokens.json",
    "include": ["tokens/components/*.json"]
  },

  "components": {
    "groupOrder": [
      "Foundation",
      "Actions",
      "Forms",
      "Layout",
      "Navigation",
      "Feedback"
    ]
  },

  "themes": {
    "darkModeAttribute": "dark",
    "themeClassPrefix": "theme-"
  },

  "branding": {
    "name": "ACME Design System",
    "logo": "acme-logo.svg",
    "favicon": "favicon.png",
    "theme": "ocean"
  },

  "headIncludes": {
    "css": [
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700",
      "https://fonts.googleapis.com/css2?family=JetBrains+Mono"
    ]
  },

  "static": "static",

  "build": {
    "bundles": {
      "all": true,
      "perTheme": true,
      "allComponents": true,
      "themes": true,
      "themesIndividual": true
    }
  },

  "screenshots": {
    "viewport": "1024x768",
    "format": "webp",
    "parallel": 8
  }
}
```

## Environment-Specific Config

Use different configs for development vs production:

```bash
# Development
STYLESCRIBE_CONFIG=.stylescriberc.dev.json stylescribe dev

# Production
stylescribe docs
```

Or use environment variables in your npm scripts:

```json
{
  "scripts": {
    "dev": "stylescribe dev",
    "build": "stylescribe build",
    "docs": "stylescribe docs"
  }
}
```
