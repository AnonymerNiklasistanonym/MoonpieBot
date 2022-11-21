% MoonpieBot(1) moonpiebot 1.0.30b
% AnonymerNiklasistanonym
% November 2022

# NAME

moonpiebot - A custom Twitch chat bot.

# SYNOPSIS

**moonpiebot** [*OPTIONS*]

# DESCRIPTION

Running this program will start a Twitch connected bot using information provided by either environment variables, a '*.env*' file in the same directory or given a **----config-dir** argument a '*.env*' file in the specified directory. Additionally log files and the databases are written to this directory if not specified otherwise by 'LOGGING_DIRECTORY_PATH', 'MOONPIE_DATABASE_PATH', 'SPOTIFY_DATABASE_PATH', 'CUSTOM_COMMANDS_BROADCASTS_DATABASE_PATH'. Custom strings can also be written to '*.env*.strings' to keep the '*.env*' clean.

If this program is installed via a package it will use *$HOME/.local/share/moonpiebot* as the default **----config-dir**.

# OPTIONS

**----config-dir** *CONFIG_DIR*
: Specify a custom directory that contains all configurations and databases

**----disable-censoring**
: Disabling the censoring stops the censoring of private tokens which is helpful to debug if the inputs are read correctly but should otherwise be avoided

**----create-backup** *BACKUP_DIR*
: Create a backup of all configurations and databases that can be found in the specified backup directory

**----import-backup** *BACKUP_DIR*
: Import a backup of all configurations and databases that can be found in the specified backup directory

**----create-example-files** *[EXAMPLE_FILES_DIR]*
: Creates example files (for custom commands and timers) in the specified example files directory if given or the current config directory

**----export-data** *CUSTOM_COMMANDS_BROADCASTS|ENV|ENV_STRINGS|MOONPIE|OSU_REQUESTS_CONFIG* *[OUTPUT_FILE]*
: Exports certain data for backups

**----export-data**-json *CUSTOM_COMMANDS_BROADCASTS|ENV|ENV_STRINGS|MOONPIE|OSU_REQUESTS_CONFIG* *[OUTPUT_FILE]*
: Exports certain data for 3rd party support

**----help**
: Get instructions on how to run and configure this program

**----version**
: Get the version of the program

# ENVIRONMENT VARIABLES

**MOONPIE_CONFIG_CUSTOM_COMMANDS_BROADCASTS_DATABASE_PATH**="*customCommandsBroadcasts.db*"
: The database file path that contains the persistent custom commands and broadcasts data.

**MOONPIE_CONFIG_CUSTOM_COMMANDS_BROADCASTS_ENABLED_COMMANDS**="*add_broadcast,add_command,commands,delete_broadcast,delete_command,edit_broadcast,edit_command,list_broadcasts,list_commands*"
: You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled).
Supported list values: "*add_broadcast*", "*add_command*", "*commands*", "*delete_broadcast*", "*delete_command*", "*edit_broadcast*", "*edit_command*", "*list_broadcasts*", "*list_commands*" (empty list value: "*none*")

**MOONPIE_CONFIG_LOGGING_CONSOLE_LOG_LEVEL**="*info*"
: The log level of the log messages that are printed to the console.
Supported values: "*debug*", "*error*", "*info*", "*warn*"

**MOONPIE_CONFIG_LOGGING_DIRECTORY_PATH**="*logs*"
: The directory file path of the log files

**MOONPIE_CONFIG_LOGGING_FILE_LOG_LEVEL**="*debug*"
: The log level of the log messages that are written to the log files.
Supported values: "*debug*", "*error*", "*info*", "*warn*"

**MOONPIE_CONFIG_TWITCH_CHANNELS**
: A with a space separated list of all the channels the bot should be active.
Example: "*twitch_channel_name1,twitch_channel_name2*"

**MOONPIE_CONFIG_TWITCH_NAME**
: The name of the twitch account that should be imitated.
Example: "*twitch_channel_name*"

**MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN**
: A Twitch OAuth token (get it from: https://twitchapps.com/tmi/).
Example: "*oauth:abcdefghijklmnop*"

**MOONPIE_CONFIG_TWITCH_DEBUG**="*OFF*"
: Turn on debug logs for the Twitch client to see all messages, joins, reconnects and more.
Supported values: "*OFF*", "*ON*"

**MOONPIE_CONFIG_LURK_ENABLED_COMMANDS**="*none*"
: You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled).
Supported list values: "*lurk*" (empty list value: "*none*")

**MOONPIE_CONFIG_MOONPIE_ENABLE_COMMANDS**="*about,commands*"
: You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled).
Supported list values: "*about*", "*add*", "*claim*", "*commands*", "*delete*", "*get*", "*leaderboard*", "*remove*", "*set*" (empty list value: "*none*")

**MOONPIE_CONFIG_MOONPIE_DATABASE_PATH**="*moonpie.db*"
: The database file path that contains the persistent moonpie data.

**MOONPIE_CONFIG_MOONPIE_CLAIM_COOLDOWN_HOURS**="*18*"
: The number of hours for which a user is unable to claim a Moonpie after claiming one (less than 24 in case of daily streams).

**MOONPIE_CONFIG_OSU_ENABLE_COMMANDS**="*commands,last_request,np,permit_request,pp,requests,rp,score*"
: You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled). If you don't provide osu! API credentials and/or a StreamCompanion connection commands that need that won't be enabled!
Supported list values: "*commands*", "*last_request*", "*np*", "*permit_request*", "*pp*", "*requests*", "*rp*", "*score*" (empty list value: "*none*")

**MOONPIE_CONFIG_OSU_API_CLIENT_ID**
: The osu! client ID (and client secret) to use the osu! api v2. To get it go to your account settings, Click 'New OAuth application' and add a custom name and URL (https://osu.ppy.sh/home/account/edit#oauth). After doing that you can copy the client ID (and client secret).
Example: "*1234*"

**MOONPIE_CONFIG_OSU_API_CLIENT_SECRET**
: Check the description of MOONPIE_CONFIG_OSU_API_CLIENT_ID.
Example: "*dadasfsafsafdsadffasfsafasfa*"

**MOONPIE_CONFIG_OSU_API_DEFAULT_ID**
: The default osu! account ID used to check for recent play or a top play on a map.
Example: "*1185432*"

**MOONPIE_CONFIG_OSU_API_REQUESTS_CONFIG_DATABASE_PATH**="*osu_requests_config.db*"
: The database file path that contains the persistent osu! map requests data.

**MOONPIE_CONFIG_OSU_API_REQUESTS_DETAILED**
: If recognizing is enabled (MOONPIE_CONFIG_OSU_ENABLE_COMMANDS=requests) additionally output more detailed information about the map in the chat. This can also be set at runtime and stored persistently in a database (MOONPIE_CONFIG_OSU_API_REQUESTS_CONFIG_DATABASE_PATH) but if provided will override the current value in the database on start of the bot.
Example: "*ON*"
Supported values: "*OFF*", "*ON*"

**MOONPIE_CONFIG_OSU_API_REQUESTS_REDEEM_ID**
: If recognizing is enabled (MOONPIE_CONFIG_OSU_ENABLE_COMMANDS=requests)  make it that only messages that used a channel point redeem will be recognized. This can also be set at runtime and stored persistently in a database (MOONPIE_CONFIG_OSU_API_REQUESTS_CONFIG_DATABASE_PATH) but if provided will override the current value in the database on start of the bot.
Example: "*651f5474-07c2-4406-9e59-37d66fd34069*"

**MOONPIE_CONFIG_OSU_IRC_PASSWORD**
: The osu! irc server password and senderUserName. To get them go to https://osu.ppy.sh/p/irc and login (in case that clicking the 'Begin Email Verification' button does not reveal a text input refresh the page and click the button again -> this also means you get a new code!)
Example: "*senderServerPassword*"

**MOONPIE_CONFIG_OSU_IRC_USERNAME**
: Check the description of MOONPIE_CONFIG_OSU_IRC_PASSWORD.
Example: "*senderUserName*"

**MOONPIE_CONFIG_OSU_IRC_REQUEST_TARGET**
: The osu! account name that should receive the requests (can be the same account as the sender!).
Example: "*receiverUserName*"

**MOONPIE_CONFIG_OSU_STREAM_COMPANION_URL**
: osu! StreamCompanion URL (websocket interface) to use a running StreamCompanion instance to always get the currently being played beatmap and used mods. (If OSU_STREAM_COMPANION_DIR_PATH is provided this interface will be used over it)
Example: "*localhost:20727*"

**MOONPIE_CONFIG_OSU_STREAM_COMPANION_DIR_PATH**
: osu! StreamCompanion directory (file interface) path to use a running StreamCompanion instance to always get the currently being played beatmap and used mods. You can configure the details via the integrated message parser but since it uses the output of StreamCompanion you can just configure it in there. Go to the section 'Output Patterns' and then edit the used rows (like 'np_all'). You can also change the 'Save event' of a row like for the current mods so the mods will be live updated even if no song is played. (If OSU_STREAM_COMPANION_URL is provided this interface will not be used)
Example: "*C:\Program Files (x86)\StreamCompanion\Files*"

**MOONPIE_CONFIG_SPOTIFY_ENABLE_COMMANDS**="*commands,song*"
: You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled). If you don't provide Spotify API credentials the commands won't be enabled!
Supported list values: "*commands*", "*song*" (empty list value: "*none*")

