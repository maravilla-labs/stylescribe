// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Load component/block/page data for screenshot generation
 */
import path from 'path';
import { existsSync, readFileSync, readdirSync, statSync } from '../fs.js';
import frontMatter from 'front-matter';

/**
 * Load components data from the built site
 * @param {string} outputDir - Path to built site directory
 * @returns {Array} Array of component objects
 */
export async function loadComponentsJson(outputDir) {
    const componentsFile = path.join(outputDir, 'components.json');

    if (!existsSync(componentsFile)) {
        console.warn('components.json not found. Run `stylescribe docs` first.');
        return [];
    }

    try {
        const content = readFileSync(componentsFile);
        return JSON.parse(content);
    } catch (error) {
        console.warn('Failed to load components.json:', error.message);
        return [];
    }
}

/**
 * Load blocks data from the built site
 * @param {string} outputDir - Path to built site directory
 * @returns {Array} Array of block objects
 */
export async function loadBlocksJson(outputDir) {
    const blocksFile = path.join(outputDir, 'blocks.json');

    if (!existsSync(blocksFile)) {
        // Blocks are optional
        return [];
    }

    try {
        const content = readFileSync(blocksFile);
        return JSON.parse(content);
    } catch (error) {
        console.warn('Failed to load blocks.json:', error.message);
        return [];
    }
}

/**
 * Load pages data from the built site
 * @param {string} outputDir - Path to built site directory
 * @returns {Array} Array of page objects
 */
export async function loadPagesJson(outputDir) {
    const pagesFile = path.join(outputDir, 'pages.json');

    if (!existsSync(pagesFile)) {
        // Pages are optional
        return [];
    }

    try {
        const content = readFileSync(pagesFile);
        return JSON.parse(content);
    } catch (error) {
        console.warn('Failed to load pages.json:', error.message);
        return [];
    }
}

/**
 * Recursively collect all markdown docs for screenshot generation
 * @param {string} docsDir - Path to docs directory
 * @param {string} [relativePath=''] - Current relative path for recursion
 * @returns {Array} Array of doc page objects
 */
function collectDocsRecursive(docsDir, relativePath = '') {
    const pages = [];
    const currentDir = relativePath ? path.join(docsDir, relativePath) : docsDir;

    if (!existsSync(currentDir)) {
        return pages;
    }

    const entries = readdirSync(currentDir);

    for (const entry of entries) {
        if (entry.startsWith('.') || entry.startsWith('_')) {
            continue;
        }

        const fullPath = path.join(currentDir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            const newRelativePath = relativePath ? `${relativePath}/${entry}` : entry;
            pages.push(...collectDocsRecursive(docsDir, newRelativePath));
        } else if (entry.endsWith('.md')) {
            try {
                const content = readFileSync(fullPath);
                const parsed = frontMatter(content);

                if (parsed.attributes.hidden === true) {
                    continue;
                }

                const basename = path.basename(entry, '.md');
                let name, slug;

                if (basename === 'index') {
                    // index.md in a folder: name uses dashes, slug includes /index
                    name = relativePath ? relativePath.replace(/\//g, '-') : 'index';
                    slug = relativePath ? `${relativePath}/index` : 'index';
                } else {
                    // Regular file
                    name = relativePath ? `${relativePath}-${basename}`.replace(/\//g, '-') : basename;
                    slug = relativePath ? `${relativePath}/${basename}` : basename;
                }

                pages.push({
                    name,
                    title: parsed.attributes.navtitle || parsed.attributes.title || basename,
                    description: parsed.attributes.description || '',
                    slug
                });
            } catch (error) {
                // Skip files that can't be parsed
            }
        }
    }

    return pages;
}

/**
 * Load docs pages for screenshot generation
 * @param {string} projectRoot - Project root directory (where docs/ folder is)
 * @returns {Array} Array of doc page objects
 */
export async function loadDocsPages(projectRoot) {
    const docsDir = path.join(projectRoot, 'docs');

    if (!existsSync(docsDir)) {
        return [];
    }

    return collectDocsRecursive(docsDir);
}

export default {
    loadComponentsJson,
    loadBlocksJson,
    loadPagesJson,
    loadDocsPages
};
