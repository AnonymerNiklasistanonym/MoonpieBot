# MoonpieBot

A custom Twitch chat bot.

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

### Optional: Osu

Given an Osu OAuth client ID/secret and a default (streamer) Osu ID the bot can additionally fetch some Osu related information.

| Command | Permissions | Description |
| ------ | -- | -------- |
| `!rp ($OSU_ID)` | everyone | Get the most recent play of the streamer or of the given Osu player ID |
| `!pp ($OSU_ID)` | everyone | Get general account information (pp, rank, country, ...) of the streamer or of the given Osu player ID |

It also can recognize beatmap links in chat and print map information (and if existing the top score on the map) to the chat but this part can also be disabled.

## Setup

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

   ---

   On Windows you can install a special dependency first so the dependency [`sqlite3`](https://www.npmjs.com/package/sqlite3) can be installed without having its build tools (Python, Visual Studio with C++ environment, ...) installed which is also much faster:

   ```sh
   # source: https://www.npmjs.com/package/sqlite3#installing
   npm install https://github.com/mapbox/node-sqlite3/tarball/master
   ```

   ---

   To install all dependencies always run:

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
   ```

   If there are errors you can probably find advanced log messages in the log files in the directory `logs` that is created while running the bot.

## Helping Resources

To add custom commands a regex needs to be created.
For easily testing a custom regex you can use https://regex101.com/.

To add custom timers a cron string needs to be created.
For easily seeing to what a cron string resolves to you can use https://crontab.cronhub.io/.

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
    - `dotenv` (for reading in environment variables config)
    - `tmi.js` (for the Twitch connection)
    - `sqlite3` (for a persistent database)
    - `winston` (for logging to a file)
  - Development:
    - `nodemon` (live restart of bot after changes have been made)
    - `mocha` (for tests)
    - `nyc` (for code coverage)
    - `eslint` (for code format and linting)
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
