// Package imports
import path from "path";
// Local imports
import { EnvVariable, EnvVariableOnOff } from "./info/env";
import {
  getEnvVariableValueOrDefault,
  getEnvVariableValueOrUndefined,
} from "./env";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getMoonpieConfigFromEnv = (configDir: string) =>
  Object.freeze({
    // Twitch connection
    twitchChannels: getEnvVariableValueOrUndefined(EnvVariable.TWITCH_CHANNELS),
    twitchDebug:
      getEnvVariableValueOrUndefined(EnvVariable.TWITCH_DEBUG) ===
      EnvVariableOnOff.ON,
    twitchName: getEnvVariableValueOrUndefined(EnvVariable.TWITCH_NAME),
    twitchOAuthToken: getEnvVariableValueOrUndefined(
      EnvVariable.TWITCH_OAUTH_TOKEN
    ),
    // Twitch API
    // eslint-disable-next-line sort-keys
    twitchApiAccessToken: getEnvVariableValueOrUndefined(
      EnvVariable.TWITCH_API_ACCESS_TOKEN
    ),
    twitchApiClientId: getEnvVariableValueOrUndefined(
      EnvVariable.TWITCH_API_CLIENT_ID
    ),
    // > Moonpie
    // eslint-disable-next-line sort-keys
    moonpieCooldownHoursString: getEnvVariableValueOrDefault(
      EnvVariable.MOONPIE_CLAIM_COOLDOWN_HOURS,
      configDir
    ),
    moonpieEnableCommands: getEnvVariableValueOrDefault(
      EnvVariable.MOONPIE_ENABLE_COMMANDS,
      configDir
    ).split(","),
    pathDatabaseMoonpie: path.resolve(
      configDir,
      getEnvVariableValueOrDefault(EnvVariable.MOONPIE_DATABASE_PATH, configDir)
    ),
    // > Spotify
    pathDatabaseSpotify: path.resolve(
      configDir,
      getEnvVariableValueOrDefault(EnvVariable.SPOTIFY_DATABASE_PATH, configDir)
    ),
    spotifyEnableCommands: getEnvVariableValueOrDefault(
      EnvVariable.SPOTIFY_ENABLE_COMMANDS,
      configDir
    ).split(","),
    // > Spotify API
    // eslint-disable-next-line sort-keys
    spotifyApiClientId: getEnvVariableValueOrUndefined(
      EnvVariable.SPOTIFY_API_CLIENT_ID
    ),
    spotifyApiClientSecret: getEnvVariableValueOrUndefined(
      EnvVariable.SPOTIFY_API_CLIENT_SECRET
    ),
    spotifyApiRefreshToken: getEnvVariableValueOrUndefined(
      EnvVariable.SPOTIFY_API_REFRESH_TOKEN
    ),
    // > osu! API
    // eslint-disable-next-line sort-keys
    osuApiBeatmapRequests:
      getEnvVariableValueOrDefault(
        EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS,
        configDir
      ) === EnvVariableOnOff.ON,
    osuApiBeatmapRequestsDetailed: getEnvVariableValueOrUndefined(
      EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED
    ),
    osuApiBeatmapRequestsRedeemId: getEnvVariableValueOrUndefined(
      EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_REDEEM_ID
    ),
    osuApiClientId: getEnvVariableValueOrUndefined(
      EnvVariable.OSU_API_CLIENT_ID
    ),
    osuApiClientSecret: getEnvVariableValueOrUndefined(
      EnvVariable.OSU_API_CLIENT_SECRET
    ),
    osuApiDefaultId: getEnvVariableValueOrUndefined(
      EnvVariable.OSU_API_DEFAULT_ID
    ),
    pathDatabaseOsuApi: path.resolve(
      configDir,
      getEnvVariableValueOrDefault(
        EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_DATABASE_PATH,
        configDir
      )
    ),
    // > osu!
    // eslint-disable-next-line sort-keys
    osuEnableCommands: getEnvVariableValueOrDefault(
      EnvVariable.OSU_ENABLE_COMMANDS,
      configDir
    ).split(","),
    // > osu! IRC
    osuIrcPassword: getEnvVariableValueOrUndefined(
      EnvVariable.OSU_IRC_PASSWORD
    ),
    osuIrcRequestTarget: getEnvVariableValueOrUndefined(
      EnvVariable.OSU_IRC_REQUEST_TARGET
    ),
    osuIrcUsername: getEnvVariableValueOrUndefined(
      EnvVariable.OSU_IRC_USERNAME
    ),
    // > osu! StreamCompanion
    osuStreamCompanionDirPath: getEnvVariableValueOrUndefined(
      EnvVariable.OSU_STREAM_COMPANION_DIR_PATH
    ),
    osuStreamCompanionUrl: getEnvVariableValueOrUndefined(
      EnvVariable.OSU_STREAM_COMPANION_URL
    ),
    // > Custom commands and broadcasts
    // eslint-disable-next-line sort-keys
    customCommandsBroadcastsEnableCommands: getEnvVariableValueOrDefault(
      EnvVariable.CUSTOM_COMMANDS_BROADCASTS_ENABLED_COMMANDS,
      configDir
    ).split(","),
    pathDatabaseCustomCommandsBroadcasts: path.resolve(
      configDir,
      getEnvVariableValueOrDefault(
        EnvVariable.CUSTOM_COMMANDS_BROADCASTS_DATABASE_PATH,
        configDir
      )
    ),
    // Lurk
    // eslint-disable-next-line sort-keys
    lurkEnableCommands: getEnvVariableValueOrDefault(
      EnvVariable.LURK_ENABLED_COMMANDS,
      configDir
    ).split(","),
  });
