// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Main build pipeline orchestrator
 * Coordinates SCSS compilation, template rendering, and site building
 */
import chalk from 'chalk';
import fg from 'fast-glob';
import path from 'path';
import postcss from 'postcss';
import pug from 'pug';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath } from 'url';

// Import from modular utilities
import {
    ensureDir,
    existsSync,
    readFileSync,
    writeFileSync,
    readdirSync,
    copyFileSync,
    copySync,
    statSync
} from './fs.js';
import { processStyleFile } from './scss/compiler.js';
import { loadConfig, getHeadIncludes, getComponentGroupOrder, getProductionBasepath, getBrandingConfig, getClassPrefix, getTokenPrefix, getStaticFolder, getBlocksConfig, getPagesConfig, getGithubUrl, DEFAULT_CLASS_PREFIX } from './config/loader.js';
import { processMarkdownFiles, flattenTokensForDisplay } from './markdown/processor.js';
import { buildSearchIndex } from './search/indexBuilder.js';
import { loadTokens } from './config/loader.js';
import { loadThemeTokensAsync, getThemeOptions, getThemeConfig } from './themes/loader.js';
import { generateThemeCss } from './tokens.js';
import { buildNavigationFromDocs, deriveActiveNav } from './navigation/builder.js';
import {
    buildComponentsData as buildComponentsDataCore,
    groupByGroup,
    loadComponentsJson,
    calculateCssIncludes,
    copyComponentCss
} from './components/builder.js';
import {
    buildBlocksData as buildBlocksDataCore,
    groupByGroup as groupBlocksByGroup,
    loadBlocksJson,
    getComponentUsedInBlocks
} from './blocks/builder.js';
import {
    buildPagesData as buildPagesDataCore,
    groupByGroup as groupPagesByGroup,
    loadPagesJson
} from './pages/builder.js';
import { compileTemplateFromPath } from './templates/handlebars.js';
import { getTemplatePath } from './pathResolver.js';
import {
    BuildEvents,
    createStyleWatcher,
    createComponentJsonWatcher,
    createBlocksWatcher,
    createPagesWatcher,
    watchDocsFolderForChanges
} from './watchers/manager.js';
import { generateSafelistFile } from './config/generateSafelist.js';
import { BuildError, HINTS } from './errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DEV_SERVER_ROOT = '.stylescribe_dev';

// Re-export BuildEvents for external use
export { BuildEvents };

/**
 * Transform example code to use the configured class prefix
 */
const transformExampleCode = (code, targetPrefix) => {
    if (!code || !targetPrefix || targetPrefix === DEFAULT_CLASS_PREFIX) {
        return code;
    }
    // Replace all occurrences of the default prefix with the target prefix
    const regex = new RegExp(DEFAULT_CLASS_PREFIX, 'g');
    return code.replace(regex, targetPrefix);
};

/**
 * Transform component examples to use the configured prefix
 */
const transformComponentExamples = (component, targetPrefix) => {
    if (!component.examples || !Array.isArray(component.examples)) {
        return component;
    }

    return {
        ...component,
        examples: component.examples.map(example => ({
            ...example,
            code: transformExampleCode(example.code, targetPrefix)
        }))
    };
};

/**
 * Build aggregated components data and optionally set up watchers
 */
export const buildComponentsData = async (sourceDir, outputDir, watch) => {
    const result = await buildComponentsDataCore(sourceDir, outputDir);

    if (watch) {
        processPackageFiles(process.cwd(), path.join(process.cwd(), DEV_SERVER_ROOT));
        createComponentJsonWatcher(outputDir, async () => {
            await buildSite(outputDir, path.join(process.cwd(), DEV_SERVER_ROOT));
        });
    }

    return result;
};

/**
 * Build aggregated UI Blocks data
 * Processes HTML-first blocks with optional SCSS
 * @param {string} projectDir - Project root directory (where blocks/ lives)
 * @param {string} outputDir - Output directory for built files
 * @param {boolean} [watch] - Whether to set up file watchers
 */
export const buildBlocksData = async (projectDir, outputDir, watch) => {
    const config = loadConfig(projectDir);
    const blocksConfig = getBlocksConfig(config);

    const result = await buildBlocksDataCore(projectDir, outputDir, blocksConfig);

    // Set up file watcher for blocks directory
    if (watch) {
        const blocksDir = path.join(projectDir, blocksConfig.source || 'blocks');
        if (existsSync(blocksDir)) {
            createBlocksWatcher(blocksDir, async () => {
                // Rebuild blocks data when files change
                await buildBlocksDataCore(projectDir, outputDir, blocksConfig);
            });
        }
    }

    return result;
};

/**
 * Build aggregated Full Pages data
 * Processes HTML-first pages with optional SCSS
 * @param {string} projectDir - Project root directory (where pages/ lives)
 * @param {string} outputDir - Output directory for built files
 * @param {boolean} [watch] - Whether to set up file watchers
 */
