// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Design Token Functions Registry
 * Exports all available functions for token value processing
 */

// Color manipulation functions
export {
    tint,
    shade,
    mix,
    adjust,
    alpha,
    complement,
    saturate,
    desaturate,
    invert,
    grayscale,
    darkMode,
    colorScale,
    lighten,
    darken,
    hueRotate,
} from './color.js';

// Contrast and accessibility functions
export {
    contrastRatio,
    meetsContrast,
    accessibleText,
    ensureContrast,
    luminance,
    isLight,
    isDark,
    accessiblePair,
} from './contrast.js';

// Typography functions
export {
    fluidType,
    modularScale,
    typeScale,
    fluidSpace,
    lineHeight,
    optimalMeasure,
    responsiveType,
    letterSpacing,
    SCALE_RATIOS,
} from './typography.js';

// Math functions
export {
    multiply,
    divide,
    add,
    subtract,
    round,
    floor,
    ceil,
    min,
    max,
    clamp,
    convert,
    mod,
    abs,
    negate,
    percent,
} from './math.js';

/**
 * Get all available function names
 * @returns {string[]} Array of function names
 */
export function getAvailableFunctions() {
    return [
        // Color
        'tint',
        'shade',
        'mix',
        'adjust',
        'alpha',
        'complement',
        'saturate',
        'desaturate',
        'invert',
        'grayscale',
        'darkMode',
        'colorScale',
        'lighten',
        'darken',
        'hueRotate',
        // Contrast
        'contrastRatio',
        'meetsContrast',
        'accessibleText',
        'ensureContrast',
        'luminance',
        'isLight',
        'isDark',
        'accessiblePair',
        // Typography
        'fluidType',
        'modularScale',
        'typeScale',
        'fluidSpace',
        'lineHeight',
        'optimalMeasure',
        'responsiveType',
        'letterSpacing',
        // Math
        'multiply',
        'divide',
        'add',
        'subtract',
        'round',
        'floor',
        'ceil',
        'min',
        'max',
        'clamp',
        'convert',
        'mod',
        'abs',
        'negate',
        'percent',
    ];
}

/**
 * Get function documentation
 * @returns {object} Documentation object with categories
 */
export function getFunctionDocs() {
    return {
        color: {
            tint: { signature: 'tint(color, amount%)', description: 'Lighten color in OKLCH' },
            shade: { signature: 'shade(color, amount%)', description: 'Darken color in OKLCH' },
            mix: { signature: 'mix(color1, color2, ratio)', description: 'Blend two colors' },
            adjust: {
                signature: 'adjust(color, {l, c, h})',
                description: 'Adjust OKLCH properties',
            },
            alpha: { signature: 'alpha(color, opacity)', description: 'Set transparency' },
            complement: { signature: 'complement(color)', description: '180deg hue shift' },
            saturate: { signature: 'saturate(color, amount%)', description: 'Increase chroma' },
            desaturate: { signature: 'desaturate(color, amount%)', description: 'Decrease chroma' },
            invert: { signature: 'invert(color)', description: 'Invert lightness' },
            grayscale: { signature: 'grayscale(color)', description: 'Remove color' },
            darkMode: { signature: 'darkMode(color)', description: 'Auto dark mode variant' },
            colorScale: { signature: 'colorScale(base, steps)', description: 'Generate N-step scale' },
            lighten: { signature: 'lighten(color, amount%)', description: 'Add lightness' },
            darken: { signature: 'darken(color, amount%)', description: 'Reduce lightness' },
            hueRotate: { signature: 'hueRotate(color, degrees)', description: 'Rotate hue' },
        },
        contrast: {
            contrastRatio: { signature: 'contrastRatio(fg, bg)', description: 'WCAG contrast ratio' },
            meetsContrast: {
                signature: 'meetsContrast(fg, bg, level)',
                description: 'Check AA/AAA compliance',
            },
            accessibleText: {
                signature: 'accessibleText(bg)',
                description: 'Find accessible text color',
            },
            ensureContrast: {
                signature: 'ensureContrast(color, against, min)',
                description: 'Adjust to meet contrast',
            },
            luminance: { signature: 'luminance(color)', description: 'Get relative luminance' },
            isLight: { signature: 'isLight(color)', description: 'Check if light (L > 0.5)' },
            isDark: { signature: 'isDark(color)', description: 'Check if dark (L <= 0.5)' },
            accessiblePair: {
                signature: 'accessiblePair(color, level)',
                description: 'Get bg + text pair',
            },
        },
        typography: {
            fluidType: {
                signature: 'fluidType(min, max, minVp, maxVp)',
                description: 'CSS clamp() for fluid type',
            },
            modularScale: {
                signature: 'modularScale(base, step, ratio)',
                description: 'Scale by ratio',
            },
            typeScale: {
                signature: 'typeScale(base, ratio, steps)',
                description: 'Full type scale',
            },
            fluidSpace: { signature: 'fluidSpace(min, max)', description: 'Fluid spacing clamp' },
            lineHeight: {
                signature: 'lineHeight(fontSize, base)',
                description: 'Calculate line height',
            },
            optimalMeasure: {
                signature: 'optimalMeasure(fontSize)',
                description: 'Optimal line length',
            },
            letterSpacing: {
                signature: 'letterSpacing(fontSize)',
                description: 'Calculate tracking',
            },
        },
        math: {
            multiply: { signature: 'multiply(value, factor)', description: 'Multiply dimension' },
            divide: { signature: 'divide(value, divisor)', description: 'Divide dimension' },
            add: { signature: 'add(val1, val2)', description: 'Add dimensions' },
            subtract: { signature: 'subtract(val1, val2)', description: 'Subtract dimensions' },
            round: { signature: 'round(value, precision)', description: 'Round to decimals' },
            floor: { signature: 'floor(value, precision)', description: 'Round down' },
            ceil: { signature: 'ceil(value, precision)', description: 'Round up' },
            min: { signature: 'min(val1, val2)', description: 'Get smaller value' },
            max: { signature: 'max(val1, val2)', description: 'Get larger value' },
            clamp: { signature: 'clamp(value, min, max)', description: 'Clamp between bounds' },
            convert: { signature: 'convert(value, toUnit)', description: 'Unit conversion' },
            mod: { signature: 'mod(value, divisor)', description: 'Get remainder' },
            abs: { signature: 'abs(value)', description: 'Absolute value' },
            negate: { signature: 'negate(value)', description: 'Negate value' },
            percent: { signature: 'percent(value, pct)', description: 'Percentage of value' },
        },
    };
}
