// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Playwright installation helper
 * Checks if Playwright is available and prompts for installation if not
 * Installs playwright into stylescribe's own node_modules (not user's project)
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Stylescribe's root directory (go up from utils/screenshots)
const stylescribeRoot = path.join(__dirname, '..', '..');

/**
 * Check if Playwright is installed and browsers are available
 * Checks stylescribe's own node_modules
 * @returns {Promise<boolean>} True if Playwright is ready to use
 */
export async function isPlaywrightInstalled() {
    try {
        // Check stylescribe's own node_modules using import.meta.url
        const stylescribeRequire = createRequire(import.meta.url);
        const { chromium } = stylescribeRequire('playwright');

        // Try to get executable path - this will throw if browsers aren't installed
        const executablePath = chromium.executablePath();

        // Check if the executable exists
        const { existsSync } = await import('fs');
        return existsSync(executablePath);
    } catch {
        return false;
    }
}

/**
 * Install Playwright and Chromium browser into stylescribe's node_modules
 * @returns {Promise<boolean>} True if installation succeeded
 */
export async function installPlaywright() {
    console.log(chalk.blue('\nInstalling Playwright and Chromium browser...'));
    console.log(chalk.gray('This may take a few minutes.\n'));

    return new Promise((resolve) => {
        // Install playwright into stylescribe's own node_modules
        // This way it's shared across all projects using stylescribe
        const npmInstall = spawn('npm', ['install', 'playwright', '--no-save'], {
            cwd: stylescribeRoot,
            stdio: 'inherit',
            shell: true
        });

        npmInstall.on('close', (code) => {
            if (code !== 0) {
                console.error(chalk.red('Failed to install Playwright package'));
                resolve(false);
                return;
            }

            console.log(chalk.green('Playwright package installed'));
            console.log(chalk.blue('\nDownloading Chromium browser...'));

            // Then install Chromium browser (runs from stylescribe's directory)
            const browserInstall = spawn('npx', ['playwright', 'install', 'chromium'], {
                cwd: stylescribeRoot,
                stdio: 'inherit',
                shell: true
            });

            browserInstall.on('close', (browserCode) => {
                if (browserCode !== 0) {
                    console.error(chalk.red('Failed to install Chromium browser'));
                    resolve(false);
                    return;
                }

                console.log(chalk.green('\nPlaywright and Chromium installed successfully!'));
                resolve(true);
            });
        });
    });
}

/**
 * Check for Playwright and prompt for installation if needed
 * @returns {Promise<boolean>} True if Playwright is available (either already installed or just installed)
 */
export async function ensurePlaywrightInstalled() {
    // Check if already installed
    const installed = await isPlaywrightInstalled();

    if (installed) {
        return true;
    }

    // Playwright not installed, prompt user
    console.log(chalk.yellow('\nPlaywright is required for screenshot generation but is not installed.'));
    console.log(chalk.gray('Playwright is used to capture screenshots of your components.\n'));

    const shouldInstall = await confirm({
        message: 'Would you like to install Playwright now?',
        default: true
    });

    if (!shouldInstall) {
        console.log(chalk.gray('\nScreenshot generation skipped. Run this command again when ready to install.'));
        return false;
    }

    // Install Playwright
    const success = await installPlaywright();

    if (!success) {
        console.log(chalk.red('\nPlaywright installation failed.'));
        console.log(chalk.gray('You can try installing manually from the stylescribe directory:'));
        console.log(chalk.cyan(`  cd ${stylescribeRoot}`));
        console.log(chalk.cyan('  npm install playwright'));
        console.log(chalk.cyan('  npx playwright install chromium'));
        return false;
    }

    return true;
}

export default {
    isPlaywrightInstalled,
    installPlaywright,
    ensurePlaywrightInstalled
};
