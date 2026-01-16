// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Handlebars template utilities
 * Manages Handlebars instance, helpers, and partials registration
 */
import Handlebars from 'handlebars';
import path from 'path';
import pug from 'pug';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync, readdirSync } from '../fs.js';
import { getTemplatePath } from '../pathResolver.js';
import { BuildError, HINTS } from '../errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register Handlebars helpers
Handlebars.registerHelper('eq', function (a, b) {
    return (a === b);
});

Handlebars.registerHelper('prettyprint', function (content) {
    // Return content as-is in sync context, formatting happens at output
    return content;
});

Handlebars.registerHelper('nl2br', function (text) {
    const html = (text || '').toString().replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2');
    return new Handlebars.SafeString(html);
});

Handlebars.registerHelper('capitalizeFirst', function (text) {
    // Handle objects with 'name' property
    if (typeof text === 'object' && text !== null && text.name) {
        text = text.name;
    }
    if (typeof text !== 'string' || !text) {
        return '';
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
});

Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
});

/**
 * Get the name from an item (supports both string and object with 'name' property)
 * Usage: {{itemName variation}} or {{itemName element}}
 */
Handlebars.registerHelper('itemName', function (item) {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null && item.name) return item.name;
    return String(item);
});

/**
 * Get the description from an item (empty string for strings, description for objects)
 * Usage: {{itemDescription variation}}
 */
Handlebars.registerHelper('itemDescription', function (item) {
    if (typeof item === 'object' && item !== null && item.description) {
        return item.description;
    }
    return '';
});

/**
 * Check if an item has a description
 * Usage: {{#if (hasDescription variation)}}...{{/if}}
 */
Handlebars.registerHelper('hasDescription', function (item) {
    return typeof item === 'object' && item !== null && !!item.description;
});

/**
 * Generate HTML-escaped code for an element based on elementConfigs
 * Shows correct tag and class, with simplified content for display
 * @param {string} elementName - The element name (e.g., 'icon', 'label')
 * @param {string} classPrefix - The CSS class prefix (e.g., 'ds-')
 * @param {object} page - The component page object containing classname, name, elementConfigs
 */
