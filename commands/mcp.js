// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * MCP (Model Context Protocol) command
 *
 * Manages MCP server for AI coding assistant integration.
 */

import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const command = 'mcp <action>';
export const desc = 'Manage MCP server for AI coding assistants';

export const builder = (yargs) => {
    yargs
        .positional('action', {
            describe: 'Action to perform',
            choices: ['serve', 'setup'],
            type: 'string',
        })
        .option('agent', {
            describe: 'AI agent to configure',
            choices: ['claude', 'codex', 'gemini'],
            default: 'claude',
        })
        .option('global', {
            describe: 'Use global stylescribe installation instead of npx',
            type: 'boolean',
            default: false,
        })
        .example('$0 mcp serve', 'Start MCP server (stdio transport)')
        .example('$0 mcp setup --agent claude', 'Generate Claude Code MCP configuration');
};

export const handler = async (argv) => {
    try {
        switch (argv.action) {
            case 'serve':
                await handleServe();
                break;
            case 'setup':
                await handleSetup(argv);
                break;
            default:
                console.error(chalk.red(`Unknown action: ${argv.action}`));
                process.exit(1);
        }
    } catch (error) {
        console.error(chalk.bgRed.white.bold('Error:'), chalk.bold(error.message));
        console.error(chalk.gray(error.stack));
        process.exit(1);
    }
};

/**
 * Start MCP server with stdio transport
 */
async function handleServe() {
    const serverPath = path.join(__dirname, '..', 'mcp', 'server.js');

    // Import and run the server
    await import(serverPath);
}

/**
 * Generate MCP configuration for specified agent
 */
async function handleSetup(argv) {
    const { agent, global: useGlobal } = argv;

    console.log(chalk.cyan(`\n  Setting up MCP for ${agent}...\n`));

    if (agent !== 'claude') {
        console.log(chalk.yellow(`  Support for ${agent} is coming soon.`));
        console.log(chalk.gray('  Currently only Claude Code is supported.\n'));
        return;
    }

    const targetDir = process.cwd();

    // Stylescribe MCP server config
    const stylescribeServer = useGlobal
        ? {
              command: 'stylescribe',
              args: ['mcp', 'serve'],
          }
        : {
              command: 'npx',
              args: ['stylescribe', 'mcp', 'serve'],
              env: {
                  STYLESCRIBE_PROJECT: '.',
              },
          };

    const mcpConfigPath = path.join(targetDir, '.mcp.json');

    // Check if .mcp.json already exists and merge
    let mcpConfig = { mcpServers: {} };

    if (await fs.pathExists(mcpConfigPath)) {
        try {
            const existingConfig = await fs.readJson(mcpConfigPath);
            mcpConfig = existingConfig;

            // Ensure mcpServers exists
            if (!mcpConfig.mcpServers) {
                mcpConfig.mcpServers = {};
            }

            // Check if stylescribe is already configured
            if (mcpConfig.mcpServers.stylescribe) {
                console.log(chalk.yellow('  ⊘') + chalk.gray(' stylescribe already configured in .mcp.json, skipping'));
            } else {
                mcpConfig.mcpServers.stylescribe = stylescribeServer;
                await fs.writeJson(mcpConfigPath, mcpConfig, { spaces: 2 });
                console.log(chalk.green('  ✓') + chalk.gray(' Added stylescribe to existing .mcp.json'));
            }
        } catch (error) {
            console.log(chalk.yellow('  ⚠') + chalk.gray(' Could not parse existing .mcp.json, creating new'));
            mcpConfig = { mcpServers: { stylescribe: stylescribeServer } };
            await fs.writeJson(mcpConfigPath, mcpConfig, { spaces: 2 });
            console.log(chalk.green('  ✓') + chalk.gray(' Created .mcp.json'));
        }
    } else {
        mcpConfig.mcpServers.stylescribe = stylescribeServer;
        await fs.writeJson(mcpConfigPath, mcpConfig, { spaces: 2 });
        console.log(chalk.green('  ✓') + chalk.gray(' Created .mcp.json'));
    }

    // Generate CLAUDE.md if it doesn't exist
    const claudeMdPath = path.join(targetDir, 'CLAUDE.md');
    if (!(await fs.pathExists(claudeMdPath))) {
        const claudeMd = await generateClaudeMd(targetDir);
        await fs.writeFile(claudeMdPath, claudeMd, 'utf-8');
        console.log(chalk.green('  ✓') + chalk.gray(' Created CLAUDE.md'));
    } else {
        console.log(chalk.yellow('  ⊘') + chalk.gray(' CLAUDE.md already exists, skipping'));
    }

    console.log(chalk.cyan('\n  MCP setup complete!\n'));

    // Next steps
    console.log(chalk.bold('  Next steps:\n'));
    console.log(chalk.gray('  1. Open this project in Claude Code'));
    console.log(chalk.gray('  2. The MCP server will start automatically'));
    console.log(chalk.gray('  3. Query documentation: stylescribe://docs/annotations'));
    console.log(chalk.gray('  4. Use tools: stylescribe_create_component, etc.\n'));
}

