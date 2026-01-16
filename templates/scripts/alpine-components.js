// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Stylescribe Alpine.js Components
 * Reactive UI components using Alpine.js for theme toggle, dropdowns, and mobile menu
 */

// Initialize Alpine components
document.addEventListener('alpine:init', function() {
    /**
     * Dark mode toggle component
     * Handles light/dark/system theme switching with localStorage persistence
     */
    Alpine.data('darkMode', function() {
        return {
            mode: localStorage.getItem('themeMode') ||
                  localStorage.getItem('theme') ||
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),

            init: function() {
                var self = this;
                this.applyTheme();

                // Listen for system preference changes
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
                    if (self.mode === 'system') {
                        self.applyTheme();
                    }
                });
            },

            toggle: function() {
                this.mode = this.mode === 'dark' ? 'light' : 'dark';
                localStorage.setItem('themeMode', this.mode);
                localStorage.setItem('theme', this.mode);
                this.applyTheme();
            },

            setMode: function(newMode) {
                this.mode = newMode;
                localStorage.setItem('themeMode', newMode);
                if (newMode === 'system') {
                    var actualMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    localStorage.setItem('theme', actualMode);
                } else {
                    localStorage.setItem('theme', newMode);
                }
                this.applyTheme();
            },

            applyTheme: function() {
                var actualMode = this.mode;
                if (this.mode === 'system') {
                    actualMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                document.documentElement.setAttribute('data-theme', actualMode);

                // Update theme picker mode buttons if present
                var self = this;
                document.querySelectorAll('.theme-mode-btn').forEach(function(btn) {
                    if (btn.getAttribute('data-mode') === self.mode) {
                        btn.classList.add('theme-mode-active');
                    } else {
                        btn.classList.remove('theme-mode-active');
                    }
                });

                // Dispatch event for other components (iframe sync, etc.)
                window.dispatchEvent(new CustomEvent('themeModeChange', {
                    detail: { mode: this.mode, actualMode: actualMode }
                }));
            },

            get isDark() {
                if (this.mode === 'system') {
                    return window.matchMedia('(prefers-color-scheme: dark)').matches;
                }
                return this.mode === 'dark';
            }
        };
    });

    /**
     * Dropdown component
     * Click-to-toggle dropdowns with click-away close
     */
    Alpine.data('dropdown', function() {
        return {
            open: false,

            toggle: function() {
                // Close other dropdowns first
                var self = this;
                document.querySelectorAll('[x-data*="dropdown"]').forEach(function(el) {
                    if (el !== self.$el && el._x_dataStack) {
                        var data = el._x_dataStack[0];
                        if (data && data.open) {
                            data.open = false;
                        }
                    }
                });
                this.open = !this.open;
            },

            close: function() {
                this.open = false;
            }
        };
    });

    /**
     * Mobile menu component
     * Toggle mobile navigation with click-away close
     */
    Alpine.data('mobileMenu', function() {
        return {
            open: false,

            toggle: function() {
                this.open = !this.open;
            },

            close: function() {
                this.open = false;
            }
        };
    });

    /**
     * Theme variant selector component
     * Handles theme variant switching (e.g., different color schemes)
     */
    Alpine.data('themeVariant', function() {
        return {
            variant: localStorage.getItem('themeVariant') || 'default',
            variantClass: localStorage.getItem('themeVariantClass') || '',

            init: function() {
                this.applyVariant();
            },

            setVariant: function(name, className) {
                this.variant = name;
                this.variantClass = className;
                localStorage.setItem('themeVariant', name);
                localStorage.setItem('themeVariantClass', className || '');
                this.applyVariant();
            },

            applyVariant: function() {
                // Remove existing theme-* classes
                document.documentElement.className =
                    document.documentElement.className.replace(/theme-\S+/g, '').trim();

                if (this.variant && this.variant !== 'default' && this.variantClass) {
                    document.documentElement.classList.add(this.variantClass);
                }

                // Update theme variant select if present
                var variantSelect = document.getElementById('themeVariantSelect');
                if (variantSelect) {
                    variantSelect.value = this.variant;
                }

                // Dispatch event for iframe sync
                window.dispatchEvent(new CustomEvent('themeVariantChange', {
                    detail: { variant: this.variant, className: this.variantClass }
                }));
            }
        };
    });
});

// Expose theme functions globally for compatibility with existing code
window.stylescribeTheme = {
    setMode: function(mode) {
        // Find the darkMode Alpine component and call setMode
        var el = document.querySelector('[x-data*="darkMode"]');
        if (el && el._x_dataStack) {
            el._x_dataStack[0].setMode(mode);
        }
    },
    setVariant: function(name, className) {
        // Find the themeVariant Alpine component and call setVariant
        var el = document.querySelector('[x-data*="themeVariant"]');
        if (el && el._x_dataStack) {
            el._x_dataStack[0].setVariant(name, className);
        }
    },
    getMode: function() {
        return localStorage.getItem('themeMode') ||
               localStorage.getItem('theme') ||
               (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    },
    getVariant: function() {
        return {
            name: localStorage.getItem('themeVariant') || 'default',
            className: localStorage.getItem('themeVariantClass') || ''
        };
    }
};
