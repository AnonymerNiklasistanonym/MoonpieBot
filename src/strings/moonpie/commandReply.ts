import { MOONPIE_STRING_ID } from "../moonpie";

export const MOONPIE_COMMAND_REPLY_STRING_ID = `${MOONPIE_STRING_ID}_COMMAND_REPLY`;

export const moonpieCommandReply: Iterable<readonly [string, string]> = [
  [
    `${MOONPIE_COMMAND_REPLY_STRING_ID}_ABOUT`,
    "@$(USER) %MOONPIEBOT:NAME% %MOONPIEBOT:VERSION% (%MOONPIEBOT:URL%)",
  ],
  [
    `${MOONPIE_COMMAND_REPLY_STRING_ID}_CLAIM`,
    "@$(USER) You just claimed a moonpie! You have now %MOONPIE:COUNT% moonpie$(SHOW_IF_BIGGER_THAN=%MOONPIE:COUNT%>1|s) and are rank %MOONPIE:LEADERBOARD_RANK% on the leaderboard!",
  ],
  [
    `${MOONPIE_COMMAND_REPLY_STRING_ID}_CLAIMED`,
    "@$(USER) You already claimed a moonpie for today ($(TIME_IN_S_TO_HUMAN_READABLE_STRING=%MOONPIE:TIME_SINCE_CLAIM_IN_S%) ago) and are rank %MOONPIE:LEADERBOARD_RANK% on the leaderboard!",
  ],
  [
    `${MOONPIE_COMMAND_REPLY_STRING_ID}_CLAIMED_STAR`,
    "@$(USER) You are the cutest! You have now 6969 moonpies and are rank 1 in my heart! <3",
  ],
  [`${MOONPIE_COMMAND_REPLY_STRING_ID}_LEADERBOARD_PREFIX`, "@$(USER) "],
  [
    `${MOONPIE_COMMAND_REPLY_STRING_ID}_LEADERBOARD_ENTRY`,
    "%MOONPIE_LEADERBOARD:RANK%. %MOONPIE_LEADERBOARD:NAME% (%MOONPIE_LEADERBOARD:COUNT%)",
  ],
];
