// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Typography functions for fluid type, modular scales, and responsive sizing
 */

import { parseDimension, formatDimension } from '../parser.js';

/**
 * Predefined modular scale ratios
 */
export const SCALE_RATIOS = {
    minorSecond: 1.067,
    majorSecond: 1.125,
    minorThird: 1.2,
    majorThird: 1.25,
    perfectFourth: 1.333,
    augmentedFourth: 1.414,
    perfectFifth: 1.5,
    minorSixth: 1.6,
    goldenRatio: 1.618,
    majorSixth: 1.667,
    minorSeventh: 1.778,
    majorSeventh: 1.875,
    octave: 2,
};

/**
 * Convert a dimension to pixels (assumes 16px base for rem/em)
 * @param {string} value - Dimension value
 * @param {number} baseFontSize - Base font size in pixels (default 16)
 * @returns {number} Value in pixels
 */
function toPx(value, baseFontSize = 16) {
    const { value: num, unit } = parseDimension(value);

    switch (unit.toLowerCase()) {
        case 'px':
            return num;
        case 'rem':
        case 'em':
            return num * baseFontSize;
        case 'pt':
            return num * (96 / 72);
        default:
            return num;
    }
}

/**
 * Generate CSS clamp() for fluid typography
 * Creates smooth scaling between viewport sizes
 * @param {string} minSize - Minimum font size (e.g., '16px', '1rem')
 * @param {string} maxSize - Maximum font size
 * @param {string} minViewport - Minimum viewport width (default '320px')
 * @param {string} maxViewport - Maximum viewport width (default '1280px')
 * @returns {string} CSS clamp() value
 */
export function fluidType(minSize, maxSize, minViewport = '320px', maxViewport = '1280px') {
    const minPx = toPx(minSize);
    const maxPx = toPx(maxSize);
    const minVp = toPx(minViewport);
    const maxVp = toPx(maxViewport);

    // Calculate the slope and intercept for the linear equation
    // preferred = slope * 100vw + intercept
    const slope = (maxPx - minPx) / (maxVp - minVp);
    const intercept = minPx - slope * minVp;

    // Convert to rem for better accessibility (respects user font size)
    const minRem = minPx / 16;
    const maxRem = maxPx / 16;
    const interceptRem = intercept / 16;

    // Format the preferred value
    const slopeVw = Math.round(slope * 100 * 10000) / 10000;
    const interceptFormatted = Math.round(interceptRem * 10000) / 10000;

    // Build the clamp expression
    let preferred;
    if (interceptFormatted >= 0) {
        preferred = `${slopeVw}vw + ${interceptFormatted}rem`;
    } else {
        preferred = `${slopeVw}vw - ${Math.abs(interceptFormatted)}rem`;
    }

    return `clamp(${minRem}rem, ${preferred}, ${maxRem}rem)`;
}

/**
 * Generate size using modular scale
 * @param {string} base - Base size (e.g., '1rem', '16px')
 * @param {string|number} step - Scale step (can be negative)
 * @param {string|number} ratio - Scale ratio name or number
 * @returns {string} Calculated size
 */
export function modularScale(base, step, ratio = 'majorThird') {
    const { value: baseValue, unit } = parseDimension(base);
    const stepNum = parseInt(step);

    // Get ratio value
    let ratioValue;
    if (typeof ratio === 'string' && SCALE_RATIOS[ratio]) {
        ratioValue = SCALE_RATIOS[ratio];
    } else {
        ratioValue = parseFloat(ratio) || 1.25;
    }

    // Calculate scaled value
    const scaled = baseValue * Math.pow(ratioValue, stepNum);

    return formatDimension(scaled, unit || 'rem');
}

/**
 * Generate a complete type scale
 * @param {string} baseSize - Base font size
 * @param {string|number} ratio - Scale ratio
 * @param {string|number} steps - Number of steps above and below base (default 4)
 * @returns {object} Type scale object { xs, sm, base, lg, xl, 2xl, ... }
 */
