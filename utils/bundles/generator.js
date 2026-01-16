// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Bundle generator utility
 * Generates CSS bundles from compiled components and themes
 */
import path from 'path';
import chalk from 'chalk';
import fg from 'fast-glob';
import { ensureDir, existsSync, readFileSync, writeFileSync } from '../fs.js';
import { loadThemeTokensAsync, getThemeConfig } from '../themes/loader.js';
import { generateThemeCss, generateSingleThemeCss, tokensToCss } from '../tokens.js';
import { loadConfig, getBuildConfig, getTokenPrefix } from '../config/loader.js';

/**
 * Generate all CSS bundles based on configuration
 *
 * @param {string} sourceDir - Source directory with compiled CSS
 * @param {string} outputDir - Output directory for bundles
 * @returns {Promise<void>}
 */
export async function generateBundles(sourceDir, outputDir) {
    const config = loadConfig();
    const buildConfig = getBuildConfig(config);
    const themeConfig = getThemeConfig(config);
    const tokenPrefix = getTokenPrefix(config);
    const { bundles } = buildConfig;

    const cssDir = path.join(outputDir, 'css');
    ensureDir(cssDir);

    // Load theme data
    const themeData = await loadThemeTokensAsync(process.cwd());

    // Collect all component CSS
    const componentsCss = await collectComponentCss(outputDir);

    // Load base CSS if exists
    const baseCssPath = path.join(outputDir, 'base.css');
    const baseCss = existsSync(baseCssPath) ? readFileSync(baseCssPath, 'utf-8') : '';

    // Generate base tokens CSS (from design tokens)
    const baseTokensCss = themeData?.base
        ? tokensToCss(themeData.base, { selector: ':root', includeComments: true, tokenPrefix })
        : '';

    // Generate all-components.css (all components combined, no themes)
    if (bundles.allComponents) {
        const allComponentsCss = `/* All Components - Combined */\n${baseCss}\n\n/* Component Styles */\n${componentsCss}`;
        const allComponentsPath = path.join(cssDir, 'all-components.css');
        writeFileSync(allComponentsPath, allComponentsCss);
        console.log(chalk.green('Generated bundle'), 'css/all-components.css');
    }

    // Generate themes (combined and/or individual)
    if (themeData?.themes && Object.keys(themeData.themes).length > 0) {
        // Generate combined themes.css
        if (bundles.themes) {
            const themeCss = generateThemeCss(themeData.themeMatrix, { tokenPrefix });
            const themesPath = path.join(cssDir, 'themes.css');
            writeFileSync(themesPath, themeCss);
            console.log(chalk.green('Generated bundle'), 'css/themes.css');
        }

        // Generate individual theme files
        if (bundles.themesIndividual) {
            const themesDir = path.join(cssDir, 'themes');
            ensureDir(themesDir);

            for (const [themeName, theme] of Object.entries(themeData.themes)) {
                const singleThemeCss = generateSingleThemeCss(theme, themeData.base, {
                    themeConfig,
                    onlyOverrides: true,
                    includeComments: true,
                    tokenPrefix
                });

                if (singleThemeCss.trim()) {
                    const themePath = path.join(themesDir, `${themeName}.css`);
                    writeFileSync(themePath, singleThemeCss);
                    console.log(chalk.green('Generated theme'), `css/themes/${themeName}.css`);
                }
            }
        }

        // Generate per-theme bundles (base + components + specific theme)
        if (bundles.perTheme) {
            // bundle.light.css - base + components + base tokens (no dark overrides)
            const bundleLightCss = createBundle({
                baseCss,
                componentsCss,
                themesCss: baseTokensCss,
                name: 'light'
            });
            writeFileSync(path.join(cssDir, 'bundle.light.css'), bundleLightCss);
            console.log(chalk.green('Generated bundle'), 'css/bundle.light.css');

            // Generate bundle for each theme
            for (const [themeName, theme] of Object.entries(themeData.themes)) {
                // Skip combined themes (e.g., comic-dark) - they're handled differently
                if (themeName.includes('-')) continue;

                const themeCss = generateSingleThemeCss(theme, themeData.base, {
                    themeConfig,
                    onlyOverrides: true,
                    includeComments: true,
                    tokenPrefix
                });

                // For dark mode, include base tokens + dark overrides
                // For variants, include base tokens + variant overrides
                let bundleThemesCss = baseTokensCss;
                if (themeCss.trim()) {
                    bundleThemesCss += `\n${themeCss}`;
                }

                const bundleCss = createBundle({
                    baseCss,
                    componentsCss,
                    themesCss: bundleThemesCss,
                    name: themeName
                });

                writeFileSync(path.join(cssDir, `bundle.${themeName}.css`), bundleCss);
                console.log(chalk.green('Generated bundle'), `css/bundle.${themeName}.css`);
            }
        }

        // Generate bundle.all.css (everything combined)
        if (bundles.all) {
            const allThemesCss = generateThemeCss(themeData.themeMatrix, { tokenPrefix });
            const bundleAllCss = createBundle({
                baseCss,
                componentsCss,
                themesCss: allThemesCss,
                name: 'all'
            });
            writeFileSync(path.join(cssDir, 'bundle.all.css'), bundleAllCss);
            console.log(chalk.green('Generated bundle'), 'css/bundle.all.css');
        }
    } else {
        // No themes - just generate bundle.all.css with base + components
        if (bundles.all) {
            const bundleAllCss = createBundle({
                baseCss,
                componentsCss,
                themesCss: baseTokensCss,
                name: 'all'
            });
            writeFileSync(path.join(cssDir, 'bundle.all.css'), bundleAllCss);
            console.log(chalk.green('Generated bundle'), 'css/bundle.all.css');
        }
    }
}

/**
 * Collect all component CSS into a single string
 *
 * @param {string} outputDir - Build output directory
 * @returns {Promise<string>} Combined component CSS
 */
async function collectComponentCss(outputDir) {
    const componentsDir = path.join(outputDir, 'components');

    if (!existsSync(componentsDir)) {
        return '';
    }

    // Find all component CSS files
    const cssFiles = await fg('*/*.css', {
        cwd: componentsDir,
        absolute: true
    });

    // Sort for consistent output
    cssFiles.sort();

    // Combine all CSS
    const combined = cssFiles.map(file => {
        const componentName = path.basename(path.dirname(file));
        const css = readFileSync(file, 'utf-8');
        return `/* Component: ${componentName} */\n${css}`;
    }).join('\n\n');

    return combined;
}

/**
 * Create a bundle with consistent structure
 *
 * @param {object} options - Bundle options
 * @returns {string} Combined CSS bundle
 */
function createBundle({ baseCss, componentsCss, themesCss, name }) {
    const parts = [];

    parts.push(`/**
 * Stylescribe Bundle: ${name}
 * Generated: ${new Date().toISOString()}
 */`);

    if (baseCss) {
        parts.push(`\n/* ==================== Base Styles ==================== */\n${baseCss}`);
    }

    if (themesCss) {
        parts.push(`\n/* ==================== Design Tokens ==================== */\n${themesCss}`);
    }

    if (componentsCss) {
        parts.push(`\n/* ==================== Components ==================== */\n${componentsCss}`);
    }

    return parts.join('\n');
}

export default {
    generateBundles
};
