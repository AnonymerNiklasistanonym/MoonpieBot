// Package imports
import path from "path";
// Relative imports
import {
  convertFromBoolean,
  convertFromInteger,
  convertFromStringArray,
  convertToBoolean,
  convertToBooleanIfNotUndefined,
  convertToInt,
  convertToIntIfNotUndefined,
  convertToStringArray,
} from "../../config.mjs";
import {
  CustomCommandsBroadcastsCommands,
  LurkCommands,
  MoonpieCommands,
  OsuCommands,
  SpotifyCommands,
} from "../chatCommands.mjs";
import {
  getEnvVariableValueDefault,
  getEnvVariableValueOrDefault,
  getEnvVariableValueOrError,
  getEnvVariableValueOrUndefined,
} from "../../env.mjs";
import {
  removeOsuApiDetailedRequestsIfFoundInDb,
  removeOsuApiRequestsRedeemIdIfFoundInDb,
} from "./moonpieConfig/checkOsuApiDb.mjs";
import { EnvVariable } from "../env.mjs";
import { removeSpotifyApiRefreshTokenIfFoundInDb } from "./moonpieConfig/checkSpotifyDb.mjs";
// Type imports
import type { GetConfig, GetCustomEnvValueFromConfig } from "../../config.mjs";

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

export interface MoonpieConfigUtilChatHandler<T = string> {
  enableCommands: T[];
}

export interface MoonpieConfigUtilDatabase {
  databasePath: string;
}

export interface MoonpieConfigMoonpie
  extends MoonpieConfigUtilChatHandler<MoonpieCommands>,
    MoonpieConfigUtilDatabase {
  claimCooldownHours: number;
}

export interface MoonpieConfigSpotify
  extends MoonpieConfigUtilChatHandler<SpotifyCommands>,
    MoonpieConfigUtilDatabase {}

