/**
 * Type definition of the auto-generated config.js file.
 */

/**
 * @interface
 * The default-exported object.
 */
export interface Config {

  /**
   * The add-on's version.
   */
  version: string,

  /**
   * Minecraft `min_engine_version`.
   */
  minMcVer: string,

  /**
   * @minecraft/server version.
   */
  apiVer: string,

  /**
   * @minecraft/server-ui version
   */
  uiApiVer: string,

  /**
   * Which branch this build was from?
   */
  branch: string,

  /**
   * The exact git commit when this build was made.
   */
  commit: string,

  /**
   * Shortened version of commit.
   */
  shCommit: string,
}

declare const config: Config;

/**
 * Auto-generated build config.
 */
export default config;
