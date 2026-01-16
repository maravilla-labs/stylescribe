---
title: Icons
navtitle: Icons
slug: icons
order: 5
---

StyleScribe provides a powerful icon system using CSS `mask-image` and design tokens. Icons are defined as tokens, discovered via CLI, and rendered with CSS that inherits color from the parent element.

## Why CSS Mask-Image Icons?

Traditional approaches have limitations:
- **Inline SVG**: Verbose HTML, hard to change colors dynamically
- **Font icons**: Require external CDN, limited styling options
- **IMG tags**: Can't change color, separate HTTP requests

**The mask-image approach** solves all of these:
- Icons defined as **design tokens** (single source of truth)
- Inherit color via `currentColor` (style with CSS)
- Build-time optimization (SVGs embedded as base64)
- **Swappable** between icon packages without code changes

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Define icon token                                                │
│    tokens/design-tokens.json:                                       │
│    "delete": { "$value": "~bootstrap-icons/icons/trash.svg" }       │
│                                                                     │
│ 2. Build resolves to base64 data URI                               │
│    --assets-icons-actions-delete: url("data:image/svg+xml;...")     │
│                                                                     │
│ 3. CSS uses mask-image                                              │
│    .icon--delete { mask-image: var(--assets-icons-actions-delete) } │
│                                                                     │
│ 4. Color inherits from parent                                       │
│    <button style="color: red">                                      │
│      <span class="icon icon--delete"></span> ← Red icon!            │
│    </button>                                                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Icon Sources

StyleScribe can use **any SVG file** that's resolvable from your project. This includes:

### npm Packages (with `~` prefix)

The `~` prefix resolves to `node_modules`:

```json
"delete": { "$value": "~bootstrap-icons/icons/trash.svg", "$type": "asset" }
```

### Local SVG Files (relative paths)

Use relative paths from your tokens file:

```json
"logo": { "$value": "../assets/icons/logo.svg", "$type": "asset" }
"custom-icon": { "$value": "./icons/my-icon.svg", "$type": "asset" }
```

### Any npm Package with SVGs

Not limited to icon packages - any npm package containing SVGs works:

```json
"some-icon": { "$value": "~some-package/dist/icon.svg", "$type": "asset" }
```

## CLI Icon Discovery

The CLI `icons` commands provide **convenient discovery** for popular icon packages. These commands know where icons are located in each package:

