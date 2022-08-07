// Package imports
import path from "path";
// Local imports
import { MoonpieCommands } from "./commands";
import { OsuCommands } from "./commands";
import { SpotifyCommands } from "./commands";
// Type imports
import type { CliEnvVariableInformation } from "../cli";

/**
 * Environment variable handling.
 */

/**
 * Environment variable prefix.
 */
export const ENV_VARIABLE_PREFIX = "MOONPIE_CONFIG_";

/**
 * Environment variable values for ON/OFF.
 */
export enum EnvVariableOnOff {
  ON = "ON",
  OFF = "OFF",
}

/**
 * Environment variable values for other list elements.
 */
export enum EnvVariableNone {
  NONE = "none",
}

/**
 * Environment variables.
 */
export enum EnvVariable {
  LOGGING_CONSOLE_LOG_LEVEL = "LOGGING_CONSOLE_LOG_LEVEL",
  LOGGING_DIRECTORY_PATH = "LOGGING_DIRECTORY_PATH",
  LOGGING_FILE_LOG_LEVEL = "LOGGING_FILE_LOG_LEVEL",
  TWITCH_CHANNELS = "TWITCH_CHANNELS",
  TWITCH_NAME = "TWITCH_NAME",
  TWITCH_OAUTH_TOKEN = "TWITCH_OAUTH_TOKEN",
  /** Disable/Enable !moonpie commands. */
  MOONPIE_ENABLE_COMMANDS = "MOONPIE_ENABLE_COMMANDS",
  /** The path to the moonpie database. */
  MOONPIE_DATABASE_PATH = "MOONPIE_DATABASE_PATH",
  /** The amount of hours between which no moonpie can be claimed. */
  MOONPIE_CLAIM_COOLDOWN_HOURS = "MOONPIE_CLAIM_COOLDOWN_HOURS",
  OSU_API_CLIENT_ID = "OSU_API_CLIENT_ID",
  OSU_API_CLIENT_SECRET = "OSU_API_CLIENT_SECRET",
  OSU_API_DEFAULT_ID = "OSU_API_DEFAULT_ID",
  OSU_API_RECOGNIZE_MAP_REQUESTS = "OSU_API_RECOGNIZE_MAP_REQUESTS",
  OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED = "OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED",
  OSU_ENABLE_COMMANDS = "OSU_ENABLE_COMMANDS",
  OSU_IRC_PASSWORD = "OSU_IRC_PASSWORD",
  OSU_IRC_REQUEST_TARGET = "OSU_IRC_REQUEST_TARGET",
  OSU_IRC_USERNAME = "OSU_IRC_USERNAME",
  OSU_STREAM_COMPANION_URL = "OSU_STREAM_COMPANION_URL",
  SPOTIFY_API_CLIENT_ID = "SPOTIFY_API_CLIENT_ID",
  SPOTIFY_API_CLIENT_SECRET = "SPOTIFY_API_CLIENT_SECRET",
  SPOTIFY_API_REFRESH_TOKEN = "SPOTIFY_API_REFRESH_TOKEN",
  SPOTIFY_ENABLE_COMMANDS = "SPOTIFY_ENABLE_COMMANDS",
  TWITCH_API_ACCESS_TOKEN = "TWITCH_API_ACCESS_TOKEN",
  TWITCH_API_CLIENT_ID = "TWITCH_API_CLIENT_ID",
}

/**
 * Environment variables are grouped in blocks.
 * The order is important.
 */
export enum EnvVariableBlock {
  LOGGING = "LOGGING",
  TWITCH = "TWITCH",
  MOONPIE = "MOONPIE",
  OSU = "OSU",
  OSU_API = "OSU_API",
  OSU_IRC = "OSU_IRC",
  OSU_STREAM_COMPANION = "OSU_STREAM_COMPANION",
  SPOTIFY = "SPOTIFY",
  SPOTIFY_API = "SPOTIFY_API",
  TWITCH_API = "TWITCH_API",
}

export const ENABLE_COMMANDS_DEFAULT_DESCRIPTION = `You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to '${EnvVariableNone.NONE}' if no commands should be enabled).`;

