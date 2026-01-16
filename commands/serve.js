// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

import chalk from 'chalk';
import express from 'express';
import path from 'path';
import open from 'open';
import { existsSync } from '../utils/fs.js';
import { resolvePath } from '../utils/pathResolver.js';

export const command = 'serve';
export const desc = 'Serve the generated documentation site';

export const builder = (yargs) => {
    yargs
        .option('dir', {
            alias: 'd',
            describe: 'Directory to serve',
            type: 'string',
            default: './site',
            coerce: resolvePath
        })
        .option('port', {
            alias: 'p',
            describe: 'Port to serve on',
            type: 'number',
            default: 4142
        })
        .option('open', {
            alias: 'o',
            describe: 'Open browser automatically',
            type: 'boolean',
            default: true
        })
        .option('host', {
            describe: 'Host to bind to',
            type: 'string',
            default: 'localhost'
        });
};

export const handler = async (argv) => {
    const { dir, port, host } = argv;

    // Check if directory exists
    if (!existsSync(dir)) {
        console.error(chalk.red(`Error: Directory "${dir}" does not exist.`));
        console.log(chalk.gray('\nRun `stylescribe docs` first to generate the documentation site.'));
        process.exit(1);
    }

    const app = express();

    // Serve static files
    app.use(express.static(dir));

    // SPA fallback - serve index.html for unmatched routes
    // BUT return 404 for static assets (images, screenshots, css, js, etc.)
    app.get('*', (req, res) => {
        const requestPath = req.path;

        // Don't SPA fallback for static assets - return proper 404
        const staticExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.css', '.js', '.json', '.woff', '.woff2', '.ttf', '.eot'];
        const isStaticAsset = staticExtensions.some(ext => requestPath.endsWith(ext));
        const isStaticPath = requestPath.startsWith('/static/') || requestPath.startsWith('/screenshots/');

        if (isStaticAsset || isStaticPath) {
            res.status(404).send('Not found');
            return;
        }

        const indexPath = path.join(dir, 'index.html');
        if (existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('Not found');
        }
    });

    // Start server
    const server = app.listen(port, host, () => {
        const url = `http://${host}:${port}`;

        console.log(chalk.green('\n  Documentation server running!\n'));
        console.log(`  ${chalk.gray('Local:')}   ${chalk.cyan(url)}`);
        console.log(`  ${chalk.gray('Serving:')} ${chalk.gray(dir)}`);
        console.log(chalk.gray('\n  Press Ctrl+C to stop\n'));

        // Open browser if requested
        if (argv.open) {
            open(url);
        }
    });

    // Handle shutdown
    process.on('SIGINT', () => {
        console.log(chalk.gray('\n\nShutting down server...'));
        server.close(() => {
            process.exit(0);
        });
    });
};

export default { command, desc, builder, handler };
