// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Math functions for dimension calculations in design tokens
 */

import { parseDimension, formatDimension } from '../parser.js';

/**
 * Unit conversion factors to pixels
 */
const UNIT_TO_PX = {
    px: 1,
    rem: 16,
    em: 16,
    pt: 96 / 72,
    pc: 16,
    in: 96,
    cm: 96 / 2.54,
    mm: 96 / 25.4,
};

/**
 * Multiply a dimension value
 * @param {string} value - Dimension (e.g., '1rem', '16px')
 * @param {string|number} multiplier - Multiplication factor
 * @returns {string} Multiplied value with unit
 */
export function multiply(value, multiplier) {
    const { value: num, unit } = parseDimension(value);
    const factor = parseFloat(multiplier);

    return formatDimension(num * factor, unit);
}

/**
 * Divide a dimension value
 * @param {string} value - Dimension
 * @param {string|number} divisor - Division factor
 * @returns {string} Divided value with unit
 */
export function divide(value, divisor) {
    const { value: num, unit } = parseDimension(value);
    const factor = parseFloat(divisor);

    if (factor === 0) {
        throw new Error('Division by zero');
    }

    return formatDimension(num / factor, unit);
}

/**
 * Add two dimension values
 * If units differ, converts to the first value's unit
 * @param {string} value1 - First dimension
 * @param {string} value2 - Second dimension
 * @returns {string} Sum with unit
 */
export function add(value1, value2) {
    const dim1 = parseDimension(value1);
    const dim2 = parseDimension(value2);

    // If same unit, just add
    if (dim1.unit === dim2.unit || !dim2.unit) {
        return formatDimension(dim1.value + dim2.value, dim1.unit);
    }

    // Convert second value to first value's unit
    const px1 = dim1.value * (UNIT_TO_PX[dim1.unit] || 1);
    const px2 = dim2.value * (UNIT_TO_PX[dim2.unit] || 1);
    const sumPx = px1 + px2;
    const result = sumPx / (UNIT_TO_PX[dim1.unit] || 1);

    return formatDimension(result, dim1.unit);
}

/**
 * Subtract dimension values
 * @param {string} value1 - First dimension
 * @param {string} value2 - Second dimension
 * @returns {string} Difference with unit
 */
export function subtract(value1, value2) {
    const dim1 = parseDimension(value1);
    const dim2 = parseDimension(value2);

    // If same unit, just subtract
    if (dim1.unit === dim2.unit || !dim2.unit) {
        return formatDimension(dim1.value - dim2.value, dim1.unit);
    }

    // Convert second value to first value's unit
    const px1 = dim1.value * (UNIT_TO_PX[dim1.unit] || 1);
    const px2 = dim2.value * (UNIT_TO_PX[dim2.unit] || 1);
    const diffPx = px1 - px2;
    const result = diffPx / (UNIT_TO_PX[dim1.unit] || 1);

    return formatDimension(result, dim1.unit);
}

/**
 * Round a dimension to specified precision
 * @param {string} value - Dimension
 * @param {string|number} precision - Decimal places (default 2)
 * @returns {string} Rounded value with unit
 */
export function round(value, precision = 2) {
    const { value: num, unit } = parseDimension(value);
    const places = parseInt(precision);
    const factor = Math.pow(10, places);

    return formatDimension(Math.round(num * factor) / factor, unit);
}

/**
 * Floor a dimension (round down)
 * @param {string} value - Dimension
 * @param {string|number} precision - Decimal places (default 0)
 * @returns {string} Floored value with unit
 */
export function floor(value, precision = 0) {
    const { value: num, unit } = parseDimension(value);
    const places = parseInt(precision);
    const factor = Math.pow(10, places);

    return formatDimension(Math.floor(num * factor) / factor, unit);
}

/**
 * Ceil a dimension (round up)
 * @param {string} value - Dimension
 * @param {string|number} precision - Decimal places (default 0)
 * @returns {string} Ceiled value with unit
 */
export function ceil(value, precision = 0) {
    const { value: num, unit } = parseDimension(value);
    const places = parseInt(precision);
    const factor = Math.pow(10, places);

    return formatDimension(Math.ceil(num * factor) / factor, unit);
}

/**
 * Get minimum of two dimensions
 * @param {string} value1 - First dimension
 * @param {string} value2 - Second dimension
 * @returns {string} Smaller value
 */
