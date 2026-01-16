// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * W3C Design Tokens Community Group (DTCG) Format Support
 * Spec: https://tr.designtokens.org/format/
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import {
    processTokenFunctions,
    processAllTokens,
    areFunctionsEnabled,
    isFunction,
} from './tokens/processor.js';
import { resolveIconPath, isIconPath } from './tokens/functions/icon.js';
import { isGradientObject, processGradient } from './tokens/functions/gradient.js';
import { isShadowObject, processShadow } from './tokens/functions/shadow.js';

// Supported token types per W3C DTCG spec
const TOKEN_TYPES = {
    COLOR: 'color',
    DIMENSION: 'dimension',
    FONT_FAMILY: 'fontFamily',
    FONT_WEIGHT: 'fontWeight',
    DURATION: 'duration',
    CUBIC_BEZIER: 'cubicBezier',
    NUMBER: 'number',
    STRING: 'string',
    COMPOSITE: 'composite',
    STROKE_STYLE: 'strokeStyle',
    BORDER: 'border',
    TRANSITION: 'transition',
    SHADOW: 'shadow',
    GRADIENT: 'gradient',
    TYPOGRAPHY: 'typography',
    ASSET: 'asset',  // W3C DTCG asset type for icons, images, files
    ICON: 'icon'     // Alias for backwards compatibility
};

/**
 * Parse CSS content and extract CSS custom properties as design tokens
 */
export function extractTokensFromCSS(cssContent, options = {}) {
    const tokens = {};
    const { prefix = '', includeComments = true } = options;

    // Match CSS custom property definitions
    const cssVarRegex = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
    // Match single-line comments directly before variable declarations
    // Uses [^\n]* instead of .* to only match single-line comments (not file headers)
    const commentRegex = /\/\*\s*([^\n*]*?)\s*\*\/\s*\n\s*(--[a-zA-Z0-9-_]+)/g;

    const comments = {};

    // Extract comments associated with variables
    if (includeComments) {
        let commentMatch;
        while ((commentMatch = commentRegex.exec(cssContent)) !== null) {
            const comment = commentMatch[1].trim();
            // Skip empty comments or comments that look like section headers
            if (!comment || comment.includes('===') || comment.includes('---')) {
                continue;
            }
            const varName = commentMatch[2].replace('--', '');
            comments[varName] = comment;
        }
    }

    let match;
    while ((match = cssVarRegex.exec(cssContent)) !== null) {
        const name = match[1];
        const value = match[2].trim();

        // Skip if prefix filter is set and doesn't match
        if (prefix && !name.startsWith(prefix)) {
            continue;
        }

        const token = {
            $value: value,
            $type: inferTokenType(value)
        };

        if (comments[name]) {
            token.$description = comments[name];
        }

        // Build nested structure from name (e.g., "color-primary-500" -> { color: { primary: { 500: ... } } })
        setNestedToken(tokens, name, token);
    }

    return tokens;
}

/**
 * Infer token type from value
 */
function inferTokenType(value) {
    // Asset patterns (~ prefix for npm packages, ending with .svg, .png, .jpg, etc.)
    if (value.startsWith('~') && /\.(svg|png|jpg|jpeg|gif|webp)$/i.test(value)) {
        return TOKEN_TYPES.ASSET;
    }

    // Color patterns
    if (value.startsWith('#') ||
        value.startsWith('rgb') ||
        value.startsWith('hsl') ||
        value.startsWith('oklch') ||
        value.startsWith('lab') ||
        value.startsWith('lch')) {
        return TOKEN_TYPES.COLOR;
    }

    // Dimension patterns (px, rem, em, %, vw, vh, etc.)
    if (/^-?\d+(\.\d+)?(px|rem|em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/.test(value)) {
        return TOKEN_TYPES.DIMENSION;
    }

    // Duration patterns
    if (/^-?\d+(\.\d+)?(ms|s)$/.test(value)) {
        return TOKEN_TYPES.DURATION;
    }

    // Font weight patterns
    if (/^(100|200|300|400|500|600|700|800|900|normal|bold|lighter|bolder)$/.test(value)) {
        return TOKEN_TYPES.FONT_WEIGHT;
    }

    // Font family patterns
    if (value.includes(',') && (value.includes('sans-serif') || value.includes('serif') || value.includes('monospace'))) {
        return TOKEN_TYPES.FONT_FAMILY;
    }

    // Number patterns
    if (/^-?\d+(\.\d+)?$/.test(value)) {
        return TOKEN_TYPES.NUMBER;
    }

    // Cubic bezier
    if (value.startsWith('cubic-bezier')) {
        return TOKEN_TYPES.CUBIC_BEZIER;
    }

    // Default to string
    return TOKEN_TYPES.STRING;
}

/**
 * Set a nested token value using dot-separated or hyphen-separated path
 */
function setNestedToken(obj, path, value) {
    const parts = path.split('-').filter(Boolean);
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
            current[part] = {};
        }
        current = current[part];
    }

    current[parts[parts.length - 1]] = value;
}

