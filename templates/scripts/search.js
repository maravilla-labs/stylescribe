// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Stylescribe Global Search
 * Client-side search powered by Lunr.js
 */
(function() {
    let searchIndex = null;
    let documents = null;
    let basePath = './';

    /**
     * Load the pre-built search index
     */
    async function loadSearchIndex() {
        try {
            const response = await fetch(`${basePath}search-index.json`);
            if (!response.ok) {
                throw new Error('Search index not found');
            }
            const data = await response.json();
            searchIndex = lunr.Index.load(data.index);
            documents = data.documents;
        } catch (e) {
            console.warn('Search index not available:', e.message);
        }
    }

    /**
     * Perform a search query
     */
    function search(query) {
        if (!searchIndex || !query.trim()) return [];

        try {
            // Add wildcard for partial matching
            const results = searchIndex.search(query + '*');
            return results.slice(0, 10).map(r => ({
                ...documents[r.ref],
                score: r.score
            }));
        } catch (e) {
            // Try exact match if wildcard fails
            try {
                const results = searchIndex.search(query);
                return results.slice(0, 10).map(r => ({
                    ...documents[r.ref],
                    score: r.score
                }));
            } catch (e2) {
                return [];
            }
        }
    }

    /**
     * Render search results in the dropdown
     */
    function renderResults(results, container, inputValue) {
        if (!results.length) {
            if (inputValue && inputValue.trim()) {
                container.innerHTML = `
                    <div class="search-no-results">
                        No results found for "${inputValue}"
                    </div>
                `;
                container.classList.remove('hidden');
            } else {
                container.classList.add('hidden');
            }
            return;
        }

        const typeIcons = {
            component: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>',
            block: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>',
            fullpage: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>',
            page: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>',
            token: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>'
        };

        const typeLabels = {
            component: 'Component',
            block: 'UI Block',
            fullpage: 'Full Page',
            page: 'Documentation',
            token: 'Token'
        };

        container.innerHTML = results.map((r, index) => {
            // Show screenshot thumbnail for components, blocks, full pages, and docs
            const hasScreenshot = r.screenshot && ['component', 'block', 'fullpage', 'page'].includes(r.type);
            const thumbnailHtml = hasScreenshot
                ? `<div class="search-result-thumbnail">
                       <img src="${basePath}${r.screenshot}" alt="" loading="lazy" onerror="this.parentElement.style.display='none'">
                   </div>`
                : `<span class="search-result-icon text-gray-400">${typeIcons[r.type] || typeIcons.page}</span>`;

            return `
                <a href="${basePath}${r.url}" class="search-result ${hasScreenshot ? 'has-thumbnail' : ''}" data-index="${index}">
                    ${thumbnailHtml}
                    <div class="flex-1 min-w-0">
                        <div class="search-result-title">${highlightMatch(r.title, inputValue)}</div>
                        <div class="search-result-type">${typeLabels[r.type] || r.type}</div>
                    </div>
                </a>
            `;
        }).join('');

        container.classList.remove('hidden');
    }

    /**
     * Highlight matching text in results
     */
    function highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200 text-gray-900">$1</mark>');
    }

    /**
     * Escape special regex characters
     */
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Initialize search functionality
     */
    function initSearch() {
        const searchInput = document.getElementById('globalSearch');
        const resultsContainer = document.getElementById('searchResults');

        if (!searchInput || !resultsContainer) return;

        let selectedIndex = -1;

        // Debounced search on input
        let timeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            selectedIndex = -1;
            timeout = setTimeout(() => {
                const results = search(e.target.value);
                renderResults(results, resultsContainer, e.target.value);
            }, 150);
        });

        // Keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            const results = resultsContainer.querySelectorAll('.search-result');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
                updateSelection(results, selectedIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection(results, selectedIndex);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                results[selectedIndex]?.click();
            } else if (e.key === 'Escape') {
                searchInput.blur();
                resultsContainer.classList.add('hidden');
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                resultsContainer.classList.add('hidden');
            }
        });

        // Show results on focus if there's a value
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim()) {
                const results = search(searchInput.value);
                renderResults(results, resultsContainer, searchInput.value);
            }
        });

        // Keyboard shortcut (Cmd/Ctrl + K)
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
        });
    }

    /**
     * Update keyboard selection highlighting
     */
    function updateSelection(results, index) {
        results.forEach((el, i) => {
            if (i === index) {
                el.classList.add('search-result-selected');
                el.scrollIntoView({ block: 'nearest' });
            } else {
                el.classList.remove('search-result-selected');
            }
        });
    }

    /**
     * Re-initialize search for SPA navigation
     * Index is cached, only event bindings need refresh
     */
    function reinitSearch() {
        // Update basePath from current document
        const bodyBasePath = document.body.dataset.basepath;
        if (bodyBasePath) {
            basePath = bodyBasePath;
        }

        // If index already loaded, just reinit search bindings
        if (searchIndex) {
            initSearch();
        } else {
            // First time - load index then init
            loadSearchIndex().then(initSearch);
        }
    }

    // Expose for SPA navigation re-initialization
    window.stylescribeSearch = {
        init: reinitSearch
    };

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', reinitSearch);
})();
