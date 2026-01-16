// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Full Pages building utilities
 * Handles processing HTML-first full page examples with optional SCSS
 */
import chalk from 'chalk';
import fg from 'fast-glob';
import path from 'path';
import {
    readFileSync,
    writeFileSync,
    writeJsonSync,
    existsSync,
    ensureDir,
    ensureFileDir
} from '../fs.js';
import { extractHtmlAnnotations } from '../annotations.js';
import { compileScss } from '../scss/compiler.js';
import { getTemplatePath } from '../pathResolver.js';
import { compileTemplateFromPath } from '../templates/handlebars.js';
import { loadConfig, getClassPrefix, getTokenPrefix, transformCssPrefix, transformCssVariableReferences, transformCssVariableDeclarations, DEFAULT_CLASS_PREFIX } from '../config/loader.js';
import { BuildError, HINTS } from '../errors.js';

/**
 * Group pages by their group property
 * @param {Array} pages - Array of page objects
 * @param {string[]} [groupOrder=[]] - Preferred group order
 * @returns {object} Pages grouped by group name
 */
export const groupByGroup = (pages, groupOrder = []) => {
    const grouped = pages.reduce((acc, page) => {
        const group = page.group || 'Uncategorized';
        (acc[group] = acc[group] || []).push(page);
        return acc;
    }, {});

    const orderedGroups = {};

    // Add ordered groups first
    groupOrder.forEach(group => {
        if (grouped[group]) {
            orderedGroups[group] = grouped[group];
            delete grouped[group];
        }
    });

    // Add remaining groups
    for (const group in grouped) {
        orderedGroups[group] = grouped[group];
    }

    return orderedGroups;
};

/**
 * Process a single page HTML file and optional SCSS
 * @param {string} htmlFilePath - Path to the HTML file
 * @param {string} sourceDir - Source directory root
 * @param {string} outputDir - Output directory root
 * @returns {Promise<object|null>} Page data object or null if no valid annotations
 */
export const processPageFile = async (htmlFilePath, sourceDir, outputDir) => {
    try {
        const htmlContent = readFileSync(htmlFilePath);
        const { html, annotation } = extractHtmlAnnotations(htmlContent, htmlFilePath);

        // Skip files without valid annotations
        if (!annotation || !annotation.title) {
            console.log(chalk.yellow(`Skipping ${htmlFilePath}: no title annotation found`));
            return null;
        }

        const pageName = path.basename(path.dirname(htmlFilePath));
        const relativePath = path.relative(sourceDir, path.dirname(htmlFilePath));

        // Check for optional SCSS file
        const scssFilePath = htmlFilePath.replace(/\.html$/, '.scss');
        let css = null;

        if (existsSync(scssFilePath)) {
            try {
                let compiledCss = await compileScss(scssFilePath);

                // Transform CSS class prefix if configured
                const config = loadConfig();
                const targetPrefix = getClassPrefix(config);
                if (targetPrefix && targetPrefix !== DEFAULT_CLASS_PREFIX) {
                    compiledCss = transformCssPrefix(compiledCss, targetPrefix);
                }

                // Transform CSS variable declarations and references
                const tokenPrefix = getTokenPrefix(config);
                if (tokenPrefix) {
                    compiledCss = transformCssVariableDeclarations(compiledCss, tokenPrefix);
                    compiledCss = transformCssVariableReferences(compiledCss, tokenPrefix);
                }

                css = compiledCss;

                // Write CSS file to output
                const cssOutputPath = path.join(outputDir, 'pages', pageName, `${pageName}.css`);
                ensureFileDir(cssOutputPath);
                writeFileSync(cssOutputPath, css);

                console.log(chalk.green(`Compiled page SCSS:`), cssOutputPath);
            } catch (error) {
                console.warn(chalk.yellow(`Warning: Failed to compile SCSS for page ${pageName}: ${error.message}`));
            }
        }

        // Transform HTML class prefixes if configured
        let transformedHtml = html;
        const config = loadConfig();
        const targetPrefix = getClassPrefix(config);
        if (targetPrefix && targetPrefix !== DEFAULT_CLASS_PREFIX) {
            // Replace all ds- prefix occurrences with target prefix in HTML class attributes
            // This handles multiple classes like class="ds-btn ds-btn--primary"
            transformedHtml = html.replace(
                /class="([^"]*)"/g,
                (match, classes) => {
                    const transformed = classes.replace(
                        new RegExp(`\\b${DEFAULT_CLASS_PREFIX}`, 'g'),
                        targetPrefix
                    );
                    return `class="${transformed}"`;
                }
            );
        }

        // Build page data object
        const pageData = {
            name: pageName,
            type: annotation.type || 'page',
            title: annotation.title,
            description: annotation.description || '',
            group: annotation.group || 'Uncategorized',
            order: annotation.order ? parseInt(annotation.order, 10) : Infinity,
            dependencies: annotation.dependencies || [],
            blocks: annotation.blocks || [], // Blocks used in this page
            variations: annotation.variations || [],
            html: transformedHtml,
            css: css,
            path: `pages/${pageName}`
        };

        // Write page JSON file
        const jsonOutputPath = path.join(outputDir, 'pages', pageName, `${pageName}.json`);
        ensureFileDir(jsonOutputPath);
        writeJsonSync(jsonOutputPath, pageData);

        console.log(chalk.green(`Processed Full Page:`), pageName);

        return pageData;
    } catch (error) {
        if (error instanceof BuildError) {
            throw error;
        }
        throw new BuildError(
            `Failed to process Full Page`,
            {
                file: htmlFilePath,
                phase: 'page-process',
                hint: 'Ensure the HTML file has valid front-matter annotations',
                originalError: error
            }
        );
    }
};

