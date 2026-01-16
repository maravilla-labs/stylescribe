// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Centralized file system utilities
 * Wraps fs-extra with common operations used throughout the codebase
 */
import fs from 'fs-extra';
import path from 'path';

/**
 * Ensure a directory exists, creating it recursively if needed
 * @param {string} dirPath - Directory path to ensure
 */
export const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/**
 * Read a file synchronously with UTF-8 encoding
 * @param {string} filePath - File path to read
 * @returns {string} File contents
 */
export const readFileSync = (filePath) => {
    return fs.readFileSync(filePath, 'utf-8');
};

/**
 * Write a file synchronously
 * @param {string} filePath - File path to write
 * @param {string} content - Content to write
 */
export const writeFileSync = (filePath, content) => {
    fs.writeFileSync(filePath, content);
};

/**
 * Check if a path exists
 * @param {string} filePath - Path to check
 * @returns {boolean} True if path exists
 */
export const existsSync = (filePath) => {
    return fs.existsSync(filePath);
};

/**
 * Copy a file synchronously
 * @param {string} src - Source file path
 * @param {string} dest - Destination file path
 */
export const copyFileSync = (src, dest) => {
    fs.copyFileSync(src, dest);
};

/**
 * Copy a file or directory synchronously (recursive)
 * @param {string} src - Source path
 * @param {string} dest - Destination path
 */
export const copySync = (src, dest) => {
    fs.copySync(src, dest);
};

/**
 * Read directory contents synchronously
 * @param {string} dirPath - Directory path
 * @returns {string[]} Array of file/directory names
 */
export const readdirSync = (dirPath) => {
    return fs.readdirSync(dirPath);
};

/**
 * Get file/directory stats synchronously
 * @param {string} filePath - Path to check
 * @returns {fs.Stats} File stats object
 */
export const statSync = (filePath) => {
    return fs.statSync(filePath);
};

/**
 * Read and parse a JSON file
 * @param {string} filePath - JSON file path
 * @param {Function} [reviver] - Optional JSON.parse reviver function
 * @returns {object} Parsed JSON content
 */
export const readJsonSync = (filePath, reviver) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content, reviver);
};

/**
 * Write an object as JSON to a file
 * @param {string} filePath - File path to write
 * @param {object} data - Data to serialize as JSON
 * @param {number} [indent=4] - JSON indentation spaces
 */
export const writeJsonSync = (filePath, data, indent = 4) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, indent));
};

/**
 * Ensure output directory exists for a file path
 * @param {string} filePath - File path whose parent directory should exist
 */
export const ensureFileDir = (filePath) => {
    const dir = path.dirname(filePath);
    ensureDir(dir);
};

export default {
    ensureDir,
    readFileSync,
    writeFileSync,
    existsSync,
    copyFileSync,
    copySync,
    readdirSync,
    statSync,
    readJsonSync,
    writeJsonSync,
    ensureFileDir
};
