// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Stylescribe Page Initializers
 * Shared init functions for all page types - loaded on every page
 * so handlers are available for htmx navigation
 */
(function() {
    // Components Index Page
    function initComponentsIndexPage() {
        var searchInput = document.getElementById('componentSearch');
        var filterBtns = document.querySelectorAll('.index-filter-btn');
        var cards = document.querySelectorAll('.index-card');
        var visibleCount = document.getElementById('visibleCount');
        var emptyState = document.getElementById('emptyState');
        var grid = document.getElementById('componentGrid');

        if (filterBtns.length === 0) return;

        var currentFilter = 'all';
        var searchTerm = '';

        function filterCards() {
            var visible = 0;
            cards.forEach(function(card) {
                var group = card.dataset.group;
                var name = card.dataset.name;
                var matchesFilter = currentFilter === 'all' || group === currentFilter;
                var matchesSearch = !searchTerm || name.includes(searchTerm.toLowerCase());
                if (matchesFilter && matchesSearch) {
                    card.style.display = '';
                    visible++;
                } else {
                    card.style.display = 'none';
                }
            });
            if (visibleCount) visibleCount.textContent = visible;
            if (emptyState) emptyState.style.display = visible === 0 ? '' : 'none';
            if (grid) grid.style.display = visible === 0 ? 'none' : '';
        }

        function activateFilter(filterValue) {
            filterBtns.forEach(function(btn) {
                btn.classList.remove('active');
                if (btn.dataset.filter === filterValue) {
                    btn.classList.add('active');
                }
            });
            currentFilter = filterValue;
            filterCards();
        }

        filterBtns.forEach(function(btn) {
            if (btn._indexInitialized) return;
            btn._indexInitialized = true;
            btn.addEventListener('click', function() {
                activateFilter(btn.dataset.filter);
                // Update URL hash when filter clicked
                if (btn.dataset.filter !== 'all') {
                    history.replaceState(null, '', '#' + btn.dataset.filter.toLowerCase());
                } else {
                    history.replaceState(null, '', window.location.pathname);
                }
            });
        });

        if (searchInput && !searchInput._indexInitialized) {
            searchInput._indexInitialized = true;
            searchInput.addEventListener('input', function() {
                searchTerm = this.value;
                filterCards();
            });
        }

        // Check URL hash for initial filter
        var hash = window.location.hash.slice(1).toLowerCase();
        if (hash) {
            // Find matching filter button (case-insensitive)
            var matchingBtn = null;
            filterBtns.forEach(function(btn) {
                if (btn.dataset.filter.toLowerCase() === hash) {
                    matchingBtn = btn;
                }
            });
            if (matchingBtn) {
                activateFilter(matchingBtn.dataset.filter);
            }
        }

        initSidebarCollapse();
    }

    // Blocks Index Page
    function initBlocksIndexPage() {
        var searchInput = document.getElementById('blockSearch');
        var filterBtns = document.querySelectorAll('.index-filter-btn');
        var cards = document.querySelectorAll('.index-card');
        var visibleCount = document.getElementById('visibleCount');
        var emptyState = document.getElementById('emptyState');
        var grid = document.getElementById('blockGrid');

        if (filterBtns.length === 0) return;

        var currentFilter = 'all';
        var searchTerm = '';

        function filterCards() {
            var visible = 0;
            cards.forEach(function(card) {
                var group = card.dataset.group;
                var name = card.dataset.name;
                var matchesFilter = currentFilter === 'all' || group === currentFilter;
                var matchesSearch = !searchTerm || name.includes(searchTerm.toLowerCase());
                if (matchesFilter && matchesSearch) {
                    card.style.display = '';
                    visible++;
                } else {
                    card.style.display = 'none';
                }
            });
            if (visibleCount) visibleCount.textContent = visible;
            if (emptyState) emptyState.style.display = visible === 0 ? '' : 'none';
            if (grid) grid.style.display = visible === 0 ? 'none' : '';
        }

        filterBtns.forEach(function(btn) {
            if (btn._indexInitialized) return;
            btn._indexInitialized = true;
            btn.addEventListener('click', function() {
                filterBtns.forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                filterCards();
            });
        });

        if (searchInput && !searchInput._indexInitialized) {
            searchInput._indexInitialized = true;
            searchInput.addEventListener('input', function() {
                searchTerm = this.value;
                filterCards();
            });
        }

        initSidebarCollapse();
    }

    // Pages Index Page
    function initPagesIndexPage() {
        var searchInput = document.getElementById('pageSearch');
        var filterBtns = document.querySelectorAll('.index-filter-btn');
        var cards = document.querySelectorAll('.index-card');
        var visibleCount = document.getElementById('visibleCount');
        var emptyState = document.getElementById('emptyState');
        var grid = document.getElementById('pageGrid');

        if (filterBtns.length === 0) return;

        var currentFilter = 'all';
        var searchTerm = '';

        function filterCards() {
            var visible = 0;
            cards.forEach(function(card) {
                var group = card.dataset.group;
                var name = card.dataset.name;
                var matchesFilter = currentFilter === 'all' || group === currentFilter;
                var matchesSearch = !searchTerm || name.includes(searchTerm.toLowerCase());
                if (matchesFilter && matchesSearch) {
                    card.style.display = '';
                    visible++;
                } else {
                    card.style.display = 'none';
                }
            });
            if (visibleCount) visibleCount.textContent = visible;
            if (emptyState) emptyState.style.display = visible === 0 ? '' : 'none';
            if (grid) grid.style.display = visible === 0 ? 'none' : '';
        }

        filterBtns.forEach(function(btn) {
            if (btn._indexInitialized) return;
            btn._indexInitialized = true;
            btn.addEventListener('click', function() {
                filterBtns.forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                filterCards();
            });
        });

        if (searchInput && !searchInput._indexInitialized) {
            searchInput._indexInitialized = true;
            searchInput.addEventListener('input', function() {
                searchTerm = this.value;
                filterCards();
            });
        }

        initSidebarCollapse();
    }

    // Tokens Wide Page
    function initTokensWidePage() {
        var filterBtns = document.querySelectorAll('.filter-btn');
        var searchBox = document.getElementById('tokenSearch');

        if (filterBtns.length === 0) return;

        function filterTokens(type, search) {
            var items = document.querySelectorAll('[data-token-name]');
            var sections = document.querySelectorAll('.category-section');
            var searchLower = search.toLowerCase();

            items.forEach(function(item) {
                var tokenName = item.dataset.tokenName.toLowerCase();
                var section = item.closest('.category-section');
                var sectionCategory = section ? section.dataset.category : '';
                var matchesType = type === 'all' || sectionCategory === type;
                var matchesSearch = !search || tokenName.includes(searchLower);
                item.style.display = (matchesType && matchesSearch) ? '' : 'none';
            });

            sections.forEach(function(section) {
                var visibleItems = section.querySelectorAll('[data-token-name]:not([style*="display: none"])');
                section.style.display = visibleItems.length > 0 ? '' : 'none';
            });
        }

        filterBtns.forEach(function(btn) {
            if (btn._tokensInitialized) return;
            btn._tokensInitialized = true;
            btn.addEventListener('click', function() {
                filterBtns.forEach(function(b) {
                    b.classList.remove('bg-gray-900', 'text-white');
                    b.classList.add('bg-white');
                });
                btn.classList.remove('bg-white');
                btn.classList.add('bg-gray-900', 'text-white');
                var filter = btn.dataset.filter;
                filterTokens(filter, searchBox ? searchBox.value : '');
            });
        });

        if (searchBox && !searchBox._tokensInitialized) {
            searchBox._tokensInitialized = true;
            searchBox.addEventListener('input', function() {
                var activeFilter = document.querySelector('.filter-btn.bg-gray-900');
                var filter = activeFilter ? activeFilter.dataset.filter : 'all';
                filterTokens(filter, this.value);
            });
        }

        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
    }

    // Shared sidebar collapse functionality for component groups
    function initSidebarCollapse() {
        var toggles = document.querySelectorAll('.sidebar-group-toggle');
        var storageKey = 'stylescribe-collapsed-groups';
        var collapsedGroups = [];

        try {
            collapsedGroups = JSON.parse(localStorage.getItem(storageKey)) || [];
        } catch (e) {}

        toggles.forEach(function(toggle) {
            if (toggle._sidebarInitialized) return;
            toggle._sidebarInitialized = true;

            var groupName = toggle.dataset.group;
            var content = toggle.nextElementSibling;
            var chevron = toggle.querySelector('.sidebar-chevron');

            if (collapsedGroups.includes(groupName)) {
                content.style.display = 'none';
                if (chevron) chevron.style.transform = 'rotate(-90deg)';
            }

            toggle.addEventListener('click', function() {
                var isCollapsed = content.style.display === 'none';
                // Enable animation only on click
                if (chevron) chevron.classList.add('animate');
                if (isCollapsed) {
                    content.style.display = '';
                    if (chevron) chevron.style.transform = '';
                    collapsedGroups = collapsedGroups.filter(function(g) { return g !== groupName; });
                } else {
                    content.style.display = 'none';
                    if (chevron) chevron.style.transform = 'rotate(-90deg)';
                    collapsedGroups.push(groupName);
                }
                try {
                    localStorage.setItem(storageKey, JSON.stringify(collapsedGroups));
                } catch (e) {}
            });
        });
    }

    // Nested sidebar folder collapse functionality
    function initNestedSidebarCollapse() {
        var toggles = document.querySelectorAll('.sidebar-folder-toggle');
        var storageKey = 'stylescribe-collapsed-folders';
        var collapsedFolders = [];

        try {
            collapsedFolders = JSON.parse(localStorage.getItem(storageKey)) || [];
        } catch (e) {}

        toggles.forEach(function(toggle) {
            if (toggle._sidebarFolderInitialized) return;
            toggle._sidebarFolderInitialized = true;

            var folderPath = toggle.dataset.folder;
            var folder = toggle.closest('.sidebar-folder');
            var content = folder ? folder.querySelector('.sidebar-folder-content') : null;
            var chevron = toggle.querySelector('.sidebar-chevron');

            if (!content) return;

            // Check if user has manually collapsed this folder
            // (respecting server-side isExpanded for auto-expansion to active page)
            if (collapsedFolders.includes(folderPath)) {
                content.classList.add('collapsed');
                toggle.setAttribute('aria-expanded', 'false');
                if (chevron) chevron.classList.remove('expanded');
            }

            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                var isCollapsed = content.classList.contains('collapsed');

                // Enable animation only on click
                if (chevron) chevron.classList.add('animate');

                if (isCollapsed) {
                    content.classList.remove('collapsed');
                    toggle.setAttribute('aria-expanded', 'true');
                    if (chevron) chevron.classList.add('expanded');
                    collapsedFolders = collapsedFolders.filter(function(p) { return p !== folderPath; });
                } else {
                    content.classList.add('collapsed');
                    toggle.setAttribute('aria-expanded', 'false');
                    if (chevron) chevron.classList.remove('expanded');
                    collapsedFolders.push(folderPath);
                }

                try {
                    localStorage.setItem(storageKey, JSON.stringify(collapsedFolders));
                } catch (e) {}
            });
        });
    }

    // Register all handlers with init system
    if (window.stylescribeInit) {
        window.stylescribeInit.register('components-index', initComponentsIndexPage);
        window.stylescribeInit.register('blocks-index', initBlocksIndexPage);
        window.stylescribeInit.register('pages-index', initPagesIndexPage);
        window.stylescribeInit.register('tokens-wide', initTokensWidePage);
    }

    // Expose for direct calls
    window.stylescribePageInit = {
        componentsIndex: initComponentsIndexPage,
        blocksIndex: initBlocksIndexPage,
        pagesIndex: initPagesIndexPage,
        tokensWide: initTokensWidePage,
        sidebarCollapse: initSidebarCollapse,
        nestedSidebarCollapse: initNestedSidebarCollapse
    };

    // Initialize nested sidebar collapse on page load (for docs pages)
    initNestedSidebarCollapse();
})();
