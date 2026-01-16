// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Configuration loading utilities
 * Handles loading and parsing of .stylescriberc.json configuration
 */
import path from 'path';
import fg from 'fast-glob';
import { existsSync, readJsonSync } from '../fs.js';
import { mergeTokens } from '../tokens.js';
import { resolveTheme } from './themePresets.js';

const CONFIG_FILE = '.stylescriberc.json';

/**
 * Standard token file locations to check
 */
const STANDARD_TOKEN_PATHS = [
    'tokens/design-tokens.json',
    'tokens.json',
    'design-tokens.json'
];

/**
 * Load the Stylescribe configuration from current working directory
 * @param {string} [cwd=process.cwd()] - Working directory
 * @returns {object|null} Configuration object or null if not found
 */
export const loadConfig = (cwd = process.cwd()) => {
    const configPath = path.join(cwd, CONFIG_FILE);

    if (!existsSync(configPath)) {
        return null;
    }

    return readJsonSync(configPath);
};

/**
 * Get head includes (CSS files) from config
 * @param {object} config - Stylescribe configuration
 * @returns {{ local: string[], external: string[] }} Separated local and external CSS includes
 */
export const getHeadIncludes = (config) => {
    const includes = config?.headIncludes?.css || [];
    const external = includes.filter(include => include.startsWith('http'));
    // Normalize local paths: strip ./ prefix for consistent absolute path handling
    const local = includes
        .filter(include => !include.startsWith('http'))
        .map(include => include.startsWith('./') ? include.substring(2) : include);

    return { local, external };
};

/**
 * Get component group order from config
 * @param {object} config - Stylescribe configuration
 * @returns {string[]} Array of group names in order
 */
export const getComponentGroupOrder = (config) => {
    return config?.components?.groupOrder || [];
};

/**
 * Default blocks configuration
 */
const DEFAULT_BLOCKS_CONFIG = {
    source: 'blocks',
    groupOrder: []
};

/**
 * Default pages configuration
 */
const DEFAULT_PAGES_CONFIG = {
    source: 'pages',
    groupOrder: []
};

/**
 * Get UI Blocks configuration from config
 * @param {object} config - Stylescribe configuration
 * @returns {object} Blocks configuration with source and groupOrder
 */
export const getBlocksConfig = (config) => {
    return {
        ...DEFAULT_BLOCKS_CONFIG,
        ...config?.blocks
    };
};

/**
 * Get Pages configuration from config
 * @param {object} config - Stylescribe configuration
 * @returns {object} Pages configuration with source and groupOrder
 */
export const getPagesConfig = (config) => {
    return {
        ...DEFAULT_PAGES_CONFIG,
        ...config?.pages
    };
};

/**
 * Get production base path from config
 * @param {object} config - Stylescribe configuration
 * @returns {string|undefined} Production base path
 */
export const getProductionBasepath = (config) => {
    return config?.productionBasepath;
};

/**
 * Get package files mapping from config
 * @param {object} config - Stylescribe configuration
 * @returns {string[]} Array of "src:dest" mappings
 */
export const getPackageFiles = (config) => {
    return config?.packageFiles || [];
};

/**
 * Load design tokens from config or standard locations (sync version)
 * For async multi-file loading, use loadTokensAsync()
 * @param {string} [cwd=process.cwd()] - Working directory
 * @returns {object|null} Tokens object or null if not found
 */
export const loadTokens = (cwd = process.cwd()) => {
    const config = loadConfig(cwd);

    // Check config-specified tokens file first
    if (config?.tokensFile) {
        const tokenPath = path.join(cwd, config.tokensFile);
        if (existsSync(tokenPath)) {
            return readJsonSync(tokenPath);
        }
    }

    // Check standard token locations
    for (const tokenPath of STANDARD_TOKEN_PATHS) {
        const fullPath = path.join(cwd, tokenPath);
        if (existsSync(fullPath)) {
            return readJsonSync(fullPath);
        }
    }

    return null;
};

/**
 * Load design tokens with full multi-file support (async version)
 * Priority: 1) Legacy tokensFile, 2) New tokens config with source/include, 3) Standard locations
 * @param {string} [cwd=process.cwd()] - Working directory
 * @returns {Promise<object|null>} Tokens object or null if not found
 */
export async function loadTokensAsync(cwd = process.cwd()) {
    const config = loadConfig(cwd);

    // Priority 1: Legacy single file (backward compat)
    if (config?.tokensFile) {
        const tokenPath = path.join(cwd, config.tokensFile);
        if (existsSync(tokenPath)) {
            return readJsonSync(tokenPath);
        }
    }

    // Priority 2: New tokens config with source/include patterns
    if (config?.tokens && (config.tokens.source || config.tokens.include)) {
        const tokens = await loadTokensFromConfig(config.tokens, cwd);
        if (tokens) {
            return tokens;
        }
    }

    // Priority 3: Check standard token locations
    for (const tokenPath of STANDARD_TOKEN_PATHS) {
        const fullPath = path.join(cwd, tokenPath);
        if (existsSync(fullPath)) {
            return readJsonSync(fullPath);
        }
    }

    return null;
}

