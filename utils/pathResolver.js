// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const resolvePath = (inputPath) => {
    return path.resolve(process.cwd(), inputPath);
};

export const getTemplatePath = (defaultPath) => {
    const cwdTemplatePath = path.join(process.cwd(), '.stylescribe', 'templates', defaultPath);
    if (fs.existsSync(cwdTemplatePath)) {
        return cwdTemplatePath;
    }
    return path.join(__dirname, '..', 'templates', defaultPath);
};
