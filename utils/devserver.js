// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

import express from 'express';
import http from 'http';
import net from 'net';
import { Server as SocketIO } from 'socket.io';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import readline from 'readline';
import { execSync } from 'child_process';
import os from 'os';

import { BuildEvents } from './fileOperations.js';

const DEFAULT_PORT = 4142;

// Lock file directory for tracking running servers
const LOCK_DIR = path.join(os.tmpdir(), 'stylescribe-servers');

// Export for external use
export { LOCK_DIR };

/**
 * Get info about what process is using a port
 * @param {number} port
 * @returns {{pid: number, command: string} | null}
 */
const getPortProcessInfo = (port) => {
    try {
        if (process.platform === 'win32') {
            const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
            const lines = output.trim().split('\n');
            for (const line of lines) {
                if (line.includes('LISTENING')) {
                    const parts = line.trim().split(/\s+/);
                    const pid = parseInt(parts[parts.length - 1], 10);
                    return { pid, command: 'unknown' };
                }
            }
        } else {
            // macOS / Linux
            const output = execSync(`lsof -i :${port} -t 2>/dev/null`, { encoding: 'utf8' });
            const pid = parseInt(output.trim().split('\n')[0], 10);
            if (pid) {
                try {
                    const cmdOutput = execSync(`ps -p ${pid} -o comm= 2>/dev/null`, { encoding: 'utf8' });
                    return { pid, command: cmdOutput.trim() };
                } catch {
                    return { pid, command: 'unknown' };
                }
            }
        }
    } catch {
        // No process found or command failed
    }
    return null;
};

/**
 * Write a lock file for this server instance
 * @param {number} port
 * @param {string} projectPath
 */
const writeLockFile = (port, projectPath) => {
    try {
        if (!fs.existsSync(LOCK_DIR)) {
            fs.mkdirSync(LOCK_DIR, { recursive: true });
        }
        const lockFile = path.join(LOCK_DIR, `port-${port}.json`);
        fs.writeFileSync(lockFile, JSON.stringify({
            port,
            projectPath: path.resolve(projectPath),
            pid: process.pid,
            startedAt: new Date().toISOString()
        }, null, 2));
    } catch (err) {
        console.warn(chalk.yellow('Warning: Could not write server lock file:', err.message));
    }
};

/**
 * Read lock file for a port
 * @param {number} port
 * @returns {{port: number, projectPath: string, pid: number, startedAt: string} | null}
 */
const readLockFile = (port) => {
    try {
        const lockFile = path.join(LOCK_DIR, `port-${port}.json`);
        if (fs.existsSync(lockFile)) {
            return JSON.parse(fs.readFileSync(lockFile, 'utf8'));
        }
    } catch {
        // Lock file doesn't exist or is invalid
    }
    return null;
};

/**
 * Remove lock file for a port
 * @param {number} port
 */
const removeLockFile = (port) => {
    try {
        const lockFile = path.join(LOCK_DIR, `port-${port}.json`);
        if (fs.existsSync(lockFile)) {
            fs.unlinkSync(lockFile);
        }
    } catch {
        // Ignore errors
    }
};

/**
 * Check if a lock file's process is still alive
 * @param {number} pid
 * @returns {boolean}
 */
const isProcessAlive = (pid) => {
    try {
        process.kill(pid, 0);
        return true;
    } catch {
        return false;
    }
};

const injectScript = (content) => {
    return content.replace(
        /<\/body>/,
        '<script src="/socket.io/socket.io.js"></script><script src="/reload.js"></script></body>'
    );
};

/**
 * Check if a port is available
 * @param {number} port
 * @returns {Promise<boolean>}
 */
export const isPortAvailable = (port) => {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => {
            server.close();
            resolve(true);
        });
        server.listen(port, '127.0.0.1');
    });
};

/**
 * Find an available port starting from the given port
 * @param {number} startPort
 * @param {number} maxAttempts
 * @returns {Promise<number|null>}
 */
