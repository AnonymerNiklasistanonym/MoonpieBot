/**
 * Strings information.
 */

// Local imports
import { customCommandsBroadcastsCommandReply } from "./strings/customCommandsBroadcasts/commandReply";
import { customCommandsBroadcastsCommands } from "./strings/customCommandsBroadcasts/commands";
import { general } from "./strings/general";
import { generateStringMap } from "../messageParser";
import { lurkCommandReply } from "./strings/lurk/commandReply";
import { moonpieCommandReply } from "./strings/moonpie/commandReply";
import { moonpieCommands } from "./strings/moonpie/commands";
import { moonpieUser } from "./strings/moonpie/user";
import { osuBeatmapRequests } from "./strings/osu/beatmapRequest";
import { osuCommandReply } from "./strings/osu/commandReply";
import { osuCommands } from "./strings/osu/commands";
import { spotifyCommandReply } from "./strings/spotify/commandReply";
import { spotifyCommands } from "./strings/spotify/commands";
// Type imports
import type { StringMap } from "../messageParser";

/**
 * The default values for all strings.
 */
export const defaultStringMap: StringMap = generateStringMap(
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
  ...spotifyCommands
);
