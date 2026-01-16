// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Initialize a new Stylescribe project
 *
 * Reads template files from templates/init/default/ and copies them
 * to the target directory with placeholder replacements.
 */

import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { input, confirm, select } from '@inquirer/prompts';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read stylescribe's own version for use in generated package.json
const stylescribePackageJson = JSON.parse(
    await fs.readFile(path.join(__dirname, '..', 'package.json'), 'utf-8')
);
const STYLESCRIBE_VERSION = stylescribePackageJson.version;

export const command = 'init [directory]';
export const desc = 'Initialize a new Stylescribe project';

export const builder = (yargs) => {
    yargs
        .positional('directory', {
            describe: 'Project directory (default: current)',
            type: 'string',
            default: '.'
        })
        .option('yes', {
            alias: 'y',
            describe: 'Skip prompts and use defaults',
            type: 'boolean',
            default: false
        })
        .option('name', {
            describe: 'Project name',
            type: 'string'
        })
        .option('description', {
            describe: 'Project description',
            type: 'string'
        })
        .option('dark', {
            describe: 'Include dark mode support',
            type: 'boolean'
        })
        .option('theme-variant', {
            describe: 'Include example theme variant',
            type: 'boolean'
        })
        .option('prefix', {
            describe: 'CSS class prefix',
            type: 'string'
        })
        .option('claude', {
            describe: 'Include Claude Code AI assistant support',
            type: 'boolean'
        });
};

export const handler = async (argv) => {
    const targetDir = path.resolve(process.cwd(), argv.directory);
    const dirName = path.basename(targetDir);
    const useDefaults = argv.yes;

    console.log(chalk.cyan('\n  Stylescribe Project Initialization\n'));

    // Check if directory exists and has content
    const isCurrentDir = argv.directory === '.';
    const hasPackageJson = await fs.pathExists(path.join(targetDir, 'package.json'));
    const hasStylescriberc = await fs.pathExists(path.join(targetDir, '.stylescriberc.json'));

    if (hasStylescriberc && !useDefaults) {
        console.log(chalk.yellow('  A .stylescriberc.json file already exists in this directory.'));
        const shouldContinue = await confirm({
            message: 'Overwrite existing Stylescribe configuration?',
            default: false
        });
        if (!shouldContinue) {
            console.log(chalk.gray('  Initialization cancelled.\n'));
            return;
        }
    }

    // Gather project information - use CLI args, then prompt if not --yes
    let projectName, description, includeDarkMode, includeThemeVariant, classPrefix, includeClaudeCode;

    if (useDefaults) {
        // Use CLI args or defaults
        projectName = argv.name || dirName || 'my-design-system';
        description = argv.description || 'A design system built with Stylescribe';
        includeDarkMode = argv.dark !== undefined ? argv.dark : true;
        includeThemeVariant = argv.themeVariant !== undefined ? argv.themeVariant : false;
        classPrefix = argv.prefix || 'ds-';
        includeClaudeCode = argv.claude !== undefined ? argv.claude : true;
    } else {
        // Interactive prompts
        projectName = argv.name || await input({
            message: 'Project name:',
            default: dirName || 'my-design-system'
        });

        description = argv.description || await input({
            message: 'Description:',
            default: 'A design system built with Stylescribe'
        });

        includeDarkMode = argv.dark !== undefined ? argv.dark : await confirm({
            message: 'Include dark mode support?',
            default: true
        });

        includeThemeVariant = argv.themeVariant !== undefined ? argv.themeVariant : await confirm({
            message: 'Include example theme variant (comic)?',
            default: false
        });

        classPrefix = argv.prefix || await input({
            message: 'CSS class prefix:',
            default: 'ds-'
        });

        // AI assistant support
        if (argv.claude !== undefined) {
            includeClaudeCode = argv.claude;
        } else {
            const aiChoice = await select({
                message: 'Configure AI coding assistant support?',
                choices: [
                    { name: 'Claude Code (recommended)', value: 'claude' },
                    { name: 'Other agents (coming soon)', value: 'other', disabled: true },
                    { name: 'Skip for now', value: 'skip' }
                ]
            });
            includeClaudeCode = aiChoice === 'claude';
        }
    }

    console.log(chalk.cyan('\n  Creating project structure...\n'));

    // Create target directory
    await fs.ensureDir(targetDir);

    // Get template directory
    const templateDir = path.join(__dirname, '..', 'templates', 'init', 'default');

    // Context for placeholder replacement
    const context = {
        projectName,
        description,
        prefix: classPrefix,
        date: new Date().toISOString().split('T')[0]
    };

    // Copy template files
    const templateFiles = await getTemplateFiles(templateDir);

    // Binary file extensions that should be copied directly without text processing
    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', '.woff', '.woff2', '.ttf', '.eot', '.otf', '.pdf', '.zip'];

    for (const relativePath of templateFiles) {
        // Skip optional files based on user choices
        if (relativePath === 'tokens/dark.json' && !includeDarkMode) continue;
        if (relativePath === 'tokens/comic.json' && !includeThemeVariant) continue;
        if (relativePath === 'CLAUDE.md' && !includeClaudeCode) continue;
        if (relativePath === '.mcp.json' && !includeClaudeCode) continue;
        if (relativePath.startsWith('.claude/') && !includeClaudeCode) continue;

        const sourcePath = path.join(templateDir, relativePath);
        const destPath = path.join(targetDir, relativePath);
        await fs.ensureDir(path.dirname(destPath));

        const ext = path.extname(relativePath).toLowerCase();
        if (binaryExtensions.includes(ext)) {
            // Copy binary files directly without text processing
            await fs.copy(sourcePath, destPath);
        } else {
            // Process text files with placeholder replacement
            const content = await fs.readFile(sourcePath, 'utf-8');
            const processedContent = replacePlaceholders(content, context);
            await fs.writeFile(destPath, processedContent, 'utf-8');
        }
        console.log(chalk.green('  ✓') + chalk.gray(` Created ${relativePath}`));
    }

    // Generate config files programmatically
    await generateConfigFiles(targetDir, {
        projectName,
        description,
        classPrefix,
        includeDarkMode,
        includeThemeVariant,
        hasPackageJson
    });

    console.log(chalk.cyan('\n  Project created successfully!\n'));

    // Next steps
    console.log(chalk.bold('  Next steps:\n'));
    if (!isCurrentDir) {
        console.log(chalk.gray(`  cd ${argv.directory}`));
    }
    console.log(chalk.gray('  npm install'));
    console.log(chalk.gray('  npm run dev'));
    console.log();
    console.log(chalk.gray('  Then open http://localhost:4142 in your browser.'));

    if (includeClaudeCode) {
        console.log();
        console.log(chalk.cyan('  Claude Code Integration:'));
        console.log(chalk.gray('  Open this project in Claude Code - the MCP server will'));
        console.log(chalk.gray('  auto-start with pre-approved permissions.\n'));
    } else {
        console.log();
    }
};

