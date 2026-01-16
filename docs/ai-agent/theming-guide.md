# Theming Guide

Create and manage themes in Stylescribe for dark mode, brand variants, and custom color schemes.

## Theme Concepts

| Concept | Description | Example |
|---------|-------------|---------|
| **Base Theme** | Default tokens (light mode) | `design-tokens.json` |
| **Dark Mode** | Color scheme for low-light | `[data-theme="dark"]` |
| **Variant Theme** | Brand/style variation | `.theme-ocean`, `.theme-comic` |
| **Combined Theme** | Variant + dark mode | `.theme-ocean[data-theme="dark"]` |

---

## Creating Themes

### Using CLI (Recommended)

```bash
# Dark mode theme
stylescribe add-theme dark --dark

# Variant theme
stylescribe add-theme ocean

# Variant with dark mode base
stylescribe add-theme ocean-dark --dark --extends ocean
```

### Manual Creation

Create a JSON file in `tokens/`:

**CRITICAL: Token paths must match what components use!**

If your components use `--color-semantic-surface` (from nested `color.semantic.surface`), your dark theme must override the SAME path:

**tokens/dark.json:**
```json
{
  "$meta": {
    "name": "dark",
    "description": "Dark mode theme",
    "mode": "dark"
  },
  "color": {
    "semantic": {
      "background": {
        "$value": "#1a1a2e",
        "$type": "color",
        "$description": "Dark page background"
      },
      "surface": {
        "$value": "#16213e",
        "$type": "color",
        "$description": "Dark surface/card background"
      },
      "text": {
        "$value": "#eaeaea",
        "$type": "color",
        "$description": "Light text on dark"
      },
      "text-muted": {
        "$value": "#a0a0a0",
        "$type": "color",
        "$description": "Muted text on dark"
      },
      "border": {
        "$value": "#3a3a5c",
        "$type": "color",
        "$description": "Border color on dark"
      }
    },
    "primary": {
      "500": {
        "$value": "#4dabf7",
        "$type": "color",
        "$description": "Primary color adjusted for dark mode"
      }
    }
  }
}
```

**Common mistake:** Using flat paths like `color.surface` when components use `color.semantic.surface` - dark mode won't work!

### Register Theme

Add to base `design-tokens.json`:

```json
{
  "$meta": {
    "themes": [
      { "name": "dark", "file": "./dark.json", "mode": "dark" },
      { "name": "ocean", "file": "./ocean.json" }
    ]
  }
}
```

---

## Theme File Structure

### $meta Properties

| Property | Description |
|----------|-------------|
| `name` | Theme identifier |
| `description` | Human-readable description |
| `mode` | `"dark"` for dark mode themes |
| `extends` | Parent theme to inherit from |

### Override Only What Changes

Theme files should only contain tokens that differ from base. **Use the same nested paths as your base tokens:**

```json
{
  "$meta": {
    "name": "dark",
    "mode": "dark"
  },
  "color": {
    "semantic": {
      "background": { "$value": "#1a1a2e", "$type": "color" },
      "surface": { "$value": "#16213e", "$type": "color" },
      "text": { "$value": "#eaeaea", "$type": "color" }
    }
  }
}
```

---

## Applying Themes

### Dark Mode

Use `data-theme` attribute:

```html
<!-- Light mode (default) -->
<html>

<!-- Dark mode -->
<html data-theme="dark">
```

### Variant Themes

Use CSS class with prefix:

```html
<!-- Ocean theme -->
<html class="theme-ocean">

<!-- Comic theme -->
<html class="theme-comic">
```

### Combined (Variant + Dark)

```html
<!-- Ocean theme in dark mode -->
<html class="theme-ocean" data-theme="dark">
```

---

## JavaScript Theme Switching

### Basic Toggle

```javascript
// Toggle dark mode
function toggleDarkMode() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// Apply saved theme on load
const savedTheme = localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', savedTheme);
```

### System Preference Detection

```javascript
// Initial theme from system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function applySystemTheme(e) {
  if (!localStorage.getItem('theme')) {
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  }
}

prefersDark.addEventListener('change', applySystemTheme);
applySystemTheme(prefersDark);
```

