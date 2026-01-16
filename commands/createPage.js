// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { resolvePath } from '../utils/pathResolver.js';

export const command = 'create-page <name>';
export const desc = 'Create a new documentation page';

export const builder = (yargs) => {
    yargs
        .positional('name', {
            describe: 'Name of the page to create',
            type: 'string'
        })
        .option('docs', {
            describe: 'Documentation directory',
            type: 'string',
            default: "./docs",
            coerce: resolvePath
        })
        .option('title', {
            describe: 'Page title',
            type: 'string'
        });
};

export const handler = async (argv) => {
    try {
        const docsDir = argv.docs;
        const fileName = `${argv.name}.md`;
        const filePath = path.join(docsDir, fileName);

        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
        }

        if (fs.existsSync(filePath)) {
            console.error(chalk.red(`Page "${argv.name}" already exists at ${filePath}`));
            process.exit(1);
        }

        const title = argv.title || argv.name.charAt(0).toUpperCase() + argv.name.slice(1);

        const pageTemplate = `---
title: ${title}
slug: ${argv.name}
---

# ${title}

Add your documentation content here.
`;

        fs.writeFileSync(filePath, pageTemplate);

        console.log(chalk.green(` Created documentation page "${argv.name}" at ${filePath}`));
    } catch (error) {
        console.error(chalk.bgRed.white.bold('Error creating page:'), chalk.bold(error.message));
        console.error(chalk.gray(error.stack));
        process.exit(1);
    }
};

export default { command, desc, builder, handler };
