// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Markdown processing utilities
 * Handles markdown file processing with front-matter support
 */
import fg from 'fast-glob';
import frontMatter from 'front-matter';
import MarkdownIt from 'markdown-it';
import path from 'path';
import { existsSync, readFileSync, writeFileSync, readdirSync, ensureDir } from '../fs.js';
import { getTemplatePath } from '../pathResolver.js';
import { compileTemplateFromPath } from '../templates/handlebars.js';
import { loadTokens, loadTokensFromPath } from '../config/loader.js';
import { resolveTokenValue } from '../tokens.js';
import { BuildError, HINTS } from '../errors.js';
import { buildSidebarTree } from '../navigation/sidebar.js';
import { deriveActiveNav } from '../navigation/builder.js';

const md = new MarkdownIt({ html: true });

/**
 * Extract headings from rendered HTML for TOC generation
 * @param {string} html - Rendered HTML content
 * @returns {Array} Array of heading objects with level, text, and slug
 */
export const extractHeadings = (html) => {
    const headingRegex = /<h([23])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h\1>/gi;
    const headings = [];
    let match;

    while ((match = headingRegex.exec(html)) !== null) {
        const level = parseInt(match[1]);
        const existingId = match[2];
        const text = match[3].replace(/<[^>]*>/g, '').trim(); // Strip inner HTML
        const slug = existingId || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        headings.push({ level, text, slug });
    }

    return headings;
};

/**
 * Add IDs to headings that don't have them for anchor linking
 * @param {string} html - Rendered HTML content
 * @returns {string} HTML with heading IDs added
 */
export const addHeadingIds = (html) => {
    const usedSlugs = new Set();

    return html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, content) => {
        if (attrs.includes('id="')) return match; // Already has ID

        const text = content.replace(/<[^>]*>/g, '').trim();
        let slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Ensure unique slugs
        let uniqueSlug = slug;
        let counter = 1;
        while (usedSlugs.has(uniqueSlug)) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }
        usedSlugs.add(uniqueSlug);

        return `<h${level}${attrs} id="${uniqueSlug}">${content}</h${level}>`;
    });
};

/**
 * Determine the appropriate category depth for a token path
 * Some tokens like assets.icons should use subcategories (assets-icons)
 * @param {string} path - Full token path
 * @returns {string} Category to use
 */
const getCategoryFromPath = (path) => {
    const parts = path.split('-');

    // Special handling for assets - use subcategory (e.g., assets-icons)
    if (parts[0] === 'assets' && parts.length > 1) {
        return `${parts[0]}-${parts[1]}`;
    }

    // Default: use first segment
    return parts[0];
};

/**
 * Flatten W3C DTCG tokens for template display
 * @param {object} tokens - Nested token object
 * @param {string} [prefix=''] - Current path prefix
 * @param {Array} [result=[]] - Accumulated results
 * @param {object} [rootTokens=null] - Root tokens for resolving references
 * @returns {Array} Flattened token array
 */
export const flattenTokensForDisplay = (tokens, prefix = '', result = [], rootTokens = null) => {
    // Use rootTokens for resolution, default to tokens on first call
    const resolveRoot = rootTokens || tokens;

    for (const [key, value] of Object.entries(tokens)) {
        if (key.startsWith('$')) continue;

        const currentPath = prefix ? `${prefix}-${key}` : key;

        if (value && typeof value === 'object' && '$value' in value) {
            result.push({
                name: currentPath,
                cssVar: `--${currentPath}`,
                value: resolveTokenValue(value.$value, resolveRoot),
                type: value.$type || 'string',
                description: value.$description || '',
                category: getCategoryFromPath(currentPath)
            });
        } else if (value && typeof value === 'object') {
            flattenTokensForDisplay(value, currentPath, result, resolveRoot);
        }
    }
    return result;
};

/**
 * Determine the appropriate renderer for a category based on category name and token types
 * @param {string} category - Category name
 * @param {Array} tokens - Tokens in this category
 * @returns {string} Renderer name
 */