export function min(value1, value2) {
    const dim1 = parseDimension(value1);
    const dim2 = parseDimension(value2);

    // Convert to same unit (pixels) for comparison
    const px1 = dim1.value * (UNIT_TO_PX[dim1.unit] || 1);
    const px2 = dim2.value * (UNIT_TO_PX[dim2.unit] || 1);

    return px1 <= px2 ? formatDimension(dim1.value, dim1.unit) : formatDimension(dim2.value, dim2.unit);
}

/**
 * Get maximum of two dimensions
 * @param {string} value1 - First dimension
 * @param {string} value2 - Second dimension
 * @returns {string} Larger value
 */
export function max(value1, value2) {
    const dim1 = parseDimension(value1);
    const dim2 = parseDimension(value2);

    // Convert to same unit (pixels) for comparison
    const px1 = dim1.value * (UNIT_TO_PX[dim1.unit] || 1);
    const px2 = dim2.value * (UNIT_TO_PX[dim2.unit] || 1);

    return px1 >= px2 ? formatDimension(dim1.value, dim1.unit) : formatDimension(dim2.value, dim2.unit);
}

/**
 * Clamp a dimension between min and max
 * @param {string} value - Dimension to clamp
 * @param {string} minVal - Minimum value
 * @param {string} maxVal - Maximum value
 * @returns {string} Clamped value
 */
export function clamp(value, minVal, maxVal) {
    const dim = parseDimension(value);
    const dimMin = parseDimension(minVal);
    const dimMax = parseDimension(maxVal);

    // Convert all to pixels for comparison
    const px = dim.value * (UNIT_TO_PX[dim.unit] || 1);
    const pxMin = dimMin.value * (UNIT_TO_PX[dimMin.unit] || 1);
    const pxMax = dimMax.value * (UNIT_TO_PX[dimMax.unit] || 1);

    if (px < pxMin) {
        return formatDimension(dimMin.value, dimMin.unit);
    }
    if (px > pxMax) {
        return formatDimension(dimMax.value, dimMax.unit);
    }
    return formatDimension(dim.value, dim.unit);
}

/**
 * Convert between units
 * @param {string} value - Dimension to convert
 * @param {string} toUnit - Target unit (px, rem, em)
 * @param {string|number} baseFontSize - Base font size in px (default 16)
 * @returns {string} Converted value
 */
export function convert(value, toUnit, baseFontSize = 16) {
    const { value: num, unit: fromUnit } = parseDimension(value);
    const base = parseFloat(baseFontSize);

    // First convert to pixels
    let px;
    switch (fromUnit.toLowerCase()) {
        case 'rem':
        case 'em':
            px = num * base;
            break;
        case 'px':
            px = num;
            break;
        case 'pt':
            px = num * (96 / 72);
            break;
        case '%':
            // Percentage conversion requires context, treat as-is
            px = num;
            break;
        default:
            px = num * (UNIT_TO_PX[fromUnit] || 1);
    }

    // Then convert from pixels to target unit
    let result;
    switch (toUnit.toLowerCase()) {
        case 'rem':
        case 'em':
            result = px / base;
            break;
        case 'px':
            result = px;
            break;
        case 'pt':
            result = px * (72 / 96);
            break;
        default:
            result = px / (UNIT_TO_PX[toUnit] || 1);
    }

    return formatDimension(result, toUnit);
}

/**
 * Calculate modulo (remainder) of dimension
 * @param {string} value - Dimension
 * @param {string|number} divisor - Divisor
 * @returns {string} Remainder with unit
 */
export function mod(value, divisor) {
    const { value: num, unit } = parseDimension(value);
    const div = parseFloat(divisor);

    return formatDimension(num % div, unit);
}

/**
 * Get absolute value of dimension
 * @param {string} value - Dimension (may be negative)
 * @returns {string} Absolute value with unit
 */
export function abs(value) {
    const { value: num, unit } = parseDimension(value);
    return formatDimension(Math.abs(num), unit);
}

/**
 * Negate a dimension value
 * @param {string} value - Dimension
 * @returns {string} Negated value with unit
 */
export function negate(value) {
    const { value: num, unit } = parseDimension(value);
    return formatDimension(-num, unit);
}

/**
 * Calculate percentage of a value
 * @param {string} value - Base dimension
 * @param {string|number} percentage - Percentage (e.g., "50%" or 50)
 * @returns {string} Percentage of value with unit
 */
export function percent(value, percentage) {
    const { value: num, unit } = parseDimension(value);
    const pct = String(percentage).replace('%', '');
    const factor = parseFloat(pct) / 100;

    return formatDimension(num * factor, unit);
}
