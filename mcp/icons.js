// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Icon Discovery Utilities for MCP and CLI
 *
 * Helps AI agents and users discover available SVG icons from npm packages
 */

import path from 'path';
import { existsSync, readdirSync } from '../utils/fs.js';

/**
 * Known icon package configurations
 * Maps package names to their icon directory structure
 */
const ICON_PACKAGES = {
    'bootstrap-icons': {
        name: 'Bootstrap Icons',
        iconsDir: 'icons',
        pathPattern: '~bootstrap-icons/icons/{name}.svg',
        website: 'https://icons.getbootstrap.com/',
    },
    'lucide-static': {
        name: 'Lucide',
        iconsDir: 'icons',
        pathPattern: '~lucide-static/icons/{name}.svg',
        website: 'https://lucide.dev/',
    },
    heroicons: {
        name: 'Heroicons',
        iconsDir: '24/outline',
        pathPattern: '~heroicons/24/outline/{name}.svg',
        website: 'https://heroicons.com/',
        variants: ['24/outline', '24/solid', '20/solid'],
    },
    'feather-icons': {
        name: 'Feather Icons',
        iconsDir: 'dist/icons',
        pathPattern: '~feather-icons/dist/icons/{name}.svg',
        website: 'https://feathericons.com/',
    },
    '@tabler/icons': {
        name: 'Tabler Icons',
        iconsDir: 'icons',
        pathPattern: '~@tabler/icons/icons/{name}.svg',
        website: 'https://tabler-icons.io/',
    },
};

/**
 * List all installed icon packages
 * @param {string} cwd - Working directory (defaults to process.cwd())
 * @returns {Array} Array of installed package info
 */
export function listInstalledIconPackages(cwd = process.cwd()) {
    const installed = [];

    for (const [packageName, config] of Object.entries(ICON_PACKAGES)) {
        const packagePath = path.resolve(cwd, 'node_modules', packageName);
        const iconsPath = path.join(packagePath, config.iconsDir);

        if (existsSync(iconsPath)) {
            const icons = getIconsFromDir(iconsPath);
            installed.push({
                package: packageName,
                name: config.name,
                count: icons.length,
                pathPattern: config.pathPattern,
                website: config.website,
            });
        }
    }

    return installed;
}

/**
 * Get all icon names from a directory
 * @param {string} dir - Directory path
 * @returns {string[]} Array of icon names (without .svg extension)
 */
function getIconsFromDir(dir) {
    try {
        const files = readdirSync(dir);
        return files.filter((f) => f.endsWith('.svg')).map((f) => f.replace('.svg', ''));
    } catch {
        return [];
    }
}

/**
 * Discover all icons from a specific package
 * @param {string} packageName - Package name (e.g., 'bootstrap-icons')
 * @param {string} cwd - Working directory
 * @returns {object|null} Package info with icons, or null if not found
 */
export function discoverIcons(packageName, cwd = process.cwd()) {
    const config = ICON_PACKAGES[packageName];
    if (!config) {
        return null;
    }

    const packagePath = path.resolve(cwd, 'node_modules', packageName);
    const iconsPath = path.join(packagePath, config.iconsDir);

    if (!existsSync(iconsPath)) {
        return null;
    }

    const icons = getIconsFromDir(iconsPath);

    return {
        package: packageName,
        name: config.name,
        basePath: `~${packageName}/${config.iconsDir}/`,
        pathPattern: config.pathPattern,
        website: config.website,
        icons,
        count: icons.length,
        example: icons.length > 0 ? `~${packageName}/${config.iconsDir}/${icons[0]}.svg` : null,
    };
}

/**
 * Search for icons by name across all installed packages
 * @param {string} query - Search query
 * @param {string} cwd - Working directory
 * @returns {Array} Matching icons with package and path info
 */
export function searchIcons(query, cwd = process.cwd()) {
    const results = [];
    const queryLower = query.toLowerCase();

    for (const [packageName, config] of Object.entries(ICON_PACKAGES)) {
        const packagePath = path.resolve(cwd, 'node_modules', packageName);
        const iconsPath = path.join(packagePath, config.iconsDir);

        if (!existsSync(iconsPath)) {
            continue;
        }

        const icons = getIconsFromDir(iconsPath);
        const matches = icons.filter((name) => name.toLowerCase().includes(queryLower));

        for (const iconName of matches) {
            results.push({
                name: iconName,
                package: packageName,
                packageName: config.name,
                path: `~${packageName}/${config.iconsDir}/${iconName}.svg`,
            });
        }
    }

    // Sort by relevance (exact matches first, then by name length)
    results.sort((a, b) => {
        const aExact = a.name.toLowerCase() === queryLower;
        const bExact = b.name.toLowerCase() === queryLower;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.name.length - b.name.length;
    });

    return results;
}

/**
 * Get the token path for a specific icon
 * @param {string} packageName - Package name
 * @param {string} iconName - Icon name
 * @returns {string|null} Token path or null if package not found
 */
export function getIconPath(packageName, iconName) {
    const config = ICON_PACKAGES[packageName];
    if (!config) {
        return null;
    }
    return `~${packageName}/${config.iconsDir}/${iconName}.svg`;
}

/**
 * Get a formatted list of supported icon packages for documentation
 * @returns {string} Markdown formatted list
 */
export function getSupportedPackagesDoc() {
    let doc = '| Package | NPM Install | Path Pattern |\n';
    doc += '|---------|-------------|---------------|\n';

    for (const [packageName, config] of Object.entries(ICON_PACKAGES)) {
        doc += `| ${config.name} | \`npm i ${packageName}\` | \`${config.pathPattern}\` |\n`;
    }

    return doc;
}

/**
 * Generate example token JSON for an icon
 * @param {string} semanticName - Semantic name for the icon (e.g., "delete")
 * @param {string} packageName - Package name
 * @param {string} iconName - Icon name in the package
 * @param {string} description - Optional description
 * @returns {object} Token object
 */
export function generateIconToken(semanticName, packageName, iconName, description = '') {
    const iconPath = getIconPath(packageName, iconName);
    if (!iconPath) {
        return null;
    }

    return {
        [semanticName]: {
            $value: iconPath,
            $type: 'icon',
            $description: description || `${semanticName} icon`,
        },
    };
}

export { ICON_PACKAGES };