export interface EnvVariableData
  extends CliEnvVariableInformation<EnvVariable> {
  /** The ENV variable block. */
  block: EnvVariableBlock;
  /** Legacy names of ENV variable. */
  legacyNames?: string[];
  /** The default value for example to display relative paths in 'default' but use absolute path as 'defaultValue'. */
  defaultValue?: string | ((configDir: string) => string);
  /** Is necessary to run the program. */
  necessary?: boolean;
  /** Censor variable per default to prevent leaks. */
  censor?: boolean;
}

/**
 * ENV variable information.
 */
export const envVariableInformation: EnvVariableData[] = [
  {
    name: EnvVariable.LOGGING_CONSOLE_LOG_LEVEL,
    default: "info",
    description:
      "The log level of the log messages that are printed to the console.",
    supportedValues: ["error", "warn", "debug", "info"],
    block: EnvVariableBlock.LOGGING,
  },
  {
    name: EnvVariable.LOGGING_DIRECTORY_PATH,
    default: (configDir) =>
      path.relative(configDir, path.join(configDir, "logs")),
    defaultValue: (configDir) => path.resolve(configDir, "logs"),
    description: "The directory file path of the log files",
    block: EnvVariableBlock.LOGGING,
    legacyNames: ["DIR_LOGS"],
  },
  {
    name: EnvVariable.LOGGING_FILE_LOG_LEVEL,
    default: "debug",
    description:
      "The log level of the log messages that are written to the log files.",
    supportedValues: ["error", "warn", "debug", "info"],
    block: EnvVariableBlock.LOGGING,
    legacyNames: ["FILE_LOG_LEVEL"],
  },
  {
    name: EnvVariable.TWITCH_CHANNELS,
    example: "twitch_channel_name1 twitch_channel_name2",
    description:
      "A with a space separated list of all the channels the bot should be active.",
    block: EnvVariableBlock.TWITCH,
    necessary: true,
    legacyNames: ["TWITCH_CHANNEL"],
  },
  {
    name: EnvVariable.TWITCH_NAME,
    example: "twitch_channel_name",
    description: "The name of the twitch account that should be imitated.",
    block: EnvVariableBlock.TWITCH,
    necessary: true,
  },
  {
    name: EnvVariable.TWITCH_OAUTH_TOKEN,
    example: "oauth:abcdefghijklmnop",
    description:
      "A Twitch OAuth token (get it from: https://twitchapps.com/tmi/).",
    block: EnvVariableBlock.TWITCH,
    necessary: true,
    censor: true,
  },
  {
    name: EnvVariable.MOONPIE_ENABLE_COMMANDS,
    default: Object.values(MoonpieCommands).sort().join(","),
    supportedValues: [...Object.values(MoonpieCommands), EnvVariableNone.NONE],
    description: ENABLE_COMMANDS_DEFAULT_DESCRIPTION,
    block: EnvVariableBlock.MOONPIE,
    legacyNames: ["ENABLE_COMMANDS"],
  },
  {
    name: EnvVariable.MOONPIE_DATABASE_PATH,
    default: (configDir) =>
      path.relative(configDir, path.join(configDir, "moonpie.db")),
    defaultValue: (configDir) =>
      path.resolve(path.join(configDir, "moonpie.db")),
    description:
      "The database file path that contains the persistent moonpie data.",
    block: EnvVariableBlock.MOONPIE,
    legacyNames: ["DB_FILEPATH"],
  },
  {
    name: EnvVariable.MOONPIE_CLAIM_COOLDOWN_HOURS,
    default: "18",
    description:
      "The number of hours for which a user is unable to claim a Moonpie after claiming one (less than 24 in case of daily streams).",
    block: EnvVariableBlock.MOONPIE,
    legacyNames: ["MOONPIE_COOLDOWN_HOURS"],
  },
  {
    name: EnvVariable.OSU_ENABLE_COMMANDS,
    default: Object.values(OsuCommands).sort().join(","),
    supportedValues: [...Object.values(OsuCommands), EnvVariableNone.NONE],
    description: `${ENABLE_COMMANDS_DEFAULT_DESCRIPTION} If you don't provide osu! API credentials and/or a StreamCompanion connection commands that need that won't be enabled!`,
    block: EnvVariableBlock.OSU,
  },
  {
    name: EnvVariable.OSU_API_CLIENT_ID,
    example: "1234",
    description:
      "The osu! client ID (and client secret) to use the osu! api v2. To get it go to your account settings, Click 'New OAuth application' and add a custom name and URL (https://osu.ppy.sh/home/account/edit#oauth). After doing that you can copy the client ID (and client secret).",
    block: EnvVariableBlock.OSU_API,
    censor: true,
    legacyNames: ["OSU_CLIENT_ID"],
  },
  {
    name: EnvVariable.OSU_API_CLIENT_SECRET,
    example: "dadasfsafsafdsadffasfsafasfa",
    description: `Check the description of ${ENV_VARIABLE_PREFIX}${EnvVariable.OSU_API_CLIENT_ID}.`,
    block: EnvVariableBlock.OSU_API,
    censor: true,
    legacyNames: ["OSU_CLIENT_SECRET"],
  },
  {
    name: EnvVariable.OSU_API_DEFAULT_ID,
    example: "1185432",
    description:
      "The default osu! account ID used to check for recent play or a top play on a map.",
    block: EnvVariableBlock.OSU_API,
    legacyNames: ["OSU_DEFAULT_ID"],
  },
  {
    name: EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS,
    default: EnvVariableOnOff.OFF,
    supportedValues: Object.values(EnvVariableOnOff),
    description:
      "Automatically recognize osu! beatmap links (=requests) in chat.",
    block: EnvVariableBlock.OSU_API,
    legacyNames: ["OSU_RECOGNIZE_MAP_REQUESTS"],
  },
  {
    name: EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED,
    default: EnvVariableOnOff.OFF,
    supportedValues: Object.values(EnvVariableOnOff),
    description: `If recognizing is enabled (${ENV_VARIABLE_PREFIX}${EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS}=ON) additionally output more detailed information about the map in the chat.`,
    block: EnvVariableBlock.OSU_API,
    legacyNames: ["OSU_RECOGNIZE_MAP_REQUESTS_DETAILED"],
  },
  {
    name: EnvVariable.OSU_IRC_PASSWORD,
    example: "senderServerPassword",
    supportedValues: Object.values(EnvVariableOnOff),
    description:
      "The osu! irc server password and senderUserName. To get them go to https://osu.ppy.sh/p/irc and login (in case that clicking the 'Begin Email Verification' button does not reveal a text input refresh the page and click the button again -> this also means you get a new code!)",
    block: EnvVariableBlock.OSU_IRC,
    censor: true,
  },
  {
    name: EnvVariable.OSU_IRC_USERNAME,
    example: "senderUserName",
    supportedValues: Object.values(EnvVariableOnOff),
    description: `Check the description of ${ENV_VARIABLE_PREFIX}${EnvVariable.OSU_IRC_PASSWORD}.`,
    block: EnvVariableBlock.OSU_IRC,
  },
  {
    name: EnvVariable.OSU_IRC_REQUEST_TARGET,
    example: "receiverUserName",
    description:
      "The osu! account name that should receive the requests (can be the same account as the sender!).",
    block: EnvVariableBlock.OSU_IRC,
  },
  {
    name: EnvVariable.OSU_STREAM_COMPANION_URL,
    example: "localhost:20727",
    description:
      "osu! StreamCompanion URL to use a running StreamCompanion instance (https://github.com/Piotrekol/StreamCompanion) to always get the currently being played beatmap and used mods.",
    block: EnvVariableBlock.OSU_STREAM_COMPANION,
  },
  {
    name: EnvVariable.SPOTIFY_ENABLE_COMMANDS,
    default: Object.values(SpotifyCommands).sort().join(","),
    supportedValues: [...Object.values(SpotifyCommands), EnvVariableNone.NONE],
    description: `${ENABLE_COMMANDS_DEFAULT_DESCRIPTION} If you don't provide Spotify API credentials the commands won't be enabled!`,
    block: EnvVariableBlock.SPOTIFY,
  },
  {
    name: EnvVariable.SPOTIFY_API_CLIENT_ID,
    example: "abcdefghijklmnop",
    description:
      "Provide client id/secret to enable Twitch api calls in commands (get them by using https://developer.spotify.com/dashboard/applications and creating an application).",
    block: EnvVariableBlock.SPOTIFY_API,
    censor: true,
  },
  {
    name: EnvVariable.SPOTIFY_API_CLIENT_SECRET,
    example: "abcdefghijklmnop",
    description: `Check the description of ${ENV_VARIABLE_PREFIX}${EnvVariable.SPOTIFY_API_CLIENT_ID}.`,
    block: EnvVariableBlock.SPOTIFY_API,
    censor: true,
  },
  {
    name: EnvVariable.SPOTIFY_API_REFRESH_TOKEN,
    example: "abcdefghijklmnop",
    description: `You can get this token by authenticating once successfully using the ${ENV_VARIABLE_PREFIX}${EnvVariable.SPOTIFY_API_CLIENT_ID} and ${ENV_VARIABLE_PREFIX}${EnvVariable.SPOTIFY_API_CLIENT_SECRET}. After the successful authentication via a website that will open you can copy the refresh token from there.`,
    block: EnvVariableBlock.SPOTIFY_API,
    censor: true,
  },
  {
    name: EnvVariable.TWITCH_API_ACCESS_TOKEN,
    example: "abcdefghijklmnop",
    description:
      "Provide client id/access token to enable Twitch api calls in commands (get them by using https://twitchtokengenerator.com with the scopes you want to have). The recommended scopes are: `user:edit:broadcast` to edit stream title/game, `user:read:broadcast`, `chat:read`, `chat:edit`.",
    block: EnvVariableBlock.TWITCH_API,
    censor: true,
  },
  {
    name: EnvVariable.TWITCH_API_CLIENT_ID,
    example: "abcdefghijklmnop",
    description: `Check the description of ${ENV_VARIABLE_PREFIX}${EnvVariable.TWITCH_API_ACCESS_TOKEN}.`,

    block: EnvVariableBlock.TWITCH_API,
    censor: true,
  },
];

