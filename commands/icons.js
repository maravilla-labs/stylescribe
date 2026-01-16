// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Icons CLI Command
 *
 * Discover and search for SVG icons from installed npm packages
 */

import chalk from 'chalk';
import {
    listInstalledIconPackages,
    searchIcons,
    discoverIcons,
    getIconPath,
    getSupportedPackagesDoc,
    ICON_PACKAGES,
} from '../mcp/icons.js';

export const command = 'icons <action>';
export const desc = 'Manage SVG icon assets from npm packages';

export const builder = (yargs) => {
    return yargs
        .positional('action', {
            describe: 'Action to perform',
            choices: ['list', 'search', 'discover', 'path', 'supported'],
        })
        .option('query', {
            alias: 'q',
            type: 'string',
            describe: 'Search query for icon names',
        })
        .option('package', {
            alias: 'p',
            type: 'string',
            describe: 'Icon package name (e.g., bootstrap-icons, lucide-static)',
        })
        .option('icon', {
            alias: 'i',
            type: 'string',
            describe: 'Icon name',
        })
        .option('limit', {
            alias: 'l',
            type: 'number',
            default: 50,
            describe: 'Maximum number of results to show',
        })
        .example('$0 icons list', 'List installed icon packages')
        .example('$0 icons search -q trash', 'Search for icons matching "trash"')
        .example(
            '$0 icons discover -p bootstrap-icons',
            'List all icons in bootstrap-icons'
        )
        .example(
            '$0 icons path -p bootstrap-icons -i trash',
            'Get token path for an icon'
        )
        .example('$0 icons supported', 'Show all supported icon packages');
};

export const handler = async (argv) => {
    const { action, query, package: packageName, icon, limit } = argv;

    switch (action) {
        case 'list': {
            const installed = listInstalledIconPackages();

            if (installed.length === 0) {
                console.log(chalk.yellow('No icon packages found.\n'));
                console.log('To add icons, install a supported package:\n');
                console.log(chalk.cyan('  npm install bootstrap-icons'));
                console.log(chalk.cyan('  npm install lucide-static'));
                console.log('\nSupported packages:\n');
                console.log(getSupportedPackagesDoc());
            } else {
                console.log(chalk.bold('\nInstalled icon packages:\n'));
                for (const pkg of installed) {
                    console.log(chalk.green(`  ${pkg.name}`), chalk.gray(`(${pkg.package})`));
                    console.log(chalk.gray(`    Icons: ${pkg.count}`));
                    console.log(chalk.gray(`    Pattern: ${pkg.pathPattern}`));
                    console.log(chalk.gray(`    Website: ${pkg.website}\n`));
                }
            }
            break;
        }

        case 'search': {
            if (!query) {
                console.error(chalk.red('Error: --query (-q) is required for search'));
                process.exit(1);
            }

            const matches = searchIcons(query);

            if (matches.length === 0) {
                console.log(chalk.yellow(`No icons found matching "${query}".\n`));
                console.log('Make sure you have icon packages installed:');
                console.log(chalk.cyan('  npm install bootstrap-icons'));
                console.log(chalk.cyan('  npm install lucide-static'));
            } else {
                console.log(
                    chalk.bold(`\nFound ${matches.length} icons matching "${query}":\n`)
                );
                const limited = matches.slice(0, limit);
                for (const match of limited) {
                    console.log(chalk.green(`  ${match.name}`), chalk.gray(`(${match.packageName})`));
                    console.log(chalk.gray(`    ${match.path}\n`));
                }
                if (matches.length > limit) {
                    console.log(
                        chalk.gray(`  ... and ${matches.length - limit} more results`)
                    );
                    console.log(chalk.gray(`  Use --limit to show more results\n`));
                }
            }
            break;
        }

        case 'discover': {
            if (!packageName) {
                console.error(chalk.red('Error: --package (-p) is required for discover'));
                process.exit(1);
            }

            const pkgInfo = discoverIcons(packageName);

            if (!pkgInfo) {
                console.error(chalk.red(`Package not found or not installed: ${packageName}`));
                console.log(chalk.gray(`\nInstall with: npm install ${packageName}`));
                process.exit(1);
            }

            console.log(chalk.bold(`\n${pkgInfo.name}`), chalk.gray(`(${pkgInfo.count} icons)\n`));
            console.log(chalk.gray(`Path pattern: ${pkgInfo.pathPattern}`));
            console.log(chalk.gray(`Website: ${pkgInfo.website}\n`));
            console.log(chalk.bold('Icons:\n'));

            const limited = pkgInfo.icons.slice(0, limit);
            // Print in columns
            const columns = 4;
            const colWidth = 25;
            for (let i = 0; i < limited.length; i += columns) {
                const row = limited.slice(i, i + columns);
                console.log('  ' + row.map((n) => n.padEnd(colWidth)).join(''));
            }

            if (pkgInfo.icons.length > limit) {
                console.log(
                    chalk.gray(`\n  ... and ${pkgInfo.icons.length - limit} more icons`)
                );
                console.log(chalk.gray(`  Use --limit to show more\n`));
            }
            break;
        }

        case 'path': {
            if (!packageName || !icon) {
                console.error(
                    chalk.red('Error: --package (-p) and --icon (-i) are required for path')
                );
                process.exit(1);
            }

            const iconPath = getIconPath(packageName, icon);

            if (!iconPath) {
                console.error(chalk.red(`Unknown package: ${packageName}`));
                console.log(chalk.gray('\nSupported packages:'));
                Object.keys(ICON_PACKAGES).forEach((p) => {
                    console.log(chalk.gray(`  - ${p}`));
                });
                process.exit(1);
            }

            console.log(chalk.bold('\nIcon path:\n'));
            console.log(chalk.green(`  ${iconPath}\n`));
            console.log(chalk.bold('Token format (W3C DTCG):\n'));
            console.log(chalk.cyan(`  {`));
            console.log(chalk.cyan(`    "assets": {`));
            console.log(chalk.cyan(`      "icons": {`));
            console.log(chalk.cyan(`        "your-category": {`));
            console.log(chalk.cyan(`          "${icon}": {`));
            console.log(chalk.cyan(`            "$value": "${iconPath}",`));
            console.log(chalk.cyan(`            "$type": "asset",`));
            console.log(chalk.cyan(`            "$description": "Description here"`));
            console.log(chalk.cyan(`          }`));
            console.log(chalk.cyan(`        }`));
            console.log(chalk.cyan(`      }`));
            console.log(chalk.cyan(`    }`));
            console.log(chalk.cyan(`  }\n`));
            break;
        }

        case 'supported': {
            console.log(chalk.bold('\nSupported icon packages:\n'));
            console.log(getSupportedPackagesDoc());
            console.log('\nInstall any package with:');
            console.log(chalk.cyan('  npm install <package-name>\n'));
            break;
        }

        default:
            console.error(chalk.red(`Unknown action: ${action}`));
            process.exit(1);
    }
};

export default { command, desc, builder, handler };