Handlebars.registerHelper('elementCodeHtml', function (elementName, classPrefix, page) {
    // Defensive check: ensure page object exists
    if (!page) {
        throw new BuildError(
            `Component data not found when rendering element "${elementName}"`,
            {
                phase: 'template-render',
                hint: 'This usually means the component JSON failed to load. Check that your SCSS file has a valid annotation block with @title'
            }
        );
    }
    // Defensive check: ensure component has name or classname
    if (!page.classname && !page.name) {
        throw new BuildError(
            `Component missing name (derived from folder) or @classname annotation`,
            {
                phase: 'template-render',
                hint: 'The component name comes from the folder name by default. If missing, check your component folder structure'
            }
        );
    }

    // Defensive check: ensure elementName is a string
    // @elements can be either comma-separated strings or YAML objects
    if (typeof elementName === 'object' && elementName !== null) {
        // If it's an object, try to get the 'name' property
        elementName = elementName.name || String(elementName);
    }
    if (typeof elementName !== 'string' || !elementName) {
        throw new BuildError(
            `Invalid element format in @elements annotation`,
            {
                file: `components/${page.name}`,
                component: page.name,
                phase: 'template-render',
                hint: '@elements must be a comma-separated list of element names (e.g., "@elements icon, label, content"). Each element should be a simple string name.'
            }
        );
    }

    const baseClassName = page.classname || page.name;
    const elemClass = `${classPrefix}${baseClassName}__${elementName}`;

    // Look for element configs in page.elementConfigs OR in page.elements (when elements have html/pug)
    const elementConfigs = page.elementConfigs || page.elements;

    // Find the config for this element
    let config = null;
    if (elementConfigs && Array.isArray(elementConfigs)) {
        config = elementConfigs.find(c =>
            typeof c === 'object' && c !== null && c.name === elementName && (c.html || c.pug)
        );
    }

    let html;
    if (config && config.html) {
        // Get the HTML and replace the class placeholder
        let configHtml = config.html.replace(/\{\{class\}\}/g, elemClass);
        // Extract the tag name from the HTML
        const tagMatch = configHtml.match(/^<(\w+)/);
        const tag = tagMatch ? tagMatch[1] : 'div';

        // Check if there's nested HTML (contains another tag)
        const hasNestedHtml = configHtml.match(/>.*<[a-z]/i);

        // For complex content (SVGs, nested elements), simplify the display
        if (tag === 'svg' || hasNestedHtml) {
            html = `&lt;${tag} class="${elemClass}"&gt;...&lt;/${tag}&gt;`;
        } else {
            // Extract text content between tags
            const contentMatch = configHtml.match(/>([^<]*)<\//);
            const content = contentMatch ? contentMatch[1] : '';
            html = `&lt;${tag} class="${elemClass}"&gt;${Handlebars.Utils.escapeExpression(content)}&lt;/${tag}&gt;`;
        }
    } else if (config && config.pug) {
        // Compile Pug template and extract structure for display
        try {
            const pugTemplate = config.pug.replace(/\{\{class\}\}/g, elemClass);
            const renderedHtml = pug.render(pugTemplate);
            // Extract the tag name from rendered HTML
            const tagMatch = renderedHtml.match(/^<(\w+)/);
            const tag = tagMatch ? tagMatch[1] : 'div';

            // Check if there's nested HTML
            const hasNestedHtml = renderedHtml.match(/>.*<[a-z]/i);

            if (tag === 'svg' || hasNestedHtml) {
                html = `&lt;${tag} class="${elemClass}"&gt;...&lt;/${tag}&gt;`;
            } else {
                const contentMatch = renderedHtml.match(/>([^<]*)<\//);
                const content = contentMatch ? contentMatch[1] : '';
                html = `&lt;${tag} class="${elemClass}"&gt;${Handlebars.Utils.escapeExpression(content)}&lt;/${tag}&gt;`;
            }
        } catch (err) {
            // Fallback on Pug error
            const capitalizedElem = elementName.charAt(0).toUpperCase() + elementName.slice(1);
            html = `&lt;div class="${elemClass}"&gt;${capitalizedElem}&lt;/div&gt;`;
        }
    } else {
        // Fallback: div with capitalized element name
        const capitalizedElem = elementName.charAt(0).toUpperCase() + elementName.slice(1);
        html = `&lt;div class="${elemClass}"&gt;${capitalizedElem}&lt;/div&gt;`;
    }

    return new Handlebars.SafeString(html);
});

// Token category helpers for dynamic rendering
Handlebars.registerHelper('categoryIcon', function (category) {
    const icons = {
        color: '🎨',
        spacing: '📏',
        border: '◰',
        font: 'Aa',
        shadow: '☁️',
        layout: '⊞',
        animation: '⏱️',
        transition: '⏱️',
        chat: '💬'
    };
    return icons[category] || '📦';
});

Handlebars.registerHelper('categoryGradient', function (category) {
    const gradients = {
        color: 'linear-gradient(135deg, #f093fb, #f5576c)',
        spacing: 'linear-gradient(135deg, #667eea, #764ba2)',
        border: 'linear-gradient(135deg, #f093fb, #f5576c)',
        font: 'linear-gradient(135deg, #11998e, #38ef7d)',
        shadow: 'linear-gradient(135deg, #536976, #292E49)',
        layout: 'linear-gradient(135deg, #4facfe, #00f2fe)',
        animation: 'linear-gradient(135deg, #fa709a, #fee140)',
        transition: 'linear-gradient(135deg, #a8edea, #fed6e3)',
        chat: 'linear-gradient(135deg, #a8edea, #fed6e3)'
    };
    return gradients[category] || 'linear-gradient(135deg, #c3cfe2, #c3cfe2)';
});

/**
 * Get theme class for a specific section and key
 * Usage: {{themeClass 'hero' 'background'}}
 * Returns the Tailwind class string from branding.theme config
 */
Handlebars.registerHelper('themeClass', function (section, key, options) {
    const theme = options.data?.root?.branding?.theme || {};
    const sectionClasses = theme[section] || {};
    return sectionClasses[key] || '';
});

/**
 * Get theme accent color value
 * Usage: {{themeAccent}}
 * Returns the accent color hex value for use in styles
 */
Handlebars.registerHelper('themeAccent', function (options) {
    const theme = options.data?.root?.branding?.theme || {};
    return theme.accent || '#667eea';
});

/**
 * Convert text to lowercase
 * Usage: {{lowercase "Hello World"}}
 */
Handlebars.registerHelper('lowercase', function (text) {
    if (typeof text === 'object' && text !== null && text.name) {
        text = text.name;
    }
    if (typeof text !== 'string' || !text) {
        return '';
    }
    return text.toLowerCase();
});

/**
 * Truncate text to a maximum length
 * Usage: {{truncate description 100}}
 */
Handlebars.registerHelper('truncate', function (text, length) {
    if (typeof text !== 'string' || !text) {
        return '';
    }
    if (text.length <= length) {
        return text;
    }
    return text.substring(0, length).trim() + '...';
});

/**
 * Get icon for a component group
 * Usage: {{iconForGroup "Actions"}}
 */
Handlebars.registerHelper('iconForGroup', function (group) {
    const icons = {
        'Actions': '👆',
        'Containment': '📦',
        'Feedback': '💬',
        'Forms': '📝',
        'Layout': '📐',
        'Navigation': '🧭',
        'Identity': '👤',
        'Utilities': '🔧',
        'Data Display': '📊',
        'Overlays': '🪟',
        'Media': '🖼️'
    };
    return icons[group] || '📦';
});

/**
 * Get the length of an array
 * Usage: {{length items}}
 */
Handlebars.registerHelper('length', function (arr) {
    if (!arr || !Array.isArray(arr)) {
        return 0;
    }
    return arr.length;
});

/**
 * Take the first N items from an array
 * Usage: {{#each (take items 3)}}...{{/each}}
 */
Handlebars.registerHelper('take', function (arr, n) {
    if (!arr || !Array.isArray(arr)) {
        return [];
    }
    return arr.slice(0, n);
});

/**
 * Greater than comparison
 * Usage: {{#if (gt a b)}}...{{/if}}
 */
Handlebars.registerHelper('gt', function (a, b) {
    return a > b;
});

/**
 * Subtract numbers
 * Usage: {{subtract 10 3}}
 */
Handlebars.registerHelper('subtract', function (a, b) {
    return a - b;
});

/**
 * Sum the lengths of all arrays in an object
 * Usage: {{sumLengths groups}} - sums lengths of all group arrays
 */
Handlebars.registerHelper('sumLengths', function (obj) {
    if (!obj || typeof obj !== 'object') {
        return 0;
    }
    return Object.values(obj).reduce((sum, arr) => {
        if (Array.isArray(arr)) {
            return sum + arr.length;
        }
        return sum;
    }, 0);
});

/**
 * Register all partial templates from default and user override directories
 */
export const registerPartials = () => {
    // Go up from utils/templates to project root, then to templates/includes
    const defaultIncludesDir = path.join(__dirname, '..', '..', 'templates', 'includes');
    const cwdIncludesDir = path.join(process.cwd(), '.stylescribe', 'templates', 'includes');

    // Load default partials
    if (existsSync(defaultIncludesDir)) {
        const files = readdirSync(defaultIncludesDir);
        files.forEach(file => {
            const partial = readFileSync(path.join(defaultIncludesDir, file));
            const partialName = path.basename(file, '.hbs');
            Handlebars.registerPartial(partialName, partial);
        });
    }

    // Load user override partials (these will override defaults with same name)
    if (existsSync(cwdIncludesDir)) {
        const files = readdirSync(cwdIncludesDir);
        files.forEach(file => {
            const partial = readFileSync(path.join(cwdIncludesDir, file));
            Handlebars.registerPartial(path.basename(file, '.hbs'), partial);
        });
    }
};

/**
 * Compile a template file
 * @param {string} templateName - Template file name (without .hbs extension)
 * @returns {HandlebarsTemplateDelegate} Compiled template function
 */
export const compileTemplate = (templateName) => {
    const templatePath = getTemplatePath(`${templateName}.hbs`);
    const templateContent = readFileSync(templatePath);
    return Handlebars.compile(templateContent);
};

/**
 * Compile a template from a file path
 * @param {string} templatePath - Full path to template file
 * @returns {HandlebarsTemplateDelegate} Compiled template function
 */
export const compileTemplateFromPath = (templatePath) => {
    const templateContent = readFileSync(templatePath);
    return Handlebars.compile(templateContent);
};

/**
 * Render a template with context
 * @param {string} templateName - Template file name (without .hbs extension)
 * @param {object} context - Template context data
 * @returns {string} Rendered HTML
 */
export const renderTemplate = (templateName, context) => {
    const template = compileTemplate(templateName);
    return template(context);
};

// Initialize partials on module load
registerPartials();

export { Handlebars };

export default {
    Handlebars,
    registerPartials,
    compileTemplate,
    compileTemplateFromPath,
    renderTemplate
};
