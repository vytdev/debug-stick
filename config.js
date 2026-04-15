/**
 * Configs.
 */

export default {
  /**
   * The folder containing static files needed by the add-on.
   */
  staticSrc: 'BP',

  /**
   * Where to place output .mcpack files.
   */
  distDir: 'dist',

  /**
   * Pack filename format.
   */
  outFileFmt: 'debug-stick.{version}.mcpack',

  /**
   * Pack name.
   */
  packName: 'Debug Stick',

  /**
   * The current version.
   */
  packVersion: '1.16.1-fix.1',

  /**
   * Minimum Minecraft version required.
   */
  minMcVersion: '1.21.80',

  /**
   * Script entry point.
   */
  scriptEntry: 'scripts/index.js',

  /**
   * Pack description.
   */
  packDescription: [
    '§7v{version} ({shCommit}) MCBE {minMcVer}+§r',
    '',
    'Java §dDebug Stick§r ported to Minecraft: Bedrock Edition, by §bvytdev§r',
    'Use §a/give @s vyt:debug_stick§r to get the Debug Stick.',
    '',
    'Report bugs here: §bhttps://github.com/vytdev/debug-stick/§r',
    'Copyright (c) 2023-2026 Vincent Yanzee J. Tan',
    'Licensed under the MIT License.',
  ].join('\n'),

  /**
   * Dependencies.
   */
  dependencies: {
    '@minecraft/server': '1.19.0',
    //'@minecraft/server-ui': '2.0.0',
  }
};
