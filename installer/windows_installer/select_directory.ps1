Add-Type -AssemblyName System.Windows.Forms;
$FolderBrowse = New-Object System.Windows.Forms.OpenFileDialog -Property @{
    ValidateNames = $false;CheckFileExists = $false;
    RestoreDirectory = $true;
    FileName = 'Select folder';
    Title = 'DIALOG_TITLE';
};
$null = $FolderBrowse.ShowDialog();
$FolderName = Split-Path -Path $FolderBrowse.FileName;
Write-Output $FolderName
