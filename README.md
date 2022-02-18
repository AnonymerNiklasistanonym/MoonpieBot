# MoonpieBot

A custom twitch bot

## Setup

1. Install a recent version of [nodejs](https://nodejs.org/en/download/)
2. Clone this repository via git or download the source code
3. Open the directory of the cloned or downloaded source code in a terminal
   - Windows: Powershell
   - Linux: xfce-terminal or another one
4. Install all nodejs dependencies

   ```sh
   npm install
   ```

5. Build the bot (it needs to be compiled from TypeScript to JavaScript)

   ```sh
   npm run build
   ```

   *TODO: Think about adding a command to clean dev dependencies for a smaller footprint*

6. Provide the necessary environment variables or a [`.env`](./.env.example) file with the following information:

   ```sh
   # error, warn, info, debug
   MOONPIE_CONFIG_CONSOLE_LOG_LEVEL=info
   MOONPIE_CONFIG_FILE_LOG_LEVEL=debug

   # Get it from: https://twitchapps.com/tmi/
   MOONPIE_CONFIG_TWITCH_NAME=moonpiebot
   MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN=oauth:abcdefghijklmnop

   MOONPIE_CONFIG_TWITCH_CHANNEL=moonpiechannel

   MOONPIE_CONFIG_DB_FILEPATH=./database.db
   ```

7. Run the bot

   ```sh
   npm run start
   ```

   If there are errors you can probably find advanced log messages in the log files in the directory `logs` that is created while running the bot.

## TODOs

Things that need to be added before it can be released:

- [ ] Add GitHub Actions for tests and build
- [ ] Find out why the database can not be created and only be used which makes no sense
- [ ] Add database tests
- [ ] Add daily rotating log file
- [ ] Add commands for:
  - [ ] Add manual for all moonpie commands
  - [ ] Use Regex for parsing moonpie commands
    - [ ] `!moonpie xyz`
    - [ ] `!moonpie commands`
    - [ ] `!moonpie set $USER $NEW_COUNT`
    - [ ] `!moonpie add $USER $NUMBER_ADD`
    - [ ] `!moonpie remove $USER $NUMBER_REMOVE`
    - [ ] `!moonpie leaderboard`
    - [ ] `!moonpie get $USER`
    - [ ] `!moonpie add-admin $USER`
    - [ ] `!moonpie remove-admin $USER`
  - [ ] moonpie leaderboard [top 10] (also add leaderboard number to normal command)
  - [ ] moonpie custom count set by broadcasters and selected members (add MoonpieAdmin table)
- [ ] Clean code and code comments
- [ ] Test if it works on Windows
- [ ] Add simple to understand instructions
- [ ] Check if the bot can see if a stream is happening and otherwise blocking claiming moonpies

## Features

A bot that has the following functionality:

- Every day a user can claim a *moonpie* using the command `!moonpie`:

  Implementation:

  - SQLite database that keeps track of the twitch ID and the last time of the claimed moonpie so it's limited to once a day

Given as input:

- Twitch bot account
  - Name: `MOONPIE_CONFIG_TWITCH_NAME`
  - OAuthToken: `MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN`
- The Twitch channel where the bot is being run: `MOONPIE_CONFIG_TWITCH_CHANNEL`
- Sqlite3 database filepath: `MOONPIE_CONFIG_DB_FILEPATH`

## Implementation

- Node.js
- Typescript
- Dependencies:
  - Production:
    - `dotenv` (for reading in environment variables config)
    - `tmi.js` (for the Twitch connection)
    - `sqlite3` (for a persistent database)
    - `winston` (for logging to a file)
  - Development:
    - `nodemon` (restart program after changes have been made)
    - `mocha` (for tests)
    - `istanbul` (for code coverage)
    - `eslint` (for code format and linting)
    - `prettier` (for code format)

## Notes

## Get Twitch OAuth Token

1. Log into your twitch account in the browser.
2. Visit the webpage https://twitchapps.com/tmi/
3. Follow the instructions and click `Connect`
4. After enabling permission you get forwarded to a page where you can get the token

### Development

- The entry point of the app is `src/index.ts`
- A `.env` file should be created which is used for environment variables in the local dev environment
- `npm run dev` - start the app in development mode (it reads the local .env file)
- `npm run test:dev` - run tests locally (reads local .env)
- `npm run lint` - run eslint
- `npm run format` - run prettier
- `npm run build:dev` - build typescript with source maps and comments in code are kept
- `npm run mocha` - a helper npm script for running customised mocha command e.g. test a single file `npm run mocha -- file-name-or-pattern`

### Pre-Commit Hook

`eslint --cache --fix` is triggered before each commit. This command tries to fix linting errors when it is possible.

`eslint` has been configured to also check and fix formatting errors detected by `prettier`. (https://prettier.io/docs/en/integrating-with-linters.html)

### Pre-Push Hook

`npm run test:dev` is triggered before each push. Push will fail if tests fail or test coverage is below the threshold defined in `./.nycrc`.

`npm run audit` is triggered before each push. Push will fail if there are vulnerabilities in dependencies. You should run `npm audit fix` to fix the vulnerabilities and commit the changes before you push again.

### Debug Configurations for VS Code

[Run VS Code in Windows Subsystem for Linux](https://code.visualstudio.com/remote-tutorials/wsl/run-in-wsl)

Copy [launch.json](.vscode/launch.json) and [tasks.json](.vscode/tasks.json) from the [.vscode](.vscode) folder to your project's `.vscode` folder.

- `Start (NodeTS WSL)` - starts the app in debug mode
- `Test All (NodeTS WSL)` - run tests in debug mode
- `Test Current File (NodeTS WSL)` - run test on the current open/focused file e.g. if `someFile.test.ts` is the file in focus, and you pressed the "start debugging" button or Ctrl + F5, this command will run `mocha someFile.test.ts`

## Configuration Files

- ESLint: `.eslintrc.json` `.eslintignore`
- Mocha: `.mocharc.json`
- Istanbul: `.nycrc`
- Nodemon: `nodemon.json`
- Typescript: `tsconfig.json`
- Prettier: `.prettierrc`

### Production

Production commands do not read the `.env` file!

- `npm start` - start application
- `npm build` - compile typescript with no source maps and comments are removed from ts files
- `npm test` - run tests

## Credits

The following docs and websites were useful during the creation of this bot.

- Setup Typescript project:
  - [medium.com: Setting up Node.JS with Typescript, Nodemon, Eslint, Mocha and Istanbul by Daniel Gong](https://coolgk.medium.com/setting-up-node-js-with-typescript-nodemon-eslint-mocha-and-istanbul-111a77d84ea7)
- Twitch integration:
  - [twilio.com: Creating Twitch Chat Bots with Node.js by Sam Agnew](https://www.twilio.com/blog/creating-twitch-chat-bots-with-node-js)
- Database integration:
  - [sqlitetutorial.net: SQLite Node.js](https://www.sqlitetutorial.net/sqlite-nodejs/)
- Logging with winston:
  - [Winston Logger With Typescript Typescript by Kimserey](https://kimsereylam.com/typescript/2021/12/03/winston-logger-with-typescript.html)
