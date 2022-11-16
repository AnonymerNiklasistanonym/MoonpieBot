// Package imports
import path from "path";
// Local imports
import {
  EnvVariable,
  EnvVariableOnOff,
  EnvVariableOtherListOptions,
} from "./info/env";
import {
  getEnvVariableValueOrDefault,
  getEnvVariableValueOrError,
  getEnvVariableValueOrUndefined,
} from "./env";
import { DeepReadonly } from "./other/types";

export interface MoonpieConfigTwitch {
  channels: string[];
  debug?: boolean;
  name: string;
  oAuthToken: string;
}

export interface MoonpieConfigTwitchApi {
  accessToken?: string;
  clientId?: string;
}

export interface MoonpieConfigUtilChatHandler {
  enableCommands: string[];
}

export interface MoonpieConfigUtilDatabase {
  databasePath: string;
}

export interface MoonpieConfigMoonpie
  extends MoonpieConfigUtilChatHandler,
    MoonpieConfigUtilDatabase {
  claimCooldownHours: number;
}

export interface MoonpieConfigSpotify
  extends MoonpieConfigUtilChatHandler,
    MoonpieConfigUtilDatabase {}

export interface MoonpieConfigSpotifyApi {
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

export interface MoonpieConfigCustomCommandsBroadcasts
  extends MoonpieConfigUtilChatHandler,
    MoonpieConfigUtilDatabase {}

export interface MoonpieConfigOsuApi extends MoonpieConfigUtilDatabase {
  beatmapRequests?: boolean;
  beatmapRequestsDetailed?: boolean;
  beatmapRequestsRedeemId?: string;
  clientId?: number;
  clientSecret?: string;
  defaultId?: number;
}

export interface MoonpieConfigOsuIrc {
  password?: string;
  requestTarget?: string;
  username?: string;
}

export interface MoonpieConfigOsuStreamCompanion {
  dirPath?: string;
  url?: string;
}

export interface MoonpieConfig {
  customCommandsBroadcasts?: MoonpieConfigCustomCommandsBroadcasts;
  lurk?: MoonpieConfigUtilChatHandler;
  moonpie?: MoonpieConfigMoonpie;
  osu?: MoonpieConfigUtilChatHandler;
  osuApi?: MoonpieConfigOsuApi;
  osuIrc?: MoonpieConfigOsuIrc;
  osuStreamCompanion?: MoonpieConfigOsuStreamCompanion;
  spotify?: MoonpieConfigSpotify;
  spotifyApi?: MoonpieConfigSpotifyApi;
  twitch: MoonpieConfigTwitch;
  twitchApi?: MoonpieConfigTwitchApi;
}

/**
 * Convert variable value to a boolean value.
 *
 * @param variableValue Input string.
 * @returns True if ON else false.
 */
export const convertToBoolean = (
  variableValue: string | undefined
): boolean => {
  return variableValue?.toUpperCase() === EnvVariableOnOff.ON;
};

/**
 * Convert variable value to a boolean value if not undefined.
 *
 * @param variableValue Input string.
 * @returns True if ON else false otherwise undefined.
 */
export const convertToBooleanIfNotUndefined = (
  variableValue: string | undefined
): boolean | undefined => {
  if (variableValue === undefined) {
    return undefined;
  }
  return convertToBoolean(variableValue);
};

/**
 * Convert variable value to a string array.
 *
 * @param variableValue Input string.
 * @returns StringArray.
 */
export const convertToStringArray = (variableValue: string): string[] => {
  const tempArray = variableValue
    .split(" ")
    .filter((a) => a.trim().length !== 0);
  if (tempArray.includes(EnvVariableOtherListOptions.NONE)) {
    return [];
  }
  return tempArray;
};

/**
 * Convert number string to integer or throw error if not possible.
 *
 * @param variableValue Input string.
 * @param errorMessage Custom error message.
 * @returns Number value if valid number.
 */
export const convertToInt = (
  variableValue: string,
  errorMessage = "Could not parse environment variable value string to integer"
): number => {
  const possibleInteger = parseInt(variableValue);
  if (Number.isInteger(possibleInteger)) {
    return possibleInteger;
  }
  throw Error(`${errorMessage} ('${variableValue}')`);
};

/**
 * Convert number string to integer or throw error if not possible if the input string not undefined.
 *
 * @param variableValue Input string.
 * @param errorMessage Custom error message.
 * @returns Number value if valid number.
 */
export const convertToIntIfNotUndefined = (
  variableValue: string | undefined,
  errorMessage = "Could not parse environment variable value string to integer"
): number | undefined => {
  if (variableValue === undefined) {
    return undefined;
  }
  return convertToInt(variableValue, errorMessage);
};

export const getMoonpieConfigFromEnv = (
  configDir: string
): DeepReadonly<MoonpieConfig> => ({
  // Twitch connection
  twitch: {
    channels: convertToStringArray(
      getEnvVariableValueOrError(EnvVariable.TWITCH_CHANNELS)
    ),
    debug: convertToBoolean(
      getEnvVariableValueOrUndefined(EnvVariable.TWITCH_DEBUG)
    ),
    name: getEnvVariableValueOrError(EnvVariable.TWITCH_NAME),
    oAuthToken: getEnvVariableValueOrError(EnvVariable.TWITCH_OAUTH_TOKEN),
  },
  // Twitch API
  twitchApi: {
    // eslint-disable-next-line sort-keys
    accessToken: getEnvVariableValueOrUndefined(
      EnvVariable.TWITCH_API_ACCESS_TOKEN
    ),
    clientId: getEnvVariableValueOrUndefined(EnvVariable.TWITCH_API_CLIENT_ID),
  },
  // > Moonpie
  // eslint-disable-next-line sort-keys
  moonpie: {
    claimCooldownHours: convertToInt(
      getEnvVariableValueOrDefault(
        EnvVariable.MOONPIE_CLAIM_COOLDOWN_HOURS,
        configDir
      ),
      "The moonpie claim cooldown hours number string could not be parsed to an integer"
    ),
    databasePath: path.resolve(
      configDir,
      getEnvVariableValueOrDefault(EnvVariable.MOONPIE_DATABASE_PATH, configDir)
    ),
    enableCommands: convertToStringArray(
      getEnvVariableValueOrDefault(
        EnvVariable.MOONPIE_ENABLE_COMMANDS,
        configDir
      )
    ),
  },
  // > Spotify
  spotify: {
    databasePath: path.resolve(
      configDir,
      getEnvVariableValueOrDefault(EnvVariable.SPOTIFY_DATABASE_PATH, configDir)
    ),
    enableCommands: convertToStringArray(
      getEnvVariableValueOrDefault(
        EnvVariable.SPOTIFY_ENABLE_COMMANDS,
        configDir
      )
    ),
  },
  // > Spotify API
  spotifyApi: {
    clientId: getEnvVariableValueOrUndefined(EnvVariable.SPOTIFY_API_CLIENT_ID),
    clientSecret: getEnvVariableValueOrUndefined(
      EnvVariable.SPOTIFY_API_CLIENT_SECRET
    ),
    refreshToken: getEnvVariableValueOrUndefined(
      EnvVariable.SPOTIFY_API_REFRESH_TOKEN
    ),
  },
  // > osu!
  // eslint-disable-next-line sort-keys
  osu: {
    enableCommands: convertToStringArray(
      getEnvVariableValueOrDefault(EnvVariable.OSU_ENABLE_COMMANDS, configDir)
    ),
  },
  // > osu! API
  osuApi: {
    beatmapRequests: convertToBoolean(
      getEnvVariableValueOrDefault(
        EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS,
        configDir
      )
    ),
    beatmapRequestsDetailed: convertToBooleanIfNotUndefined(
      getEnvVariableValueOrUndefined(
        EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED
      )
    ),
    beatmapRequestsRedeemId: getEnvVariableValueOrUndefined(
      EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_REDEEM_ID
    ),
    clientId: convertToIntIfNotUndefined(
      getEnvVariableValueOrUndefined(EnvVariable.OSU_API_CLIENT_ID),
      "The osu! api client ID string could not be parsed to an integer"
    ),
    clientSecret: getEnvVariableValueOrUndefined(
      EnvVariable.OSU_API_CLIENT_SECRET
    ),
    databasePath: path.resolve(
      configDir,
      getEnvVariableValueOrDefault(
        EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_DATABASE_PATH,
        configDir
      )
    ),
    defaultId: convertToIntIfNotUndefined(
      getEnvVariableValueOrUndefined(EnvVariable.OSU_API_DEFAULT_ID)
    ),
  },
  // > osu! IRC
  osuIrc: {
    password: getEnvVariableValueOrUndefined(EnvVariable.OSU_IRC_PASSWORD),
    requestTarget: getEnvVariableValueOrUndefined(
      EnvVariable.OSU_IRC_REQUEST_TARGET
    ),
    username: getEnvVariableValueOrUndefined(EnvVariable.OSU_IRC_USERNAME),
  },
  // > osu! StreamCompanion
  osuStreamCompanion: {
    dirPath: getEnvVariableValueOrUndefined(
      EnvVariable.OSU_STREAM_COMPANION_DIR_PATH
    ),
    url: getEnvVariableValueOrUndefined(EnvVariable.OSU_STREAM_COMPANION_URL),
  },
  // > Custom commands and broadcasts
  // eslint-disable-next-line sort-keys
  customCommandsBroadcasts: {
    databasePath: path.resolve(
      configDir,
      getEnvVariableValueOrDefault(
        EnvVariable.CUSTOM_COMMANDS_BROADCASTS_DATABASE_PATH,
        configDir
      )
    ),
    enableCommands: convertToStringArray(
      getEnvVariableValueOrDefault(
        EnvVariable.CUSTOM_COMMANDS_BROADCASTS_ENABLED_COMMANDS,
        configDir
      )
    ),
  },
  // Lurk
  // eslint-disable-next-line sort-keys
  lurk: {
    enableCommands: convertToStringArray(
      getEnvVariableValueOrDefault(EnvVariable.LURK_ENABLED_COMMANDS, configDir)
    ),
  },
});
