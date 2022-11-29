#!/usr/bin/env pwsh

param([string]$CustomVersion)

$ErrorActionPreference = "Stop"

Write-Host "---------------------------------------------------------"
Write-Host "Rename Downloaded Artifacts GitHub Actions [Windows/Linux]:  <Powershell>"
Write-Host "---------------------------------------------------------"

# Get the current directory
$CallDir = $pwd
# Go to the location of this directory even if the script is being run from
# somewhere else
Set-Location $PSScriptRoot
# Go to the root directory of this repository
Set-Location ..

# Create directory for binary files
$BinaryDir = Join-Path "bin" "github_action_binaries"
Remove-Item -Recurse -Force $BinaryDir -ErrorAction Ignore
New-Item -ItemType Directory -Force -Path $BinaryDir
# Application and version information
$PackageJsonFile = "package.json"
$JsonDataMoonpieBot = Get-Content $PackageJsonFile | ConvertFrom-Json
$ApplicationName = $JsonDataMoonpieBot.name
if ($CustomVersion) {
    $CurrentVersion = $CustomVersion
    Write-Output "Found custom version $CurrentVersion from command line argument"
} else {
    $CurrentVersion = $JsonDataMoonpieBot.version
    Write-Output "Found version $CurrentVersion when reading $PackageJsonFile"
}

function Rename-Artifact {

    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string]$ArtifactFileDir,
        [Parameter(Mandatory)]
        [string]$ArtifactFileName,
        [Parameter(Mandatory)]
        [string]$NewArtifactFileName,
        [Parameter(Mandatory)]
        [string]$BinaryOutputDir
    )
    $BinaryFile = Join-Path $ArtifactFileDir $ArtifactFileName
    $BinaryFileMoved = Join-Path $BinaryOutputDir $ArtifactFileName
    $BinaryOutputFile = Join-Path $BinaryOutputDir $NewArtifactFileName
    Write-Output "Rename $BinaryFile to $BinaryOutputFile"
    Move-Item -Path $BinaryFile -Destination $BinaryOutputDir
    Rename-Item -Path $BinaryFileMoved -NewName $NewArtifactFileName
}

Rename-Artifact -ArtifactFileDir "$ApplicationName-installer-windows-node-19.x" `
                -ArtifactFileName "${ApplicationName}_setup.exe" `
                -NewArtifactFileName "$ApplicationName-installer-v$CurrentVersion-win64-node-18.exe" `
                -BinaryOutputDir $BinaryDir
Rename-Artifact -ArtifactFileDir "$ApplicationName-windows-node-19.x" `
                -ArtifactFileName "$ApplicationName.exe" `
                -NewArtifactFileName "$ApplicationName-v$CurrentVersion-win64-node-18.exe" `
                -BinaryOutputDir $BinaryDir
Rename-Artifact -ArtifactFileDir "$ApplicationName-linux-node-19.x" `
                -ArtifactFileName "$ApplicationName" `
                -NewArtifactFileName "$ApplicationName-v$CurrentVersion-linux64-node-18" `
                -BinaryOutputDir $BinaryDir
Rename-Artifact -ArtifactFileDir "$ApplicationName-man-page" `
                -ArtifactFileName "$ApplicationName-man.1" `
                -NewArtifactFileName "$ApplicationName-v$CurrentVersion-man.1" `
                -BinaryOutputDir $BinaryDir

# Go back to the call directory
Set-Location $CallDir
