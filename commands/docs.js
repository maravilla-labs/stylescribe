// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

import chalk from 'chalk';
import { buildSite, DEV_SERVER_ROOT, processPackageFiles, buildCssAndAnnotation, buildComponentsData, buildBlocksData, buildPagesData, processMarkdownFiles } from '../utils/fileOperations.js';
import { resolvePath } from '../utils/pathResolver.js';
import { DevServer } from '../utils/devserver.js';
import { formatBuildError } from '../utils/errors.js';

export const command = 'docs';
export const desc = 'Generate Docs';

/**
 * Load items for screenshot generation (lazy-loaded to avoid requiring playwright)
 */
async function loadScreenshotItems(outputDir) {
    const { loadComponentsJson, loadBlocksJson, loadPagesJson } = await import('../utils/screenshots/loader.js');
    const items = [];

    const components = await loadComponentsJson(outputDir);
    items.push(...components.map(c => ({ ...c, itemType: 'component' })));

    const blocks = await loadBlocksJson(outputDir);
    items.push(...blocks.map(b => ({ ...b, itemType: 'block' })));

    const pages = await loadPagesJson(outputDir);
    items.push(...pages.map(p => ({ ...p, itemType: 'page' })));

    return items;
}

export const builder = (yargs) => {
    yargs
        .option('source', {
            describe: 'Source directory of CSS/SCSS files',
            type: 'string',
            demandOption: true,
            default: "./sass",
            coerce: resolvePath
        })
        .option('output', {
            describe: 'Output directory of the Site',
            type: 'string',
            demandOption: true,
            default: "./site",
            coerce: resolvePath
        })
        .option('build-target', {
            describe: 'build-target',
            type: 'string',
            demandOption: true,
            default: "./build",
            coerce: resolvePath
        })
        .option('watch', {
            describe: 'Watch for file changes and rebuild as necessary',
            type: 'boolean',
            default: false
        })
        .option('screenshots', {
            describe: 'Generate component screenshots after build',
            type: 'boolean',
            default: false
        });
};

export const handler = async (argv) => {
    try {
        console.log("Building Docs");
        processPackageFiles(process.cwd(), argv.output);
        await buildCssAndAnnotation(argv.source, argv.buildTarget, argv.watch);
        await buildComponentsData(argv.source, argv.buildTarget, argv.watch);
        // Build UI Blocks and Pages (HTML-first, docs-only content)
        // Source is project root where blocks/ and pages/ directories live
        await buildBlocksData(process.cwd(), argv.buildTarget, argv.watch);
        await buildPagesData(process.cwd(), argv.buildTarget, argv.watch);
        await buildSite(argv.buildTarget, argv.output, argv.watch);
        await processMarkdownFiles(argv.buildTarget, argv.output, argv.watch);

        // Generate screenshots if requested
        if (argv.screenshots) {
            console.log(chalk.blue('\nGenerating component screenshots...'));
            try {
                // Check if Playwright is installed, prompt for installation if not
                const { ensurePlaywrightInstalled } = await import('../utils/screenshots/installer.js');
                const playwrightReady = await ensurePlaywrightInstalled();

                if (playwrightReady) {
                    // Lazy-load screenshot modules
                    const { generateScreenshots } = await import('../utils/screenshots/generator.js');
                    const items = await loadScreenshotItems(argv.output);
                    if (items.length > 0) {
                        const result = await generateScreenshots(items, {
                            outputDir: argv.output,
                            changedOnly: true,
                            parallel: 4,
                            viewport: { width: 800, height: 600 },
                            format: 'png'
                        });
                        console.log(chalk.green(`Screenshots: ${result.generated} generated, ${result.cached} cached, ${result.failed} failed`));
                    }
                }
            } catch (screenshotError) {
                console.warn(chalk.yellow('Screenshot generation failed:'), screenshotError.message);
                // Don't fail the build for screenshot errors
            }
        }
    } catch (error) {
        formatBuildError(error);
        process.exit(1);
    }
};

export default { command, desc, builder, handler };
