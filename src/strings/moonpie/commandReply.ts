import { MOONPIE_STRING_ID } from "../moonpie";

export const MOONPIE_COMMAND_REPLY_STRING_ID = `${MOONPIE_STRING_ID}_COMMAND_REPLY`;

export const moonpieCommandReplyAbout = {
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_ABOUT`,
  default: "@$(USER) %MOONPIEBOT:NAME% %MOONPIEBOT:VERSION% (%MOONPIEBOT:URL%)",
};

export const moonpieCommandReplyClaim = {
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_CLAIM`,
  default:
    "@$(USER) You just claimed a moonpie! You have now %MOONPIE:COUNT% moonpie$(IF_GREATER=%MOONPIE:COUNT%>1|s) and are rank %MOONPIE:LEADERBOARD_RANK% on the leaderboard!",
};

export const moonpieCommandReplyAlreadyClaimed = {
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_ALREADY_CLAIMED`,
  default:
    "@$(USER) You already claimed a moonpie for today ($(TIME_IN_S_TO_HUMAN_READABLE_STRING_SHORT=%MOONPIE:TIME_SINCE_CLAIM_IN_S%) ago - next claim can be made in $(TIME_IN_S_TO_HUMAN_READABLE_STRING_SHORT=%MOONPIE:TIME_TILL_NEXT_CLAIM_IN_S%)) and are rank %MOONPIE:LEADERBOARD_RANK% on the leaderboard!",
};

export const moonpieCommandReplyAlreadyClaimedStar = {
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_ALREADY_CLAIMED_STAR`,
  default:
    "@$(USER) You are the cutest! You have now 6969 moonpies and are rank 1 in my heart! <3",
};

export const moonpieCommandReplyLeaderboardPrefix = {
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_LEADERBOARD_PREFIX`,
  default: "@$(USER) ",
};

export const moonpieCommandReplyLeaderboardEntry = {
  id: `${MOONPIE_COMMAND_REPLY_STRING_ID}_LEADERBOARD_ENTRY`,
  default:
    "%MOONPIE_LEADERBOARD_ENTRY:RANK%. %MOONPIE_LEADERBOARD_ENTRY:NAME% (%MOONPIE_LEADERBOARD_ENTRY:COUNT%)",
};

export const moonpieCommandReply: Iterable<readonly [string, string]> = [
  [moonpieCommandReplyAbout.id, moonpieCommandReplyAbout.default],
  [moonpieCommandReplyClaim.id, moonpieCommandReplyClaim.default],
  [
    moonpieCommandReplyAlreadyClaimed.id,
    moonpieCommandReplyAlreadyClaimed.default,
  ],
  [
    moonpieCommandReplyAlreadyClaimedStar.id,
    moonpieCommandReplyAlreadyClaimedStar.default,
  ],
  [
    moonpieCommandReplyLeaderboardPrefix.id,
    moonpieCommandReplyLeaderboardPrefix.default,
  ],
  [
    moonpieCommandReplyLeaderboardEntry.id,
    moonpieCommandReplyLeaderboardEntry.default,
  ],
];
