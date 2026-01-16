#!/usr/bin/env node

// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Stylescribe MCP Server
 *
 * Exposes Stylescribe documentation as resources and CLI commands as tools
 * for AI coding assistants like Claude Code.
 *
 * Transport: stdio (auto-spawned by Claude Code)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    ListToolsRequestSchema,
    CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import {
    listInstalledIconPackages,
    searchIcons,
    getIconPath,
    discoverIcons,
    getSupportedPackagesDoc,
} from './icons.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Documentation resources
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'ai-agent');

const RESOURCES = {
    'stylescribe://docs/cli-commands': {
        name: 'CLI Commands Reference',
        description: 'Complete reference for all Stylescribe CLI commands',
        file: 'cli-reference.md',
    },
    'stylescribe://docs/annotations': {
        name: 'Annotations Reference',
        description: 'Component annotation guide (@title, @group, @variations, etc.)',
        file: 'annotations-reference.md',
    },
    'stylescribe://docs/tokens': {
        name: 'Design Tokens Reference',
        description: 'W3C DTCG format and 46 token functions (tint, shade, fluidType, etc.)',
        file: 'tokens-reference.md',
    },
    'stylescribe://docs/css-architecture': {
        name: 'CSS Architecture Guide',
        description: '@layer system, token-driven components, BEM naming',
        file: 'css-architecture.md',
    },
    'stylescribe://docs/container-queries': {
        name: 'Container Queries Guide',
        description: '@container patterns for responsive components',
        file: 'container-queries.md',
    },
    'stylescribe://docs/theming': {
        name: 'Theming Guide',
        description: 'Dark mode, theme variants, presets',
        file: 'theming-guide.md',
    },
    'stylescribe://docs/config': {
        name: 'Configuration Reference',
        description: 'All .stylescriberc.json options',
        file: 'config-reference.md',
    },
    'stylescribe://docs/coding-guidelines': {
        name: 'Coding Guidelines',
        description: 'Best practices, conventions, accessibility',
        file: 'coding-guidelines.md',
    },
};

// CLI tools to expose
const TOOLS = [
    {
        name: 'stylescribe_create_component',
        description:
            'Create a new component scaffold with proper annotations. Creates a component folder with SCSS file containing annotation template. IMPORTANT: group is REQUIRED for proper navigation.',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Component name (e.g., "button", "card", "alert")',
                },
                group: {
                    type: 'string',
                    description:
                        'REQUIRED: Component group for navigation. Common groups: "Actions", "Containment", "Communication", "Feedback", "Navigation", "Forms", "Layout"',
                },
                source: {
                    type: 'string',
                    description: 'Source directory for components',
                    default: './sass/components',
                },
            },
            required: ['name', 'group'],
        },
    },
    {
        name: 'stylescribe_create_page',
        description:
            'Create a new documentation page. Creates a markdown file with frontmatter template.',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Page name/slug (e.g., "getting-started", "changelog")',
                },
                title: {
                    type: 'string',
                    description: 'Page title for display',
                },
                output: {
                    type: 'string',
                    description: 'Output directory for the page',
                    default: './docs',
                },
            },
            required: ['name'],
        },
    },
    {
        name: 'stylescribe_validate_tokens',
        description: 'Validate a design tokens file against W3C DTCG spec. Reports any errors.',
        inputSchema: {
            type: 'object',
            properties: {
                input: {
                    type: 'string',
                    description: 'Path to token file to validate',
                    default: './tokens/design-tokens.json',
                },
            },
        },
    },
    {
        name: 'stylescribe_add_theme',
        description:
            'Add a new theme to the project. Creates theme file and updates base tokens reference.',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Theme name (e.g., "dark", "ocean", "comic")',
                },
                dark: {
                    type: 'boolean',
                    description: 'Mark as dark mode theme',
                    default: false,
                },
                extends: {
                    type: 'string',
                    description: 'Theme to extend from (optional)',
                },
            },
            required: ['name'],
        },
    },
    {
        name: 'stylescribe_export_tokens',
        description: 'Export design tokens to CSS, SCSS, or Style Dictionary format.',
        inputSchema: {
            type: 'object',
            properties: {
                input: {
                    type: 'string',
                    description: 'Path to token file',
                    default: './tokens/design-tokens.json',
                },
                format: {
                    type: 'string',
                    enum: ['css', 'scss', 'json', 'style-dictionary'],
                    description: 'Output format',
                    default: 'css',
                },
                output: {
                    type: 'string',
                    description: 'Output file path',
                },
            },
        },
    },
    // Icon tools
    {
        name: 'stylescribe_icons_list',
        description:
            'List all installed SVG icon packages (bootstrap-icons, lucide-static, heroicons, etc.) with their path patterns. Use this to discover what icons are available.',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'stylescribe_icons_search',
        description:
            'Search for icons by name across all installed icon packages. Returns matching icons with their token paths.',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search query (e.g., "trash", "arrow", "home")',
                },
            },
            required: ['query'],
        },
    },
    {
        name: 'stylescribe_icons_get_path',
        description:
            'Get the correct token path for a specific icon. Use this when you know the package and icon name.',
        inputSchema: {
            type: 'object',
            properties: {
                package: {
                    type: 'string',
                    description: 'Package name (e.g., "bootstrap-icons", "lucide-static")',
                },
                icon: {
                    type: 'string',
                    description: 'Icon name (e.g., "trash", "arrow-right")',
                },
            },
            required: ['package', 'icon'],
        },
    },
    {
        name: 'stylescribe_icons_discover',
        description:
            'Discover all icons from a specific package. Returns the full list of available icons.',
        inputSchema: {
            type: 'object',
            properties: {
                package: {
                    type: 'string',
                    description: 'Package name (e.g., "bootstrap-icons", "lucide-static")',
                },
            },
            required: ['package'],
        },
    },
];