export const findAvailablePort = async (startPort, maxAttempts = 100) => {
    for (let i = 0; i < maxAttempts; i++) {
        const port = startPort + i;
        if (await isPortAvailable(port)) {
            return port;
        }
    }
    return null;
};

/**
 * Ask user a yes/no question
 * @param {string} question
 * @returns {Promise<boolean>}
 */
const askQuestion = (question) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.toLowerCase().startsWith('y'));
        });
    });
};

/**
 * @typedef {Object} DevServerOptions
 * @property {number} [port] - Specific port to use
 * @property {boolean} [autoPort] - Automatically find available port if preferred port is busy
 * @property {boolean} [open] - Open browser automatically (default: true)
 */

/**
 * Start the development server
 * @param {string} SERVER_ROOT - Root directory to serve
 * @param {DevServerOptions} [options] - Server options
 * @returns {Promise<{port: number, url: string, server: http.Server}>}
 */
export const DevServer = async (SERVER_ROOT, options = {}) => {
    const {
        port: preferredPort = DEFAULT_PORT,
        autoPort = false,
        open: openBrowser = true
    } = options;

    const currentProjectPath = path.resolve(process.cwd());

    // Debug info
    console.log(chalk.gray(`\n[Debug] Starting Stylescribe dev server`));
    console.log(chalk.gray(`[Debug] Project path: ${currentProjectPath}`));
    console.log(chalk.gray(`[Debug] Process ID: ${process.pid}`));
    console.log(chalk.gray(`[Debug] Preferred port: ${preferredPort}`));
    console.log(chalk.gray(`[Debug] Auto-port: ${autoPort}`));

    // Check if preferred port is available
    const isPreferredAvailable = await isPortAvailable(preferredPort);
    let actualPort = preferredPort;

    if (!isPreferredAvailable) {
        // Check if another Stylescribe is using this port
        const lockInfo = readLockFile(preferredPort);
        const processInfo = getPortProcessInfo(preferredPort);

        console.log(chalk.gray(`[Debug] Port ${preferredPort} is in use`));
        if (processInfo) {
            console.log(chalk.gray(`[Debug] Process on port: PID ${processInfo.pid}, command: ${processInfo.command}`));
        }

        // Check if it's the same project
        if (lockInfo && isProcessAlive(lockInfo.pid)) {
            if (lockInfo.projectPath === currentProjectPath) {
                console.log(chalk.yellow(`\n⚠️  A Stylescribe server for THIS project is already running on port ${preferredPort}`));
                console.log(chalk.yellow(`   PID: ${lockInfo.pid}, started: ${lockInfo.startedAt}`));
                console.log(chalk.cyan(`   You can connect to the existing server at http://localhost:${preferredPort}`));

                if (!autoPort && process.stdin.isTTY) {
                    const startNew = await askQuestion(
                        chalk.cyan(`Start a new server on a different port anyway? (y/N): `)
                    );
                    if (!startNew) {
                        console.log(chalk.green('Using existing server.'));
                        return { port: preferredPort, url: `http://localhost:${preferredPort}`, server: null, reused: true };
                    }
                } else if (!autoPort) {
                    // Non-interactive: return info about existing server
                    return { port: preferredPort, url: `http://localhost:${preferredPort}`, server: null, reused: true };
                }
            } else {
                // Different project is using this port
                console.log(chalk.yellow(`\n⚠️  Another Stylescribe project is running on port ${preferredPort}`));
                console.log(chalk.yellow(`   Project: ${lockInfo.projectPath}`));
                console.log(chalk.yellow(`   PID: ${lockInfo.pid}`));
            }
        } else if (lockInfo) {
            // Stale lock file - process is dead
            console.log(chalk.gray(`[Debug] Removing stale lock file for port ${preferredPort}`));
            removeLockFile(preferredPort);
        }

        if (autoPort) {
            // Auto-select mode: find next available port
            const freePort = await findAvailablePort(preferredPort + 1);
            if (!freePort) {
                console.error(chalk.red(`Error: Could not find an available port after ${preferredPort}`));
                process.exit(1);
            }
            console.log(chalk.yellow(`Port ${preferredPort} is in use. Using port ${freePort} instead.`));
            actualPort = freePort;
        } else if (process.stdin.isTTY) {
            // Interactive mode: ask user
            console.log(chalk.yellow(`\nPort ${preferredPort} is already in use.`));
            console.log(chalk.gray(`Tip: Use --auto-port to automatically find an available port.`));

            const freePort = await findAvailablePort(preferredPort + 1);
            if (freePort) {
                const useAlternate = await askQuestion(
                    chalk.cyan(`Would you like to use port ${freePort} instead? (Y/n): `)
                );

                if (useAlternate) {
                    actualPort = freePort;
                } else {
                    console.log(chalk.red('Server start cancelled.'));
                    process.exit(0);
                }
            } else {
                console.error(chalk.red('No available ports found. Please free up a port and try again.'));
                process.exit(1);
            }
        } else {
            // Non-interactive, non-auto mode: fail with helpful message
            console.error(chalk.red(`Error: Port ${preferredPort} is already in use.`));
            if (lockInfo) {
                console.error(chalk.yellow(`Another Stylescribe project is running: ${lockInfo.projectPath}`));
            }
            console.error(chalk.yellow('Use --auto-port to automatically select an available port.'));
            console.error(chalk.yellow(`Or specify a different port with --port <number>`));
            process.exit(1);
        }
    }

    const app = express();
    const STATIC_ROOT = path.join(process.cwd(), SERVER_ROOT);

    // Serve the reload script to clients
    app.get('/reload.js', (req, res) => {
        res.type('application/javascript');
        res.send(`
        document.addEventListener('DOMContentLoaded', function() {
            console.log("init socketio")
            const socket = io();
            socket.on('reload', function() {
                window.location.reload();
            });
        });`);
    });

    // Inject reload script into HTML responses (handles both /page.html and / directory requests)
    app.use((req, res, next) => {
        const ext = path.extname(req.path);
        // Only intercept potential HTML requests (explicit .html or directory paths)
        if (ext === '' || ext === '.html') {
            // Override sendFile to inject scripts into static HTML files
            const originalSendFile = res.sendFile.bind(res);
            res.sendFile = function(filePath, options, callback) {
                // Only intercept HTML files
                if (path.extname(filePath) === '.html') {
                    fs.readFile(filePath, 'utf8', (err, data) => {
                        if (err) {
                            if (callback) callback(err);
                            else next(err);
                            return;
                        }
                        res.type('html');
                        res.send(injectScript(data));
                    });
                } else {
                    // Non-HTML files, use original sendFile
                    originalSendFile(filePath, options, callback);
                }
            };
        }
        next();
    });

    // Serve static files (HTML injection happens via overridden sendFile above)
    app.use(express.static(STATIC_ROOT));

    // Also serve the shared ./static folder (for screenshots etc.)
    // This allows dev to access screenshots without copying them
    const sharedStaticPath = path.join(process.cwd(), 'static');
    app.use('/static', express.static(sharedStaticPath));

    // Helper to start server on a specific port
    const tryStartServer = (port) => {
        return new Promise((resolve, reject) => {
            const tryServer = http.createServer(app);
            const tryIo = new SocketIO(tryServer);

            tryServer.on('error', (err) => {
                reject(err);
            });

            tryServer.listen(port, async () => {
                const SERVER_URL = `http://localhost:${port}`;

                // Write lock file
                writeLockFile(port, currentProjectPath);

                // Clean up lock file on process exit
                const cleanup = () => {
                    console.log(chalk.gray(`\n[Debug] Cleaning up lock file for port ${port}`));
                    removeLockFile(port);
                };

                process.on('exit', cleanup);
                process.on('SIGINT', () => {
                    cleanup();
                    process.exit(0);
                });
                process.on('SIGTERM', () => {
                    cleanup();
                    process.exit(0);
                });

                console.log(chalk.green(`\n✓ Dev server started`));
                console.log(chalk.green(`  URL: ${SERVER_URL}`));
                console.log(chalk.gray(`  Project: ${currentProjectPath}`));
                console.log(chalk.gray(`  PID: ${process.pid}`));
                console.log(chalk.gray(`  Port: ${port}`));

                if (openBrowser) {
                    const open = (await import('open')).default;
                    open(SERVER_URL);
                }

                BuildEvents.on('sitebuild:finished', () => {
                    console.log(chalk.gray("[Hot Reload] Site building finished, reloading clients..."));
                    tryIo.emit('reload');  // Notify all connected clients to reload
                });

                resolve({
                    port: port,
                    url: SERVER_URL,
                    server: tryServer,
                    pid: process.pid,
                    projectPath: currentProjectPath
                });
            });
        });
    };

    // Try to start server, with auto-port retry on EADDRINUSE
    try {
        return await tryStartServer(actualPort);
    } catch (err) {
        if (err.code === 'EADDRINUSE' && autoPort) {
            // Port is in use despite our check - find another port
            console.log(chalk.yellow(`\n[Auto-port] Port ${actualPort} became unavailable, finding alternative...`));

            const freePort = await findAvailablePort(actualPort + 1);
            if (!freePort) {
                console.error(chalk.red('Error: Could not find an available port.'));
                process.exit(1);
            }

            console.log(chalk.yellow(`[Auto-port] Using port ${freePort} instead.`));
            return await tryStartServer(freePort);
        } else if (err.code === 'EADDRINUSE') {
            // Not in auto-port mode
            console.error(chalk.red(`\nError: Port ${actualPort} is already in use.`));
            console.error(chalk.yellow('Use --auto-port to automatically select an available port.'));
            console.error(chalk.yellow(`Or specify a different port with --port <number>`));
            process.exit(1);
        } else {
            // Other error
            throw err;
        }
    }
};