/**
 * Load tokens from a specific file path
 * @param {string} tokensFile - Relative path to tokens file
 * @param {string} [cwd=process.cwd()] - Working directory
 * @returns {object|null} Tokens object or null if not found
 */
export const loadTokensFromPath = (tokensFile, cwd = process.cwd()) => {
    const fullPath = path.join(cwd, tokensFile);
    if (existsSync(fullPath)) {
        return readJsonSync(fullPath);
    }
    return null;
};

/**
 * Resolve glob patterns to file paths (Style Dictionary pattern)
 * @param {string|string[]} patterns - Glob pattern(s) to match token files
 * @param {string} [cwd=process.cwd()] - Working directory
 * @returns {Promise<string[]>} Sorted absolute file paths
 */
export async function resolveTokenFiles(patterns, cwd = process.cwd()) {
    const patternArray = Array.isArray(patterns) ? patterns : [patterns];
    const files = await fg(patternArray, {
        cwd,
        absolute: true,
        onlyFiles: true,
        ignore: ['**/node_modules/**']
    });
    // Sort alphabetically for consistent merge order
    return files.sort();
}

/**
 * Load and merge tokens from multiple sources (Style Dictionary pattern)
 * Supports `include` (base/defaults loaded first) and `source` (overrides)
 * @param {object} tokensConfig - Configuration { include?: string[], source?: string[] }
 * @param {string} [cwd=process.cwd()] - Working directory
 * @returns {Promise<object|null>} Merged tokens or null if no files found
 */
export async function loadTokensFromConfig(tokensConfig, cwd = process.cwd()) {
    const tokenSets = [];

    // 1. Load "include" files first (base/defaults)
    if (tokensConfig.include) {
        const includeFiles = await resolveTokenFiles(tokensConfig.include, cwd);
        for (const file of includeFiles) {
            try {
                const tokens = readJsonSync(file);
                if (tokens) {
                    tokenSets.push(tokens);
                }
            } catch (err) {
                console.warn(`Warning: Could not load token file ${file}: ${err.message}`);
            }
        }
    }

    // 2. Load "source" files second (overrides include)
    if (tokensConfig.source) {
        const sourceFiles = await resolveTokenFiles(tokensConfig.source, cwd);
        for (const file of sourceFiles) {
            try {
                const tokens = readJsonSync(file);
                if (tokens) {
                    tokenSets.push(tokens);
                }
            } catch (err) {
                console.warn(`Warning: Could not load token file ${file}: ${err.message}`);
            }
        }
    }

    if (tokenSets.length === 0) {
        return null;
    }

    // Merge all token sets - later files override earlier ones
    return mergeTokens(...tokenSets);
}

/**
 * Get site branding configuration
 * @param {object} config - Stylescribe configuration
 * @returns {object} Branding configuration with name, logo, favicon, and resolved theme
 */
export const getBrandingConfig = (config) => {
    const themeConfig = config?.branding?.theme;
    const resolvedTheme = resolveTheme(themeConfig);

    return {
        name: config?.branding?.name || 'StyleScribe',
        logo: config?.branding?.logo || null,
        favicon: config?.branding?.favicon || null,
        theme: resolvedTheme,
        themeRaw: themeConfig // Keep raw config for reference
    };
};

/**
 * Get static assets folder path from config
 * @param {object} config - Stylescribe configuration
 * @returns {string|null} Static folder path or null if not configured
 */
export const getStaticFolder = (config) => {
    return config?.static || null;
};

/**
 * Get GitHub repository URL from package.json
 * @param {object} config - Stylescribe configuration
 * @param {string} [cwd=process.cwd()] - Working directory
 * @returns {string|null} GitHub URL or null if not configured/found
 */
export const getGithubUrl = (config, cwd = process.cwd()) => {
    // Check if github is enabled in config
    if (!config?.github) {
        return null;
    }

    // If github is a string URL, use it directly
    if (typeof config.github === 'string') {
        return config.github;
    }

    // If github is true, read from package.json
    const packagePath = path.join(cwd, 'package.json');
    if (!existsSync(packagePath)) {
        return null;
    }

    try {
        const pkg = readJsonSync(packagePath);
        const repo = pkg?.repository;

        if (!repo) {
            return null;
        }

        // Handle string format: "github:user/repo" or "https://github.com/user/repo"
        if (typeof repo === 'string') {
            if (repo.startsWith('github:')) {
                return `https://github.com/${repo.slice(7)}`;
            }
            if (repo.includes('github.com')) {
                return repo.replace(/\.git$/, '');
            }
            return repo;
        }

        // Handle object format: { type: "git", url: "..." }
        if (typeof repo === 'object' && repo.url) {
            let url = repo.url;
            // Convert git+https:// to https://
            url = url.replace(/^git\+/, '');
            // Remove .git suffix
            url = url.replace(/\.git$/, '');
            return url;
        }

        return null;
    } catch {
        return null;
    }
};

