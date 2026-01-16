---
title: Build an Icon Component
navtitle: Icon Component
order: 1
---

In this tutorial, you'll build a complete icon component using CSS mask-image. By the end, you'll have:

- Icon tokens in your design system
- A reusable icon component
- Icons that inherit text color
- Size variants
- Documented component with live previews

## Prerequisites

Before starting, ensure you have:

1. A StyleScribe project initialized (`stylescribe init`)
2. An icon package installed (we'll use Bootstrap Icons)

```bash
npm install bootstrap-icons
```

> **New to tokens?** This tutorial introduces tokens briefly. For a deeper understanding of token structure, theming, and component tokens, see [Design Tokens & Theming](../guides/tokens.html).

## Step 1: Add Icon Tokens

Icons in StyleScribe are design tokens with `$type: "asset"`. Open `tokens/design-tokens.json` and add an `assets.icons` section:

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
          "$value": "~bootstrap-icons/icons/pencil.svg",
          "$type": "asset",
          "$description": "Edit action"
        },
        "add": {
          "$value": "~bootstrap-icons/icons/plus-lg.svg",
          "$type": "asset",
          "$description": "Add action"
        }
      }
    }
  }
}
```

### Understanding Token Paths

- `~` prefix means "look in node_modules"
- `bootstrap-icons/icons/trash.svg` is the path within the package
- StyleScribe converts this to a base64 data URL at build time

The token path `assets.icons.actions.delete` becomes the CSS variable `--assets-icons-actions-delete`.

### Finding Icon Names

Use the CLI to discover available icons:

```bash
# List installed icon packages
stylescribe icons list

# Search for icons by name
stylescribe icons search -q trash

# Get the full path for a specific icon
stylescribe icons path -p bootstrap-icons -i trash
```

## Step 2: Create the Component Folder

Create the component structure:

```bash
stylescribe create-component icon --group="Primitives"
```

This creates:

```
sass/components/icon/
└── icon.scss
```

## Step 3: Write the Base Styles

Open `sass/components/icon/icon.scss` and add the documentation and base styles:

```scss
/**
 * @title Icon
 * @description SVG icons using CSS mask-image. Icons inherit color from parent text.
 * @group Primitives
 * @variations delete, edit, add, sm, lg
 * @examples
 * - title: Basic Icons
 *   code: |
 *     <span class="ds-icon ds-icon--delete"></span>
 *     <span class="ds-icon ds-icon--edit"></span>
 *     <span class="ds-icon ds-icon--add"></span>
 * - title: Sized Icons
 *   code: |
 *     <span class="ds-icon ds-icon--delete ds-icon--sm"></span>
 *     <span class="ds-icon ds-icon--delete"></span>
 *     <span class="ds-icon ds-icon--delete ds-icon--lg"></span>
 */

@layer components {
  .ds-icon {
    /* ===== Component Tokens ===== */
    --icon-size: 1em;
    --icon-color: currentColor;

    /* ===== Base Styles ===== */
    display: inline-block;
    width: var(--icon-size);
    height: var(--icon-size);
    vertical-align: middle;

    /* Icon color - uses currentColor to inherit from parent */
    background-color: var(--icon-color);

    /* Mask properties for all icons */
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position: center;
    -webkit-mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
  }
}
```

### Why mask-image?

The CSS mask-image technique has key advantages:

1. **Color inheritance** — Icons use `background-color: currentColor`, so they automatically match text color
2. **No extra requests** — SVGs are embedded as data URLs at build time
3. **Easy theming** — Change color with CSS, no need for multiple SVG files
4. **Size flexibility** — Uses `em` units, scaling with font size

## Step 4: Add Icon Variants

Add variants for each icon token. The mask-image references your design tokens:

```scss
@layer components {
  .ds-icon {
    /* ... base styles from above ... */

    /* ===== Icon Variants ===== */
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

    /* ===== Size Variants ===== */
    &--sm {
      --icon-size: 0.75em;
    }

    &--lg {
      --icon-size: 1.5em;
    }

    &--xl {
      --icon-size: 2em;
    }
  }
}
```

### Token-to-Class Mapping

| Token Path | CSS Variable | CSS Class |
|------------|--------------|-----------|
| `assets.icons.actions.delete` | `--assets-icons-actions-delete` | `.ds-icon--delete` |
| `assets.icons.actions.edit` | `--assets-icons-actions-edit` | `.ds-icon--edit` |

You choose the class name — it doesn't have to match the token name.

## Step 5: Test in Development

Start the dev server:

```bash
stylescribe dev
```

Open http://localhost:4142 and find your Icon component. You should see:

1. **All Variations** section showing each icon
2. **Interactive Playground** where you can toggle variants
3. **CSS Variables** section showing `--icon-size` and `--icon-color`

## Step 6: Use with Other Components

Icons work inside buttons, alerts, and other components. Add an example showing this integration:

```scss
/**
 * @examples
 * - title: Basic Icons
 *   code: |
 *     <span class="ds-icon ds-icon--delete"></span>
 *     <span class="ds-icon ds-icon--edit"></span>
 * - title: Icons in Buttons
 *   code: |
 *     <button class="ds-button ds-button--primary">
 *       <span class="ds-icon ds-icon--add"></span>
 *       Add Item
 *     </button>
 * - title: Colored Icons
 *   code: |
 *     <span class="ds-icon ds-icon--delete" style="color: red;"></span>
 *     <span class="ds-icon ds-icon--edit" style="color: blue;"></span>
 * @dependencies button
 */
