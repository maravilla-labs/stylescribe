// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Navigation builder utilities
 * Builds navigation tree from docs folder structure
 */
import path from 'path';
import frontMatter from 'front-matter';
import { existsSync, readFileSync, readdirSync, statSync } from '../fs.js';

const MAX_DEPTH = 5;

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert folder name to readable label
 * @param {string} folderName - Folder name (e.g., 'getting-started')
 * @returns {string} Readable label (e.g., 'Getting Started')
 */
const folderNameToLabel = (folderName) => {
    return folderName
        .split('-')
        .map(capitalizeFirst)
        .join(' ');
};

/**
 * Parse frontmatter from a markdown file
 * @param {string} filePath - Path to markdown file
 * @returns {object} Parsed frontmatter attributes and body
 */
const parseMarkdownFile = (filePath) => {
    try {
        const content = readFileSync(filePath);
        return frontMatter(content);
    } catch (error) {
        console.warn(`Warning: Could not parse ${filePath}: ${error.message}`);
        return { attributes: {}, body: '' };
    }
};

/**
 * Build navigation tree from docs folder structure
 * @param {string} docsDir - Path to docs directory
 * @param {string} [relativePath=''] - Current relative path for recursion
 * @param {number} [depth=0] - Current recursion depth
 * @returns {Array} Array of navigation items
 */
export const buildNavigationFromDocs = (docsDir, relativePath = '', depth = 0) => {
    if (depth > MAX_DEPTH) {
        console.warn(`Navigation depth limit reached at: ${relativePath}`);
        return [];
    }

    const currentDir = relativePath ? path.join(docsDir, relativePath) : docsDir;
    const items = [];

    if (!existsSync(currentDir)) {
        return items;
    }

    const entries = readdirSync(currentDir);
    const files = [];
    const folders = [];

    // Separate files and folders, skip hidden entries
    for (const entry of entries) {
        // Skip hidden files/folders
        if (entry.startsWith('.') || entry.startsWith('_')) {
            continue;
        }

        const fullPath = path.join(currentDir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            folders.push(entry);
        } else if (entry.endsWith('.md')) {
            files.push(entry);
        }
    }

    // Process markdown files
    for (const file of files) {
        const filePath = path.join(currentDir, file);
        const parsed = parseMarkdownFile(filePath);
        const basename = path.basename(file, '.md');

        // Skip hidden pages
        if (parsed.attributes.hidden === true) {
            continue;
        }

        // Handle index.md specially - it becomes the home link at root level
        if (basename === 'index') {
            if (relativePath === '') {
                // Root index.md becomes Home link
                items.push({
                    id: 'home',
                    label: parsed.attributes.navtitle || parsed.attributes.title || 'Home',
                    type: 'link',
                    href: 'index.html',
                    order: parsed.attributes.order ?? 0
                });
            }
            // Skip index.md in subfolders - it's used for folder metadata
            continue;
        }

        const href = relativePath
            ? `${relativePath}/${basename}.html`
            : `${basename}.html`;

        // Check for special types: components, blocks, pages
        // If they have content (not just frontmatter), link to index page
        // If no content, show mega-menu dropdown
        const hasContent = parsed.body && parsed.body.trim().length > 0;

        if (parsed.attributes.type === 'components') {
            items.push({
                id: 'components',  // ID for nav highlighting
                label: parsed.attributes.navtitle || parsed.attributes.title || 'Components',
                type: hasContent ? 'link' : 'components',
                href: hasContent ? '/components/' : undefined,
                absolute: hasContent,
                order: parsed.attributes.order ?? 999
            });
        } else if (parsed.attributes.type === 'blocks') {
            items.push({
                id: 'blocks',  // ID for nav highlighting
                label: parsed.attributes.navtitle || parsed.attributes.title || 'UI Blocks',
                type: hasContent ? 'link' : 'blocks',
                href: hasContent ? '/blocks/' : undefined,
                absolute: hasContent,
                order: parsed.attributes.order ?? 999
            });
        } else if (parsed.attributes.type === 'pages') {
            items.push({
                id: 'pages',  // ID for nav highlighting
                label: parsed.attributes.navtitle || parsed.attributes.title || 'Pages',
                type: hasContent ? 'link' : 'pages',
                href: hasContent ? '/pages/' : undefined,
                absolute: hasContent,
                order: parsed.attributes.order ?? 999
            });
        } else {
            items.push({
                id: basename,  // Use file basename as ID for nav highlighting
                label: parsed.attributes.navtitle || parsed.attributes.title || folderNameToLabel(basename),
                type: 'link',
                href: href,
                order: parsed.attributes.order ?? 999
            });
        }
    }

    // Process folders
    for (const folder of folders) {
        const folderPath = path.join(currentDir, folder);
        const indexPath = path.join(folderPath, 'index.md');
        const newRelativePath = relativePath ? `${relativePath}/${folder}` : folder;

        let folderMeta = {
            label: folderNameToLabel(folder),
            order: 999,
            href: null,
            hasIndex: false
        };

        // Read index.md for folder metadata
        if (existsSync(indexPath)) {
            const parsed = parseMarkdownFile(indexPath);

            // Skip hidden folders
            if (parsed.attributes.hidden === true) {
                continue;
            }

            folderMeta = {
                label: parsed.attributes.navtitle || parsed.attributes.title || folderNameToLabel(folder),
                order: parsed.attributes.order ?? 999,
                href: `${newRelativePath}/index.html`,
                hasIndex: true
            };
        }

        // If folder has index.md, create a direct link to it (no dropdown)
        if (folderMeta.hasIndex) {
            items.push({
                id: folder,  // Use folder name as id for nav highlighting
                label: folderMeta.label,
                type: 'link',
                href: folderMeta.href,
                order: folderMeta.order
            });
        } else {
            // Recurse for children only if no index.md
            const children = buildNavigationFromDocs(docsDir, newRelativePath, depth + 1);

            // Only create dropdown if there are children
            if (children.length > 0) {
                items.push({
                    id: folder,  // Use folder name as id for nav highlighting
                    label: folderMeta.label,
                    type: 'dropdown',
                    href: folderMeta.href,
                    order: folderMeta.order,
                    children: children
                });
            }
        }
    }

    // Sort by order
    items.sort((a, b) => a.order - b.order);

    return items;
};

/**
 * Build complete navigation object for templates
 * @param {string} docsDir - Path to docs directory
 * @param {object} [groups={}] - Component groups for mega-menu
 * @returns {object} Navigation object with topNav and groups
 */
export const buildNavigation = (docsDir, groups = {}) => {
    const topNav = buildNavigationFromDocs(docsDir);

    return {
        topNav,
        groups
    };
};

/**
 * Derive activeNav ID from a page path
 * Follows the same logic used to build navigation items
 * @param {string} pagePath - Page path (e.g., 'components/button', 'blocks/hero', 'documentation/getting-started')
 * @returns {string|null} The nav item ID that should be active
 */
export const deriveActiveNav = (pagePath) => {
    if (!pagePath) return null;

    // Get the first segment of the path (e.g., 'components' from 'components/button')
    const firstSegment = pagePath.split('/')[0];

    // Handle special index paths
    if (pagePath === 'index' || pagePath === 'index.html') {
        return 'home';
    }

    // Return the first segment as the nav ID
    // This matches how nav items get their IDs:
    // - 'components', 'blocks', 'pages' for special types
    // - folder name for folders with index.md
    // - file basename for standalone markdown files
    return firstSegment || null;
};

export default {
    buildNavigationFromDocs,
    buildNavigation,
    deriveActiveNav
};