export function typeScale(baseSize, ratio = 'majorThird', steps = 4) {
    const numSteps = parseInt(steps);
    const scale = {};

    // Standard size names for common step counts
    const sizeNames = {
        '-4': '3xs',
        '-3': '2xs',
        '-2': 'xs',
        '-1': 'sm',
        '0': 'base',
        '1': 'lg',
        '2': 'xl',
        '3': '2xl',
        '4': '3xl',
        '5': '4xl',
        '6': '5xl',
        '7': '6xl',
        '8': '7xl',
    };

    // Generate steps below and above base
    for (let i = -Math.min(numSteps, 4); i <= numSteps; i++) {
        const name = sizeNames[String(i)] || `step${i}`;
        scale[name] = modularScale(baseSize, i, ratio);
    }

    return scale;
}

/**
 * Generate fluid spacing based on viewport
 * @param {string} minSpace - Minimum spacing
 * @param {string} maxSpace - Maximum spacing
 * @param {string} minViewport - Min viewport (default '320px')
 * @param {string} maxViewport - Max viewport (default '1280px')
 * @returns {string} CSS clamp() for fluid spacing
 */
export function fluidSpace(minSpace, maxSpace, minViewport = '320px', maxViewport = '1280px') {
    // Reuse fluidType logic since the math is the same
    return fluidType(minSpace, maxSpace, minViewport, maxViewport);
}

/**
 * Generate line height based on font size
 * Larger text needs tighter line height
 * @param {string} fontSize - Font size
 * @param {string|number} baseLineHeight - Base line height ratio (default 1.5)
 * @returns {string} Calculated line height as unitless number
 */
export function lineHeight(fontSize, baseLineHeight = 1.5) {
    const fontSizePx = toPx(fontSize);
    const baseLh = parseFloat(baseLineHeight);

    // Larger text needs tighter line height
    // Formula: base - (fontSize - 16) * 0.01, clamped between 1.2 and 2
    const adjustment = (fontSizePx - 16) * 0.01;
    const lh = Math.max(1.2, Math.min(2, baseLh - adjustment));

    return String(Math.round(lh * 100) / 100);
}

/**
 * Calculate optimal characters per line (measure)
 * @param {string} fontSize - Font size
 * @returns {string} Optimal max-width in ch units
 */
export function optimalMeasure(fontSize) {
    const fontSizePx = toPx(fontSize);

    // Optimal line length is typically 45-75 characters
    // Larger fonts can handle slightly longer lines
    const baseChars = 65;
    const adjustment = (fontSizePx - 16) * 0.5;
    const chars = Math.round(Math.max(45, Math.min(85, baseChars + adjustment)));

    return `${chars}ch`;
}

/**
 * Generate responsive font size with multiple breakpoints
 * @param {string} minSize - Mobile size
 * @param {string} midSize - Tablet size
 * @param {string} maxSize - Desktop size
 * @returns {object} Object with CSS values for each breakpoint
 */
export function responsiveType(minSize, midSize, maxSize) {
    return {
        mobile: minSize,
        tablet: midSize,
        desktop: maxSize,
        fluidMobileTablet: fluidType(minSize, midSize, '320px', '768px'),
        fluidTabletDesktop: fluidType(midSize, maxSize, '768px', '1280px'),
        fluidFull: fluidType(minSize, maxSize, '320px', '1280px'),
    };
}

/**
 * Calculate letter spacing based on font size
 * Larger text typically needs tighter tracking
 * @param {string} fontSize - Font size
 * @returns {string} Letter spacing in em
 */
export function letterSpacing(fontSize) {
    const fontSizePx = toPx(fontSize);

    // Larger text needs tighter letter-spacing
    // Small text (12px): 0.05em, Large text (48px): -0.02em
    const tracking = 0.08 - fontSizePx * 0.002;
    const clamped = Math.max(-0.05, Math.min(0.1, tracking));

    return `${Math.round(clamped * 1000) / 1000}em`;
}
