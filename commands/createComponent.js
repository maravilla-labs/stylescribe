// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { resolvePath } from '../utils/pathResolver.js';

export const command = 'create-component <name>';
export const desc = 'Create a new component scaffold';

export const builder = (yargs) => {
    yargs
        .positional('name', {
            describe: 'Name of the component to create',
            type: 'string',
        })
        .option('source', {
            describe: 'Source directory for components',
            type: 'string',
            default: './sass/components',
            coerce: resolvePath,
        })
        .option('group', {
            describe: 'Component group for navigation (REQUIRED). E.g., "Actions", "Containment", "Communication"',
            type: 'string',
            demandOption: true,
        })
        .option('with-tokens', {
            describe: 'Also create component token file in tokens/components/',
            type: 'boolean',
            default: true,
        });
};

export const handler = async (argv) => {
    try {
        const componentDir = path.join(argv.source, argv.name);
        const scssFile = path.join(componentDir, `${argv.name}.scss`);

        if (fs.existsSync(componentDir)) {
            console.error(chalk.red(`Component "${argv.name}" already exists at ${componentDir}`));
            process.exit(1);
        }

        fs.mkdirSync(componentDir, { recursive: true });

        const titleCase = argv.name.charAt(0).toUpperCase() + argv.name.slice(1);

        // Always use ds- prefix in source files - it gets compiled to configured prefix at build time
        // Component tokens reference global tokens WITHOUT inline fallbacks
        const scssTemplate = `/**
 * @title ${titleCase}
 * @description A new ${argv.name} component
 * @group ${argv.group}
 * @variations default, primary
 * @elements content
 * @examples
 * - title: Default ${titleCase}
 *   description: Basic ${argv.name} usage
 *   code: |
 *     <div class="ds-${argv.name}">
 *       <div class="ds-${argv.name}__content">Content here</div>
 *     </div>
 * - title: Primary ${titleCase}
 *   description: Primary variation
 *   code: |
 *     <div class="ds-${argv.name} ds-${argv.name}--primary">
 *       <div class="ds-${argv.name}__content">Primary content</div>
 *     </div>
 */

@layer components {
  .ds-${argv.name} {
    /* ===== Component Tokens ===== */
    /* Reference global tokens WITHOUT inline fallbacks */
    /* For customizable defaults, define in tokens/components/${argv.name}.json */
    --${argv.name}-font: var(--font-family-base);
    --${argv.name}-bg: var(--color-semantic-surface);
    --${argv.name}-text: var(--color-semantic-text);
    --${argv.name}-padding: var(--spacing-scale-md);
    --${argv.name}-radius: var(--border-radius-md);

    /* ===== Base Styles ===== */
    font-family: var(--${argv.name}-font);
    background: var(--${argv.name}-bg);
    color: var(--${argv.name}-text);
    padding: var(--${argv.name}-padding);
    border-radius: var(--${argv.name}-radius);

    /* ===== Elements ===== */
    &__content {
      /* Element styles here */
    }

    /* ===== Variations (token overrides only) ===== */
    &--primary {
      --${argv.name}-bg: var(--color-primary-500);
      --${argv.name}-text: var(--color-accessibility-on-primary);
    }
  }
}
`;

        fs.writeFileSync(scssFile, scssTemplate);

        console.log(chalk.green(`  ✓ Created component SCSS at ${scssFile}`));

        // Create component token file if requested
        if (argv.withTokens) {
            const tokensDir = path.join(process.cwd(), 'tokens', 'components');
            const tokenFile = path.join(tokensDir, `${argv.name}.json`);

            if (!fs.existsSync(tokensDir)) {
                fs.mkdirSync(tokensDir, { recursive: true });
            }

            if (!fs.existsSync(tokenFile)) {
                const tokenTemplate = {
                    $meta: {
                        name: argv.name,
                        description: `Design tokens for the ${titleCase} component`,
                    },
                    [argv.name]: {
                        background: {
                            $value: '{color.surface}',
                            $type: 'color',
                            $description: `${titleCase} background color`,
                        },
                        text: {
                            $value: '{color.text}',
                            $type: 'color',
                            $description: `${titleCase} text color`,
                        },
                        padding: {
                            $value: '{spacing.md}',
                            $type: 'dimension',
                            $description: `${titleCase} padding`,
                        },
                        'border-radius': {
                            $value: '{border.radius.md}',
                            $type: 'dimension',
                            $description: `${titleCase} border radius`,
                        },
                    },
                };

                fs.writeFileSync(tokenFile, JSON.stringify(tokenTemplate, null, 2));
                console.log(chalk.green('  ✓') + chalk.gray(` Created component tokens at ${tokenFile}`));
            } else {
                console.log(chalk.yellow('  ⊘') + chalk.gray(` Token file already exists: ${tokenFile}`));
            }
        }

        console.log();
        console.log(chalk.cyan('  Token pattern reminder:'));
        console.log(chalk.gray('    • SCSS tokens reference global tokens WITHOUT fallbacks'));
        console.log(chalk.gray('    • Component defaults defined in tokens/components/*.json'));
        console.log(chalk.gray('    • Variations only override tokens, never add behavior'));
    } catch (error) {
        console.error(chalk.bgRed.white.bold('Error creating component:'), chalk.bold(error.message));
        console.error(chalk.gray(error.stack));
        process.exit(1);
    }
};

export default { command, desc, builder, handler };