/**
 * Flatten nested tokens to CSS custom properties
 * @param {object} tokens - Token tree to flatten
 * @param {string} prefix - Internal prefix for recursion
 * @param {object} result - Accumulated result
 * @param {string} tokenPrefix - External prefix to prepend to all token names (e.g., 'ds-', 'sol-')
 */
function flattenTokens(tokens, prefix = '', result = {}, tokenPrefix = '') {
    for (const [key, value] of Object.entries(tokens)) {
        const newPrefix = prefix ? `${prefix}-${key}` : key;

        if (value && typeof value === 'object' && '$value' in value) {
            // Apply token prefix to the final CSS variable name
            const cssVarName = tokenPrefix ? `${tokenPrefix}${newPrefix}` : newPrefix;
            result[cssVarName] = value;
        } else if (value && typeof value === 'object') {
            flattenTokens(value, newPrefix, result, tokenPrefix);
        }
    }

    return result;
}

/**
 * Convert W3C design tokens to CSS custom properties
 * @param {object} tokens - Token tree to convert
 * @param {object} options - Conversion options
 * @param {string} options.selector - CSS selector (default: ':root')
 * @param {string} options.indent - Indentation string (default: '  ')
 * @param {boolean} options.includeComments - Include token descriptions as comments
 * @param {string} options.tokenPrefix - Prefix to prepend to all CSS variable names (e.g., 'ds-', 'sol-')
 */
export function tokensToCss(tokens, options = {}) {
    const {
        selector = ':root',
        indent = '  ',
        includeComments = true,
        tokenPrefix = ''
    } = options;

    const flatTokens = flattenTokens(tokens, '', {}, tokenPrefix);
    let css = `${selector} {\n`;

    for (const [name, token] of Object.entries(flatTokens)) {
        if (includeComments && token.$description) {
            css += `${indent}/* ${token.$description} */\n`;
        }
        // Resolve the token value, passing tokenPrefix for reference resolution
        css += `${indent}--${name}: ${resolveTokenValue(token.$value, tokens, { tokenPrefix })};\n`;
    }

    css += '}\n';

    return css;
}

/**
 * Resolve token references (aliases) and optionally process functions
 * @param {*} value - Token value to resolve
 * @param {object} tokens - Token tree for reference resolution
 * @param {object} options - Resolution options
 * @param {boolean} options.processFunctions - Whether to process token functions (default: true)
 * @param {string} options.tokenPrefix - Prefix for CSS variable references (e.g., 'ds-', 'sol-')
 * @returns {*} Resolved value
 */
