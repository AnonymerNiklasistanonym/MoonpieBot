; Windows Installer

;--------------------------------
;Include Modern UI

  !include "MUI2.nsh"

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
  OutFile "..\bin\${PRODUCT_LOWERCASE}_setup.exe"

  ;Set the default installation directory
  InstallDir "$PROGRAMFILES64\${PRODUCT}"

  ;Overwrite $InstallDir value when a previous installation directory was found
  InstallDirRegKey HKLM "Software\${PRODUCT}" ""

  ;Request admin prvilidges to install to the program files directory
  RequestExecutionLevel admin

;--------------------------------
;Interface Settings

  ;Use a custom welcome page title
  !define MUI_WELCOMEPAGE_TITLE "${PRODUCT} ${PRODUCT_VERSION}"

  ;Show warning if user wants to abort
  !define MUI_ABORTWARNING

  ;Show all languages, despite user's codepage
  !define MUI_LANGDLL_ALLLANGUAGES

  ;Use a custom (un-)install icon
  !define MUI_ICON "..\res\icons\${PRODUCT_LOWERCASE}.ico"
  !define MUI_UNICON "..\res\icons\${PRODUCT_LOWERCASE}_greyscale.ico"

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
;Pages

  ;For the installer:
  ;------------------------------
  ;Welcome page with name and version
  !insertmacro MUI_PAGE_WELCOME
  ;License page
  !insertmacro MUI_PAGE_LICENSE "..\LICENSE"
  ;Component selector
  ;!insertmacro MUI_PAGE_COMPONENTS
  ;Set install directory
  !insertmacro MUI_PAGE_DIRECTORY
  ;Show progress while installing/copying the files
  !insertmacro MUI_PAGE_INSTFILES
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

  ;This will prevent this component from being disabled on the selection page
  SectionIn RO

  ;Set output path to the installation directory and list the files that should
  ;be put into it
  SetOutPath "$INSTDIR"
  File "..\bin\${PRODUCT_LOWERCASE}.exe"
  File ".\${PRODUCT_LOWERCASE}.bat"
  File "..\res\icons\${PRODUCT_LOWERCASE}.ico"

  ;Store installation folder in registry for future installs
  WriteRegStr HKLM "Software\${PRODUCT}" "" "$INSTDIR"

  ;Registry information for add/remove programs
  ;(https://nsis.sourceforge.io/Add_uninstall_information_to_Add/Remove_Programs)
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "DisplayName" "${PRODUCT} ${PRODUCT_VERSION}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "UninstallString" "$\"$INSTDIR\${PRODUCT_LOWERCASE}_uninstaller.exe$\""
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "QuietUninstallString" "$\"$INSTDIR\${PRODUCT_LOWERCASE}_uninstaller.exe$\" /S"

  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "URLInfoAbout" "$\"${PRODUCT_URL}$\""
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "NoRepair" 1

  ;Create default config directory
  CreateDirectory "$AppData\${PRODUCT}"

  ;Create start menu shortcut for program, config directory and uninstaller
  CreateDirectory "$SMPROGRAMS\${PRODUCT}"
  CreateShortCut "$SMPROGRAMS\${PRODUCT}\${PRODUCT} ${PRODUCT_VERSION}.lnk" "$INSTDIR\${PRODUCT_LOWERCASE}.bat" "" "$INSTDIR\${PRODUCT_LOWERCASE}.ico" 0
  CreateShortCut "$SMPROGRAMS\${PRODUCT}\$(LangStrConfiguration1)${PRODUCT}$(LangStrConfiguration2).lnk" "$AppData\${PRODUCT}"
  CreateShortCut "$SMPROGRAMS\${PRODUCT}\$(LangStrUninstall) ${PRODUCT} ${PRODUCT_VERSION}.lnk" "$INSTDIR\${PRODUCT_LOWERCASE}_uninstaller.exe" "" "$INSTDIR\${PRODUCT_LOWERCASE}_uninstaller.exe" 0

  ;Create uninstaller
  WriteUninstaller "${PRODUCT_LOWERCASE}_uninstaller.exe"

  ;Set output path to the config directory and list the files that should be put
  ;into it
  SetOutPath "$AppData\${PRODUCT}"
  File "..\.env.example"
  File "..\.env.strings.example"
  File "..\customCommands.example.json"
  File "..\customTimers.example.json"
  File "..\customCommands.schema.json"
  File "..\customTimers.schema.json"

SectionEnd

;--------------------------------
;Component Descriptions

;!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
;  !insertmacro MUI_DESCRIPTION_TEXT ${Section1} $(LangStrRequired)
;!insertmacro MUI_FUNCTION_DESCRIPTION_END

;--------------------------------
;Uninstaller Section

Section "Uninstall"

  ;Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}"
  DeleteRegKey HKLM "Software\${PRODUCT}"

  ;Remove the installation directory and all files within it
  RMDir /r "$INSTDIR\*.*"
  RMDir "$INSTDIR"

  ;Remove the start menu directory and all shortcuts within it
  Delete "$SMPROGRAMS\${PRODUCT}\*.*"
  RmDir  "$SMPROGRAMS\${PRODUCT}"

SectionEnd

;--------------------------------
;After Installation Function (is triggered after a successful installation)

Function .onInstSuccess

  ;Open the configuration directory
  ExecShell "open" "$AppData\${PRODUCT}"

FunctionEnd

;--------------------------------
;Custom Function To Create A Desktop Shortcut

Function createDesktopShortcut

  ;Reset output file path to installation directory because CreateShortCut needs
  ;that information (https://nsis-dev.github.io/NSIS-Forums/html/t-299421.html)
  SetOutPath $INSTDIR

  ;Create Desktop shortcut to main component
  CreateShortCut "$DESKTOP\${PRODUCT} ${PRODUCT_VERSION}.lnk" "$INSTDIR\${PRODUCT_LOWERCASE}.bat" "" "$INSTDIR\${PRODUCT_LOWERCASE}.ico" 0

FunctionEnd