| Package | Install | Icons | Website |
|---------|---------|-------|---------|
| Bootstrap Icons | `npm i bootstrap-icons` | 2000+ | [icons.getbootstrap.com](https://icons.getbootstrap.com/) |
| Lucide | `npm i lucide-static` | 1400+ | [lucide.dev](https://lucide.dev/) |
| Heroicons | `npm i heroicons` | 450+ | [heroicons.com](https://heroicons.com/) |
| Feather Icons | `npm i feather-icons` | 280+ | [feathericons.com](https://feathericons.com/) |
| Tabler Icons | `npm i @tabler/icons` | 4500+ | [tabler-icons.io](https://tabler-icons.io/) |

> **Note:** The CLI discovery only works with these packages. For other packages or local SVGs, you'll need to find the paths manually and add them directly to your tokens.

Install one or more packages to use CLI discovery:

```bash
npm install bootstrap-icons lucide-static
```

## CLI: Discovering Icons

StyleScribe includes CLI commands to find and add icons without leaving your terminal.

### List Installed Packages

```bash
stylescribe icons list
```

Shows all installed icon packages with their icon counts:

```
Installed icon packages:

  Bootstrap Icons (bootstrap-icons)
    Icons: 2048
    Pattern: ~bootstrap-icons/icons/{name}.svg
    Website: https://icons.getbootstrap.com/

  Lucide (lucide-static)
    Icons: 1423
    Pattern: ~lucide-static/icons/{name}.svg
    Website: https://lucide.dev/
```

### Search for Icons

```bash
stylescribe icons search -q "trash"
```

Search across all installed packages:

```
Found 4 icons matching "trash":

  trash (bootstrap-icons)
    ~bootstrap-icons/icons/trash.svg

  trash-fill (bootstrap-icons)
    ~bootstrap-icons/icons/trash-fill.svg

  trash (lucide-static)
    ~lucide-static/icons/trash.svg

  trash-2 (lucide-static)
    ~lucide-static/icons/trash-2.svg
```

### Discover All Icons in a Package

```bash
stylescribe icons discover -p bootstrap-icons --limit 100
```

Lists all icons in a specific package:

```
Bootstrap Icons (2048 icons)

Path pattern: ~bootstrap-icons/icons/{name}.svg
Website: https://icons.getbootstrap.com/

Icons:

  0-circle             0-circle-fill        0-square             0-square-fill
  1-circle             1-circle-fill        1-square             1-square-fill
  ...
```

### Get Token Path for an Icon

```bash
stylescribe icons path -p bootstrap-icons -i trash
```

Outputs the exact token format to add to your design tokens:

```
Icon path:

  ~bootstrap-icons/icons/trash.svg

Token format (W3C DTCG):

  {
    "assets": {
      "icons": {
        "your-category": {
          "trash": {
            "$value": "~bootstrap-icons/icons/trash.svg",
            "$type": "asset",
            "$description": "Description here"
          }
        }
      }
    }
  }
```

### Show All Supported Packages

```bash
stylescribe icons supported
```

## Adding Icons to Your Design System

### Step 1: Find the Icon

```bash
stylescribe icons search -q "edit"
```

### Step 2: Get the Token Path

```bash
stylescribe icons path -p lucide-static -i pencil
```

### Step 3: Add to Design Tokens

Edit `tokens/design-tokens.json`:

```json
{
  "assets": {
    "icons": {
      "actions": {
        "edit": {
          "$value": "~lucide-static/icons/pencil.svg",
          "$type": "asset",
          "$description": "Edit action icon"
        },
        "delete": {
          "$value": "~bootstrap-icons/icons/trash.svg",
          "$type": "asset",
          "$description": "Delete action icon"
        }
      },
      "navigation": {
        "home": {
          "$value": "~lucide-static/icons/home.svg",
          "$type": "asset"
        },
        "menu": {
          "$value": "~lucide-static/icons/menu.svg",
          "$type": "asset"
        }
      }
    }
  }
}
```

### Step 4: Use in Your Icon Component

The build generates CSS variables like `--assets-icons-actions-edit`. Use them in your icon component:

```scss
.ds-icon {
  &--edit {
    mask-image: var(--assets-icons-actions-edit);
    -webkit-mask-image: var(--assets-icons-actions-edit);
  }
  &--delete {
    mask-image: var(--assets-icons-actions-delete);
    -webkit-mask-image: var(--assets-icons-actions-delete);
  }
}
```

## Creating an Icon Component

Here's a complete icon component using the mask-image technique:

```scss
/**
 * @title Icon
 * @description Stylable icons using CSS mask-image
 * @group Primitives
 * @variations delete, edit, add, search, home, menu
 */
.ds-icon {
  /* ===== Component Tokens ===== */
  --icon-size: 1em;
  --icon-color: currentColor;

  /* ===== Base Styles ===== */
  display: inline-block;
  width: var(--icon-size);
  height: var(--icon-size);
  vertical-align: middle;
  flex-shrink: 0;

  /* Icon inherits color from parent */
  background-color: var(--icon-color);

  /* Common mask properties */
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;

  /* ===== Icon Variations ===== */
  &--delete {
    mask-image: var(--assets-icons-actions-delete);
    -webkit-mask-image: var(--assets-icons-actions-delete);
  }

  &--edit {
    mask-image: var(--assets-icons-actions-edit);
    -webkit-mask-image: var(--assets-icons-actions-edit);
  }

  &--add {
    mask-image: var(--assets-icons-actions-add);
    -webkit-mask-image: var(--assets-icons-actions-add);
  }

  &--search {
    mask-image: var(--assets-icons-actions-search);
    -webkit-mask-image: var(--assets-icons-actions-search);
  }

  /* ===== Size Modifiers ===== */
  &--sm { --icon-size: 0.75em; }
  &--lg { --icon-size: 1.5em; }
  &--xl { --icon-size: 2em; }
}
```

## Using Icons in HTML

### Basic Usage

```html
<span class="icon icon--delete"></span>
<span class="icon icon--edit"></span>
<span class="icon icon--search"></span>
```

### With Sizes

```html
<span class="icon icon--home icon--sm"></span>  <!-- Small -->
<span class="icon icon--home"></span>            <!-- Default (1em) -->
<span class="icon icon--home icon--lg"></span>  <!-- Large -->
<span class="icon icon--home icon--xl"></span>  <!-- Extra large -->
```

### Colored Icons

Icons inherit color from their parent. Style with CSS:

```html
<!-- Inherit parent color -->
<button style="color: red;">
  <span class="icon icon--delete"></span> Delete
</button>

<!-- Direct styling -->
<span class="icon icon--success" style="color: green;"></span>
<span class="icon icon--warning" style="color: orange;"></span>
<span class="icon icon--error" style="color: red;"></span>
```

### In Buttons

```html
<button class="btn btn--primary">
  <span class="icon icon--add"></span>
  Add Item
</button>

<button class="btn btn--danger">
  <span class="icon icon--delete"></span>
  Delete
</button>
```

## Icon Swappability

A key benefit of the token approach: **swap icon packages without changing components**.

```json
// Original: using Bootstrap Icons
"delete": { "$value": "~bootstrap-icons/icons/trash.svg" }

// Switch to Lucide: same token name, different source
"delete": { "$value": "~lucide-static/icons/trash.svg" }

// Switch to Heroicons
"delete": { "$value": "~heroicons/24/outline/trash.svg" }
```

Your components stay the same:
```scss
&--delete {
  mask-image: var(--assets-icons-actions-delete);
}
```

## Organizing Icon Tokens

Structure your icons by category for better maintainability:

```json
{
  "assets": {
    "icons": {
      "actions": {
        "add": { "$value": "~lucide-static/icons/plus.svg", "$type": "asset" },
        "edit": { "$value": "~lucide-static/icons/pencil.svg", "$type": "asset" },
        "delete": { "$value": "~lucide-static/icons/trash.svg", "$type": "asset" },
        "save": { "$value": "~lucide-static/icons/save.svg", "$type": "asset" },
        "cancel": { "$value": "~lucide-static/icons/x.svg", "$type": "asset" },
        "search": { "$value": "~lucide-static/icons/search.svg", "$type": "asset" }
      },
      "navigation": {
        "home": { "$value": "~lucide-static/icons/home.svg", "$type": "asset" },
        "back": { "$value": "~lucide-static/icons/arrow-left.svg", "$type": "asset" },
        "forward": { "$value": "~lucide-static/icons/arrow-right.svg", "$type": "asset" },
        "menu": { "$value": "~lucide-static/icons/menu.svg", "$type": "asset" },
        "external": { "$value": "~lucide-static/icons/external-link.svg", "$type": "asset" }
      },
      "status": {
        "success": { "$value": "~lucide-static/icons/check-circle.svg", "$type": "asset" },
        "warning": { "$value": "~lucide-static/icons/alert-triangle.svg", "$type": "asset" },
        "error": { "$value": "~lucide-static/icons/x-circle.svg", "$type": "asset" },
        "info": { "$value": "~lucide-static/icons/info.svg", "$type": "asset" },
        "loading": { "$value": "~lucide-static/icons/loader.svg", "$type": "asset" }
      },
      "social": {
        "user": { "$value": "~lucide-static/icons/user.svg", "$type": "asset" },
        "users": { "$value": "~lucide-static/icons/users.svg", "$type": "asset" },
        "mail": { "$value": "~lucide-static/icons/mail.svg", "$type": "asset" },
        "share": { "$value": "~lucide-static/icons/share.svg", "$type": "asset" }
      }
    }
  }
}
```

This generates CSS variables:
- `--assets-icons-actions-add`
- `--assets-icons-actions-edit`
- `--assets-icons-navigation-home`
- `--assets-icons-status-success`
- etc.

## Animated Icons

Add CSS animations for loading spinners:

```scss
.ds-icon {
  &--loading {
    mask-image: var(--assets-icons-status-loading);
    -webkit-mask-image: var(--assets-icons-status-loading);
    animation: icon-spin 1s linear infinite;
  }
}

@keyframes icon-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## MCP Tools for Icons

If using Claude Code with MCP integration, these tools are available:

| Tool | Description |
|------|-------------|
| `stylescribe_icons_list()` | List installed icon packages |
| `stylescribe_icons_search(query)` | Search for icons by name |
| `stylescribe_icons_discover(package)` | List all icons in a package |
| `stylescribe_icons_get_path({ package, icon })` | Get token path for an icon |

Example workflow:
```
> stylescribe_icons_search("arrow")
Found: arrow-left, arrow-right, arrow-up, arrow-down...

> stylescribe_icons_get_path({ package: "lucide-static", icon: "arrow-left" })
Path: ~lucide-static/icons/arrow-left.svg
```

## Best Practices

### Use Semantic Names

```json
// Good: semantic names
"delete": { "$value": "~bootstrap-icons/icons/trash.svg" }
"edit": { "$value": "~lucide-static/icons/pencil.svg" }

// Avoid: icon-specific names
"trash": { "$value": "~bootstrap-icons/icons/trash.svg" }
"pencil": { "$value": "~lucide-static/icons/pencil.svg" }
```

### Use `em` Units for Sizing

Icons scale with text when using `em`:

```scss
.ds-icon {
  --icon-size: 1em;  // Scales with parent font-size
}

// In a heading, icons are larger
h1 { font-size: 2rem; }  // Icons inside = 2rem

// In body text, icons match
p { font-size: 1rem; }   // Icons inside = 1rem
```

### Always Include `-webkit-` Prefix

Safari requires the prefix:

```scss
mask-image: var(--assets-icons-actions-delete);
-webkit-mask-image: var(--assets-icons-actions-delete);  // Required for Safari
```

### Accessibility

For decorative icons, no additional markup needed. For meaningful icons:

```html
<!-- Decorative (no label needed) -->
<button>
  <span class="icon icon--delete"></span>
  Delete
</button>

<!-- Icon-only button needs aria-label -->
<button aria-label="Delete item">
  <span class="icon icon--delete"></span>
</button>

<!-- Or use visually-hidden text -->
<button>
  <span class="icon icon--delete"></span>
  <span class="visually-hidden">Delete</span>
</button>
```
