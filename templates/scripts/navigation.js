// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Stylescribe Navigation JavaScript
 * Handles code expand, copy buttons, preview controls, and variant toggles
 * Theme and dropdown functionality is now handled by Alpine.js
 */

// Flash prevention - runs immediately before Alpine loads
// Applies theme from localStorage to prevent flash of wrong theme
(function() {
    var themeMode = localStorage.getItem('themeMode') || localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    // Handle system preference
    if (themeMode === 'system') {
        themeMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', themeMode);

    // Apply theme variant if set
    var themeVariant = localStorage.getItem('themeVariant') || 'default';
    if (themeVariant && themeVariant !== 'default') {
        var themeClass = localStorage.getItem('themeVariantClass') || 'theme-' + themeVariant;
        document.documentElement.classList.add(themeClass);
    }
})();

// Navigation component initialization functions
// Exposed on window.stylescribeNav for re-initialization after htmx navigation
(function() {
    /**
     * Initialize code block expand/collapse functionality
     */
    function initCodeExpand() {
        var codeContainers = document.querySelectorAll('.code-container');
        codeContainers.forEach(function(container) {
            if (container._initialized) return;
            container._initialized = true;

            var expandBtn = container.querySelector('.expand-btn');
            if (expandBtn) {
                expandBtn.addEventListener('click', function() {
                    container.classList.toggle('expanded');
                    expandBtn.textContent = container.classList.contains('expanded')
                        ? 'Collapse'
                        : 'Expand';
                });
            }
        });
    }

    /**
     * Initialize copy to clipboard functionality
     */
    function initCopyButtons() {
        var copyButtons = document.querySelectorAll('[data-copy]');
        copyButtons.forEach(function(button) {
            if (button._initialized) return;
            button._initialized = true;

            button.addEventListener('click', function() {
                var targetId = button.getAttribute('data-copy');
                var target = document.getElementById(targetId);

                if (target) {
                    navigator.clipboard.writeText(target.textContent).then(function() {
                        var originalText = button.textContent;
                        button.textContent = 'Copied!';
                        setTimeout(function() {
                            button.textContent = originalText;
                        }, 2000);
                    }).catch(function(err) {
                        console.error('Failed to copy:', err);
                    });
                }
            });
        });
    }

    /**
     * Initialize responsive preview controls for component playground
     */
    function initPreviewControls() {
        var previewButtons = document.querySelectorAll('[data-preview-size]');
        var previewFrame = document.getElementById('preview-frame');

        previewButtons.forEach(function(button) {
            if (button._initialized) return;
            button._initialized = true;

            button.addEventListener('click', function() {
                var size = button.getAttribute('data-preview-size');

                // Update active state
                previewButtons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                button.classList.add('active');

                // Update preview frame size
                if (previewFrame) {
                    switch (size) {
                        case 'mobile':
                            previewFrame.style.maxWidth = '375px';
                            break;
                        case 'tablet':
                            previewFrame.style.maxWidth = '768px';
                            break;
                        case 'desktop':
                            previewFrame.style.maxWidth = '100%';
                            break;
                    }
                }
            });
        });
    }

    /**
     * Initialize variant toggle functionality for component playground
     */
    function initVariantToggles() {
        var variantToggles = document.querySelectorAll('[data-variant]');
        variantToggles.forEach(function(toggle) {
            if (toggle._initialized) return;
            toggle._initialized = true;

            toggle.addEventListener('click', function() {
                var variantGroup = toggle.closest('.variant-group');
                if (variantGroup) {
                    variantGroup.querySelectorAll('[data-variant]').forEach(function(t) {
                        t.classList.remove('active');
                    });
                }
                toggle.classList.add('active');

                // Dispatch custom event for variant change
                var event = new CustomEvent('variantChange', {
                    detail: {
                        variant: toggle.getAttribute('data-variant'),
                        value: toggle.getAttribute('data-value')
                    }
                });
                document.dispatchEvent(event);
            });
        });
    }

    /**
     * Initialize all navigation components
     * Note: Mobile menu and dropdowns are now handled by Alpine.js
     */
    function initAll() {
        initCodeExpand();
        initCopyButtons();
        initPreviewControls();
        initVariantToggles();
    }

    // Expose functions globally for use by htmx navigation
    window.stylescribeNav = {
        initCodeExpand: initCodeExpand,
        initCopyButtons: initCopyButtons,
        initPreviewControls: initPreviewControls,
        initVariantToggles: initVariantToggles,
        initAll: initAll
    };

    // Initialize on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initAll);
})();
