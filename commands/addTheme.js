// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Add a new theme to the project
 */

import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';

export const command = 'add-theme <name>';
export const desc = 'Add a new theme to the project';

export const builder = (yargs) => {
    yargs
        .positional('name', {
            describe: 'Theme name (e.g., dark, ocean, comic)',
            type: 'string'
        })
        .option('dark', {
            describe: 'Mark as dark mode theme',
            type: 'boolean',
            default: false
        })
        .option('extends', {
            describe: 'Theme to extend from',
            type: 'string'
        })
        .option('tokens', {
            describe: 'Path to base tokens file',
            type: 'string',
            default: 'tokens/design-tokens.json'
        })
        .option('output', {
            alias: 'o',
            describe: 'Output directory for theme file',
            type: 'string',
            default: 'tokens'
        });
};

export const handler = async (argv) => {
    const { name, dark, extends: extendsTheme, tokens: tokensPath, output } = argv;

    console.log(chalk.cyan(`\n  Adding theme: ${name}\n`));

    // Resolve paths
    const baseTokensPath = path.resolve(process.cwd(), tokensPath);
    const outputDir = path.resolve(process.cwd(), output);
    const themeFilePath = path.join(outputDir, `${name}.json`);

    // Check if base tokens file exists
    if (!await fs.pathExists(baseTokensPath)) {
        console.log(chalk.red(`  Error: Base tokens file not found: ${tokensPath}`));
        console.log(chalk.gray('  Run "stylescribe init" first to create a project.\n'));
        process.exit(1);
    }

    // Check if theme file already exists
    if (await fs.pathExists(themeFilePath)) {
        console.log(chalk.yellow(`  Warning: Theme file already exists: ${name}.json`));
        console.log(chalk.gray('  Delete or rename the existing file to create a new one.\n'));
        process.exit(1);
    }

    // Read base tokens
    let baseTokens;
    try {
        baseTokens = await fs.readJson(baseTokensPath);
    } catch (err) {
        console.log(chalk.red(`  Error reading tokens file: ${err.message}`));
        process.exit(1);
    }

    // Generate theme file content
    const themeContent = generateThemeTemplate(name, dark, extendsTheme, baseTokens);

    // Write theme file
    await fs.ensureDir(outputDir);
    await fs.writeJson(themeFilePath, themeContent, { spaces: 2 });
    console.log(chalk.green('  ✓') + chalk.gray(` Created ${path.relative(process.cwd(), themeFilePath)}`));

    // Update base tokens file with new theme reference
    const updated = await updateBaseTokens(baseTokensPath, baseTokens, {
        name,
        file: `./${name}.json`,
        mode: dark ? 'dark' : undefined,
        extends: extendsTheme
    });

    if (updated) {
        console.log(chalk.green('  ✓') + chalk.gray(` Updated ${tokensPath} with theme reference`));
    }

    console.log(chalk.cyan('\n  Theme added successfully!\n'));

    // Next steps
    console.log(chalk.bold('  Next steps:\n'));
    console.log(chalk.gray(`  1. Edit ${path.relative(process.cwd(), themeFilePath)} to customize your theme`));
    console.log(chalk.gray('  2. Run "npm run build" to generate theme CSS'));
    if (dark) {
        console.log(chalk.gray(`  3. Apply theme with: <html data-theme="dark">`));
    } else {
        console.log(chalk.gray(`  3. Apply theme with: <html class="theme-${name}">`));
    }
    console.log();
};

function generateThemeTemplate(name, isDark, extendsTheme, baseTokens) {
    const template = {
        $meta: {
            name: name,
            description: `${capitalizeFirst(name)} theme`
        }
    };

    // Add mode if dark
    if (isDark) {
        template.$meta.mode = 'dark';
    }

    // Add extends if specified
    if (extendsTheme) {
        template.$meta.extends = extendsTheme;
    }

    // Add color overrides as examples
    if (isDark) {
        // Dark mode template
        template.color = {
            background: {
                $value: '#1a1a2e',
                $type: 'color',
                $description: 'Dark page background'
            },
            surface: {
                $value: '#16213e',
                $type: 'color',
                $description: 'Dark surface color'
            },
            text: {
                $value: '#eaeaea',
                $type: 'color',
                $description: 'Light text on dark'
            },
            'text-muted': {
                $value: '#a0a0a0',
                $type: 'color',
                $description: 'Muted text on dark'
            },
            primary: {
                $value: '#4dabf7',
                $type: 'color',
                $description: 'Primary color for dark mode'
            },
            'primary-hover': {
                $value: '#74c0fc',
                $type: 'color',
                $description: 'Hover state for dark primary'
            }
        };
    } else {
        // Light variant template - use existing base colors as reference
        const primaryColor = getTokenValue(baseTokens, 'color', 'primary') || '#0d6efd';

        template.color = {
            primary: {
                $value: primaryColor,
                $type: 'color',
                $description: 'Override this with your theme primary color'
            },
            'primary-hover': {
                $value: darkenColor(primaryColor),
                $type: 'color',
                $description: 'Hover state for primary'
            },
            background: {
                $value: '#ffffff',
                $type: 'color',
                $description: 'Override this with your theme background'
            }
        };

        // Add some characteristic overrides for variant themes
        template.border = {
            radius: {
                sm: { $value: '4px', $type: 'dimension', $description: 'Override border radius' },
                md: { $value: '8px', $type: 'dimension' },
                lg: { $value: '12px', $type: 'dimension' }
            }
        };
    }

    return template;
}

async function updateBaseTokens(filePath, tokens, themeRef) {
    // Initialize $meta.themes if it doesn't exist
    if (!tokens.$meta) {
        tokens.$meta = {};
    }
    if (!tokens.$meta.themes) {
        tokens.$meta.themes = [];
    }

    // Check if theme already exists
    const existingIndex = tokens.$meta.themes.findIndex(t => t.name === themeRef.name);
    if (existingIndex !== -1) {
        console.log(chalk.yellow(`  Theme "${themeRef.name}" already in $meta.themes, skipping update`));
        return false;
    }

    // Build theme reference object (only include defined properties)
    const themeEntry = { name: themeRef.name, file: themeRef.file };
    if (themeRef.mode) {
        themeEntry.mode = themeRef.mode;
    }
    if (themeRef.extends) {
        themeEntry.extends = themeRef.extends;
    }

    // Add theme reference
    tokens.$meta.themes.push(themeEntry);

    // Write updated tokens
    await fs.writeJson(filePath, tokens, { spaces: 2 });
    return true;
}

function getTokenValue(tokens, ...path) {
    let current = tokens;
    for (const key of path) {
        if (!current || typeof current !== 'object') return null;
        current = current[key];
    }
    return current?.$value || null;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function darkenColor(hex) {
    // Simple hex color darkening
    if (!hex.startsWith('#')) return hex;

    const num = parseInt(hex.slice(1), 16);
    const r = Math.max(0, ((num >> 16) & 255) - 25);
    const g = Math.max(0, ((num >> 8) & 255) - 25);
    const b = Math.max(0, (num & 255) - 25);

    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default { command, desc, builder, handler };
