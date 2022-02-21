#!/usr/bin/env pwsh

# Install the following things first:
# - Git

Write-Host "---------------------------------------------------------"
Write-Host "Update source code [Windows]:"
Write-Host "---------------------------------------------------------"

# Display git version
Write-Host "git:"
git --version

# Go to the location of this directory even if the script is being run from
# somewhere else
Set-Location $PSScriptRoot
# Go to the root directory of this repository
Set-Location ..

# Update git repository
git pull
