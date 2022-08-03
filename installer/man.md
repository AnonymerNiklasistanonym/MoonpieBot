% MoonpieBot(1) moonpiebot 1.0.16b
% AnonymerNiklasistanonym
% August 2022

# NAME

moonpiebot - A custom Twitch chat bot.

# SYNOPSIS

**moonpiebot** [*OPTIONS*]

# DESCRIPTION

Running this program will start a Twitch connected bot using information provided by either environment variables, a *.env* file in the same directory or given a **----config-dir** argument a *.env* file in the specified directory. Additionally log files and the database are written to this directory if not specified otherwise. In this directory can optionally a JSON file for custom commands (*customCommands.json*) and custom timers (*customTimers.json*) be specified.

If this program is installed via a package it will use *$HOME/.local/share/moonpiebot* as the default **----config-dir**.

# OPTIONS

**----config-dir** *CONFIG_DIR*
: The directory that should contain all configurations and databases if not configured otherwise

**----disable-censoring**
: Disabling the censoring stops the censoring of private tokens which is helpful to debug if the inputs are read correctly but should otherwise be avoided

**----help**
: Get instructions on how to run and configure this program

**----version**
: Get the version of the program

# BUGS

Bugs are tracked in GitHub Issues: https://github.com/AnonymerNiklasistanonym/MoonpieBot/issues

# COPYRIGHT

MoonpieBot is available under the MIT license.

See https://github.com/AnonymerNiklasistanonym/MoonpieBot/blob/main/LICENSE for the full license text.

# SEE ALSO

Website and Documentation: https://anonymerniklasistanonym.github.io/MoonpieBot/

GitHub repository and issue tracker: https://github.com/AnonymerNiklasistanonym/MoonpieBot
