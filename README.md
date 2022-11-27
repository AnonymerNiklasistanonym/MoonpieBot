# MoonpieBot

## TODO

- Fix !osu requests command to set an acutal boolean if map requests are enabled or not instead of checking empty messages which is weird
- Check each feature if it works
- Double check regex expressions that can take a string with whitespaces

[![github release](https://img.shields.io/github/release/AnonymerNiklasistanonym/MoonpieBot.svg?label=current+release)](https://github.com/AnonymerNiklasistanonym/MoonpieBot/releases)
[![CI](https://github.com/AnonymerNiklasistanonym/MoonpieBot/actions/workflows/nodejs.yml/badge.svg)](https://github.com/AnonymerNiklasistanonym/MoonpieBot/actions/workflows/nodejs.yml)
![](./coverage.svg)

A custom Twitch chat bot.

![MoonpieBot icon](res/icons/moonpiebot.png)

- [Features](#features)
  - [Optional: Moonpie](#optional-moonpie)
  - [Optional: osu!](#optional-osu)
  - [Optional: Spotify](#optional-spotify)
  - [Default: Custom text/strings/messages](#default-custom-textstringsmessages)
  - [Default: Custom commands/broadcasts](#default-custom-commandsbroadcasts)
- [Setup](#setup)
  - [Build it yourself](#build-it-yourself)
  - [Binary releases](#binary-releases)
    - [Linux](#linux)
    - [Windows](#windows)
  - [Package managers](#package-managers)
    - [Pacman](#pacman)
- [Migrate to a new version](#migrate-to-a-new-version)
- [Examples](#examples)
  - [Example > Basic](#example--basic)
  - [Example > Lune (Moonpie)](#example--lune-moonpie)
  - [Example > Geo (Only osu! beatmap requests and !rp/!pp/!score)](#example--geo-only-osu-beatmap-requests-and-rpppscore)
- [Inspect Database](#inspect-database)
- [Development](#development)
  - [Tests](#tests)
  - [Configuration files](#configuration-files)
  - [How to handle versions](#how-to-handle-versions)
  - [Documentation](#documentation)
- [Profiling](#profiling)
- [Credits](#credits)

## Configuration

To supply configuration information you can either:

[//]: # (BEGIN:DEFAULT_CONFIG_DIR_SECTION)

- set environment variables
- list the environment variables in a `.env` file in the same directory you run `moonpiebot`
  If you use a desktop/start menu shortcut created by
  - the Windows installer the directory becomes `%APPDATA%\MoonpieBot`
  - a Linux package the directory becomes `$HOME/.local/share/moonpiebot`

Note: Via the command line argument `--config-dir` or the Windows installer shortcut for a custom configuration directory you can always change the directory which is searched for the `.env` and other configuration files.

[//]: # (END)

## Features

**Given the following required information provided via:**

[//]: # (BEGIN:LIST_ENV=TWITCH_NAME,TWITCH_OAUTH_TOKEN,TWITCH_CHANNELS)

- [x] The name of the twitch account/channel that should be imitated.

    Example: `MOONPIE_CONFIG_TWITCH_NAME=twitch_account_name`
- [x] A Twitch OAuth token (get it from: https://twitchapps.com/tmi/) of the Twitch account specified in MOONPIE_CONFIG_TWITCH_NAME.

    Example: `MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN=oauth:abcdefghijklmnop`
- [x] A with a space separated list of all the channels the bot should be active.

    Example: `MOONPIE_CONFIG_TWITCH_CHANNELS=twitch_channel_name1,twitch_channel_name2`

[//]: # (END)

the bot will imitate this Twitch account in these Twitch channel(s).

The following subsections contains all supported features of the bot:

### Optional: Moonpie

[//]: # (BEGIN:LIST_ENV_BLOCK=MOONPIE)

Every day a user can claim a moonpie and the count is saved in a persistent database.

- [ ] You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled).

    Default: `MOONPIE_CONFIG_MOONPIE_ENABLE_COMMANDS=about,commands`

    Supported values: `about`, `add`, `claim`, `commands`, `delete`, `get`, `leaderboard`, `remove`, `set`
- [ ] The database file path that contains the persistent moonpie data.

    Default: `MOONPIE_CONFIG_MOONPIE_DATABASE_PATH=moonpie.db`
- [ ] The number of hours for which a user is unable to claim a moonpie after claiming one (less than 24 in case of daily streams).

    Default: `MOONPIE_CONFIG_MOONPIE_CLAIM_COOLDOWN_HOURS=18`

[//]: # (END)

[//]: # (BEGIN:TABLE_ENABLE_COMMANDS=MOONPIE)

Chat | Command | Permissions | Description
--- | --- | --- | ---
`!moonpie about` | `about` | everyone | Get version information of the bot
`!moonpie add userName:=('TEXT'/TEXT) countAdd:=NUMBERS` | `add` | broadcaster | Add moonpies to a user
`!moonpie` | `claim` | everyone | (If not already claimed) Claim a moonpie once every set hours and return the current count and the leaderboard position
`!moonpie commands` | `commands` | everyone | List all enabled commands
`!moonpie delete userName:=('TEXT'/TEXT)` | `delete` | broadcaster | Delete moonpies of a user
`!moonpie get userName:=('TEXT'/TEXT)` | `get` | everyone | Get moonpies of a user
`!moonpie leaderboard[ startingRank:=NUMBERS]` | `leaderboard` | everyone | List the top moonpie holders
`!moonpie remove userName:=('TEXT'/TEXT) countRemove:=NUMBERS` | `remove` | broadcaster | Remove moonpies from a user
`!moonpie set userName:=('TEXT'/TEXT) countSet:=NUMBERS` | `set` | broadcaster | Set moonpies of a user

[//]: # (END)

### Optional: osu!

[//]: # (BEGIN:LIST_ENV_BLOCK=OSU)

Given a StreamCompanion connection osu! beatmap information (!np) can be provided or given an osu! OAuth client ID/secret and osu! ID plus an osu! IRC login the bot can enable beatmap requests or fetch other osu! related information.

- [ ] You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled). If you don't provide osu! API credentials and/or a StreamCompanion connection commands that need that won't be enabled!

    Default: `MOONPIE_CONFIG_OSU_ENABLE_COMMANDS=commands,last_request,np,permit_request,pp,requests,rp,score`

    Supported values: `commands`, `last_request`, `np`, `permit_request`, `pp`, `requests`, `requests`, `requests`, `requests`, `rp`, `score`

[//]: # (END)

[//]: # (BEGIN:LIST_ENV_BLOCK=OSU_STREAM_COMPANION)

A osu! StreamCompanion (https://github.com/Piotrekol/StreamCompanion) connection can be enabled for a much better !np command via either a websocket OR file interface.

- [ ] osu! StreamCompanion URL (websocket interface) to use a running StreamCompanion instance to get the currently being played beatmap, used mods and more (Providing a value will ignore MOONPIE_CONFIG_OSU_STREAM_COMPANION_DIR_PATH). Many users have problem with the websocket interface but the file interface worked for everyone so far.

    Example: `MOONPIE_CONFIG_OSU_STREAM_COMPANION_URL=localhost:20727`
- [ ] osu! StreamCompanion directory (file interface) path to use a running StreamCompanion instance to always get the currently being played beatmap, used mods and more (This is ignored if MOONPIE_CONFIG_OSU_STREAM_COMPANION_URL is also provided). To configure the StreamCompanion output and for example update certain values like the download link even when not playing a map you need to open StreamCompanion. Go to the section 'Output Patterns' and then edit the used rows (like 'np_all') to change the format. You can also change the 'Save event' of a row like for the current mods or download link so both will be live updated even if no song is played.

    Example: `MOONPIE_CONFIG_OSU_STREAM_COMPANION_DIR_PATH=C:\Program Files (x86)\StreamCompanion\Files`

[//]: # (END)

[//]: # (BEGIN:LIST_ENV_BLOCK=OSU_API)

A osu! API connection can be enabled to enable beatmap requests and other osu! commands.

- [ ] The osu! client ID (and client secret) to use the osu! API v2. To get it go to your account settings, Click 'New OAuth application' and add a custom name and URL (https://osu.ppy.sh/home/account/edit#oauth). After doing that you can copy the client ID (and client secret).

    Example: `MOONPIE_CONFIG_OSU_API_CLIENT_ID=1234`
- [ ] Check the description of MOONPIE_CONFIG_OSU_API_CLIENT_ID.

    Example: `MOONPIE_CONFIG_OSU_API_CLIENT_SECRET=dadasfsafsafdsadffasfsafasfa`
- [ ] The default osu! account ID used to check for recent play or a top play on a map.

    Example: `MOONPIE_CONFIG_OSU_API_DEFAULT_ID=1185432`
- [ ] The database file path that contains the persistent osu! (beatmap) requests configuration.

    Default: `MOONPIE_CONFIG_OSU_API_REQUESTS_CONFIG_DATABASE_PATH=osu_requests_config.db`
- [ ] If beatmap requests are enabled (MOONPIE_CONFIG_OSU_ENABLE_COMMANDS=requests) additionally output more detailed information about the map in the chat. This can also be set at runtime (!osuRequests set option optionValue) and stored persistently in a database (MOONPIE_CONFIG_OSU_API_REQUESTS_CONFIG_DATABASE_PATH) but if provided will override the current value in the database on start of the bot.

    Example: `MOONPIE_CONFIG_OSU_API_REQUESTS_DETAILED=ON`

    Supported values: `OFF`, `ON`
- [ ] If beatmap requests are enabled (MOONPIE_CONFIG_OSU_ENABLE_COMMANDS=requests) make it that only messages that used a channel point redeem will be recognized. This can also be set at runtime (!osuRequests set option optionValue) and stored persistently in a database (MOONPIE_CONFIG_OSU_API_REQUESTS_CONFIG_DATABASE_PATH) but if provided will override the current value in the database on start of the bot.

    Example: `MOONPIE_CONFIG_OSU_API_REQUESTS_REDEEM_ID=651f5474-07c2-4406-9e59-37d66fd34069`

[//]: # (END)

[//]: # (BEGIN:LIST_ENV_BLOCK=OSU_IRC)

Optional osu! IRC connection that can be enabled to send beatmap requests to the osu! client.

- [ ] The osu! irc server password and senderUserName. To get them go to https://osu.ppy.sh/p/irc and login (in case that clicking the 'Begin Email Verification' button does not reveal a text input refresh the page and click the button again -> this also means you get a new code!)

    Example: `MOONPIE_CONFIG_OSU_IRC_PASSWORD=senderServerPassword`
- [ ] Check the description of MOONPIE_CONFIG_OSU_IRC_PASSWORD.

    Example: `MOONPIE_CONFIG_OSU_IRC_USERNAME=senderUserName`
- [ ] The osu! account name that should receive the requests (can be the same account as the sender!).

    Example: `MOONPIE_CONFIG_OSU_IRC_REQUEST_TARGET=receiverUserName`

[//]: # (END)

[//]: # (BEGIN:TABLE_ENABLE_COMMANDS=OSU)

Chat | Command | Permissions | Description
--- | --- | --- | ---
`!osu commands` | `commands` | everyone | List all enabled commands
`!osuLastRequest[ lastRequestCount:=NUMBERS]` | `last_request` | mod | Resend the last request (or requests if a custom count is provided) in case of a osu! client restart
`!np` | `np` | everyone | Get a link to the currently being played map (if an optional StreamCompanion URL/directory path is provided this information will be used to get the current map information, otherwise the osu! window text will be used and searched for using the given osu! credentials [very slow and only works if the map is being played plus no detailed runtime information like mods and not all map information will be correct especially if it's not a ranked map])
`!osuPermitRequest` | `permit_request` | mod | Permit the last blocked map request
`!pp[ (osuUserId:=NUMBERS/osuUserName:=('TEXT'/TEXT))]` | `pp` | everyone | Get general account information (pp, rank, country, ...) of the account or of the given osu! player
`osuBeatmapUrl[ comment]` | `requests` | everyone | Request a beatmap requests using an osu! URL and optional comment
`!osuRequests[( on/ off)[ message:=('TEXT'/TEXT)]]` | `requests` | get=everyone on/off=mod | Get if map requests are currently enabled and with which demands if there are any, Turn map requests on or off with an optional message
`!osuRequests set option:=TEXT optionValue:=('TEXT'/TEXT)` | `requests` | mod | Set beatmap demands/options (arMax, arMin, csMax, csMin, detailed, detailedIrc, lengthInMinMax, lengthInMinMin, messageOff, messageOn, redeemId, starMax, starMin)
`!osuRequests unset option:=TEXT` | `requests` | mod | Reset beatmap request demands/options (arMax, arMin, csMax, csMin, detailed, detailedIrc, lengthInMinMax, lengthInMinMin, messageOff, messageOn, redeemId, starMax, starMin) back to their default value
`!rp[ (osuUserId:=NUMBERS/osuUserName:=('TEXT'/TEXT))]` | `rp` | everyone | Get the most recent play of the account or of the given osu! player
`!score osuUserName:=('TEXT'/TEXT)` | `score` | everyone | Get the top sore of the given osu! player on the most recently mentioned map in chat (from a beatmap request, rp, np)

[//]: # (END)

*Everything is currently optimized and written for osu! standard which means you need to open an issue if you want to use it with another game mode!*

### Optional: Spotify

[//]: # (BEGIN:LIST_ENV_BLOCK=SPOTIFY)

Optional Spotify commands that can be enabled.

- [ ] You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled). If you don't provide Spotify API credentials the commands won't be enabled!

    Default: `MOONPIE_CONFIG_SPOTIFY_ENABLE_COMMANDS=commands,song`

    Supported values: `commands`, `song`
- [ ] The database file path that contains the persistent spotify data.

    Default: `MOONPIE_CONFIG_SPOTIFY_DATABASE_PATH=spotify.db`

[//]: # (END)

[//]: # (BEGIN:LIST_ENV_BLOCK=SPOTIFY_API)

Given a Spotify client ID/secret the bot can fetch some Spotify related information like the currently played song.

- [ ] Provide client id/secret to enable Spotify API calls or Spotify commands (get them by using https://developer.spotify.com/dashboard/applications and creating an application - give the application the name 'MoonpieBot' and add the redirect URI 'http://localhost:9727' by clicking the button 'edit settings' after clicking on the application entry in the dashboard). At the first start a browser window will open where you need to successfully authenticate once.

    Example: `MOONPIE_CONFIG_SPOTIFY_API_CLIENT_ID=abcdefghijklmnop`
- [ ] Check the description of MOONPIE_CONFIG_SPOTIFY_API_CLIENT_ID.

    Example: `MOONPIE_CONFIG_SPOTIFY_API_CLIENT_SECRET=abcdefghijklmnop`
- [ ] Providing this token is not necessary but optional. You can get this token by authenticating once successfully using the MOONPIE_CONFIG_SPOTIFY_API_CLIENT_ID and MOONPIE_CONFIG_SPOTIFY_API_CLIENT_SECRET. This will be done automatically by this program if both values are provided (the browser window will open after starting). After a successful authentication via this website the refresh token can be copied from there but since it will be automatically stored in a database this variable does not need to be provided. If a value is found it is automatically written into the database and does not need to be provided after that.

    Example: `MOONPIE_CONFIG_SPOTIFY_API_REFRESH_TOKEN=abcdefghijklmnop`

[//]: # (END)

[//]: # (BEGIN:TABLE_ENABLE_COMMANDS=SPOTIFY)

Chat | Command | Permissions | Description
--- | --- | --- | ---
`!spotify commands` | `commands` | everyone | List all enabled commands
`!song` | `song` | everyone | Get the currently playing (and most recently played) song on the connected Spotify account

[//]: # (END)

### Default: Custom text/strings/messages

Most messages can be customized to a high degree because this application uses a message parser that can parse a *normal* text/string and replace certain parts with runtime information like a user name in a message reply (`@$(USER) ping` becomes at runtime to `@john_smith ping`).

To achieve this the logic consists of:

- Macros: `%MACRO_TITLE:MACRO_NAME%` that simply get replaced with a string value (`%MOONPIEBOT:VERSION%` becomes at runtime to `v0.0.27`)
- Plugins: `$(PLUGIN=OPTIONAL_PLUGIN_VALUE|OPTIONAL_PLUGIN_SCOPE)` that can for example evaluate a request like for example setting the stream title or evaluating if the plugin scope text should be displayed in respect to the plugin value (the optional plugin value will be parsed before the evaluation so you can nest plugins)
- References: `$[STRING_REFERENCE]` that simply reference another string that will then be inserted which reduces redundant entries

To override the default strings and add additional custom ones you can create a `.env.strings` file.
There is an example file [`.env.strings.example`](./.env.strings.example) for this where all the default values are listed and can be uncommented/edited which also contains the plugin and macro documentation.

Example:

```sh
# .env.strings file content

# Default value (commented and only here for reference)
#MOONPIE_CUSTOM_STRING_MOONPIE_COMMAND_REPLY_ABOUT=@$(USER) %MOONPIEBOT:NAME% %MOONPIEBOT:VERSION%
# Customized value (will override the default MOONPIE_COMMAND_REPLY_ABOUT string)
MOONPIE_CUSTOM_STRING_MOONPIE_COMMAND_REPLY_ABOUT=@$(USER) %MOONPIEBOT:NAME% %MOONPIEBOT:VERSION% (custom string) $[ABC]
# Custom string that can be referenced in any other string
MOONPIE_CUSTOM_STRING_ABC=Custom reference 69
```

If you now type in chat `!moonpie about` instead of the default reply the reply will also contain `(custom string) Custom reference 69` at the end.

---

**For some macros to work** (like Twitch API connections for `!so`/`!followage`/`!settitle`/`!setgame`, osu! api requests or Spotify api requests) **additional API credentials need to be provided** (most of them use the same credentials as the optional features with the same name).

Even though to run the bot default Twitch API credentials are already provided these credentials are only configured to read and write chat messages and are unable to change the stream title or fetch information about Twitch accounts.

Everything should be explained in more detail in the [`.env.example`](./.env.example) file.

### Default: Custom commands/broadcasts

[//]: # (BEGIN:LIST_ENV_BLOCK=CUSTOM_COMMANDS_BROADCASTS)

Custom commands and custom broadcasts can be added/edited/deleted via the Twitch chat which are persistently saved in a database. Custom commands will be checked for every new message. Custom broadcasts will be scheduled at start of the bot and rescheduled on any change.

- [ ] The database file path that contains the persistent custom commands and broadcasts data.

    Default: `MOONPIE_CONFIG_CUSTOM_COMMANDS_BROADCASTS_DATABASE_PATH=customCommandsBroadcasts.db`
- [ ] You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled).

    Default: `MOONPIE_CONFIG_CUSTOM_COMMANDS_BROADCASTS_ENABLE_COMMANDS=add_broadcast,add_command,commands,delete_broadcast,delete_command,edit_broadcast,edit_command,list_broadcasts,list_commands`

    Supported values: `add_broadcast`, `add_command`, `commands`, `delete_broadcast`, `delete_command`, `edit_broadcast`, `edit_command`, `list_broadcasts`, `list_commands`

[//]: # (END)

[//]: # (BEGIN:TABLE_ENABLE_COMMANDS=CUSTOM_COMMANDS_BROADCASTS)

Chat | Command | Permissions | Description
--- | --- | --- | ---
`!addcb id:=('TEXT'/TEXT) cronString:=('TEXT'/TEXT) message:=('TEXT'/TEXT)` | `add_broadcast` | mod | Add a broadcast with an ID, a cron expression to determine when the broadcast should be sent ([crontab.cronhub.io](https://crontab.cronhub.io/)) and a message
`!addcc id:=('TEXT'/TEXT) regex:=('TEXT'/TEXT) message:=('TEXT'/TEXT)[ -ul=userLevel:=(mod/vip/none/broadcaster)][ -cd=cooldownInS:=NUMBERS]` | `add_command` | mod | Add a command with an ID, a RegEx expression to detect it and capture contents of the match ([regex101.com](https://regex101.com/)) and a message - Optionally a cooldown (in s) and user level (broadcaster, mod, vip, none) are also supported
`!(cc[s]/cb[s]/cc[scb][s]) commands` | `commands` | everyone | List all enabled commands
`!delcb id:=('TEXT'/TEXT)` | `delete_broadcast` | mod | Delete a broadcast
`!delcc id:=('TEXT'/TEXT)` | `delete_command` | mod | Delete a command
`!editcb id:=('TEXT'/TEXT) option:=TEXT optionValue:=('TEXT'/TEXT)` | `edit_broadcast` | mod | A single property (cronString, description, id, message) can be edited of an existing broadcast
`!editcc id:=('TEXT'/TEXT) option:=TEXT optionValue:=('TEXT'/TEXT)` | `edit_command` | mod | A single property (cooldownInS, count, description, id, message, regex, userLevel) can be edited of an existing command
`!listcc[s][( listOffset:=NUMBERS/ id:=('TEXT'/TEXT))]` | `list_broadcasts` | everyone | List all callbacks (an offset number can be provided if multiple were added or an ID can be provided to only list one specific broadcast)
`!listcb[s][( listOffset:=NUMBERS/ id:=('TEXT'/TEXT))]` | `list_commands` | everyone | List all commands (an offset number can be provided if multiple were added or an ID can be provided to only list one specific command)

[//]: # (END)

An example file for this is [`customCommandsBroadcasts.example.txt`](./customCommandsBroadcasts.example.txt).

The custom commands/broadcasts messages use a custom message parser so next to *normal text* they can contain advanced logic.
The supported logic is documented in the [previous section](#default-custom-textstringsmessages).

A specific group of plugins that only custom commands/broadcasts support are global custom data plugins.
They enable to store persistently a text, number or a list of them in a database and change them or run operations on them (there are useful real life examples of this in the previously mentioned example file).

### Optional: Lurk

[//]: # (BEGIN:LIST_ENV_BLOCK=LURK)

Lurk command that welcomes chatters back.

- [ ] You can provide a list of commands that should be enabled, if this is empty or not set all commands are enabled (set the value to 'none' if no commands should be enabled).

    Default: `MOONPIE_CONFIG_LURK_ENABLE_COMMANDS=none`

    Supported values: `lurk`

[//]: # (END)

[//]: # (BEGIN:TABLE_ENABLE_COMMANDS=LURK)

Chat | Command | Permissions | Description
--- | --- | --- | ---
`!lurk` | `lurk` | everyone | Using this lurk command chatters are welcomed back after they come back

[//]: # (END)

## Setup

### Build it yourself

**ATTENTION: If you build this program yourself you need a node runtime that implements `fetch` which means you need for example [Node.js v18+](https://nodejs.org/en/blog/announcements/v18-release-announce/).**

1. Install a recent version of [Node.js](https://nodejs.org/en/download/) so the `node` and `npm` command are available
2. Get the source code of the bot

   Either by cloning this repository via `git`:

   - Install [git](https://git-scm.com/downloads)
   - Open the console/terminal in the directory where you want to have the source code and run:

     ```sh
     # cd path/to/dir
     git clone "https://github.com/AnonymerNiklasistanonym/MoonpieBot.git"
     ```

   Or by manually downloading it:

   - Get the latest version from [here](https://github.com/AnonymerNiklasistanonym/MoonpieBot/archive/refs/heads/main.zip) or by using the [GitHub website](https://github.com/AnonymerNiklasistanonym/MoonpieBot) by clicking `Code` and then `Download ZIP`

3. Open the directory of the cloned or downloaded source code in the console/terminal
   - Windows: Powershell/WindowsTerminal/...
   - Linux: xfce-terminal/...
4. Install all dependencies

   ```sh
   npm install
   ```

5. Build the bot (it needs to be compiled from TypeScript to JavaScript so it can be run via `node`)

   ```sh
   npm run build
   ```

   If you want you can now also remove all development dependencies that were installed to the `node_modules` directory and only necessary to build the program but not for running it:

   ```sh
   # Keep in mind that if you want to update the bot after the source code
   # changes you need to run `npm install` again to reacquire the development
   # dependencies
   npm prune --production
   ```

6. Provide a configuration (more details can be found in the [Features section](#features))

   - Either using environment variables
   - Or using a `.env` file in the directory from which you are starting the bot

     You can copy the [`.env.example`](./.env.example) file, rename it to `.env` and then edit the "variables" in there.
     The file contains also the information about what variables need to be set.

   - A detailed list of steps to get a Twitch OAuth token:

     1. Log into your twitch account (or better the account of the bot) in the browser
     2. Visit the webpage [twitchapps.com/tmi](https://twitchapps.com/tmi/)
     3. Follow the instructions and click `Connect`
     4. After enabling permission you get forwarded to a page where you can get the token

7. Run the bot

   ```sh
   npm run start
   # or
   node .
   ```

   If there are errors you can probably find advanced log messages in the log files in the directory `logs` that is created while running the bot.

   Per default critical values like for example the Twitch OAuth-token will be censored so screenshots or accidentally screen-sharing can't leak this information.
   This censoring can be disabled by passing an additional command line argument which can be helpful in case of debugging:

   ```sh
   npm run start -- --no-censoring
   # or
   node . --no-censoring
   ```

### Binary releases

There is now a way to use the program without needing to install or build anything.
You can download a binary for your operating system from the [latest release](https://github.com/AnonymerNiklasistanonym/MoonpieBot/releases) and then just run it.

#### Linux

**Binary standalone file (has no dependencies):**

```sh
./moonpiebot-linux
```

#### Windows

**Binary standalone file (has no dependencies):**

```ps1
.\moonpiebot-win.exe
```

**Binary installer (has no dependencies):**

For Windows there is also an installer with which the program can be easily installed.
The installation contains an uninstaller and a start menu/desktop shortcut so no terminal usage is necessary.

[//]: # (BEGIN:DEFAULT_CONFIG_DIR_LOCATION=WINDOWS)

The default location of the configuration/database/etc. files is `%APPDATA%\MoonpieBot`.

[//]: # (END)

### Package managers

#### Pacman

On Linux systems with `pacman` as their package manager (like Arch/Manjaro Linux) there is a way to install the program by using a `PKGBUILD` file.
For more information check the [installer `README.md`](./installer/README.md).

[//]: # (BEGIN:DEFAULT_CONFIG_DIR_LOCATION=LINUX)

The default location of the configuration/database/etc. files is `$HOME/.local/share/moonpiebot`.

[//]: # (END)

## Migrate to a new version

Migrating to a new version CAN break the database, custom commands, etc.
This means you should always backup your old configuration (there are shortcuts and command line arguments to do it).
In case of a bug or error this means you can always go back to how it was before and lose nothing.
Database migrations should be handled automatically and old tables remain in the database in case something goes wrong.

## Examples

In the following there is a list of some possible configurations (`.env` files):

**For more details about the options check the example file [`.env.example`](./.env.example)**

### Example > Basic

[//]: # (BEGIN:ENV_EXAMPLE=BASIC)

```sh
################################################################################
# TWITCH
# ------------------------------------------------------------------------------
# REQUIRED variables that need to be set for ANY configuration to connect to
# Twitch chat.
################################################################################
# > A with a space separated list of all the channels the bot should be active.
#   THIS VARIABLE IS REQUIRED!
MOONPIE_CONFIG_TWITCH_CHANNELS=twitch_channel_name1,twitch_channel_name2
# > The name of the twitch account/channel that should be imitated.
#   THIS VARIABLE IS REQUIRED!
MOONPIE_CONFIG_TWITCH_NAME=twitch_account_name
# > A Twitch OAuth token (get it from: https://twitchapps.com/tmi/) of the
#   Twitch account specified in MOONPIE_CONFIG_TWITCH_NAME.
#   THIS VARIABLE IS REQUIRED!
#   KEEP THIS VARIABLE PRIVATE!
MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN=oauth:abcdefghijklmnop
```

Supported features:

- ABOUT: Support a command for version information
  - `!moonpie about` (everyone): Get version information of the bot
  - `!moonpie commands` (everyone): List all enabled commands
- CUSTOM_CS_BS: Support custom commands/broadcasts stored in database and commands to change them
  - `!addcb id:=('TEXT'/TEXT) cronString:=('TEXT'/TEXT) message:=('TEXT'/TEXT)` (mod): Add a broadcast with an ID, a cron expression to determine when the broadcast should be sent ([crontab.cronhub.io](https://crontab.cronhub.io/)) and a message
  - `!addcc id:=('TEXT'/TEXT) regex:=('TEXT'/TEXT) message:=('TEXT'/TEXT)[ -ul=userLevel:=(mod/vip/none/broadcaster)][ -cd=cooldownInS:=NUMBERS]` (mod): Add a command with an ID, a RegEx expression to detect it and capture contents of the match ([regex101.com](https://regex101.com/)) and a message - Optionally a cooldown (in s) and user level (broadcaster, mod, vip, none) are also supported
  - `!(cc[s]/cb[s]/cc[scb][s]) commands` (everyone): List all enabled commands
  - `!delcb id:=('TEXT'/TEXT)` (mod): Delete a broadcast
  - `!delcc id:=('TEXT'/TEXT)` (mod): Delete a command
  - `!editcb id:=('TEXT'/TEXT) option:=TEXT optionValue:=('TEXT'/TEXT)` (mod): A single property (cronString, description, id, message) can be edited of an existing broadcast
  - `!editcc id:=('TEXT'/TEXT) option:=TEXT optionValue:=('TEXT'/TEXT)` (mod): A single property (cooldownInS, count, description, id, message, regex, userLevel) can be edited of an existing command
  - `!listcc[s][( listOffset:=NUMBERS/ id:=('TEXT'/TEXT))]` (everyone): List all callbacks (an offset number can be provided if multiple were added or an ID can be provided to only list one specific broadcast)
  - `!listcb[s][( listOffset:=NUMBERS/ id:=('TEXT'/TEXT))]` (everyone): List all commands (an offset number can be provided if multiple were added or an ID can be provided to only list one specific command)

[//]: # (END)

### Example > Lune (Moonpie)

[//]: # (BEGIN:ENV_EXAMPLE=LUNE)

```sh
################################################################################
# TWITCH
# ------------------------------------------------------------------------------
# REQUIRED variables that need to be set for ANY configuration to connect to
# Twitch chat.
################################################################################
# > A with a space separated list of all the channels the bot should be active.
#   THIS VARIABLE IS REQUIRED!
MOONPIE_CONFIG_TWITCH_CHANNELS=twitch_channel_name1,twitch_channel_name2
# > The name of the twitch account/channel that should be imitated.
#   THIS VARIABLE IS REQUIRED!
MOONPIE_CONFIG_TWITCH_NAME=twitch_account_name
# > A Twitch OAuth token (get it from: https://twitchapps.com/tmi/) of the
#   Twitch account specified in MOONPIE_CONFIG_TWITCH_NAME.
#   THIS VARIABLE IS REQUIRED!
#   KEEP THIS VARIABLE PRIVATE!
MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN=oauth:abcdefghijklmnop

################################################################################
# MOONPIE
# ------------------------------------------------------------------------------
# Every day a user can claim a moonpie and the count is saved in a persistent
# database.
################################################################################
# > You can provide a list of commands that should be enabled, if this is empty
#   or not set all commands are enabled (set the value to 'none' if no commands
#   should be enabled).
#   Supported list values: 'about', 'add', 'claim', 'commands', 'delete', 'get',
#   'leaderboard', 'remove', 'set'
#   Empty list value: 'none'
#   (Default value: about,commands)
MOONPIE_CONFIG_MOONPIE_ENABLE_COMMANDS=about,add,claim,commands,delete,get,leaderboard,remove,set

################################################################################
# OSU API
# ------------------------------------------------------------------------------
# A osu! API connection can be enabled to enable beatmap requests and other osu!
# commands.
################################################################################
# > The osu! client ID (and client secret) to use the osu! API v2. To get it go
#   to your account settings, Click 'New OAuth application' and add a custom
#   name and URL (https://osu.ppy.sh/home/account/edit#oauth). After doing that
#   you can copy the client ID (and client secret).
#   KEEP THIS VARIABLE PRIVATE!
MOONPIE_CONFIG_OSU_API_CLIENT_ID=1234
# > Check the description of MOONPIE_CONFIG_OSU_API_CLIENT_ID.
#   KEEP THIS VARIABLE PRIVATE!
MOONPIE_CONFIG_OSU_API_CLIENT_SECRET=dadasfsafsafdsadffasfsafasfa
# > The default osu! account ID used to check for recent play or a top play on a
#   map.
MOONPIE_CONFIG_OSU_API_DEFAULT_ID=1185432

################################################################################
# OSU STREAM COMPANION
# ------------------------------------------------------------------------------
# A osu! StreamCompanion (https://github.com/Piotrekol/StreamCompanion)
# connection can be enabled for a much better !np command via either a websocket
# OR file interface.
################################################################################
# > osu! StreamCompanion directory (file interface) path to use a running
#   StreamCompanion instance to always get the currently being played beatmap,
#   used mods and more (This is ignored if
#   MOONPIE_CONFIG_OSU_STREAM_COMPANION_URL is also provided). To configure the
#   StreamCompanion output and for example update certain values like the
#   download link even when not playing a map you need to open StreamCompanion.
#   Go to the section 'Output Patterns' and then edit the used rows (like
#   'np_all') to change the format. You can also change the 'Save event' of a
#   row like for the current mods or download link so both will be live updated
#   even if no song is played.
MOONPIE_CONFIG_OSU_STREAM_COMPANION_DIR_PATH='C:\Program Files (x86)\StreamCompanion\Files'

################################################################################
# OSU IRC
# ------------------------------------------------------------------------------
# Optional osu! IRC connection that can be enabled to send beatmap requests to
# the osu! client.
################################################################################
# > The osu! irc server password and senderUserName. To get them go to
#   https://osu.ppy.sh/p/irc and login (in case that clicking the 'Begin Email
#   Verification' button does not reveal a text input refresh the page and click
#   the button again -> this also means you get a new code!)
#   KEEP THIS VARIABLE PRIVATE!
MOONPIE_CONFIG_OSU_IRC_PASSWORD=senderServerPassword
# > The osu! account name that should receive the requests (can be the same
#   account as the sender!).
MOONPIE_CONFIG_OSU_IRC_REQUEST_TARGET=receiverUserName
# > Check the description of MOONPIE_CONFIG_OSU_IRC_PASSWORD.
MOONPIE_CONFIG_OSU_IRC_USERNAME=senderUserName
```

Supported features:

- ABOUT: Support a command for version information
  - `!moonpie about` (everyone): Get version information of the bot
  - `!moonpie commands` (everyone): List all enabled commands
- CUSTOM_CS_BS: Support custom commands/broadcasts stored in database and commands to change them
  - `!addcb id:=('TEXT'/TEXT) cronString:=('TEXT'/TEXT) message:=('TEXT'/TEXT)` (mod): Add a broadcast with an ID, a cron expression to determine when the broadcast should be sent ([crontab.cronhub.io](https://crontab.cronhub.io/)) and a message
  - `!addcc id:=('TEXT'/TEXT) regex:=('TEXT'/TEXT) message:=('TEXT'/TEXT)[ -ul=userLevel:=(mod/vip/none/broadcaster)][ -cd=cooldownInS:=NUMBERS]` (mod): Add a command with an ID, a RegEx expression to detect it and capture contents of the match ([regex101.com](https://regex101.com/)) and a message - Optionally a cooldown (in s) and user level (broadcaster, mod, vip, none) are also supported
  - `!(cc[s]/cb[s]/cc[scb][s]) commands` (everyone): List all enabled commands
  - `!delcb id:=('TEXT'/TEXT)` (mod): Delete a broadcast
  - `!delcc id:=('TEXT'/TEXT)` (mod): Delete a command
  - `!editcb id:=('TEXT'/TEXT) option:=TEXT optionValue:=('TEXT'/TEXT)` (mod): A single property (cronString, description, id, message) can be edited of an existing broadcast
  - `!editcc id:=('TEXT'/TEXT) option:=TEXT optionValue:=('TEXT'/TEXT)` (mod): A single property (cooldownInS, count, description, id, message, regex, userLevel) can be edited of an existing command
  - `!listcc[s][( listOffset:=NUMBERS/ id:=('TEXT'/TEXT))]` (everyone): List all callbacks (an offset number can be provided if multiple were added or an ID can be provided to only list one specific broadcast)
  - `!listcb[s][( listOffset:=NUMBERS/ id:=('TEXT'/TEXT))]` (everyone): List all commands (an offset number can be provided if multiple were added or an ID can be provided to only list one specific command)
- MOONPIE: Support moonpie database and commands to manage them
  - `!moonpie add userName:=('TEXT'/TEXT) countAdd:=NUMBERS` (broadcaster): Add moonpies to a user
  - `!moonpie` (everyone): (If not already claimed) Claim a moonpie once every set hours and return the current count and the leaderboard position
  - `!moonpie commands` (everyone): List all enabled commands
  - `!moonpie delete userName:=('TEXT'/TEXT)` (broadcaster): Delete moonpies of a user
  - `!moonpie get userName:=('TEXT'/TEXT)` (everyone): Get moonpies of a user
  - `!moonpie leaderboard[ startingRank:=NUMBERS]` (everyone): List the top moonpie holders
  - `!moonpie remove userName:=('TEXT'/TEXT) countRemove:=NUMBERS` (broadcaster): Remove moonpies from a user
  - `!moonpie set userName:=('TEXT'/TEXT) countSet:=NUMBERS` (broadcaster): Set moonpies of a user
- OSU_API: Support osu! API calls in custom commands/broadcasts or in the enabled commands
  - `!osu commands` (everyone): List all enabled commands
  - `!np` (everyone): Get a link to the currently being played map (if an optional StreamCompanion URL/directory path is provided this information will be used to get the current map information, otherwise the osu! window text will be used and searched for using the given osu! credentials [very slow and only works if the map is being played plus no detailed runtime information like mods and not all map information will be correct especially if it's not a ranked map])
  - `!pp[ (osuUserId:=NUMBERS/osuUserName:=('TEXT'/TEXT))]` (everyone): Get general account information (pp, rank, country, ...) of the account or of the given osu! player
  - `!rp[ (osuUserId:=NUMBERS/osuUserName:=('TEXT'/TEXT))]` (everyone): Get the most recent play of the account or of the given osu! player
  - `!score osuUserName:=('TEXT'/TEXT)` (everyone): Get the top sore of the given osu! player on the most recently mentioned map in chat (from a beatmap request, rp, np)
- OSU_API_BEATMAP_REQUESTS: Support osu! beatmap requests in Twitch chat using the osu! API and commands to manage them
  - `!osu commands` (everyone): List all enabled commands
  - `osuBeatmapUrl[ comment]` (everyone): Request a beatmap requests using an osu! URL and optional comment
  - `!osuRequests[( on/ off)[ message:=('TEXT'/TEXT)]]` (get=everyone on/off=mod): Get if map requests are currently enabled and with which demands if there are any, Turn map requests on or off with an optional message
  - `!osuRequests set option:=TEXT optionValue:=('TEXT'/TEXT)` (mod): Set beatmap demands/options (arMax, arMin, csMax, csMin, detailed, detailedIrc, lengthInMinMax, lengthInMinMin, messageOff, messageOn, redeemId, starMax, starMin)
  - `!osuRequests unset option:=TEXT` (mod): Reset beatmap request demands/options (arMax, arMin, csMax, csMin, detailed, detailedIrc, lengthInMinMax, lengthInMinMin, messageOff, messageOn, redeemId, starMax, starMin) back to their default value
- OSU_IRC_BEATMAP_REQUESTS: Support sending beatmap requests via IRC messages to the osu! client
- OSU_STREAM_COMPANION_FILE: Support getting current map/client information from osu! via StreamCompanion using the file interface and will be used in the enabled commands instead of the osu! API
  - `!osu commands` (everyone): List all enabled commands
  - `!np` (everyone): Get a link to the currently being played map (if an optional StreamCompanion URL/directory path is provided this information will be used to get the current map information, otherwise the osu! window text will be used and searched for using the given osu! credentials [very slow and only works if the map is being played plus no detailed runtime information like mods and not all map information will be correct especially if it's not a ranked map])

[//]: # (END)

### Example > Geo (Only osu! beatmap requests and !rp/!pp/!score)

[//]: # (BEGIN:ENV_EXAMPLE=GEO)

```sh
################################################################################
# TWITCH
# ------------------------------------------------------------------------------
# REQUIRED variables that need to be set for ANY configuration to connect to
# Twitch chat.
################################################################################
# > A with a space separated list of all the channels the bot should be active.
#   THIS VARIABLE IS REQUIRED!
MOONPIE_CONFIG_TWITCH_CHANNELS=twitch_channel_name1,twitch_channel_name2
# > The name of the twitch account/channel that should be imitated.
#   THIS VARIABLE IS REQUIRED!
MOONPIE_CONFIG_TWITCH_NAME=twitch_account_name
# > A Twitch OAuth token (get it from: https://twitchapps.com/tmi/) of the
#   Twitch account specified in MOONPIE_CONFIG_TWITCH_NAME.
#   THIS VARIABLE IS REQUIRED!
#   KEEP THIS VARIABLE PRIVATE!
MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN=oauth:abcdefghijklmnop

################################################################################
# OSU
# ------------------------------------------------------------------------------
# Given a StreamCompanion connection osu! beatmap information (!np) can be
# provided or given an osu! OAuth client ID/secret and osu! ID plus an osu! IRC
# login the bot can enable beatmap requests or fetch other osu! related
# information.
################################################################################
# > You can provide a list of commands that should be enabled, if this is empty
#   or not set all commands are enabled (set the value to 'none' if no commands
#   should be enabled). If you don't provide osu! API credentials and/or a
#   StreamCompanion connection commands that need that won't be enabled!
#   Supported list values: 'commands', 'last_request', 'np', 'permit_request',
#   'pp', 'requests', 'rp', 'score'
#   Empty list value: 'none'
#   (Default value:
#   commands,last_request,np,permit_request,pp,requests,rp,score)
MOONPIE_CONFIG_OSU_ENABLE_COMMANDS=commands,last_request,permit_request,pp,requests,rp,score

################################################################################
# OSU API
# ------------------------------------------------------------------------------
# A osu! API connection can be enabled to enable beatmap requests and other osu!
# commands.
################################################################################
# > The osu! client ID (and client secret) to use the osu! API v2. To get it go
#   to your account settings, Click 'New OAuth application' and add a custom
#   name and URL (https://osu.ppy.sh/home/account/edit#oauth). After doing that
#   you can copy the client ID (and client secret).
#   KEEP THIS VARIABLE PRIVATE!
MOONPIE_CONFIG_OSU_API_CLIENT_ID=1234
# > Check the description of MOONPIE_CONFIG_OSU_API_CLIENT_ID.
#   KEEP THIS VARIABLE PRIVATE!
MOONPIE_CONFIG_OSU_API_CLIENT_SECRET=dadasfsafsafdsadffasfsafasfa
# > The default osu! account ID used to check for recent play or a top play on a
#   map.
MOONPIE_CONFIG_OSU_API_DEFAULT_ID=1185432

################################################################################
# OSU IRC
# ------------------------------------------------------------------------------
# Optional osu! IRC connection that can be enabled to send beatmap requests to
# the osu! client.
################################################################################
# > The osu! irc server password and senderUserName. To get them go to
#   https://osu.ppy.sh/p/irc and login (in case that clicking the 'Begin Email
#   Verification' button does not reveal a text input refresh the page and click
#   the button again -> this also means you get a new code!)
#   KEEP THIS VARIABLE PRIVATE!
MOONPIE_CONFIG_OSU_IRC_PASSWORD=senderServerPassword
# > The osu! account name that should receive the requests (can be the same
#   account as the sender!).
MOONPIE_CONFIG_OSU_IRC_REQUEST_TARGET=receiverUserName
# > Check the description of MOONPIE_CONFIG_OSU_IRC_PASSWORD.
MOONPIE_CONFIG_OSU_IRC_USERNAME=senderUserName

################################################################################
# CUSTOM COMMANDS & BROADCASTS
# ------------------------------------------------------------------------------
# Custom commands and custom broadcasts can be added/edited/deleted via the
# Twitch chat which are persistently saved in a database. Custom commands will
# be checked for every new message. Custom broadcasts will be scheduled at start
# of the bot and rescheduled on any change.
################################################################################
# > You can provide a list of commands that should be enabled, if this is empty
#   or not set all commands are enabled (set the value to 'none' if no commands
#   should be enabled).
#   Supported list values: 'add_broadcast', 'add_command', 'commands',
#   'delete_broadcast', 'delete_command', 'edit_broadcast', 'edit_command',
#   'list_broadcasts', 'list_commands'
#   Empty list value: 'none'
#   (Default value:
#   add_broadcast,add_command,commands,delete_broadcast,delete_command,edit_broadcast,edit_command,list_broadcasts,list_commands)
MOONPIE_CONFIG_CUSTOM_COMMANDS_BROADCASTS_ENABLE_COMMANDS=none
```

Supported features:

- ABOUT: Support a command for version information
  - `!moonpie about` (everyone): Get version information of the bot
  - `!moonpie commands` (everyone): List all enabled commands
- CUSTOM_CS_BS: Support custom commands/broadcasts stored in database and commands to change them
- OSU_API: Support osu! API calls in custom commands/broadcasts or in the enabled commands
  - `!osu commands` (everyone): List all enabled commands
  - `!pp[ (osuUserId:=NUMBERS/osuUserName:=('TEXT'/TEXT))]` (everyone): Get general account information (pp, rank, country, ...) of the account or of the given osu! player
  - `!rp[ (osuUserId:=NUMBERS/osuUserName:=('TEXT'/TEXT))]` (everyone): Get the most recent play of the account or of the given osu! player
  - `!score osuUserName:=('TEXT'/TEXT)` (everyone): Get the top sore of the given osu! player on the most recently mentioned map in chat (from a beatmap request, rp, np)
- OSU_API_BEATMAP_REQUESTS: Support osu! beatmap requests in Twitch chat using the osu! API and commands to manage them
  - `!osu commands` (everyone): List all enabled commands
  - `osuBeatmapUrl[ comment]` (everyone): Request a beatmap requests using an osu! URL and optional comment
  - `!osuRequests[( on/ off)[ message:=('TEXT'/TEXT)]]` (get=everyone on/off=mod): Get if map requests are currently enabled and with which demands if there are any, Turn map requests on or off with an optional message
  - `!osuRequests set option:=TEXT optionValue:=('TEXT'/TEXT)` (mod): Set beatmap demands/options (arMax, arMin, csMax, csMin, detailed, detailedIrc, lengthInMinMax, lengthInMinMin, messageOff, messageOn, redeemId, starMax, starMin)
  - `!osuRequests unset option:=TEXT` (mod): Reset beatmap request demands/options (arMax, arMin, csMax, csMin, detailed, detailedIrc, lengthInMinMax, lengthInMinMin, messageOff, messageOn, redeemId, starMax, starMin) back to their default value
- OSU_IRC_BEATMAP_REQUESTS: Support sending beatmap requests via IRC messages to the osu! client

[//]: # (END)

## Inspect Database

To inspect the SQLite database manually and edit it or run custom queries (for example for development) the program [DB Browser for SQLite](https://sqlitebrowser.org/dl/) can be used.

## Development

- The entry point of the app is `src/index.ts`
- A `.env` file should be created which is used for environment variables in the local dev environment
- `npm run dev` - start the app in development mode (it reads the local .env file)
- `npm run test:dev` - run tests locally (reads local .env)
- `npm run lint` - run eslint
- `npm run format` - run prettier
- `npm run build:dev` - build typescript with source maps and comments in code are kept
- `npm run mocha` - a helper npm script for running customised mocha command e.g. test a single file `npm run mocha -- file-name-or-pattern`

### Tests

If you only want to run one specific test suite and not all of them you can specify the test suite file:

```sh
# This will only run the test suite in the file "test/src/database.test.ts"
cross-env NODE_PATH=. nyc mocha -- "test/src/database.test.ts"
```

### Configuration files

- TypeScript: `.tsconfig.json`, `.tsconfig.eslint` (special script for linting tests/scripts)
- ESLint (linting): `.eslintrc.json`, `.eslintignore`
- Mocha (testing): `.mocharc.json`
- Istanbul (code coverage): `.nycrc`
- Nodemon (automatically recompile project on file changes): `nodemon.json`

### How to handle versions

1. Prepare version for release

   For releases set the next version in [`src/version.ts`](src/version.ts) (don't forget to set `beta: false`).
   Then you need to run the following command to update most files with that version:

   ```sh
   npm run create
   ```

   After all versions are updated commit these changes with the message: *Prepare version for release*

2. Create git version tag

   Now you can run `npm version patch`/`minor`/`major` because it will automatically create a commit and tag for you (in case you want a specific version modify the version in [`package.json`](package.json) before running `npm version` for ease of use).

   To push the git tag created by `npm version` run `git push origin <tag_name>` or use `git push --tags`.

3. Bump version for next dev cycle

   To mark the next dev cycle as a not final release change the version in [`src/version.ts`](src/version.ts) to the version you aim to release next (don't forget to set `beta: true`).

   Then you need to run the following command to update most files with that version:

   ```sh
   npm run create
   ```

   After all versions are updated commit these changes with the message: *Bump version for next dev cycle*

---

GitHub Actions will automatically create a GitHub release for you so you only need to edit the title and description after it successfully ran.

### Documentation

For documentation purposes several plugins can be used:

- UML class diagrams for interfaces/classes
- Mermaid diagrams in comments:

  ```ts
  /**
   * Documentation comment with mermaid block.
   *
   * ```mermaid
   * graph TB
   *   mermaid.js --> TypeDoc;
   * ```
   *
   * @param a A
   */
  export const name
  ```

## Profiling

- [Node.js profiling:](https://medium.com/@paul_irish/debugging-node-js-nightlies-with-chrome-devtools-7c4a1b95ae27)

  - Start application with custom inspect option:

    ```sh
    npm run build
    npm run start:inspect
    ```

  - Now open a chromium based browser and enter as URL `chrome://inspect`
  - Click the button *Open dedicated DevTools for Node*
  - Now you can set breakpoints and memory/CPU profile the running application:
    - Breakpoints: Go to the *Sources* tab, select *Filesystem* and then add the repository directory (or just the `dist` directory) - now you can set breakpoints by clicking on the line of code you want to break on
    - Memory: (Go to the *Memory* tab)
      - You can create and compare heap snapshots (click the round button) when you set the profiling type to *Heap snapshot*
      - You can get a heap change visualization with the same kind of snapshot information by setting the profiling type to *Allocation instrumentation on timeline*
    - CPU: In the tab *Profiler* you can record the application as long as you want, if you stop the profiler you will get a table of what parts of the code were used the most

- [Simple profiling:](https://nodejs.org/en/docs/guides/simple-profiling/)

  ```sh
  # Track all calls
  NODE_ENV=production node --prof .
  # Then take the created file "isolate-0x558b5a308560-178958-v8.log" for analysis
  node --prof-process isolate-0x55e4675df560-178103-v8.log > processed.txt
        "profile_perf": "perf record -e cycles:u -g -- node --perf-basic-prof .",
        "profile_perf_data": "perf script > perfs.out",
        "profile_perf_flamegraph": "stackvis perf < perfs.out > flamegraph.htm",
  ```

- [Flamegraph:](https://nodejs.org/en/docs/guides/diagnostics-flamegraph/)

  ```sh
  # Track all calls using perf
  perf record -e cycles:u -g -- node --perf-basic-prof .
  # Create perf output and edit it to remove internal calls
  perf script > perfs.out
  sed -i \
    -e "/( __libc_start| LazyCompile | v8::internal::| Builtin:| Stub:| LoadIC:|\[unknown\]| LoadPolymorphicIC:)/d" \
    -e 's/ LazyCompile:[*~]\?/ /' \
    ./perfs.out
  # Create flamegraph that can be viewed in the browser
  stackvis perf < perfs.out > flamegraph.htm
  ```

## Credits

The following docs and websites were useful during the creation of this bot.

- Setup Typescript project:
  - [medium.com: Setting up Node.JS with Typescript, Nodemon, Eslint, Mocha and Istanbul by Daniel Gong](https://coolgk.medium.com/setting-up-node-js-with-typescript-nodemon-eslint-mocha-and-istanbul-111a77d84ea7)
- Twitch integration:
  - [twilio.com: Creating Twitch Chat Bots with Node.js by Sam Agnew](https://www.twilio.com/blog/creating-twitch-chat-bots-with-node-js)
- Database integration:
  - [sqlitetutorial.net: SQLite Node.js](https://www.sqlitetutorial.net/sqlite-nodejs/)
  - [sqlitetutorial.net: SQLite Create View](https://www.sqlitetutorial.net/sqlite-create-view/)
  - [sqlitetutorial.net: SQLite ROW_NUMBER](https://www.sqlitetutorial.net/sqlite-window-functions/sqlite-row_number/)
- Logging with winston:
  - [Winston Logger With Typescript Typescript by Kimserey](https://kimsereylam.com/typescript/2021/12/03/winston-logger-with-typescript.html)