/**
 * Default class prefix used in component source files
 * Components should use this prefix when authoring CSS
 */
export const DEFAULT_CLASS_PREFIX = 'ds-';

/**
 * Get CSS class prefix for components
 * This prefix is used in generated HTML examples and interactive playgrounds
 * @param {object} config - Stylescribe configuration
 * @returns {string} Class prefix (e.g., 'rs-', 'ui-', etc.) - defaults to DEFAULT_CLASS_PREFIX
 */
export const getClassPrefix = (config) => {
    return config?.classPrefix || DEFAULT_CLASS_PREFIX;
};

/**
 * Get prefix for CSS custom properties (design tokens)
 * Uses the same classPrefix setting to namespace all CSS variables
 * @param {object} config - Stylescribe configuration
 * @returns {string} Token prefix (e.g., 'ds-', 'sol-') - defaults to DEFAULT_CLASS_PREFIX
 */
export const getTokenPrefix = (config) => {
    return config?.classPrefix || DEFAULT_CLASS_PREFIX;
};

/**
 * Transform CSS variable references to use the configured prefix
 * Converts var(--name) to var(--prefix-name)
 * @param {string} cssContent - CSS content with var(--name) references
 * @param {string} prefix - Token prefix to apply (e.g., 'ds-', 'sol-')
 * @returns {string} Transformed CSS content
 */
export const transformCssVariableReferences = (cssContent, prefix) => {
    if (!cssContent || !prefix) {
        return cssContent;
    }
    // Match var(--name) but avoid already-prefixed variables
    // Captures the variable name after -- and transforms it
    // Handles nested var() and fallback values like var(--color, var(--fallback))
    return cssContent.replace(/var\(--([a-zA-Z0-9_-]+)/g, (match, varName) => {
        // Skip if already prefixed
        if (varName.startsWith(prefix)) {
            return match;
        }
        return `var(--${prefix}${varName}`;
    });
};

/**
 * Transform CSS custom property declarations to use the configured prefix
 * Converts --name: value to --prefix-name: value
 * @param {string} cssContent - CSS content with --name declarations
 * @param {string} prefix - Token prefix to apply (e.g., 'ds-', 'sol-')
 * @returns {string} Transformed CSS content
 */
export const transformCssVariableDeclarations = (cssContent, prefix) => {
    if (!cssContent || !prefix) {
        return cssContent;
    }
    // Match CSS custom property declarations: --name: value;
    // Avoid matching var(--name) references
    return cssContent.replace(/(\s|^)(--([a-zA-Z0-9_-]+))(\s*:)/g, (match, leadingSpace, fullVar, varName, colon) => {
        // Skip if already prefixed
        if (varName.startsWith(prefix)) {
            return match;
        }
        return `${leadingSpace}--${prefix}${varName}${colon}`;
    });
};

/**
 * Transform CSS content by replacing the default prefix with the configured prefix
 * @param {string} cssContent - Original CSS content
 * @param {string} targetPrefix - The prefix to transform to
 * @returns {string} Transformed CSS content
 */
export const transformCssPrefix = (cssContent, targetPrefix) => {
    if (!targetPrefix || targetPrefix === DEFAULT_CLASS_PREFIX) {
        return cssContent;
    }
    // Replace all occurrences of the default prefix with the target prefix
    // Use word boundary to avoid partial replacements
    const regex = new RegExp(`\\.${DEFAULT_CLASS_PREFIX}`, 'g');
    return cssContent.replace(regex, `.${targetPrefix}`);
};

/**
 * Default build configuration
 */
const DEFAULT_BUILD_CONFIG = {
    bundles: {
        all: true,              // bundle.all.css
        perTheme: true,         // bundle.{theme}.css for each theme
        allComponents: true,    // all-components.css
        themes: true,           // themes.css (combined)
        themesIndividual: true  // themes/{name}.css (separate)
    }
};

/**
 * Get build configuration with defaults
 * @param {object} config - Stylescribe configuration
 * @returns {object} Build configuration
 */
export const getBuildConfig = (config) => {
    return {
        ...DEFAULT_BUILD_CONFIG,
        ...config?.build,
        bundles: {
            ...DEFAULT_BUILD_CONFIG.bundles,
            ...config?.build?.bundles
        }
    };
};

export default {
    loadConfig,
    getHeadIncludes,
    getComponentGroupOrder,
    getBlocksConfig,
    getPagesConfig,
    getProductionBasepath,
    getPackageFiles,
    loadTokens,
    loadTokensAsync,
    loadTokensFromPath,
    resolveTokenFiles,
    loadTokensFromConfig,
    getBrandingConfig,
    getStaticFolder,
    getGithubUrl,
    getClassPrefix,
    getTokenPrefix,
    transformCssPrefix,
    transformCssVariableReferences,
    transformCssVariableDeclarations,
    getBuildConfig,
    DEFAULT_CLASS_PREFIX
};
