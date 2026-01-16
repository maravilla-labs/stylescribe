// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Stylescribe htmx Navigation
 * Uses htmx with hx-boost for instant page transitions without full reloads
 */
(function() {
    // Only initialize if htmx is available
    if (typeof htmx === 'undefined') {
        console.warn('htmx not loaded, SPA navigation disabled');
        return;
    }

    // Configure htmx
    htmx.config.historyCacheSize = 10;
    htmx.config.defaultSwapStyle = 'outerHTML';
    htmx.config.globalViewTransitions = false;
    htmx.config.scrollBehavior = 'instant';

    /**
     * Detect page type from URL path
     * This is more reliable than data-page-type on body after htmx navigation
     */
    function detectPageType() {
        var path = window.location.pathname;

        // Index pages
        if (path.match(/\/components\/index\.html$/) || path.match(/\/components\/?$/)) {
            return 'components-index';
        }
        if (path.match(/\/blocks\/index\.html$/) || path.match(/\/blocks\/?$/)) {
            return 'blocks-index';
        }
        if (path.match(/\/pages\/index\.html$/) || path.match(/\/pages\/?$/)) {
            return 'pages-index';
        }

        // Individual pages
        if (path.includes('/components/') && path.endsWith('.html')) {
            return 'component';
        }
        if (path.includes('/blocks/') && path.endsWith('.html')) {
            return 'block';
        }
        if (path.includes('/pages/') && path.endsWith('.html')) {
            return 'fullpage';
        }
        if (path.includes('/docs/') && path.endsWith('.html')) {
            return 'docs';
        }
        if (path.includes('tokens') && path.endsWith('.html')) {
            return 'tokens-wide';
        }

        // Fallback to body data attribute
        return document.body.dataset.pageType || null;
    }

    /**
     * Refresh all iframes by reloading their src
     * This ensures iframes work correctly after htmx navigation
     */
    function refreshIframes() {
        // Small delay to ensure DOM is fully settled
        setTimeout(function() {
            var iframes = document.querySelectorAll('iframe[src]');
            iframes.forEach(function(iframe) {
                // Skip if already refreshed in this navigation
                if (iframe._htmxRefreshed) return;
                iframe._htmxRefreshed = true;

                var src = iframe.getAttribute('src');
                if (src && !src.startsWith('about:') && !src.startsWith('javascript:')) {
                    // Force reload by setting src again
                    iframe.src = src;
                }
            });
        }, 50);
    }

    /**
     * Run page-specific initialization based on detected page type
     */
    function initPageByType() {
        var pageType = detectPageType();
        if (!pageType) return;

        // Update body data-page-type to match current page (for other scripts)
        document.body.dataset.pageType = pageType;

        // Run init registry handler if available
        if (window.stylescribeInit && window.stylescribeInit.hasHandler(pageType)) {
            window.stylescribeInit.initCurrentPage();
        }
    }

    // Re-initialize components after htmx swaps content
    document.body.addEventListener('htmx:afterSwap', function(event) {
        // Clear iframe refresh flags for new content
        document.querySelectorAll('iframe').forEach(function(iframe) {
            iframe._htmxRefreshed = false;
        });

        // Re-initialize Prism syntax highlighting
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }

        // Re-initialize navigation components (copy buttons, preview controls, etc.)
        // Note: Mobile menu and dropdowns are now handled by Alpine.js
        if (window.stylescribeNav) {
            window.stylescribeNav.initAll();
        }

        // Re-initialize search (index is cached, just rebinds events)
        if (window.stylescribeSearch) {
            window.stylescribeSearch.init();
        }

        // Re-initialize component page functionality (playground, copy buttons, iframes)
        if (window.stylescribeComponent) {
            window.stylescribeComponent.initAll();
        }

        // Re-initialize nested sidebar collapse (for documentation pages)
        if (window.stylescribePageInit && window.stylescribePageInit.nestedSidebarCollapse) {
            window.stylescribePageInit.nestedSidebarCollapse();
        }

        // Run page-specific initialization based on URL detection
        initPageByType();

        // Refresh iframes to ensure they load correctly
        refreshIframes();

        // Scroll to top of page (unless it's a hash link)
        if (!window.location.hash) {
            window.scrollTo(0, 0);
        }
    });

    // Handle page title updates after navigation
    document.body.addEventListener('htmx:afterSettle', function(event) {
        // Update document title from the swapped content's title tag if present
        var newTitle = document.querySelector('title');
        if (newTitle && newTitle.textContent) {
            document.title = newTitle.textContent;
        }
    });

    // Handle hash link navigation (scroll to anchor)
    document.body.addEventListener('htmx:afterOnLoad', function(event) {
        if (window.location.hash) {
            var target = document.querySelector(window.location.hash);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    // Expose htmx instance and utilities for debugging
    window.stylescribeHtmx = htmx;
    window.stylescribeHtmx.detectPageType = detectPageType;
    window.stylescribeHtmx.initPageByType = initPageByType;
})();
