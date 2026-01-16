// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

import chalk from 'chalk';
import path from 'path';
import { resolvePath } from '../utils/pathResolver.js';
import { formatBuildError } from '../utils/errors.js';

export const command = 'screenshots';
export const desc = 'Generate component screenshots for documentation';

export const builder = (yargs) => {
    yargs
        .option('source', {
            describe: 'Source directory of CSS/SCSS files',
            type: 'string',
            default: './sass',
            coerce: resolvePath
        })
        .option('output', {
            describe: 'Output directory (where site/ is located)',
            type: 'string',
            default: './site',
            coerce: resolvePath
        })
        .option('changed-only', {
            describe: 'Only screenshot changed components',
            type: 'boolean',
            default: true
        })
        .option('parallel', {
            describe: 'Number of parallel browser workers',
            type: 'number',
            default: 4
        })
        .option('viewport', {
            describe: 'Viewport dimensions (WxH)',
            type: 'string',
            default: '800x600'
        })
        .option('format', {
            describe: 'Output format (png, webp, jpeg)',
            type: 'string',
            choices: ['png', 'webp', 'jpeg'],
            default: 'png'
        })
        .option('type', {
            describe: 'What to screenshot (all, components, blocks, pages, docs)',
            type: 'string',
            choices: ['all', 'components', 'blocks', 'pages', 'docs'],
            default: 'all'
        })
        .option('force', {
            describe: 'Force regenerate all screenshots (ignore cache)',
            type: 'boolean',
            default: false
        });
};

export const handler = async (argv) => {
    try {
        console.log(chalk.blue('Generating screenshots...'));

        // Check if Playwright is installed, prompt for installation if not
        const { ensurePlaywrightInstalled } = await import('../utils/screenshots/installer.js');
        const playwrightReady = await ensurePlaywrightInstalled();

        if (!playwrightReady) {
            return; // User declined installation or it failed
        }

        // Parse viewport
        const [width, height] = argv.viewport.split('x').map(Number);
        if (!width || !height) {
            throw new Error('Invalid viewport format. Use WxH (e.g., 800x600)');
        }

        const options = {
            sourceDir: argv.source,
            outputDir: argv.output,
            changedOnly: argv['changed-only'] && !argv.force,
            parallel: argv.parallel,
            viewport: { width, height },
            format: argv.format,
            type: argv.type
        };

        // Lazy-load screenshot modules
        const { generateScreenshots } = await import('../utils/screenshots/generator.js');
        const { loadComponentsJson, loadBlocksJson, loadPagesJson, loadDocsPages } = await import('../utils/screenshots/loader.js');

        // Load components/blocks/pages/docs data
        const items = await loadItems(options.outputDir, options.type, { loadComponentsJson, loadBlocksJson, loadPagesJson, loadDocsPages });

        if (items.length === 0) {
            console.log(chalk.yellow('No items found to screenshot. Run `stylescribe docs` first.'));
            return;
        }

        console.log(chalk.gray(`Found ${items.length} items to process`));

        // Generate screenshots
        const result = await generateScreenshots(items, options);

        // Report results
        console.log(chalk.green(`\nScreenshots generated:`));
        console.log(`  Total: ${result.total}`);
        console.log(`  Generated: ${result.generated}`);
        console.log(`  Cached: ${result.cached}`);
        console.log(`  Failed: ${result.failed}`);

        if (result.errors.length > 0) {
            console.log(chalk.yellow('\nErrors:'));
            result.errors.forEach(err => {
                console.log(chalk.red(`  ${err.name}: ${err.error}`));
            });
        }

    } catch (error) {
        formatBuildError(error);
        process.exit(1);
    }
};

/**
 * Load items to screenshot based on type
 */
async function loadItems(outputDir, type, loaders) {
    const { loadComponentsJson, loadBlocksJson, loadPagesJson, loadDocsPages } = loaders;
    const items = [];

    if (type === 'all' || type === 'components') {
        const components = await loadComponentsJson(outputDir);
        items.push(...components.map(c => ({ ...c, itemType: 'component' })));
    }

    if (type === 'all' || type === 'blocks') {
        const blocks = await loadBlocksJson(outputDir);
        items.push(...blocks.map(b => ({ ...b, itemType: 'block' })));
    }

    if (type === 'all' || type === 'pages') {
        const pages = await loadPagesJson(outputDir);
        items.push(...pages.map(p => ({ ...p, itemType: 'fullpage' })));
    }

    // Include docs pages for screenshots (for search result thumbnails)
    if (type === 'all' || type === 'docs') {
        const docs = await loadDocsPages(process.cwd());
        items.push(...docs.map(d => ({ ...d, itemType: 'doc' })));
    }

    return items;
}

export default { command, desc, builder, handler };
