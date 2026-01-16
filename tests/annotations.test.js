// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

import { describe, it, expect } from 'vitest';
import { extractAnnotations } from '../utils/annotations.js';

describe('extractAnnotations', () => {
    it('should extract basic annotations from CSS comment', () => {
        const css = `
/**
 * @title Button Component
 * @description A button component for user interactions
 * @group Components
 */
.button {
    display: inline-block;
}
`;
        const result = extractAnnotations(css);

        expect(result.annotation).toBeDefined();
        expect(result.annotation.title).toBe('Button Component');
        expect(result.annotation.description).toBe('A button component for user interactions');
        expect(result.annotation.group).toBe('Components');
        expect(result.css).toContain('.button');
    });

    it('should extract variations as array', () => {
        const css = `
/**
 * @title Button
 * @variations primary, secondary, danger
 */
.button { color: red; }
`;
        const result = extractAnnotations(css);

        expect(result.annotation.variations).toEqual(['primary', 'secondary', 'danger']);
    });

    it('should extract elements as array', () => {
        const css = `
/**
 * @title Card
 * @elements header, body, footer
 */
.card { display: flex; }
`;
        const result = extractAnnotations(css);

        expect(result.annotation.elements).toEqual(['header', 'body', 'footer']);
    });

    it('should extract CSS variables used in the component', () => {
        const css = `
/**
 * @title Theme
 */
.theme {
    color: var(--primary-color);
    background: var(--bg-color);
    border: 1px solid var(--primary-color);
}
`;
        const result = extractAnnotations(css);

        expect(result.annotation.cssVars).toContain('primary-color');
        expect(result.annotation.cssVars).toContain('bg-color');
        // Should be deduplicated
        expect(result.annotation.cssVars.length).toBe(2);
    });

    it('should return only css when no annotations present', () => {
        const css = `.plain { color: blue; }`;
        const result = extractAnnotations(css);

        expect(result.css).toBe(css);
        expect(result.annotation).toBeUndefined();
    });

    it('should throw error for reserved word cssVars', () => {
        const css = `
/**
 * @cssVars should not be allowed
 */
.component { color: red; }
`;
        // Error is now wrapped in BuildError, check that it throws and contains the reserved word info
        expect(() => extractAnnotations(css)).toThrow();
        try {
            extractAnnotations(css);
        } catch (error) {
            // BuildError wraps the original error - check originalError for reserved word message
            expect(error.originalError?.message || error.message).toContain('reserved word');
        }
    });

    it('should handle examples as comma-separated list', () => {
        const css = `
/**
 * @title Card
 * @examples basic, advanced, responsive
 */
.card { display: block; }
`;
        const result = extractAnnotations(css);

        expect(result.annotation.examples).toBeInstanceOf(Array);
        expect(result.annotation.examples.length).toBe(3);
        expect(result.annotation.examples[0]).toBe('basic');
    });

    it('should handle multiline descriptions', () => {
        const css = `
/**
 * @title Widget
 * @description This is a long description
 * that spans multiple lines
 * and has lots of details
 */
.widget { position: relative; }
`;
        const result = extractAnnotations(css);

        expect(result.annotation.description).toContain('long description');
        expect(result.annotation.description).toContain('multiple lines');
    });

    it('should handle numeric order annotation', () => {
        const css = `
/**
 * @title First Component
 * @order -10
 */
.first { display: block; }
`;
        const result = extractAnnotations(css);

        expect(result.annotation.order).toBe('-10');
    });
});