/**
 * Build aggregated pages.json from individual page HTML files
 * @param {string} sourceDir - Source directory containing pages/
 * @param {string} outputDir - Output directory
 * @param {object} [pagesConfig] - Pages configuration
 * @returns {Promise<Array>} Sorted array of page data
 */
export const buildPagesData = async (sourceDir, outputDir, pagesConfig = {}) => {
    const pagesSource = pagesConfig.source || 'pages';
    const pagesDir = path.join(sourceDir, pagesSource);

    // Check if pages directory exists
    if (!existsSync(pagesDir)) {
        console.log(chalk.gray(`No pages directory found at ${pagesDir}`));
        return [];
    }

    let htmlFiles = [];
    try {
        htmlFiles = await fg([`${pagesDir}/**/*.html`]);
    } catch (err) {
        throw new BuildError(
            `Failed to scan for page HTML files`,
            {
                file: pagesDir,
                phase: 'page-scan',
                hint: 'Ensure the pages directory exists and is accessible',
                originalError: err
            }
        );
    }

    if (htmlFiles.length === 0) {
        console.log(chalk.gray(`No HTML files found in ${pagesDir}`));
        return [];
    }

    const pages = [];
    for (const htmlFile of htmlFiles) {
        const pageData = await processPageFile(htmlFile, sourceDir, outputDir);
        if (pageData) {
            pages.push(pageData);
        }
    }

    // Sort by order property
    const sortedPages = pages.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : Infinity;
        const orderB = b.order !== undefined ? b.order : Infinity;
        return orderA - orderB;
    });

    // Write aggregated pages.json
    const outputFilePath = path.join(outputDir, 'pages.json');
    writeJsonSync(outputFilePath, sortedPages);

    console.log(chalk.green(`Built ${sortedPages.length} Full Pages`));

    return sortedPages;
};

/**
 * Load pages.json from output directory
 * @param {string} outputDir - Directory containing pages.json
 * @returns {Array} Parsed pages array or empty array if not found
 */
export const loadPagesJson = (outputDir) => {
    const pagesFilePath = path.join(outputDir, 'pages.json');
    if (!existsSync(pagesFilePath)) {
        return [];
    }
    try {
        const content = readFileSync(pagesFilePath);
        return JSON.parse(content);
    } catch (error) {
        console.warn(chalk.yellow(`Warning: Could not load pages.json: ${error.message}`));
        return [];
    }
};

/**
 * Render a single full page documentation page
 * @param {object} page - Page data
 * @param {object} context - Template context
 * @param {string} outputDir - Output directory
 */
export const renderFullPage = (page, context, outputDir) => {
    const templatePath = getTemplatePath('fullpage.hbs');
    const template = compileTemplateFromPath(templatePath);

    const htmlOutput = template({
        ...context,
        currentPath: page.path,
        page: page
    });

    const outputFilePath = path.join(outputDir, `${page.path}.html`);
    ensureDir(path.dirname(outputFilePath));

    writeFileSync(outputFilePath, htmlOutput);
};

/**
 * Get blocks that are used by a specific page
 * @param {object} page - Page data with blocks array
 * @param {Array} blocks - All blocks array
 * @returns {Array} Array of block objects used by this page
 */
export const getPageBlocks = (page, blocks) => {
    if (!page.blocks || page.blocks.length === 0) {
        return [];
    }

    return blocks.filter(block =>
        page.blocks.includes(block.name)
    );
};

/**
 * Get components that are used by a specific page (dependencies)
 * @param {object} page - Page data with dependencies array
 * @param {Array} components - All components array
 * @returns {Array} Array of component objects used by this page
 */
export const getPageDependencies = (page, components) => {
    if (!page.dependencies || page.dependencies.length === 0) {
        return [];
    }

    return components.filter(component =>
        page.dependencies.includes(component.name)
    );
};

export default {
    groupByGroup,
    processPageFile,
    buildPagesData,
    loadPagesJson,
    renderFullPage,
    getPageBlocks,
    getPageDependencies
};
