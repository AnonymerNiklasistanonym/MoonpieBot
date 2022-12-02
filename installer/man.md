% MoonpieBot(1) moonpiebot 1.0.31b
% AnonymerNiklasistanonym
% December 2022

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

**MOONPIE_CONFIG_CUSTOM_COMMANDS_BROADCASTS_ENABLE_COMMANDS**="*add_broadcast,add_command,commands,delete_broadcast,delete_command,edit_broadcast,edit_command,list_broadcasts,list_commands*"
: You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled).
Supported list values: "*add_broadcast*", "*add_command*", "*commands*", "*delete_broadcast*", "*delete_command*", "*edit_broadcast*", "*edit_command*", "*list_broadcasts*", "*list_commands*" (empty list value: "*none*")

- "*add_broadcast*": "*!addcb id:=('TEXT'/TEXT) cronString:=('TEXT'/TEXT) message:=('TEXT'/TEXT)*" (mod) - Add a broadcast with an ID, a cron expression to determine when the broadcast should be sent ([crontab.cronhub.io](https://crontab.cronhub.io/)) and a message
- "*add_command*": "*!addcc id:=('TEXT'/TEXT) regex:=('TEXT'/TEXT) message:=('TEXT'/TEXT)[ -ul=userLevel:=(mod/vip/none/broadcaster)][ -cd=cooldownInS:=NUMBERS]*" (mod) - Add a command with an ID, a RegEx expression to detect it and capture contents of the match ([regex101.com](https://regex101.com/)) and a message - Optionally a cooldown (in s) and user level (broadcaster, mod, vip, none) are also supported
- "*commands*": "*!(cc[s]/cb[s]/cc[scb][s]) commands*" (everyone) - List all enabled commands
- "*delete_broadcast*": "*!delcb id:=('TEXT'/TEXT)*" (mod) - Delete a broadcast
- "*delete_command*": "*!delcc id:=('TEXT'/TEXT)*" (mod) - Delete a command
- "*edit_broadcast*": "*!editcb id:=('TEXT'/TEXT) option:=TEXT optionValue:=('TEXT'/TEXT)*" (mod) - A single property (cronString, description, id, message) can be edited of an existing broadcast
- "*edit_command*": "*!editcc id:=('TEXT'/TEXT) option:=TEXT optionValue:=('TEXT'/TEXT)*" (mod) - A single property (cooldownInS, count, description, id, message, regex, userLevel) can be edited of an existing command
- "*list_broadcasts*": "*!listcc[s][( listOffset:=NUMBERS/ id:=('TEXT'/TEXT))]*" (everyone) - List all callbacks (an offset number can be provided if multiple were added or an ID can be provided to only list one specific broadcast)
- "*list_commands*": "*!listcb[s][( listOffset:=NUMBERS/ id:=('TEXT'/TEXT))]*" (everyone) - List all commands (an offset number can be provided if multiple were added or an ID can be provided to only list one specific command)

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
: The name of the twitch account/channel that should be imitated.
Example: "*twitch_account_name*"

**MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN**
: A Twitch OAuth token (get it from: https://twitchapps.com/tmi/) of the Twitch account specified in **MOONPIE_CONFIG_TWITCH_NAME**.
Example: "*oauth:abcdefghijklmnop*"

**MOONPIE_CONFIG_TWITCH_DEBUG**="*OFF*"
: Turn on debug logs for the Twitch client to see all messages, joins, reconnects and more.
Supported values: "*OFF*", "*ON*"

**MOONPIE_CONFIG_LURK_ENABLE_COMMANDS**="*none*"
: You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled).
Supported list values: "*lurk*" (empty list value: "*none*")

- "*lurk*": "*!lurk*" (everyone) - Using this lurk command chatters are welcomed back after they come back

**MOONPIE_CONFIG_MOONPIE_ENABLE_COMMANDS**="*about,commands*"
: You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled).
Example: "*about,add,claim,commands,delete,get,leaderboard,remove,set*"
Supported list values: "*about*", "*add*", "*claim*", "*commands*", "*delete*", "*get*", "*leaderboard*", "*remove*", "*set*" (empty list value: "*none*")

- "*about*": "*!moonpie about*" (everyone) - Get version information of the bot
- "*add*": "*!moonpie add userName:=('TEXT'/TEXT) countAdd:=NUMBERS*" (broadcaster) - Add moonpies to a user
- "*claim*": "*!moonpie*" (everyone) - (If not already claimed) Claim a moonpie once every set hours and return the current count and the leaderboard position
- "*commands*": "*!moonpie commands*" (everyone) - List all enabled commands
- "*delete*": "*!moonpie delete userName:=('TEXT'/TEXT)*" (broadcaster) - Delete moonpies of a user
- "*get*": "*!moonpie get userName:=('TEXT'/TEXT)*" (everyone) - Get moonpies of a user
- "*leaderboard*": "*!moonpie leaderboard[ startingRank:=NUMBERS]*" (everyone) - List the top moonpie holders
- "*remove*": "*!moonpie remove userName:=('TEXT'/TEXT) countRemove:=NUMBERS*" (broadcaster) - Remove moonpies from a user
- "*set*": "*!moonpie set userName:=('TEXT'/TEXT) countSet:=NUMBERS*" (broadcaster) - Set moonpies of a user

**MOONPIE_CONFIG_MOONPIE_DATABASE_PATH**="*moonpie.db*"
: The database file path that contains the persistent moonpie data.

**MOONPIE_CONFIG_MOONPIE_CLAIM_COOLDOWN_HOURS**="*18*"
: The number of hours for which a user is unable to claim a moonpie after claiming one (less than 24 in case of daily streams).

**MOONPIE_CONFIG_OSU_ENABLE_COMMANDS**="*commands,last_request,np,permit_request,pp,requests,rp,score*"
: You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled). If you don't provide osu! API credentials and/or a StreamCompanion connection commands that need that won't be enabled!
Supported list values: "*commands*", "*last_request*", "*np*", "*permit_request*", "*pp*", "*requests*", "*rp*", "*score*" (empty list value: "*none*")

- "*commands*": "*!osu commands*" (everyone) - List all enabled commands
- "*last_request*": "*!osuLastRequest[ lastRequestCount:=NUMBERS]*" (mod) - Resend the last request (or requests if a custom count is provided) in case of a osu! client restart
- "*np*": "*!np*" (everyone) - Get a link to the currently selected map (if an optional StreamCompanion URL/directory path is provided this information will be used to get the current map information, otherwise the osu! window text will be used and searched for using the given osu! credentials [very slow and only works if the map is being played plus no detailed runtime information like mods and not all map information will be correct especially if it's not a ranked map])
- "*permit_request*": "*!osuPermitRequest*" (mod) - Permit last blocked request
- "*pp*": "*!pp[ (osuUserId:=NUMBERS/osuUserName:=('TEXT'/TEXT))]*" (everyone) - Get general account information (pp, rank, country, ...) of the account or of the given osu! player
- "*requests*": "*osuBeatmapUrl[ comment]*" (everyone) - Request a beatmap requests using an osu! URL and optional comment
- "*requests*": "*!osuRequests[( on/ off)[ message:=('TEXT'/TEXT)]]*" (get=everyone on/off=mod) - Get if beatmap requests are currently enabled and with which demands if there are any, Turn beatmap requests on or off with an optional message
- "*requests*": "*!osuRequests set option:=TEXT optionValue:=('TEXT'/TEXT)*" (mod) - Set beatmap demands/options (arMax, arMin, csMax, csMin, detailed, detailedIrc, lengthInMinMax, lengthInMinMin, messageOff, messageOn, redeemId, starMax, starMin)
- "*requests*": "*!osuRequests unset option:=TEXT*" (mod) - Reset beatmap request demands/options (arMax, arMin, csMax, csMin, detailed, detailedIrc, lengthInMinMax, lengthInMinMin, messageOff, messageOn, redeemId, starMax, starMin) back to their default value
- "*rp*": "*!rp[ (osuUserId:=NUMBERS/osuUserName:=('TEXT'/TEXT))]*" (everyone) - Get the most recent play of the account or of the given osu! player
- "*score*": "*!score osuUserName:=('TEXT'/TEXT)*" (everyone) - Get the top score of the given osu! player on the most recently mentioned map in chat (from a beatmap request, rp, np)

**MOONPIE_CONFIG_OSU_API_CLIENT_ID**
: The osu! client ID (and client secret) to use the osu! API v2. To get it go to your account settings, Click 'New OAuth application' and add a custom name and URL (https://osu.ppy.sh/home/account/edit#oauth). After doing that you can copy the client ID (and client secret).
Example: "*1234*"

**MOONPIE_CONFIG_OSU_API_CLIENT_SECRET**
: Check the description of **MOONPIE_CONFIG_OSU_API_CLIENT_ID**.
Example: "*dadasfsafsafdsadffasfsafasfa*"

**MOONPIE_CONFIG_OSU_API_DEFAULT_ID**
: The default osu! account ID used to check for recent play or a top play on a map.
Example: "*1185432*"

**MOONPIE_CONFIG_OSU_API_REQUESTS_CONFIG_DATABASE_PATH**="*osu_requests_config.db*"
: The database file path that contains the persistent osu! (beatmap) requests configuration.

**MOONPIE_CONFIG_OSU_API_REQUESTS_DETAILED**
: If beatmap requests are enabled (**MOONPIE_CONFIG_OSU_ENABLE_COMMANDS**=requests) additionally output more detailed information about the map in the chat. This can also be set at runtime (!osuRequests set option optionValue) and stored persistently in a database (**MOONPIE_CONFIG_OSU_API_REQUESTS_CONFIG_DATABASE_PATH**) but if provided will override the current value in the database on start of the bot.
Example: "*ON*"
Supported values: "*OFF*", "*ON*"

**MOONPIE_CONFIG_OSU_API_REQUESTS_REDEEM_ID**
: If beatmap requests are enabled (**MOONPIE_CONFIG_OSU_ENABLE_COMMANDS**=requests) make it that only messages that used a channel point redeem will be recognized. This can also be set at runtime (!osuRequests set option optionValue) and stored persistently in a database (**MOONPIE_CONFIG_OSU_API_REQUESTS_CONFIG_DATABASE_PATH**) but if provided will override the current value in the database on start of the bot.
Example: "*651f5474-07c2-4406-9e59-37d66fd34069*"

**MOONPIE_CONFIG_OSU_IRC_PASSWORD**
: The osu! irc server password and senderUserName. To get them go to https://osu.ppy.sh/p/irc and login (in case that clicking the 'Begin Email Verification' button does not reveal a text input refresh the page and click the button again -> this also means you get a new code!)
Example: "*senderServerPassword*"

**MOONPIE_CONFIG_OSU_IRC_USERNAME**
: Check the description of **MOONPIE_CONFIG_OSU_IRC_PASSWORD**.
Example: "*senderUserName*"

**MOONPIE_CONFIG_OSU_IRC_REQUEST_TARGET**
: The osu! account name that should receive the requests (can be the same account as the sender!).
Example: "*receiverUserName*"

**MOONPIE_CONFIG_OSU_STREAM_COMPANION_URL**
: osu! StreamCompanion URL (websocket interface) to use a running StreamCompanion instance to get the currently being played beatmap, used mods and more (Providing a value will ignore **MOONPIE_CONFIG_OSU_STREAM_COMPANION_DIR_PATH**). Many users have problem with the websocket interface but the file interface worked for everyone so far.
Example: "*localhost:20727*"

**MOONPIE_CONFIG_OSU_STREAM_COMPANION_DIR_PATH**
: osu! StreamCompanion directory (file interface) path to use a running StreamCompanion instance to always get the currently being played beatmap, used mods and more (This is ignored if **MOONPIE_CONFIG_OSU_STREAM_COMPANION_URL** is also provided). To configure the StreamCompanion output and for example update certain values like the download link even when not playing a map you need to open StreamCompanion. Go to the section 'Output Patterns' and then edit the used rows (like 'np_all') to change the format. You can also change the 'Save event' of a row like for the current mods or download link so both will be live updated even if no song is played.
Example: "*C:\Program Files (x86)\StreamCompanion\Files*"

**MOONPIE_CONFIG_SPOTIFY_ENABLE_COMMANDS**="*commands,song*"
: You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled). If you don't provide Spotify API credentials the commands won't be enabled!
Supported list values: "*commands*", "*song*" (empty list value: "*none*")

- "*commands*": "*!spotify commands*" (everyone) - List all enabled commands
- "*song*": "*!song*" (everyone) - Get the currently playing (and most recently played) song on the connected Spotify account

**MOONPIE_CONFIG_SPOTIFY_DATABASE_PATH**="*spotify.db*"
: The database file path that contains the persistent spotify data.

**MOONPIE_CONFIG_SPOTIFY_API_CLIENT_ID**
: Provide client id/secret to enable Spotify API calls or Spotify commands (get them by using https://developer.spotify.com/dashboard/applications and creating an application - give the application the name 'MoonpieBot' and add the redirect URI 'http://localhost:9727' by clicking the button 'edit settings' after clicking on the application entry in the dashboard). At the first start a browser window will open where you need to successfully authenticate once.
Example: "*abcdefghijklmnop*"

**MOONPIE_CONFIG_SPOTIFY_API_CLIENT_SECRET**
: Check the description of **MOONPIE_CONFIG_SPOTIFY_API_CLIENT_ID**.
Example: "*abcdefghijklmnop*"

**MOONPIE_CONFIG_SPOTIFY_API_REFRESH_TOKEN**
: Providing this token is not necessary but optional. You can get this token by authenticating once successfully using the **MOONPIE_CONFIG_SPOTIFY_API_CLIENT_ID** and **MOONPIE_CONFIG_SPOTIFY_API_CLIENT_SECRET**. This will be done automatically by this program if both values are provided (the browser window will open after starting). After a successful authentication via this website the refresh token can be copied from there but since it will be automatically stored in a database this variable does not need to be provided. If a value is found it is automatically written into the database and does not need to be provided after that.
Example: "*abcdefghijklmnop*"

**MOONPIE_CONFIG_TWITCH_API_ACCESS_TOKEN**
: Provide client id/access token to enable Twitch API calls in commands (get them by using https://twitchtokengenerator.com with the scopes you want to have). The recommended scopes are: `user:edit:broadcast` to edit stream title/game, `user:read:broadcast`, `chat:read`, `chat:edit`.
Example: "*abcdefghijklmnop*"

**MOONPIE_CONFIG_TWITCH_API_CLIENT_ID**
: Check the description of **MOONPIE_CONFIG_TWITCH_API_ACCESS_TOKEN**.
Example: "*abcdefghijklmnop*"

# BUGS

Bugs are tracked in GitHub Issues: https://github.com/AnonymerNiklasistanonym/MoonpieBot/issues

# COPYRIGHT

MoonpieBot is available under the MIT license.

See https://github.com/AnonymerNiklasistanonym/MoonpieBot/blob/main/LICENSE for the full license text.

# SEE ALSO

Website and Documentation: https://anonymerniklasistanonym.github.io/MoonpieBot/

GitHub repository and issue tracker: https://github.com/AnonymerNiklasistanonym/MoonpieBot
