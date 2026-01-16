// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

/**
 * Theme presets for Stylescribe documentation sites
 * Each preset defines Tailwind CSS classes for various UI sections
 */

/**
 * Deep merge utility for combining theme objects
 * @param {object} target - Base object
 * @param {object} source - Override object
 * @returns {object} Merged object
 */
function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (key === 'preset') continue; // Skip the preset key itself
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
        } else if (source[key] !== undefined) {
            result[key] = source[key];
        }
    }
    return result;
}

/**
 * Available theme presets
 */
export const THEME_PRESETS = {
    // Default purple/indigo theme (current Stylescribe look)
    default: {
        // Page-level styling
        page: {
            background: 'bg-gray-50 dark:bg-slate-900',
            text: 'text-gray-900 dark:text-white'
        },
        // Hero section
        hero: {
            background: 'bg-gradient-to-br from-[#667eea] to-[#764ba2]',
            text: 'text-white',
            badge: 'bg-white/10 text-white backdrop-blur-sm',
            title: 'text-white',
            subtitle: 'text-white/80',
            ctaPrimary: 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl',
            ctaOutline: 'border-2 border-white/80 text-white hover:bg-white hover:text-gray-900'
        },
        // Navigation bar
        nav: {
            background: 'bg-gradient-to-r from-indigo-700/90 to-purple-800/90 dark:from-slate-900/95 dark:via-indigo-950/80 dark:to-purple-950/70',
            text: 'text-white',
            link: 'text-white/80 hover:text-white',
            linkActive: 'text-white',
            searchBg: 'bg-white/10',
            searchText: 'text-white placeholder-white/50',
            border: 'border-b border-white/10'
        },
        // Card components
        card: {
            container: 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700',
            header: 'bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700',
            body: 'bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100',
            title: 'text-gray-900 dark:text-white',
            description: 'text-gray-600 dark:text-gray-400',
            border: 'border-gray-200 dark:border-slate-700',
            hover: 'hover:shadow-lg hover:border-gray-300 dark:hover:border-slate-600'
        },
        // Sidebar navigation
        sidebar: {
            background: 'bg-white dark:bg-slate-800',
            border: 'border-gray-200 dark:border-slate-700',
            heading: 'text-gray-900 dark:text-white font-semibold',
            link: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700',
            linkActive: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
            divider: 'border-gray-200 dark:border-slate-700'
        },
        // Table of contents
        toc: {
            background: 'bg-white dark:bg-slate-800',
            border: 'border-gray-200 dark:border-slate-700',
            link: 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
            linkActive: 'text-indigo-600 dark:text-indigo-400'
        },
        // Buttons
        button: {
            primary: 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl',
            outline: 'border-2 border-white/80 text-white hover:bg-white hover:text-gray-900',
            ghost: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700',
            danger: 'bg-red-500 text-white hover:bg-red-600'
        },
        // Badges
        badge: {
            default: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
            success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
            warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
            danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
            info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
        },
        // Status indicators (component status)
        status: {
            draft: 'bg-yellow-500',
            verified: 'bg-green-500',
            experimental: 'bg-red-500'
        },
        // Links
        link: {
            color: 'text-indigo-600 dark:text-indigo-400',
            hover: 'hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline'
        },
        // Code blocks
        codeBlock: {
            background: 'bg-gray-50 dark:bg-slate-900',
            border: 'border-gray-200 dark:border-slate-700',
            text: 'text-gray-800 dark:text-gray-200'
        },
        // Theme picker
        themePicker: {
            background: 'bg-gray-100 dark:bg-slate-800',
            button: 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700',
            buttonActive: 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm',
            label: 'text-gray-500 dark:text-gray-400'
        },
        // Footer
        footer: {
            background: 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700',
            text: 'text-gray-600 dark:text-gray-400'
        },
        accent: '#667eea'
    },

    // Dracula - Dark purple theme with pink accents
    dracula: {
        page: {
            background: 'bg-[#282a36]',
            text: 'text-[#f8f8f2]'
        },
        hero: {
            background: 'bg-[#282a36]',
            text: 'text-[#f8f8f2]',
            badge: 'bg-[#44475a] text-[#bd93f9]',
            title: 'text-[#f8f8f2]',
            subtitle: 'text-[#6272a4]',
            ctaPrimary: 'bg-[#bd93f9] text-[#282a36] hover:bg-[#ff79c6] shadow-lg',
            ctaOutline: 'border-2 border-[#bd93f9] text-[#bd93f9] hover:bg-[#bd93f9] hover:text-[#282a36]'
        },
        nav: {
            background: 'bg-[#282a36]',
            text: 'text-[#f8f8f2]',
            link: 'text-[#f8f8f2]/80 hover:text-[#bd93f9]',
            linkActive: 'text-[#bd93f9]',
            searchBg: 'bg-[#44475a]',
            searchText: 'text-[#f8f8f2] placeholder-[#6272a4]',
            border: 'border-[#44475a]'
        },
        card: {
            container: 'bg-[#282a36] border-[#44475a]',
            header: 'bg-[#44475a] text-[#f8f8f2]',
            body: 'bg-[#282a36] text-[#f8f8f2]',
            title: 'text-[#f8f8f2]',
            description: 'text-[#6272a4]',
            border: 'border-[#44475a]',
            hover: 'hover:border-[#6272a4]'
        },
        sidebar: {
            background: 'bg-[#282a36]',
            border: 'border-[#44475a]',
            heading: 'text-[#f8f8f2] font-semibold',
            link: 'text-[#6272a4] hover:text-[#f8f8f2] hover:bg-[#44475a]',
            linkActive: 'text-[#bd93f9] bg-[#44475a]',
            divider: 'border-[#44475a]'
        },
        toc: {
            background: 'bg-[#282a36]',
            border: 'border-[#44475a]',
            link: 'text-[#6272a4] hover:text-[#f8f8f2]',
            linkActive: 'text-[#bd93f9]'
        },
        button: {
            primary: 'bg-[#bd93f9] text-[#282a36] hover:bg-[#ff79c6] shadow-lg',
            outline: 'border-2 border-[#bd93f9] text-[#bd93f9] hover:bg-[#bd93f9] hover:text-[#282a36]',
            ghost: 'text-[#6272a4] hover:text-[#f8f8f2] hover:bg-[#44475a]',
            danger: 'bg-[#ff5555] text-white hover:bg-[#ff6e6e]'
        },
        badge: {
            default: 'bg-[#44475a] text-[#bd93f9]',
            success: 'bg-[#44475a] text-[#50fa7b]',
            warning: 'bg-[#44475a] text-[#f1fa8c]',
            danger: 'bg-[#44475a] text-[#ff5555]',
            info: 'bg-[#44475a] text-[#8be9fd]'
        },
        status: {
            draft: 'bg-[#f1fa8c]',
            verified: 'bg-[#50fa7b]',
            experimental: 'bg-[#ff5555]'
        },
        link: {
            color: 'text-[#bd93f9]',
            hover: 'hover:text-[#ff79c6] hover:underline'
        },
        codeBlock: {
            background: 'bg-[#21222c]',
            border: 'border-[#44475a]',
            text: 'text-[#f8f8f2]'
        },
        themePicker: {
            background: 'bg-[#44475a]',
            button: 'text-[#6272a4] hover:bg-[#6272a4]/30',
            buttonActive: 'bg-[#6272a4] text-[#f8f8f2] shadow-sm',
            label: 'text-[#6272a4]'
        },
        footer: {
            background: 'bg-[#21222c] border-[#44475a]',
            text: 'text-[#6272a4]'
        },
        accent: '#bd93f9'
    },

    // Nord - Arctic, bluish color palette
    nord: {
        page: {
            background: 'bg-[#2e3440]',
            text: 'text-[#eceff4]'
        },
        hero: {
            background: 'bg-gradient-to-br from-[#2e3440] to-[#3b4252]',
            text: 'text-[#eceff4]',
            badge: 'bg-[#434c5e] text-[#88c0d0]',
            title: 'text-[#eceff4]',
            subtitle: 'text-[#d8dee9]/80',
            ctaPrimary: 'bg-[#88c0d0] text-[#2e3440] hover:bg-[#8fbcbb] shadow-lg',
            ctaOutline: 'border-2 border-[#88c0d0] text-[#88c0d0] hover:bg-[#88c0d0] hover:text-[#2e3440]'
        },
        nav: {
            background: 'bg-[#2e3440]',
            text: 'text-[#eceff4]',
            link: 'text-[#d8dee9]/80 hover:text-[#88c0d0]',
            linkActive: 'text-[#88c0d0]',
            searchBg: 'bg-[#3b4252]',
            searchText: 'text-[#eceff4] placeholder-[#4c566a]',
            border: 'border-[#3b4252]'
        },
        card: {
            container: 'bg-[#3b4252] border-[#434c5e]',
            header: 'bg-gradient-to-r from-[#5e81ac] to-[#81a1c1] text-[#eceff4]',
            body: 'bg-[#3b4252] text-[#eceff4]',
            title: 'text-[#eceff4]',
            description: 'text-[#d8dee9]/70',
            border: 'border-[#434c5e]',
            hover: 'hover:border-[#4c566a]'
        },
        sidebar: {
            background: 'bg-[#2e3440]',
            border: 'border-[#3b4252]',
            heading: 'text-[#eceff4] font-semibold',
            link: 'text-[#d8dee9]/70 hover:text-[#eceff4] hover:bg-[#3b4252]',
            linkActive: 'text-[#88c0d0] bg-[#3b4252]',
            divider: 'border-[#3b4252]'
        },
        toc: {
            background: 'bg-[#2e3440]',
            border: 'border-[#3b4252]',
            link: 'text-[#d8dee9]/60 hover:text-[#eceff4]',
            linkActive: 'text-[#88c0d0]'
        },
        button: {
            primary: 'bg-[#88c0d0] text-[#2e3440] hover:bg-[#8fbcbb] shadow-lg',
            outline: 'border-2 border-[#88c0d0] text-[#88c0d0] hover:bg-[#88c0d0] hover:text-[#2e3440]',
            ghost: 'text-[#d8dee9]/70 hover:text-[#eceff4] hover:bg-[#3b4252]',
            danger: 'bg-[#bf616a] text-white hover:bg-[#d08770]'
        },
        badge: {
            default: 'bg-[#434c5e] text-[#88c0d0]',
            success: 'bg-[#434c5e] text-[#a3be8c]',
            warning: 'bg-[#434c5e] text-[#ebcb8b]',
            danger: 'bg-[#434c5e] text-[#bf616a]',
            info: 'bg-[#434c5e] text-[#81a1c1]'
        },
        status: {
            draft: 'bg-[#ebcb8b]',
            verified: 'bg-[#a3be8c]',
            experimental: 'bg-[#bf616a]'
        },
        link: {
            color: 'text-[#88c0d0]',
            hover: 'hover:text-[#8fbcbb] hover:underline'
        },
        codeBlock: {
            background: 'bg-[#2e3440]',
            border: 'border-[#3b4252]',
            text: 'text-[#d8dee9]'
        },
        themePicker: {
            background: 'bg-[#3b4252]',
            button: 'text-[#d8dee9]/70 hover:bg-[#434c5e]',
            buttonActive: 'bg-[#434c5e] text-[#eceff4] shadow-sm',
            label: 'text-[#d8dee9]/60'
        },
        footer: {
            background: 'bg-[#2e3440] border-[#3b4252]',
            text: 'text-[#d8dee9]/60'
        },
        accent: '#88c0d0'
    },

    // One Dark - Atom's default dark theme
    oneDark: {
        page: {
            background: 'bg-[#282c34]',
            text: 'text-[#abb2bf]'
        },
        hero: {
            background: 'bg-[#282c34]',
            text: 'text-[#abb2bf]',
            badge: 'bg-[#3e4451] text-[#61afef]',
            title: 'text-[#e6e6e6]',
            subtitle: 'text-[#abb2bf]/80',
            ctaPrimary: 'bg-[#61afef] text-[#282c34] hover:bg-[#528bff] shadow-lg',
            ctaOutline: 'border-2 border-[#61afef] text-[#61afef] hover:bg-[#61afef] hover:text-[#282c34]'
        },
        nav: {
            background: 'bg-[#21252b]',
            text: 'text-[#abb2bf]',
            link: 'text-[#abb2bf]/80 hover:text-[#61afef]',
            linkActive: 'text-[#61afef]',
            searchBg: 'bg-[#3e4451]',
            searchText: 'text-[#abb2bf] placeholder-[#5c6370]',
            border: 'border-[#181a1f]'
        },
        card: {
            container: 'bg-[#282c34] border-[#3e4451]',
            header: 'bg-gradient-to-r from-[#61afef] to-[#c678dd] text-white',
            body: 'bg-[#282c34] text-[#abb2bf]',
            title: 'text-[#e6e6e6]',
            description: 'text-[#5c6370]',
            border: 'border-[#3e4451]',
            hover: 'hover:border-[#5c6370]'
        },
        sidebar: {
            background: 'bg-[#21252b]',
            border: 'border-[#181a1f]',
            heading: 'text-[#e6e6e6] font-semibold',
            link: 'text-[#5c6370] hover:text-[#abb2bf] hover:bg-[#2c313a]',
            linkActive: 'text-[#61afef] bg-[#2c313a]',
            divider: 'border-[#181a1f]'
        },
        toc: {
            background: 'bg-[#21252b]',
            border: 'border-[#181a1f]',
            link: 'text-[#5c6370] hover:text-[#abb2bf]',
            linkActive: 'text-[#61afef]'
        },
        button: {
            primary: 'bg-[#61afef] text-[#282c34] hover:bg-[#528bff] shadow-lg',
            outline: 'border-2 border-[#61afef] text-[#61afef] hover:bg-[#61afef] hover:text-[#282c34]',
            ghost: 'text-[#5c6370] hover:text-[#abb2bf] hover:bg-[#2c313a]',
            danger: 'bg-[#e06c75] text-white hover:bg-[#be5046]'
        },
        badge: {
            default: 'bg-[#3e4451] text-[#61afef]',
            success: 'bg-[#3e4451] text-[#98c379]',
            warning: 'bg-[#3e4451] text-[#e5c07b]',
            danger: 'bg-[#3e4451] text-[#e06c75]',
            info: 'bg-[#3e4451] text-[#56b6c2]'
        },
        status: {
            draft: 'bg-[#e5c07b]',
            verified: 'bg-[#98c379]',
            experimental: 'bg-[#e06c75]'
        },
        link: {
            color: 'text-[#61afef]',
            hover: 'hover:text-[#528bff] hover:underline'
        },
        codeBlock: {
            background: 'bg-[#21252b]',
            border: 'border-[#181a1f]',
            text: 'text-[#abb2bf]'
        },
        themePicker: {
            background: 'bg-[#3e4451]',
            button: 'text-[#5c6370] hover:bg-[#2c313a]',
            buttonActive: 'bg-[#2c313a] text-[#abb2bf] shadow-sm',
            label: 'text-[#5c6370]'
        },
        footer: {
            background: 'bg-[#21252b] border-[#181a1f]',
            text: 'text-[#5c6370]'
        },
        accent: '#61afef'
    },

    // Solarized Dark - Classic developer theme
    solarized: {
        page: {
            background: 'bg-[#002b36]',
            text: 'text-[#839496]'
        },
        hero: {
            background: 'bg-[#002b36]',
            text: 'text-[#839496]',
            badge: 'bg-[#073642] text-[#268bd2]',
            title: 'text-[#93a1a1]',
            subtitle: 'text-[#657b83]',
            ctaPrimary: 'bg-[#268bd2] text-[#fdf6e3] hover:bg-[#2aa198] shadow-lg',
            ctaOutline: 'border-2 border-[#268bd2] text-[#268bd2] hover:bg-[#268bd2] hover:text-[#fdf6e3]'
        },
        nav: {
            background: 'bg-[#002b36]',
            text: 'text-[#839496]',
            link: 'text-[#657b83] hover:text-[#268bd2]',
            linkActive: 'text-[#268bd2]',
            searchBg: 'bg-[#073642]',
            searchText: 'text-[#839496] placeholder-[#586e75]',
            border: 'border-[#073642]'
        },
        card: {
            container: 'bg-[#073642] border-[#586e75]',
            header: 'bg-gradient-to-r from-[#268bd2] to-[#2aa198] text-[#fdf6e3]',
            body: 'bg-[#073642] text-[#839496]',
            title: 'text-[#93a1a1]',
            description: 'text-[#657b83]',
            border: 'border-[#586e75]',
            hover: 'hover:border-[#839496]'
        },
        sidebar: {
            background: 'bg-[#002b36]',
            border: 'border-[#073642]',
            heading: 'text-[#93a1a1] font-semibold',
            link: 'text-[#586e75] hover:text-[#839496] hover:bg-[#073642]',
            linkActive: 'text-[#268bd2] bg-[#073642]',
            divider: 'border-[#073642]'
        },
        toc: {
            background: 'bg-[#002b36]',
            border: 'border-[#073642]',
            link: 'text-[#586e75] hover:text-[#839496]',
            linkActive: 'text-[#268bd2]'
        },
        button: {
            primary: 'bg-[#268bd2] text-[#fdf6e3] hover:bg-[#2aa198] shadow-lg',
            outline: 'border-2 border-[#268bd2] text-[#268bd2] hover:bg-[#268bd2] hover:text-[#fdf6e3]',
            ghost: 'text-[#586e75] hover:text-[#839496] hover:bg-[#073642]',
            danger: 'bg-[#dc322f] text-white hover:bg-[#cb4b16]'
        },
        badge: {
            default: 'bg-[#073642] text-[#268bd2]',
            success: 'bg-[#073642] text-[#859900]',
            warning: 'bg-[#073642] text-[#b58900]',
            danger: 'bg-[#073642] text-[#dc322f]',
            info: 'bg-[#073642] text-[#2aa198]'
        },
        status: {
            draft: 'bg-[#b58900]',
            verified: 'bg-[#859900]',
            experimental: 'bg-[#dc322f]'
        },
        link: {
            color: 'text-[#268bd2]',
            hover: 'hover:text-[#2aa198] hover:underline'
        },
        codeBlock: {
            background: 'bg-[#073642]',
            border: 'border-[#586e75]',
            text: 'text-[#839496]'
        },
        themePicker: {
            background: 'bg-[#073642]',
            button: 'text-[#586e75] hover:bg-[#002b36]',
            buttonActive: 'bg-[#002b36] text-[#839496] shadow-sm',
            label: 'text-[#586e75]'
        },
        footer: {
            background: 'bg-[#002b36] border-[#073642]',
            text: 'text-[#586e75]'
        },
        accent: '#268bd2'
    },

    // Ocean - Deep blue with teal accents
    ocean: {
        page: {
            background: 'bg-[#0f172a]',
            text: 'text-[#e2e8f0]'
        },
        hero: {
            background: 'bg-gradient-to-br from-[#0f172a] to-[#1e3a5f]',
            text: 'text-white',
            badge: 'bg-white/10 text-[#22d3ee] backdrop-blur-sm',
            title: 'text-white',
            subtitle: 'text-[#94a3b8]',
            ctaPrimary: 'bg-[#06b6d4] text-white hover:bg-[#22d3ee] shadow-lg',
            ctaOutline: 'border-2 border-[#22d3ee] text-[#22d3ee] hover:bg-[#22d3ee] hover:text-[#0f172a]'
        },
        nav: {
            background: 'bg-gradient-to-r from-[#0f172a] to-[#1e3a5f]',
            text: 'text-white',
            link: 'text-white/80 hover:text-[#22d3ee]',
            linkActive: 'text-[#22d3ee]',
            searchBg: 'bg-white/10',
            searchText: 'text-white placeholder-white/50',
            border: 'border-[#1e293b]'
        },
        card: {
            container: 'bg-[#1e293b] border-[#334155]',
            header: 'bg-gradient-to-r from-[#0891b2] to-[#06b6d4] text-white',
            body: 'bg-[#1e293b] text-[#e2e8f0]',
            title: 'text-white',
            description: 'text-[#94a3b8]',
            border: 'border-[#334155]',
            hover: 'hover:border-[#475569]'
        },
        sidebar: {
            background: 'bg-[#0f172a]',
            border: 'border-[#1e293b]',
            heading: 'text-white font-semibold',
            link: 'text-[#64748b] hover:text-white hover:bg-[#1e293b]',
            linkActive: 'text-[#22d3ee] bg-[#1e293b]',
            divider: 'border-[#1e293b]'
        },
        toc: {
            background: 'bg-[#0f172a]',
            border: 'border-[#1e293b]',
            link: 'text-[#64748b] hover:text-white',
            linkActive: 'text-[#22d3ee]'
        },
        button: {
            primary: 'bg-[#06b6d4] text-white hover:bg-[#22d3ee] shadow-lg',
            outline: 'border-2 border-[#22d3ee] text-[#22d3ee] hover:bg-[#22d3ee] hover:text-[#0f172a]',
            ghost: 'text-[#64748b] hover:text-white hover:bg-[#1e293b]',
            danger: 'bg-[#f43f5e] text-white hover:bg-[#e11d48]'
        },
        badge: {
            default: 'bg-[#164e63] text-[#22d3ee]',
            success: 'bg-[#14532d] text-[#4ade80]',
            warning: 'bg-[#713f12] text-[#fbbf24]',
            danger: 'bg-[#7f1d1d] text-[#f87171]',
            info: 'bg-[#1e3a8a] text-[#60a5fa]'
        },
        status: {
            draft: 'bg-[#fbbf24]',
            verified: 'bg-[#4ade80]',
            experimental: 'bg-[#f87171]'
        },
        link: {
            color: 'text-[#22d3ee]',
            hover: 'hover:text-[#67e8f9] hover:underline'
        },
        codeBlock: {
            background: 'bg-[#0f172a]',
            border: 'border-[#1e293b]',
            text: 'text-[#e2e8f0]'
        },
        themePicker: {
            background: 'bg-[#1e293b]',
            button: 'text-[#64748b] hover:bg-[#334155]',
            buttonActive: 'bg-[#334155] text-white shadow-sm',
            label: 'text-[#64748b]'
        },
        footer: {
            background: 'bg-[#0f172a] border-[#1e293b]',
            text: 'text-[#64748b]'
        },
        accent: '#22d3ee'
    }
};

