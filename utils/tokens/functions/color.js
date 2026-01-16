// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Color manipulation functions using OKLCH color space
 * Uses culori for perceptually uniform color operations
 */

import {
    parse,
    formatHex,
    formatRgb,
    oklch,
    rgb,
    interpolate,
    clampChroma,
    wcagContrast,
} from 'culori';
import { parsePercentage, parseObjectArg } from '../parser.js';

/**
 * Convert any color to OKLCH for manipulation
 * @param {string} color - Input color in any format
 * @returns {object} OKLCH color object
 */
function toOklch(color) {
    const parsed = parse(color);
    if (!parsed) {
        throw new Error(`Invalid color: ${color}`);
    }
    return oklch(parsed);
}

/**
 * Convert OKLCH color back to hex (sRGB gamut mapped)
 * @param {object} color - OKLCH color object
 * @returns {string} Hex color string
 */
function toHex(color) {
    // Clamp to sRGB gamut before converting
    const clamped = clampChroma(color, 'oklch');
    return formatHex(clamped);
}

/**
 * Generate a lighter tint of a color using OKLCH
 * Increases lightness while preserving hue and reducing chroma slightly
 * @param {string} color - Base color (hex, rgb, oklch, etc.)
 * @param {string|number} amount - Tint amount 0-100% (how much white to add)
 * @returns {string} Tinted color as hex
 */
export function tint(color, amount) {
    const amountDecimal = parsePercentage(amount);
    const oklchColor = toOklch(color);

    // Interpolate towards white in OKLCH space
    // White in OKLCH: L=1, C=0, H=undefined
    const newL = oklchColor.l + (1 - oklchColor.l) * amountDecimal;
    const newC = oklchColor.c * (1 - amountDecimal * 0.5); // Reduce chroma slightly

    return toHex({
        mode: 'oklch',
        l: Math.min(1, newL),
        c: Math.max(0, newC),
        h: oklchColor.h,
    });
}

/**
 * Generate a darker shade of a color using OKLCH
 * Decreases lightness while preserving hue
 * @param {string} color - Base color
 * @param {string|number} amount - Shade amount 0-100% (how much to darken)
 * @returns {string} Shaded color as hex
 */
export function shade(color, amount) {
    const amountDecimal = parsePercentage(amount);
    const oklchColor = toOklch(color);

    // Reduce lightness while slightly increasing chroma for richness
    const newL = oklchColor.l * (1 - amountDecimal);
    const newC = oklchColor.c * (1 + amountDecimal * 0.1); // Slight chroma boost

    return toHex({
        mode: 'oklch',
        l: Math.max(0, newL),
        c: Math.min(0.4, newC), // Cap chroma to avoid oversaturation
        h: oklchColor.h,
    });
}

/**
 * Mix two colors using OKLCH interpolation
 * @param {string} color1 - First color
 * @param {string} color2 - Second color
 * @param {string|number} ratio - Mix ratio 0-1 (0 = color1, 1 = color2)
 * @returns {string} Mixed color as hex
 */
export function mix(color1, color2, ratio = 0.5) {
    const ratioDecimal = parsePercentage(ratio);
    const interpolator = interpolate([color1, color2], 'oklch');
    const mixed = interpolator(ratioDecimal);
    return toHex(mixed);
}

/**
 * Adjust color properties in OKLCH space
 * @param {string} color - Base color
 * @param {string|object} adjustments - Object like { l: 10, c: -5, h: 30 } or string
 * @returns {string} Adjusted color as hex
 */
export function adjust(color, adjustments) {
    const oklchColor = toOklch(color);
    const adj = typeof adjustments === 'string' ? parseObjectArg(adjustments) : adjustments;

    if (!adj) {
        return toHex(oklchColor);
    }

    // Adjustments are additive (can be negative)
    // L is 0-1, C is typically 0-0.4, H is 0-360
    const newL = oklchColor.l + (adj.l || adj.lightness || 0) / 100;
    const newC = oklchColor.c + (adj.c || adj.chroma || 0) / 100;
    const newH = ((oklchColor.h || 0) + (adj.h || adj.hue || 0)) % 360;

    return toHex({
        mode: 'oklch',
        l: Math.max(0, Math.min(1, newL)),
        c: Math.max(0, Math.min(0.4, newC)),
        h: newH < 0 ? newH + 360 : newH,
    });
}

/**
 * Set alpha/opacity on a color
 * @param {string} color - Base color
 * @param {string|number} alphaValue - Alpha value 0-1
 * @returns {string} Color with alpha (rgba format)
 */
export function alpha(color, alphaValue) {
    const alphaDecimal = parsePercentage(alphaValue);
    const rgbColor = rgb(parse(color));

    return formatRgb({
        ...rgbColor,
        alpha: Math.max(0, Math.min(1, alphaDecimal)),
    });
}

/**
 * Get complementary color (180 degree hue shift)
 * @param {string} color - Base color
 * @returns {string} Complementary color as hex
 */
export function complement(color) {
    const oklchColor = toOklch(color);
    return toHex({
        mode: 'oklch',
        l: oklchColor.l,
        c: oklchColor.c,
        h: ((oklchColor.h || 0) + 180) % 360,
    });
}

/**
 * Saturate a color (increase chroma)
 * @param {string} color - Base color
 * @param {string|number} amount - Saturation amount 0-100%
 * @returns {string} Saturated color as hex
 */
