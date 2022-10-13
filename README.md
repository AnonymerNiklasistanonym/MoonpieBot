# MoonpieBot

[![github release](https://img.shields.io/github/release/AnonymerNiklasistanonym/MoonpieBot.svg?label=current+release)](https://github.com/AnonymerNiklasistanonym/MoonpieBot/releases)
[![CI](https://github.com/AnonymerNiklasistanonym/MoonpieBot/actions/workflows/nodejs.yml/badge.svg)](https://github.com/AnonymerNiklasistanonym/MoonpieBot/actions/workflows/nodejs.yml)
![](./coverage.svg)

A custom Twitch chat bot.

![MoonpieBot icon](res/icons/moonpiebot.png)

- [Features](#features)
  - [Default: moonpie](#default-moonpie)
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
- [Implementation](#implementation)
- [Inspect Database](#inspect-database)
- [Development](#development)
  - [Tests](#tests)
  - [Configuration files](#configuration-files)
  - [How to handle versions](#how-to-handle-versions)
  - [Documentation](#documentation)
- [Profiling](#profiling)
- [Credits](#credits)

## Features

**Given a Twitch account name, a connected OAuth token and the channel name(s) where the bot should be deployed** will imitate the given account in the given channel.

The following list contains all supported features of the bot.

**All (default) features can be disabled.**

### Default: moonpie

- Every day a user can claim a *moonpie* and the count is saved in a persistent database that can be accessed with the following commands:

  | Command | Permissions | Description |
  | ------ | -- | -------- |
  | `!moonpie` | everyone | (If not already claimed) Claim a moonpie and return the current count and the leaderboard position |
  | `!moonpie commands` | everyone | See all available moonpie commands |
  | `!moonpie leaderboard` | everyone | Show the top 15 moonpie holders |
  | `!moonpie get $USER` | everyone | Return the current count and the leaderboard position of `$USER` if found in database |
  | `!moonpie about` | everyone | Show the version and source code link of the bot |
  | `!moonpie add $USER $COUNT` | broadcaster | Add moonpie `$COUNT` to `$USER` if found in database |
  | `!moonpie remove $USER $COUNT` | broadcaster | Remove moonpie `$COUNT` to `$USER` if found in database |
  | `!moonpie set $USER $COUNT` | broadcaster | Set moonpie `$COUNT` to `$USER` if found in database |
  | `!moonpie delete $USER` | broadcaster | Delete a `$USER` from the database if found in database |

**Every command can be optionally disabled.**

### Optional: osu!

**Given an osu! OAuth client ID/secret and a default (streamer) osu! ID** the bot can additionally fetch some osu! related information.

The `!np` and `!osu commands` are available **if instead of the former only a [StreamCompanion](https://github.com/Piotrekol/StreamCompanion) URL (`localhost:20727`) or directory path (`C:\Program Files (x86)\StreamCompanion\Files`) is provided**.

| Command | Permissions | Description |
| ------ | -- | -------- |
| `!rp ($OSU_ID/$OSU_NAME)` | everyone | Get the most recent play of the streamer or of the given osu! player ID |
| `!pp ($OSU_ID/$OSU_NAME)` | everyone | Get general account information (pp, rank, country, ...) of the streamer or of the given osu! player ID |
| `!np` | everyone | Get a link to the currently being played map (**if an optional StreamCompanion URL/directory path is provided** this information will be used to get the current map information, otherwise the osu! window text will be used and searched for **using the given osu! credentials** [very slow and only works if the map is being played plus no detailed runtime information like mods and not all map information will be correct especially if it's not a ranked map]) |
| `!score $OSU_NAME` | everyone | Get the score of an osu! user of the last mentioned beatmap |
| `!osuRequests` | everyone | Get if map requests are currently enabled and with which demands if there are any |
| `!osuRequests on/off ($MESSAGE)` | mod | Turn map requests on or off with an optional message |
| `!osuRequests set $OPTION $VALUE`, `!osuRequests unset $OPTION` | mod | Set map request demands/options (`arMax`, `arMin`, `csMax`, `csMin`, `detailed`, `lengthInMinMax`, `lengthInMinMin`, `redeemId`, `starMax`, `starMin`) or unset them back to their default value |
| `!osuLastRequest ($COUNT)` | mod | Resend the last request (or multiple if `$COUNT` is provided) in case of a osu! client restart |
| `!osuPermitRequest` | mod | Permit the last blocked map request |
| `!osu commands` | everyone | See all (other) available/enabled osu! commands |

**If optionally enabled** beatmap links in chat can be recognized and print map information (and if existing the top score on the map) to the chat.
**Given an osu! IRC login and osu! name** it can even send these recognized beatmap links to the osu! client of the specified osu! name.
**If demands are set** they will block map requests from coming through.
(The latest blocked map request can still be permitted using the `!osuPermitRequest` command)

*Everything is currently optimized and written for osu! standard which means you need to open an issue if you want to use it with another game mode!*

**Every command can be optionally disabled.**

### Optional: Spotify

**Given a Spotify client ID/secret** the bot can additionally fetch some Spotify related information.

After a successful authentication (the bot will automatically open a website for the authentication) you will be able to copy the access and refresh token so next time the authentication does not necessarily need to be repeated in the browser.

| Command | Permissions | Description |
| ------ | -- | -------- |
| `!song` | everyone | Get the currently playing song title/artist and album (if not a single) as well as the same information about the 2 previously played songs |
| `!spotify commands` | everyone | See all (other) available/enabled Spotify commands |

**Every command can be optionally disabled.**

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

This program has per default the ability to add/edit/delete custom commands and custom broadcasts using the chat.
The commands and broadcasts are persistently saved in a database.

Custom commands will be checked for every new message.
Custom broadcasts will be scheduled at start of the bot and rescheduled on any change.

| Command | Permissions | Description |
| ------ | -- | -------- |
| `!addcc ID REGEX MESSAGE`, `!addcc ID REGEX MESSAGE -ul=mod -cd=10` | mod | Add a command with an ID, a RegEx expression to detect it and capture contents of the match ([regex101.com](https://regex101.com/)) and a message - Optionally a cooldown (in s) and user level (broadcaster, mod, vip, none) are also supported |
| `!editcc PROPERTY NEW_VALUE` | mod | A single property (cooldownInS, count, description, id, message, regex, userLevel) can be edited of an existing command |
| `!delcc ID` | mod | Using the command ID an added command can be deleted |
| `!listccs ($OFFSET/$ID)` | everyone | List all added commands (an offset number can be provided if multiple were added or an ID can be provided to only list one specific command) |
| `!addcb ID CRON_STRING MESSAGE` | mod | Add a broadcast with an ID, a cron expression to determine when the broadcast should be sent ([crontab.cronhub.io](https://crontab.cronhub.io/)) and a message |
| `!editcb PROPERTY NEW_VALUE` | mod | A single property (cronString, description, id, message) can be edited of an existing broadcast |
| `!delcb ID` | mod | Using the broadcast ID an added broadcast can be deleted |
| `!listcbs ($OFFSET/$ID)` | everyone | List all added callbacks (an offset number can be provided if multiple were added or an ID can be provided to only list one specific broadcast) |
| `!cccb commands` | everyone | See all (other) available/enabled custom commands/broadcasts commands |

An example file for this is [`customCommandsBroadcasts.example.txt`](./customCommandsBroadcasts.example.txt).

The custom commands/broadcasts messages use a custom message parser so next to *normal text* they can contain advanced logic.
The supported logic is documented in the [previous section](#default-custom-textstringsmessages).

A specific group of plugins that only custom commands/broadcasts support are global custom data plugins.
They enable to store persistently a text, number or a list of them in a database and change them or run operations on them (there are useful real life examples of this in the previously mentioned example file).

**Every command can be optionally disabled.**

### Optional: Lurk

A custom lurk command can be enabled that welcomes back chatters after they are gone for at least 3 min.

| Command | Permissions | Description |
| ------ | -- | -------- |
| `!lurk` | everyone | Become a lurker |

**Every command can be optionally disabled.**

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

6. Provide the necessary environment variables or a `.env` file in the source code directory with the following information:

   You can copy the [`.env.example`](./.env.example) file, rename it to `.env` and then edit the "variables" in there.
   The file contains also the information about what variables need to be set.

   - Detailed list of steps to get a Twitch OAuth token:

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

   Per default critical values like for example the Twitch OAuth-token will be censored so screenshots or screen-sharing can't leak this information.
   This censoring can be disabled by passing an additional command line argument which can be helpful in case of debugging:

   ```sh
   npm run start -- --no-censoring
   # or
   node . --no-censoring
   ```

### Binary releases

There is now a way to use the program without needing to install or build anything.
You can download a binary for your operating system from the [latest release](https://github.com/AnonymerNiklasistanonym/MoonpieBot/releases) and then just run it.

All other rules from the previous section still apply, it's just that you don't have to install or build anything.
You still need to have environment variables or a `.env` file in the same directory etc.

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
The default location of the configuration/database/etc. files is `%APPDATA%\MoonpieBot`.

### Package managers

#### Pacman

On Linux systems with `pacman` as their package manager (like Arch/Manjaro Linux) there is a way to install the program by using a `PKGBUILD` file.
For more information check the [installer `README.md`](./installer/README.md).
The default location of the configuration/database/etc. files is `$HOME/.local/share/moonpiebot`.

## Migrate to a new version

---

**IMPORTANT:**

Migrating to a new version CAN break the database, custom commands, etc.
This means you should always backup (or don't overwrite) your old configuration file (`.env`), database file (`moonpie.db`) and custom commands/timers (`customCommands/Timers.json`).
In case of a bug or error this means you can always go back to how it was before and lose nothing.

In case there will be a database change I will try to migrate that on the software side but even if this is not happening it should be listed in this section what the breaking change was.

---

1. In case of new dependencies always rerun:

   ```sh
   npm install
   ```

2. Then you need to rebuild the program:

   ```sh
   npm run build
   ```

3. You need to check if there were any breaking changes that require an update of the configuration file (`.env`), break the database structure or break custom commands/timers (`customCommands/Timers.json`).
4. If everything checks out you can start it just like before:

   ```sh
   npm run start
   ```

   After following all those steps you don't need to to the previous steps any more until there is an update.

## Examples

In the following there is a list of some possible configurations (`.env` files):

**For more details about the options check the example file [`.env.example`](./.env.example)**

1. Default *Moonpie commands* bot configuration:

   ```sh
   # Variables necessary for the Twitch chat (read/write) connection
   MOONPIE_CONFIG_TWITCH_NAME=moonpiebot
   MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN=oauth:abcdefghijklmnop
   MOONPIE_CONFIG_TWITCH_CHANNELS=moonpiechannel anothermoonpiechannel
   ```

   - Supports all moonpie commands
   - Supports simple custom commands/timers that don't need special APIs in their messages

2. osu! StreamCompanion *Now Playing* bot configuration:

   ```sh
   # Variables necessary for the Twitch chat (read/write) connection
   MOONPIE_CONFIG_TWITCH_NAME=moonpiebot
   MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN=oauth:abcdefghijklmnop
   MOONPIE_CONFIG_TWITCH_CHANNELS=moonpiechannel anothermoonpiechannel

   # Variable necessary for the StreamCompanion connection
   MOONPIE_CONFIG_OSU_STREAM_COMPANION_URL=localhost:20727

   # Disable default moonpie commands
   MOONPIE_CONFIG_MOONPIE_ENABLE_COMMANDS=none
   # Only enable the !np osu command
   MOONPIE_CONFIG_OSU_ENABLE_COMMANDS=np
   ```

   - Disables default moonpie commands
   - Supports the osu! related now playing "!np" command which will use the StreamCompanion information
   - Supports simple custom commands/timers that don't need special APIs in their messages

3. Default *Moonpie, osu! and Spotify commands* bot configuration: (***lune***)

   ```sh
   # Variables necessary for the Twitch chat (read/write) connection
   MOONPIE_CONFIG_TWITCH_NAME=moonpiebot
   MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN=oauth:abcdefghijklmnop
   MOONPIE_CONFIG_TWITCH_CHANNELS=moonpiechannel anothermoonpiechannel

   # Variables necessary to use the osu! API
   MOONPIE_CONFIG_OSU_API_CLIENT_ID=1234
   MOONPIE_CONFIG_OSU_API_CLIENT_SECRET=dadasfsafsafdsadffasfsafasfa
   # Variable of the user that should be checked for top scores
   MOONPIE_CONFIG_OSU_API_DEFAULT_ID=1185432
   # Variables that enables osu! beatmap requests (with detailed map information)
   MOONPIE_CONFIG_OSU_API_RECOGNIZE_MAP_REQUESTS=ON
   MOONPIE_CONFIG_OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED=ON

   # Variables necessary to send recognized beatmaps to the osu! client via IRC
   MOONPIE_CONFIG_OSU_IRC_PASSWORD=senderServerPassword
   MOONPIE_CONFIG_OSU_IRC_USERNAME=senderUserName
   MOONPIE_CONFIG_OSU_IRC_REQUEST_TARGET=receiverUserName

   # Variable necessary for the StreamCompanion connection
   MOONPIE_CONFIG_OSU_STREAM_COMPANION_URL=localhost:20727

   # Enable custom commands to make use of some Twitch API connections
   MOONPIE_CONFIG_TWITCH_API_CLIENT_ID=abcdefghijklmnop
   MOONPIE_CONFIG_TWITCH_API_ACCESS_TOKEN=abcdefghijklmnop

   # Enable Spotify API connections and the !song command
   MOONPIE_CONFIG_SPOTIFY_API_CLIENT_ID=abcdefghijklmnop
   MOONPIE_CONFIG_SPOTIFY_API_CLIENT_SECRET=abcdefghijklmnop
   MOONPIE_CONFIG_SPOTIFY_API_REFRESH_TOKEN=abcdefghijklmnop
   ```

   - Supports all moonpie commands
   - Supports beatmap requests in chat which will use the osu! API
   - Supports the osu! related now playing "!np" command which will use the StreamCompanion information
   - Supports the osu! related most recent play "!rp" command which will use the osu! API
   - Supports the osu! related "!osuRequests" command which can toggle if beatmap requests are on(=default) or off
   - Supports simple custom commands/timers that don't need special APIs in their messages
   - Supports advanced custom commands/timers that need access to a special Twitch API in their messages (set/get a game/title or the follow-age)
   - Supports a Spotify related !song command for getting the currently played song

4. Simple bot that can make use of the Twitch API (for getting the game of a channel or followage) in custom commands configuration:

   ```sh
   # Variables necessary for the Twitch chat (read/write) connection
   MOONPIE_CONFIG_TWITCH_NAME=moonpiebot
   MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN=oauth:abcdefghijklmnop
   MOONPIE_CONFIG_TWITCH_CHANNELS=moonpiechannel anothermoonpiechannel

   # Disable default moonpie commands
   MOONPIE_CONFIG_MOONPIE_ENABLE_COMMANDS=none

   # Enable custom commands to make use of some Twitch API connections
   MOONPIE_CONFIG_TWITCH_API_CLIENT_ID=abcdefghijklmnop
   MOONPIE_CONFIG_TWITCH_API_ACCESS_TOKEN=abcdefghijklmnop
   ```

   - Disables default moonpie commands
   - Supports advanced custom commands/timers that need access to a special Twitch API in their messages (set/get a game/title or the follow-age)

5. osu! map requests and recent play bot configuration: (***geo***)

   ```sh
   # Variables necessary for the Twitch chat (read/write) connection
   MOONPIE_CONFIG_TWITCH_NAME=moonpiebot
   MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN=oauth:abcdefghijklmnop
   MOONPIE_CONFIG_TWITCH_CHANNELS=moonpiechannel anothermoonpiechannel

   # Disable default moonpie commands
   MOONPIE_CONFIG_MOONPIE_ENABLE_COMMANDS=none
   # Only enable the !rp and !osuRequests osu! command
   MOONPIE_CONFIG_OSU_ENABLE_COMMANDS=rp,requests

   # Variables necessary to use the osu! API
   MOONPIE_CONFIG_OSU_API_CLIENT_ID=1234
   MOONPIE_CONFIG_OSU_API_CLIENT_SECRET=dadasfsafsafdsadffasfsafasfa
   # Variable of the user that should be checked for top scores
   MOONPIE_CONFIG_OSU_API_DEFAULT_ID=1185432
   # Variables that enables osu! beatmap requests (with detailed map information)
   MOONPIE_CONFIG_OSU_API_RECOGNIZE_MAP_REQUESTS=ON
   MOONPIE_CONFIG_OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED=ON

   # Variables necessary to send recognized beatmaps to the osu! client via IRC
   MOONPIE_CONFIG_OSU_IRC_PASSWORD=senderServerPassword
   MOONPIE_CONFIG_OSU_IRC_USERNAME=senderUserName
   MOONPIE_CONFIG_OSU_IRC_REQUEST_TARGET=receiverUserName
   ```

   - Disables default moonpie commands
   - Supports beatmap requests in chat which will use the osu! API
   - Supports the osu! related most recent play "!rp" command which will use the osu! API
   - Supports the osu! related "!osuRequests" command which can toggle if beatmap requests are on(=default) or off
   - Supports simple custom commands/timers that don't need special APIs in their messages

## Implementation

Not every detail but the big components on which this bot is made of:

- Node.js
- Typescript
- Node.js dependencies:
  - Production:
    - Non optional features:
      - `dotenv` (for reading in environment variables config)
      - `sqlite3` (for a persistent database)
      - `tmi.js` (for the Twitch chat connection)
      - `winston` (for logging to a file)
    - Optional features:
      - `@twurple/api`/`@twurple/auth` (Twitch API connection for message macros)
      - `csv-parser` (Windows window title output parsing)
      - `irc` (connect to osu! client via IRC protocol)
      - `node-cron` (run timers based on cron strings)
      - `osu-api-v2` (connect to the osu! API v2)
      - `spotify-web-api-node` (connect to the Spotify API)
      - `open` (open the browser to setup the initial Spotify API connection refresh token)
      - `reconnecting-websocket` (connect to the StreamCompanion websocket server)
  - Development:
    - `eslint` (for code format and linting)
    - `mocha` (for tests)
    - `nodemon` (live restart of bot after changes have been made)
    - `nyc` (for code coverage)
    - `prettier` (for code format)
    - `typedoc` (for HTML documentation)

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
