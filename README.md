# MoonpieBot

A custom twitch bot

## Setup

1. Install a recent version of [nodejs](https://nodejs.org/en/download/)
2. Get the source code

   Either by cloning this repository via git:

   - Install [git](https://git-scm.com/downloads)
   - Open the console/terminal in the directory where you want to have the source code and run:

     ```sh
     # cd path/to/dir
     git clone "https://github.com/AnonymerNiklasistanonym/MoonpieBot.git"
     ```

   Or by downloading the source code:

   - Get the latest version from [here](https://github.com/AnonymerNiklasistanonym/MoonpieBot/archive/refs/heads/main.zip) or by using the [github website](https://github.com/AnonymerNiklasistanonym/MoonpieBot) (Click `Code` and then `Download ZIP`)

   Install [`git'](https://git-scm.com/downloads)
3. Open the directory of the cloned or downloaded source code in the console/terminal
   - Windows: Powershell/WindowsTerminal/...
   - Linux: xfce-terminal/...
4. Install all nodejs dependencies

   ```sh
   npm install
   ```

5. Build the bot (it needs to be compiled from TypeScript to JavaScript)

   ```sh
   npm run build
   ```

   If you want you can now also remove all dependencies that were installed to the `node_modules` directory that were only necessary to build the program and are not necessary for running the bot:

   ```sh
   # Keep in mind that if you want to update the bot after
   # the source code was updated you need to run
   # > npm install
   # again to get the development dependencies again
   npm prune --production
   ```

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

- [ ] Database
  - [ ] (*not important*) Add more tests
  - [ ] (*not important*) Add better `ROW_NUMBER () OVER ()` integration
  - [ ] (*not important*) Add better `lower()` integration
- [ ] Logging
  - [ ] Add daily rotating log file instead of one big file
- [ ] Commands:
  - [ ] `!moonpie delete $USER` (add integration on how to drop a user from the database without manual intervention)
  - [ ] (*not important*) Add admin integration
    - [ ] `!moonpie add-admin $USER`
    - [ ] `!moonpie remove-admin $USER`
- [ ] Clean code and code comments
- [ ] Find out what the bug is behind the database not being able to closed
- [ ] (*not important*) Check if the bot can see if a stream is happening and otherwise blocking claiming moonpies
- [ ] (*not important*) Add cooldown environment variable

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

- ESLint: `.eslintrc.json`, `.eslintignore`
- Mocha: `.mocharc.json`
- Istanbul: `.nycrc`
- Nodemon: `nodemon.json`
- Typescript: `tsconfig.json`
- Prettier: `.prettierrc`

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
