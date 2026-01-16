// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

import { BuildError, HINTS } from './errors.js';

const RESERVED_WORDS = ['cssVars'];

/**
 * Parse annotation content from a comment block
 * This is the core parsing logic shared between CSS and HTML annotations
 * @param {string} commentContent - Raw content inside the comment block
 * @param {boolean} [cleanAsterisks=true] - Whether to clean asterisk characters (for CSS comments)
 * @returns {object} Parsed annotations object
 */
export function parseAnnotationBlock(commentContent, cleanAsterisks = true) {
    // Match @annotation only when it appears at line start (after optional whitespace/asterisks)
    // This prevents matching @ symbols inside HTML attributes like placeholder="you@example.com"
    const annotationRegExp = /(?:^|\n)[\s*]*@(\w+)([\s\S]*?)(?=(?:\n[\s*]*@\w+)|$)/g;

    let match;
    let annotationsObj = {};

    while ((match = annotationRegExp.exec(commentContent)) !== null) {
        const key = match[1];
        let value = match[2].trim();

        // Check if the key is a reserved word
        if (RESERVED_WORDS.includes(key)) {
            throw new Error(`The key "${key}" is a reserved word and cannot be used as an annotation.`);
        }

        // Clean up the value - remove leading asterisk and newline asterisks (for CSS comments)
        if (cleanAsterisks) {
            value = value.replace(/\n\s*\*/g, '\n').trim();
            // Also remove leading asterisk if present (from comment block formatting)
            value = value.replace(/^\*\s*/, '').trim();
        }

        // Check for new format when the key ends with 's'
        if (key.endsWith('s') && value.startsWith('-')) {
            let items = [];
            const itemEntryRegex = /-\s+([\s\S]*?)(?=-\s+\w+:|$)/g;

            let itemEntryMatch;

            while ((itemEntryMatch = itemEntryRegex.exec(value)) !== null) {
                let itemContent = itemEntryMatch[1];
                let itemObj = {};

                // Parse key-value pairs more carefully, handling multi-line code blocks
                const lines = itemContent.split('\n');
                let currentKey = null;
                let currentValue = [];
                let inMultilineBlock = false;

                for (const line of lines) {
                    // Check if this line starts a new key (word followed by colon, possibly with leading whitespace)
                    // Keys can have up to 4 spaces of indent (YAML style), code blocks have more
                    const keyMatch = line.match(/^\s{0,4}(\w+):\s*(.*)/);

                    if (keyMatch && !inMultilineBlock) {
                        // Save previous key-value if exists
                        if (currentKey) {
                            itemObj[currentKey] = currentValue.join('\n').trim();
                        }

                        currentKey = keyMatch[1];
                        let val = keyMatch[2].trim();

                        // Check if this is a multi-line block (starts with |)
                        if (val === '|' || val.startsWith('|')) {
                            inMultilineBlock = true;
                            currentValue = val === '|' ? [] : [val.slice(1).trim()];
                        } else {
                            currentValue = [val];
                        }
                    } else if (currentKey) {
                        // Continue accumulating value for current key
                        // Strip leading spaces that are part of YAML indentation
                        const cleanLine = line.replace(/^\s{2,}/, '');
                        currentValue.push(cleanLine);
                    }
                }

                // Don't forget the last key-value pair
                if (currentKey) {
                    itemObj[currentKey] = currentValue.join('\n').trim();
                }

                if (Object.keys(itemObj).length > 0) {
                    items.push(itemObj);
                }
            }
            value = items;
        } else if (key.endsWith('s')) {
            value = value.split(',').map(v => v.trim());
        }

        annotationsObj[key] = value;
    }

    return annotationsObj;
}

/**
 * Extract annotations from CSS/SCSS comment blocks
 * @param {string} content - CSS content with annotation comments
 * @param {string} [filePath] - Source file path for error context
 * @returns {{ css: string, annotation?: object }} Parsed annotations and cleaned CSS
 */
export function extractAnnotations(content, filePath = 'unknown') {
    try {
        const commentMatch = content.match(/\/\*\*([\s\S]*?)\*\//);

        if (commentMatch) {
            const commentContent = commentMatch[1];
            const annotationsObj = parseAnnotationBlock(commentContent, true);

            // Only search for CSS variables if there are annotations
            if (Object.keys(annotationsObj).length > 0) {
                const cssVarRegExp = /var\(--([\w-]+)\)/g;
                let cssVars = [];

                // Extract all CSS variables from the content
                let varMatch;
                while ((varMatch = cssVarRegExp.exec(content)) !== null) {
                    cssVars.push(varMatch[1]);
                }

                // Deduplicate the array of CSS variables
                cssVars = [...new Set(cssVars)];
                annotationsObj['cssVars'] = cssVars;
            }

            // Remove the matched comment from the content
            const newContent = content.replace(commentMatch[0], '').trim();
            return { css: newContent, annotation: annotationsObj };
        }

        return { css: content };
    } catch (error) {
        // Re-throw BuildErrors as-is, wrap other errors with context
        if (error instanceof BuildError) {
            throw error;
        }
        throw new BuildError(
            `Failed to parse annotations`,
            {
                file: filePath,
                phase: 'annotation-parse',
                hint: HINTS.MISSING_ANNOTATION,
                originalError: error
            }
        );
    }
}

/**
 * Extract annotations from HTML comment blocks
 * Used for UI Blocks and Pages which use HTML as the primary file format
 * @param {string} content - HTML content with annotation comment at the start
 * @param {string} [filePath] - Source file path for error context
 * @returns {{ html: string, annotation?: object }} Parsed annotations and cleaned HTML
 */
export function extractHtmlAnnotations(content, filePath = 'unknown') {
    try {
        // Match HTML comment block at the start of the file: <!-- @annotation value -->
        // The comment must contain at least one @annotation to be considered a front-matter block
        const commentMatch = content.match(/^\s*<!--([\s\S]*?)-->/);

        if (commentMatch && commentMatch[1].includes('@')) {
            const commentContent = commentMatch[1];
            const annotationsObj = parseAnnotationBlock(commentContent, false);

            if (Object.keys(annotationsObj).length > 0) {
                // Remove the matched comment from the content
                const newContent = content.slice(commentMatch[0].length).trim();
                return { html: newContent, annotation: annotationsObj };
            }
        }

        return { html: content };
    } catch (error) {
        // Re-throw BuildErrors as-is, wrap other errors with context
        if (error instanceof BuildError) {
            throw error;
        }
        throw new BuildError(
            `Failed to parse HTML annotations`,
            {
                file: filePath,
                phase: 'annotation-parse',
                hint: HINTS.MISSING_ANNOTATION,
                originalError: error
            }
        );
    }
}
