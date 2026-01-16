// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import fg from 'fast-glob';
import { resolvePath } from '../utils/pathResolver.js';
import {
    extractTokensFromCSS,
    extractTokensFromScss,
    tokensToCss,
    tokensToScss,
    tokensToStyleDictionary,
    validateTokens,
    mergeTokens,
    loadTokensFromFile,
    saveTokensToFile,
    TOKEN_TYPES
} from '../utils/tokens.js';

export const command = 'tokens <action>';
export const desc = 'Manage W3C Design Tokens (DTCG format)';

export const builder = (yargs) => {
    yargs
        .positional('action', {
            describe: 'Action to perform',
            choices: ['extract', 'export', 'validate', 'convert', 'merge'],
            type: 'string'
        })
        .option('input', {
            alias: 'i',
            describe: 'Input file or directory',
            type: 'string',
            coerce: resolvePath
        })
        .option('output', {
            alias: 'o',
            describe: 'Output file path',
            type: 'string',
            coerce: resolvePath
        })
        .option('format', {
            alias: 'f',
            describe: 'Output format',
            choices: ['json', 'css', 'scss', 'style-dictionary'],
            default: 'json'
        })
        .option('prefix', {
            describe: 'Filter CSS variables by prefix',
            type: 'string',
            default: ''
        })
        .option('selector', {
            describe: 'CSS selector for output (default: :root)',
            type: 'string',
            default: ':root'
        })
        .option('token-prefix', {
            describe: 'Prefix to add to all CSS variable names (e.g., "ds-" or "sol-")',
            type: 'string',
            default: ''
        })
        .example('$0 tokens extract -i ./src/tokens.css -o ./tokens.json', 'Extract tokens from CSS to W3C format')
        .example('$0 tokens export -i ./tokens.json -f css -o ./variables.css', 'Export tokens to CSS')
        .example('$0 tokens validate -i ./tokens.json', 'Validate token file')
        .example('$0 tokens convert -i ./tokens.json -f scss -o ./tokens.scss', 'Convert to SCSS')
        .example('$0 tokens merge -i "./tokens/*.json" -o ./merged.json', 'Merge multiple token files');
};

export const handler = async (argv) => {
    try {
        switch (argv.action) {
            case 'extract':
                await handleExtract(argv);
                break;
            case 'export':
                await handleExport(argv);
                break;
            case 'validate':
                await handleValidate(argv);
                break;
            case 'convert':
                await handleConvert(argv);
                break;
            case 'merge':
                await handleMerge(argv);
                break;
            default:
                console.error(chalk.red(`Unknown action: ${argv.action}`));
                process.exit(1);
        }
    } catch (error) {
        console.error(chalk.bgRed.white.bold('Error:'), chalk.bold(error.message));
        console.error(chalk.gray(error.stack));
        process.exit(1);
    }
};

async function handleExtract(argv) {
    if (!argv.input) {
        throw new Error('Input file or directory is required (-i)');
    }

    const inputPath = argv.input;
    const outputPath = argv.output || path.join(process.cwd(), 'tokens.json');

    let allTokens = {};

    const stat = await fs.stat(inputPath);

    if (stat.isDirectory()) {
        // Extract from all CSS/SCSS files in directory
        const files = await fg([`${inputPath}/**/*.css`, `${inputPath}/**/*.scss`]);

        for (const file of files) {
            console.log(chalk.gray(`Processing: ${file}`));
            const content = await fs.readFile(file, 'utf-8');

            let tokens;
            if (file.endsWith('.scss')) {
                tokens = extractTokensFromScss(content, { prefix: argv.prefix });
            } else {
                tokens = extractTokensFromCSS(content, { prefix: argv.prefix });
            }

            allTokens = mergeTokens(allTokens, tokens);
        }
    } else {
        // Extract from single file
        const content = await fs.readFile(inputPath, 'utf-8');

        if (inputPath.endsWith('.scss')) {
            allTokens = extractTokensFromScss(content, { prefix: argv.prefix });
        } else {
            allTokens = extractTokensFromCSS(content, { prefix: argv.prefix });
        }
    }

    const tokenCount = countTokens(allTokens);

    await saveTokensToFile(allTokens, outputPath);

    console.log(chalk.green(`✓ Extracted ${tokenCount} tokens to ${outputPath}`));
    console.log(chalk.gray('Token groups:'));
    printTokenStructure(allTokens, '  ');
}