/**
 * Get information about a Stylescribe server running on a specific port
 * @param {number} port
 * @returns {{port: number, projectPath: string, pid: number, startedAt: string, alive: boolean} | null}
 */
export const getServerInfo = (port) => {
    const lockInfo = readLockFile(port);
    if (!lockInfo) {
        return null;
    }

    const alive = isProcessAlive(lockInfo.pid);
    if (!alive) {
        // Clean up stale lock file
        removeLockFile(port);
        return null;
    }

    return {
        ...lockInfo,
        alive
    };
};

/**
 * Get all running Stylescribe servers
 * @returns {Array<{port: number, projectPath: string, pid: number, startedAt: string, alive: boolean}>}
 */
export const getAllRunningServers = () => {
    const servers = [];
    try {
        if (!fs.existsSync(LOCK_DIR)) {
            return servers;
        }

        const files = fs.readdirSync(LOCK_DIR);
        for (const file of files) {
            if (file.startsWith('port-') && file.endsWith('.json')) {
                const portMatch = file.match(/port-(\d+)\.json/);
                if (portMatch) {
                    const port = parseInt(portMatch[1], 10);
                    const info = getServerInfo(port);
                    if (info) {
                        servers.push(info);
                    }
                }
            }
        }
    } catch {
        // Ignore errors
    }
    return servers;
};

/**
 * Check if a specific project has a running server
 * @param {string} projectPath
 * @returns {{port: number, url: string, pid: number} | null}
 */
export const findServerForProject = (projectPath) => {
    const resolvedPath = path.resolve(projectPath);
    const servers = getAllRunningServers();

    for (const server of servers) {
        if (server.projectPath === resolvedPath) {
            return {
                port: server.port,
                url: `http://localhost:${server.port}`,
                pid: server.pid
            };
        }
    }
    return null;
};
