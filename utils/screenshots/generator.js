// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Screenshot generator using Playwright
 * Captures screenshots of component examples for documentation
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import chalk from 'chalk';
import pLimit from 'p-limit';
import { ensureDir, existsSync, writeFileSync, readFileSync } from '../fs.js';
import { loadCache, saveCache, hasChanged, generateItemHash } from './cache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Lazy-load playwright from stylescribe's own node_modules
 */
async function getChromium() {
    try {
        // Load from stylescribe's node_modules (where we installed it)
        const stylescribeRequire = createRequire(import.meta.url);
        const { chromium } = stylescribeRequire('playwright');
        return chromium;
    } catch {
        throw new Error(
            'Playwright is required for screenshot generation.\n' +
            'Run `stylescribe screenshots` and follow the prompts to install it.'
        );
    }
}

/**
 * Generate screenshots for items (components, blocks, pages)
 * Screenshots are stored in ./static/screenshots/ (shared location)
 * and get copied to site during docs build
 * @param {Array} items - Array of items to screenshot
 * @param {Object} options - Generation options
 * @returns {Object} Result statistics
 */
export async function generateScreenshots(items, options) {
    const {
        outputDir,
        changedOnly = true,
        parallel = 4,
        viewport = { width: 800, height: 600 },
        format = 'png'
    } = options;

    const result = {
        total: items.length,
        generated: 0,
        cached: 0,
        failed: 0,
        errors: []
    };

    // Screenshots go to shared ./static/screenshots/ at project root
    // This gets copied to site during docs build
    const projectRoot = process.cwd();
    const screenshotsDir = path.join(projectRoot, 'static', 'screenshots');
    ensureDir(screenshotsDir);

    // Cache at project root (shared between dev and docs)
    const cacheFile = path.join(projectRoot, '.screenshot-cache.json');
    const cache = loadCache(cacheFile);

    // Filter items that need screenshots
    const itemsToProcess = changedOnly
        ? items.filter(item => hasChanged(item, cache))
        : items;

    result.cached = items.length - itemsToProcess.length;

    if (itemsToProcess.length === 0) {
        console.log(chalk.gray('All screenshots are up to date'));
        return result;
    }

    console.log(chalk.blue(`Processing ${itemsToProcess.length} items...`));

    // Launch browser (lazy-load playwright)
    let browser;
    try {
        const chromium = await getChromium();
        browser = await chromium.launch({
            headless: true
        });
    } catch (error) {
        console.error(chalk.red('Failed to launch browser:'));
        console.error(chalk.yellow(error.message));
        throw error;
    }

    // Create concurrency limiter
    const limit = pLimit(parallel);

    // Process items in parallel
    const tasks = itemsToProcess.map(item =>
        limit(async () => {
            try {
                await captureScreenshot(browser, item, {
                    outputDir,
                    screenshotsDir,
                    viewport,
                    format,
                    cache,
                    cacheFile
                });
                result.generated++;
                console.log(chalk.green(`  ✓ ${item.name}`));
            } catch (error) {
                result.failed++;
                result.errors.push({
                    name: item.name,
                    error: error.message
                });
                console.log(chalk.red(`  ✗ ${item.name}: ${error.message}`));
            }
        })
    );

    await Promise.all(tasks);

    // Close browser
    await browser.close();

    // Save final cache
    saveCache(cacheFile, cache);

    return result;
}

/**
 * Capture screenshot for a single item using smart sizing
 */
