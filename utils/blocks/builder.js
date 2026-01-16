// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * UI Blocks building utilities
 * Handles processing HTML-first UI Blocks with optional SCSS
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
 * Group blocks by their group property
 * @param {Array} blocks - Array of block objects
 * @param {string[]} [groupOrder=[]] - Preferred group order
 * @returns {object} Blocks grouped by group name
 */
export const groupByGroup = (blocks, groupOrder = []) => {
    const grouped = blocks.reduce((acc, block) => {
        const group = block.group || 'Uncategorized';
        (acc[group] = acc[group] || []).push(block);
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
 * Process a single block HTML file and optional SCSS
 * @param {string} htmlFilePath - Path to the HTML file
 * @param {string} sourceDir - Source directory root
 * @param {string} outputDir - Output directory root
 * @returns {Promise<object|null>} Block data object or null if no valid annotations
 */
export const processBlockFile = async (htmlFilePath, sourceDir, outputDir) => {
    try {
        const htmlContent = readFileSync(htmlFilePath);
        const { html, annotation } = extractHtmlAnnotations(htmlContent, htmlFilePath);

        // Skip files without valid annotations
        if (!annotation || !annotation.title) {
            console.log(chalk.yellow(`Skipping ${htmlFilePath}: no title annotation found`));
            return null;
        }

        const blockName = path.basename(path.dirname(htmlFilePath));
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
                const cssOutputPath = path.join(outputDir, 'blocks', blockName, `${blockName}.css`);
                ensureFileDir(cssOutputPath);
                writeFileSync(cssOutputPath, css);

                console.log(chalk.green(`Compiled block SCSS:`), cssOutputPath);
            } catch (error) {
                console.warn(chalk.yellow(`Warning: Failed to compile SCSS for block ${blockName}: ${error.message}`));
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

        // Build block data object
        const blockData = {
            name: blockName,
            type: annotation.type || 'block',
            title: annotation.title,
            description: annotation.description || '',
            group: annotation.group || 'Uncategorized',
            order: annotation.order ? parseInt(annotation.order, 10) : Infinity,
            dependencies: annotation.dependencies || [],
            variations: annotation.variations || [],
            html: transformedHtml,
            css: css,
            path: `blocks/${blockName}`
        };

        // Write block JSON file
        const jsonOutputPath = path.join(outputDir, 'blocks', blockName, `${blockName}.json`);
        ensureFileDir(jsonOutputPath);
        writeJsonSync(jsonOutputPath, blockData);

        console.log(chalk.green(`Processed UI Block:`), blockName);

        return blockData;
    } catch (error) {
        if (error instanceof BuildError) {
            throw error;
        }
        throw new BuildError(
            `Failed to process UI Block`,
            {
                file: htmlFilePath,
                phase: 'block-process',
                hint: 'Ensure the HTML file has valid front-matter annotations',
                originalError: error
            }
        );
    }
};

/**
 * Build aggregated blocks.json from individual block HTML files
 * @param {string} sourceDir - Source directory containing blocks/
 * @param {string} outputDir - Output directory
 * @param {object} [blocksConfig] - Blocks configuration
 * @returns {Promise<Array>} Sorted array of block data
 */
export const buildBlocksData = async (sourceDir, outputDir, blocksConfig = {}) => {
    const blocksSource = blocksConfig.source || 'blocks';
    const blocksDir = path.join(sourceDir, blocksSource);

    // Check if blocks directory exists
    if (!existsSync(blocksDir)) {
        console.log(chalk.gray(`No blocks directory found at ${blocksDir}`));
        return [];
    }

    let htmlFiles = [];
    try {
        htmlFiles = await fg([`${blocksDir}/**/*.html`]);
    } catch (err) {
        throw new BuildError(
            `Failed to scan for block HTML files`,
            {
                file: blocksDir,
                phase: 'block-scan',
                hint: 'Ensure the blocks directory exists and is accessible',
                originalError: err
            }
        );
    }

    if (htmlFiles.length === 0) {
        console.log(chalk.gray(`No HTML files found in ${blocksDir}`));
        return [];
    }

    const blocks = [];
    for (const htmlFile of htmlFiles) {
        const blockData = await processBlockFile(htmlFile, sourceDir, outputDir);
        if (blockData) {
            blocks.push(blockData);
        }
    }

    // Sort by order property
    const sortedBlocks = blocks.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : Infinity;
        const orderB = b.order !== undefined ? b.order : Infinity;
        return orderA - orderB;
    });

    // Write aggregated blocks.json
    const outputFilePath = path.join(outputDir, 'blocks.json');
    writeJsonSync(outputFilePath, sortedBlocks);

    console.log(chalk.green(`Built ${sortedBlocks.length} UI Blocks`));

    return sortedBlocks;
};

/**
 * Load blocks.json from output directory
 * @param {string} outputDir - Directory containing blocks.json
 * @returns {Array} Parsed blocks array or empty array if not found
 */
export const loadBlocksJson = (outputDir) => {
    const blocksFilePath = path.join(outputDir, 'blocks.json');
    if (!existsSync(blocksFilePath)) {
        return [];
    }
    try {
        const content = readFileSync(blocksFilePath);
        return JSON.parse(content);
    } catch (error) {
        console.warn(chalk.yellow(`Warning: Could not load blocks.json: ${error.message}`));
        return [];
    }
};

/**
 * Render a single block documentation page
 * @param {object} block - Block data
 * @param {object} context - Template context
 * @param {string} outputDir - Output directory
 */
export const renderBlockPage = (block, context, outputDir) => {
    const templatePath = getTemplatePath('block.hbs');
    const template = compileTemplateFromPath(templatePath);

    const htmlOutput = template({
        ...context,
        currentPath: block.path,
        page: block
    });

    const outputFilePath = path.join(outputDir, `${block.path}.html`);
    ensureDir(path.dirname(outputFilePath));

    writeFileSync(outputFilePath, htmlOutput);
};

/**
 * Get components that are used by a specific block (dependencies)
 * @param {object} block - Block data with dependencies array
 * @param {Array} components - All components array
 * @returns {Array} Array of component objects used by this block
 */
export const getBlockDependencies = (block, components) => {
    if (!block.dependencies || block.dependencies.length === 0) {
        return [];
    }

    return components.filter(component =>
        block.dependencies.includes(component.name)
    );
};

/**
 * Get blocks that use a specific component (reverse dependencies)
 * @param {object} component - Component data
 * @param {Array} blocks - All blocks array
 * @returns {Array} Array of block objects that use this component
 */
export const getComponentUsedInBlocks = (component, blocks) => {
    return blocks.filter(block =>
        block.dependencies && block.dependencies.includes(component.name)
    );
};

export default {
    groupByGroup,
    processBlockFile,
    buildBlocksData,
    loadBlocksJson,
    renderBlockPage,
    getBlockDependencies,
    getComponentUsedInBlocks
};
