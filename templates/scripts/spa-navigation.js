// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Stylescribe SPA Navigation
 * Uses swup for instant page transitions without full reloads
 */
(function() {
    // Only initialize if Swup is available
    if (typeof Swup === 'undefined') {
        console.warn('Swup not loaded, SPA navigation disabled');
        return;
    }

    // Configure plugins
    var plugins = [];

    // Add scripts plugin to re-execute inline scripts after navigation
    if (typeof SwupScriptsPlugin !== 'undefined') {
        plugins.push(new SwupScriptsPlugin({
            head: false,  // Don't re-execute head scripts
            body: true    // Re-execute body scripts
        }));
    }

    const swup = new Swup({
        containers: ['#swup'],
        animationSelector: false, // No animation - instant swap
        cache: true,
        plugins: plugins,
        // Only intercept internal links
        linkSelector: 'a[href^="' + window.location.origin + '"]:not([data-no-swup]), ' +
                      'a[href^="/"]:not([data-no-swup]), ' +
                      'a[href^="./"]:not([data-no-swup]), ' +
                      'a[href^="../"]:not([data-no-swup])'
    });

    // Re-initialize components after each page navigation
    swup.hooks.on('page:view', function() {
        // Re-initialize Prism syntax highlighting
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }

        // Re-initialize navigation components (mobile menu, dropdowns, copy buttons, etc.)
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

        // Run page-specific initialization (tokens filter, block iframes, etc.)
        if (window.stylescribeInit) {
            window.stylescribeInit.initCurrentPage();
        }

        // Scroll to top of page
        window.scrollTo(0, 0);

        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            if (mobileMenuButton) {
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                const openIcon = mobileMenuButton.querySelector('.icon-open');
                const closeIcon = mobileMenuButton.querySelector('.icon-close');
                if (openIcon && closeIcon) {
                    openIcon.classList.remove('hidden');
                    closeIcon.classList.add('hidden');
                }
            }
        }

        // Close any open dropdowns
        document.querySelectorAll('.dropdown-menu.show').forEach(function(dropdown) {
            dropdown.classList.remove('show');
            const toggle = document.querySelector('[data-dropdown-toggle="' + dropdown.id + '"]');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Handle same-page anchor links (don't intercept hash-only navigation)
    swup.hooks.on('link:click', function(visit) {
        const url = new URL(visit.to.url, window.location.origin);
        const currentUrl = new URL(window.location.href);

        // If clicking a hash link to the same page, let browser handle it
        if (url.pathname === currentUrl.pathname && url.hash) {
            visit.action = 'skip';
        }
    });

    // Expose swup instance for debugging
    window.stylescribeSwup = swup;
})();