/**
 * Execute a Stylescribe CLI command
 */
async function executeCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        const proc = spawn('npx', ['stylescribe', command, ...args], {
            cwd: process.env.STYLESCRIBE_PROJECT || process.cwd(),
            shell: true,
        });

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        proc.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        proc.on('close', (code) => {
            if (code === 0) {
                resolve({ success: true, output: stdout, stderr });
            } else {
                resolve({
                    success: false,
                    output: stdout,
                    error: stderr || `Command exited with code ${code}`,
                });
            }
        });

        proc.on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Read documentation file content
 */
async function readDocumentation(filename) {
    const filePath = path.join(DOCS_DIR, filename);
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        return `Error reading documentation: ${error.message}`;
    }
}

/**
 * Create and start the MCP server
 */
async function main() {
    const server = new Server(
        {
            name: 'stylescribe',
            version: '1.0.0',
        },
        {
            capabilities: {
                resources: {},
                tools: {},
            },
        }
    );

    // Handle resource listing
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
        return {
            resources: Object.entries(RESOURCES).map(([uri, info]) => ({
                uri,
                name: info.name,
                description: info.description,
                mimeType: 'text/markdown',
            })),
        };
    });

    // Handle resource reading
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const uri = request.params.uri;
        const resource = RESOURCES[uri];

        if (!resource) {
            throw new Error(`Unknown resource: ${uri}`);
        }

        const content = await readDocumentation(resource.file);

        return {
            contents: [
                {
                    uri,
                    mimeType: 'text/markdown',
                    text: content,
                },
            ],
        };
    });

    // Handle tool listing
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: TOOLS,
        };
    });

    // Handle tool execution
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        try {
            let result;

            switch (name) {
                case 'stylescribe_create_component': {
                    const cmdArgs = [args.name];
                    if (args.group) cmdArgs.push('--group', args.group);
                    if (args.source) cmdArgs.push('--source', args.source);
                    result = await executeCommand('create-component', cmdArgs);
                    break;
                }

                case 'stylescribe_create_page': {
                    const cmdArgs = [args.name];
                    if (args.title) cmdArgs.push('--title', args.title);
                    if (args.output) cmdArgs.push('--output', args.output);
                    result = await executeCommand('create-page', cmdArgs);
                    break;
                }

                case 'stylescribe_validate_tokens': {
                    const input = args.input || './tokens/design-tokens.json';
                    result = await executeCommand('tokens', ['validate', '-i', input]);
                    break;
                }

                case 'stylescribe_add_theme': {
                    const cmdArgs = [args.name];
                    if (args.dark) cmdArgs.push('--dark');
                    if (args.extends) cmdArgs.push('--extends', args.extends);
                    result = await executeCommand('add-theme', cmdArgs);
                    break;
                }

                case 'stylescribe_export_tokens': {
                    const input = args.input || './tokens/design-tokens.json';
                    const format = args.format || 'css';
                    const cmdArgs = ['export', '-i', input, '-f', format];
                    if (args.output) cmdArgs.push('-o', args.output);
                    result = await executeCommand('tokens', cmdArgs);
                    break;
                }

                // Icon tools - these don't need CLI execution
                case 'stylescribe_icons_list': {
                    const projectDir = process.env.STYLESCRIBE_PROJECT || process.cwd();
                    const installed = listInstalledIconPackages(projectDir);

                    if (installed.length === 0) {
                        result = {
                            success: true,
                            output: `No icon packages found.\n\nTo add icons, install a package:\n  npm install bootstrap-icons\n  npm install lucide-static\n\n${getSupportedPackagesDoc()}`,
                        };
                    } else {
                        let output = 'Installed icon packages:\n\n';
                        for (const pkg of installed) {
                            output += `- ${pkg.name} (${pkg.package})\n`;
                            output += `  Icons: ${pkg.count}\n`;
                            output += `  Path pattern: ${pkg.pathPattern}\n`;
                            output += `  Website: ${pkg.website}\n\n`;
                        }
                        result = { success: true, output };
                    }
                    break;
                }

                case 'stylescribe_icons_search': {
                    const projectDir = process.env.STYLESCRIBE_PROJECT || process.cwd();
                    const matches = searchIcons(args.query, projectDir);

                    if (matches.length === 0) {
                        result = {
                            success: true,
                            output: `No icons found matching "${args.query}".\n\nMake sure you have icon packages installed:\n  npm install bootstrap-icons\n  npm install lucide-static`,
                        };
                    } else {
                        let output = `Found ${matches.length} icons matching "${args.query}":\n\n`;
                        // Limit to first 50 results
                        const limited = matches.slice(0, 50);
                        for (const match of limited) {
                            output += `- ${match.name} (${match.packageName})\n`;
                            output += `  Path: ${match.path}\n`;
                        }
                        if (matches.length > 50) {
                            output += `\n... and ${matches.length - 50} more results`;
                        }
                        result = { success: true, output };
                    }
                    break;
                }

                case 'stylescribe_icons_get_path': {
                    const iconPath = getIconPath(args.package, args.icon);
                    if (!iconPath) {
                        result = {
                            success: false,
                            error: `Unknown package: ${args.package}`,
                            output: `Supported packages: bootstrap-icons, lucide-static, heroicons, feather-icons, @tabler/icons`,
                        };
                    } else {
                        result = {
                            success: true,
                            output: `Icon path: ${iconPath}\n\nToken format:\n{\n  "your-icon-name": {\n    "$value": "${iconPath}",\n    "$type": "asset"\n  }\n}`,
                        };
                    }
                    break;
                }

                case 'stylescribe_icons_discover': {
                    const projectDir = process.env.STYLESCRIBE_PROJECT || process.cwd();
                    const pkgInfo = discoverIcons(args.package, projectDir);

                    if (!pkgInfo) {
                        result = {
                            success: false,
                            error: `Package not found or not installed: ${args.package}`,
                            output: `Install with: npm install ${args.package}`,
                        };
                    } else {
                        let output = `${pkgInfo.name} (${pkgInfo.count} icons)\n\n`;
                        output += `Path pattern: ${pkgInfo.pathPattern}\n`;
                        output += `Website: ${pkgInfo.website}\n\n`;
                        output += `Icons (first 100):\n`;
                        const limited = pkgInfo.icons.slice(0, 100);
                        output += limited.join(', ');
                        if (pkgInfo.icons.length > 100) {
                            output += `\n\n... and ${pkgInfo.icons.length - 100} more`;
                        }
                        result = { success: true, output };
                    }
                    break;
                }

                default:
                    throw new Error(`Unknown tool: ${name}`);
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: result.success
                            ? result.output || 'Command completed successfully'
                            : `Error: ${result.error}\n${result.output}`,
                    },
                ],
                isError: !result.success,
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error executing tool: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    });

    // Start the server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Log to stderr (stdout is used for MCP communication)
    console.error('Stylescribe MCP server started');
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
