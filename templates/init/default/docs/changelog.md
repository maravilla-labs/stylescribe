---
title: Changelog
template: page-wide
navtitle: Changelog
order: 4
---

All notable changes to this design system will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - {{date}}

### Added

- Initial release of the design system
- **Button** component with primary, secondary, outline, and danger variants
- **Card** component with default, bordered, and elevated variants
- **Alert** component with info, success, warning, and error variants
- **Badge** component with status indicators
- **Avatar** component for user representation
- **AI Chat** components: Chat Bubble, Chat Input, Chat Window
- Design tokens for colors, spacing, typography, borders, shadows
- Documentation site with live component examples
- Dark mode theme support
- CSS custom properties for all design tokens

### Components

| Component | Variants | Group | Status |
|-----------|----------|-------|--------|
| Button | primary, secondary, outline, danger, sm, lg | Actions | Verified |
| Card | default, bordered, elevated, compact | Containment | Verified |
| Alert | info, success, warning, error | Communication | Verified |
| Badge | primary, success, warning, error, pill, dot | Communication | Verified |
| Avatar | circle, rounded, xs-xl sizes | Identity | Verified |
| Chat Bubble | user, assistant, compact | AI Chat | Verified |
| Chat Input | default, expanded | AI Chat | Verified |
| Chat Window | default, fullscreen, embedded | AI Chat | Verified |

---

## Template

Use this format for future releases:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing features

### Deprecated
- Features that will be removed

### Removed
- Features that have been removed

### Fixed
- Bug fixes
```