export function saturate(color, amount) {
    const amountDecimal = parsePercentage(amount);
    const oklchColor = toOklch(color);

    return toHex({
        mode: 'oklch',
        l: oklchColor.l,
        c: Math.min(0.4, oklchColor.c * (1 + amountDecimal)),
        h: oklchColor.h,
    });
}

/**
 * Desaturate a color (decrease chroma)
 * @param {string} color - Base color
 * @param {string|number} amount - Desaturation amount 0-100%
 * @returns {string} Desaturated color as hex
 */
export function desaturate(color, amount) {
    const amountDecimal = parsePercentage(amount);
    const oklchColor = toOklch(color);

    return toHex({
        mode: 'oklch',
        l: oklchColor.l,
        c: Math.max(0, oklchColor.c * (1 - amountDecimal)),
        h: oklchColor.h,
    });
}

/**
 * Invert a color
 * @param {string} color - Base color
 * @returns {string} Inverted color as hex
 */
export function invert(color) {
    const oklchColor = toOklch(color);
    return toHex({
        mode: 'oklch',
        l: 1 - oklchColor.l,
        c: oklchColor.c,
        h: oklchColor.h,
    });
}

/**
 * Convert color to grayscale
 * @param {string} color - Base color
 * @returns {string} Grayscale color as hex
 */
export function grayscale(color) {
    const oklchColor = toOklch(color);
    return toHex({
        mode: 'oklch',
        l: oklchColor.l,
        c: 0,
        h: oklchColor.h,
    });
}

/**
 * Auto-generate dark mode variant of a color
 * Inverts lightness while preserving hue and adjusting chroma
 * @param {string} color - Light mode color
 * @param {string|object} options - Options { preserveHue: true, chromaAdjust: -10 }
 * @returns {string} Dark mode optimized color as hex
 */
export function darkMode(color, options = {}) {
    const opts = typeof options === 'string' ? parseObjectArg(options) : options;
    const oklchColor = toOklch(color);

    // Invert lightness for dark mode
    // Colors with L > 0.5 become darker, colors with L < 0.5 become lighter
    let newL;
    if (oklchColor.l > 0.5) {
        // Light colors: map 0.5-1 to 0.1-0.4 (darker)
        newL = 0.1 + (1 - oklchColor.l) * 0.6;
    } else {
        // Dark colors: map 0-0.5 to 0.6-0.95 (lighter)
        newL = 0.6 + oklchColor.l * 0.7;
    }

    // Reduce chroma slightly for dark mode (less vibrant)
    const chromaAdjust = (opts?.chromaAdjust || -10) / 100;
    const newC = Math.max(0, Math.min(0.4, oklchColor.c * (1 + chromaAdjust)));

    return toHex({
        mode: 'oklch',
        l: newL,
        c: newC,
        h: opts?.preserveHue === false ? (oklchColor.h + 180) % 360 : oklchColor.h,
    });
}

/**
 * Generate a complete color scale (Radix-style 12 steps or custom)
 * @param {string} baseColor - Base color for scale generation
 * @param {string|number} steps - Number of steps (default 12)
 * @returns {object} Object with step1-stepN colors
 */
export function colorScale(baseColor, steps = 12) {
    const numSteps = parseInt(steps) || 12;
    const oklchColor = toOklch(baseColor);
    const scale = {};

    // Generate scale from very light (step 1) to very dark (step N)
    for (let i = 1; i <= numSteps; i++) {
        const t = (i - 1) / (numSteps - 1); // 0 to 1

        // Lightness: from 0.97 (almost white) to 0.15 (very dark)
        const l = 0.97 - t * 0.82;

        // Chroma: peaks in the middle, lower at extremes
        const chromaPeak = 4; // Middle step with highest chroma
        const chromaFalloff = Math.abs(i - numSteps / 2) / (numSteps / 2);
        const c = oklchColor.c * (1 - chromaFalloff * 0.5);

        scale[`step${i}`] = toHex({
            mode: 'oklch',
            l: Math.max(0, Math.min(1, l)),
            c: Math.max(0, Math.min(0.4, c)),
            h: oklchColor.h,
        });
    }

    return scale;
}

/**
 * Lighten a color by a percentage
 * @param {string} color - Base color
 * @param {string|number} amount - Amount to lighten 0-100%
 * @returns {string} Lightened color as hex
 */
export function lighten(color, amount) {
    const amountDecimal = parsePercentage(amount);
    const oklchColor = toOklch(color);

    return toHex({
        mode: 'oklch',
        l: Math.min(1, oklchColor.l + amountDecimal),
        c: oklchColor.c,
        h: oklchColor.h,
    });
}

/**
 * Darken a color by a percentage
 * @param {string} color - Base color
 * @param {string|number} amount - Amount to darken 0-100%
 * @returns {string} Darkened color as hex
 */
export function darken(color, amount) {
    const amountDecimal = parsePercentage(amount);
    const oklchColor = toOklch(color);

    return toHex({
        mode: 'oklch',
        l: Math.max(0, oklchColor.l - amountDecimal),
        c: oklchColor.c,
        h: oklchColor.h,
    });
}

/**
 * Rotate hue by degrees
 * @param {string} color - Base color
 * @param {string|number} degrees - Degrees to rotate (-360 to 360)
 * @returns {string} Color with rotated hue as hex
 */
export function hueRotate(color, degrees) {
    const deg = parseFloat(degrees);
    const oklchColor = toOklch(color);

    let newH = ((oklchColor.h || 0) + deg) % 360;
    if (newH < 0) newH += 360;

    return toHex({
        mode: 'oklch',
        l: oklchColor.l,
        c: oklchColor.c,
        h: newH,
    });
}
