; Windows Installer

;--------------------------------
;Include Modern UI

  !include "MUI2.nsh"

;--------------------------------
;Include Custom Dialog creator

  !include "nsDialogs.nsh"

;--------------------------------
;Include External Config File (that contains name, version, ...)

  !include "windows_installer_config.nsi"

;--------------------------------
;Include External Logic File To Run Previous Uninstaller If Detected

  !include "windows_installer_run_previous_uninstaller.nsi"

;--------------------------------
;General Settings

  ;Properly display all languages
  Unicode true

  ;Show 'console' in installer and uninstaller
  ShowInstDetails "show"
  ShowUninstDetails "show"

  ;Set name and output file
  Name "${PRODUCT}"
  OutFile "..\..\bin\${PRODUCT_BINARY}_setup.exe"

  ;Set the default installation directory
  InstallDir "$PROGRAMFILES64\${PRODUCT}"

  !define INSTDIR_BIN "bin"

  ;Overwrite $InstallDir value when a previous installation directory was found
  InstallDirRegKey HKLM "Software\${PRODUCT}" ""

  ;Request admin prvilidges to install to the program files directory
  RequestExecutionLevel admin

;--------------------------------
;Include External Logic File To Dump install log to file

  !include "windows_installer_dump_log_to_file.nsi"

