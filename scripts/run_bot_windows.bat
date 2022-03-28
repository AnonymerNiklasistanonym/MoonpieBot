:: Install the following things first:
:: - Node.js

@echo ---------------------------------------------------------
@echo Run [Windows]:
@echo (make sure that the necessary dependencies are already
@echo  installed and the program already built)
@echo ---------------------------------------------------------

:: Display node version
@echo node:
call node --version

:: Go to the root directory of this repository
cd ..

:: Run the bot
call node .

:: Wait for any input before closing the window
pause
