# MoonpieBot

A custom twitch bot

## Features

A bot that has the following functionality:

- Every day a user can claim a *moonpie*:

  Open Questions:

  - Is it only possible during the stream
  - Does the user automatically claim it or should they send a special message like `!claimMoonpie`

  Implementation:

  - SQLite database that keeps track of twitch ID and time of the claimed moonpie which should be enough information to work

  Future goals:

  - Encryption of database for privacy reasons

Given as input:

- Twitch account
  - name `MOONPIE_CONFIG_TWITCH_NAME`
  - key `MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN`
- Timezone `MOONPIE_CONFIG_TIMEZONE`
- Sqlite3 database filepath `MOONPIE_CONFIG_DB_FILEPATH`

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

- Setup Typescript project:
  - [medium.com: Setting up Node.JS with Typescript, Nodemon, Eslint, Mocha and Istanbul by Daniel Gong](https://coolgk.medium.com/setting-up-node-js-with-typescript-nodemon-eslint-mocha-and-istanbul-111a77d84ea7)
- Twitch integration:
  - [twilio.com: Creating Twitch Chat Bots with Node.js by Sam Agnew](https://www.twilio.com/blog/creating-twitch-chat-bots-with-node-js)
- Database integration:
  - [sqlitetutorial.net: SQLite Node.js](https://www.sqlitetutorial.net/sqlite-nodejs/)
- Logging with winston:
  - [Winston Logger With Typescript Typescript by Kimserey](https://kimsereylam.com/typescript/2021/12/03/winston-logger-with-typescript.html)

## Get twitch token

1. Register your application at https://dev.twitch.tv/console/apps/create
2. After registering copy the client ID from this website
