// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Gradient Token Functions
 * Converts W3C DTCG gradient objects to CSS gradient strings
 *
 * W3C DTCG Gradient Format:
 * {
 *   "type": "linear" | "radial" | "conic",
 *   "angle": "135deg",  // for linear
 *   "colorStops": [
 *     { "color": "#667eea", "position": 0 },
 *     { "color": "{color.primary.500}", "position": 0.5 },
 *     { "color": "#764ba2", "position": 1 }
 *   ]
 * }
 */

/**
 * Check if a value is a W3C DTCG gradient object
 * @param {any} value - Value to check
 * @returns {boolean} True if it's a gradient object
 */
export function isGradientObject(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }

    // Must have colorStops array
    if (!Array.isArray(value.colorStops)) {
        return false;
    }

    // Must have at least 2 color stops
    if (value.colorStops.length < 2) {
        return false;
    }

    // Each stop must have a color
    return value.colorStops.every(stop =>
        stop && typeof stop === 'object' && stop.color !== undefined
    );
}

/**
 * Convert position to CSS percentage
 * @param {number|string} position - Position as 0-1 fraction or percentage string
 * @returns {string} CSS percentage string
 */
function positionToPercent(position) {
    if (position === undefined || position === null) {
        return '';
    }

    if (typeof position === 'string') {
        // Already a percentage or other CSS value
        return position;
    }

    if (typeof position === 'number') {
        // Convert 0-1 fraction to percentage
        if (position >= 0 && position <= 1) {
            return `${Math.round(position * 100)}%`;
        }
        // Assume it's already a percentage number
        return `${position}%`;
    }

    return '';
}

/**
 * Convert a W3C DTCG gradient object to CSS gradient string
 * @param {object} gradient - Gradient object
 * @param {function} resolveColor - Function to resolve color references
 * @returns {string} CSS gradient string
 */
export function gradientToCSS(gradient, resolveColor = (c) => c) {
    if (!isGradientObject(gradient)) {
        return null;
    }

    const type = gradient.type || 'linear';
    const colorStops = gradient.colorStops.map(stop => {
        const color = resolveColor(stop.color);
        const position = positionToPercent(stop.position);
        return position ? `${color} ${position}` : color;
    }).join(', ');

    switch (type) {
        case 'linear': {
            const angle = gradient.angle || '180deg';
            return `linear-gradient(${angle}, ${colorStops})`;
        }

        case 'radial': {
            const shape = gradient.shape || 'ellipse';
            const size = gradient.size || 'farthest-corner';
            const position = gradient.position || 'center';
            return `radial-gradient(${shape} ${size} at ${position}, ${colorStops})`;
        }

        case 'conic': {
            const from = gradient.from || '0deg';
            const at = gradient.at || 'center';
            return `conic-gradient(from ${from} at ${at}, ${colorStops})`;
        }

        default:
            // Fallback to linear
            return `linear-gradient(180deg, ${colorStops})`;
    }
}

/**
 * Process a gradient token value
 * If it's a gradient object, convert to CSS. Otherwise return as-is.
 * @param {any} value - Token value (object or string)
 * @param {function} resolveColor - Function to resolve color references
 * @returns {string} CSS gradient string or original value
 */
export function processGradient(value, resolveColor = (c) => c) {
    // If it's already a CSS gradient string, return as-is
    if (typeof value === 'string') {
        return value;
    }

    // If it's a gradient object, convert to CSS
    if (isGradientObject(value)) {
        return gradientToCSS(value, resolveColor);
    }

    return value;
}
