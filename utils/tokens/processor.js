// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Token Function Processor
 * Processes function calls in design token values at build time
 */

import { parseFunction, isFunction } from './parser.js';
import * as colorFunctions from './functions/color.js';
import * as contrastFunctions from './functions/contrast.js';
import * as typographyFunctions from './functions/typography.js';
import * as mathFunctions from './functions/math.js';

/**
 * Registry of all available token functions
 */
const FUNCTION_REGISTRY = {
    // Color functions
    tint: colorFunctions.tint,
    shade: colorFunctions.shade,
    mix: colorFunctions.mix,
    adjust: colorFunctions.adjust,
    alpha: colorFunctions.alpha,
    complement: colorFunctions.complement,
    saturate: colorFunctions.saturate,
    desaturate: colorFunctions.desaturate,
    invert: colorFunctions.invert,
    grayscale: colorFunctions.grayscale,
    darkMode: colorFunctions.darkMode,
    colorScale: colorFunctions.colorScale,
    lighten: colorFunctions.lighten,
    darken: colorFunctions.darken,
    hueRotate: colorFunctions.hueRotate,

    // Contrast functions
    contrastRatio: contrastFunctions.contrastRatio,
    meetsContrast: contrastFunctions.meetsContrast,
    accessibleText: contrastFunctions.accessibleText,
    ensureContrast: contrastFunctions.ensureContrast,
    luminance: contrastFunctions.luminance,
    isLight: contrastFunctions.isLight,
    isDark: contrastFunctions.isDark,
    accessiblePair: contrastFunctions.accessiblePair,

    // Typography functions
    fluidType: typographyFunctions.fluidType,
    modularScale: typographyFunctions.modularScale,
    typeScale: typographyFunctions.typeScale,
    fluidSpace: typographyFunctions.fluidSpace,
    lineHeight: typographyFunctions.lineHeight,
    optimalMeasure: typographyFunctions.optimalMeasure,
    responsiveType: typographyFunctions.responsiveType,
    letterSpacing: typographyFunctions.letterSpacing,

    // Math functions
    multiply: mathFunctions.multiply,
    divide: mathFunctions.divide,
    add: mathFunctions.add,
    subtract: mathFunctions.subtract,
    round: mathFunctions.round,
    floor: mathFunctions.floor,
    ceil: mathFunctions.ceil,
    min: mathFunctions.min,
    max: mathFunctions.max,
    clamp: mathFunctions.clamp,
    convert: mathFunctions.convert,
    mod: mathFunctions.mod,
    abs: mathFunctions.abs,
    negate: mathFunctions.negate,
    percent: mathFunctions.percent,
};

/**
 * Pattern to detect token references like {color.primary.500}
 */
const TOKEN_REF_PATTERN = /\{([^}]+)\}/g;

/**
 * Resolve token references in a value
 * @param {string} value - Value that may contain references
 * @param {object} tokens - Token tree to resolve from
 * @param {Set} visited - Visited paths for cycle detection
 * @returns {string} Value with references resolved
 */
function resolveReferences(value, tokens, visited = new Set()) {
    if (typeof value !== 'string') {
        return value;
    }

    return value.replace(TOKEN_REF_PATTERN, (match, path) => {
        // Check for cycles
        if (visited.has(path)) {
            console.warn(`Circular token reference detected: ${path}`);
            return match;
        }

        const resolved = getTokenValue(tokens, path);
        if (resolved === undefined) {
            console.warn(`Unresolved token reference: ${path}`);
            return match;
        }

        // Recursively resolve nested references
        visited.add(path);
        const result = resolveReferences(String(resolved), tokens, visited);
        visited.delete(path);

        return result;
    });
}

/**
 * Get a token value by dot-notation path
 * @param {object} tokens - Token tree
 * @param {string} path - Dot-notation path (e.g., 'color.primary.500')
 * @returns {*} Token value or undefined
 */
function getTokenValue(tokens, path) {
    const parts = path.split('.');
    let current = tokens;

    for (const part of parts) {
        if (current === undefined || current === null) {
            return undefined;
        }
        current = current[part];
    }

    // If we found a token object, extract the $value
    if (current && typeof current === 'object' && current.$value !== undefined) {
        return current.$value;
    }

    return current;
}