const getRendererForCategory = (category, tokens) => {
    // Check if all tokens are of a specific type
    const types = new Set(tokens.map(t => t.type));

    // Special renderers for known categories
    // Assets-icons category - icons stored as assets
    if (category === 'assets-icons' || category.startsWith('assets-icons-')) {
        return 'icon';
    }

    // Generic assets category - check if it contains icon/asset types with SVG values
    if (category.startsWith('assets') || (types.size === 1 && (types.has('icon') || types.has('asset')))) {
        const hasIconAssets = tokens.some(t =>
            t.value && typeof t.value === 'string' &&
            (t.value.includes('.svg') || t.value.startsWith('url("data:image/svg'))
        );
        if (hasIconAssets) return 'icon';
    }

    if (category === 'icon' || (types.size === 1 && types.has('icon'))) return 'icon';
    if (category === 'color' || (types.size === 1 && types.has('color'))) return 'color';
    if (category === 'border') return 'border';
    if (category === 'spacing') return 'dimension';
    if (category === 'layout') return 'dimension';
    if (category === 'shadow' || (types.size === 1 && types.has('shadow'))) return 'shadow';
    if (category === 'font') return 'typography';
    if (category === 'animation' || category === 'transition') return 'animation';
    if (category === 'gradient' || (types.size === 1 && types.has('gradient'))) return 'gradient';

    // For mixed types, check what's dominant
    if (types.has('color') && types.size > 1) return 'mixed';
    if (types.has('dimension')) return 'dimension';

    return 'generic';
};

/**
 * Generate a human-readable display name for a category
 * @param {string} category - Category name (e.g., 'assets-icons', 'color')
 * @returns {string} Display name (e.g., 'Icons', 'Color')
 */
const getCategoryDisplayName = (category) => {
    // Special display names for known categories
    const displayNames = {
        'assets-icons': 'Icons',
        'assets-images': 'Images',
        'assets-files': 'Files'
    };

    if (displayNames[category]) {
        return displayNames[category];
    }

    // Default: capitalize and replace dashes with spaces
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
};

/**
 * Group flattened tokens by category for dynamic template rendering
 * @param {Array} flatTokens - Array of flattened tokens
 * @returns {Array} Array of category groups with tokens and renderer info
 */
export const groupTokensByCategory = (flatTokens) => {
    const groups = {};

    flatTokens.forEach(token => {
        const cat = token.category;
        if (!groups[cat]) {
            groups[cat] = {
                name: cat,
                displayName: getCategoryDisplayName(cat),
                tokens: []
            };
        }
        groups[cat].tokens.push(token);
    });

    // Determine renderer for each group
    Object.values(groups).forEach(group => {
        group.renderer = getRendererForCategory(group.name, group.tokens);
    });

    // Sort categories: known ones first in specific order, then alphabetically
    const knownOrder = ['color', 'spacing', 'border', 'font', 'shadow', 'layout', 'animation', 'transition', 'assets-icons'];
    return Object.values(groups).sort((a, b) => {
        const aIdx = knownOrder.indexOf(a.name);
        const bIdx = knownOrder.indexOf(b.name);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return a.name.localeCompare(b.name);
    });
};

/**
 * Collect navigation data from markdown files
 * @param {string[]} markdownFiles - Array of markdown file paths
 * @returns {Array} Array of page navigation objects
 */
export const collectNavigationPages = (markdownFiles) => {
    const pages = [];

    for (const filePath of markdownFiles) {
        const fileContent = readFileSync(filePath);
        const parsedContent = frontMatter(fileContent);
        const basename = path.basename(filePath, '.md');

        // Skip index page from navigation
        if (basename !== 'index') {
            pages.push({
                title: parsedContent.attributes.navtitle || parsedContent.attributes.title || basename,
                slug: parsedContent.attributes.slug || basename,
                order: parsedContent.attributes.order || 999
            });
        }
    }

    // Sort by order
    pages.sort((a, b) => a.order - b.order);
    return pages;
};

/**
 * Build navigation pages from docs directory
 * @param {string} [cwd=process.cwd()] - Working directory
 * @returns {Array} Array of page navigation objects
 */
export const buildNavigationPages = (cwd = process.cwd()) => {
    const docsDir = path.join(cwd, 'docs');

    if (!existsSync(docsDir)) {
        return [];
    }

    const docFiles = readdirSync(docsDir)
        .filter(f => f.endsWith('.md') && f !== 'index.md');

    const pages = [];
    for (const docFile of docFiles) {
        const fileContent = readFileSync(path.join(docsDir, docFile));
        const parsed = frontMatter(fileContent);
        const basename = path.basename(docFile, '.md');

        pages.push({
            title: parsed.attributes.navtitle || parsed.attributes.title || basename,
            slug: parsed.attributes.slug || basename,
            order: parsed.attributes.order || 999
        });
    }

    pages.sort((a, b) => a.order - b.order);
    return pages;
};

