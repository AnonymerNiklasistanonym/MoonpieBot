#!/usr/bin/env pwsh

# Install the following things first:
# - Node.js

Write-Host "---------------------------------------------------------"
Write-Host "Install and Build [Windows]:"
Write-Host "---------------------------------------------------------"

# Display node/npm version
Write-Host "node:"
node --version
Write-Host "npm:"
npm --version

# Go to the location of this directory even if the script is being run from
# somewhere else
Set-Location $PSScriptRoot
# Go to the root directory of this repository
Set-Location ..

# Install all dependencies and build the bot
Remove-Item "node_modulesa" -Recurse -ErrorAction Ignore
npm install "https://github.com/mapbox/node-sqlite3/tarball/master"
npm install
npm run build
npm prune --production
