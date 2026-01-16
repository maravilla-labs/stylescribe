// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Shadow Token Functions
 * Converts W3C DTCG shadow objects to CSS box-shadow strings
 *
 * W3C DTCG Shadow Format:
 * {
 *   "color": "#00000040" | "alpha({color.black}, 0.25)",
 *   "offsetX": "0px",
 *   "offsetY": "25px",
 *   "blur": "50px",
 *   "spread": "-12px",
 *   "inset": false  // optional
 * }
 *
 * Multiple shadows can be an array of shadow objects.
 */

/**
 * Check if a value is a W3C DTCG shadow object
 * @param {any} value - Value to check
 * @returns {boolean} True if it's a shadow object or array of shadows
 */
export function isShadowObject(value) {
    if (!value) {
        return false;
    }

    // Handle array of shadows
    if (Array.isArray(value)) {
        return value.length > 0 && value.every(isSingleShadowObject);
    }

    return isSingleShadowObject(value);
}

/**
 * Check if a value is a single shadow object
 * @param {any} value - Value to check
 * @returns {boolean} True if it's a shadow object
 */
function isSingleShadowObject(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }

    // Must have at least color and one offset
    // W3C DTCG requires: color, offsetX, offsetY, blur, spread
    // We'll be lenient and require at least color + offsetX or offsetY
    const hasColor = value.color !== undefined;
    const hasOffset = value.offsetX !== undefined || value.offsetY !== undefined;

    return hasColor && hasOffset;
}

/**
 * Convert a single W3C DTCG shadow object to CSS
 * @param {object} shadow - Shadow object
 * @param {function} resolveValue - Function to resolve token references and functions
 * @returns {string} CSS box-shadow value
 */
function singleShadowToCSS(shadow, resolveValue = (v) => v) {
    const inset = shadow.inset ? 'inset ' : '';
    const offsetX = resolveValue(shadow.offsetX || '0px');
    const offsetY = resolveValue(shadow.offsetY || '0px');
    const blur = resolveValue(shadow.blur || '0px');
    const spread = resolveValue(shadow.spread || '0px');
    const color = resolveValue(shadow.color);

    // CSS box-shadow format: [inset] offset-x offset-y blur spread color
    return `${inset}${offsetX} ${offsetY} ${blur} ${spread} ${color}`.trim();
}

/**
 * Convert W3C DTCG shadow object(s) to CSS box-shadow string
 * @param {object|array} shadow - Shadow object or array of shadow objects
 * @param {function} resolveValue - Function to resolve token references and functions
 * @returns {string} CSS box-shadow string
 */
export function shadowToCSS(shadow, resolveValue = (v) => v) {
    if (!isShadowObject(shadow)) {
        return null;
    }

    // Handle array of shadows (layered shadows)
    if (Array.isArray(shadow)) {
        return shadow.map(s => singleShadowToCSS(s, resolveValue)).join(', ');
    }

    return singleShadowToCSS(shadow, resolveValue);
}

/**
 * Process a shadow token value
 * If it's a shadow object, convert to CSS. Otherwise return as-is.
 * @param {any} value - Token value (object, array, or string)
 * @param {function} resolveValue - Function to resolve token references and functions
 * @returns {string} CSS box-shadow string or original value
 */
export function processShadow(value, resolveValue = (v) => v) {
    // If it's already a CSS shadow string, return as-is
    if (typeof value === 'string') {
        return value;
    }

    // If it's a shadow object or array, convert to CSS
    if (isShadowObject(value)) {
        return shadowToCSS(value, resolveValue);
    }

    return value;
}
