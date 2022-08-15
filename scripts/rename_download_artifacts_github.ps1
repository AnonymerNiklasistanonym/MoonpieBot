#!/usr/bin/env pwsh

param([string]$CustomVersion)

$ErrorActionPreference = "Stop"

Write-Host "---------------------------------------------------------"
Write-Host "Rename Downloaded Artifacts GitHub [Windows/Linux]:  <Powershell>"
Write-Host "---------------------------------------------------------"

# Get the current directory
$CallDir = $pwd
# Go to the location of this directory even if the script is being run from
# somewhere else
Set-Location $PSScriptRoot
# Go to the root directory of this repository
Set-Location ..

# Create directory for binary files
$BinaryDir = Join-Path "bin" "github_binaries"
Remove-Item -Recurse -Force $BinaryDir -ErrorAction Ignore
New-Item -ItemType Directory -Force -Path $BinaryDir
# Get the default download directory
$DownloadDir = (New-Object -ComObject Shell.Application).NameSpace('shell:Downloads').Self.Path
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

function Extract-Artifact {

    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string]$ArtifactFileName,
        [Parameter(Mandatory)]
        [string]$ExtractedArtifactFileName,
        [Parameter(Mandatory)]
        [string]$BinaryOutputDir,
        [Parameter(Mandatory)]
        [string]$BinaryOutputFileName,
        [Parameter(Mandatory,ValueFromRemainingArguments)]
        [string[]]$ArtifactDirs
    )

    # Get artifact directory
    $ArtifactDir = $null
    Foreach ($Directory in $ArtifactDirs) {
        if (Test-Path -Path (Join-Path $Directory $ArtifactFileName) -PathType Leaf) {
            $ArtifactDir = $Directory
        }
    }
    if (!$ArtifactDir) {
        throw "$ArtifactFileName could not be located."
    }
    Write-Output "$ArtifactFileName was located in $ArtifactDir"

    # Remove old extracted file
    $BinaryFile = Join-Path $BinaryOutputDir $ExtractedArtifactFileName
    $BinaryOutputFile = Join-Path $BinaryOutputDir $BinaryOutputFileName
    Remove-Item $BinaryFile -ErrorAction Ignore
    Remove-Item $BinaryOutputFile -ErrorAction Ignore
    # Extract binary files and rename them
    $ArtifactFile = Join-Path $ArtifactDir $ArtifactFileName
    Write-Output "Extract $BinaryFile from $ArtifactFile"
    Expand-Archive $ArtifactFile -DestinationPath $BinaryOutputDir -Force
    Write-Output "Rename $BinaryFile to $BinaryOutputFile"
    Rename-Item -Path $BinaryFile -NewName $BinaryOutputFileName
}

Extract-Artifact -ArtifactFileName "$ApplicationName-installer-windows-node-18.x.zip" `
                 -ExtractedArtifactFileName "${ApplicationName}_setup.exe" `
                 -BinaryOutputDir $BinaryDir  `
                 -BinaryOutputFileName "$ApplicationName-installer-v$CurrentVersion-win64-node-18.exe" `
                 $DownloadDir
Extract-Artifact -ArtifactFileName "$ApplicationName-windows-node-18.x.zip" `
                 -ExtractedArtifactFileName "$ApplicationName.exe" `
                 -BinaryOutputDir $BinaryDir `
                 -BinaryOutputFileName "$ApplicationName-v$CurrentVersion-win64-node-18.exe" `
                 $DownloadDir
Extract-Artifact -ArtifactFileName "$ApplicationName-linux-node-18.x.zip" `
                 -ExtractedArtifactFileName "$ApplicationName" `
                 -BinaryOutputDir $BinaryDir `
                 -BinaryOutputFileName "$ApplicationName-v$CurrentVersion-linux64-node-18" `
                 $DownloadDir
Extract-Artifact -ArtifactFileName "$ApplicationName-man-page.zip" `
                 -ExtractedArtifactFileName "$ApplicationName-man.1" `
                 -BinaryOutputDir $BinaryDir `
                 -BinaryOutputFileName "$ApplicationName-v$CurrentVersion-man.1" `
                 $DownloadDir

# Go back to the call directory
Set-Location $CallDir

# Wait for any input before closing the window
Write-Host "`n>> The script has finished. Press any key to close the window."
[Console]::ReadKey()
