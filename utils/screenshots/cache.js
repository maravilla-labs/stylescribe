// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Screenshot cache management
 * Uses content hashing to detect changes and avoid unnecessary regeneration
 */
import crypto from 'crypto';
import path from 'path';
import { existsSync, readFileSync, writeFileSync, ensureDir } from '../fs.js';

const CACHE_VERSION = 1;

/**
 * Load cache from file
 * @param {string} cacheFile - Path to cache file
 * @returns {Object} Cache object
 */
export function loadCache(cacheFile) {
    if (!existsSync(cacheFile)) {
        return {
            version: CACHE_VERSION,
            items: {}
        };
    }

    try {
        const content = readFileSync(cacheFile);
        const cache = JSON.parse(content);

        // Check version compatibility
        if (cache.version !== CACHE_VERSION) {
            console.log('Cache version mismatch, rebuilding...');
            return {
                version: CACHE_VERSION,
                items: {}
            };
        }

        return cache;
    } catch (error) {
        console.warn('Failed to load cache, starting fresh:', error.message);
        return {
            version: CACHE_VERSION,
            items: {}
        };
    }
}

/**
 * Save cache to file
 * @param {string} cacheFile - Path to cache file
 * @param {Object} cache - Cache object to save
 */
export function saveCache(cacheFile, cache) {
    try {
        ensureDir(path.dirname(cacheFile));
        writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
    } catch (error) {
        console.warn('Failed to save cache:', error.message);
    }
}

/**
 * Check if an item has changed since last screenshot
 * @param {Object} item - Item to check
 * @param {Object} cache - Cache object
 * @returns {boolean} True if item has changed
 */
export function hasChanged(item, cache) {
    const cacheKey = `${item.itemType}:${item.name}`;
    const cached = cache.items?.[cacheKey];

    if (!cached) {
        return true; // Not in cache, needs generation
    }

    const currentHash = generateItemHash(item);
    return cached.hash !== currentHash;
}

/**
 * Generate a hash for an item based on its content
 * @param {Object} item - Item to hash
 * @returns {string} Hash string
 */
export function generateItemHash(item) {
    // Include relevant content that would affect the screenshot
    const content = JSON.stringify({
        name: item.name,
        type: item.itemType,
        // For components, hash the first example
        examples: item.examples ? item.examples.slice(0, 1).map(e => e.code) : null,
        // For blocks/pages, hash the html
        html: item.html,
        // Include variation info as it might affect default display
        variations: item.variations ? item.variations.slice(0, 3) : null,
        // Include dependencies as they affect styling
        dependencies: item.dependencies
    });

    return crypto
        .createHash('sha256')
        .update(content)
        .digest('hex')
        .slice(0, 16);
}

/**
 * Clear cache for specific items or all
 * @param {string} cacheFile - Path to cache file
 * @param {Array} items - Items to clear (null for all)
 */
export function clearCache(cacheFile, items = null) {
    if (items === null) {
        // Clear entire cache
        if (existsSync(cacheFile)) {
            writeFileSync(cacheFile, JSON.stringify({
                version: CACHE_VERSION,
                items: {}
            }, null, 2));
        }
        return;
    }

    // Clear specific items
    const cache = loadCache(cacheFile);
    items.forEach(item => {
        const cacheKey = `${item.itemType}:${item.name}`;
        delete cache.items[cacheKey];
    });
    saveCache(cacheFile, cache);
}

export default {
    loadCache,
    saveCache,
    hasChanged,
    generateItemHash,
    clearCache
};
