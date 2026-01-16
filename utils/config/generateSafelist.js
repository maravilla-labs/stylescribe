// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Generate Tailwind CSS safelist from theme presets
 * Creates a .hbs file that Tailwind can scan to generate all theme classes
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { THEME_PRESETS } from './themePresets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract all unique Tailwind classes from theme presets
 * @returns {string[]} Sorted array of unique class names
 */
export function extractThemeClasses() {
    const classes = new Set();

    for (const theme of Object.values(THEME_PRESETS)) {
        for (const [key, section] of Object.entries(theme)) {
            // Skip non-class values like 'accent' which is a hex color
            if (key === 'accent') {
                continue;
            }

            if (typeof section === 'object') {
                for (const classString of Object.values(section)) {
                    if (typeof classString === 'string') {
                        // Split class string and add each class
                        classString.split(/\s+/).forEach(cls => {
                            if (cls && cls.trim()) {
                                classes.add(cls.trim());
                            }
                        });
                    }
                }
            }
        }
    }

    return Array.from(classes).sort();
}

/**
 * Generate safelist.hbs file with all theme classes
 * @param {string} [outputPath] - Output path for the safelist file
 * @returns {number} Number of classes generated
 */
export function generateSafelistFile(outputPath) {
    const classes = extractThemeClasses();

    // Default to templates/includes/theme-safelist.hbs
    if (!outputPath) {
        outputPath = path.join(__dirname, '..', '..', 'templates', 'includes', 'theme-safelist.hbs');
    }

    const content = `{{!--
  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
  This file ensures Tailwind CSS generates all theme preset classes.
  Generated from utils/config/themePresets.js

  To regenerate, run the build command or call generateSafelistFile()
--}}
<div class="hidden" aria-hidden="true">
${classes.map(cls => `  <span class="${cls}"></span>`).join('\n')}
</div>
`;

    writeFileSync(outputPath, content);
    return classes.length;
}

/**
 * Get the default safelist output path
 * @returns {string} Default path to theme-safelist.hbs
 */
export function getDefaultSafelistPath() {
    return path.join(__dirname, '..', '..', 'templates', 'includes', 'theme-safelist.hbs');
}

export default {
    extractThemeClasses,
    generateSafelistFile,
    getDefaultSafelistPath
};
