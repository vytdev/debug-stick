import config from '../config.js';
import { execSync } from 'child_process';


const run = (cmd) => execSync(cmd).toString().trim();

const currCommit = run('git rev-parse HEAD');
const currBranch = run('git branch --show-current');

/**
 * Stuff that will be used at runtime.
 */
export const runtimeConfigTable = {
  version:      config.packVersion,
  minMcVer:     config.minMcVersion,
  apiVer:       config.dependencies['@minecraft/server'],
  uiApiVer:     config.dependencies['@minecraft/server-ui'],
  branch:       currBranch,
  commit:       currCommit,
  shCommit:     currCommit.slice(0, 7),
};


/**
 * Make a config script for the runtime config.
 * @param cfg The generated runtime config object.
 * @returns The config script.
 */
export function makeConfigScript(cfg) {
  const jsonStr = JSON.stringify(cfg, null, 2);
  return `export default ${jsonStr};`;
}
