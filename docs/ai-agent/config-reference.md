# Configuration Reference

Complete reference for `.stylescriberc.json` configuration options.

## File Location

Place `.stylescriberc.json` in your project root:

```
my-project/
├── .stylescriberc.json
├── sass/
├── tokens/
└── docs/
```

---

## Complete Configuration

```json
{
  "productionBasepath": "@my-design-system/",
  "classPrefix": "ds-",
  "headIncludes": {
    "css": ["./base.css"],
    "js": []
  },
  "components": {
    "groupOrder": ["Actions", "Containment", "Communication", "Identity"],
    "exclude": ["_partials/**"]
  },
  "tokens": {
    "source": "tokens/design-tokens.json",
    "include": ["tokens/components/*.json"],
    "prefix": ""
  },
  "branding": {
    "name": "My Design System",
    "logo": "logo.png",
    "favicon": "favicon.png"
  },
  "static": "static",
  "docs": {
    "source": "docs",
    "output": "site"
  },
  "devServer": {
    "port": 4142,
    "open": false
  }
}
```

---

## Option Reference

### productionBasepath

**Type:** `string`
**Default:** `"./"`

Base path for production assets. Used when generating static documentation.

```json
{
  "productionBasepath": "@my-design-system/"
}
```

### classPrefix

**Type:** `string`
**Default:** `"ds-"`

CSS class prefix for components. Applied to scaffolded components.

```json
{
  "classPrefix": "sol-"
}
```

Generated component:
```scss
.sol-button { ... }
.sol-button__icon { ... }
.sol-button--primary { ... }
```

---

### headIncludes

**Type:** `object`

Additional CSS and JavaScript files to include in documentation pages.

```json
{
  "headIncludes": {
    "css": ["./base.css", "./custom.css"],
    "js": ["./polyfills.js"]
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `css` | `string[]` | CSS files to link in `<head>` |
| `js` | `string[]` | JavaScript files to load |

Paths are relative to the build output directory.

---

### components

**Type:** `object`

Component discovery and organization settings.

```json
{
  "components": {
    "groupOrder": ["Actions", "Containment", "Communication", "Identity", "AI Chat"],
    "exclude": ["_partials/**", "_mixins/**"]
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `groupOrder` | `string[]` | Order of component groups in navigation |
| `exclude` | `string[]` | Glob patterns to exclude from component parsing |

#### groupOrder

Components are grouped by their `@group` annotation. This array defines the display order:

```json
{
  "groupOrder": ["Actions", "Containment", "Communication"]
}
```

Groups not listed appear after listed groups in alphabetical order.

---

### tokens

**Type:** `object`

Design token configuration.

```json
{
  "tokens": {
    "source": "tokens/design-tokens.json",
    "include": ["tokens/components/*.json"],
    "prefix": "sol-"
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `source` | `string` | Path to main design tokens file |
| `include` | `string[]` | Glob patterns for additional token files to merge |
| `prefix` | `string` | Prefix for generated CSS custom properties |

#### Token File Merging

Files matching `include` patterns are merged with the main source:

```
tokens/
├── design-tokens.json     # source
├── components/
│   ├── button.json        # included
│   └── card.json          # included
└── dark.json              # theme (referenced in $meta.themes)
```

---

### branding

**Type:** `object`

Documentation site branding.

```json
{
  "branding": {
    "name": "My Design System",
    "logo": "logo.png",
    "favicon": "favicon.png"
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Display name in navigation header |
| `logo` | `string` | Logo image file (from static directory) |
| `favicon` | `string` | Favicon file (from static directory) |

---

### static

**Type:** `string`
**Default:** `"static"`

Directory for static assets (images, fonts, etc.).

```json
{
  "static": "static"
}
```

Contents are copied to the build output.

---

### docs

**Type:** `object`

Documentation generation settings.

```json
{
  "docs": {
    "source": "docs",
    "output": "site"
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `source` | `string` | Source directory for markdown documentation |
| `output` | `string` | Output directory for generated static site |

---

### devServer

**Type:** `object`

Development server settings.

```json
{
  "devServer": {
    "port": 4142,
    "open": false,
    "host": "localhost"
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `port` | `number` | `4142` | Server port |
| `open` | `boolean` | `false` | Auto-open browser |
| `host` | `string` | `"localhost"` | Server host |

---

## Example Configurations

### Minimal

```json
{
  "branding": {
    "name": "My Design System"
  }
}
```

### Standard Project

```json
{
  "classPrefix": "ds-",
  "components": {
    "groupOrder": ["Actions", "Containment", "Communication"]
  },
  "tokens": {
    "source": "tokens/design-tokens.json"
  },
  "branding": {
    "name": "Design System",
    "logo": "logo.png"
  },
  "static": "static"
}
```

### Enterprise Project

```json
{
  "productionBasepath": "https://cdn.example.com/design-system/",
  "classPrefix": "acme-",
  "headIncludes": {
    "css": ["./base.css", "./utilities.css"],
    "js": ["./analytics.js"]
  },
  "components": {
    "groupOrder": [
      "Actions",
      "Forms",
      "Navigation",
      "Containment",
      "Communication",
      "Data Display"
    ],
    "exclude": ["_internal/**", "_deprecated/**"]
  },
  "tokens": {
    "source": "tokens/design-tokens.json",
    "include": [
      "tokens/components/*.json",
      "tokens/themes/*.json"
    ],
    "prefix": "acme-"
  },
  "branding": {
    "name": "ACME Design System",
    "logo": "acme-logo.svg",
    "favicon": "favicon.ico"
  },
  "static": "assets",
  "docs": {
    "source": "documentation",
    "output": "dist/docs"
  },
  "devServer": {
    "port": 3000,
    "open": true
  }
}
```

---

## Environment-Specific Config

Use different configurations for development vs production by checking the environment in your scripts:

**package.json:**
```json
{
  "scripts": {
    "dev": "stylescribe dev",
    "build": "NODE_ENV=production stylescribe build",
    "docs": "NODE_ENV=production stylescribe docs"
  }
}
```

---

## Validation

If your configuration is invalid, Stylescribe will log warnings and use defaults for invalid options.

Check your configuration by running:

```bash
stylescribe dev --verbose
```

---

## Extending Configuration

For complex projects, you can extend configuration programmatically:

```javascript
// stylescribe.config.js (future support)
import baseConfig from './.stylescriberc.json';

export default {
  ...baseConfig,
  branding: {
    ...baseConfig.branding,
    name: process.env.BRAND_NAME || baseConfig.branding.name
  }
};
```
