@echo off
set "PScommand="POWERSHELL Add-Type -AssemblyName System.Windows.Forms;$FolderBrowse = New-Object System.Windows.Forms.OpenFileDialog -Property @{ValidateNames = $false;CheckFileExists = $false;RestoreDirectory = $true;FileName = 'Select folder';Title = 'Select backup directory';};$null = $FolderBrowse.ShowDialog();$FolderName = Split-Path -Path $FolderBrowse.FileName;Write-Output $FolderName""
for /f "usebackq tokens=*" %%Q in (`%PScommand%`) do set SelectedBackupDir=%%Q
if "%SelectedBackupDir%"=="" (exit 0)
@echo on
moonpiebot.exe --config-dir "%APPDATA%\MoonpieBot" --create-backup "%SelectedBackupDir%" %*
pause press [enter]
