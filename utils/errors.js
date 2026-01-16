// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Build error utilities
 * Custom error class and formatting for improved error reporting
 */
import chalk from 'chalk';

/**
 * Check if debug mode is enabled via --debug flag or environment variable
 * @returns {boolean}
 */
const isDebugMode = () => {
    return process.argv.includes('--debug') ||
           process.env.DEBUG === '1' ||
           process.env.DEBUG === 'true' ||
           process.env.STYLESCRIBE_DEBUG === '1' ||
           process.env.STYLESCRIBE_DEBUG === 'true';
};

/**
 * Common hints for build errors
 */
export const HINTS = {
    MISSING_ANNOTATION: 'Ensure your component has a @title annotation in the SCSS comment block',
    INVALID_JSON: 'Check for syntax errors in your JSON file (missing commas, quotes)',
    MISSING_VARIATIONS: 'Add @variations annotation with comma-separated values, e.g. @variations primary, secondary',
    INVALID_FRONTMATTER: 'Check YAML frontmatter syntax (ensure proper indentation and colons)',
    SCSS_SYNTAX: 'Check for SCSS syntax errors (missing semicolons, unmatched braces)',
    TEMPLATE_RENDER: 'Check that the component has all required annotations and valid structure',
    FILE_READ: 'Ensure the file exists and has proper read permissions',
    COMPONENT_AGGREGATE: 'Ensure component JSON files are valid and contain required fields',
};

/**
 * Custom error class for build errors with context tracking
 */
export class BuildError extends Error {
    /**
     * @param {string} message - Error message
     * @param {Object} options - Error context options
     * @param {string} [options.file] - Source file path
     * @param {string} [options.component] - Component name
     * @param {string} [options.phase] - Build phase (scss-compile, annotation-parse, template-render, etc.)
     * @param {string} [options.hint] - Actionable hint for fixing the issue
     * @param {Error} [options.originalError] - Original error that caused this
     */
    constructor(message, { file, component, phase, hint, originalError } = {}) {
        super(message);
        this.name = 'BuildError';
        this.file = file;
        this.component = component;
        this.phase = phase;
        this.hint = hint;
        this.originalError = originalError;

        // Capture stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BuildError);
        }
    }
}

/**
 * Format and display a build error with context
 * @param {Error} error - Error to format
 */
export const formatBuildError = (error) => {
    if (error instanceof BuildError) {
        console.error(chalk.bgRed.white.bold('\n Build Error '));
        console.error(chalk.red.bold(`\n  ${error.message}\n`));

        if (error.file) {
            console.error(chalk.yellow('  File:'), chalk.white(error.file));
        }
        if (error.component) {
            console.error(chalk.yellow('  Component:'), chalk.white(error.component));
        }
        if (error.phase) {
            console.error(chalk.yellow('  Phase:'), chalk.white(error.phase));
        }
        if (error.hint) {
            console.error(chalk.cyan('\n  Hint:'), chalk.white(error.hint));
        }
        if (error.originalError) {
            console.error(chalk.gray(`\n  Cause: ${error.originalError.message}`));
        }
        if (isDebugMode() && error.stack) {
            console.error(chalk.red(`\n${error.stack}\n`));
        } else {
            console.error(chalk.gray('\n  Run with --debug flag for full stack trace\n'));
        }
    } else {
        // Fallback for non-BuildError errors
        console.error(chalk.bgRed.white.bold('\n Error '));
        console.error(chalk.red.bold(`\n  ${error.message}\n`));
        if (isDebugMode() && error.stack) {
            console.error(chalk.red(error.stack));
        } else {
            console.error(chalk.gray('  Run with --debug flag for full stack trace\n'));
        }
    }
};

export default { BuildError, HINTS, formatBuildError };