/**
 * Process markdown files and render to HTML
 * @param {string} sourceDir - Source directory root
 * @param {string} outputDir - Output directory for HTML files
 * @param {object} [context={}] - Additional template context
 */
export const processMarkdownFiles = async (sourceDir, outputDir, context = {}) => {
    const markdownFiles = await fg([`${sourceDir}/docs/**/*.md`]);

    // Load tokens
    const tokens = loadTokens(sourceDir);

    // Collect navigation pages
    const pages = collectNavigationPages(markdownFiles);

    // Build navigation object - preserve topNav from context if present
    const navigation = {
        ...context.navigation,
        components: (context.components || []).map(c => ({ name: c.name, title: c.title })),
        pages: pages
    };

    // Process each markdown file
    const docsDir = path.join(sourceDir, 'docs');

    for (const filePath of markdownFiles) {
        try {
        const fileContent = readFileSync(filePath);
        const parsedContent = frontMatter(fileContent);
        const rawHtml = md.render(parsedContent.body);
        // Add IDs to headings and extract for TOC
        const htmlContent = addHeadingIds(rawHtml);
        const headings = extractHeadings(htmlContent);

        // Calculate relative path from docs directory to preserve folder structure
        const relativePath = path.relative(docsDir, filePath);
        const relativeDir = path.dirname(relativePath);
        const basename = path.basename(filePath, '.md');

        // Determine output filename and path
        let currentSlug;
        let outputFilename;
        if (parsedContent.attributes.slug) {
            currentSlug = parsedContent.attributes.slug;
            outputFilename = `${currentSlug}.html`;
        } else {
            currentSlug = basename;
            outputFilename = `${basename}.html`;
        }

        // Preserve folder structure in output
        let outputPath;
        if (relativeDir && relativeDir !== '.') {
            outputPath = path.join(outputDir, relativeDir, outputFilename);
            // Ensure the subdirectory exists
            ensureDir(path.join(outputDir, relativeDir));
        } else {
            outputPath = path.join(outputDir, outputFilename);
        }

        // Determine template
        // Only use index.hbs for root index.md, nested folder indices use pages.hbs
        let templatePath;
        if (parsedContent.attributes.template) {
            templatePath = getTemplatePath(`${parsedContent.attributes.template}.hbs`);
        } else if (basename === 'index' && (!relativeDir || relativeDir === '.')) {
            templatePath = getTemplatePath('index.hbs');
        } else {
            templatePath = getTemplatePath('pages.hbs');
        }

        // Load page-specific tokens if specified
        let pageTokens = tokens;
        if (parsedContent.attributes.tokensFile) {
            const customTokens = loadTokensFromPath(parsedContent.attributes.tokensFile, sourceDir);
            if (customTokens) {
                pageTokens = customTokens;
            }
        }

        // Calculate basePath for correct relative links based on nesting depth
        let basePath = context.basePath || './';
        if (relativeDir && relativeDir !== '.') {
            // Add ../ for each level of nesting
            const depth = relativeDir.split(path.sep).length;
            basePath = '../'.repeat(depth);
        }

        // Build folder context for nested pages
        let folderContext = null;
        let siblingPages = [];
        let sidebarTree = null;
        // Breadcrumb hrefs are relative to the output file
        let breadcrumb = [];

        // Check if this is a folder index page
        const isFolderIndex = basename === 'index' && relativeDir && relativeDir !== '.';
        const isNested = relativeDir && relativeDir !== '.';

        if (isNested) {
            // Get folder name and read its index.md for the label
            const folderName = relativeDir.split(path.sep)[0];
            const folderIndexPath = path.join(docsDir, folderName, 'index.md');
            let folderLabel = folderName.charAt(0).toUpperCase() + folderName.slice(1).replace(/-/g, ' ');

            if (existsSync(folderIndexPath)) {
                const folderIndexContent = readFileSync(folderIndexPath);
                const folderParsed = frontMatter(folderIndexContent);
                folderLabel = folderParsed.attributes.navtitle || folderParsed.attributes.title || folderLabel;
            }

            folderContext = {
                name: folderName,
                label: folderLabel,
                href: `${basePath}${folderName}/index.html`
            };

            // For nested pages, use folder as breadcrumb root (not Home)
            // For folder index page, folder IS the current page (no link)
            // For other pages in folder, folder is a link to index.html
            if (isFolderIndex) {
                breadcrumb.push({ label: folderLabel, href: null });
            } else {
                breadcrumb.push({ label: folderLabel, href: 'index.html' });
            }

            // Collect sibling pages (pages in the same folder)
            const folderPath = path.join(docsDir, folderName);
            if (existsSync(folderPath)) {
                const folderFiles = readdirSync(folderPath)
                    .filter(f => f.endsWith('.md') && f !== 'index.md');

                for (const file of folderFiles) {
                    const siblingPath = path.join(folderPath, file);
                    const siblingContent = readFileSync(siblingPath);
                    const siblingParsed = frontMatter(siblingContent);
                    const siblingBasename = path.basename(file, '.md');

                    siblingPages.push({
                        title: siblingParsed.attributes.navtitle || siblingParsed.attributes.title || siblingBasename,
                        slug: siblingParsed.attributes.slug || siblingBasename,
                        href: `${siblingBasename}.html`,
                        order: siblingParsed.attributes.order || 999
                    });
                }

                siblingPages.sort((a, b) => a.order - b.order);
            }

            // Build recursive sidebar tree for nested navigation
            const currentPagePath = relativeDir + '/' + currentSlug;
            sidebarTree = buildSidebarTree(docsDir, folderName, currentPagePath, basePath);
        } else {
            // For top-level pages (not in a folder), add Home as root (except for index.html itself)
            if (basename !== 'index') {
                breadcrumb.push({ label: 'Home', href: `${basePath}index.html` });
            }
        }

        // Add current page to breadcrumb (skip for folder index as folder label is already added)
        // Also skip for root index.html
        if (!isFolderIndex && basename !== 'index') {
            breadcrumb.push({ label: parsedContent.attributes.navtitle || parsedContent.attributes.title || basename, href: null });
        }

        // Compile and render template
        const template = compileTemplateFromPath(templatePath);
        const flatTokens = pageTokens ? flattenTokensForDisplay(pageTokens) : null;

        // Determine activeNav for navigation highlighting using shared logic
        // Compose the page path from relative dir and slug
        const pagePath = relativeDir && relativeDir !== '.'
            ? `${relativeDir}/${currentSlug}`
            : currentSlug;
        const activeNav = deriveActiveNav(pagePath);

        const htmlOutput = template({
            ...context,
            ...parsedContent.attributes,
            content: htmlContent,
            headings,
            tokens: pageTokens,
            flatTokens,
            tokenGroups: flatTokens ? groupTokensByCategory(flatTokens) : null,
            navigation,
            currentSlug,
            basePath,
            folderContext,
            siblingPages,
            sidebarTree,
            breadcrumb,
            isNested: relativeDir && relativeDir !== '.',
            isFolderIndex,
            activeNav
        });

        writeFileSync(outputPath, htmlOutput);
        } catch (error) {
            // Re-throw BuildErrors as-is, wrap other errors with context
            if (error instanceof BuildError) {
                if (!error.file) {
                    error.file = filePath;
                }
                throw error;
            }

            // Determine appropriate hint based on error type
            let hint = HINTS.FILE_READ;
            let phase = 'markdown-process';

            if (error.message?.includes('YAML') || error.message?.includes('front')) {
                hint = HINTS.INVALID_FRONTMATTER;
                phase = 'markdown-frontmatter';
            } else if (error.message?.includes('template') || error.message?.includes('Template')) {
                hint = HINTS.TEMPLATE_RENDER;
                phase = 'markdown-template';
            }

            throw new BuildError(
                `Failed to process markdown file`,
                {
                    file: filePath,
                    phase,
                    hint,
                    originalError: error
                }
            );
        }
    }
};

export default {
    extractHeadings,
    addHeadingIds,
    flattenTokensForDisplay,
    groupTokensByCategory,
    collectNavigationPages,
    buildNavigationPages,
    processMarkdownFiles
};
