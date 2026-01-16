// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * SCSS Compilation utilities
 * Handles SCSS compilation with custom importers for node_modules and SVG files
 */
import chalk from 'chalk';
import path from 'path';
import * as sass from 'sass-embedded';
import stylelint from 'stylelint';
import { readFileSync, writeFileSync, ensureFileDir, existsSync } from '../fs.js';
import { extractAnnotations } from '../annotations.js';
import { loadConfig, getClassPrefix, getTokenPrefix, transformCssPrefix, transformCssVariableReferences, transformCssVariableDeclarations, DEFAULT_CLASS_PREFIX } from '../config/loader.js';
import { BuildError, HINTS } from '../errors.js';

/**
 * Custom SCSS importer for node_modules (~prefix)
 * Allows importing from node_modules using ~ prefix
 */
const nodeModulesImporter = {
    canonicalize(url) {
        if (!url.startsWith('~')) {
            return null;
        }
        const fileInModules = path.resolve(process.cwd(), 'node_modules', url.substring(1));
        return new URL(`file://${fileInModules}`);
    },
    load(canonicalUrl) {
        try {
            const filePath = canonicalUrl.pathname;
            const normalizedFilePath = process.platform === 'win32'
                ? path.normalize(filePath.slice(1))
                : path.normalize(filePath);
            const fileContents = readFileSync(normalizedFilePath);

            return {
                contents: fileContents,
                syntax: 'scss'
            };
        } catch (error) {
            console.error(`Error reading file ${canonicalUrl}: ${error.message}`);
            throw error;
        }
    }
};

/**
 * Custom SCSS importer for SVG files
 * Converts SVG files to base64-encoded data URIs
 */
const svgImporter = {
    canonicalize(url, options) {
        if (!url.endsWith('.svg')) {
            return null;
        }
        const containingDir = path.dirname(options.containingUrl.pathname);
        const svgAbsolutePath = path.resolve(containingDir, url);
        return new URL(`file://${svgAbsolutePath}`);
    },
    load(canonicalUrl) {
        try {
            const filePath = canonicalUrl.pathname;
            const normalizedFilePath = process.platform === 'win32'
                ? path.normalize(filePath.slice(1))
                : path.normalize(filePath);
            const fileContents = readFileSync(normalizedFilePath);
            const base64Encoded = Buffer.from(fileContents).toString('base64');
            const fileName = path.basename(normalizedFilePath, '.svg');
            const sassVariable = `$${fileName}: "data:image/svg+xml;base64,${base64Encoded}";`;

            return {
                contents: sassVariable,
                syntax: 'scss'
            };
        } catch (error) {
            console.error(`Error reading file ${canonicalUrl}: ${error.message}`);
            throw error;
        }
    }
};

/**
 * Lint a CSS/SCSS file using stylelint
 * @param {string} fileContent - File content to lint
 * @returns {Promise<void>} Throws if warnings found
 */
export const lintStyleFile = async (fileContent) => {
    const result = await stylelint.lint({
        code: fileContent,
        formatter: "verbose"
    });

    if (result.results[0].warnings.length > 0) {
        console.error(chalk.bgRed.white.bold('Stylelint Warnings:'));

        result.results[0].warnings.forEach(warning => {
            const message = `${warning.line}:${warning.column} - ${warning.text}`;
            console.error(chalk.bgRed.white(message));
        });

        throw new Error("Stylelint detected warnings in the file.");
    }
};

/**
 * Compile an SCSS file to CSS
 * @param {string} filePath - Path to the SCSS file
 * @returns {Promise<string>} Compiled CSS content
 */
export const compileScss = async (filePath) => {
    const result = await sass.compile(filePath, {
        importers: [nodeModulesImporter, svgImporter]
    });
    return result.css;
};

/**
 * Process a style file: lint, compile, extract annotations, and save outputs
 * @param {string} filePath - Path to the style file
 * @param {string} sourceDir - Source directory root
 * @param {string} outputDir - Output directory root
 */
export const processStyleFile = async (filePath, sourceDir, outputDir) => {
    try {
        const fileContent = readFileSync(filePath);

        // Lint the file
        await lintStyleFile(fileContent);

        // Compile SCSS
        let compiledCss = await compileScss(filePath);

        // Transform CSS class prefix if configured
        const config = loadConfig();
        const targetPrefix = getClassPrefix(config);
        if (targetPrefix && targetPrefix !== DEFAULT_CLASS_PREFIX) {
            compiledCss = transformCssPrefix(compiledCss, targetPrefix);
        }

        // Transform CSS variable declarations and references to use token prefix
        const tokenPrefix = getTokenPrefix(config);
        if (tokenPrefix) {
            // Transform declarations: --color-primary: → --sol-color-primary:
            compiledCss = transformCssVariableDeclarations(compiledCss, tokenPrefix);
            // Transform references: var(--color-primary) → var(--sol-color-primary)
            compiledCss = transformCssVariableReferences(compiledCss, tokenPrefix);
        }

        // Extract annotations (pass filePath for better error context)
        const output = extractAnnotations(compiledCss, filePath);

        // Calculate output paths
        const relativePath = path.relative(sourceDir, filePath);
        const outputFilePath = path.join(outputDir, relativePath).replace(/\.scss$/, '.css');
        // Handle both .scss and .css files for annotation output
        const annotationOutputFilePath = path.join(outputDir, relativePath)
            .replace(/\.scss$/, '.json')
            .replace(/\.css$/, '.json');

        // Ensure output directory exists
        ensureFileDir(outputFilePath);

        // Write outputs
        writeFileSync(outputFilePath, output.css);
        writeFileSync(annotationOutputFilePath, JSON.stringify(output.annotation));

        console.log(chalk.green(`Compiled and saved to`), outputFilePath);
    } catch (error) {
        // Re-throw BuildErrors as-is, wrap other errors with context
        if (error instanceof BuildError) {
            if (!error.file) {
                error.file = filePath;
            }
            throw error;
        }

        // Determine the appropriate hint based on error type
        let hint = HINTS.FILE_READ;
        let phase = 'scss-compile';

        if (error.message?.includes('Stylelint')) {
            hint = 'Fix the Stylelint warnings shown above';
            phase = 'scss-lint';
        } else if (error.message?.includes('expected') || error.message?.includes('syntax')) {
            hint = HINTS.SCSS_SYNTAX;
        }

        throw new BuildError(
            `SCSS compilation failed`,
            {
                file: filePath,
                phase,
                hint,
                originalError: error
            }
        );
    }
};

export default {
    lintStyleFile,
    compileScss,
    processStyleFile
};
