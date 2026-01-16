#!/usr/bin/env node

// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2019-2026 Maravilla Labs


import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import buildCommand from '../commands/build.js';
import devCommand from '../commands/dev.js';
import createComponentCommand from '../commands/createComponent.js';
import createPageCommand from '../commands/createPage.js';
import docs from '../commands/docs.js';
import tokensCommand from '../commands/tokens.js';
import initCommand from '../commands/init.js';
import addThemeCommand from '../commands/addTheme.js';
import ejectThemeCommand from '../commands/ejectTheme.js';
import mcpCommand from '../commands/mcp.js';
import iconsCommand from '../commands/icons.js';
import screenshotsCommand from '../commands/screenshots.js';
import serveCommand from '../commands/serve.js';

yargs(hideBin(process.argv))
    .command(initCommand)
    .command(buildCommand)
    .command(devCommand)
    .command(docs)
    .command(createComponentCommand)
    .command(createPageCommand)
    .command(tokensCommand)
    .command(addThemeCommand)
    .command(ejectThemeCommand)
    .command(mcpCommand)
    .command(iconsCommand)
    .command(screenshotsCommand)
    .command(serveCommand)
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .argv;
