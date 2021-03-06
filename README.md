# MoonpieBot

[![github release](https://img.shields.io/github/release/AnonymerNiklasistanonym/MoonpieBot.svg?label=current+release)](https://github.com/AnonymerNiklasistanonym/MoonpieBot/releases)
[![CI](https://github.com/AnonymerNiklasistanonym/MoonpieBot/actions/workflows/nodejs.yml/badge.svg)](https://github.com/AnonymerNiklasistanonym/MoonpieBot/actions/workflows/nodejs.yml)
![](./coverage.svg)

A custom Twitch chat bot.

![MoonpieBot icon](res/icons/moonpiebot.png)

**ATTENTION: You need a runtime that implements `fetch` which means you need for example [Node.js v18+](https://nodejs.org/ko/blog/announcements/v18-release-announce/).**

- [Features](#features)
  - [Optional: osu!](#optional-osu)
  - [Optional: Spotify](#optional-spotify)
  - [Optional: Custom commands/timers](#optional-custom-commandstimers)
  - [Optional: Custom strings/messages](#optional-custom-stringsmessages)
- [Setup](#setup)
  - [Build it yourself](#build-it-yourself)
  - [Binary releases](#binary-releases)
    - [Linux](#linux)
    - [Windows](#windows)
  - [Package managers](#package-managers)
    - [Pacman](#pacman)
- [Migrate to a new version](#migrate-to-a-new-version)
- [Helping Resources](#helping-resources)
- [Examples](#examples)
- [TODOs](#todos)
- [Implementation](#implementation)
- [Inspect Database](#inspect-database)
- [Development](#development)
  - [Tests](#tests)
  - [Configuration files](#configuration-files)
  - [How to handle versions](#how-to-handle-versions)
  - [Documentation](#documentation)
- [Credits](#credits)

## Features

Given a Twitch account name, a connected OAuth token and the channel name where the bot should be deployed will imitate the given account in the given channel.

- Every day a user can claim a *moonpie* and the count is saved in a persistent database:

  | Command | Permissions | Description |
  | ------ | -- | -------- |
  | `!moonpie` | everyone | (If not already claimed) Claim a moonpie and return the current count and the leaderboard position |
  | `!moonpie leaderboard` | everyone | Show the top 15 moonpie holders |
  | `!moonpie get $USER` | everyone | Return the current count and the leaderboard position of `$USER` if found in database |
  | `!moonpie about` | everyone | Show the version and source code link of the bot |
  | `!moonpie add $USER $COUNT` | broadcaster badge | Add moonpie `$COUNT` to `$USER` if found in database |
  | `!moonpie remove $USER $COUNT` | broadcaster badge | Remove moonpie `$COUNT` to `$USER` if found in database |
  | `!moonpie set $USER $COUNT` | broadcaster badge | Set moonpie `$COUNT` to `$USER` if found in database |
  | `!moonpie delete $USER` | broadcaster badge | Delete a `$USER` from the database if found in database |

Every command can be optionally disabled.

### Optional: osu!

Given an osu! OAuth client ID/secret and a default (streamer) Osu ID the bot can additionally fetch some osu! related information.

| Command | Permissions | Description |
| ------ | -- | -------- |
| `!rp ($OSU_ID/$OSU_NAME)` | everyone | Get the most recent play of the streamer or of the given osu! player ID |
| `!pp ($OSU_ID/$OSU_NAME)` | everyone | Get general account information (pp, rank, country, ...) of the streamer or of the given osu! player ID |
| `!np` | everyone | Get a link to the currently being played map (this can be either done by using the osu! window text [default, slow and only works if the map is being played] or if [StreamCompanion](https://github.com/Piotrekol/StreamCompanion) is configured and running it can use this information instead which works always, is very fast and contains detailed information even regarding the current selected mods) |

Every command can be optionally disabled.

It also can recognize beatmap links in chat and print map information (and if existing the top score on the map) to the chat if enabled.
(This can be temporarily turned off/on with the commands `!osu requests on`/`!osu requests off [Optional reason]` and `!osu requests` can be used to get the current status)
Given an osu! IRC login it can even send these beatmap links to the osu! client.

It is also possible that only the `!np` command is enabled when a StreamCompanion URL (`localhost:20727`) can be found in the configuration even if no other osu! related configurations is set.

*Everything is currently optimized and written for osu! standard which means you need to open an issue if you need other behaviour!*

### Optional: Spotify

Given a Spotify client ID/secret the bot can additionally fetch some Spotify related information.

After a successful authentication (the bot will automatically open a website for the authentication) you will be able to copy the access and refresh token so next time the authentication does not necessarily need to be repeated in the browser.

| Command | Permissions | Description |
| ------ | -- | -------- |
| `!song` | everyone | Get the currently playing song title/artist and album (if not a single) as well as the same information about the 2 previously played songs |

Every command can be optionally disabled.

### Optional: Custom commands/timers

A file called `customCommands.json` can be provided that enables to write custom commands of the style:

```json
{
    "name": "Command name",
    "channels": [
        "#channelName"
    ],
    "message": "Text $(macroName) $(macroName-macroArg-macroArg=macroValue)",
    "regexString": "!regexExpression",
    "count": 2,
    "userLevel": "everyone"
}
```

An example file for this is [`customCommands.example.json`](./customCommands.example.json).

A file called `customTimers.json` can be provided that enables to write custom timers of the style:

```json
{
    "name": "Timer name",
    "channels": [
        "#channelName"
    ],
    "message": "Text $(macroName) $(macroName-macroArg-macroArg=macroValue)",
    "cronString": "*/30 * * * * *"
}
```

An example file for this is [`customTimers.example.json`](./customTimers.example.json).

For some macros to work (like Twitch API connections for `!so`/`!followage`/`!settitle`/`!setgame`) additional Twitch API credentials need to be provided.

### Optional: Custom strings/messages

Most messages can be customized to a high degree using a custom message parser that can also easily be extended consisting of plugins and macros.

The idea is that instead of a final message (in English) there is a way to replace the default string with a custom one.
Important variables and values will then at runtime be parsed and inserted into the string.

To do this there are:

- Macros: `%MACRO_TITLE:MACRO_NAME%` that simply get replaced with a string value
- Plugins: `$(PLUGIN=OPTIONAL_PLUGIN_VALUE|OPTIONAL_PLUGIN_SCOPE)` that can for example evaluate a request like for example setting the stream title or evaluating if the plugin scope text should be displayed in respect to the plugin value
- References: `$[STRING_REFERENCE]` that simply reference another string that will then be inserted

To override the default strings and add custom ones you can create a `.env.strings` file ([there is an example for the file](./.env.strings.example) where all the default values are listed and can be uncommented and edited).

## Setup

### Build it yourself

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
     2. Visit the webpage https://twitchapps.com/tmi/
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

**IMOPRTANT:**

Migrating to a new version CAN break the database, custom commands, etc.
This means you should always backup (or don't overwrite) your old configuration file (`.env`), database file (`moonpie.db`) and custom commands/timers (`customCommands/Timers.json`).
In case of a bug or error this means you can always go back to how it was before and lose nothing.

In case there will be a dabase change I will try to migrate that on the software side but even if this is not happening it should be listed in this section what the breaking change was.

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

## Helping Resources

To add custom commands a regex needs to be created.
For easily testing a custom regex you can use https://regex101.com/.

To add custom timers a cron string needs to be created.
For easily seeing to what a cron string resolves to you can use https://crontab.cronhub.io/.

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

3. Default *Moonpie commands and osu! commands* bot configuration: (***lune***)

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
   # Variables that enables osu beatmap requests (with detailed map information)
   MOONPIE_CONFIG_OSU_API_RECOGNIZE_MAP_REQUESTS=ON
   MOONPIE_CONFIG_OSU_API_RECOGNIZE_MAP_REQUESTS_DETAILED=ON

   # Variables necessary to send recognized beatmaps to the osu! client via IRC
   MOONPIE_CONFIG_OSU_IRC_PASSWORD=senderServerPassword
   MOONPIE_CONFIG_OSU_IRC_USERNAME=senderUserName
   MOONPIE_CONFIG_OSU_IRC_REQUEST_TARGET=receiverUserName

   # Variable necessary for the StreamCompanion connection
   MOONPIE_CONFIG_OSU_STREAM_COMPANION_URL=localhost:20727

   # Only enable the !np and !rp osu command
   MOONPIE_CONFIG_OSU_ENABLE_COMMANDS=np,rp
   ```

   - Supports all moonpie commands
   - Supports beatmap requests in chat which will use the osu! API
   - Supports the osu! related now playing "!np" command which will use the StreamCompanion information
   - Supports the osu! related most recent play "!rp" command which will use the osu! API
   - Supports simple custom commands/timers that don't need special APIs in their messages

4. Simple bot that can recognize advanced custom commands configuration:

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

5. osu! map request and recent play bot configuration: (***geo***)

   ```sh
   # Variables necessary for the Twitch chat (read/write) connection
   MOONPIE_CONFIG_TWITCH_NAME=moonpiebot
   MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN=oauth:abcdefghijklmnop
   MOONPIE_CONFIG_TWITCH_CHANNELS=moonpiechannel anothermoonpiechannel

   # Disable default moonpie commands
   MOONPIE_CONFIG_MOONPIE_ENABLE_COMMANDS=none
   # Only enable the !rp osu command
   MOONPIE_CONFIG_OSU_ENABLE_COMMANDS=rp

   # Variables necessary to use the osu! API
   MOONPIE_CONFIG_OSU_API_CLIENT_ID=1234
   MOONPIE_CONFIG_OSU_API_CLIENT_SECRET=dadasfsafsafdsadffasfsafasfa
   # Variable of the user that should be checked for top scores
   MOONPIE_CONFIG_OSU_API_DEFAULT_ID=1185432
   # Variables that enables osu beatmap requests (with detailed map information)
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
   - Supports simple custom commands/timers that don't need special APIs in their messages

## TODOs

Things that need to be added before it can be released:

- [ ] Database
  - [ ] (*not important*) Add more tests
  - [ ] (*not important*) Add better `ROW_NUMBER () OVER ()` integration
  - [ ] (*not important*) Add better `lower()` integration
- [ ] Commands:
  - [ ] (*not important*) Add admin integration
    - [ ] `!moonpie add-admin $USER`
    - [ ] `!moonpie remove-admin $USER`
- [ ] Clean code and code comments
- [ ] (*not important*) Check if the bot can see if a stream is happening and otherwise blocking claiming moonpies
- [ ] (*not important*) Add cooldown environment variable

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
  - Development:
    - `eslint` (for code format and linting)
    - `mocha` (for tests)
    - `nodemon` (live restart of bot after changes have been made)
    - `nyc` (for code coverage)
    - `prettier` (for code format)

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

- TypeScript: `.tsconfig.json`, `.tsconfig.eslint` (special script for linting tests)
- ESLint (linting): `.eslintrc.json`, `.eslintignore`
- Mocha (testing): `.mocharc.json`
- Istanbul (code coverage): `.nycrc`
- Nodemon (automatically recompile project on changes): `nodemon.json`

### How to handle versions

For releases set the version in [`src/version.ts`](src/version.ts) to `beta: false` and then run `npm version patch`/`minor`/`major`.
When working on the code after that change set the version in [`src/version.ts`](src/version.ts) to `beta: true` and the version to what is expected to be the next version.

To push the git tag created by `npm` run `git push origin <tag_name>`.

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