/**
 * Get list of available preset names
 * @returns {string[]} Array of preset names
 */
export function getPresetNames() {
    return Object.keys(THEME_PRESETS);
}

/**
 * Check if a preset exists
 * @param {string} name - Preset name to check
 * @returns {boolean} True if preset exists
 */
export function presetExists(name) {
    return name in THEME_PRESETS;
}

/**
 * Resolve theme configuration to full theme object
 * @param {string|object|undefined} theme - Theme config (preset name or custom object)
 * @returns {object} Resolved theme object with all sections
 */
export function resolveTheme(theme) {
    // No theme specified - use default
    if (!theme) {
        return { ...THEME_PRESETS.default };
    }

    // String preset name
    if (typeof theme === 'string') {
        const preset = THEME_PRESETS[theme];
        if (!preset) {
            console.warn(`Theme preset "${theme}" not found, using default`);
            return { ...THEME_PRESETS.default };
        }
        return { ...preset };
    }

    // Custom theme object - merge with base preset
    if (typeof theme === 'object') {
        const basePresetName = theme.preset || 'default';
        const basePreset = THEME_PRESETS[basePresetName] || THEME_PRESETS.default;
        return deepMerge(basePreset, theme);
    }

    return { ...THEME_PRESETS.default };
}

/**
 * Get theme classes for a specific section
 * @param {string} section - Section name (hero, nav, card, etc.)
 * @param {string|object} theme - Theme config
 * @returns {object} Theme classes for the section
 */
export function getThemeClasses(section, theme) {
    const resolved = resolveTheme(theme);
    return resolved[section] || {};
}

/**
 * Get a specific theme class value
 * @param {string} section - Section name
 * @param {string} key - Class key within section
 * @param {string|object} theme - Theme config
 * @returns {string} The Tailwind class string
 */
export function getThemeClass(section, key, theme) {
    const classes = getThemeClasses(section, theme);
    return classes[key] || '';
}

export default {
    THEME_PRESETS,
    getPresetNames,
    presetExists,
    resolveTheme,
    getThemeClasses,
    getThemeClass
};
