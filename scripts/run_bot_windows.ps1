#!/usr/bin/env pwsh

# Install the following things first:
# - Node.js

Write-Host "---------------------------------------------------------"
Write-Host "Run [Windows]:"
Write-Host "(make sure that you that the necessary dependencies are"
Write-Host " already installed and the program already built)"
Write-Host "---------------------------------------------------------"

# Display node version
Write-Host "node:"
node --version

# Go to the location of this directory even if the script is being run from
# somewhere else
Set-Location $PSScriptRoot
# Go to the root directory of this repository
Set-Location ..

# Run the bot
node .
