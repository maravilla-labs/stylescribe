// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Sidebar navigation builder utilities
 * Builds recursive tree structure for nested folder navigation
 */
import path from 'path';
import frontMatter from 'front-matter';
import { existsSync, readFileSync, readdirSync, statSync } from '../fs.js';

const MAX_DEPTH = 10;

/**
 * Convert folder/file name to readable label
 * @param {string} name - Name (e.g., 'getting-started')
 * @returns {string} Readable label (e.g., 'Getting Started')
 */
const nameToLabel = (name) => {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Parse frontmatter from a markdown file
 * @param {string} filePath - Path to markdown file
 * @returns {object} Parsed frontmatter attributes
 */
const parseMarkdownFile = (filePath) => {
    try {
        const content = readFileSync(filePath);
        return frontMatter(content);
    } catch (error) {
        return { attributes: {}, body: '' };
    }
};

/**
 * Check if a tree node or its descendants contain the active page
 * Used for auto-expanding parent folders
 * @param {object} node - Tree node to check
 * @returns {boolean} True if node or descendants contain active page
 */
export const containsActivePage = (node) => {
    if (node.isActive) {
        return true;
    }
    if (node.children && node.children.length > 0) {
        return node.children.some(child => containsActivePage(child));
    }
    return false;
};

/**
 * Calculate the relative href from a page in the tree to its sidebar root
 * @param {string} itemPath - Path of the item (e.g., 'documentation/tutorials/quick-start')
 * @param {string} rootFolder - Root folder of sidebar (e.g., 'documentation')
 * @returns {string} Relative path from root folder (e.g., 'tutorials/quick-start.html')
 */
const getRelativeHref = (itemPath, rootFolder) => {
    // Remove the root folder prefix to get relative path within the tree
    const relativePath = itemPath.startsWith(rootFolder + '/')
        ? itemPath.slice(rootFolder.length + 1)
        : itemPath;
    return `${relativePath}.html`;
};

/**
 * Recursively build sidebar tree from a folder
 * @param {string} docsDir - Root docs directory path
 * @param {string} folderPath - Current folder path relative to docsDir
 * @param {string} currentPagePath - Current page's path for active highlighting (e.g., 'documentation/getting-started.html')
 * @param {string} rootFolder - The root folder of the sidebar tree (e.g., 'documentation')
 * @param {number} depth - Current recursion depth
 * @returns {object|null} Sidebar tree node or null
 */
const buildTreeRecursive = (docsDir, folderPath, currentPagePath, rootFolder, depth = 0) => {
    if (depth > MAX_DEPTH) {
        return null;
    }

    const fullPath = path.join(docsDir, folderPath);
    if (!existsSync(fullPath) || !statSync(fullPath).isDirectory()) {
        return null;
    }

    const folderName = path.basename(folderPath);
    const indexPath = path.join(fullPath, 'index.md');
    const hasIndex = existsSync(indexPath);

    // Get folder metadata from index.md or defaults
    let folderMeta = {
        label: nameToLabel(folderName),
        order: 999,
        hidden: false
    };

    if (hasIndex) {
        const parsed = parseMarkdownFile(indexPath);
        if (parsed.attributes.hidden === true) {
            return null;
        }
        folderMeta = {
            label: parsed.attributes.navtitle || parsed.attributes.title || folderMeta.label,
            order: parsed.attributes.order ?? 999,
            hidden: false
        };
    }

    // Build children (files and subfolders)
    const entries = readdirSync(fullPath);
    const children = [];

    // Separate files and folders
    const files = [];
    const folders = [];

    for (const entry of entries) {
        if (entry.startsWith('.') || entry.startsWith('_')) {
            continue;
        }

        const entryPath = path.join(fullPath, entry);
        const stat = statSync(entryPath);

        if (stat.isDirectory()) {
            folders.push(entry);
        } else if (entry.endsWith('.md') && entry !== 'index.md') {
            files.push(entry);
        }
    }

    // Process markdown files (pages)
    for (const file of files) {
        const filePath = path.join(fullPath, file);
        const parsed = parseMarkdownFile(filePath);

        if (parsed.attributes.hidden === true) {
            continue;
        }

        const basename = path.basename(file, '.md');
        const pagePath = folderPath ? `${folderPath}/${basename}` : basename;

        // Generate href relative to the sidebar root
        const pageHref = getRelativeHref(pagePath, rootFolder);

        // Check if this is the active page
        const normalizedCurrentPath = currentPagePath.replace(/\.html$/, '');
        const isActive = pagePath === normalizedCurrentPath;

        children.push({
            type: 'page',
            name: basename,
            label: parsed.attributes.navtitle || parsed.attributes.title || nameToLabel(basename),
            href: pageHref,
            path: pagePath,
            isActive,
            order: parsed.attributes.order ?? 999
        });
    }

    // Process subfolders recursively
    for (const folder of folders) {
        const subFolderPath = folderPath ? `${folderPath}/${folder}` : folder;
        const childNode = buildTreeRecursive(docsDir, subFolderPath, currentPagePath, rootFolder, depth + 1);

        if (childNode) {
            children.push(childNode);
        }
    }

    // Sort children by order then alphabetically
    children.sort((a, b) => {
        if (a.order !== b.order) {
            return a.order - b.order;
        }
        return a.label.localeCompare(b.label);
    });

    // Generate folder href relative to the sidebar root
    let folderHref = null;
    if (hasIndex) {
        const indexPath = `${folderPath}/index`;
        folderHref = getRelativeHref(indexPath, rootFolder);
    }

    // Build the folder node
    const node = {
        type: 'folder',
        name: folderName,
        label: folderMeta.label,
        href: folderHref,
        path: folderPath,
        isActive: false,
        isExpanded: false,
        order: folderMeta.order,
        children
    };

    // Check if folder index is the active page
    if (hasIndex) {
        const normalizedCurrentPath = currentPagePath.replace(/\.html$/, '');
        const indexPagePath = `${folderPath}/index`;
        node.isActive = indexPagePath === normalizedCurrentPath;
    }

    // Auto-expand if this node or descendants contain active page
    node.isExpanded = containsActivePage(node);

    return node;
};

/**
 * Build sidebar tree for documentation pages
 * @param {string} docsDir - Path to docs directory
 * @param {string} rootFolder - Starting folder path relative to docs (e.g., 'documentation')
 * @param {string} currentPagePath - Current page's relative path for active highlighting (e.g., 'documentation/getting-started')
 * @param {string} basePath - Base path for href generation (e.g., '../' or './')
 * @returns {object|null} Sidebar tree structure or null if folder doesn't exist
 */
export const buildSidebarTree = (docsDir, rootFolder, currentPagePath, basePath = './') => {
    const tree = buildTreeRecursive(docsDir, rootFolder, currentPagePath, rootFolder);

    // Add sidebarBasePath to help templates adjust hrefs based on current page depth
    if (tree) {
        // Calculate depth of current page within the root folder
        const currentPathParts = currentPagePath.split('/');
        const rootParts = rootFolder.split('/');
        // Depth from root = total depth - root depth - 1 (for the filename)
        const depthFromRoot = currentPathParts.length - rootParts.length - 1;
        tree.hrefPrefix = '../'.repeat(Math.max(0, depthFromRoot));
    }

    return tree;
};

export default {
    buildSidebarTree,
    containsActivePage
};