export const buildPagesData = async (projectDir, outputDir, watch) => {
    const config = loadConfig(projectDir);
    const pagesConfig = getPagesConfig(config);

    const result = await buildPagesDataCore(projectDir, outputDir, pagesConfig);

    // Set up file watcher for pages directory
    if (watch) {
        const pagesDir = path.join(projectDir, pagesConfig.source || 'pages');
        if (existsSync(pagesDir)) {
            createPagesWatcher(pagesDir, async () => {
                // Rebuild pages data when files change
                await buildPagesDataCore(projectDir, outputDir, pagesConfig);
            });
        }
    }

    return result;
};

/**
 * Copy JSON data files to output directory for screenshots command
 * @param {string} sourceDir - Source directory (build target)
 * @param {string} outputDir - Output directory (site)
 * @param {Object} data - Data to write
 */
const copyJsonDataFiles = (sourceDir, outputDir, data) => {
    const { components, blocks, pages } = data;

    // Write components.json
    if (components && components.length > 0) {
        const componentsPath = path.join(outputDir, 'components.json');
        writeFileSync(componentsPath, JSON.stringify(components, null, 2));
    }

    // Write blocks.json
    if (blocks && blocks.length > 0) {
        const blocksPath = path.join(outputDir, 'blocks.json');
        writeFileSync(blocksPath, JSON.stringify(blocks, null, 2));
    }

    // Write pages.json
    if (pages && pages.length > 0) {
        const pagesPath = path.join(outputDir, 'pages.json');
        writeFileSync(pagesPath, JSON.stringify(pages, null, 2));
    }
};

/**
 * Build CSS from source files and extract annotations
 */
export const buildCssAndAnnotation = async (sourceDir, outputDir, watch) => {
    if (!existsSync(sourceDir)) {
        console.error(`Error: Source directory ${sourceDir} does not exist.`);
        return;
    }

    ensureDir(outputDir);

    let styleFiles = [];
    try {
        styleFiles = await fg([`${sourceDir}/**/*.css`, `${sourceDir}/components/**/*.scss`]);
    } catch (err) {
        console.error(`Error reading files from ${sourceDir}:`, err.message);
        return;
    }

    for (const filePath of styleFiles) {
        await processStyleFile(filePath, sourceDir, outputDir);
    }

    if (watch) {
        createStyleWatcher(sourceDir, (filePath) =>
            processStyleFile(filePath, sourceDir, outputDir)
        );
    }
};

/**
 * Process Tailwind CSS using PostCSS
 */
export const processTailwindCSS = async (outputDir) => {
    const templateStylesDir = path.join(__dirname, '..', 'templates', 'styles');
    const inputCssPath = path.join(templateStylesDir, 'main.css');

    if (!existsSync(inputCssPath)) {
        console.log(chalk.yellow('No Tailwind CSS entry point found, skipping...'));
        return;
    }

    // Generate theme safelist before Tailwind processes (so it can scan the classes)
    try {
        const classCount = generateSafelistFile();
        console.log(chalk.green(`Generated theme safelist with ${classCount} classes`));
    } catch (error) {
        console.warn(chalk.yellow('Could not generate theme safelist:'), error.message);
    }

    try {
        const inputCss = readFileSync(inputCssPath);

        // Extract external @import url() statements before processing
        // These get stripped by PostCSS/Tailwind, so we preserve them
        const externalImportRegex = /@import\s+url\(['"]?(https?:\/\/[^'")\s]+)['"]?\)[^;]*;?/g;
        const externalImports = [];
        let match;
        while ((match = externalImportRegex.exec(inputCss.toString())) !== null) {
            externalImports.push(match[0].trim().replace(/;?$/, ';'));
        }

        const result = await postcss([tailwindcss]).process(inputCss, {
            from: inputCssPath,
            to: path.join(outputDir, 'css', 'stylescribe.css')
        });

        const outputCssDir = path.join(outputDir, 'css');
        ensureDir(outputCssDir);

        // Prepend external imports to the output CSS
        const finalCss = externalImports.length > 0
            ? externalImports.join('\n') + '\n\n' + result.css
            : result.css;

        writeFileSync(path.join(outputCssDir, 'stylescribe.css'), finalCss);
        console.log(chalk.green('Compiled Tailwind CSS to'), path.join(outputCssDir, 'stylescribe.css'));
    } catch (error) {
        console.error(chalk.red('Error processing Tailwind CSS:'), error.message);
    }
};

/**
 * Copy template assets (JS scripts) to output directory
 */
