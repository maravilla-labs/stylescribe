// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Component building utilities
 * Handles aggregation of component JSON files and grouping
 */
import chalk from 'chalk';
import fg from 'fast-glob';
import path from 'path';
import {
    readFileSync,
    writeFileSync,
    readJsonSync,
    writeJsonSync,
    existsSync,
    ensureDir,
    copyFileSync
} from '../fs.js';
import { getTemplatePath } from '../pathResolver.js';
import { compileTemplateFromPath } from '../templates/handlebars.js';
import { BuildError, HINTS } from '../errors.js';

/**
 * JSON reviver that converts escaped newlines to actual newlines
 * @param {string} key - JSON key
 * @param {*} value - JSON value
 * @returns {*} Processed value
 */
export const newlineReviver = (key, value) => {
    if (typeof value === 'string') {
        return value.replace(/\\n/g, '\n');
    }
    return value;
};

/**
 * Group components by their group property
 * @param {Array} components - Array of component objects
 * @param {string[]} [groupOrder=[]] - Preferred group order
 * @returns {object} Components grouped by group name
 */
export const groupByGroup = (components, groupOrder = []) => {
    const grouped = components.reduce((acc, component) => {
        (acc[component.group] = acc[component.group] || []).push(component);
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
 * Build aggregated components.json from individual component JSON files
 * @param {string} sourceDir - Source directory (unused, kept for compatibility)
 * @param {string} outputDir - Output directory containing component JSONs
 * @returns {Promise<Array>} Sorted array of component data
 */
export const buildComponentsData = async (sourceDir, outputDir) => {
    let output = [];
    let components = [];

    try {
        components = await fg([`${outputDir}/components/**/*.json`]);
    } catch (err) {
        throw new BuildError(
            `Failed to scan for component JSON files`,
            {
                file: outputDir,
                phase: 'component-aggregate',
                hint: 'Ensure the output directory exists and contains compiled component JSON files',
                originalError: err
            }
        );
    }

    for (const filePath of components) {
        try {
            const fileContent = readFileSync(filePath);
            const parentDir = path.dirname(filePath);
            const relativePath = path.relative(outputDir, parentDir);
            const name = path.basename(parentDir);

            output.push({
                name,
                ...JSON.parse(fileContent),
                path: relativePath,
            });
        } catch (error) {
            throw new BuildError(
                `Failed to read component JSON`,
                {
                    file: filePath,
                    component: path.basename(path.dirname(filePath)),
                    phase: 'component-aggregate',
                    hint: HINTS.INVALID_JSON,
                    originalError: error
                }
            );
        }
    }

    // Sort by order property
    const sortedOutput = output.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : Infinity;
        const orderB = b.order !== undefined ? b.order : Infinity;
        return orderA - orderB;
    });

    const outputFilePath = path.join(outputDir, "components.json");
    writeJsonSync(outputFilePath, sortedOutput);

    return sortedOutput;
};

/**
 * Load components.json and parse with newline reviver
 * @param {string} outputDir - Directory containing components.json
 * @returns {Array} Parsed components array
 */
export const loadComponentsJson = (outputDir) => {
    const componentsFilePath = path.join(outputDir, 'components.json');
    return readJsonSync(componentsFilePath, newlineReviver);
};

/**
 * Build navigation object from components and pages
 * @param {Array} components - Array of component objects
 * @param {object} groups - Grouped components
 * @param {Array} pages - Array of page navigation objects
 * @returns {object} Navigation object
 */
export const buildNavigation = (components, groups, pages) => {
    return {
        components: components.map(c => ({ name: c.name, title: c.title })),
        groups: groups,
        pages: pages
    };
};

/**
 * Render a single component page
 * @param {object} component - Component data
 * @param {object} context - Template context
 * @param {string} outputDir - Output directory
 */
export const renderComponentPage = (component, context, outputDir) => {
    const templatePath = getTemplatePath('component.hbs');
    const template = compileTemplateFromPath(templatePath);

    const htmlOutput = template({
        ...context,
        currentPath: component.path,
        page: component
    });

    const outputFilePath = path.join(outputDir, `${component.path}.html`);
    ensureDir(path.dirname(outputFilePath));

    writeFileSync(outputFilePath, htmlOutput);
};

/**
 * Copy component CSS to output directory
 * @param {object} component - Component data
 * @param {string} sourceDir - Source directory
 * @param {string} outputDir - Output directory
 */
export const copyComponentCss = (component, sourceDir, outputDir) => {
    const componentCssSource = path.join(
        sourceDir,
        component.path,
        `${path.basename(component.path)}.css`
    );

    if (existsSync(componentCssSource)) {
        const cssOutputPath = path.join(
            outputDir,
            'css',
            'components',
            `${path.basename(component.path)}.css`
        );
        ensureDir(path.dirname(cssOutputPath));
        copyFileSync(componentCssSource, cssOutputPath);
    }
};

/**
 * Calculate adjusted CSS includes for a component
 * @param {Array} headIncludes - Base CSS includes
 * @param {object} component - Component data
 * @param {string} outputDir - Output directory
 * @returns {Array} Adjusted CSS paths
 */
export const calculateCssIncludes = (headIncludes, component, outputDir) => {
    const componentDir = path.dirname(
        path.join(outputDir, `${component.path}.html`)
    );

    // Helper to adjust a local path relative to the component directory
    const adjustPath = (cssPath) => {
        // Skip external URLs
        if (cssPath.startsWith('http://') || cssPath.startsWith('https://')) {
            return cssPath;
        }
        // Handle paths with ./ prefix
        const normalizedPath = cssPath.startsWith('./') ? cssPath.substring(2) : cssPath;
        return path.relative(componentDir, path.join(outputDir, normalizedPath));
    };

    const adjustedCssIncludes = (headIncludes || []).map(adjustPath);

    const dependencyCssPaths = (component.dependencies || []).map(dep => {
        return adjustPath(`./css/components/${dep}.css`);
    });

    const componentCssRelativePath = adjustPath(`./css/components/${path.basename(component.path)}.css`);

    return [
        ...adjustedCssIncludes,
        ...dependencyCssPaths,
        componentCssRelativePath
    ];
};

export default {
    newlineReviver,
    groupByGroup,
    buildComponentsData,
    loadComponentsJson,
    buildNavigation,
    renderComponentPage,
    copyComponentCss,
    calculateCssIncludes
};
