// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Icon Token Functions
 * Resolves SVG icon paths from npm packages to base64 data URIs
 */

import path from 'path';
import { existsSync, readFileSync } from '../../fs.js';

/**
 * Resolve an icon path (with ~ prefix) to a base64 data URI
 * @param {string} value - Icon path like "~bootstrap-icons/icons/trash.svg"
 * @returns {string} CSS url() with base64 encoded SVG data URI
 */
export function resolveIconPath(value) {
    if (!value || typeof value !== 'string') {
        return value;
    }

    // Handle ~ prefix for node_modules
    if (value.startsWith('~')) {
        const npmPath = value.substring(1);
        const fullPath = path.resolve(process.cwd(), 'node_modules', npmPath);

        if (!existsSync(fullPath)) {
            console.warn(`Icon not found: ${fullPath}`);
            return value;
        }

        try {
            const svgContent = readFileSync(fullPath, 'utf8');
            const base64 = Buffer.from(svgContent).toString('base64');
            return `url("data:image/svg+xml;base64,${base64}")`;
        } catch (error) {
            console.error(`Error reading icon file ${fullPath}:`, error.message);
            return value;
        }
    }

    // Handle relative paths (for custom SVGs in project)
    if (value.endsWith('.svg')) {
        const fullPath = path.resolve(process.cwd(), value);

        if (!existsSync(fullPath)) {
            console.warn(`Icon not found: ${fullPath}`);
            return value;
        }

        try {
            const svgContent = readFileSync(fullPath, 'utf8');
            const base64 = Buffer.from(svgContent).toString('base64');
            return `url("data:image/svg+xml;base64,${base64}")`;
        } catch (error) {
            console.error(`Error reading icon file ${fullPath}:`, error.message);
            return value;
        }
    }

    return value;
}

/**
 * Check if a value is an icon path
 * @param {string} value - Value to check
 * @returns {boolean} True if it looks like an icon path
 */
export function isIconPath(value) {
    if (!value || typeof value !== 'string') {
        return false;
    }
    return value.startsWith('~') && value.endsWith('.svg');
}

/**
 * Get the raw SVG content from an icon path
 * @param {string} value - Icon path like "~bootstrap-icons/icons/trash.svg"
 * @returns {string|null} Raw SVG content or null if not found
 */
export function getRawSvg(value) {
    if (!value || typeof value !== 'string') {
        return null;
    }

    let fullPath;

    if (value.startsWith('~')) {
        const npmPath = value.substring(1);
        fullPath = path.resolve(process.cwd(), 'node_modules', npmPath);
    } else if (value.endsWith('.svg')) {
        fullPath = path.resolve(process.cwd(), value);
    } else {
        return null;
    }

    if (!existsSync(fullPath)) {
        return null;
    }

    try {
        return readFileSync(fullPath, 'utf8');
    } catch {
        return null;
    }
}
