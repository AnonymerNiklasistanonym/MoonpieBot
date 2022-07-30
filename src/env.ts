import { promises as fs } from "fs";
import * as path from "path";
import { MoonpieCommands } from "./commands/moonpie";
import { OsuCommands } from "./commands/osu";
import { SpotifyCommands } from "./commands/spotify";
import {
  FileDocumentationPartType,
  generateFileDocumentation,
} from "./other/splitTextAtLength";
import type {
  FileDocumentationPartValue,
  FileDocumentationParts,
} from "./other/splitTextAtLength";

/** Path to the root directory of the source code. */
const pathToRootDir = path.join(__dirname, "..");

/**
 * Environment variable handling.
 */

/**
 * Environment variable prefix.
 */
export const envVariablePrefix = "MOONPIE_CONFIG_";

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
// https://developer.spotify.com/dashboard/applications

/**
 * Environment variables are grouped in blocks.
 * The order is important.
 */
export enum EnvVariableBlocks {
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

export const printEnvVariablesToConsole = (censor = true) => {
  for (const envVariable in EnvVariable) {
    // eslint-disable-next-line security/detect-object-injection
    const envVariableName = getEnvVariableName(envVariable);
    const envVariableValue = getEnvVariableValue(envVariable);
    let legacyString = undefined;

    const envVariableInformation = getEnvVariableValueInformation(envVariable);
    let envVariableValueString = "Not found!";
    if (envVariableValue.value !== undefined) {
      envVariableValueString = `"${envVariableValue.value}"`;
      if (censor && envVariableInformation.censor) {
        // Censor secret variables per default
        envVariableValueString = "*******[secret]********";
      }
      if (envVariableValue.value.length === 0) {
        envVariableValueString = "Empty string!";
      }

      // Add note if the value was derived via a legacy variable
      if (envVariableValue.legacy) {
        if (envVariableValue.envVariableName === undefined) {
          throw Error("No ENV variable name found while a value was given");
        }
        const legacyEnvVariableName = getEnvVariableName(
          envVariableValue.envVariableName
        );
        legacyString =
          "THE VALUE WAS DERIVED FROM A DEPRECATED NAME!\n" +
          `Please change the name '${legacyEnvVariableName}'\nto '${envVariableName}'`;
      }
    } else if (envVariableInformation.default !== undefined) {
      envVariableValueString += ` (default="${envVariableInformation.default}")`;
    } else if (envVariableInformation.example !== undefined) {
      envVariableValueString += ` (example="${envVariableInformation.example}")`;
    }

    if (envVariableInformation.necessary) {
      envVariableValueString += " (NECESSARY!)";
    }

    console.log(`${envVariableName}=${envVariableValueString}`);
    if (legacyString !== undefined) {
      const legacyStrings = legacyString.split("\n");
      console.log(`\tWARNING: ${legacyStrings[0]}`);
      for (const legacyStringParts of legacyStrings.slice(1)) {
        console.log(`\t> ${legacyStringParts}`);
      }
    }
  }
};

export interface EnvVariableValue {
  /** Undefined if not found. */
  value: string | undefined;
  /** The name of the ENV variable if a value was found. */
  envVariableName: string | undefined;
  /** True if the variable was derived from a legacy variable name. */
  legacy?: boolean;
}

export const getEnvVariableValue = (
  envVariable: EnvVariable | string
): EnvVariableValue => {
  const value = process.env[getEnvVariableName(envVariable)];
  if (value === undefined) {
    // Check legacy values
    const envVariableInformation = getEnvVariableValueInformation(envVariable);
    if (envVariableInformation.legacyNames !== undefined) {
      for (const legacyName of envVariableInformation.legacyNames) {
        const legacyValue = process.env[getEnvVariableName(legacyName)];
        if (legacyValue !== undefined) {
          return {
            value: legacyValue,
            legacy: true,
            envVariableName: legacyName,
          };
        }
      }
    }
  }
  return { value, envVariableName: envVariable.toString() };
};

export const getEnvVariableValueOrCustomDefault = <T>(
  envVariable: EnvVariable,
  defaultValue: T
): string | T => {
  const envValue = getEnvVariableValue(envVariable);
  if (envValue.value === undefined || envValue.value.trim().length === 0) {
    return defaultValue;
  }
  return envValue.value;
};
export const getEnvVariableValueOrUndefined = (
  envVariable: EnvVariable
): string | undefined => {
  const envValue = getEnvVariableValue(envVariable);
  if (envValue.value === undefined || envValue.value.trim().length === 0) {
    return undefined;
  }
  return envValue.value;
};

export interface EnvVariableValueInformation {
  default?: string;
  defaultValue?: string;
  example?: string;
  description: string;
  supportedValues?: string[];
  block: EnvVariableBlocks;
  necessary?: boolean;
  censor?: boolean;
  /**
   * Legacy names of the variable to be compatible with older configurations.
   */
  legacyNames?: string[];
}

export const EMPTY_OPTION_LIST_VALUE_NONE = "none";

export const ENABLE_COMMANDS_DEFAULT_DESCRIPTION = `You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to '${EMPTY_OPTION_LIST_VALUE_NONE}' if no commands should be enabled).`;

export const getEnvVariableValueInformation = (
  envVariable: EnvVariable | string,
  configDir = pathToRootDir
): EnvVariableValueInformation => {
  switch (envVariable) {
    case EnvVariable.LOGGING_CONSOLE_LOG_LEVEL:
      return {
        default: "info",
        description:
          "The log level of the log messages that are printed to the console.",
        supportedValues: ["error", "warn", "debug", "info"],
        block: EnvVariableBlocks.LOGGING,
      };
    case EnvVariable.LOGGING_DIRECTORY_PATH:
      return {
        default: path.relative(configDir, path.join(configDir, "logs")),
        defaultValue: path.resolve(configDir, "logs"),
        description: "The directory file path of the log files",
        block: EnvVariableBlocks.LOGGING,
        legacyNames: ["DIR_LOGS"],
      };
    case EnvVariable.LOGGING_FILE_LOG_LEVEL:
      return {
        default: "debug",
        description:
          "The log level of the log messages that are written to the log files.",
        supportedValues: ["error", "warn", "debug", "info"],
        block: EnvVariableBlocks.LOGGING,
        legacyNames: ["FILE_LOG_LEVEL"],
      };

    case EnvVariable.TWITCH_CHANNELS:
      return {
        example: "twitch_channel_name another_twitch_channel_name",
        description:
          "A with a space separated list of all the channels the bot should be active.",
        block: EnvVariableBlocks.TWITCH,
        necessary: true,
        legacyNames: ["TWITCH_CHANNEL"],
      };
    case EnvVariable.TWITCH_NAME:
      return {
        example: "twitch_channel_name",
        description: "The name of the twitch account that should be imitated.",
        block: EnvVariableBlocks.TWITCH,
        necessary: true,
      };
    case EnvVariable.TWITCH_OAUTH_TOKEN:
      return {
        example: "oauth:abcdefghijklmnop",
        description:
          "An Twitch OAuth token (get it from: https://twitchapps.com/tmi/).",
        block: EnvVariableBlocks.TWITCH,
        necessary: true,
        censor: true,
      };

    case EnvVariable.MOONPIE_ENABLE_COMMANDS:
      // eslint-disable-next-line no-case-declarations
      const moonpieCommands = [
        MoonpieCommands.ABOUT,
        MoonpieCommands.ADD,
        MoonpieCommands.CLAIM,
        MoonpieCommands.COMMANDS,
        MoonpieCommands.DELETE,
        MoonpieCommands.GET,
        MoonpieCommands.LEADERBOARD,
        MoonpieCommands.REMOVE,
        MoonpieCommands.SET,
      ];
      return {
        default: moonpieCommands.sort().join(","),
        supportedValues: [...moonpieCommands, EMPTY_OPTION_LIST_VALUE_NONE],
        description: ENABLE_COMMANDS_DEFAULT_DESCRIPTION,
        block: EnvVariableBlocks.MOONPIE,
        legacyNames: ["ENABLE_COMMANDS"],
      };
    case EnvVariable.MOONPIE_DATABASE_PATH:
      return {
        default: path.relative(configDir, path.join(configDir, "moonpie.db")),
        defaultValue: path.resolve(path.join(configDir, "moonpie.db")),
        description:
          "The database file path that contains the persistent moonpie data.",
        block: EnvVariableBlocks.MOONPIE,
        legacyNames: ["DB_FILEPATH"],
      };
    case EnvVariable.MOONPIE_CLAIM_COOLDOWN_HOURS:
      return {
        default: "18",
        description:
          "The number of hours for which a user is unable to claim a Moonpie after claiming one (less than 24 in case of daily streams).",
        block: EnvVariableBlocks.MOONPIE,
        legacyNames: ["MOONPIE_COOLDOWN_HOURS"],
      };

    case EnvVariable.OSU_ENABLE_COMMANDS:
      // eslint-disable-next-line no-case-declarations
      const osuCommands = [
        OsuCommands.NP,
        OsuCommands.PP,
        OsuCommands.RP,
        OsuCommands.REQUESTS,
      ];
      return {
        default: osuCommands.sort().join(","),
        supportedValues: [...osuCommands, EMPTY_OPTION_LIST_VALUE_NONE],
        description: `${ENABLE_COMMANDS_DEFAULT_DESCRIPTION} If you don't provide osu! API credentials and/or a StreamCompanion connection commands that need that won't be enabled!`,
        block: EnvVariableBlocks.OSU,
      };

    case EnvVariable.OSU_API_CLIENT_ID:
      return {
        example: "1234",
        description:
          "The osu! client ID (and client secret) to use the osu! api v2. To get it go to your account settings, Click 'New OAuth application' and add a custom name and URL (https://osu.ppy.sh/home/account/edit#oauth). After doing that you can copy the client ID (and client secret).",
        block: EnvVariableBlocks.OSU_API,
        censor: true,
        legacyNames: ["OSU_CLIENT_ID"],
      };
    case EnvVariable.OSU_API_CLIENT_SECRET:
      return {
        example: "dadasfsafsafdsadffasfsafasfa",
        description: `Check the description of ${envVariablePrefix}${EnvVariable.OSU_API_CLIENT_ID}.`,
        block: EnvVariableBlocks.OSU_API,
        censor: true,
        legacyNames: ["OSU_CLIENT_SECRET"],
      };
    case EnvVariable.OSU_API_DEFAULT_ID:
      return {
        example: "1185432",
        description:
          "The default osu! account ID used to check for recent play or a top play on a map.",
        block: EnvVariableBlocks.OSU_API,
        legacyNames: ["OSU_DEFAULT_ID"],
      };
    case EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS:
      return {
        default: "OFF",
        supportedValues: ["ON", "OFF"],
        description:
          "Automatically recognize beatmap links (=requests) in chat.",
        block: EnvVariableBlocks.OSU_API,
        legacyNames: ["OSU_RECOGNIZE_MAP_REQUESTS"],
      };
    case EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED:
      return {
        default: "OFF",
        supportedValues: ["ON", "OFF"],
        description: `If recognizing is enabled (${envVariablePrefix}${EnvVariable.OSU_API_RECOGNIZE_MAP_REQUESTS}=ON) additionally output more detailed information about the map in the chat.`,
        block: EnvVariableBlocks.OSU_API,
        legacyNames: ["OSU_RECOGNIZE_MAP_REQUESTS_DETAILED"],
      };

    case EnvVariable.OSU_IRC_PASSWORD:
      return {
        example: "senderServerPassword",
        supportedValues: ["ON", "OFF"],
        description:
          "The osu! irc server password and senderUserName. To get them go to https://osu.ppy.sh/p/irc and login (in case that clicking the 'Begin Email Verification' button does not reveal a text input refresh the page and click the button again -> this also means you get a new code!)",
        block: EnvVariableBlocks.OSU_IRC,
        censor: true,
      };
    case EnvVariable.OSU_IRC_USERNAME:
      return {
        example: "senderUserName",
        supportedValues: ["ON", "OFF"],
        description: `Check the description of ${envVariablePrefix}${EnvVariable.OSU_IRC_PASSWORD}.`,
        block: EnvVariableBlocks.OSU_IRC,
      };
    case EnvVariable.OSU_IRC_REQUEST_TARGET:
      return {
        example: "receiverUserName",
        description:
          "The osu! account name that should receive the requests (can be the same account as the sender!).",
        block: EnvVariableBlocks.OSU_IRC,
      };

    case EnvVariable.OSU_STREAM_COMPANION_URL:
      return {
        example: "localhost:20727",
        description:
          "osu! StreamCompanion URL to use a running StreamCompanion instance (https://github.com/Piotrekol/StreamCompanion) to always get the currently being played beatmap and used mods.",
        block: EnvVariableBlocks.OSU_STREAM_COMPANION,
      };

    case EnvVariable.SPOTIFY_ENABLE_COMMANDS:
      // eslint-disable-next-line no-case-declarations
      const spotifyCommands = [SpotifyCommands.SONG];
      return {
        default: spotifyCommands.sort().join(","),
        supportedValues: [...spotifyCommands, EMPTY_OPTION_LIST_VALUE_NONE],
        description: `${ENABLE_COMMANDS_DEFAULT_DESCRIPTION} If you don't provide Spotify API credentials the commands won't be enabled!`,
        block: EnvVariableBlocks.SPOTIFY,
      };
    case EnvVariable.SPOTIFY_API_CLIENT_ID:
      return {
        example: "abcdefghijklmnop",
        description:
          "Provide client id/secret to enable Twitch api calls in commands (get them by using https://developer.spotify.com/dashboard/applications and creating an application).",
        block: EnvVariableBlocks.SPOTIFY_API,
        censor: true,
      };
    case EnvVariable.SPOTIFY_API_CLIENT_SECRET:
      return {
        example: "abcdefghijklmnop",
        description: `Check the description of ${envVariablePrefix}${EnvVariable.SPOTIFY_API_CLIENT_ID}.`,
        block: EnvVariableBlocks.SPOTIFY_API,
        censor: true,
      };
    case EnvVariable.SPOTIFY_API_REFRESH_TOKEN:
      return {
        example: "abcdefghijklmnop",
        description: `You can get this token by authenticating once successfully using the ${envVariablePrefix}${EnvVariable.SPOTIFY_API_CLIENT_ID} and ${envVariablePrefix}${EnvVariable.SPOTIFY_API_CLIENT_SECRET}. After the successful authentication via a website that will open you can copy the refresh token from there.`,
        block: EnvVariableBlocks.SPOTIFY_API,
        censor: true,
      };

    case EnvVariable.TWITCH_API_ACCESS_TOKEN:
      return {
        example: "abcdefghijklmnop",
        description:
          "Provide client id/access token to enable Twitch api calls in commands (get them by using https://twitchtokengenerator.com with the scopes you want to have). The recommended scopes are: `user:edit:broadcast` to edit stream title/game, `user:read:broadcast`, `chat:read`, `chat:edit`.",
        block: EnvVariableBlocks.TWITCH_API,
        censor: true,
      };
    case EnvVariable.TWITCH_API_CLIENT_ID:
      return {
        example: "abcdefghijklmnop",
        description: `Check the description of ${envVariablePrefix}${EnvVariable.TWITCH_API_ACCESS_TOKEN}.`,

        block: EnvVariableBlocks.TWITCH_API,
        censor: true,
      };
  }
  throw Error(`The Cli variable ${envVariable} has no information`);
};

/**
 * Get the value of an environment variable or if not found a default value.
 * If the value is a (relative) path a configuration directory path needs to be supplied to get the correct value.
 *
 * @param envVariable The environment variable.
 * @param configDir The configuration directory for correct relative file paths.
 * @returns The value or default value of the environment variable.
 */
export const getEnvVariableValueOrDefault = (
  envVariable: EnvVariable,
  configDir = pathToRootDir
) => {
  const value = getEnvVariableValue(envVariable);
  if (value.value === undefined || value.value.trim().length === 0) {
    const variableInformation = getEnvVariableValueInformation(
      envVariable,
      configDir
    );
    if (variableInformation.defaultValue !== undefined) {
      return variableInformation.defaultValue;
    }
    if (variableInformation.default !== undefined) {
      return variableInformation.default;
    }
    throw Error(`The environment variable ${envVariable} has no default`);
  }
  return value.value;
};

/**
 * Get the actual name of the environment variable.
 *
 * @param envVariable The environment variable.
 * @returns The actual name of the environment variable.
 */
export const getEnvVariableName = (
  envVariable: EnvVariable | string
): string => {
  return `${envVariablePrefix}${envVariable.toString()}`;
};

export interface EnvVariableStructureTextBlock {
  name: string;
  content: string;
}
export interface EnvVariableStructureVariablesBlock {
  block: EnvVariableBlocks;
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
    content: `If a line that starts with '${envVariablePrefix}' has the symbol '#' in front of it that means it will be ignored as a comment. This means you can add custom comments and easily enable/disable any '${envVariablePrefix}' option by adding or removing that symbol.`,
  },
  {
    block: EnvVariableBlocks.LOGGING,
    name: "LOGGING",
    description: "Customize how much and where should be logged.",
  },
  {
    block: EnvVariableBlocks.TWITCH,
    name: "TWITCH",
    description:
      "Necessary variables that need to be set for ANY configuration to connect to Twitch chat.",
  },
  {
    block: EnvVariableBlocks.MOONPIE,
    name: "MOONPIE",
    description:
      "Customize the moonpie functionality that is enabled per default.",
  },
  {
    block: EnvVariableBlocks.OSU,
    name: "OSU",
    description: "Optional osu! commands that can be enabled.",
  },
  {
    block: EnvVariableBlocks.OSU_API,
    name: "OSU API",
    description:
      "Optional osu! API connection that can be enabled to use more osu! commands or detect beatmap requests.",
  },
  {
    block: EnvVariableBlocks.OSU_STREAM_COMPANION,
    name: "OSU STREAM COMPANION",
    description:
      "Optional osu! StreamCompanion connection that can be enabled for a much better !np command.",
  },
  {
    block: EnvVariableBlocks.SPOTIFY,
    name: "SPOTIFY",
    description: "Optional Spotify commands that can be enabled.",
  },
  {
    block: EnvVariableBlocks.SPOTIFY_API,
    name: "SPOTIFY API",
    description:
      "Optional Spotify API connection that can be enabled to use Spotify commands.",
  },
  {
    block: EnvVariableBlocks.TWITCH_API,
    name: "Twitch API",
    description:
      "Optional Twitch API connection that can be enabled for advanced custom commands that for example set/get the current game/title.",
  },
];

