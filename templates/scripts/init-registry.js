// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Stylescribe Init Registry
 * Centralized system for page-specific JavaScript initialization after SPA navigation.
 *
 * Usage:
 * 1. Register page init functions:
 *    window.stylescribeInit.register('tokens', initFn, cleanupFn);
 *
 * 2. After Swup navigation, spa-navigation.js calls:
 *    window.stylescribeInit.initCurrentPage();
 *
 * 3. Page type is determined by data-page-type on <body>
 */
(function() {
    window.stylescribeInit = {
        _handlers: {},
        _currentCleanup: null,

        /**
         * Register init/cleanup functions for a page type
         * @param {string} pageType - Matches data-page-type on body
         * @param {Function} initFn - Called on page load/navigation
         * @param {Function} [cleanupFn] - Called before next init (optional)
         */
        register: function(pageType, initFn, cleanupFn) {
            this._handlers[pageType] = {
                init: initFn,
                cleanup: cleanupFn || null
            };
        },

        /**
         * Initialize the current page based on data-page-type
         * Called by spa-navigation.js after each navigation
         */
        initCurrentPage: function() {
            // Run cleanup from previous page if any
            if (this._currentCleanup) {
                try {
                    this._currentCleanup();
                } catch (e) {
                    console.warn('[stylescribeInit] Cleanup error:', e);
                }
                this._currentCleanup = null;
            }

            // Get current page type
            var pageType = document.body.dataset.pageType;
            if (!pageType) return;

            var handler = this._handlers[pageType];
            if (!handler) return;

            // Store cleanup for next navigation
            if (handler.cleanup) {
                this._currentCleanup = handler.cleanup;
            }

            // Run init
            try {
                handler.init();
            } catch (e) {
                console.error('[stylescribeInit] Init error for', pageType + ':', e);
            }
        },

        /**
         * Check if a handler is registered for a page type
         * @param {string} pageType
         * @returns {boolean}
         */
        hasHandler: function(pageType) {
            return !!this._handlers[pageType];
        }
    };
})();
