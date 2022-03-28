:: Install the following things first:
:: - Node.js

@echo ---------------------------------------------------------
@echo Build [Windows]:
@echo ---------------------------------------------------------

:: Display node/npm version
@echo node:
call node --version
@echo npm:
call npm --version

:: Go to the root directory of this repository
cd ..

:: Install all dependencies and build the bot
rmdir /s /q node_modules
call npm install
call npm run build
call npm prune --production

:: Wait for any input before closing the window
pause