```

The `@dependencies button` ensures button styles load in previews.

## Step 7: Add More Icons

Expand your icon library by adding more tokens:

```json
{
  "assets": {
    "icons": {
      "actions": {
        "delete": { "$value": "~bootstrap-icons/icons/trash.svg", "$type": "asset" },
        "edit": { "$value": "~bootstrap-icons/icons/pencil.svg", "$type": "asset" },
        "add": { "$value": "~bootstrap-icons/icons/plus-lg.svg", "$type": "asset" },
        "save": { "$value": "~bootstrap-icons/icons/check-lg.svg", "$type": "asset" },
        "search": { "$value": "~bootstrap-icons/icons/search.svg", "$type": "asset" }
      },
      "navigation": {
        "home": { "$value": "~bootstrap-icons/icons/house.svg", "$type": "asset" },
        "menu": { "$value": "~bootstrap-icons/icons/list.svg", "$type": "asset" },
        "back": { "$value": "~bootstrap-icons/icons/arrow-left.svg", "$type": "asset" }
      },
      "status": {
        "success": { "$value": "~bootstrap-icons/icons/check-circle.svg", "$type": "asset" },
        "warning": { "$value": "~bootstrap-icons/icons/exclamation-triangle.svg", "$type": "asset" },
        "error": { "$value": "~bootstrap-icons/icons/x-circle.svg", "$type": "asset" }
      }
    }
  }
}
```

Then add corresponding CSS variants:

```scss
/* Navigation icons */
&--home {
  mask-image: var(--assets-icons-navigation-home);
  -webkit-mask-image: var(--assets-icons-navigation-home);
}

/* Status icons */
&--success {
  mask-image: var(--assets-icons-status-success);
  -webkit-mask-image: var(--assets-icons-status-success);
}
```

## Bonus: Swap Icon Sources

Because icons are tokens, you can swap sources without changing CSS. To use Lucide instead of Bootstrap Icons:

```json
{
  "delete": {
    "$value": "~lucide-static/icons/trash.svg",
    "$type": "asset"
  }
}
```

The CSS stays exactly the same — only the token value changes.

## Complete Example

Here's the full icon component:

```scss
/**
 * @title Icon
 * @description SVG icons using CSS mask-image. Inherit color from parent.
 * @group Primitives
 * @variations delete, edit, add, save, search, home, success, warning, error, sm, lg, xl
 * @examples
 * - title: Action Icons
 *   code: |
 *     <span class="ds-icon ds-icon--delete"></span>
 *     <span class="ds-icon ds-icon--edit"></span>
 *     <span class="ds-icon ds-icon--add"></span>
 *     <span class="ds-icon ds-icon--save"></span>
 *     <span class="ds-icon ds-icon--search"></span>
 * - title: Status Icons
 *   code: |
 *     <span class="ds-icon ds-icon--success" style="color: green;"></span>
 *     <span class="ds-icon ds-icon--warning" style="color: orange;"></span>
 *     <span class="ds-icon ds-icon--error" style="color: red;"></span>
 * - title: Size Variants
 *   code: |
 *     <span class="ds-icon ds-icon--home ds-icon--sm"></span>
 *     <span class="ds-icon ds-icon--home"></span>
 *     <span class="ds-icon ds-icon--home ds-icon--lg"></span>
 *     <span class="ds-icon ds-icon--home ds-icon--xl"></span>
 */

@layer components {
  .ds-icon {
    --icon-size: 1em;
    --icon-color: currentColor;

    display: inline-block;
    width: var(--icon-size);
    height: var(--icon-size);
    vertical-align: middle;
    background-color: var(--icon-color);
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position: center;
    -webkit-mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;

    /* Action icons */
    &--delete { mask-image: var(--assets-icons-actions-delete); -webkit-mask-image: var(--assets-icons-actions-delete); }
    &--edit { mask-image: var(--assets-icons-actions-edit); -webkit-mask-image: var(--assets-icons-actions-edit); }
    &--add { mask-image: var(--assets-icons-actions-add); -webkit-mask-image: var(--assets-icons-actions-add); }
    &--save { mask-image: var(--assets-icons-actions-save); -webkit-mask-image: var(--assets-icons-actions-save); }
    &--search { mask-image: var(--assets-icons-actions-search); -webkit-mask-image: var(--assets-icons-actions-search); }

    /* Navigation icons */
    &--home { mask-image: var(--assets-icons-navigation-home); -webkit-mask-image: var(--assets-icons-navigation-home); }

    /* Status icons */
    &--success { mask-image: var(--assets-icons-status-success); -webkit-mask-image: var(--assets-icons-status-success); }
    &--warning { mask-image: var(--assets-icons-status-warning); -webkit-mask-image: var(--assets-icons-status-warning); }
    &--error { mask-image: var(--assets-icons-status-error); -webkit-mask-image: var(--assets-icons-status-error); }

    /* Sizes */
    &--sm { --icon-size: 0.75em; }
    &--lg { --icon-size: 1.5em; }
    &--xl { --icon-size: 2em; }
  }
}
```

## What You Learned

- **Icon tokens** — Define icons as `$type: "asset"` in design-tokens.json
- **CSS mask-image** — Technique for stylable, color-inheriting icons
- **CLI discovery** — Use `stylescribe icons search` to find icons
- **Source flexibility** — Swap between icon packages by changing token values
- **Integration** — Icons work seamlessly in buttons and other components

## Next Steps

- [Design Tokens & Theming](../guides/tokens.html) — Deep dive into token structure, component tokens, and themes
- [Icons Reference](../reference/icons.html) — All supported packages and advanced usage
- [Components Guide](../guides/components.html) — Build more components with annotations
