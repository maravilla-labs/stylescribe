// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Eject theme preset to config for customization
 * Exports all Tailwind classes from a preset to .stylescriberc.json
 */

import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { THEME_PRESETS, getPresetNames, presetExists } from '../utils/config/themePresets.js';

export const command = 'eject-theme [preset]';
export const desc = 'Eject theme preset to config for Tailwind class customization';

export const builder = (yargs) => {
    const presets = getPresetNames();
    yargs
        .positional('preset', {
            describe: `Theme preset to eject (${presets.join(', ')})`,
            type: 'string'
        })
        .option('list', {
            alias: 'l',
            describe: 'List available theme presets',
            type: 'boolean',
            default: false
        })
        .option('show', {
            alias: 's',
            describe: 'Show theme classes without ejecting',
            type: 'boolean',
            default: false
        });
};

export const handler = async (argv) => {
    const { preset, list, show } = argv;

    // List available presets
    if (list) {
        console.log(chalk.cyan('\n  Available theme presets:\n'));
        const presets = getPresetNames();
        presets.forEach(name => {
            const theme = THEME_PRESETS[name];
            const accent = theme.accent || '#667eea';
            console.log(`  ${chalk.bold(name.padEnd(12))} ${chalk.gray(`accent: ${accent}`)}`);
        });
        console.log();
        return;
    }

    // Load current config
    const configPath = path.join(process.cwd(), '.stylescriberc.json');
    let config = {};

    if (await fs.pathExists(configPath)) {
        try {
            config = await fs.readJson(configPath);
        } catch (err) {
            console.log(chalk.red(`\n  Error reading config: ${err.message}\n`));
            process.exit(1);
        }
    }

    // Determine which preset to eject
    let presetToEject = preset;

    if (!presetToEject) {
        // Use current theme if it's a string preset name
        const currentTheme = config?.branding?.theme;
        if (typeof currentTheme === 'string') {
            presetToEject = currentTheme;
        } else if (typeof currentTheme === 'object' && currentTheme.preset) {
            presetToEject = currentTheme.preset;
        } else {
            presetToEject = 'default';
        }
    }

    // Validate preset
    if (!presetExists(presetToEject)) {
        console.log(chalk.red(`\n  Error: Theme preset "${presetToEject}" not found.`));
        console.log(chalk.gray(`  Available presets: ${getPresetNames().join(', ')}\n`));
        process.exit(1);
    }

    const themeObject = THEME_PRESETS[presetToEject];

    // Show mode - display theme classes without ejecting
    if (show) {
        console.log(chalk.cyan(`\n  Theme: ${presetToEject}\n`));
        console.log(chalk.gray('  ' + '-'.repeat(50)));

        for (const [section, classes] of Object.entries(themeObject)) {
            if (section === 'accent') {
                console.log(`\n  ${chalk.bold(section)}: ${chalk.yellow(classes)}`);
            } else if (typeof classes === 'object') {
                console.log(`\n  ${chalk.bold(section)}:`);
                for (const [key, value] of Object.entries(classes)) {
                    console.log(`    ${chalk.gray(key.padEnd(15))} ${chalk.green(value)}`);
                }
            }
        }

        console.log('\n' + chalk.gray('  ' + '-'.repeat(50)));
        console.log(chalk.gray(`\n  Run without --show to eject to config.\n`));
        return;
    }

    // Eject theme to config
    console.log(chalk.cyan(`\n  Ejecting theme: ${presetToEject}\n`));

    // Ensure branding exists
    config.branding = config.branding || {};

    // Set theme as object with preset reference and all classes
    config.branding.theme = {
        preset: presetToEject,
        ...themeObject
    };

    // Write updated config
    try {
        await fs.writeJson(configPath, config, { spaces: 2 });
        console.log(chalk.green('  ✓') + chalk.gray(` Updated .stylescriberc.json`));
    } catch (err) {
        console.log(chalk.red(`\n  Error writing config: ${err.message}\n`));
        process.exit(1);
    }

    console.log(chalk.cyan('\n  Theme ejected successfully!\n'));

    // Show what was added
    console.log(chalk.bold('  Ejected sections:'));
    const sections = Object.keys(themeObject).filter(k => k !== 'accent');
    sections.forEach(section => {
        const keys = Object.keys(themeObject[section]);
        console.log(`    ${chalk.gray('•')} ${section}: ${chalk.gray(keys.join(', '))}`);
    });

    console.log(chalk.bold('\n  Next steps:\n'));
    console.log(chalk.gray('  1. Open .stylescriberc.json'));
    console.log(chalk.gray('  2. Edit Tailwind classes under branding.theme'));
    console.log(chalk.gray('  3. Run "npm run build" to see changes'));
    console.log();

    // Show example
    console.log(chalk.bold('  Example customization:'));
    console.log(chalk.gray('  Change hero background:'));
    console.log(chalk.yellow('    "hero": {'));
    console.log(chalk.yellow('      "background": "bg-gradient-to-r from-purple-600 to-pink-500"'));
    console.log(chalk.yellow('    }'));
    console.log();
};

export default { command, desc, builder, handler };