;--------------------------------
;Interface Settings

  ;Use a custom welcome page title
  !define MUI_WELCOMEPAGE_TITLE "${PRODUCT} ${PRODUCT_VERSION}"

  ;Show warning if user wants to abort
  !define MUI_ABORTWARNING

  ;Show all languages, despite user's codepage
  !define MUI_LANGDLL_ALLLANGUAGES

  ;Use a custom (un-)install icon
  !define MUI_ICON "..\..\res\icons\${PRODUCT_BINARY}.ico"
  !define MUI_UNICON "..\..\res\icons\${PRODUCT_BINARY}_greyscale.ico"

  ;Use custom image files for the (un-)installer
  ;!define MUI_HEADERIMAGE_RIGHT
  ;!define MUI_WELCOMEFINISHPAGE_BITMAP "..\res\installer\picture_left_installer.bmp"
  ;!define MUI_UNWELCOMEFINISHPAGE_BITMAP "..\res\installer\picture_left_uninstaller.bmp"

  ;Add a Desktop shortcut if the user wants to enable it on the finish page
  ;(https://stackoverflow.com/a/1517851)
  !define MUI_FINISHPAGE_SHOWREADME ""
  !define MUI_FINISHPAGE_SHOWREADME_NOTCHECKED
  !define MUI_FINISHPAGE_SHOWREADME_TEXT $(LangStringCreateDesktopShortcut)
  !define MUI_FINISHPAGE_SHOWREADME_FUNCTION createDesktopShortcut

;--------------------------------
;Custom Pages

Var CustomPage_OtherOptions_OpenConfigDir_Checkbox
Var CustomPage_OtherOptions_OpenConfigDir_CheckboxState
Var CustomPage_OtherOptions_OpenWebsite_Checkbox
Var CustomPage_OtherOptions_OpenWebsite_CheckboxState

Function customPageOtherOptions
    !insertmacro MUI_HEADER_TEXT $(LangStringCustomPageOtherOptionsTitle) $(LangStringCustomPageOtherOptionsSubTitle)

    nsDialogs::Create 1018
    Pop $0
    ${If} $0 == error
        Abort
    ${EndIf}

    ${NSD_CreateCheckbox} 0 0 100% 10u "&$(LangStringCustomPageOtherOptionsCheckboxOpenConfigDir)"
    Pop $CustomPage_OtherOptions_OpenConfigDir_Checkbox
    ${NSD_SetState} $CustomPage_OtherOptions_OpenConfigDir_Checkbox $CustomPage_OtherOptions_OpenConfigDir_CheckboxState

    ${NSD_CreateCheckbox} 0 20u 100% 10u "&$(LangStringCustomPageOtherOptionsCheckboxOpenWebsite)"
    Pop $CustomPage_OtherOptions_OpenWebsite_Checkbox
    ${NSD_SetState} $CustomPage_OtherOptions_OpenWebsite_Checkbox $CustomPage_OtherOptions_OpenWebsite_CheckboxState

    nsDialogs::Show
FunctionEnd

Function customPageOtherOptionsLeave

  ;Open the configuration directory if this was checked by the user
  ${NSD_GetState} $CustomPage_OtherOptions_OpenConfigDir_Checkbox $CustomPage_OtherOptions_OpenConfigDir_CheckboxState
  ${If} $CustomPage_OtherOptions_OpenConfigDir_CheckboxState == ${BST_CHECKED}
    ExecShell "open" "$AppData\${PRODUCT}"
  ${EndIf}

  ;Open the website if this was checked by the user
  ${NSD_GetState} $CustomPage_OtherOptions_OpenWebsite_Checkbox $CustomPage_OtherOptions_OpenWebsite_CheckboxState
  ${If} $CustomPage_OtherOptions_OpenWebsite_CheckboxState == ${BST_CHECKED}
    ExecShell "open" "${PRODUCT_URL}#readme"
  ${EndIf}

FunctionEnd

;--------------------------------
;Pages

  ;For the installer:
  ;------------------------------
  ;Welcome page with name and version
  !insertmacro MUI_PAGE_WELCOME
  ;License page
  !insertmacro MUI_PAGE_LICENSE "..\..\LICENSE"
  ;Component selector
  ;!insertmacro MUI_PAGE_COMPONENTS
  ;Set install directory
  !insertmacro MUI_PAGE_DIRECTORY
  ;Show progress while installing/copying the files
  !insertmacro MUI_PAGE_INSTFILES
  ;Show page for other options
  Page custom customPageOtherOptions customPageOtherOptionsLeave
  ;Show final finish page
  !insertmacro MUI_PAGE_FINISH

  ;For the uninstaller:
  ;------------------------------
  ;Welcome page to uninstaller
  !insertmacro MUI_UNPAGE_WELCOME
  ;Confirm the uninstall with the install directory shown
  !insertmacro MUI_UNPAGE_CONFIRM
  ;Show progress while uninstalling/removing the files
  !insertmacro MUI_UNPAGE_INSTFILES
  ;Show final finish page
  !insertmacro MUI_UNPAGE_FINISH

;--------------------------------
;Include External Languages File

  !include "windows_installer_languages.nsi"

;--------------------------------
;Before Installer Section

Function .onInit

  ;Get the uninstall information and the name (and thus also the version) of the
  ;previous installation
  ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "UninstallString"
  ReadRegStr $1 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "DisplayName"
  ;If a previous installation was found ask the user via a popup if they want to
  ;uninstall it before running the installer
  ${If} $0 != ""
  ${AndIf} ${Cmd} `MessageBox MB_YESNO|MB_ICONQUESTION "$(LangStrUninstallTheCurrentlyInstalled1)$1$(LangStrUninstallTheCurrentlyInstalled2)${PRODUCT} ${PRODUCT_VERSION}$(LangStrUninstallTheCurrentlyInstalled3)" /SD IDYES IDYES`
    ;Use the included macro to uninstall the existing installation if the user
    ;selected yes
    !insertmacro UninstallExisting $0 $0
    ;If the uninstall failed show an additional popup window asking if the
    ;installation should be aborted or not
    ${If} $0 <> 0
      MessageBox MB_YESNO|MB_ICONSTOP "$(LangStrFailedToUninstallContinue)" /SD IDYES IDYES +2
        Abort
    ${EndIf}
  ${EndIf}

FunctionEnd

;--------------------------------
;Installer Section > Main Component

Section "${PRODUCT} ($(LangStrRequired))" Section1

  DetailPrint "Install ${PRODUCT} ${PRODUCT_VERSION}"

  ;This will prevent this component from being disabled on the selection page
  SectionIn RO

  ;Set output path to the installation directory and list the files that should
  ;be put into it
  SetOutPath "$INSTDIR"
  File ".\${FILE_NAME_SCRIPT_MAIN}"
  File ".\${FILE_NAME_SCRIPT_MAIN_CUSTOM_CONFIG_DIR}"
  File ".\${FILE_NAME_SCRIPT_BACKUP}"
  File ".\${FILE_NAME_SCRIPT_IMPORT}"
  File "..\..\res\icons\${PRODUCT_BINARY}.ico"
  File "..\..\res\icons\${PRODUCT_BINARY}_green.ico"
  File "..\..\res\icons\${PRODUCT_BINARY}_orange.ico"
  File "..\..\res\icons\${PRODUCT_BINARY}_purple.ico"
  ;Create a separate directory for binaries that shold be available to the
  ;terminal via the PATH environment variable
  CreateDirectory "$INSTDIR\${INSTDIR_BIN}"
  SetOutPath "$INSTDIR\${INSTDIR_BIN}"
  File "..\..\bin\${PRODUCT_BINARY}.exe"
  ;Reset the output path for shortcuts to the main install directory
  SetOutPath "$INSTDIR"

  ;Store installation folder in registry for future installs
  WriteRegStr HKLM "Software\${PRODUCT}" "" "$INSTDIR"

  ;Registry information for add/remove programs
  ;(https://nsis.sourceforge.io/Add_uninstall_information_to_Add/Remove_Programs)
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "DisplayName" "${PRODUCT} ${PRODUCT_VERSION}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "UninstallString" "$\"$INSTDIR\${PRODUCT_BINARY}_uninstaller.exe$\""
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "QuietUninstallString" "$\"$INSTDIR\${PRODUCT_BINARY}_uninstaller.exe$\" /S"

  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "URLInfoAbout" "$\"${PRODUCT_URL}$\""
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "NoRepair" 1

  ;Create default config directory
  CreateDirectory "$AppData\${PRODUCT}"

  ;Create start menu shortcut for program, config directory and uninstaller
  CreateDirectory "$SMPROGRAMS\${PRODUCT}"
  CreateShortCut "$SMPROGRAMS\${PRODUCT}\${PRODUCT} ${PRODUCT_VERSION}.lnk" "$INSTDIR\${FILE_NAME_SCRIPT_MAIN}" "" "$INSTDIR\${PRODUCT_BINARY}.ico" 0
  CreateShortCut "$SMPROGRAMS\${PRODUCT}\$(LangStrBackup) ${PRODUCT} ${PRODUCT_VERSION}.lnk" "$INSTDIR\${FILE_NAME_SCRIPT_BACKUP}" "" "$INSTDIR\${PRODUCT_BINARY}_green.ico" 0
  CreateShortCut "$SMPROGRAMS\${PRODUCT}\$(LangStrImport) ${PRODUCT} ${PRODUCT_VERSION}.lnk" "$INSTDIR\${FILE_NAME_SCRIPT_IMPORT}" "" "$INSTDIR\${PRODUCT_BINARY}_purple.ico" 0
  CreateShortCut "$SMPROGRAMS\${PRODUCT}\${PRODUCT} ${PRODUCT_VERSION} ($(LangStrCustomConfig)).lnk" "$INSTDIR\${FILE_NAME_SCRIPT_MAIN_CUSTOM_CONFIG_DIR}" "" "$INSTDIR\${PRODUCT_BINARY}_orange.ico" 0
  CreateShortCut "$SMPROGRAMS\${PRODUCT}\$(LangStrConfiguration1)${PRODUCT}$(LangStrConfiguration2).lnk" "$AppData\${PRODUCT}"
  CreateShortCut "$SMPROGRAMS\${PRODUCT}\$(LangStrUninstall) ${PRODUCT} ${PRODUCT_VERSION}.lnk" "$INSTDIR\${PRODUCT_BINARY}_uninstaller.exe" "" "$INSTDIR\${PRODUCT_BINARY}_uninstaller.exe" 0

  ;Create uninstaller
  WriteUninstaller "${PRODUCT_BINARY}_uninstaller.exe"

  ;Set output path to the config directory and list the files that should be put
  ;into it
  SetOutPath "$AppData\${PRODUCT}"
  File "..\..\${FILE_NAME_ENV_EXAMPLE}"
  File "..\..\${FILE_NAME_ENV_STRINGS_EXAMPLE}"
  File "..\..\${FILE_NAME_CUSTOM_COMMANDS_BROADCASTS_EXAMPLE}"

  ;Add install directory to the user path
  EnVar::SetHKCU
  DetailPrint "EnVar::SetHKCU"
  ;Check for a 'PATH' variable
  EnVar::Check "PATH" "NULL"
  Pop $0
  DetailPrint "EnVar::Check PATH returned=|$0|"
  ${If} $0 != 0
      MessageBox MB_OK '$(LangStrErrorEnVarCheck) (EnVar::Check PATH => |$0|)'
  ${EndIf}
  ;Add the install directory to the 'PATH' if the variable was found
  EnVar::AddValue "PATH" "$INSTDIR\${INSTDIR_BIN}"
  Pop $0
  DetailPrint "EnVar::AddValue PATH+='$INSTDIR\${INSTDIR_BIN}' returned=|$0|"
  ${If} $0 != 0
      MessageBox MB_OK '$(LangStrErrorEnVarAdd) (EnVar::AddValue PATH+="$INSTDIR\${INSTDIR_BIN}" => |$0|)'
  ${EndIf}

  ;Dump install log to file
  StrCpy $0 "$TEMP\${PRODUCT_BINARY}_install.log"
  Push $0
  Call DumpLog

SectionEnd

;--------------------------------
;Component Descriptions

;!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
;  !insertmacro MUI_DESCRIPTION_TEXT ${Section1} $(LangStrRequired)
;!insertmacro MUI_FUNCTION_DESCRIPTION_END

;--------------------------------
;Uninstaller Section

Section "Uninstall"

  DetailPrint "Uninstall ${PRODUCT} ${PRODUCT_VERSION}"

  ;Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}"
  DeleteRegKey HKLM "Software\${PRODUCT}"

  ;Remove the installation directory and all files within it
  RMDir /r "$INSTDIR\${INSTDIR_BIN}\*.*"
  RMDir "$INSTDIR\${INSTDIR_BIN}"
  RMDir /r "$INSTDIR\*.*"
  RMDir "$INSTDIR"

  ;Remove the start menu directory and all shortcuts within it
  Delete "$SMPROGRAMS\${PRODUCT}\*.*"
  RmDir  "$SMPROGRAMS\${PRODUCT}"

  ;Remove install directory from the user path
  EnVar::SetHKCU
  DetailPrint "EnVar::SetHKCU"
  ;Check for a 'PATH' variable
  EnVar::Check "PATH" "NULL"
  Pop $0
  DetailPrint "EnVar::Check PATH returned=|$0|"
  ${If} $0 == 0
      ;Remove the install directory from the 'PATH' if the variable was found
      EnVar::DeleteValue "PATH" "$INSTDIR\${INSTDIR_BIN}"
      Pop $0
      DetailPrint "EnVar::DeleteValue PATH-='$INSTDIR\${INSTDIR_BIN}' returned=|$0|"
      ${If} $0 != 0
        MessageBox MB_OK '$(LangStrErrorEnVarDelete) (EnVar::DeleteValue PATH-="$INSTDIR\${INSTDIR_BIN}" => |$0|)'
      ${EndIf}
  ${EndIf}

SectionEnd

;--------------------------------
;After Installation Function (is triggered after a successful installation)

;Function .onInstSuccess
;
;  ;Nothing right now
;
;FunctionEnd

;--------------------------------
;Custom Function To Create A Desktop Shortcut

Function createDesktopShortcut

  ;Reset output file path to installation directory because CreateShortCut needs
  ;that information (https://nsis-dev.github.io/NSIS-Forums/html/t-299421.html)
  SetOutPath "$INSTDIR\${INSTDIR_BIN}"

  ;Create Desktop shortcut to main component
  CreateShortCut "$DESKTOP\${PRODUCT} ${PRODUCT_VERSION}.lnk" "$INSTDIR\${PRODUCT_BINARY}.bat" "" "$INSTDIR\${PRODUCT_BINARY}.ico" 0

FunctionEnd
