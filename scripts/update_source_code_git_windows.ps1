#!/usr/bin/env pwsh

# Install the following things first:
# - Git

Write-Host "---------------------------------------------------------"
Write-Host "Update source code [Windows]:"
Write-Host "---------------------------------------------------------"

# Display git version
Write-Host "git:"
git --version

# Get the current directory
$CallDir = $pwd
# Go to the location of this directory even if the script is being run from
# somewhere else
Set-Location $PSScriptRoot
# Go to the root directory of this repository
Set-Location ..

# Reset package.json files
git checkout main -- "package.json"
git checkout main -- "package-lock.json"
# Update git repository
git pull

# Go back to the call directory
Set-Location $CallDir

# Wait for any input before closing the window
Write-Host "`n>> The script has finished. Press any key to close the window."
[Console]::ReadKey()
