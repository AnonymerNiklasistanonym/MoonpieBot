/**
 * Strings handling.
 */

import { Logger } from "winston";

/**
 * The default values for all strings.
 */
export const defaultStrings = new Map<string, string>([
  [
    "MOONPIE_COMMAND_REPLY_ABOUT",
    "@$(USER) %MOONPIEBOT:NAME% %MOONPIEBOT:VERSION% (%MOONPIEBOT:URL%)",
  ],
  [
    "MOONPIE_COMMAND_REPLY_CLAIM",
    "@$(USER) You just claimed a moonpie! You have now %MOONPIE:COUNT% moonpie$(SHOW_IF_BIGGER_THAN=%MOONPIE:COUNT%>1|s) and are rank %MOONPIE:LEADERBOARD_RANK% on the leaderboard!",
  ],
  [
    "MOONPIE_COMMAND_REPLY_CLAIM_ALREADY_CLAIMED",
    "@$(USER) You already claimed a moonpie for today ($(TIME_IN_S_TO_HUMAN_READABLE_STRING=%MOONPIE:TIME_SINCE_CLAIM_IN_S%) ago) and are rank %MOONPIE:LEADERBOARD_RANK% on the leaderboard!",
  ],
  [
    "MOONPIE_COMMAND_REPLY_CLAIM_ALREADY_CLAIMED_STAR",
    "@$(USER) You are the cutest! You have now 6969 moonpies and are rank 1 in my heart! <3",
  ],
  ["MOONPIE_COMMAND_REPLY_LEADERBOARD_PREFIX", "@$(USER) "],
  [
    "MOONPIE_COMMAND_REPLY_LEADERBOARD_ENTRY",
    "%MOONPIE_LEADERBOARD:RANK%. %MOONPIE_LEADERBOARD:NAME% (%MOONPIE_LEADERBOARD:COUNT%)",
  ],
  [
    "OSU_BEATMAP_REQUEST",
    "$(USER) requested %OSU_BEATMAP:TITLE% '%OSU_BEATMAP:VERSION%' by '%OSU_BEATMAP:ARTIST%'$(SHOW_IF_TRUE=%OSU_SCORE:EXISTS%| - Current top score is)",
  ],
  ["OSU_BEATMAP_REQUEST_NOT_FOUND", "TODO"],
  [
    "OSU_BEATMAP_REQUEST_IRC",
    "$(USER) requested [https://osu.ppy.sh/beatmapsets/%OSU_BEATMAP:SET_ID%#osu/%OSU_BEATMAP:ID% %OSU_BEATMAP:TITLE% '%OSU_BEATMAP:VERSION%' by '%OSU_BEATMAP:ARTIST%']",
  ],
  [
    "OSU_NP_COMMAND_REPLY_STREAMCOMPANION",
    "@$(USER) Currently playing '%OSU_STREAMCOMPANION:TITLE%' from '%OSU_STREAMCOMPANION:ARTIST%' ['%OSU_STREAMCOMPANION:VERSION%']",
  ],
]);

export const updateStringsMapWithCustomEnvStrings = (
  strings: Map<string, string> = new Map(defaultStrings),
  logger: Logger
) => {
  let foundCustomStringsCounter = 0;
  for (const [key] of defaultStrings.entries()) {
    const envValue = process.env[`MOONPIE_CUSTOM_STRING_${key}`];
    if (envValue !== undefined && envValue.trim().length > 0) {
      strings.set(key, envValue);
      foundCustomStringsCounter++;
      logger.debug({
        message: `Found custom string: ${key}=${envValue}`,
        section: "strings",
      });
    }
  }
  if (foundCustomStringsCounter > 0) {
    logger.info({
      message: `Found ${foundCustomStringsCounter} custom string${
        foundCustomStringsCounter > 1 ? "s" : ""
      }`,
      section: "strings",
    });
  }
  return strings;
};
