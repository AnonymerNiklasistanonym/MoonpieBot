/**
 * Strings handling.
 */

import { Logger } from "winston";

/**
 * The default values for all strings.
 */
export const defaultStrings = new Map<string, string>([
  [
    "OSU_BEATMAP_REQUEST",
    "$(USER) requested %OSU_BEATMAP:TITLE% '%OSU_BEATMAP:VERSION%' by '%OSU_BEATMAP:ARTIST%'$(SHOW_IF_TRUE=%OSU_SCORE:EXISTS%| - Current top score is)",
  ],
  ["OSU_BEATMAP_REQUEST_IRC", "TODO"],
  [
    "OSU_BEATMAP_REQUEST_NOT_FOUND",
    "$(USER) requested [https://osu.ppy.sh/beatmapsets/%OSU:BEATMAPSET_ID%#osu/%OSU:BEATMAP_ID% %OSU:BEATMAP_TITLE% '%OSU:BEATMAP_VERSION%' by '%OSU:BEATMAP_ARTIST%']",
  ],
]);

export const updateStringsMapWithCustomEnvStrings = (
  strings: Map<string, string> = new Map(defaultStrings),
  logger: Logger
) => {
  for (const [key, _value] of defaultStrings.entries()) {
    const envValue = process.env[`MOONPIE_CUSTOM_STRING_${key}`];
    if (envValue !== undefined && envValue.trim().length > 0) {
      strings.set(key, envValue);
      logger.info({
        message: `Found custom string: ${key}=${envValue}`,
        section: "strings",
      });
    }
  }
  return strings;
};
