export const osuCommandReply: Iterable<readonly [string, string]> = [
  [
    "MOONPIE_COMMAND_REPLY_ABOUT",
    "@$(USER) %MOONPIEBOT:NAME% %MOONPIEBOT:VERSION% (%MOONPIEBOT:URL%)",
  ],
  [
    "MOONPIE_COMMAND_REPLY_CLAIM",
    "@$(USER) You just claimed a moonpie! You have now %MOONPIE:COUNT% moonpie$(SHOW_IF_BIGGER_THAN=%MOONPIE:COUNT%>1|s) and are rank %MOONPIE:LEADERBOARD_RANK% on the leaderboard!",
  ],
  [
    "MOONPIE_COMMAND_REPLY_CLAIM_ALREADY_CLAIMED",
    "@$(USER) You already claimed a moonpie for today ($(TIME_IN_S_TO_HUMAN_READABLE_STRING=%MOONPIE:TIME_SINCE_CLAIM_IN_S%) ago) and are rank %MOONPIE:LEADERBOARD_RANK% on the leaderboard!",
  ],
  [
    "MOONPIE_COMMAND_REPLY_CLAIM_ALREADY_CLAIMED_STAR",
    "@$(USER) You are the cutest! You have now 6969 moonpies and are rank 1 in my heart! <3",
  ],
  ["MOONPIE_COMMAND_REPLY_LEADERBOARD_PREFIX", "@$(USER) "],
  [
    "MOONPIE_COMMAND_REPLY_LEADERBOARD_ENTRY",
    "%MOONPIE_LEADERBOARD:RANK%. %MOONPIE_LEADERBOARD:NAME% (%MOONPIE_LEADERBOARD:COUNT%)",
  ],
];