function resolveTokenValue(value, tokens, options = {}) {
    const { processFunctions = true, tokenPrefix = '' } = options;

    // Handle W3C DTCG gradient objects
    if (isGradientObject(value)) {
        // Create a resolver function that can resolve color references
        const resolveColor = (color) => {
            if (typeof color === 'string' && color.includes('{')) {
                return resolveTokenValue(color, tokens, { processFunctions, tokenPrefix });
            }
            return color;
        };
        return processGradient(value, resolveColor);
    }

    // Handle W3C DTCG shadow objects
    if (isShadowObject(value)) {
        // Create a resolver function that can resolve references and functions
        const resolveVal = (val) => {
            if (typeof val === 'string') {
                return resolveTokenValue(val, tokens, { processFunctions, tokenPrefix });
            }
            return val;
        };
        return processShadow(value, resolveVal);
    }

    if (typeof value !== 'string') {
        return value;
    }

    // Match token references like {color.primary.500}
    const refRegex = /\{([^}]+)\}/g;

    let resolved = value.replace(refRegex, (match, path) => {
        const parts = path.split('.');
        let current = tokens;

        for (const part of parts) {
            if (current && current[part]) {
                current = current[part];
            } else {
                return match; // Return original if not found
            }
        }

        if (current && current.$value) {
            return resolveTokenValue(current.$value, tokens, { processFunctions: false, tokenPrefix });
        }

        return match;
    });

    // Process token functions if enabled and value contains a function
    if (processFunctions && isFunction(resolved)) {
        resolved = processTokenFunctions(resolved, tokens);
    }

    // Process icon paths (~ prefix pointing to node_modules SVGs)
    if (isIconPath(resolved)) {
        resolved = resolveIconPath(resolved);
    }

    return resolved;
}

/**
 * Convert W3C design tokens to SCSS variables
 * @param {object} tokens - Token tree to convert
 * @param {object} options - Conversion options
 * @param {boolean} options.includeComments - Include token descriptions as comments
 * @param {boolean} options.includeMap - Include SCSS map of all tokens
 * @param {string} options.tokenPrefix - Prefix to prepend to all variable names (e.g., 'ds-', 'sol-')
 */
export function tokensToScss(tokens, options = {}) {
    const { includeComments = true, includeMap = true, tokenPrefix = '' } = options;
    const flatTokens = flattenTokens(tokens, '', {}, tokenPrefix);

    let scss = '';

    // Generate individual variables
    for (const [name, token] of Object.entries(flatTokens)) {
        if (includeComments && token.$description) {
            scss += `// ${token.$description}\n`;
        }
        scss += `$${name}: ${resolveTokenValue(token.$value, tokens, { tokenPrefix })};\n`;
    }

    // Generate SCSS map
    if (includeMap) {
        scss += '\n// Design tokens map\n';
        scss += '$design-tokens: (\n';

        for (const [name, token] of Object.entries(flatTokens)) {
            scss += `  '${name}': $${name},\n`;
        }

        scss += ');\n';
    }

    return scss;
}

/**
 * Convert W3C design tokens to JSON (Style Dictionary compatible)
 */
export function tokensToStyleDictionary(tokens) {
    function convertToken(token, name) {
        if (token.$value !== undefined) {
            return {
                value: token.$value,
                type: token.$type || 'string',
                description: token.$description || undefined,
                name: name
            };
        }

        const result = {};
        for (const [key, value] of Object.entries(token)) {
            if (key.startsWith('$')) continue;
            result[key] = convertToken(value, `${name}-${key}`);
        }
        return result;
    }

    const result = {};
    for (const [key, value] of Object.entries(tokens)) {
        result[key] = convertToken(value, key);
    }

    return result;
}

/**
 * Validate tokens against W3C DTCG spec
 */
export function validateTokens(tokens, errors = [], path = '') {
    for (const [key, value] of Object.entries(tokens)) {
        const currentPath = path ? `${path}.${key}` : key;

        // Skip if it's a token metadata key
        if (key.startsWith('$')) {
            continue;
        }

        if (value && typeof value === 'object') {
            // Check if it looks like a token (has $type or other $ keys but might be missing $value)
            const hasTokenKeys = Object.keys(value).some(k => k.startsWith('$'));

            if ('$value' in value) {
                // Validate required $value is not null/undefined
                if (value.$value === undefined || value.$value === null) {
                    errors.push({
                        path: currentPath,
                        message: 'Token must have a $value'
                    });
                }

                // Validate $type if present
                if (value.$type && !Object.values(TOKEN_TYPES).includes(value.$type)) {
                    errors.push({
                        path: currentPath,
                        message: `Invalid token type: ${value.$type}`,
                        validTypes: Object.values(TOKEN_TYPES)
                    });
                }
            } else if (hasTokenKeys) {
                // Has token metadata keys but no $value - this is an error
                errors.push({
                    path: currentPath,
                    message: 'Token must have a $value'
                });
            } else {
                // Recurse into nested groups
                validateTokens(value, errors, currentPath);
            }
        }
    }

    return errors;
}

