// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Theme loading and discovery utilities
 * Supports W3C DTCG format with theme extensions
 */
import path from 'path';
import { existsSync, readJsonSync } from '../fs.js';
import { mergeTokens } from '../tokens.js';
import { loadTokensFromConfig, loadConfig } from '../config/loader.js';

/**
 * Default theme configuration
 */
const DEFAULT_THEME_CONFIG = {
    darkModeAttribute: 'dark',
    themeClassPrefix: 'theme-'
};

/**
 * Load design tokens with theme support
 * Discovers themes from $themes key (inline) or $meta.themes references (external files)
 *
 * @param {string} tokensPath - Path to the base tokens file
 * @param {string} [cwd=process.cwd()] - Working directory
 * @returns {object} Theme-aware token structure
 */
export function loadThemeTokens(tokensPath, cwd = process.cwd()) {
    const fullPath = path.join(cwd, tokensPath);

    if (!existsSync(fullPath)) {
        return null;
    }

    const baseTokens = readJsonSync(fullPath);
    const tokensDir = path.dirname(fullPath);

    // Discover themes from the base tokens
    const themes = discoverThemes(baseTokens, tokensDir, cwd);

    // Extract base tokens (without $themes and $meta)
    const cleanBaseTokens = extractBaseTokens(baseTokens);

    // Build the theme matrix (all combinations)
    const themeMatrix = buildThemeMatrix(cleanBaseTokens, themes);

    return {
        base: cleanBaseTokens,
        themes,
        themeMatrix,
        meta: baseTokens.$meta || {}
    };
}

/**
 * Load design tokens with theme support (async version)
 * Supports both single file (tokensFile) and multi-file (tokens.source/include) configurations
 *
 * @param {string} [cwd=process.cwd()] - Working directory
 * @returns {Promise<object|null>} Theme-aware token structure
 */
export async function loadThemeTokensAsync(cwd = process.cwd()) {
    const config = loadConfig(cwd);

    // Determine base tokens directory for resolving theme files
    let tokensDir = cwd;
    let baseTokens = null;

    // Priority 1: Legacy single file
    if (config?.tokensFile) {
        const fullPath = path.join(cwd, config.tokensFile);
        if (existsSync(fullPath)) {
            baseTokens = readJsonSync(fullPath);
            tokensDir = path.dirname(fullPath);
        }
    }

    // Priority 2: Multi-file tokens config
    if (!baseTokens && config?.tokens && (config.tokens.source || config.tokens.include)) {
        baseTokens = await loadTokensFromConfig(config.tokens, cwd);
        // For multi-file, use tokens directory from config or default
        if (config.tokens.source) {
            // Use the directory of the first source pattern
            const firstPattern = Array.isArray(config.tokens.source)
                ? config.tokens.source[0]
                : config.tokens.source;
            // Handle both glob patterns and direct file paths
            let patternDir;
            if (firstPattern.includes('*')) {
                // Glob pattern - strip glob parts
                patternDir = firstPattern.replace(/\/\*\*\/.*$/, '').replace(/\/\*.*$/, '');
            } else {
                // Direct file path - use dirname
                patternDir = path.dirname(firstPattern);
            }
            tokensDir = path.join(cwd, patternDir);
        }
    }

    // Priority 3: Standard locations
    if (!baseTokens) {
        const standardPaths = [
            'tokens/design-tokens.json',
            'tokens.json',
            'design-tokens.json'
        ];
        for (const tokenPath of standardPaths) {
            const fullPath = path.join(cwd, tokenPath);
            if (existsSync(fullPath)) {
                baseTokens = readJsonSync(fullPath);
                tokensDir = path.dirname(fullPath);
                break;
            }
        }
    }

    if (!baseTokens) {
        return null;
    }

    // Discover themes from the base tokens
    const themes = discoverThemes(baseTokens, tokensDir, cwd);

    // Extract base tokens (without $themes and $meta)
    const cleanBaseTokens = extractBaseTokens(baseTokens);

    // Build the theme matrix (all combinations)
    const themeMatrix = buildThemeMatrix(cleanBaseTokens, themes);

    return {
        base: cleanBaseTokens,
        themes,
        themeMatrix,
        meta: baseTokens.$meta || {}
    };
}

/**
 * Discover themes from token file
 * Supports both inline $themes and $meta.themes file references
 *
 * @param {object} tokens - Parsed tokens object
 * @param {string} tokensDir - Directory containing the tokens file
 * @param {string} cwd - Working directory
 * @returns {object} Discovered themes { name: { tokens, mode, extends } }
 */
export function discoverThemes(tokens, tokensDir, cwd) {
    const themes = {};

    // Check for inline $themes
    if (tokens.$themes) {
        for (const [themeName, themeTokens] of Object.entries(tokens.$themes)) {
            themes[themeName] = {
                name: themeName,
                tokens: themeTokens,
                mode: inferModeFromName(themeName),
                source: 'inline'
            };
        }
    }

    // Check for $meta.themes file references
    if (tokens.$meta?.themes && Array.isArray(tokens.$meta.themes)) {
        for (const themeMeta of tokens.$meta.themes) {
            const themeFile = resolveThemeFile(themeMeta.file, tokensDir, cwd);

            if (themeFile) {
                const themeTokens = readJsonSync(themeFile);
                const cleanThemeTokens = extractBaseTokens(themeTokens);

                themes[themeMeta.name] = {
                    name: themeMeta.name,
                    tokens: cleanThemeTokens,
                    mode: themeMeta.mode || themeTokens.$meta?.mode || inferModeFromName(themeMeta.name),
                    extends: themeMeta.extends,
                    source: 'file',
                    file: themeMeta.file
                };
            }
        }
    }

    return themes;
}

