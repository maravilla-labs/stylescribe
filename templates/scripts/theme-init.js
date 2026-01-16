// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Theme initialization script
 * Runs synchronously before page render to prevent flash of wrong theme
 */
(function() {
    // Load dark/light mode
    var themeMode = localStorage.getItem('themeMode') || localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', themeMode);
    if (themeMode === 'dark') document.documentElement.classList.add('dark');

    // Load theme variant (if set)
    var themeVariant = localStorage.getItem('themeVariant') || 'default';
    if (themeVariant && themeVariant !== 'default') {
        var themeClass = localStorage.getItem('themeVariantClass') || 'theme-' + themeVariant;
        document.documentElement.classList.add(themeClass);
    }
})();
