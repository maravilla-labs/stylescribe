// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Contrast and accessibility functions for design tokens
 * Implements WCAG 2.1 contrast calculations
 */

import { parse, wcagContrast, oklch, formatHex, clampChroma } from 'culori';
import { parsePercentage } from '../parser.js';

/**
 * Calculate WCAG contrast ratio between two colors
 * @param {string} foreground - Foreground color
 * @param {string} background - Background color
 * @returns {number} Contrast ratio (1-21)
 */
export function contrastRatio(foreground, background) {
    const fg = parse(foreground);
    const bg = parse(background);

    if (!fg || !bg) {
        throw new Error(`Invalid colors: ${foreground}, ${background}`);
    }

    const ratio = wcagContrast(fg, bg);
    return Math.round(ratio * 100) / 100;
}

/**
 * Check if color pair meets WCAG contrast requirements
 * @param {string} foreground - Foreground color
 * @param {string} background - Background color
 * @param {string} level - 'AA' (4.5:1) or 'AAA' (7:1), default 'AA'
 * @returns {string} 'true' or 'false' (string for token compatibility)
 */
export function meetsContrast(foreground, background, level = 'AA') {
    const ratio = contrastRatio(foreground, background);
    const threshold = level.toUpperCase() === 'AAA' ? 7 : 4.5;
    return ratio >= threshold ? 'true' : 'false';
}

/**
 * Find an accessible text color for a given background
 * Returns black or white, whichever has better contrast
 * @param {string} background - Background color
 * @param {string} preferLight - 'true' to prefer light text when contrast is equal
 * @returns {string} Accessible foreground color as hex
 */
export function accessibleText(background, preferLight = 'false') {
    const bg = parse(background);
    if (!bg) {
        throw new Error(`Invalid background color: ${background}`);
    }

    const white = '#ffffff';
    const black = '#000000';

    const whiteContrast = wcagContrast(parse(white), bg);
    const blackContrast = wcagContrast(parse(black), bg);

    const prefer = preferLight === 'true' || preferLight === true;

    if (whiteContrast === blackContrast) {
        return prefer ? white : black;
    }

    return whiteContrast > blackContrast ? white : black;
}

/**
 * Adjust color lightness to meet contrast requirement against another color
 * @param {string} color - Color to adjust
 * @param {string} against - Reference color to contrast against
 * @param {string|number} minContrast - Minimum contrast ratio (default 4.5)
 * @returns {string} Adjusted color meeting contrast requirement as hex
 */
export function ensureContrast(color, against, minContrast = 4.5) {
    const targetContrast = parseFloat(minContrast);
    const colorOklch = oklch(parse(color));
    const againstParsed = parse(against);

    if (!colorOklch || !againstParsed) {
        throw new Error(`Invalid colors: ${color}, ${against}`);
    }

    // Check if current color already meets contrast
    let currentRatio = wcagContrast(parse(color), againstParsed);
    if (currentRatio >= targetContrast) {
        return formatHex(clampChroma(colorOklch, 'oklch'));
    }

    // Determine if we need to go lighter or darker
    const againstOklch = oklch(againstParsed);
    const shouldGoLighter = againstOklch.l < 0.5;

    // Binary search for the right lightness
    let low = shouldGoLighter ? colorOklch.l : 0;
    let high = shouldGoLighter ? 1 : colorOklch.l;

    for (let i = 0; i < 20; i++) {
        const mid = (low + high) / 2;
        const testColor = {
            mode: 'oklch',
            l: mid,
            c: colorOklch.c,
            h: colorOklch.h,
        };

        currentRatio = wcagContrast(clampChroma(testColor, 'oklch'), againstParsed);

        if (Math.abs(currentRatio - targetContrast) < 0.1) {
            return formatHex(clampChroma(testColor, 'oklch'));
        }

        if (shouldGoLighter) {
            if (currentRatio < targetContrast) {
                low = mid;
            } else {
                high = mid;
            }
        } else {
            if (currentRatio < targetContrast) {
                high = mid;
            } else {
                low = mid;
            }
        }
    }

    // Return best attempt
    return formatHex(
        clampChroma(
            {
                mode: 'oklch',
                l: shouldGoLighter ? high : low,
                c: colorOklch.c,
                h: colorOklch.h,
            },
            'oklch'
        )
    );
}

/**
 * Get the relative luminance of a color
 * @param {string} color - Color to analyze
 * @returns {number} Relative luminance (0-1)
 */
export function luminance(color) {
    const parsed = parse(color);
    if (!parsed) {
        throw new Error(`Invalid color: ${color}`);
    }

    const oklchColor = oklch(parsed);
    return Math.round(oklchColor.l * 1000) / 1000;
}

/**
 * Check if a color is considered "light" (luminance > 0.5)
 * @param {string} color - Color to check
 * @returns {string} 'true' or 'false'
 */
export function isLight(color) {
    return luminance(color) > 0.5 ? 'true' : 'false';
}

/**
 * Check if a color is considered "dark" (luminance <= 0.5)
 * @param {string} color - Color to check
 * @returns {string} 'true' or 'false'
 */
export function isDark(color) {
    return luminance(color) <= 0.5 ? 'true' : 'false';
}

/**
 * Get a pair of accessible colors (background + text)
 * @param {string} baseColor - Base color to work with
 * @param {string} level - 'AA' or 'AAA' contrast level
 * @returns {object} { background, text } color pair
 */
export function accessiblePair(baseColor, level = 'AA') {
    const background = formatHex(clampChroma(oklch(parse(baseColor)), 'oklch'));
    const text = accessibleText(background);

    return {
        background,
        text,
    };
}