/**
 * Resolve theme file path
 *
 * @param {string} filePath - Relative path from theme reference
 * @param {string} tokensDir - Directory containing the base tokens file
 * @param {string} cwd - Working directory
 * @returns {string|null} Resolved absolute path or null if not found
 */
export function resolveThemeFile(filePath, tokensDir, cwd) {
    // Try relative to tokens directory first
    const relativeToTokens = path.resolve(tokensDir, filePath);
    if (existsSync(relativeToTokens)) {
        return relativeToTokens;
    }

    // Try relative to cwd
    const relativeToCwd = path.resolve(cwd, filePath);
    if (existsSync(relativeToCwd)) {
        return relativeToCwd;
    }

    return null;
}

/**
 * Extract base tokens without theme-related keys
 *
 * @param {object} tokens - Full tokens object
 * @returns {object} Tokens without $themes, $meta
 */
export function extractBaseTokens(tokens) {
    const result = {};

    for (const [key, value] of Object.entries(tokens)) {
        // Skip theme-related keys
        if (key === '$themes' || key === '$meta') {
            continue;
        }
        result[key] = value;
    }

    return result;
}

/**
 * Infer mode (light/dark) from theme name
 *
 * @param {string} themeName - Name of the theme
 * @returns {string|null} 'dark' if name contains 'dark', null otherwise
 */
export function inferModeFromName(themeName) {
    const name = themeName.toLowerCase();
    if (name.includes('dark')) {
        return 'dark';
    }
    return null;
}

/**
 * Build theme matrix - all possible theme combinations
 * Creates base + each theme variant + dark modes for each
 *
 * @param {object} baseTokens - Base design tokens
 * @param {object} themes - Discovered themes { name: { tokens, mode, extends } }
 * @returns {object} Theme matrix with CSS selectors as keys
 */
export function buildThemeMatrix(baseTokens, themes) {
    const matrix = {
        // Base tokens always go to :root
        ':root': {
            tokens: baseTokens,
            name: 'base',
            mode: 'light'
        }
    };

    // Separate themes into mode themes (dark) and variant themes (comic, etc.)
    const modeThemes = {};
    const variantThemes = {};

    for (const [themeName, theme] of Object.entries(themes)) {
        if (theme.mode === 'dark' && !themeName.includes('-')) {
            // Pure dark mode theme (e.g., "dark")
            modeThemes[themeName] = theme;
        } else if (theme.mode === 'dark' && themeName.includes('-')) {
            // Combined theme (e.g., "comic-dark") - handled separately
            continue;
        } else {
            // Variant theme (e.g., "comic")
            variantThemes[themeName] = theme;
        }
    }

    // Add pure dark mode
    for (const [modeName, modeTheme] of Object.entries(modeThemes)) {
        const selector = `[data-theme="${modeName}"]`;
        matrix[selector] = {
            tokens: modeTheme.tokens,
            name: modeName,
            mode: 'dark',
            baseTokens // Store base for override detection
        };
    }

    // Add variant themes
    for (const [variantName, variantTheme] of Object.entries(variantThemes)) {
        const selector = `.theme-${variantName}`;
        matrix[selector] = {
            tokens: variantTheme.tokens,
            name: variantName,
            mode: 'light',
            baseTokens
        };

        // Check if there's a combined dark version for this variant
        const darkVariantName = `${variantName}-dark`;
        if (themes[darkVariantName]) {
            const darkVariant = themes[darkVariantName];
            const darkSelector = `[data-theme="dark"].theme-${variantName}`;

            // Merge: base dark + variant + variant-dark overrides
            let mergedTokens = darkVariant.tokens;

            // If variant-dark extends another theme, apply that first
            if (darkVariant.extends && themes[darkVariant.extends]) {
                mergedTokens = mergeTokens(themes[darkVariant.extends].tokens, darkVariant.tokens);
            }

            matrix[darkSelector] = {
                tokens: mergedTokens,
                name: darkVariantName,
                mode: 'dark',
                baseTokens
            };
        } else if (modeThemes.dark) {
            // Auto-generate dark variant by merging dark mode with variant
            const darkSelector = `[data-theme="dark"].theme-${variantName}`;
            matrix[darkSelector] = {
                tokens: mergeTokens(modeThemes.dark.tokens, variantTheme.tokens),
                name: `${variantName}-dark`,
                mode: 'dark',
                baseTokens,
                autoGenerated: true
            };
        }
    }

    return matrix;
}

/**
 * Get list of available themes for UI
 *
 * @param {object} themes - Discovered themes
 * @returns {object} { modes: [...], variants: [...] }
 */
export function getThemeOptions(themes) {
    const modes = [{ name: 'light', label: 'Light' }];
    const variants = [{ name: 'default', label: 'Default', className: '' }];

    for (const [themeName, theme] of Object.entries(themes)) {
        // Skip combined themes (e.g., comic-dark)
        if (themeName.includes('-')) {
            continue;
        }

        if (theme.mode === 'dark') {
            modes.push({
                name: themeName,
                label: capitalize(themeName)
            });
        } else {
            variants.push({
                name: themeName,
                label: capitalize(themeName),
                className: `theme-${themeName}`
            });
        }
    }

    return { modes, variants };
}

/**
 * Get theme configuration with defaults
 *
 * @param {object} config - Stylescribe configuration
 * @returns {object} Theme configuration
 */
export function getThemeConfig(config) {
    const userConfig = config?.themes || {};

    return {
        ...DEFAULT_THEME_CONFIG,
        ...userConfig
    };
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default {
    loadThemeTokens,
    loadThemeTokensAsync,
    discoverThemes,
    resolveThemeFile,
    extractBaseTokens,
    buildThemeMatrix,
    getThemeOptions,
    getThemeConfig,
    DEFAULT_THEME_CONFIG
};
