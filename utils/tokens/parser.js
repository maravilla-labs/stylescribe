// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Function syntax parser for design token values
 * Parses function calls like: tint({color.primary}, 80%)
 */

// Pattern to detect function calls - matches functionName(args)
const FUNCTION_PATTERN = /^([a-zA-Z][a-zA-Z0-9]*)\((.*)\)$/s;

// Pattern to split arguments, respecting nested parentheses and braces
const ARG_SPLIT_PATTERN = /,(?![^{]*}|[^(]*\))/;

/**
 * Parse a token value to extract function call information
 * @param {string} value - Token value that may contain a function call
 * @returns {object|null} Parsed function info { name, args, raw } or null if not a function
 */
export function parseFunction(value) {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    const match = trimmed.match(FUNCTION_PATTERN);

    if (!match) {
        return null;
    }

    const [, name, argsString] = match;
    const args = parseArguments(argsString);

    return {
        name,
        args,
        raw: trimmed,
    };
}

/**
 * Parse function arguments string into array of individual arguments
 * Handles nested functions, token references, and objects
 * @param {string} argsString - Comma-separated arguments string
 * @returns {string[]} Array of trimmed argument strings
 */
export function parseArguments(argsString) {
    if (!argsString || argsString.trim() === '') {
        return [];
    }

    const args = [];
    let current = '';
    let depth = 0;
    let braceDepth = 0;

    for (let i = 0; i < argsString.length; i++) {
        const char = argsString[i];

        if (char === '(' || char === '{') {
            depth += char === '(' ? 1 : 0;
            braceDepth += char === '{' ? 1 : 0;
            current += char;
        } else if (char === ')' || char === '}') {
            depth -= char === ')' ? 1 : 0;
            braceDepth -= char === '}' ? 1 : 0;
            current += char;
        } else if (char === ',' && depth === 0 && braceDepth === 0) {
            args.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    // Don't forget the last argument
    if (current.trim()) {
        args.push(current.trim());
    }

    return args;
}

/**
 * Check if a value contains a function call
 * @param {string} value - Token value to check
 * @returns {boolean} True if value is a function call
 */
export function isFunction(value) {
    if (typeof value !== 'string') {
        return false;
    }
    return FUNCTION_PATTERN.test(value.trim());
}

/**
 * Parse a percentage value to a decimal (0-1)
 * @param {string} value - Value like "80%" or "0.8"
 * @returns {number} Decimal value
 */
export function parsePercentage(value) {
    const trimmed = String(value).trim();
    if (trimmed.endsWith('%')) {
        return parseFloat(trimmed) / 100;
    }
    return parseFloat(trimmed);
}

/**
 * Parse a dimension value to extract number and unit
 * @param {string} value - Dimension like "16px", "1rem", "2em"
 * @returns {object} { value: number, unit: string }
 */
export function parseDimension(value) {
    const trimmed = String(value).trim();
    const match = trimmed.match(/^(-?[\d.]+)([a-z%]+)?$/i);

    if (!match) {
        return { value: parseFloat(trimmed) || 0, unit: '' };
    }

    return {
        value: parseFloat(match[1]),
        unit: match[2] || '',
    };
}

/**
 * Format a dimension value back to string
 * @param {number} value - Numeric value
 * @param {string} unit - Unit string
 * @param {number} precision - Decimal precision (default 4)
 * @returns {string} Formatted dimension
 */
export function formatDimension(value, unit, precision = 4) {
    // Round to avoid floating point issues
    const rounded = Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
    return `${rounded}${unit}`;
}

/**
 * Parse an object literal from function argument
 * Handles simple object syntax like { l: 10, c: -5, h: 0 }
 * @param {string} objString - Object string
 * @returns {object} Parsed object
 */
export function parseObjectArg(objString) {
    const trimmed = objString.trim();

    // Check if it's an object literal
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
        return null;
    }

    // Remove braces and parse key-value pairs
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) {
        return {};
    }

    const result = {};
    const pairs = inner.split(',');

    for (const pair of pairs) {
        const [key, value] = pair.split(':').map((s) => s.trim());
        if (key && value !== undefined) {
            // Parse numeric values
            const numValue = parseFloat(value);
            result[key] = isNaN(numValue) ? value : numValue;
        }
    }

    return result;
}
