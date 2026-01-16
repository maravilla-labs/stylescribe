// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Search Index Builder
 * Builds a Lunr.js search index from components, pages, and tokens
 */
import lunr from 'lunr';
import { writeFileSync, existsSync, readdirSync, readFileSync, statSync } from '../fs.js';
import path from 'path';
import frontMatter from 'front-matter';

/**
 * Recursively collect all markdown pages from docs folder
 * @param {string} docsDir - Path to docs directory
 * @param {string} [relativePath=''] - Current relative path for recursion
 * @returns {Array} Array of page objects with slug, title, url, content
 */
function collectAllPages(docsDir, relativePath = '') {
    const pages = [];
    const currentDir = relativePath ? path.join(docsDir, relativePath) : docsDir;

    if (!existsSync(currentDir)) {
        return pages;
    }

    const entries = readdirSync(currentDir);

    for (const entry of entries) {
        // Skip hidden files/folders
        if (entry.startsWith('.') || entry.startsWith('_')) {
            continue;
        }

        const fullPath = path.join(currentDir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            // Recurse into subdirectory
            const newRelativePath = relativePath ? `${relativePath}/${entry}` : entry;
            pages.push(...collectAllPages(docsDir, newRelativePath));
        } else if (entry.endsWith('.md')) {
            try {
                const content = readFileSync(fullPath);
                const parsed = frontMatter(content);

                // Skip hidden pages
                if (parsed.attributes.hidden === true) {
                    continue;
                }

                const basename = path.basename(entry, '.md');
                let slug, url;

                if (basename === 'index') {
                    // index.md files: slug includes /index for consistency
                    slug = relativePath ? `${relativePath}/index` : 'index';
                    url = `${slug}.html`;
                } else {
                    // Regular files
                    slug = relativePath ? `${relativePath}/${basename}` : basename;
                    url = `${slug}.html`;
                }

                pages.push({
                    slug,
                    title: parsed.attributes.navtitle || parsed.attributes.title || basename,
                    description: parsed.attributes.description || '',
                    url,
                    // Include plain text content for search (strip markdown)
                    content: parsed.body.replace(/[#*`\[\]()]/g, ' ').substring(0, 1000)
                });
            } catch (error) {
                // Skip files that can't be parsed
            }
        }
    }

    return pages;
}

/**
 * Build search index from components, blocks, pages, and tokens
 * @param {Array} components - Array of component objects
 * @param {Array} pages - Array of page objects with title, slug, content (legacy, ignored if docsDir provided)
 * @param {Array} tokens - Array of flattened token objects
 * @param {string} outputDir - Directory to write the search index
 * @param {Object} options - Additional options
 * @param {Array} options.blocks - Array of UI block objects
 * @param {Array} options.fullPages - Array of full page example objects
 * @param {string} options.docsDir - Docs directory to recursively collect pages from
 * @returns {number} Number of documents indexed
 */
export function buildSearchIndex(components, pages, tokens, outputDir, options = {}) {
    const documents = [];
    const { blocks, fullPages, docsDir } = options;

    // If docsDir is provided, recursively collect all pages from it
    // This ensures ALL nested pages are indexed, not just top-level nav items
    const allPages = docsDir ? collectAllPages(docsDir) : pages;

    // Index components
    if (components && components.length) {
        components.forEach(comp => {
            documents.push({
                id: `component-${comp.name}`,
                type: 'component',
                title: comp.title || comp.name,
                description: comp.description || '',
                content: [
                    comp.group || '',
                    ...(comp.variations || []),
                    ...(comp.elements || [])
                ].filter(Boolean).join(' '),
                url: `components/${comp.name}.html`,
                screenshot: `static/screenshots/component-${comp.name}.png`
            });
        });
    }

    // Index UI blocks
    if (blocks && blocks.length) {
        blocks.forEach(block => {
            documents.push({
                id: `block-${block.name}`,
                type: 'block',
                title: block.title || block.name,
                description: block.description || '',
                content: block.group || '',
                url: `blocks/${block.name}.html`,
                screenshot: `static/screenshots/block-${block.name}.png`
            });
        });
    }

    // Index full pages
    if (fullPages && fullPages.length) {
        fullPages.forEach(page => {
            documents.push({
                id: `fullpage-${page.name}`,
                type: 'fullpage',
                title: page.title || page.name,
                description: page.description || '',
                content: page.group || '',
                url: `pages/${page.name}.html`,
                screenshot: `static/screenshots/page-${page.name}.png`
            });
        });
    }

    // Index documentation pages (markdown) - uses recursively collected pages if docsDir provided
    if (allPages && allPages.length) {
        allPages.forEach(page => {
            documents.push({
                id: `page-${page.slug}`,
                type: 'page',
                title: page.title || page.slug,
                description: page.description || '',
                content: page.content || '',
                url: page.url || `${page.slug}.html`,
                // Add screenshot path for docs pages (same pattern as components)
                screenshot: `static/screenshots/page-${page.slug.replace(/\//g, '-')}.png`
            });
        });
    }

    // Index tokens
    if (tokens && tokens.length) {
        tokens.forEach(token => {
            documents.push({
                id: `token-${token.name}`,
                type: 'token',
                title: token.name,
                description: token.description || '',
                content: `${token.type || ''} ${token.value || ''} ${token.category || ''}`,
                url: `documentation/tokens.html#category-${token.category}`
            });
        });
    }

    if (documents.length === 0) {
        return 0;
    }

    // Build Lunr index
    const idx = lunr(function() {
        this.ref('id');
        this.field('title', { boost: 10 });
        this.field('description', { boost: 5 });
        this.field('content');

        documents.forEach(doc => this.add(doc));
    });

    // Create document store for result lookup
    const documentStore = documents.reduce((acc, doc) => {
        acc[doc.id] = {
            title: doc.title,
            type: doc.type,
            url: doc.url,
            description: doc.description,
            screenshot: doc.screenshot || null
        };
        return acc;
    }, {});

    // Write index and document store
    const searchData = {
        index: idx.toJSON(),
        documents: documentStore
    };

    writeFileSync(
        path.join(outputDir, 'search-index.json'),
        JSON.stringify(searchData)
    );

    return documents.length;
}

export default { buildSearchIndex };
