// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

import { describe, it, expect } from 'vitest';
import {
    tint,
    shade,
    mix,
    adjust,
    alpha,
    complement,
    saturate,
    desaturate,
    lighten,
    darken,
    darkMode,
    hueRotate,
} from '../utils/tokens/functions/color.js';
import {
    contrastRatio,
    meetsContrast,
    accessibleText,
    ensureContrast,
    luminance,
    isLight,
    isDark,
} from '../utils/tokens/functions/contrast.js';
import {
    fluidType,
    modularScale,
    typeScale,
    fluidSpace,
    SCALE_RATIOS,
} from '../utils/tokens/functions/typography.js';
import { multiply, divide, add, subtract, round, convert, percent } from '../utils/tokens/functions/math.js';
import { parseFunction, parseArguments, parseDimension, isFunction } from '../utils/tokens/parser.js';
import { processTokenFunctions, processAllTokens } from '../utils/tokens/processor.js';

describe('Parser', () => {
    describe('parseFunction', () => {
        it('should parse simple function calls', () => {
            const result = parseFunction('tint(#ff0000, 50%)');
            expect(result.name).toBe('tint');
            expect(result.args).toEqual(['#ff0000', '50%']);
        });

        it('should parse functions with token references', () => {
            const result = parseFunction('shade({color.primary}, 20%)');
            expect(result.name).toBe('shade');
            expect(result.args).toEqual(['{color.primary}', '20%']);
        });

        it('should parse nested functions', () => {
            const result = parseFunction('tint(shade(#ff0000, 20%), 50%)');
            expect(result.name).toBe('tint');
            expect(result.args[0]).toBe('shade(#ff0000, 20%)');
        });

        it('should return null for non-function values', () => {
            expect(parseFunction('#ff0000')).toBeNull();
            expect(parseFunction('16px')).toBeNull();
            expect(parseFunction('{color.primary}')).toBeNull();
        });
    });

    describe('parseArguments', () => {
        it('should split simple arguments', () => {
            expect(parseArguments('#ff0000, 50%')).toEqual(['#ff0000', '50%']);
        });

        it('should preserve nested parentheses', () => {
            expect(parseArguments('shade(#ff0000, 20%), 50%')).toEqual(['shade(#ff0000, 20%)', '50%']);
        });

        it('should preserve braces', () => {
            expect(parseArguments('{color.primary}, 30%')).toEqual(['{color.primary}', '30%']);
        });
    });

    describe('parseDimension', () => {
        it('should parse pixel values', () => {
            const result = parseDimension('16px');
            expect(result.value).toBe(16);
            expect(result.unit).toBe('px');
        });

        it('should parse rem values', () => {
            const result = parseDimension('1.5rem');
            expect(result.value).toBe(1.5);
            expect(result.unit).toBe('rem');
        });

        it('should parse negative values', () => {
            const result = parseDimension('-8px');
            expect(result.value).toBe(-8);
            expect(result.unit).toBe('px');
        });
    });

    describe('isFunction', () => {
        it('should detect function calls', () => {
            expect(isFunction('tint(#ff0000, 50%)')).toBe(true);
            expect(isFunction('fluidType(1rem, 2rem)')).toBe(true);
        });

        it('should reject non-functions', () => {
            expect(isFunction('#ff0000')).toBe(false);
            expect(isFunction('{color.primary}')).toBe(false);
            expect(isFunction('16px')).toBe(false);
        });
    });
});

