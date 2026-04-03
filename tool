#!/usr/bin/env node

import path from 'path';
// We must run from the repo folder.
process.chdir(path.dirname(process.argv[1]));
import('./build/main.js');
