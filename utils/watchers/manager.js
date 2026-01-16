// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * File watcher management utilities
 * Centralized handling of chokidar file watchers
 */
import chokidar from 'chokidar';
import path from 'path';
import EventEmitter from 'events';
import { readJsonSync, writeJsonSync } from '../fs.js';

/**
 * Build events emitter for notifying when builds complete
 */
export const BuildEvents = new EventEmitter();

/**
 * Create a watcher for style files (CSS/SCSS)
 * @param {string} sourceDir - Source directory to watch
 * @param {Function} processFile - Function to process changed files
 * @returns {chokidar.FSWatcher} Chokidar watcher instance
 */
export const createStyleWatcher = (sourceDir, processFile) => {
    const watcher = chokidar.watch(
        [`${sourceDir}/**/*.css`, `${sourceDir}/**/*.scss`],
        { persistent: true }
    );

    watcher.on('change', async (filePath) => {
        console.log(`File changed: ${filePath}`);
        try {
            await processFile(filePath);
        } catch (error) {
            console.error(`Error processing file ${filePath} on change:`, error.message);
        }
    });

    return watcher;
};

/**
 * Create a watcher for markdown documentation files
 * Handles file changes, additions, deletions, and folder structure changes
 * @param {string} docsDir - Docs directory to watch
 * @param {Function} onChangeCallback - Callback when markdown files or folder structure changes
 * @returns {chokidar.FSWatcher} Chokidar watcher instance
 */
export const createDocsWatcher = (docsDir, onChangeCallback) => {
    const watcher = chokidar.watch(docsDir, {
        persistent: true,
        ignoreInitial: true,
        depth: 10
    });

    // Handle file and folder changes that affect navigation
    const handleChange = async (event, filePath) => {
        // Rebuild on markdown file changes
        if (path.extname(filePath) === '.md') {
            await onChangeCallback(filePath);
            BuildEvents.emit('sitebuild:finished');
        }
    };

    // Handle folder structure changes (for navigation rebuilding)
    const handleFolderChange = async (event, folderPath) => {
        await onChangeCallback(folderPath);
        BuildEvents.emit('sitebuild:finished');
    };

    watcher.on('change', (filePath) => handleChange('change', filePath));
    watcher.on('add', (filePath) => handleChange('add', filePath));
    watcher.on('unlink', (filePath) => handleChange('unlink', filePath));
    watcher.on('addDir', (folderPath) => handleFolderChange('addDir', folderPath));
    watcher.on('unlinkDir', (folderPath) => handleFolderChange('unlinkDir', folderPath));

    return watcher;
};

/**
 * Create a watcher for component JSON files
 * Updates components.json when individual component JSONs change
 * @param {string} outputDir - Output directory containing component JSONs
 * @param {Function} onUpdateCallback - Callback after components.json is updated
 * @returns {chokidar.FSWatcher} Chokidar watcher instance
 */
export const createComponentJsonWatcher = (outputDir, onUpdateCallback) => {
    const outputFilePath = path.join(outputDir, "components.json");

    const watcher = chokidar.watch(`${outputDir}/components/**/*.json`, {
        persistent: true,
        ignoreInitial: true,
    });

    watcher.on('change', async (changedPath) => {
        try {
            const existingData = readJsonSync(outputFilePath);
            const changedFileContent = readJsonSync(changedPath);
            const parentDir = path.dirname(changedPath);
            const relativePath = path.relative(outputDir, parentDir);
            const name = path.basename(parentDir);
            const updatedContent = { name, ...changedFileContent, path: relativePath };

            const existingIndex = existingData.findIndex(item => item.path === relativePath);

            if (existingIndex !== -1) {
                existingData[existingIndex] = updatedContent;
            } else {
                existingData.push(updatedContent);
            }

            const sortedData = existingData.sort((a, b) => {
                const orderA = a.order !== undefined ? a.order : Infinity;
                const orderB = b.order !== undefined ? b.order : Infinity;
                return orderA - orderB;
            });

            writeJsonSync(outputFilePath, sortedData);

            if (onUpdateCallback) {
                await onUpdateCallback();
            }

            BuildEvents.emit('sitebuild:finished');
        } catch (error) {
            console.error(`Error updating components.json:`, error.message);
        }
    });

    return watcher;
};

/**
 * Watch docs folder and rebuild site on changes
 * @param {string} sourceDir - Source directory
 * @param {string} outputDir - Output directory
 * @param {Function} buildSiteCallback - Function to rebuild site
 * @returns {chokidar.FSWatcher} Chokidar watcher instance
 */
export const watchDocsFolderForChanges = (sourceDir, outputDir, buildSiteCallback) => {
    const mdDir = path.join(process.cwd(), "docs");

    return createDocsWatcher(mdDir, async () => {
        await buildSiteCallback(sourceDir, outputDir, true);
    });
};

/**
 * Create a watcher for UI Blocks HTML/SCSS files
 * @param {string} blocksDir - Blocks directory to watch
 * @param {Function} onChangeCallback - Callback when block files change
 * @returns {chokidar.FSWatcher} Chokidar watcher instance
 */
export const createBlocksWatcher = (blocksDir, onChangeCallback) => {
    const watcher = chokidar.watch(
        [`${blocksDir}/**/*.html`, `${blocksDir}/**/*.scss`],
        {
            persistent: true,
            ignoreInitial: true
        }
    );

    const handleChange = async (event, filePath) => {
        console.log(`Block ${event}: ${filePath}`);
        try {
            await onChangeCallback(filePath);
            BuildEvents.emit('sitebuild:finished');
        } catch (error) {
            console.error(`Error processing block ${filePath} on ${event}:`, error.message);
        }
    };

    watcher.on('change', (filePath) => handleChange('changed', filePath));
    watcher.on('add', (filePath) => handleChange('added', filePath));
    watcher.on('unlink', (filePath) => handleChange('removed', filePath));

    return watcher;
};

/**
 * Create a watcher for Full Pages HTML/SCSS files
 * @param {string} pagesDir - Pages directory to watch
 * @param {Function} onChangeCallback - Callback when page files change
 * @returns {chokidar.FSWatcher} Chokidar watcher instance
 */
export const createPagesWatcher = (pagesDir, onChangeCallback) => {
    const watcher = chokidar.watch(
        [`${pagesDir}/**/*.html`, `${pagesDir}/**/*.scss`],
        {
            persistent: true,
            ignoreInitial: true
        }
    );

    const handleChange = async (event, filePath) => {
        console.log(`Page ${event}: ${filePath}`);
        try {
            await onChangeCallback(filePath);
            BuildEvents.emit('sitebuild:finished');
        } catch (error) {
            console.error(`Error processing page ${filePath} on ${event}:`, error.message);
        }
    };

    watcher.on('change', (filePath) => handleChange('changed', filePath));
    watcher.on('add', (filePath) => handleChange('added', filePath));
    watcher.on('unlink', (filePath) => handleChange('removed', filePath));

    return watcher;
};

export default {
    BuildEvents,
    createStyleWatcher,
    createDocsWatcher,
    createComponentJsonWatcher,
    watchDocsFolderForChanges,
    createBlocksWatcher,
    createPagesWatcher
};