/**
 * Generate CLAUDE.md content based on project configuration
 */
async function generateClaudeMd(targetDir) {
    // Try to read project config
    let config = {};
    let projectName = 'Design System';
    let classPrefix = 'ds-';

    const configPath = path.join(targetDir, '.stylescriberc.json');
    if (await fs.pathExists(configPath)) {
        try {
            config = await fs.readJson(configPath);
            projectName = config.branding?.name || projectName;
            classPrefix = config.classPrefix || classPrefix;
        } catch {
            // Use defaults
        }
    }

    // Try to read package.json for project name
    const pkgPath = path.join(targetDir, 'package.json');
    if (await fs.pathExists(pkgPath)) {
        try {
            const pkg = await fs.readJson(pkgPath);
            projectName = config.branding?.name || pkg.name || projectName;
        } catch {
            // Use defaults
        }
    }

    return `# CLAUDE.md

## Project Overview

${projectName} - A design system built with Stylescribe.

## Quick Commands

\`\`\`bash
npm run dev     # Start dev server at http://localhost:4142
npm run build   # Build CSS and documentation
npm run docs    # Generate static documentation site
\`\`\`

## Architecture

- **CSS Layers:** reset → base → components → utilities
- **Token-driven components:** Variants only set tokens, never behavior
- **BEM naming:** \`.ds-block__element--modifier\`

## IMPORTANT: Class Prefix Rule

**ALWAYS use \`ds-\` prefix in source SCSS files.** The configured prefix (\`${classPrefix}\`) is applied automatically at build time.

\`\`\`scss
// ✅ CORRECT - Always use ds- in source
.ds-button { }
.ds-card { }

// ❌ WRONG - Never use configured prefix in source
.${classPrefix}button { }  // NO!
\`\`\`

## Key Patterns

### Token-Driven Components (NO Inline Fallbacks!)

**CRITICAL: Never use inline fallbacks like \`var(--token, fallback)\`.**

\`\`\`scss
// ✅ CORRECT - Direct token reference, no fallbacks
.ds-component {
  --component-bg: var(--color-surface);
  --component-padding: var(--spacing-md);

  background: var(--component-bg);
  padding: var(--component-padding);

  // Variations ONLY override tokens
  &--primary {
    --component-bg: var(--color-primary);
  }
}

// ❌ WRONG - Inline fallbacks are forbidden
.ds-component {
  --component-bg: var(--color-surface, #f8f9fa);   // NO!
  --component-padding: var(--spacing-md, 1rem);    // NO!
}
\`\`\`

For customizable defaults, create \`tokens/components/{name}.json\`.

### CRITICAL: Read Tokens First

**Before writing component CSS, ALWAYS read \`tokens/design-tokens.json\` to find correct token paths.**

Tokens are nested: \`color.semantic.text\` → \`--color-semantic-text\`

\`\`\`scss
// ❌ WRONG - Flat names may not exist
--component-text: var(--color-text);

// ✅ CORRECT - Use actual nested paths
--component-text: var(--color-semantic-text);
\`\`\`

### Container Queries

Use \`@container\` for component-internal responsiveness:

\`\`\`scss
.ds-card {
  container-type: inline-size;
  container-name: card;

  @container card (min-width: 400px) {
    flex-direction: row;
  }
}
\`\`\`

## Creating Components - FOLLOW THESE STEPS

**Step 1:** Check existing components in \`sass/components/\`

**Step 2:** Read \`tokens/design-tokens.json\` to find available tokens

**Step 3:** **USE MCP TOOL** \`stylescribe_create_component\` to scaffold:
\`\`\`
stylescribe_create_component({ name: "hero", group: "Containment" })
\`\`\`
**DO NOT use mkdir/touch/manual file creation. ALWAYS use the MCP tool.**

**Step 4:** Edit the scaffolded files to add variations, elements, examples

**Step 5:** Add \`@dependencies\` if using other components

### Required Annotations
- \`@title\` - Display name
- \`@description\` - What it does
- \`@group\` - Category (Actions, Containment, etc.)
- \`@examples\` - YAML format with \`title\` and \`code\` (REQUIRED!)

### Optional Annotations
- \`@variations\` - Available modifiers (if component has variants like \`--primary\`, \`--secondary\`)
- \`@elements\` - BEM elements (if component has child elements like \`__icon\`, \`__label\`)
- \`@dependencies\` - Other components used (if this component uses other components)

### @variations and @elements Formats

**Simple format** (comma-separated) - for quick lists:
\`\`\`scss
@variations primary, secondary, danger, ghost
@elements icon, label, content
\`\`\`

**YAML format** - when you want to add descriptions:
\`\`\`scss
@variations
- name: primary
  description: Main call-to-action, use sparingly
- name: secondary
  description: Secondary actions, less visual emphasis
- name: danger
  description: Destructive actions like delete
- name: ghost
  description: Minimal styling, blends with background

@elements
- name: icon
  description: Optional leading icon (16x16)
- name: label
  description: Button text, required for accessibility
\`\`\`

**YAML format with custom HTML** - for proper element rendering in previews:
\`\`\`scss
@elements
- name: icon
  description: SVG icon using mask-image technique
  html: |
    <span class="{{class}}" style="display:inline-block;width:1em;height:1em;background:currentColor;mask-image:var(--assets-icons-actions-add);-webkit-mask-image:var(--assets-icons-actions-add);mask-size:contain;-webkit-mask-size:contain;"></span>
- name: label
  description: Button text content
  html: <span class="{{class}}">Label</span>
\`\`\`

The \`{{class}}\` placeholder is replaced with the full BEM class (e.g., \`ds-btn__icon\`).

**Alternative: Pug syntax** for cleaner templates:
\`\`\`scss
@elements
- name: icon
  description: SVG icon
  pug: span.{{class}}(style="display:inline-block;width:1em;height:1em;background:currentColor")
- name: label
  pug: span.{{class}} Label
\`\`\`

Use \`html\` or \`pug\` when you need icons, SVGs, or specific markup to display correctly in the Interactive Playground and All Variations section.

### @examples Format (CRITICAL)
\`\`\`scss
@examples
- title: Example Name
  code: |
    <div class="ds-component">Content</div>
\`\`\`

**NEVER put raw HTML after @examples. ALWAYS use YAML list with title/code.**

## Design Tokens

- Edit \`tokens/design-tokens.json\` (W3C DTCG format)
- Use \`{reference.path}\` for token references
- Available functions: \`tint()\`, \`shade()\`, \`alpha()\`, \`fluidType()\`, etc.

### Token Function Examples

\`\`\`json
{
  "color": {
    "primary-light": { "$value": "tint({color.primary}, 20%)" },
    "primary-dark": { "$value": "shade({color.primary}, 20%)" },
    "primary-text": { "$value": "accessibleText({color.primary})" }
  },
  "font": {
    "size-fluid": { "$value": "fluidType(16px, 24px, 320px, 1280px)" }
  }
}
\`\`\`

### W3C DTCG Gradient Tokens

Gradients use structured objects (not raw CSS strings) for interoperability:

\`\`\`json
{
  "gradient": {
    "brand": {
      "$type": "gradient",
      "$value": {
        "type": "linear",
        "angle": "135deg",
        "colorStops": [
          { "color": "{color.primary.400}", "position": 0 },
          { "color": "{color.primary.600}", "position": 1 }
        ]
      }
    }
  }
}
\`\`\`

**Gradient types:** \`linear\`, \`radial\`, \`conic\`

### W3C DTCG Shadow Tokens

Shadows use structured objects with color references and functions:

\`\`\`json
{
  "shadow": {
    "md": {
      "$type": "shadow",
      "$value": [
        {
          "offsetX": "0px",
          "offsetY": "4px",
          "blur": "6px",
          "spread": "-1px",
          "color": "alpha({color.black}, 0.1)"
        },
        {
          "offsetX": "0px",
          "offsetY": "2px",
          "blur": "4px",
          "spread": "-2px",
          "color": "alpha({color.black}, 0.1)"
        }
      ]
    },
    "brand": {
      "$type": "shadow",
      "$value": {
        "offsetX": "0px",
        "offsetY": "4px",
        "blur": "14px",
        "spread": "0px",
        "color": "alpha({color.brand}, 0.4)"
      }
    }
  }
}
\`\`\`

**Shadow features:**
- Use \`alpha({color.black}, 0.1)\` for transparent shadows
- Array values for layered shadows
- \`"inset": true\` for inset shadows

## MCP Resources

This project has an MCP server. Query documentation:

- \`stylescribe://docs/cli-commands\` - CLI command reference
- \`stylescribe://docs/annotations\` - Component annotation guide
- \`stylescribe://docs/tokens\` - Token functions reference (46 functions)
- \`stylescribe://docs/css-architecture\` - CSS patterns and layers
- \`stylescribe://docs/container-queries\` - @container patterns
- \`stylescribe://docs/theming\` - Dark mode and theme variants
- \`stylescribe://docs/config\` - Configuration options
- \`stylescribe://docs/coding-guidelines\` - Best practices

## MCP Tools

- \`stylescribe_create_component\` - Scaffold new component
- \`stylescribe_create_page\` - Create documentation page
- \`stylescribe_validate_tokens\` - Validate token file
- \`stylescribe_add_theme\` - Add new theme
- \`stylescribe_export_tokens\` - Export tokens to CSS/SCSS
- \`stylescribe_icons_list\` - List installed icon packages
- \`stylescribe_icons_search\` - Search for icons by name
- \`stylescribe_icons_get_path\` - Get token path for an icon
- \`stylescribe_icons_discover\` - List all icons in a package

## Icon Assets (W3C DTCG)

Icons are design tokens under \`assets.icons\` with \`$type: "asset"\`.

### Discovering Icons

\`\`\`
stylescribe_icons_list()           // List installed packages
stylescribe_icons_search("trash")  // Search by name
\`\`\`

### Supported Packages

| Package | Path Pattern |
|---------|--------------|
| bootstrap-icons | \`~bootstrap-icons/icons/{name}.svg\` |
| lucide-static | \`~lucide-static/icons/{name}.svg\` |

### Adding Icon Tokens

\`\`\`json
{
  "assets": {
    "icons": {
      "actions": {
        "delete": {
          "$value": "~bootstrap-icons/icons/trash.svg",
          "$type": "asset"
        }
      }
    }
  }
}
\`\`\`

Generates: \`--assets-icons-actions-delete\`

### CRITICAL: Icon Component Pattern

**NEVER use inline \`--icon-src\` style approach. ALWAYS create dedicated class modifiers.**

\`\`\`scss
// ❌ WRONG - Forces inline styles, bad DX
.ds-icon {
  --icon-src: none;
  mask-image: var(--icon-src);
}
// Usage: <span class="ds-icon" style="--icon-src: var(--assets-icons-actions-search)"></span>

// ✅ CORRECT - Clean, documented variations
.ds-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: currentColor;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;

  // CREATE ONE VARIATION FOR EACH ICON TOKEN
  &--search {
    mask-image: var(--assets-icons-actions-search);
    -webkit-mask-image: var(--assets-icons-actions-search);
  }
  &--delete {
    mask-image: var(--assets-icons-actions-delete);
    -webkit-mask-image: var(--assets-icons-actions-delete);
  }
  // Add more variations for each icon token...

  // Size variants
  &--sm { width: 0.75em; height: 0.75em; }
  &--lg { width: 1.5em; height: 1.5em; }
}
\`\`\`

### Icon Usage

\`\`\`html
<!-- Clean, no inline styles needed -->
<span class="ds-icon ds-icon--search"></span>
<span class="ds-icon ds-icon--delete ds-icon--lg"></span>

<!-- Icons in buttons inherit color -->
<button class="ds-btn ds-btn--danger">
  <span class="ds-icon ds-icon--delete"></span>
  Delete
</button>
\`\`\`

Use semantic names ("delete" not "trash") so icon sources are swappable.
`;
}

export default { command, desc, builder, handler };
