// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

import { describe, it, expect } from 'vitest';
import {
    extractTokensFromCSS,
    extractTokensFromScss,
    tokensToCss,
    tokensToScss,
    tokensToStyleDictionary,
    validateTokens,
    mergeTokens,
    TOKEN_TYPES
} from '../utils/tokens.js';

describe('extractTokensFromCSS', () => {
    it('should extract CSS custom properties as tokens', () => {
        const css = `
:root {
    --color-primary: #007bff;
    --color-secondary: #6c757d;
    --spacing-sm: 8px;
    --spacing-md: 16px;
}
`;
        const tokens = extractTokensFromCSS(css);

        expect(tokens.color).toBeDefined();
        expect(tokens.color.primary.$value).toBe('#007bff');
        expect(tokens.color.secondary.$value).toBe('#6c757d');
        expect(tokens.spacing.sm.$value).toBe('8px');
    });

    it('should infer token types correctly', () => {
        const css = `
:root {
    --color-red: #ff0000;
    --size-large: 24px;
    --font-weight-bold: 700;
    --duration-fast: 200ms;
    --opacity-half: 0.5;
}
`;
        const tokens = extractTokensFromCSS(css);

        expect(tokens.color.red.$type).toBe(TOKEN_TYPES.COLOR);
        expect(tokens.size.large.$type).toBe(TOKEN_TYPES.DIMENSION);
        expect(tokens.font.weight.bold.$type).toBe(TOKEN_TYPES.FONT_WEIGHT);
        expect(tokens.duration.fast.$type).toBe(TOKEN_TYPES.DURATION);
        expect(tokens.opacity.half.$type).toBe(TOKEN_TYPES.NUMBER);
    });

    it('should filter by prefix', () => {
        const css = `
:root {
    --color-primary: blue;
    --spacing-sm: 8px;
    --color-secondary: red;
}
`;
        const tokens = extractTokensFromCSS(css, { prefix: 'color' });

        expect(tokens.color).toBeDefined();
        expect(tokens.spacing).toBeUndefined();
    });

    it('should extract comments as descriptions', () => {
        const css = `
:root {
    /* Primary brand color */
    --color-primary: #007bff;
}
`;
        const tokens = extractTokensFromCSS(css, { includeComments: true });

        expect(tokens.color.primary.$description).toBe('Primary brand color');
    });
});

describe('extractTokensFromScss', () => {
    it('should extract SCSS variables as tokens', () => {
        const scss = `
$color-primary: #007bff;
$spacing-base: 16px;
$font-family-sans: "Helvetica", sans-serif;
`;
        const tokens = extractTokensFromScss(scss);

        expect(tokens.color.primary.$value).toBe('#007bff');
        expect(tokens.spacing.base.$value).toBe('16px');
        expect(tokens.font.family.sans.$type).toBe(TOKEN_TYPES.FONT_FAMILY);
    });

    it('should extract SCSS comments as descriptions', () => {
        const scss = `
// Main brand color used throughout the app
$brand-color: #ff5500;
`;
        const tokens = extractTokensFromScss(scss, { includeComments: true });

        expect(tokens.brand.color.$description).toBe('Main brand color used throughout the app');
    });
});

describe('tokensToCss', () => {
    it('should convert tokens to CSS custom properties', () => {
        const tokens = {
            color: {
                primary: { $value: '#007bff', $type: 'color' },
                secondary: { $value: '#6c757d', $type: 'color' }
            }
        };

        const css = tokensToCss(tokens);

        expect(css).toContain(':root {');
        expect(css).toContain('--color-primary: #007bff;');
        expect(css).toContain('--color-secondary: #6c757d;');
    });

    it('should use custom selector', () => {
        const tokens = {
            color: { primary: { $value: 'blue' } }
        };

        const css = tokensToCss(tokens, { selector: '.dark-theme' });

        expect(css).toContain('.dark-theme {');
    });

    it('should include descriptions as comments', () => {
        const tokens = {
            color: {
                primary: {
                    $value: '#007bff',
                    $description: 'Brand color'
                }
            }
        };

        const css = tokensToCss(tokens, { includeComments: true });

        expect(css).toContain('/* Brand color */');
    });

    it('should resolve token references', () => {
        const tokens = {
            color: {
                base: { $value: '#007bff' },
                primary: { $value: '{color.base}' }
            }
        };

        const css = tokensToCss(tokens);

        expect(css).toContain('--color-primary: #007bff;');
    });
});

describe('tokensToScss', () => {
    it('should convert tokens to SCSS variables', () => {
        const tokens = {
            spacing: {
                sm: { $value: '8px' },
                md: { $value: '16px' }
            }
        };

        const scss = tokensToScss(tokens);

        expect(scss).toContain('$spacing-sm: 8px;');
        expect(scss).toContain('$spacing-md: 16px;');
    });

    it('should include SCSS map by default', () => {
        const tokens = {
            color: { primary: { $value: 'blue' } }
        };

        const scss = tokensToScss(tokens, { includeMap: true });

        expect(scss).toContain('$design-tokens: (');
        expect(scss).toContain("'color-primary': $color-primary");
    });
});

describe('tokensToStyleDictionary', () => {
    it('should convert to Style Dictionary format', () => {
        const tokens = {
            color: {
                primary: {
                    $value: '#007bff',
                    $type: 'color',
                    $description: 'Primary color'
                }
            }
        };

        const sd = tokensToStyleDictionary(tokens);

        expect(sd.color.primary.value).toBe('#007bff');
        expect(sd.color.primary.type).toBe('color');
        expect(sd.color.primary.description).toBe('Primary color');
    });
});

describe('validateTokens', () => {
    it('should pass valid tokens', () => {
        const tokens = {
            color: {
                primary: { $value: '#007bff', $type: 'color' }
            }
        };

        const errors = validateTokens(tokens);

        expect(errors).toHaveLength(0);
    });

    it('should detect missing $value', () => {
        const tokens = {
            color: {
                primary: { $type: 'color' } // missing $value
            }
        };

        const errors = validateTokens(tokens);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].message).toContain('$value');
    });

    it('should detect invalid token type', () => {
        const tokens = {
            color: {
                primary: { $value: 'blue', $type: 'invalid-type' }
            }
        };

        const errors = validateTokens(tokens);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].message).toContain('Invalid token type');
    });
});

describe('mergeTokens', () => {
    it('should merge multiple token sets', () => {
        const tokens1 = {
            color: { primary: { $value: 'blue' } }
        };
        const tokens2 = {
            color: { secondary: { $value: 'gray' } }
        };

        const merged = mergeTokens(tokens1, tokens2);

        expect(merged.color.primary.$value).toBe('blue');
        expect(merged.color.secondary.$value).toBe('gray');
    });

    it('should override values in merge order', () => {
        const tokens1 = {
            color: { primary: { $value: 'blue' } }
        };
        const tokens2 = {
            color: { primary: { $value: 'red' } }
        };

        const merged = mergeTokens(tokens1, tokens2);

        expect(merged.color.primary.$value).toBe('red');
    });
});
