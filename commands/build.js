// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

import chalk from 'chalk';
import { buildComponentsData, buildCssAndAnnotation, processPackageFiles } from '../utils/fileOperations.js';
import { generateBundles } from '../utils/bundles/generator.js';
import { resolvePath } from '../utils/pathResolver.js';
import { formatBuildError } from '../utils/errors.js';

export const command = 'build';
export const desc = 'Generate CSS, annotations, and bundles';

export const builder = (yargs) => {
    yargs
        .option('source', {
            describe: 'Source directory of CSS/SCSS files',
            type: 'string',
            demandOption: true,
            default: "./sass",
            coerce: resolvePath
        })
        .option('output', {
            describe: 'Output directory for the generated site',
            type: 'string',
            demandOption: true,
            default: "./build",
            coerce: resolvePath
        })
        .option('bundles', {
            describe: 'Generate CSS bundles (themes, all-in-one)',
            type: 'boolean',
            default: true
        });
};

export const handler = async (argv) => {
    try {
        // Build CSS and extract annotations
        await buildCssAndAnnotation(argv.source, argv.output, false);
        await buildComponentsData(argv.source, argv.output, false);
        processPackageFiles(process.cwd(), argv.output);

        // Generate CSS bundles (themes, combined, per-theme)
        if (argv.bundles !== false) {
            await generateBundles(argv.source, argv.output);
        }
    } catch (error) {
        formatBuildError(error);
        process.exit(1);
    }
};

export default { command, desc, builder, handler };