export const writeEnvVariableDocumentation = async (path: string) => {
  const data: FileDocumentationParts[] = [];

  for (const structurePart of envVariableStructure) {
    if (!(structurePart as EnvVariableStructureVariablesBlock)?.block) {
      // Just a text block
      const structurePartText = structurePart as EnvVariableStructureTextBlock;
      data.push({
        type: FileDocumentationPartType.TEXT,
        content: structurePartText.content,
      });
    } else {
      // Variable documentation block
      const structurePartVariables =
        structurePart as EnvVariableStructureVariablesBlock;
      data.push({
        type: FileDocumentationPartType.NEWLINE,
        count: 1,
      });
      data.push({
        type: FileDocumentationPartType.HEADING,
        title: structurePartVariables.name,
        description: structurePartVariables.description,
      });

      // Now add for each variable of the block the documentation
      for (const envVariable in EnvVariable) {
        const envVariableInfo = getEnvVariableValueInformation(envVariable);
        if (envVariableInfo?.block === structurePartVariables.block) {
          const envVariableEntry: FileDocumentationPartValue = {
            type: FileDocumentationPartType.VALUE,
            description: envVariableInfo.description,
            prefix: ">",
          };
          if (
            envVariableInfo.supportedValues &&
            envVariableInfo.supportedValues.length > 0
          ) {
            if (envVariableEntry.properties === undefined) {
              envVariableEntry.properties = [];
            }
            envVariableEntry.properties.push([
              "Supported values",
              envVariableInfo.supportedValues.sort().join(", "),
            ]);
          }
          envVariableEntry.infos = [];
          if (envVariableInfo.censor) {
            envVariableEntry.infos.push("KEEP THIS VARIABLE PRIVATE!");
          }
          if (envVariableInfo.default) {
            envVariableEntry.value = `${envVariablePrefix}${envVariable}=${envVariableInfo.default}`;
            envVariableEntry.isComment = !envVariableInfo.necessary;
          } else if (envVariableInfo.example) {
            envVariableEntry.infos.push(
              "(The following line is only an example!)"
            );
            envVariableEntry.value = `${envVariablePrefix}${envVariable}=${envVariableInfo.example}`;
            envVariableEntry.isComment = !envVariableInfo.necessary;
          } else {
            envVariableEntry.value = `ERROR`;
          }

          if (
            envVariableInfo.legacyNames &&
            envVariableInfo.legacyNames.length > 0
          ) {
            if (envVariableEntry.properties === undefined) {
              envVariableEntry.properties = [];
            }
            envVariableEntry.properties.push([
              `Legacy name${envVariableInfo.legacyNames.length > 1 ? "s" : ""}`,
              envVariableInfo.legacyNames.map(getEnvVariableName).join(", "),
            ]);
          }
          data.push(envVariableEntry);
        }
      }
    }
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(path, generateFileDocumentation(data));
};