### Variant Theme Switching

```javascript
function setThemeVariant(variant) {
  const html = document.documentElement;

  // Remove existing theme classes
  html.classList.remove('theme-ocean', 'theme-comic', 'theme-minimal');

  // Add new theme class (if not default)
  if (variant && variant !== 'default') {
    html.classList.add(`theme-${variant}`);
  }

  localStorage.setItem('theme-variant', variant);
}

// Apply saved variant
const savedVariant = localStorage.getItem('theme-variant');
if (savedVariant) setThemeVariant(savedVariant);
```

---

## CSS Output

Stylescribe generates CSS for each theme:

```css
/* Base theme (light) */
:root {
  --color-background: #ffffff;
  --color-text: #212529;
  --color-primary: #0d6efd;
}

/* Dark mode */
[data-theme="dark"] {
  --color-background: #1a1a2e;
  --color-text: #eaeaea;
  --color-primary: #4dabf7;
}

/* Variant theme */
.theme-ocean {
  --color-primary: #0077b6;
  --color-secondary: #00b4d8;
}

/* Variant + dark mode */
.theme-ocean[data-theme="dark"] {
  --color-primary: #48cae4;
  --color-background: #023e8a;
}
```

---

## Using Token Functions for Themes

Leverage token functions for consistent dark mode:

```json
{
  "$meta": {
    "name": "dark",
    "mode": "dark"
  },
  "color": {
    "background": { "$value": "#1a1a2e", "$type": "color" },
    "surface": { "$value": "tint({color.background}, 10%)", "$type": "color" },
    "primary": { "$value": "tint({color.primary}, 20%)", "$type": "color" },
    "primary-hover": { "$value": "tint({color.primary}, 30%)", "$type": "color" },
    "text": { "$value": "#eaeaea", "$type": "color" },
    "text-muted": { "$value": "alpha({color.text}, 70%)", "$type": "color" }
  }
}
```

### Auto Dark Mode Function

```json
{
  "color": {
    "primary-dark": {
      "$value": "darkMode({color.primary})",
      "$type": "color"
    }
  }
}
```

---

## Theme Presets

Create reusable theme presets:

**tokens/presets/warm.json:**
```json
{
  "color": {
    "background": { "$value": "#fffaf5", "$type": "color" },
    "surface": { "$value": "#fff5eb", "$type": "color" },
    "primary": { "$value": "#e85d04", "$type": "color" }
  }
}
```

**tokens/presets/cool.json:**
```json
{
  "color": {
    "background": { "$value": "#f0f9ff", "$type": "color" },
    "surface": { "$value": "#e0f2fe", "$type": "color" },
    "primary": { "$value": "#0284c7", "$type": "color" }
  }
}
```

---

## Component-Level Theming

Components can define their own theme-aware tokens:

```scss
.ds-button {
  // Light mode defaults
  --button-bg: var(--color-primary);
  --button-text: var(--color-primary-text);
  --button-border: var(--color-primary);

  background: var(--button-bg);
  color: var(--button-text);
  border: 1px solid var(--button-border);

  // Theme can override component tokens
  [data-theme="dark"] & {
    --button-text: var(--color-text);
  }
}
```

---

## Best Practices

1. **Start with semantic tokens** - `color-background` not `color-white`
2. **Override minimally** - Theme files only change what's different
3. **Use token references** - `{color.primary}` instead of hardcoded values
4. **Leverage functions** - `tint()`, `shade()`, `darkMode()` for consistency
5. **Test all combinations** - Each variant in both light and dark modes
6. **Persist user preference** - Save to localStorage
7. **Respect system preference** - Check `prefers-color-scheme`
8. **Avoid `!important`** - Token-driven pattern prevents specificity issues

---

## Debugging Themes

### Check Applied Variables

```javascript
// Get computed CSS variable value
const styles = getComputedStyle(document.documentElement);
console.log('Background:', styles.getPropertyValue('--color-background'));
console.log('Text:', styles.getPropertyValue('--color-text'));
```

### Validate Theme File

```bash
stylescribe tokens validate -i tokens/dark.json
```

### Preview Theme

```bash
npm run dev
# Open browser, use theme picker or manually set data-theme
```