/**
 * Recursively get all files from a directory
 */
async function getTemplateFiles(dir, basePath = '') {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
            const subFiles = await getTemplateFiles(path.join(dir, entry.name), relativePath);
            files.push(...subFiles);
        } else {
            files.push(relativePath);
        }
    }

    return files;
}

/**
 * Replace placeholders in content
 */
function replacePlaceholders(content, context) {
    return content
        .replace(/\{\{projectName\}\}/g, context.projectName)
        .replace(/\{\{description\}\}/g, context.description)
        .replace(/\{\{prefix\}\}/g, context.prefix)
        .replace(/\{\{date\}\}/g, context.date);
}

/**
 * Generate package.json and .stylescriberc.json
 */
async function generateConfigFiles(targetDir, options) {
    const { projectName, description, classPrefix, includeDarkMode, includeThemeVariant, hasPackageJson } = options;

    // package.json (only if doesn't exist)
    if (!hasPackageJson) {
        const packageJson = {
            name: projectName.toLowerCase().replace(/\s+/g, '-'),
            version: '1.0.0',
            private: true,
            description: description,
            scripts: {
                dev: 'stylescribe dev',
                build: 'stylescribe build',
                docs: 'stylescribe docs',
                'docs:screenshots': 'stylescribe docs && stylescribe screenshots',
                serve: 'stylescribe serve',
                screenshots: 'stylescribe screenshots',
                'create:component': 'stylescribe create-component',
                'tokens:validate': 'stylescribe tokens validate -i ./tokens/design-tokens.json',
                'tokens:export': 'stylescribe tokens export -i ./tokens/design-tokens.json -f css -o ./tokens/variables.css'
            },
            dependencies: {
                stylescribe: `^${STYLESCRIBE_VERSION}`
            }
        };
        await fs.writeFile(
            path.join(targetDir, 'package.json'),
            JSON.stringify(packageJson, null, 2) + '\n',
            'utf-8'
        );
        console.log(chalk.green('  ✓') + chalk.gray(' Created package.json'));
    }

    // .stylescriberc.json
    const stylescriberc = {
        productionBasepath: `@${projectName.toLowerCase().replace(/\s+/g, '-')}/`,
        classPrefix: classPrefix,
        headIncludes: {
            css: ['./base.css']
        },
        components: {
            groupOrder: ['Actions', 'Containment', 'Communication', 'Identity', 'AI Chat']
        },
        tokens: {
            source: 'tokens/design-tokens.json',
            include: ['tokens/components/*.json']
        },
        branding: {
            name: projectName,
            logo: 'stylescribe-logo.png',
            favicon: 'stylescribe-logo.png'
        },
        static: 'static'
    };
    await fs.writeFile(
        path.join(targetDir, '.stylescriberc.json'),
        JSON.stringify(stylescriberc, null, 2) + '\n',
        'utf-8'
    );
    console.log(chalk.green('  ✓') + chalk.gray(' Created .stylescriberc.json'));

    // .stylelintrc.json
    await fs.writeFile(
        path.join(targetDir, '.stylelintrc.json'),
        JSON.stringify({ rules: {} }, null, 2) + '\n',
        'utf-8'
    );
    console.log(chalk.green('  ✓') + chalk.gray(' Created .stylelintrc.json'));

    // Update design-tokens.json with theme references
    const tokensPath = path.join(targetDir, 'tokens', 'design-tokens.json');
    if (await fs.pathExists(tokensPath)) {
        const tokensContent = await fs.readFile(tokensPath, 'utf-8');
        const tokens = JSON.parse(tokensContent);

        const themes = [];
        if (includeDarkMode) {
            themes.push({ name: 'dark', file: './dark.json', mode: 'dark' });
        }
        if (includeThemeVariant) {
            themes.push({ name: 'comic', file: './comic.json' });
        }

        if (themes.length > 0) {
            tokens.$meta.themes = themes;
        }

        await fs.writeFile(
            tokensPath,
            JSON.stringify(tokens, null, 2) + '\n',
            'utf-8'
        );
    }
}

export default { command, desc, builder, handler };
