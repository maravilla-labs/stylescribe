// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

import chalk from 'chalk';
import { existsSync } from 'fs';
import path from 'path';
import { buildSite, DEV_SERVER_ROOT, processPackageFiles, buildCssAndAnnotation, buildComponentsData, buildBlocksData, buildPagesData, processMarkdownFiles, BuildEvents } from '../utils/fileOperations.js';
import { resolvePath } from '../utils/pathResolver.js';
import { DevServer } from '../utils/devserver.js';
import { formatBuildError } from '../utils/errors.js';

export const command = 'dev';
export const desc = 'Generate Docs';

export const builder = (yargs) => {
    yargs
        .option('source', {
            describe: 'Source directory of CSS/SCSS files',
            type: 'string',
            demandOption: true,
            default: "./sass",
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
            default: true
        })
        .option('screenshots', {
            describe: 'Enable async screenshot generation on file changes (requires Playwright)',
            type: 'boolean',
            default: false
        })
        .option('port', {
            alias: 'p',
            describe: 'Port to run the dev server on',
            type: 'number',
            default: 4142
        })
        .option('auto-port', {
            describe: 'Automatically find an available port if the specified port is in use',
            type: 'boolean',
            default: false
        })
        .option('open', {
            describe: 'Open browser automatically when server starts',
            type: 'boolean',
            default: true
        });
};

export const handler = async (argv) => {
    try {
        processPackageFiles(process.cwd(), DEV_SERVER_ROOT);
        await buildCssAndAnnotation(argv.source, argv.buildTarget, argv.watch);
        await buildComponentsData(argv.source, argv.buildTarget, argv.watch);

        // Build UI Blocks and Pages (HTML-first, docs-only content)
        // Source is project root where blocks/ and pages/ directories live
        await buildBlocksData(process.cwd(), argv.buildTarget, argv.watch);
        await buildPagesData(process.cwd(), argv.buildTarget, argv.watch);
        await buildSite(argv.buildTarget, DEV_SERVER_ROOT, argv.watch);
        await processMarkdownFiles(argv.buildTarget, DEV_SERVER_ROOT, argv.watch);

        // Check for base/app wrapper CSS (needed for preview dark mode etc)
        const baseCssPath = path.join(DEV_SERVER_ROOT, 'base.css');
        const appCssPath = path.join(DEV_SERVER_ROOT, 'css', 'components', 'app.css');
        if (!existsSync(baseCssPath) && !existsSync(appCssPath)) {
            console.warn(chalk.yellow('\n⚠️  Warning: No base.css or app.css found.'));
            console.warn(chalk.yellow('   Component previews may not display correctly (e.g., dark mode backgrounds).'));
            console.warn(chalk.yellow('   Create sass/base.scss or sass/components/app/app.scss'));
            console.warn(chalk.yellow('   to define global styles like body background colors.\n'));
        }

        // Set up async screenshot generation if enabled
        if (argv.screenshots) {
            setupAsyncScreenshots(DEV_SERVER_ROOT);
        }

        // Start dev server with options
        const serverInfo = await DevServer(DEV_SERVER_ROOT, {
            port: argv.port,
            autoPort: argv.autoPort,
            open: argv.open
        });

        // Output port info for programmatic use (e.g., Stylescribe Studio)
        if (!argv.open) {
            console.log(chalk.cyan(`\nServer running at: ${serverInfo.url}`));
        }
    } catch (error) {
        formatBuildError(error);
        process.exit(1);
    }
};

/**
 * Set up async screenshot generation that runs after builds
 * Screenshots are queued and generated in the background without blocking hot reload
 */
function setupAsyncScreenshots(outputDir) {
    let screenshotQueue = [];
    let isProcessing = false;

    // Check if Playwright is available (non-blocking check)
    let playwrightAvailable = false;
    (async () => {
        try {
            const { isPlaywrightInstalled } = await import('../utils/screenshots/installer.js');
            playwrightAvailable = await isPlaywrightInstalled();
            if (playwrightAvailable) {
                console.log(chalk.gray('Screenshots enabled - changes will update screenshots in background'));
            } else {
                console.log(chalk.yellow('Screenshots enabled but Playwright not installed. Run `stylescribe screenshots` to install.'));
            }
        } catch (e) {
            // Playwright check failed, continue without screenshots
        }
    })();

    // Listen for site build complete events
    BuildEvents.on('sitebuild:finished', async () => {
        if (!playwrightAvailable) return;

        // Queue a screenshot update
        screenshotQueue.push(Date.now());

        // Process queue (debounced)
        if (!isProcessing) {
            isProcessing = true;
            // Wait a bit for any rapid consecutive builds to settle
            setTimeout(async () => {
                screenshotQueue = [];
                try {
                    const { generateScreenshots } = await import('../utils/screenshots/generator.js');
                    const { loadComponentsJson, loadBlocksJson, loadPagesJson } = await import('../utils/screenshots/loader.js');

                    // Load all items
                    const items = [];
                    const components = await loadComponentsJson(outputDir);
                    items.push(...components.map(c => ({ ...c, itemType: 'component' })));
                    const blocks = await loadBlocksJson(outputDir);
                    items.push(...blocks.map(b => ({ ...b, itemType: 'block' })));
                    const pages = await loadPagesJson(outputDir);
                    items.push(...pages.map(p => ({ ...p, itemType: 'page' })));

                    if (items.length > 0) {
                        const result = await generateScreenshots(items, {
                            outputDir,
                            changedOnly: true,
                            parallel: 2, // Lower parallelism during dev
                            viewport: { width: 800, height: 600 },
                            format: 'png'
                        });
                        if (result.generated > 0) {
                            console.log(chalk.gray(`Screenshots updated: ${result.generated} generated`));
                        }
                    }
                } catch (err) {
                    console.warn(chalk.yellow('Screenshot update failed:'), err.message);
                }
                isProcessing = false;
            }, 2000); // 2 second debounce
        }
    });
}

export default { command, desc, builder, handler };
