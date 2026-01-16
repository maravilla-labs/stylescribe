---
title: MCP Integration
navtitle: MCP Integration
slug: mcp-integration
order: 5
---

StyleScribe includes a built-in Model Context Protocol (MCP) server for AI assistant integration. This enables tools like Claude Code to understand your design system and help create components.

## What is MCP?

The Model Context Protocol is a standard for AI assistants to interact with external tools and data sources. StyleScribe's MCP server provides:

- **Resources** - Documentation that AI can read
- **Tools** - Commands AI can execute

## Setup with Claude Code

### 1. Add MCP Configuration

Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "stylescribe": {
      "command": "npx",
      "args": ["stylescribe", "mcp"]
    }
  }
}
```

### 2. Generate CLAUDE.md

When initializing a project, use the `--claude` flag:

```bash
stylescribe init my-project --claude
```

Or add manually. This file teaches the AI about your project conventions.

### 3. Use in Claude Code

Open your project with Claude Code. The AI will have access to StyleScribe's tools and documentation.

## Available Resources

The MCP server exposes these documentation resources:

| Resource URI | Description |
|--------------|-------------|
| `stylescribe://docs/cli-commands` | CLI command reference |
| `stylescribe://docs/annotations` | Component annotation syntax |
| `stylescribe://docs/tokens` | Token format and functions |
| `stylescribe://docs/css-architecture` | CSS patterns and layers |
| `stylescribe://docs/container-queries` | @container patterns |
| `stylescribe://docs/theming` | Dark mode and themes |
| `stylescribe://docs/config` | Configuration options |
| `stylescribe://docs/coding-guidelines` | Best practices |

## Available Tools

### Component Creation

#### `stylescribe_create_component`

Create a new component scaffold.

```
stylescribe_create_component({
  name: "alert",
  group: "Communication"
})
```

#### `stylescribe_create_page`

Create a documentation page.

```
stylescribe_create_page({
  name: "usage-guide",
  title: "Usage Guide"
})
```

### Token Management

#### `stylescribe_validate_tokens`

Validate a token file against W3C DTCG spec.

```
stylescribe_validate_tokens({
  input: "./tokens/design-tokens.json"
})
```

#### `stylescribe_export_tokens`

Export tokens to different formats.

```
stylescribe_export_tokens({
  input: "./tokens/design-tokens.json",
  format: "css",
  output: "./variables.css"
})
```

### Theme Management

#### `stylescribe_add_theme`

Add a new theme to the project.

```
stylescribe_add_theme({
  name: "dark",
  dark: true
})
```

### Icon Management

#### `stylescribe_icons_list`

List installed icon packages.

```
stylescribe_icons_list()
```

#### `stylescribe_icons_search`

Search for icons by name.

```
stylescribe_icons_search({
  query: "trash"
})
```

#### `stylescribe_icons_get_path`

Get the token path for a specific icon.

```
stylescribe_icons_get_path({
  package: "bootstrap-icons",
  icon: "trash"
})
```

#### `stylescribe_icons_discover`

List all icons in a package.

```
stylescribe_icons_discover({
  package: "bootstrap-icons"
})
```

## Example Workflow

Here's how an AI assistant might help create a component:

**User**: Create a notification component with info, success, warning, and error variants.

**AI Assistant**:

1. Reads `stylescribe://docs/annotations` to understand annotation syntax
2. Reads `stylescribe://docs/tokens` to find available color tokens
3. Calls `stylescribe_create_component({ name: "notification", group: "Communication" })`
4. Reads the scaffolded file
5. Edits to add variants, elements, and examples
6. Validates the result

## CLAUDE.md Best Practices

Include these sections in your CLAUDE.md:

```markdown
# Project Guidelines

## Component Structure
- Use `ds-` prefix in source SCSS
- Token-driven variants (no hardcoded colors)
- Include font-family for component isolation

## Token Conventions
- Read design-tokens.json before creating components
- Use semantic tokens for theming support
- Accessibility tokens for text on colored backgrounds

## Required Annotations
- @title, @description, @group (required)
- @examples with YAML format
- @variations if component has variants
```

## Troubleshooting

### MCP Server Not Starting

Ensure StyleScribe is installed:

```bash
npm install -g stylescribe
# or locally
npm install --save-dev stylescribe
```

### Tools Not Available

Check `.mcp.json` configuration:

```json
{
  "mcpServers": {
    "stylescribe": {
      "command": "npx",
      "args": ["stylescribe", "mcp"]
    }
  }
}
```

### Resources Not Loading

Resources are loaded from StyleScribe's installation path. Reinstall if needed:

```bash
npm install -g stylescribe@latest
```