async function captureScreenshot(browser, item, options) {
    const {
        outputDir,
        screenshotsDir,
        format,
        cache,
        cacheFile
    } = options;

    // Determine the preview URL based on item type
    const previewUrl = getPreviewUrl(item, outputDir);

    // Use large viewport to ensure desktop rendering (not tablet/mobile breakpoints)
    const context = await browser.newContext({
        viewport: { width: 1400, height: 900 },
        deviceScaleFactor: 2 // Retina-quality screenshots
    });

    const page = await context.newPage();

    try {
        // Navigate to preview page
        await page.goto(previewUrl, {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Wait for content to render
        await page.waitForTimeout(300);

        // Determine output path
        const outputPath = getOutputPath(item, screenshotsDir, format);

        // For docs pages, take viewport screenshot (they don't have #preview-content)
        if (item.itemType === 'doc') {
            await page.screenshot({
                path: outputPath,
                type: format === 'jpeg' ? 'jpeg' : 'png',
                quality: format === 'jpeg' ? 90 : undefined,
                clip: { x: 0, y: 0, width: 1200, height: 630 } // OG image dimensions
            });
        } else {
            // Get the screenshot target element
            const targetSelector = getTargetSelector(item);
            const target = await page.$(targetSelector);

            if (target) {
                // Smart capture based on element size
                await captureElementSmart(page, target, outputPath, format);
            } else {
                // Fallback: screenshot a reasonable portion of viewport
                await page.screenshot({
                    path: outputPath,
                    type: format === 'jpeg' ? 'jpeg' : 'png',
                    quality: format === 'jpeg' ? 90 : undefined,
                    clip: { x: 0, y: 0, width: 600, height: 400 }
                });
            }
        }

        // Update cache
        updateCache(cache, item, outputPath);
        saveCache(cacheFile, cache);

    } finally {
        await context.close();
    }
}

/**
 * Smart screenshot capture - sizes output based on actual element dimensions
 * Small components get tight crops, large components get more context
 */
async function captureElementSmart(page, element, outputPath, format) {
    const box = await element.boundingBox();

    if (!box) {
        // Element not visible, fallback
        await page.screenshot({
            path: outputPath,
            type: format === 'jpeg' ? 'jpeg' : 'png',
            clip: { x: 0, y: 0, width: 400, height: 300 }
        });
        return;
    }

    // Padding around the component
    const padding = 32;

    // Size constraints - large enough for desktop layouts
    const minWidth = 200;
    const minHeight = 120;
    const maxWidth = 1200;  // Full desktop width
    const maxHeight = 800;

    // Calculate dimensions with padding, respecting min/max
    const contentWidth = box.width + padding * 2;
    const contentHeight = box.height + padding * 2;

    const width = Math.min(maxWidth, Math.max(minWidth, contentWidth));
    const height = Math.min(maxHeight, Math.max(minHeight, contentHeight));

    // Center the clip area on the element
    const clip = {
        x: Math.max(0, box.x - (width - box.width) / 2),
        y: Math.max(0, box.y - (height - box.height) / 2),
        width,
        height
    };

    await page.screenshot({
        path: outputPath,
        type: format === 'jpeg' ? 'jpeg' : 'png',
        quality: format === 'jpeg' ? 90 : undefined,
        clip
    });
}

/**
 * Get the preview URL for an item
 */
function getPreviewUrl(item, outputDir) {
    const baseDir = path.resolve(outputDir);

    switch (item.itemType) {
        case 'component':
            // Use the first example preview
            return `file://${baseDir}/components/${item.name}-example-0.preview.html`;
        case 'block':
            return `file://${baseDir}/blocks/${item.name}-preview.html`;
        case 'fullpage':
            return `file://${baseDir}/pages/${item.name}-preview.html`;
        case 'doc':
            // Docs pages are rendered HTML files (slug now includes /index for index.md files)
            return `file://${baseDir}/${item.slug}.html`;
        default:
            return `file://${baseDir}/components/${item.name}-example-0.preview.html`;
    }
}

/**
 * Get the CSS selector for the screenshot target
 */
function getTargetSelector(item) {
    // Docs pages don't have preview-content, use main content or body
    if (item.itemType === 'doc') {
        return 'main, .content, article, body';
    }
    // Target the preview content wrapper which shrinks to fit its content
    return '#preview-content';
}

/**
 * Get the output path for a screenshot
 * Path format matches search index: screenshots/{type}-{name}.{ext}
 */
function getOutputPath(item, screenshotsDir, format) {
    const ext = format === 'jpeg' ? 'jpg' : format;

    switch (item.itemType) {
        case 'component':
            return path.join(screenshotsDir, `component-${item.name}.${ext}`);
        case 'block':
            return path.join(screenshotsDir, `block-${item.name}.${ext}`);
        case 'fullpage':
            return path.join(screenshotsDir, `page-${item.name}.${ext}`);
        case 'doc':
            // Use the name (which has slashes replaced with dashes)
            return path.join(screenshotsDir, `page-${item.name}.${ext}`);
        default:
            return path.join(screenshotsDir, `component-${item.name}.${ext}`);
    }
}

/**
 * Update cache entry for an item
 */
function updateCache(cache, item, outputPath) {
    const cacheKey = `${item.itemType}:${item.name}`;
    cache.items = cache.items || {};
    cache.items[cacheKey] = {
        hash: generateItemHash(item),
        generated: new Date().toISOString(),
        file: outputPath
    };
}

export default { generateScreenshots };