async function handleExport(argv) {
    if (!argv.input) {
        throw new Error('Input token file is required (-i)');
    }

    const tokens = await loadTokensFromFile(argv.input);
    const tokenPrefix = argv.tokenPrefix || '';
    let output;
    let defaultExt;

    switch (argv.format) {
        case 'css':
            output = tokensToCss(tokens, { selector: argv.selector, tokenPrefix });
            defaultExt = '.css';
            break;
        case 'scss':
            output = tokensToScss(tokens, { tokenPrefix });
            defaultExt = '.scss';
            break;
        case 'style-dictionary':
            output = JSON.stringify(tokensToStyleDictionary(tokens), null, 2);
            defaultExt = '.json';
            break;
        case 'json':
        default:
            output = JSON.stringify(tokens, null, 2);
            defaultExt = '.json';
            break;
    }

    const outputPath = argv.output || path.join(process.cwd(), `tokens${defaultExt}`);
    await fs.writeFile(outputPath, output, 'utf-8');

    console.log(chalk.green(`✓ Exported tokens to ${outputPath} (${argv.format} format)`));
}

async function handleValidate(argv) {
    if (!argv.input) {
        throw new Error('Input token file is required (-i)');
    }

    const tokens = await loadTokensFromFile(argv.input);
    const errors = validateTokens(tokens);

    if (errors.length === 0) {
        console.log(chalk.green('✓ Token file is valid!'));
        console.log(chalk.gray(`  Total tokens: ${countTokens(tokens)}`));
    } else {
        console.log(chalk.red(`✗ Found ${errors.length} validation error(s):`));
        for (const error of errors) {
            console.log(chalk.red(`  - ${error.path}: ${error.message}`));
            if (error.validTypes) {
                console.log(chalk.gray(`    Valid types: ${error.validTypes.join(', ')}`));
            }
        }
        process.exit(1);
    }
}

async function handleConvert(argv) {
    // Same as export, just a more intuitive command name
    await handleExport(argv);
}

async function handleMerge(argv) {
    if (!argv.input) {
        throw new Error('Input pattern is required (-i)');
    }

    const files = await fg([argv.input]);

    if (files.length === 0) {
        throw new Error(`No files found matching: ${argv.input}`);
    }

    console.log(chalk.gray(`Merging ${files.length} token file(s)...`));

    const tokenSets = [];
    for (const file of files) {
        console.log(chalk.gray(`  - ${file}`));
        const tokens = await loadTokensFromFile(file);
        tokenSets.push(tokens);
    }

    const merged = mergeTokens(...tokenSets);
    const outputPath = argv.output || path.join(process.cwd(), 'tokens-merged.json');

    await saveTokensToFile(merged, outputPath);

    console.log(chalk.green(`✓ Merged ${files.length} files into ${outputPath}`));
    console.log(chalk.gray(`  Total tokens: ${countTokens(merged)}`));
}

function countTokens(tokens, count = 0) {
    for (const value of Object.values(tokens)) {
        if (value && typeof value === 'object') {
            if ('$value' in value) {
                count++;
            } else {
                count = countTokens(value, count);
            }
        }
    }
    return count;
}

function printTokenStructure(tokens, indent = '', maxDepth = 2, currentDepth = 0) {
    if (currentDepth >= maxDepth) return;

    for (const [key, value] of Object.entries(tokens)) {
        if (key.startsWith('$')) continue;

        if (value && typeof value === 'object' && !('$value' in value)) {
            const tokenCount = countTokens(value);
            console.log(chalk.gray(`${indent}${key}/ (${tokenCount} tokens)`));
            printTokenStructure(value, indent + '  ', maxDepth, currentDepth + 1);
        }
    }
}

export default { command, desc, builder, handler };
