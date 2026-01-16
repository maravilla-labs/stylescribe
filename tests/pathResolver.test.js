// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';

describe('pathResolver', () => {
    let originalCwd;

    beforeEach(() => {
        originalCwd = process.cwd();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('resolvePath', () => {
        it('should resolve relative paths', async () => {
            const { resolvePath } = await import('../utils/pathResolver.js');

            const result = resolvePath('./test');
            expect(result).toBe(path.resolve(process.cwd(), './test'));
        });

        it('should handle absolute paths', async () => {
            const { resolvePath } = await import('../utils/pathResolver.js');

            const absolutePath = '/absolute/path';
            const result = resolvePath(absolutePath);
            expect(result).toBe(path.resolve(process.cwd(), absolutePath));
        });
    });
});