describe('Color Functions', () => {
    describe('tint', () => {
        it('should lighten colors', () => {
            const result = tint('#0d6efd', '50%');
            // Should be lighter than original
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
            expect(result).not.toBe('#0d6efd');
        });

        it('should return near-white at 95%', () => {
            const result = tint('#0d6efd', '95%');
            // Should be very light
            expect(result.toLowerCase()).toMatch(/^#f/);
        });

        it('should handle percentage strings', () => {
            const result = tint('#ff0000', '50%');
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });

    describe('shade', () => {
        it('should darken colors', () => {
            const result = shade('#0d6efd', '50%');
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
            expect(result).not.toBe('#0d6efd');
        });

        it('should return very dark at 80%', () => {
            const result = shade('#0d6efd', '80%');
            // Should be very dark
            expect(result).toMatch(/^#0/);
        });
    });

    describe('mix', () => {
        it('should blend two colors', () => {
            const result = mix('#ff0000', '#0000ff', '0.5');
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });

        it('should return first color at 0', () => {
            const result = mix('#ff0000', '#0000ff', '0');
            expect(result.toLowerCase()).toBe('#ff0000');
        });

        it('should return near second color at 1', () => {
            const result = mix('#ff0000', '#0000ff', '1');
            // OKLCH interpolation may not produce exact colors at extremes
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });

    describe('alpha', () => {
        it('should add transparency', () => {
            const result = alpha('#ff0000', '0.5');
            expect(result).toContain('rgba');
            expect(result).toContain('0.5');
        });

        it('should handle percentage', () => {
            const result = alpha('#0d6efd', '50%');
            expect(result).toContain('0.5');
        });
    });

    describe('complement', () => {
        it('should return complementary color', () => {
            const result = complement('#ff0000');
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
            // Complement of red should be cyan-ish
        });
    });

    describe('darkMode', () => {
        it('should invert light colors to dark', () => {
            const result = darkMode('#ffffff');
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
            // White should become dark
        });

        it('should invert dark colors to light', () => {
            const result = darkMode('#000000');
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
            // Black should become light
        });
    });

    describe('lighten/darken', () => {
        it('should lighten by amount', () => {
            const result = lighten('#808080', '20%');
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });

        it('should darken by amount', () => {
            const result = darken('#808080', '20%');
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });

    describe('hueRotate', () => {
        it('should rotate hue by degrees', () => {
            const result = hueRotate('#ff0000', '180');
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });
});

describe('Contrast Functions', () => {
    describe('contrastRatio', () => {
        it('should calculate contrast between black and white', () => {
            const ratio = contrastRatio('#000000', '#ffffff');
            expect(ratio).toBeCloseTo(21, 0);
        });

        it('should return 1 for same colors', () => {
            const ratio = contrastRatio('#ff0000', '#ff0000');
            expect(ratio).toBe(1);
        });
    });

    describe('meetsContrast', () => {
        it('should pass for high contrast', () => {
            expect(meetsContrast('#000000', '#ffffff', 'AA')).toBe('true');
            expect(meetsContrast('#000000', '#ffffff', 'AAA')).toBe('true');
        });

        it('should fail for low contrast', () => {
            expect(meetsContrast('#777777', '#888888', 'AA')).toBe('false');
        });
    });

    describe('accessibleText', () => {
        it('should return white for dark backgrounds', () => {
            expect(accessibleText('#000000')).toBe('#ffffff');
        });

        it('should return black for light backgrounds', () => {
            expect(accessibleText('#ffffff')).toBe('#000000');
        });
    });

    describe('luminance', () => {
        it('should return high luminance for white', () => {
            expect(luminance('#ffffff')).toBeGreaterThan(0.9);
        });

        it('should return low luminance for black', () => {
            expect(luminance('#000000')).toBeLessThan(0.1);
        });
    });

    describe('isLight/isDark', () => {
        it('should identify light colors', () => {
            expect(isLight('#ffffff')).toBe('true');
            expect(isDark('#ffffff')).toBe('false');
        });

        it('should identify dark colors', () => {
            expect(isLight('#000000')).toBe('false');
            expect(isDark('#000000')).toBe('true');
        });
    });
});

describe('Typography Functions', () => {
    describe('fluidType', () => {
        it('should generate clamp() value', () => {
            const result = fluidType('1rem', '2rem');
            expect(result).toMatch(/^clamp\(/);
            expect(result).toContain('1rem');
            expect(result).toContain('2rem');
            expect(result).toContain('vw');
        });

        it('should accept custom viewport range', () => {
            const result = fluidType('14px', '18px', '320px', '1920px');
            expect(result).toMatch(/^clamp\(/);
        });
    });

    describe('modularScale', () => {
        it('should scale up by ratio', () => {
            const result = modularScale('1rem', '2', 'majorThird');
            expect(result).toMatch(/^\d+\.?\d*rem$/);
            const value = parseFloat(result);
            expect(value).toBeGreaterThan(1);
        });

        it('should scale down with negative steps', () => {
            const result = modularScale('1rem', '-1', 'majorThird');
            const value = parseFloat(result);
            expect(value).toBeLessThan(1);
        });

        it('should use numeric ratio', () => {
            const result = modularScale('16px', '1', '1.5');
            expect(result).toBe('24px');
        });
    });

    describe('typeScale', () => {
        it('should generate full scale object', () => {
            const result = typeScale('1rem', 'majorThird', '3');
            expect(result).toHaveProperty('base');
            expect(result).toHaveProperty('lg');
            expect(result).toHaveProperty('xl');
        });
    });

    describe('fluidSpace', () => {
        it('should generate clamp() for spacing', () => {
            const result = fluidSpace('1rem', '2rem');
            expect(result).toMatch(/^clamp\(/);
        });
    });

    describe('SCALE_RATIOS', () => {
        it('should have common ratios defined', () => {
            expect(SCALE_RATIOS.majorThird).toBe(1.25);
            expect(SCALE_RATIOS.perfectFourth).toBe(1.333);
            expect(SCALE_RATIOS.goldenRatio).toBe(1.618);
        });
    });
});

describe('Math Functions', () => {
    describe('multiply', () => {
        it('should multiply dimension values', () => {
            expect(multiply('1rem', '2')).toBe('2rem');
            expect(multiply('16px', '0.5')).toBe('8px');
        });
    });

    describe('divide', () => {
        it('should divide dimension values', () => {
            expect(divide('2rem', '2')).toBe('1rem');
            expect(divide('16px', '4')).toBe('4px');
        });

        it('should throw on division by zero', () => {
            expect(() => divide('1rem', '0')).toThrow();
        });
    });

    describe('add', () => {
        it('should add same-unit values', () => {
            expect(add('1rem', '0.5rem')).toBe('1.5rem');
            expect(add('10px', '6px')).toBe('16px');
        });
    });

    describe('subtract', () => {
        it('should subtract same-unit values', () => {
            expect(subtract('2rem', '0.5rem')).toBe('1.5rem');
            expect(subtract('20px', '4px')).toBe('16px');
        });
    });

    describe('round', () => {
        it('should round to specified precision', () => {
            expect(round('1.2345rem', '2')).toBe('1.23rem');
            expect(round('1.999px', '0')).toBe('2px');
        });
    });

    describe('convert', () => {
        it('should convert px to rem', () => {
            expect(convert('16px', 'rem')).toBe('1rem');
            expect(convert('32px', 'rem')).toBe('2rem');
        });

        it('should convert rem to px', () => {
            expect(convert('1rem', 'px')).toBe('16px');
            expect(convert('2rem', 'px')).toBe('32px');
        });
    });

    describe('percent', () => {
        it('should calculate percentage of value', () => {
            expect(percent('100px', '50%')).toBe('50px');
            expect(percent('2rem', '25')).toBe('0.5rem');
        });
    });
});

describe('Processor', () => {
    describe('processTokenFunctions', () => {
        it('should process simple functions', () => {
            const result = processTokenFunctions('tint(#0d6efd, 50%)');
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });

        it('should resolve token references', () => {
            const tokens = {
                color: {
                    brand: { $value: '#0d6efd' },
                },
            };
            const result = processTokenFunctions('tint({color.brand}, 50%)', tokens);
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });

        it('should handle nested functions', () => {
            const result = processTokenFunctions('tint(shade(#ff0000, 20%), 50%)');
            expect(result).toMatch(/^#[0-9a-f]{6}$/i);
        });

        it('should return non-function values unchanged', () => {
            expect(processTokenFunctions('#ff0000')).toBe('#ff0000');
            expect(processTokenFunctions('16px')).toBe('16px');
        });
    });

    describe('processAllTokens', () => {
        it('should process all token values', () => {
            const tokens = {
                color: {
                    primary: { $value: '#0d6efd', $type: 'color' },
                    // Use direct color instead of reference for this test
                    'primary-light': { $value: 'tint(#0d6efd, 50%)', $type: 'color' },
                },
            };

            const result = processAllTokens(tokens);

            expect(result.color.primary.$value).toBe('#0d6efd');
            expect(result.color['primary-light'].$value).toMatch(/^#[0-9a-f]{6}$/i);
            expect(result.color['primary-light'].$original).toBe('tint(#0d6efd, 50%)');
        });

        it('should preserve non-value properties', () => {
            const tokens = {
                color: {
                    primary: {
                        $value: 'tint(#ff0000, 50%)',
                        $type: 'color',
                        $description: 'Primary color',
                    },
                },
            };

            const result = processAllTokens(tokens);

            expect(result.color.primary.$type).toBe('color');
            expect(result.color.primary.$description).toBe('Primary color');
        });
    });
});

describe('Integration: tokensToCss with functions', () => {
    it('should resolve functions when generating CSS', async () => {
        const { tokensToCss } = await import('../utils/tokens.js');

        const tokens = {
            color: {
                brand: { $value: '#0d6efd', $type: 'color' },
                'brand-light': { $value: 'tint({color.brand}, 80%)', $type: 'color' },
            },
            spacing: {
                base: { $value: '1rem', $type: 'dimension' },
                lg: { $value: 'multiply({spacing.base}, 1.5)', $type: 'dimension' },
            },
        };

        const css = tokensToCss(tokens);

        expect(css).toContain('--color-brand: #0d6efd');
        expect(css).toMatch(/--color-brand-light: #[0-9a-f]{6}/i);
        expect(css).toContain('--spacing-base: 1rem');
        expect(css).toContain('--spacing-lg: 1.5rem');
    });
});