**MOONPIE_CONFIG_SPOTIFY_DATABASE_PATH**="*spotify.db*"
: The database file path that contains the persistent spotify data.

**MOONPIE_CONFIG_SPOTIFY_API_CLIENT_ID**
: Provide client id/secret to enable Twitch api calls or Spotify commands (get them by using https://developer.spotify.com/dashboard/applications and creating an application). At the first start a browser window will open where you need to authenticate once.
Example: "*abcdefghijklmnop*"

**MOONPIE_CONFIG_SPOTIFY_API_CLIENT_SECRET**
: Check the description of MOONPIE_CONFIG_SPOTIFY_API_CLIENT_ID.
Example: "*abcdefghijklmnop*"

**MOONPIE_CONFIG_SPOTIFY_API_REFRESH_TOKEN**
: Providing this token is not necessary but optional. You can get this token by authenticating once successfully using the MOONPIE_CONFIG_SPOTIFY_API_CLIENT_ID and MOONPIE_CONFIG_SPOTIFY_API_CLIENT_SECRET. This will be done automatically by this program if both values are provided (the browser window will open after starting). After a successful authentication via this website the refresh token can be copied from there but since it will be automatically stored in a database this variable does not need to be provided. If a value is found it is automatically written into the database and does not need to be provided after that.
Example: "*abcdefghijklmnop*"

**MOONPIE_CONFIG_TWITCH_API_ACCESS_TOKEN**
: Provide client id/access token to enable Twitch api calls in commands (get them by using https://twitchtokengenerator.com with the scopes you want to have). The recommended scopes are: `user:edit:broadcast` to edit stream title/game, `user:read:broadcast`, `chat:read`, `chat:edit`.
Example: "*abcdefghijklmnop*"

**MOONPIE_CONFIG_TWITCH_API_CLIENT_ID**
: Check the description of MOONPIE_CONFIG_TWITCH_API_ACCESS_TOKEN.
Example: "*abcdefghijklmnop*"

# BUGS

Bugs are tracked in GitHub Issues: https://github.com/AnonymerNiklasistanonym/MoonpieBot/issues

# COPYRIGHT

MoonpieBot is available under the MIT license.

See https://github.com/AnonymerNiklasistanonym/MoonpieBot/blob/main/LICENSE for the full license text.

# SEE ALSO

Website and Documentation: https://anonymerniklasistanonym.github.io/MoonpieBot/

GitHub repository and issue tracker: https://github.com/AnonymerNiklasistanonym/MoonpieBot