export interface MoonpieConfigSpotifyApi {
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

export interface MoonpieConfigCustomCommandsBroadcasts
  extends MoonpieConfigUtilChatHandler<CustomCommandsBroadcastsCommands>,
    MoonpieConfigUtilDatabase {}

export interface MoonpieConfigOsuApi extends MoonpieConfigUtilDatabase {
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
  lurk?: MoonpieConfigUtilChatHandler<LurkCommands>;
  moonpie?: MoonpieConfigMoonpie;
  osu?: MoonpieConfigUtilChatHandler<OsuCommands>;
  osuApi?: MoonpieConfigOsuApi;
  osuIrc?: MoonpieConfigOsuIrc;
  osuStreamCompanion?: MoonpieConfigOsuStreamCompanion;
  spotify?: MoonpieConfigSpotify;
  spotifyApi?: MoonpieConfigSpotifyApi;
  twitch: MoonpieConfigTwitch;
  twitchApi?: MoonpieConfigTwitchApi;
}

export interface MoonpieConfigCustomData {
  /**
   * If this is true remove all attributes that are already stored in databases.
   */
  removeAttributesStoredInDatabases?: boolean;
  /**
   * If this is true update all database file paths to their default file path.
   */
  resetDatabaseFilePaths?: boolean;
}

const getDatabasePath = (
  envVariable: EnvVariable,
  configDir: string,
  customData?: MoonpieConfigCustomData,
): string =>
  path.resolve(
    configDir,
    customData?.resetDatabaseFilePaths === true
      ? getEnvVariableValueDefault(envVariable, configDir)
      : getEnvVariableValueOrDefault(envVariable, configDir),
  );

export const getMoonpieConfigFromEnv: GetConfig<
  MoonpieConfig,
  MoonpieConfigCustomData
> = async (configDir, customData) => {
  return {
    // Twitch connection
    twitch: {
      channels: convertToStringArray(
        getEnvVariableValueOrError(EnvVariable.TWITCH_CHANNELS),
      ),
      debug: convertToBoolean(
        getEnvVariableValueOrUndefined(EnvVariable.TWITCH_DEBUG),
      ),
      name: getEnvVariableValueOrError(EnvVariable.TWITCH_NAME),
      oAuthToken: getEnvVariableValueOrError(EnvVariable.TWITCH_OAUTH_TOKEN),
    },
    // > Twitch API
    twitchApi: {
      // eslint-disable-next-line sort-keys
      accessToken: getEnvVariableValueOrUndefined(
        EnvVariable.TWITCH_API_ACCESS_TOKEN,
      ),
      clientId: getEnvVariableValueOrUndefined(
        EnvVariable.TWITCH_API_CLIENT_ID,
      ),
    },
    // > Moonpie
    // eslint-disable-next-line sort-keys
    moonpie: await getMoonpieConfigMoonpieFromEnv(configDir, customData),
    // > Spotify
    spotify: {
      databasePath: getDatabasePath(
        EnvVariable.SPOTIFY_DATABASE_PATH,
        configDir,
        customData,
      ),
      enableCommands: convertToStringArray(
        getEnvVariableValueOrDefault(
          EnvVariable.SPOTIFY_ENABLE_COMMANDS,
          configDir,
        ),
        Object.values(SpotifyCommands),
      ),
    },
    // > Spotify API
    spotifyApi: {
      clientId: getEnvVariableValueOrUndefined(
        EnvVariable.SPOTIFY_API_CLIENT_ID,
      ),
      clientSecret: getEnvVariableValueOrUndefined(
        EnvVariable.SPOTIFY_API_CLIENT_SECRET,
      ),
      // Remove the refresh token value if it is found in database
      refreshToken:
        customData?.removeAttributesStoredInDatabases === true
          ? await removeSpotifyApiRefreshTokenIfFoundInDb(
              getDatabasePath(
                EnvVariable.SPOTIFY_DATABASE_PATH,
                configDir,
                customData,
              ),
              getEnvVariableValueOrUndefined(
                EnvVariable.SPOTIFY_API_REFRESH_TOKEN,
              ),
            )
          : getEnvVariableValueOrUndefined(
              EnvVariable.SPOTIFY_API_REFRESH_TOKEN,
            ),
    },
    // > osu!
    // eslint-disable-next-line sort-keys
    osu: {
      enableCommands: convertToStringArray(
        getEnvVariableValueOrDefault(
          EnvVariable.OSU_ENABLE_COMMANDS,
          configDir,
        ),
        Object.values(OsuCommands),
      ),
    },
    // > osu! API
    osuApi: {
      beatmapRequestsDetailed:
        customData?.removeAttributesStoredInDatabases === true
          ? await removeOsuApiDetailedRequestsIfFoundInDb(
              getDatabasePath(
                EnvVariable.OSU_API_REQUESTS_CONFIG_DATABASE_PATH,
                configDir,
                customData,
              ),
              convertToBooleanIfNotUndefined(
                getEnvVariableValueOrUndefined(
                  EnvVariable.OSU_API_REQUESTS_DETAILED,
                ),
              ),
            )
          : convertToBooleanIfNotUndefined(
              getEnvVariableValueOrUndefined(
                EnvVariable.OSU_API_REQUESTS_DETAILED,
              ),
            ),
      beatmapRequestsRedeemId:
        customData?.removeAttributesStoredInDatabases === true
          ? await removeOsuApiRequestsRedeemIdIfFoundInDb(
              getDatabasePath(
                EnvVariable.OSU_API_REQUESTS_CONFIG_DATABASE_PATH,
                configDir,
                customData,
              ),
              getEnvVariableValueOrUndefined(
                EnvVariable.OSU_API_REQUESTS_REDEEM_ID,
              ),
            )
          : getEnvVariableValueOrUndefined(
              EnvVariable.OSU_API_REQUESTS_REDEEM_ID,
            ),
      clientId: convertToIntIfNotUndefined(
        getEnvVariableValueOrUndefined(EnvVariable.OSU_API_CLIENT_ID),
        "The osu! api client ID string could not be parsed to an integer",
      ),
      clientSecret: getEnvVariableValueOrUndefined(
        EnvVariable.OSU_API_CLIENT_SECRET,
      ),
      databasePath: getDatabasePath(
        EnvVariable.OSU_API_REQUESTS_CONFIG_DATABASE_PATH,
        configDir,
        customData,
      ),
      defaultId: convertToIntIfNotUndefined(
        getEnvVariableValueOrUndefined(EnvVariable.OSU_API_DEFAULT_ID),
      ),
    },
    // > osu! IRC
    osuIrc: {
      password: getEnvVariableValueOrUndefined(EnvVariable.OSU_IRC_PASSWORD),
      requestTarget: getEnvVariableValueOrUndefined(
        EnvVariable.OSU_IRC_REQUEST_TARGET,
      ),
      username: getEnvVariableValueOrUndefined(EnvVariable.OSU_IRC_USERNAME),
    },
    // > osu! StreamCompanion
    osuStreamCompanion: {
      dirPath: getEnvVariableValueOrUndefined(
        EnvVariable.OSU_STREAM_COMPANION_DIR_PATH,
      ),
      url: getEnvVariableValueOrUndefined(EnvVariable.OSU_STREAM_COMPANION_URL),
    },
    // > Custom commands and broadcasts
    // eslint-disable-next-line sort-keys
    customCommandsBroadcasts: {
      databasePath: getDatabasePath(
        EnvVariable.CUSTOM_COMMANDS_BROADCASTS_DATABASE_PATH,
        configDir,
        customData,
      ),
      enableCommands: convertToStringArray(
        getEnvVariableValueOrDefault(
          EnvVariable.CUSTOM_COMMANDS_BROADCASTS_ENABLE_COMMANDS,
          configDir,
        ),
        Object.values(CustomCommandsBroadcastsCommands),
      ),
    },
    // Lurk
    lurk: {
      enableCommands: convertToStringArray(
        getEnvVariableValueOrDefault(
          EnvVariable.LURK_ENABLE_COMMANDS,
          configDir,
        ),
        Object.values(LurkCommands),
      ),
    },
  };
};

export const getMoonpieConfigMoonpieFromEnv: GetConfig<
  MoonpieConfigMoonpie,
  MoonpieConfigCustomData
> = (configDir, customData) => {
  return {
    claimCooldownHours: convertToInt(
      getEnvVariableValueOrDefault(
        EnvVariable.MOONPIE_CLAIM_COOLDOWN_HOURS,
        configDir,
      ),
      "The moonpie claim cooldown hours number string could not be parsed to an integer",
    ),
    databasePath: getDatabasePath(
      EnvVariable.MOONPIE_DATABASE_PATH,
      configDir,
      customData,
    ),
    enableCommands: convertToStringArray(
      getEnvVariableValueOrDefault(
        EnvVariable.MOONPIE_ENABLE_COMMANDS,
        configDir,
      ),
      Object.values(MoonpieCommands),
    ),
  };
};

export const getCustomEnvValueFromMoonpieConfig: GetCustomEnvValueFromConfig<
  MoonpieConfig
> = (envVariable, config) => {
  // Twitch connection
  if (envVariable === EnvVariable.TWITCH_CHANNELS) {
    return convertFromStringArray(config.twitch.channels);
  }
  if (envVariable === EnvVariable.TWITCH_DEBUG) {
    return convertFromBoolean(config.twitch.debug);
  }
  if (envVariable === EnvVariable.TWITCH_NAME) {
    return config.twitch.name;
  }
  if (envVariable === EnvVariable.TWITCH_OAUTH_TOKEN) {
    return config.twitch.oAuthToken;
  }
  // > Twitch API
  if (envVariable === EnvVariable.TWITCH_API_ACCESS_TOKEN) {
    return config.twitchApi?.accessToken;
  }
  if (envVariable === EnvVariable.TWITCH_API_CLIENT_ID) {
    return config.twitchApi?.clientId;
  }
  // > Moonpie
  if (envVariable === EnvVariable.MOONPIE_CLAIM_COOLDOWN_HOURS) {
    return convertFromInteger(config.moonpie?.claimCooldownHours);
  }
  if (envVariable === EnvVariable.MOONPIE_DATABASE_PATH) {
    return config.moonpie?.databasePath;
  }
  if (envVariable === EnvVariable.MOONPIE_ENABLE_COMMANDS) {
    return convertFromStringArray(config.moonpie?.enableCommands);
  }
  // > Spotify
  if (envVariable === EnvVariable.SPOTIFY_DATABASE_PATH) {
    return config.spotify?.databasePath;
  }
  if (envVariable === EnvVariable.SPOTIFY_ENABLE_COMMANDS) {
    return convertFromStringArray(config.spotify?.enableCommands);
  }
  // > Spotify API
  if (envVariable === EnvVariable.SPOTIFY_API_CLIENT_ID) {
    return config.spotifyApi?.clientId;
  }
  if (envVariable === EnvVariable.SPOTIFY_API_CLIENT_SECRET) {
    return config.spotifyApi?.clientSecret;
  }
  if (envVariable === EnvVariable.SPOTIFY_API_REFRESH_TOKEN) {
    return config.spotifyApi?.refreshToken;
  }
  // > osu!
  if (envVariable === EnvVariable.OSU_ENABLE_COMMANDS) {
    return convertFromStringArray(config.osu?.enableCommands);
  }
  // > osu! API
  if (envVariable === EnvVariable.OSU_API_REQUESTS_DETAILED) {
    return convertFromBoolean(config.osuApi?.beatmapRequestsDetailed);
  }
  if (envVariable === EnvVariable.OSU_API_REQUESTS_REDEEM_ID) {
    return config.osuApi?.beatmapRequestsRedeemId;
  }
  if (envVariable === EnvVariable.OSU_API_CLIENT_ID) {
    return convertFromInteger(config.osuApi?.clientId);
  }
  if (envVariable === EnvVariable.OSU_API_CLIENT_SECRET) {
    return config.osuApi?.clientSecret;
  }
  if (envVariable === EnvVariable.OSU_API_REQUESTS_CONFIG_DATABASE_PATH) {
    return config.osuApi?.databasePath;
  }
  if (envVariable === EnvVariable.OSU_API_DEFAULT_ID) {
    return convertFromInteger(config.osuApi?.defaultId);
  }
  // > osu! IRC
  if (envVariable === EnvVariable.OSU_IRC_PASSWORD) {
    return config.osuIrc?.password;
  }
  if (envVariable === EnvVariable.OSU_IRC_USERNAME) {
    return config.osuIrc?.username;
  }
  if (envVariable === EnvVariable.OSU_IRC_REQUEST_TARGET) {
    return config.osuIrc?.requestTarget;
  }
  // > osu! StreamCompanion
  if (envVariable === EnvVariable.OSU_STREAM_COMPANION_DIR_PATH) {
    return config.osuStreamCompanion?.dirPath;
  }
  if (envVariable === EnvVariable.OSU_STREAM_COMPANION_URL) {
    return config.osuStreamCompanion?.url;
  }
  // > Custom commands and broadcasts
  if (envVariable === EnvVariable.CUSTOM_COMMANDS_BROADCASTS_DATABASE_PATH) {
    return config.customCommandsBroadcasts?.databasePath;
  }
  if (envVariable === EnvVariable.CUSTOM_COMMANDS_BROADCASTS_ENABLE_COMMANDS) {
    return convertFromStringArray(
      config.customCommandsBroadcasts?.enableCommands,
    );
  }
  // > Lurk
  if (envVariable === EnvVariable.LURK_ENABLE_COMMANDS) {
    return convertFromStringArray(config.lurk?.enableCommands);
  }
  return undefined;
};
