import config from '../config.js';
import { runtimeConfigTable as subTab } from './gen_config.js';
import { formatString } from './utils.js';


/**
 * These stay constant.
 */
const PACK_UUID = '21aadfa6-e27c-400c-c596-596021852939';
const MODULE_DATA_UUID = 'd8a9ff21-7aa3-4b83-73ed-eeb141516e74';
const MODULE_SCRIPT_UUID = '86c7bab4-aed9-4297-5f0c-d5d62bd30be1';


/**
 * Generate the manifest file from a template.
 * @returns The generated manifest object.
 */
export function genManifest() {
  return {
    format_version: 3,

    header: {
      name:                 formatString(config.packName, subTab),
      description:          formatString(config.packDescription, subTab),
      version:              config.packVersion,
      min_engine_version:   config.minMcVersion,
      uuid:                 PACK_UUID,
    },

    modules: [
      {
        description:        'behaviour',
        type:               'data',
        version:            '1.0.0',
        uuid:               MODULE_DATA_UUID,
      },
      {
        description:        'scripting',
        type:               'script',
        language:           'javascript',
        version:            '1.0.0',
        uuid:               MODULE_SCRIPT_UUID,
        entry:              config.scriptEntry,
      }
    ],

    dependencies: Object.entries(config.dependencies)
        .map(([k, v]) => ({ module_name: k, version: v })),

    metadata: {
      authors:              [ 'VYT' ],
      license:              'MIT',
      url:                  'https://github.com/vytdev/debug-stick',
    },
  }
}


/**
 * Pretty JSON-stringify the given manifest object.
 * @param manifest The manifest object.
 * @returns String.
 */
export function stringifyManifest(manifest) {
  return JSON.stringify(manifest, null, 2);
}