/**
 * Process a single function call
 * @param {string} value - Value containing function call
 * @param {object} tokens - Token tree for reference resolution
 * @param {Set} processingStack - Stack for detecting recursive function calls
 * @returns {*} Resolved value
 */
function processSingleFunction(value, tokens, processingStack = new Set()) {
    const parsed = parseFunction(value);

    if (!parsed) {
        return value;
    }

    const { name, args } = parsed;
    const fn = FUNCTION_REGISTRY[name];

    if (!fn) {
        console.warn(`Unknown token function: ${name}`);
        return value;
    }

    // Detect recursive function processing
    const callSignature = `${name}(${args.join(',')})`;
    if (processingStack.has(callSignature)) {
        console.warn(`Recursive function call detected: ${callSignature}`);
        return value;
    }

    processingStack.add(callSignature);

    try {
        // Process arguments: resolve references and nested functions
        const processedArgs = args.map((arg) => {
            // First resolve token references
            let resolved = resolveReferences(arg, tokens);

            // Then process nested functions recursively
            if (isFunction(resolved)) {
                resolved = processSingleFunction(resolved, tokens, processingStack);
            }

            return resolved;
        });

        // Call the function with processed arguments
        const result = fn(...processedArgs);

        processingStack.delete(callSignature);
        return result;
    } catch (error) {
        console.error(`Error processing function ${name}(${args.join(', ')}):`, error.message);
        processingStack.delete(callSignature);
        return value;
    }
}

/**
 * Process token value, resolving any function calls
 * Main entry point for token function processing
 * @param {string} value - Token value potentially containing functions
 * @param {object} tokens - Full token tree for reference resolution
 * @returns {*} Resolved static value
 */
export function processTokenFunctions(value, tokens = {}) {
    if (typeof value !== 'string') {
        return value;
    }

    // First resolve any token references
    let resolved = resolveReferences(value, tokens);

    // Then process function calls
    if (isFunction(resolved)) {
        resolved = processSingleFunction(resolved, tokens);
    }

    return resolved;
}

/**
 * Process all tokens in a token tree
 * Recursively processes all $value fields containing functions
 * @param {object} tokens - Token tree
 * @param {object} options - Processing options
 * @returns {object} Processed token tree with resolved values
 */
export function processAllTokens(tokens, options = {}) {
    const result = {};

    for (const [key, value] of Object.entries(tokens)) {
        // Skip metadata keys
        if (key.startsWith('$')) {
            result[key] = value;
            continue;
        }

        if (value && typeof value === 'object') {
            if (value.$value !== undefined) {
                // This is a token - process its value
                result[key] = {
                    ...value,
                    $value: processTokenFunctions(value.$value, tokens),
                };

                // Store original for reference
                if (value.$value !== result[key].$value) {
                    result[key].$original = value.$value;
                }
            } else {
                // This is a group - recurse
                result[key] = processAllTokens(value, options);
            }
        } else {
            result[key] = value;
        }
    }

    return result;
}

/**
 * Check if token functions are enabled for a token set
 * @param {object} tokens - Token tree with $meta
 * @returns {boolean} Whether functions should be processed
 */
export function areFunctionsEnabled(tokens) {
    if (tokens.$meta && tokens.$meta.functions === false) {
        return false;
    }
    return true;
}

/**
 * Get list of available function names
 * @returns {string[]} Array of function names
 */
export function getAvailableFunctions() {
    return Object.keys(FUNCTION_REGISTRY);
}

/**
 * Register a custom function
 * @param {string} name - Function name
 * @param {Function} fn - Function implementation
 */
export function registerFunction(name, fn) {
    if (typeof fn !== 'function') {
        throw new Error(`registerFunction: expected function, got ${typeof fn}`);
    }
    FUNCTION_REGISTRY[name] = fn;
}

/**
 * Unregister a function
 * @param {string} name - Function name to remove
 */
export function unregisterFunction(name) {
    delete FUNCTION_REGISTRY[name];
}

export { isFunction, parseFunction } from './parser.js';