export const copyTemplateAssets = async (outputDir) => {
    const templateScriptsDir = path.join(__dirname, '..', 'templates', 'scripts');

    if (!existsSync(templateScriptsDir)) {
        return;
    }

    const outputScriptsDir = path.join(outputDir, 'js');
    ensureDir(outputScriptsDir);

    const scriptFiles = readdirSync(templateScriptsDir).filter(f => f.endsWith('.js'));

    for (const scriptFile of scriptFiles) {
        const srcPath = path.join(templateScriptsDir, scriptFile);
        const destPath = path.join(outputScriptsDir, scriptFile);
        copyFileSync(srcPath, destPath);
        console.log(chalk.green('Copied script'), scriptFile);
    }

    // Copy htmx library from node_modules for SPA navigation
    const htmxSrcPath = path.join(__dirname, '..', 'node_modules', 'htmx.org', 'dist', 'htmx.min.js');
    if (existsSync(htmxSrcPath)) {
        const htmxDestPath = path.join(outputScriptsDir, 'htmx.min.js');
        copyFileSync(htmxSrcPath, htmxDestPath);
        console.log(chalk.green('Copied script'), 'htmx.min.js');
    }

    // Copy htmx idiomorph extension for smart DOM morphing
    const idiomorphSrcPath = path.join(__dirname, '..', 'node_modules', 'htmx.org', 'dist', 'ext', 'head-support.js');
    if (existsSync(idiomorphSrcPath)) {
        const idiomorphDestPath = path.join(outputScriptsDir, 'htmx-head-support.js');
        copyFileSync(idiomorphSrcPath, idiomorphDestPath);
        console.log(chalk.green('Copied script'), 'htmx-head-support.js');
    }

    // Copy Alpine.js for reactive components
    const alpineSrcPath = path.join(__dirname, '..', 'node_modules', 'alpinejs', 'dist', 'cdn.min.js');
    if (existsSync(alpineSrcPath)) {
        const alpineDestPath = path.join(outputScriptsDir, 'alpine.min.js');
        copyFileSync(alpineSrcPath, alpineDestPath);
        console.log(chalk.green('Copied script'), 'alpine.min.js');
    }
};

/**
 * Copy headIncludes CSS files from sass source or build directory to output directory
 * This bypasses the SCSS compiler for plain CSS files
 */
const copyHeadIncludesCss = (headIncludes, outputDir, buildDir = null) => {
    const config = loadConfig();
    // Get the sass source directory from common patterns
    const cwd = process.cwd();
    const sassDir = path.join(cwd, 'sass');

    for (const cssPath of headIncludes) {
        if (cssPath.startsWith('./')) {
            const relativePath = cssPath.substring(2);
            const targetPath = path.join(outputDir, relativePath);

            // First try the sass source directory
            let sourcePath = path.join(sassDir, relativePath);

            // If not found in sass and buildDir is provided, try build directory
            // This handles compiled CSS like base.css which is generated from base.scss
            if (!existsSync(sourcePath) && buildDir) {
                sourcePath = path.join(buildDir, relativePath);
            }

            if (existsSync(sourcePath)) {
                ensureDir(path.dirname(targetPath));
                copyFileSync(sourcePath, targetPath);
                console.log(chalk.green('Copied CSS include'), relativePath);
            } else {
                console.log(chalk.yellow('CSS include not found'), relativePath);
            }
        }
    }
};

/**
 * Copy static assets from configured static folder to output directory
 * Preserves directory structure including the static folder itself
 */
export const copyStaticAssets = (cwd, outputDir) => {
    const config = loadConfig(cwd);
    const staticFolder = getStaticFolder(config);

    if (!staticFolder) {
        return;
    }

    const staticPath = path.join(cwd, staticFolder);

    if (!existsSync(staticPath)) {
        console.log(chalk.yellow(`Static folder not found: ${staticFolder}`));
        return;
    }

    // Copy static folder to output/static (preserving the static folder name)
    // This ensures paths like /static/screenshots/ work correctly
    const destPath = path.join(outputDir, 'static');
    copySync(staticPath, destPath);
    console.log(chalk.green('Copied static assets from'), staticFolder);
};

/**
 * Build the documentation site
 */