export interface EnvVariableStructureTextBlock {
  name: string;
  content: string;
}
export interface EnvVariableStructureVariablesBlock {
  block: EnvVariableBlock;
  name: string;
  description: string;
}

export const envVariableStructure: (
  | EnvVariableStructureTextBlock
  | EnvVariableStructureVariablesBlock
)[] = [
  {
    name: "File description",
    content:
      "This is an example config file for the MoonpieBot that contains all environment variables that the bot uses.",
  },
  {
    name: "File purpose",
    content:
      "You can either set the variables yourself or copy this file, rename it from `.env.example` to `.env` and edit it with your own values since this is just an example to show how it should look.",
  },
  {
    name: "How to edit file",
    content: `If a line that starts with '${ENV_VARIABLE_PREFIX}' has the symbol '#' in front of it that means it will be ignored as a comment. This means you can add custom comments and easily enable/disable any '${ENV_VARIABLE_PREFIX}' option by adding or removing that symbol.`,
  },
  {
    block: EnvVariableBlock.LOGGING,
    name: "LOGGING",
    description: "Customize how much and where should be logged.",
  },
  {
    block: EnvVariableBlock.TWITCH,
    name: "TWITCH",
    description:
      "Necessary variables that need to be set for ANY configuration to connect to Twitch chat.",
  },
  {
    block: EnvVariableBlock.MOONPIE,
    name: "MOONPIE",
    description:
      "Customize the moonpie functionality that is enabled per default.",
  },
  {
    block: EnvVariableBlock.OSU,
    name: "OSU",
    description: "Optional osu! commands that can be enabled.",
  },
  {
    block: EnvVariableBlock.OSU_API,
    name: "OSU API",
    description:
      "Optional osu! API connection that can be enabled to use more osu! commands or detect beatmap requests.",
  },
  {
    block: EnvVariableBlock.OSU_STREAM_COMPANION,
    name: "OSU STREAM COMPANION",
    description:
      "Optional osu! StreamCompanion connection that can be enabled for a much better !np command.",
  },
  {
    block: EnvVariableBlock.SPOTIFY,
    name: "SPOTIFY",
    description: "Optional Spotify commands that can be enabled.",
  },
  {
    block: EnvVariableBlock.SPOTIFY_API,
    name: "SPOTIFY API",
    description:
      "Optional Spotify API connection that can be enabled to use Spotify commands.",
  },
  {
    block: EnvVariableBlock.TWITCH_API,
    name: "Twitch API",
    description:
      "Optional Twitch API connection that can be enabled for advanced custom commands that for example set/get the current game/title.",
  },
];
