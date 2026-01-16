# Contributing to Stylescribe

Thank you for your interest in contributing to Stylescribe! This guide will help you get started with local development and explain how to submit changes.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing Your Changes](#testing-your-changes)
- [Code Style](#code-style)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Adding New Features](#adding-new-features)

---

## Development Setup

### Prerequisites

- **Node.js 18+** (required for ES Modules support)
- **npm** or **yarn**
- **Git**

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/maravilla-labs/stylescribe.git
cd stylescribe

# Install dependencies
npm install
```

### Link for Local Development

To use your local version of stylescribe globally:

```bash
# From the stylescribe root directory
npm link

# Now 'stylescribe' command uses your local version
stylescribe --help
```

### Verify Setup

```bash
# Run tests
npm test

# Check the CLI works
stylescribe --help
```

---

## Project Structure

```
stylescribe/
├── bin/
│   └── stylescribe.js       # CLI entry point (yargs setup)
├── commands/
│   ├── build.js             # `stylescribe build` command
│   ├── dev.js               # `stylescribe dev` command
│   ├── docs.js              # `stylescribe docs` command
│   ├── tokens.js            # `stylescribe tokens` command
│   ├── createComponent.js   # `stylescribe create-component` command
│   └── createPage.js        # `stylescribe create-page` command
├── utils/
│   ├── fileOperations.js    # Core build logic, Handlebars setup
│   ├── annotations.js       # CSS comment annotation parser
│   ├── tokens.js            # W3C Design Tokens utilities
│   ├── devserver.js         # Express dev server with hot reload
│   └── pathResolver.js      # Path utilities
├── templates/
│   ├── component.hbs        # Component page template
│   ├── index.hbs            # Homepage template
│   ├── pages.hbs            # Documentation page template
│   └── includes/            # Handlebars partials
├── tests/                   # Vitest test files
├── example/                 # Working example project
└── package.json
```

### Key Files

| File | Purpose |
|------|---------|
| `bin/stylescribe.js` | Registers CLI commands with yargs |
| `utils/fileOperations.js` | Main build pipeline (SCSS compilation, site generation) |
| `utils/annotations.js` | Parses `@annotation` comments from CSS |
| `utils/tokens.js` | W3C Design Tokens import/export |
| `templates/component.hbs` | HTML template for component documentation pages |

---

## Making Changes

### Workflow

1. **Create a branch** for your feature/fix:
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes** in the appropriate files

3. **Test with the example project**:
   ```bash
   cd example
   npm run dev
   # Make changes to stylescribe, see them reflected
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Commit and push**

### Developing with the Example Project

The `example/` directory is set up to use the local stylescribe via `file:..` dependency. This means changes you make to stylescribe are immediately available.

```bash
# Terminal 1: Watch for changes (optional - for debugging)
cd stylescribe

# Terminal 2: Run the example
cd example
npm run dev
```

**Hot Reload Workflow:**
1. Start the dev server: `cd example && npm run dev`
2. Open http://localhost:4142
3. Edit any file in `stylescribe/` (commands, utils, templates)
4. Restart the dev server to see CLI changes
5. Edit `example/sass/` files - page auto-reloads!

### Quick Testing Commands

```bash
# From the example directory:

# Test the build command
npm run build

# Test full documentation generation
npm run docs

# Test design tokens
npm run tokens:validate
npm run tokens:css

# Create a test component
npx stylescribe create-component test-widget --group Testing
```

---

## Testing Your Changes

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage
```

### Writing Tests

Tests are located in `tests/` and use [Vitest](https://vitest.dev/).

```javascript
// tests/my-feature.test.js
import { describe, it, expect } from 'vitest';
import { myFunction } from '../utils/myModule.js';

describe('myFunction', () => {
    it('should do something', () => {
        const result = myFunction('input');
        expect(result).toBe('expected output');
    });
});
```

### Test File Naming

- `tests/*.test.js` - Unit tests for utilities
- Name test files after the module they test: `annotations.test.js`, `tokens.test.js`

---

## Code Style

### ES Modules

This project uses **ES Modules** (not CommonJS). Use `import`/`export` syntax:

```javascript
// ✅ Correct
import fs from 'fs-extra';
import { myFunction } from './myModule.js';

export const doSomething = () => { ... };
export default myObject;

// ❌ Incorrect
const fs = require('fs-extra');
module.exports = { ... };
```

### File Extensions

Always include `.js` extension in imports:

```javascript
// ✅ Correct
import { foo } from './utils/bar.js';

// ❌ Incorrect
import { foo } from './utils/bar';
```

### CommonJS Compatibility

Some npm packages are CommonJS. Import them like this:

```javascript
// For packages that don't support named exports
import pkg from 'some-cjs-package';
const { namedExport } = pkg;
```

### Async/Await

Prefer `async`/`await` over raw Promises:

```javascript
// ✅ Preferred
const handler = async (argv) => {
    const data = await fs.readFile(path, 'utf-8');
    // ...
};

// ❌ Avoid
const handler = (argv) => {
    return fs.readFile(path, 'utf-8').then(data => {
        // ...
    });
};
```

### Error Handling

Use chalk for colored console output:

```javascript
import chalk from 'chalk';

console.log(chalk.green('✓ Success message'));
console.error(chalk.red('✗ Error message'));
console.log(chalk.gray('Informational message'));
```

---

## Submitting a Pull Request

### Before Submitting

1. **Run tests**: `npm test`
2. **Test with example**: `cd example && npm run docs`
3. **Update documentation** if adding features
4. **Add tests** for new functionality

### PR Guidelines

- **Title**: Use a clear, descriptive title
- **Description**: Explain what changes you made and why
- **Link issues**: Reference any related issues with `Fixes #123`

### Commit Messages

Follow conventional commit style:

```
feat: Add token merging functionality
fix: Resolve CSS variable extraction for nested selectors
docs: Update README with token examples
test: Add tests for annotation parser
refactor: Simplify build pipeline
```

---

## Adding New Features

### Adding a New CLI Command

1. **Create command file** in `commands/`:

```javascript
// commands/myCommand.js
import chalk from 'chalk';
import { resolvePath } from '../utils/pathResolver.js';

export const command = 'my-command <arg>';
export const desc = 'Description of my command';

export const builder = (yargs) => {
    yargs
        .positional('arg', {
            describe: 'Argument description',
            type: 'string'
        })
        .option('option-name', {
            alias: 'o',
            describe: 'Option description',
            type: 'string',
            default: 'default-value'
        });
};

export const handler = async (argv) => {
    try {
        console.log(chalk.green('✓ Command executed'));
    } catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
    }
};

export default { command, desc, builder, handler };
```

2. **Register in CLI** (`bin/stylescribe.js`):

```javascript
import myCommand from '../commands/myCommand.js';

yargs(hideBin(process.argv))
    // ... existing commands
    .command(myCommand)
```

3. **Add tests**:

```javascript
// tests/myCommand.test.js
describe('my-command', () => {
    // ...
});
```

### Adding a New Annotation

Annotations are parsed in `utils/annotations.js`. The parser supports:

- **Single values**: `@title My Title`
- **Arrays** (keys ending in 's'): `@variations primary, secondary`
- **Complex arrays**: `@examples - title: Foo description: Bar`

To add special handling for a new annotation, modify `extractAnnotations()`.

### Adding a Handlebars Helper

Helpers are registered in `utils/fileOperations.js`:

```javascript
Handlebars.registerHelper('myHelper', function(value) {
    return value.toUpperCase();
});
```

Use in templates:

```handlebars
{{myHelper page.title}}
```

### Modifying Templates

Templates are in `templates/`. Users can override them by creating `.stylescribe/templates/` in their project.

When editing templates:
1. Test with the example project
2. Ensure backward compatibility
3. Update the interactive playground JavaScript if needed

---

## Getting Help

- **Issues**: Open an issue for bugs or feature requests
- **Discussions**: For questions or ideas

Thank you for contributing! 🎉