/**
 * Merge multiple token files
 */
export function mergeTokens(...tokenSets) {
    const result = {};

    for (const tokens of tokenSets) {
        deepMerge(result, tokens);
    }

    return result;
}

function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) {
                target[key] = {};
            }
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

/**
 * Load tokens from a file (JSON or tokens.json)
 */
export async function loadTokensFromFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
}

/**
 * Save tokens to a file
 */
export async function saveTokensToFile(tokens, filePath, options = {}) {
    const { indent = 2 } = options;
    const content = JSON.stringify(tokens, null, indent);
    await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Extract tokens from SCSS files
 */
export function extractTokensFromScss(scssContent, options = {}) {
    const tokens = {};
    const { includeComments = true } = options;

    // Match SCSS variable definitions
    const scssVarRegex = /\$([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
    // Match comments before variable declarations
    const commentRegex = /\/\/\s*(.*?)\n\s*(\$[a-zA-Z0-9-_]+)/gs;

    const comments = {};

    // Extract comments
    if (includeComments) {
        let commentMatch;
        while ((commentMatch = commentRegex.exec(scssContent)) !== null) {
            const comment = commentMatch[1].trim();
            const varName = commentMatch[2].replace('$', '');
            comments[varName] = comment;
        }
    }

    let match;
    while ((match = scssVarRegex.exec(scssContent)) !== null) {
        const name = match[1];
        const value = match[2].trim();

        const token = {
            $value: value,
            $type: inferTokenType(value)
        };

        if (comments[name]) {
            token.$description = comments[name];
        }

        setNestedToken(tokens, name, token);
    }

    return tokens;
}

/**
 * Generate CSS for all theme combinations
 * Creates CSS with selectors for base, dark mode, variants, and combinations
 *
 * @param {object} themeMatrix - Theme matrix from buildThemeMatrix()
 * @param {object} options - Generation options
 * @param {string} options.tokenPrefix - Prefix to prepend to all CSS variable names (e.g., 'ds-', 'sol-')
 * @returns {string} Complete CSS for all themes
 */
export function generateThemeCss(themeMatrix, options = {}) {
    const {
        indent = '  ',
        includeComments = true,
        onlyOverrides = true,
        tokenPrefix = ''
    } = options;

    let css = '';

    for (const [selector, themeData] of Object.entries(themeMatrix)) {
        const { tokens, name, baseTokens, autoGenerated } = themeData;

        // Add comment for theme section
        if (includeComments) {
            const comment = autoGenerated
                ? `/* Theme: ${name} (auto-generated) */`
                : `/* Theme: ${name} */`;
            css += `${comment}\n`;
        }

        // For base (:root), output all tokens
        // For other selectors, only output overrides if onlyOverrides is true
        if (selector === ':root' || !onlyOverrides) {
            css += tokensToCss(tokens, { selector, indent, includeComments: false, tokenPrefix });
        } else {
            css += tokensToCssOverrides(tokens, baseTokens, { selector, indent, tokenPrefix });
        }

        css += '\n';
    }

    return css;
}

/**
 * Generate CSS for a single theme (for individual theme files)
 *
 * @param {object} theme - Theme object { name, tokens, mode }
 * @param {object} baseTokens - Base tokens to compare against for overrides
 * @param {object} options - Generation options
 * @param {string} options.tokenPrefix - Prefix to prepend to all CSS variable names (e.g., 'ds-', 'sol-')
 * @returns {string} CSS for the single theme
 */
export function generateSingleThemeCss(theme, baseTokens, options = {}) {
    const {
        onlyOverrides = true,
        includeComments = true,
        indent = '  ',
        themeConfig = {},
        tokenPrefix = ''
    } = options;

    const darkModeAttribute = themeConfig.darkModeAttribute || 'dark';
    const themeClassPrefix = themeConfig.themeClassPrefix || 'theme-';

    // Determine the CSS selector based on theme mode
    let selector;
    if (theme.mode === 'dark') {
        // Pure dark mode theme
        if (theme.name === 'dark' || theme.name === darkModeAttribute) {
            selector = `[data-theme="${darkModeAttribute}"]`;
        } else if (theme.name.includes('-')) {
            // Combined theme like "comic-dark"
            const baseName = theme.name.replace(/-dark$/, '');
            selector = `[data-theme="${darkModeAttribute}"].${themeClassPrefix}${baseName}`;
        } else {
            selector = `[data-theme="${theme.name}"]`;
        }
    } else {
        // Variant theme (light mode)
        selector = `.${themeClassPrefix}${theme.name}`;
    }

    let css = '';

    if (includeComments) {
        css += `/* Theme: ${theme.name} */\n`;
    }

    if (onlyOverrides && baseTokens) {
        css += tokensToCssOverrides(theme.tokens, baseTokens, { selector, indent, tokenPrefix });
    } else {
        css += tokensToCss(theme.tokens, { selector, indent, includeComments: false, tokenPrefix });
    }

    return css;
}

/**
 * Generate CSS with only the tokens that differ from base
 *
 * @param {object} tokens - Theme tokens
 * @param {object} baseTokens - Base tokens to compare against
 * @param {object} options - Generation options
 * @param {string} options.tokenPrefix - Prefix to prepend to all CSS variable names (e.g., 'ds-', 'sol-')
 * @returns {string} CSS with only override values
 */
export function tokensToCssOverrides(tokens, baseTokens, options = {}) {
    const {
        selector = ':root',
        indent = '  ',
        tokenPrefix = ''
    } = options;

    const flatTokens = flattenTokensInternal(tokens, '', {}, tokenPrefix);
    const flatBaseTokens = flattenTokensInternal(baseTokens, '', {}, tokenPrefix);

    let css = `${selector} {\n`;
    let hasOverrides = false;

    for (const [name, token] of Object.entries(flatTokens)) {
        const baseToken = flatBaseTokens[name];

        // Only include if different from base or not in base
        if (!baseToken || baseToken.$value !== token.$value) {
            css += `${indent}--${name}: ${resolveTokenValue(token.$value, tokens, { tokenPrefix })};\n`;
            hasOverrides = true;
        }
    }

    css += '}\n';

    // Return empty string if no overrides
    return hasOverrides ? css : '';
}

/**
 * Internal flatten function (to avoid circular dependency with exported flattenTokens)
 * @param {object} tokens - Token tree to flatten
 * @param {string} prefix - Internal prefix for recursion
 * @param {object} result - Accumulated result
 * @param {string} tokenPrefix - External prefix to prepend to all token names (e.g., 'ds-', 'sol-')
 */
function flattenTokensInternal(tokens, prefix = '', result = {}, tokenPrefix = '') {
    for (const [key, value] of Object.entries(tokens)) {
        // Skip meta keys
        if (key.startsWith('$')) continue;

        const newPrefix = prefix ? `${prefix}-${key}` : key;

        if (value && typeof value === 'object' && '$value' in value) {
            // Apply token prefix to the final CSS variable name
            const cssVarName = tokenPrefix ? `${tokenPrefix}${newPrefix}` : newPrefix;
            result[cssVarName] = value;
        } else if (value && typeof value === 'object') {
            flattenTokensInternal(value, newPrefix, result, tokenPrefix);
        }
    }

    return result;
}

// Re-export processor functions for advanced usage
export { processTokenFunctions, processAllTokens, areFunctionsEnabled };

// Re-export function registry for custom function registration
export { getAvailableFunctions, registerFunction, unregisterFunction } from './tokens/processor.js';

export { TOKEN_TYPES, resolveTokenValue };
