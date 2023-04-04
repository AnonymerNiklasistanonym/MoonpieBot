/**
 * Strings information.
 */

// Relative imports
import { customCommandsBroadcastsCommandReply } from "./strings/customCommandsBroadcasts/commandReply.mjs";
import { customCommandsBroadcastsCommands } from "./strings/customCommandsBroadcasts/commands.mjs";
import { general } from "./strings/general.mjs";
import { generateStringMap } from "../messageParser.mjs";
import { lurkCommandReply } from "./strings/lurk/commandReply.mjs";
import { moonpieCommandReply } from "./strings/moonpie/commandReply.mjs";
import { moonpieCommands } from "./strings/moonpie/commands.mjs";
import { moonpieUser } from "./strings/moonpie/user.mjs";
import { osuBeatmapRequests } from "./strings/osu/beatmapRequest.mjs";
import { osuCommandReply } from "./strings/osu/commandReply.mjs";
import { osuCommands } from "./strings/osu/commands.mjs";
import { spotifyCommandReply } from "./strings/spotify/commandReply.mjs";
import { spotifyCommands } from "./strings/spotify/commands.mjs";
// Type imports
import type { StringMap } from "../messageParser.mjs";

/**
 * The default values for all strings.
 */
export const defaultStringMap: Readonly<StringMap> = generateStringMap(
  ...customCommandsBroadcastsCommands,
  ...customCommandsBroadcastsCommandReply,
  ...general,
  ...lurkCommandReply,
  ...moonpieCommandReply,
  ...moonpieCommands,
  ...moonpieUser,
  ...osuBeatmapRequests,
  ...osuCommandReply,
  ...osuCommands,
  ...spotifyCommandReply,
  ...spotifyCommands,
);
