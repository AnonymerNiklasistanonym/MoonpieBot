/*
 * Twitch Client/Connection setup and general functions surrounding chat message
 * handling.
 */

// Local exports
export {
  createTwitchClient,
  CreateTwitchClientError,
  CreateTwitchClientErrorCode,
  TwitchClientListener,
} from "./twitch/twitchClient";
export { checkTwitchBadgeLevel } from "./twitch/twitchBadge";
export { logTwitchMessageBroadcast } from "./twitch/twitchLog";
export { runTwitchCommandHandler } from "./twitch/twitchChatCommandHandler";
// Local type exports
export type {
  ChatUserstateIdUserNameId,
  CommandGenericDetectorInputEnabledCommands,
  TwitchChatCommandHandler,
  TwitchChatCommandHandlerCreateReply,
  TwitchChatCommandHandlerDetect,
  TwitchChatCommandHandlerDetectorDataOutput,
  TwitchChatCommandHandlerInfo,
  TwitchChatCommandHandlerReply,
} from "./twitch/twitchChatCommandHandler";
export type { TwitchChatHandler } from "./twitch/twitchChatHandler";
