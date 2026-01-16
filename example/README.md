# Stylescribe Example

This is a working example demonstrating stylescribe's features.

## Quick Start

```bash
# From the example directory
cd example

# Install stylescribe (if not already linked)
npm install

# Start the dev server with live reload
npx stylescribe dev --source ./sass --build-target ./build

# Or build static documentation
npx stylescribe docs --source ./sass --build-target ./build --output ./site
```

## Directory Structure

```
example/
├── sass/
│   └── components/
│       ├── button/        # Button component with variations
│       ├── card/          # Card component with elements
│       └── alert/         # Alert component with modifiers
├── docs/
│   └── index.md           # Homepage documentation
├── tokens/
│   └── design-tokens.json # W3C Design Tokens example
└── .stylescriberc.json    # Configuration file
```

## Features Demonstrated

### 1. Component Annotations

Each SCSS file uses JSDoc-style annotations:

```scss
/**
 * @title Button
 * @description Interactive button component
 * @group Interactive
 * @variations primary, secondary, danger
 * @elements icon, label
 */
```

### 2. Interactive Variant Toggles

When viewing components in the generated docs, you can:
- Switch between variations using radio buttons
- Toggle additional modifiers with checkboxes
- Show/hide component elements
- Preview at different viewport sizes
- Copy the generated code

### 3. Design Tokens

Extract and manage design tokens:

```bash
# Extract tokens from CSS
npx stylescribe tokens extract -i ./sass/tokens.css -o ./tokens/extracted.json

# Convert to CSS custom properties
npx stylescribe tokens export -i ./tokens/design-tokens.json -f css -o ./tokens/variables.css

# Convert to SCSS
npx stylescribe tokens convert -i ./tokens/design-tokens.json -f scss -o ./tokens/_tokens.scss
```

### 4. Create Components

Scaffold new components:

```bash
npx stylescribe create-component badge --source ./sass/components --group Feedback
```

## Configuration

The `.stylescriberc.json` file configures:
- External CSS dependencies
- Component group ordering
- Package file mappings

## Try It Out

1. Run `npx stylescribe dev --source ./sass --build-target ./build`
2. Open http://localhost:4142
3. Browse components in the sidebar
4. Use the "Interactive Playground" to customize variants
5. Edit any `.scss` file - the page auto-reloads!