export const buildSite = async (sourceDir, outputDir, withmd = false) => {
    ensureDir(outputDir);

    // Process Tailwind CSS and copy template assets
    await processTailwindCSS(outputDir);
    await copyTemplateAssets(outputDir);

    // Copy static assets from configured folder
    copyStaticAssets(process.cwd(), outputDir);

    // Load configuration
    const config = loadConfig();
    const { local: headIncludes, external: externalCssIncludes } = getHeadIncludes(config);

    // Copy headIncludes CSS files to output (check both sass/ and build directory)
    copyHeadIncludesCss(headIncludes, outputDir, sourceDir);
    const componentGroupOrder = getComponentGroupOrder(config);
    const productionBasepath = getProductionBasepath(config);
    const branding = getBrandingConfig(config);
    const githubUrl = getGithubUrl(config);
    if (githubUrl) {
        branding.github = githubUrl;
    }
    const classPrefix = getClassPrefix(config);
    const tokenPrefix = getTokenPrefix(config);
    const themeConfig = getThemeConfig(config);

    // Load theme tokens and generate theme CSS (supports single file and multi-file configs)
    let themeOptions = null;
    const themeData = await loadThemeTokensAsync(process.cwd());

    // Generate themes.css (ALWAYS - themeMatrix always contains base tokens under :root)
    if (themeData?.themeMatrix) {
        const themeCss = generateThemeCss(themeData.themeMatrix, { tokenPrefix });
        const themeCssPath = path.join(outputDir, 'css', 'themes.css');
        ensureDir(path.dirname(themeCssPath));
        writeFileSync(themeCssPath, themeCss);
        console.log(chalk.green('Generated themes CSS'), themeCssPath);

        // Get theme options for UI if themes exist
        if (themeData.themes && Object.keys(themeData.themes).length > 0) {
            themeOptions = getThemeOptions(themeData.themes);
            themeOptions.config = themeConfig;
        }
    }

    // Load components data
    const componentsJson = loadComponentsJson(sourceDir);
    const groups = groupByGroup(componentsJson, componentGroupOrder);

    // Load UI Blocks data
    const blocksConfig = getBlocksConfig(config);
    const blocksJson = loadBlocksJson(sourceDir);
    const blockGroups = groupBlocksByGroup(blocksJson, blocksConfig.groupOrder || []);

    // Load Full Pages data
    const pagesConfig = getPagesConfig(config);
    const fullPagesJson = loadPagesJson(sourceDir);
    const pageGroups = groupPagesByGroup(fullPagesJson, pagesConfig.groupOrder || []);

    // Build navigation from docs folder structure
    const docsDir = path.join(process.cwd(), 'docs');
    const topNav = buildNavigationFromDocs(docsDir);
    const navigation = {
        topNav,
        groups,
        components: componentsJson.map(c => ({ name: c.name, title: c.title })),
        // Add UI Blocks to navigation
        blockGroups,
        blocks: blocksJson.map(b => ({ name: b.name, title: b.title })),
        // Add Full Pages to navigation
        pageGroups,
        fullPages: fullPagesJson.map(p => ({ name: p.name, title: p.title }))
    };

    // Process markdown files if requested
    if (withmd) {
        await processMarkdownFiles(process.cwd(), outputDir, {
            groups,
            components: componentsJson,
            externalCssIncludes,
            headIncludes,
            navigation,
            branding,
            classPrefix,
            themeOptions,
            basePath: './'
        });
    }

    // Build search index
    try {
        const tokens = loadTokens(process.cwd());
        const flatTokens = tokens ? flattenTokensForDisplay(tokens) : [];

        // Collect pages from navigation (only items with href)
        const searchablePages = (navigation.topNav || []).flatMap(item => {
            // Handle dropdown items with children
            if (item.children) {
                return item.children
                    .filter(child => child.href)
                    .map(child => ({
                        slug: child.href.replace('.html', '').replace(/^\.\//, ''),
                        title: child.label,
                        url: child.href
                    }));
            }
            // Skip items without href (like type: 'components')
            if (!item.href) {
                return [];
            }
            return [{
                slug: item.href.replace('.html', '').replace(/^\.\//, ''),
                title: item.label,
                url: item.href
            }];
        });

        // Get docs directory for recursive page collection
        const docsDir = path.join(process.cwd(), 'docs');

        const indexedCount = buildSearchIndex(
            componentsJson,
            searchablePages, // Legacy fallback, ignored when docsDir is provided
            flatTokens,
            outputDir,
            {
                blocks: blocksJson,
                fullPages: fullPagesJson,
                docsDir: existsSync(docsDir) ? docsDir : null
            }
        );

        if (indexedCount > 0) {
            console.log(chalk.green(`Built search index with ${indexedCount} items`));
        }
    } catch (error) {
        console.warn(chalk.yellow('Could not build search index:'), error.message);
    }

    // Copy JSON data files to output directory for screenshots command
    copyJsonDataFiles(sourceDir, outputDir, {
        components: componentsJson,
        blocks: blocksJson,
        pages: fullPagesJson
    });

    // Compile component template
    const templatePath = getTemplatePath('component.hbs');
    const template = compileTemplateFromPath(templatePath);

    // Compile preview frame template for iframe isolation (interactive playground)
    const previewTemplatePath = getTemplatePath('preview-frame.hbs');
    let previewTemplate = null;
    if (existsSync(previewTemplatePath)) {
        previewTemplate = compileTemplateFromPath(previewTemplatePath);
    }

    // Compile static preview template for examples and variations
    const staticPreviewTemplatePath = getTemplatePath('static-preview.hbs');
    let staticPreviewTemplate = null;
    if (existsSync(staticPreviewTemplatePath)) {
        staticPreviewTemplate = compileTemplateFromPath(staticPreviewTemplatePath);
    }

    // Render each component page
    componentsJson.forEach(component => {
        try {
            const adjustedCssIncludes = calculateCssIncludes(headIncludes, component, outputDir);

            // Transform component examples to use the configured prefix
            const transformedComponent = transformComponentExamples(component, classPrefix);

            // Add bidirectional dependency: which blocks use this component
            const usedInBlocks = getComponentUsedInBlocks(component, blocksJson);
            if (usedInBlocks.length > 0) {
                transformedComponent.usedInBlocks = usedInBlocks;
            }

            const context = {
                currentPath: component.path,
                components: componentsJson,
                groups,
                page: transformedComponent,
                headIncludes: adjustedCssIncludes,
                externalCssIncludes,
                productionBasepath,
                navigation,
                branding,
                classPrefix,
                themeOptions,
                basePath: '../',
                activeNav: deriveActiveNav(component.path)
            };

            const htmlOutput = template(context);

            const outputFilePath = path.join(outputDir, `${component.path}.html`);
            ensureDir(path.dirname(outputFilePath));

            // Copy component CSS
            copyComponentCss(component, sourceDir, outputDir);

            writeFileSync(outputFilePath, htmlOutput);

        // Generate preview frame HTML for iframe isolation (interactive playground)
        if (previewTemplate) {
            // Build root-relative CSS paths for preview
            // (preview template uses basePath to prepend '../' to reach root from components/ folder)
            const previewCssIncludes = [
                ...headIncludes,
                ...(component.dependencies || []).map(dep => `css/components/${dep}.css`),
                `css/components/${component.name}.css`
            ];
            const previewContext = {
                page: component,
                headIncludes: previewCssIncludes,
                externalCssIncludes,
                themeOptions,
                basePath: '../'  // Preview is in components/ folder, one level deep
            };
            const previewHtml = previewTemplate(previewContext);
            const previewFilePath = path.join(outputDir, 'components', `${component.name}-preview.html`);
            ensureDir(path.dirname(previewFilePath));
            writeFileSync(previewFilePath, previewHtml);
        }

        // Generate static preview files for each example
        // Preview files are in components/ folder, same as component pages
        // adjustedCssIncludes is already relative to components/ folder, so use as-is
        if (staticPreviewTemplate && transformedComponent.examples) {
            transformedComponent.examples.forEach((example, index) => {
                const exampleContext = {
                    title: `${component.title} - Example ${index}`,
                    content: example.code,
                    headIncludes: adjustedCssIncludes,
                    externalCssIncludes,
                    themeOptions,
                    basePath: '../'  // Preview is in components/ folder, one level deep
                };
                const exampleHtml = staticPreviewTemplate(exampleContext);
                const examplePath = path.join(outputDir, 'components', `${component.name}-example-${index}.preview.html`);
                writeFileSync(examplePath, exampleHtml);
            });
        }

        // Generate static preview files for each variation
        // Preview files are in components/ folder, same as component pages
        // adjustedCssIncludes is already relative to components/ folder, so use as-is
        if (staticPreviewTemplate && component.variations) {

            // Normalize variations to strings (they might be objects with 'name' property)
            const normalizedVariations = component.variations.map(v => {
                if (typeof v === 'string') return v;
                if (typeof v === 'object' && v !== null && v.name) return v.name;
                return String(v);
            });
            // Get the first example to use as template for variations (preserves proper nesting)
            const firstExample = transformedComponent.examples?.[0]?.code;
            const baseClassName = component.classname || component.name;

            normalizedVariations.forEach(variation => {
                let variationHtml;

                if (firstExample) {
                    // NEW APPROACH: Use first example as template, add variation class
                    // This preserves proper nesting structure for complex components

                    // Step 1: Remove existing variation classes from the base component
                    // e.g., "sol-dropdown sol-dropdown--open" -> "sol-dropdown"
                    // Pattern matches base--variation but NOT base__element--modifier
                    const removeVariationPattern = new RegExp(
                        `\\s*\\b${classPrefix}${baseClassName}--[a-zA-Z0-9-]+\\b`,
                        'g'
                    );
                    let html = firstExample.replace(removeVariationPattern, '');

                    // Step 2: Add new variation class after the first base class occurrence
                    // Only modify the root element, not nested elements with same base class
                    const addVariationPattern = new RegExp(
                        `(\\b${classPrefix}${baseClassName})\\b(?!__)(?!--)`
                    );
                    variationHtml = html.replace(
                        addVariationPattern,
                        `$1 $1--${variation}`
                    );
                } else {
                    // FALLBACK: Generate flat HTML from elements (for components without examples)
                    const tag = component.maintag || 'div';
                    const role = component.role || '';
                    const rawElements = component.elements || [];
                    const elements = rawElements.map(elem => {
                        if (typeof elem === 'string') return elem;
                        if (typeof elem === 'object' && elem !== null && elem.name) return elem.name;
                        return String(elem);
                    });

                    // Build elementConfigs map for quick lookup
                    const elementConfigsMap = {};
                    const elementConfigsSource = component.elementConfigs || rawElements;
                    if (Array.isArray(elementConfigsSource)) {
                        elementConfigsSource.forEach(config => {
                            if (typeof config === 'object' && config !== null && config.name && (config.html || config.pug)) {
                                elementConfigsMap[config.name] = config;
                            }
                        });
                    }

                    variationHtml = `<${tag}`;
                    if (role) {
                        variationHtml += ` role="${role}"`;
                    }
                    variationHtml += ` tabindex="0" class="${classPrefix}${baseClassName} ${classPrefix}${baseClassName}--${variation}">`;
                    elements.forEach(elem => {
                        const elemClass = `${classPrefix}${baseClassName}__${elem}`;
                        const config = elementConfigsMap[elem];

                        if (config && config.html) {
                            let elementHtml = config.html.replace(/\{\{class\}\}/g, elemClass);
                            variationHtml += transformExampleCode(elementHtml, classPrefix);
                        } else if (config && config.pug) {
                            try {
                                const pugTemplate = config.pug.replace(/\{\{class\}\}/g, elemClass);
                                variationHtml += transformExampleCode(pug.render(pugTemplate), classPrefix);
                            } catch (err) {
                                console.warn(chalk.yellow(`Pug error for ${elem}:`), err.message);
                                variationHtml += `<div class="${elemClass}">${elem}</div>`;
                            }
                        } else {
                            const capitalizedElem = elem.charAt(0).toUpperCase() + elem.slice(1);
                            variationHtml += `<div class="${elemClass}">${capitalizedElem}</div>`;
                        }
                    });
                    variationHtml += `</${tag}>`;
                }

                const variationContext = {
                    title: `${component.title} - ${variation}`,
                    content: variationHtml,
                    headIncludes: adjustedCssIncludes,
                    externalCssIncludes,
                    themeOptions,
                    basePath: '../'  // Preview is in components/ folder, one level deep
                };
                const previewHtml = staticPreviewTemplate(variationContext);
                const variationPath = path.join(outputDir, 'components', `${component.name}-variation-${variation}.preview.html`);
                writeFileSync(variationPath, previewHtml);
            });
        }
        } catch (error) {
            // Re-throw BuildErrors with added context, wrap other errors
            if (error instanceof BuildError) {
                // Add component context if not already set
                if (!error.component) {
                    error.component = component.name || component.title || 'unknown';
                }
                if (!error.file) {
                    error.file = component.sourcePath || `components/${component.name}`;
                }
                throw error;
            }
            throw new BuildError(
                `Failed to render component template`,
                {
                    file: component.sourcePath || `components/${component.name}`,
                    component: component.name || component.title || 'unknown',
                    phase: 'template-render',
                    hint: HINTS.TEMPLATE_RENDER,
                    originalError: error
                }
            );
        }
    });

    // Render UI Block pages
    if (blocksJson.length > 0) {
        const blockTemplatePath = getTemplatePath('block.hbs');
        if (existsSync(blockTemplatePath)) {
            const blockTemplate = compileTemplateFromPath(blockTemplatePath);

            blocksJson.forEach(block => {
                try {
                    // Get components this block depends on
                    const blockDependencies = (block.dependencies || []).map(depName =>
                        componentsJson.find(c => c.name === depName)
                    ).filter(Boolean);

                    // Calculate CSS includes for the block
                    const blockCssIncludes = [...headIncludes];
                    // Add dependency component CSS
                    (block.dependencies || []).forEach(dep => {
                        blockCssIncludes.push(`./css/components/${dep}.css`);
                    });
                    // Add block's own CSS if it has one
                    if (block.css) {
                        blockCssIncludes.push(`./blocks/${block.name}/${block.name}.css`);
                    }

                    const context = {
                        currentPath: block.path,
                        components: componentsJson,
                        groups,
                        blocks: blocksJson,
                        blockGroups,
                        page: block,
                        headIncludes: blockCssIncludes,
                        externalCssIncludes,
                        productionBasepath,
                        navigation,
                        branding,
                        classPrefix,
                        themeOptions,
                        basePath: '../',
                        blockDependencies,
                        activeNav: deriveActiveNav(block.path)
                    };

                    const htmlOutput = blockTemplate(context);
                    const outputFilePath = path.join(outputDir, `${block.path}.html`);
                    ensureDir(path.dirname(outputFilePath));
                    writeFileSync(outputFilePath, htmlOutput);

                    // Generate preview HTML file for iframe (using static-preview template)
                    if (staticPreviewTemplate) {
                        // Adjust CSS paths for preview (preview is in blocks/ folder, CSS is in parent)
                        const previewCssIncludes = blockCssIncludes.map(css => {
                            if (css.startsWith('./')) {
                                return '../' + css.slice(2);
                            }
                            return css;
                        });

                        const previewContext = {
                            title: `${block.title} - Preview`,
                            content: block.html,
                            headIncludes: previewCssIncludes,
                            externalCssIncludes,
                            themeOptions
                        };
                        const previewHtml = staticPreviewTemplate(previewContext);
                        const previewFilePath = path.join(outputDir, 'blocks', `${block.name}-preview.html`);
                        writeFileSync(previewFilePath, previewHtml);
                    }

                    console.log(chalk.green(`Rendered UI Block:`), block.name);
                } catch (error) {
                    console.warn(chalk.yellow(`Warning: Failed to render block ${block.name}: ${error.message}`));
                }
            });
        } else {
            console.log(chalk.yellow('No block.hbs template found, skipping UI Block rendering'));
        }
    }

    // Render Full Page documentation pages
    if (fullPagesJson.length > 0) {
        const fullPageTemplatePath = getTemplatePath('fullpage.hbs');
        if (existsSync(fullPageTemplatePath)) {
            const fullPageTemplate = compileTemplateFromPath(fullPageTemplatePath);

            fullPagesJson.forEach(fullPage => {
                try {
                    // Get components and blocks this page depends on
                    const pageDependencies = (fullPage.dependencies || []).map(depName =>
                        componentsJson.find(c => c.name === depName)
                    ).filter(Boolean);
                    const pageBlocks = (fullPage.blocks || []).map(blockName =>
                        blocksJson.find(b => b.name === blockName)
                    ).filter(Boolean);

                    // Calculate CSS includes for the page
                    const pageCssIncludes = [...headIncludes];
                    // Add dependency component CSS
                    (fullPage.dependencies || []).forEach(dep => {
                        pageCssIncludes.push(`./css/components/${dep}.css`);
                    });
                    // Add block CSS
                    (fullPage.blocks || []).forEach(blockName => {
                        const blockData = blocksJson.find(b => b.name === blockName);
                        if (blockData?.css) {
                            pageCssIncludes.push(`./blocks/${blockName}/${blockName}.css`);
                        }
                    });
                    // Add page's own CSS if it has one
                    if (fullPage.css) {
                        pageCssIncludes.push(`./pages/${fullPage.name}/${fullPage.name}.css`);
                    }

                    const context = {
                        currentPath: fullPage.path,
                        components: componentsJson,
                        groups,
                        blocks: blocksJson,
                        blockGroups,
                        fullPages: fullPagesJson,
                        pageGroups,
                        page: fullPage,
                        headIncludes: pageCssIncludes,
                        externalCssIncludes,
                        productionBasepath,
                        navigation,
                        branding,
                        classPrefix,
                        themeOptions,
                        basePath: '../',
                        pageDependencies,
                        pageBlocks,
                        activeNav: deriveActiveNav(fullPage.path)
                    };

                    const htmlOutput = fullPageTemplate(context);
                    const outputFilePath = path.join(outputDir, `${fullPage.path}.html`);
                    ensureDir(path.dirname(outputFilePath));
                    writeFileSync(outputFilePath, htmlOutput);

                    // Generate preview HTML file for iframe (using static-preview template)
                    if (staticPreviewTemplate) {
                        // Adjust CSS paths for preview (preview is in pages/ folder, CSS is in parent)
                        const previewCssIncludes = pageCssIncludes.map(css => {
                            if (css.startsWith('./')) {
                                return '../' + css.slice(2);
                            }
                            return css;
                        });

                        const previewContext = {
                            title: `${fullPage.title} - Preview`,
                            content: fullPage.html,
                            headIncludes: previewCssIncludes,
                            externalCssIncludes,
                            themeOptions
                        };
                        const previewHtml = staticPreviewTemplate(previewContext);
                        const previewFilePath = path.join(outputDir, 'pages', `${fullPage.name}-preview.html`);
                        writeFileSync(previewFilePath, previewHtml);
                    }

                    console.log(chalk.green(`Rendered Full Page:`), fullPage.name);
                } catch (error) {
                    console.warn(chalk.yellow(`Warning: Failed to render page ${fullPage.name}: ${error.message}`));
                }
            });
        } else {
            console.log(chalk.yellow('No fullpage.hbs template found, skipping Full Page rendering'));
        }
    }

    // Render index pages for components, blocks, and pages
    await renderIndexPages({
        outputDir,
        componentsJson,
        blocksJson,
        fullPagesJson,
        groups,
        blockGroups,
        pageGroups,
        headIncludes,
        externalCssIncludes,
        navigation,
        branding,
        themeOptions
    });
};

/**
 * Render index pages for components, blocks, and pages sections
 */
const renderIndexPages = async ({
    outputDir,
    componentsJson,
    blocksJson,
    fullPagesJson,
    groups,
    blockGroups,
    pageGroups,
    headIncludes,
    externalCssIncludes,
    navigation,
    branding,
    themeOptions
}) => {
    // Extract unique group names for filter buttons
    const componentGroupNames = [...new Set(componentsJson.map(c => c.group).filter(Boolean))];
    const blockGroupNames = [...new Set(blocksJson.map(b => b.group).filter(Boolean))];
    const pageGroupNames = [...new Set(fullPagesJson.map(p => p.group).filter(Boolean))];

    // Check for screenshot existence in shared ./static/screenshots/ folder
    const screenshotsDir = path.join(process.cwd(), 'static', 'screenshots');
    const hasScreenshot = (name, type = 'component') => {
        // Screenshots use naming pattern: component-{name}.png, block-{name}.png, page-{name}.png
        const screenshotPath = path.join(screenshotsDir, `${type}-${name}.png`);
        return existsSync(screenshotPath);
    };

    // Render Components Index
    const componentsIndexPath = getTemplatePath('components-index.hbs');
    if (existsSync(componentsIndexPath)) {
        const componentsIndexTemplate = compileTemplateFromPath(componentsIndexPath);
        const componentsWithScreenshots = componentsJson.map(c => ({
            ...c,
            hasScreenshot: hasScreenshot(c.name, 'component')
        }));

        const componentsIndexContext = {
            title: branding?.name || 'Design System',
            allComponents: componentsWithScreenshots,
            groups,
            groupNames: componentGroupNames,
            totalCount: componentsJson.length,
            headIncludes,
            externalCssIncludes,
            navigation,
            branding,
            themeOptions,
            basePath: '../',
            activeNav: 'components'
        };

        const componentsIndexHtml = componentsIndexTemplate(componentsIndexContext);
        const componentsIndexFilePath = path.join(outputDir, 'components', 'index.html');
        ensureDir(path.dirname(componentsIndexFilePath));
        writeFileSync(componentsIndexFilePath, componentsIndexHtml);
        console.log(chalk.green('Generated components index page'));
    }

    // Render Blocks Index
    if (blocksJson.length > 0) {
        const blocksIndexPath = getTemplatePath('blocks-index.hbs');
        if (existsSync(blocksIndexPath)) {
            const blocksIndexTemplate = compileTemplateFromPath(blocksIndexPath);
            const blocksWithScreenshots = blocksJson.map(b => ({
                ...b,
                hasScreenshot: hasScreenshot(b.name, 'block')
            }));

            const blocksIndexContext = {
                title: branding?.name || 'Design System',
                allBlocks: blocksWithScreenshots,
                blockGroups,
                groupNames: blockGroupNames,
                totalCount: blocksJson.length,
                headIncludes,
                externalCssIncludes,
                navigation,
                branding,
                themeOptions,
                basePath: '../',
                activeNav: 'blocks'
            };

            const blocksIndexHtml = blocksIndexTemplate(blocksIndexContext);
            const blocksIndexFilePath = path.join(outputDir, 'blocks', 'index.html');
            ensureDir(path.dirname(blocksIndexFilePath));
            writeFileSync(blocksIndexFilePath, blocksIndexHtml);
            console.log(chalk.green('Generated blocks index page'));
        }
    }

    // Render Pages Index
    if (fullPagesJson.length > 0) {
        const pagesIndexPath = getTemplatePath('pages-index.hbs');
        if (existsSync(pagesIndexPath)) {
            const pagesIndexTemplate = compileTemplateFromPath(pagesIndexPath);
            const pagesWithScreenshots = fullPagesJson.map(p => ({
                ...p,
                hasScreenshot: hasScreenshot(p.name, 'page')
            }));

            const pagesIndexContext = {
                title: branding?.name || 'Design System',
                allPages: pagesWithScreenshots,
                pageGroups,
                groupNames: pageGroupNames,
                totalCount: fullPagesJson.length,
                headIncludes,
                externalCssIncludes,
                navigation,
                branding,
                themeOptions,
                basePath: '../',
                activeNav: 'pages'
            };

            const pagesIndexHtml = pagesIndexTemplate(pagesIndexContext);
            const pagesIndexFilePath = path.join(outputDir, 'pages', 'index.html');
            ensureDir(path.dirname(pagesIndexFilePath));
            writeFileSync(pagesIndexFilePath, pagesIndexHtml);
            console.log(chalk.green('Generated pages index page'));
        }
    }
}

/**
 * Process package files from configuration
 */
export const processPackageFiles = async (cwd, outputDir) => {
    const config = loadConfig(cwd);

    if (!config?.packageFiles) {
        return;
    }

    config.packageFiles.forEach(entry => {
        const [src, tgt] = entry.split(':');

        let srcPath;
        if (src.startsWith('~')) {
            srcPath = path.join(cwd, 'node_modules', src.substring(1));
        } else {
            srcPath = path.isAbsolute(src) ? src : path.join(cwd, src);
        }

        let targetPath = path.join(outputDir, tgt);

        if (statSync(srcPath).isFile()) {
            targetPath = path.join(targetPath, path.basename(srcPath));
        }

        ensureDir(path.dirname(targetPath));
        copySync(srcPath, targetPath);
        console.log(chalk.green(`Copied packaged dependency`), src, tgt);
    });
};

/**
 * Process markdown files with watch support
 */
export const processMarkdownFiles_ = async (sourceDir, outputDir, watch) => {
    await buildSite(sourceDir, outputDir, true);

    if (watch) {
        watchDocsFolderForChanges(sourceDir, outputDir, buildSite);
    }
};

// Re-export watchDocsFolderForChanges for backward compatibility
export { watchDocsFolderForChanges };

// Re-export with original name for backward compatibility
export { processMarkdownFiles_ as processMarkdownFiles };
