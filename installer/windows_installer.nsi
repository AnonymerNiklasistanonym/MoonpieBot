; Windows Installer

;--------------------------------
;Include Modern UI

  !include "MUI2.nsh"

;--------------------------------
;Include External Config File

  !include "windows_installer_config.nsi"

;--------------------------------
;Include External Logic File To Run Previous Uninstaller If Detected

  !include "windows_installer_run_previous_uninstaller.nsi"

;--------------------------------
;General

  ;Properly display all languages
  Unicode true

  ;Show 'console' in installer and uninstaller
  ShowInstDetails "show"
  ShowUninstDetails "show"

  ;Name and file
  Name "${PRODUCT}"
  OutFile "..\bin\${PRODUCT_LOWERCASE}_setup.exe"

  ;Default installation folder
  InstallDir "$PROGRAMFILES64\${PRODUCT}"

  ;Get installation folder from registry if available
  InstallDirRegKey HKLM "Software\${PRODUCT}" ""

  ;Request application admin
  RequestExecutionLevel admin

;--------------------------------
;Interface Settings

  ;Use a custom welcome page title
  !define MUI_WELCOMEPAGE_TITLE "${PRODUCT} ${PRODUCT_VERSION}"

  ;Show warning if user wants to abort
  !define MUI_ABORTWARNING

  ;Show all languages, despite user's codepage
  !define MUI_LANGDLL_ALLLANGUAGES

  ;Use the custom own icon
  !define MUI_ICON "..\res\icons\${PRODUCT_LOWERCASE}.ico"
  !define MUI_UNICON "..\res\icons\${PRODUCT_LOWERCASE}_greyscale.ico"
  !define MUI_HEADERIMAGE_RIGHT
  ;!define MUI_WELCOMEFINISHPAGE_BITMAP "pictures\picture_left_installer.bmp"
  ;!define MUI_UNWELCOMEFINISHPAGE_BITMAP "pictures\picture_left_uninstaller.bmp"

;--------------------------------
;Pages

  ;For the installer
  !insertmacro MUI_PAGE_WELCOME
  !insertmacro MUI_PAGE_LICENSE "..\LICENSE"
  ;!insertmacro MUI_COMPONENTSPAGE_NODESC
  !insertmacro MUI_PAGE_INSTFILES
  !insertmacro MUI_PAGE_FINISH

  ;For the uninstaller
  !insertmacro MUI_UNPAGE_WELCOME
  !insertmacro MUI_UNPAGE_CONFIRM
  !insertmacro MUI_UNPAGE_INSTFILES
  !insertmacro MUI_UNPAGE_FINISH

;--------------------------------
;Languages

  ;At start will be searched if the current system language is in this list,
  ;if not the first language in this list will be chosen as language
  !insertmacro MUI_LANGUAGE "English"
  !insertmacro MUI_LANGUAGE "French"
  !insertmacro MUI_LANGUAGE "German"
  !insertmacro MUI_LANGUAGE "Spanish"
  !insertmacro MUI_LANGUAGE "SpanishInternational"
  !insertmacro MUI_LANGUAGE "SimpChinese"
  !insertmacro MUI_LANGUAGE "TradChinese"
  !insertmacro MUI_LANGUAGE "Japanese"
  !insertmacro MUI_LANGUAGE "Korean"
  !insertmacro MUI_LANGUAGE "Italian"
  !insertmacro MUI_LANGUAGE "Dutch"
  !insertmacro MUI_LANGUAGE "Danish"
  !insertmacro MUI_LANGUAGE "Swedish"
  !insertmacro MUI_LANGUAGE "Norwegian"
  !insertmacro MUI_LANGUAGE "NorwegianNynorsk"
  !insertmacro MUI_LANGUAGE "Finnish"
  !insertmacro MUI_LANGUAGE "Greek"
  !insertmacro MUI_LANGUAGE "Russian"
  !insertmacro MUI_LANGUAGE "Portuguese"
  !insertmacro MUI_LANGUAGE "PortugueseBR"
  !insertmacro MUI_LANGUAGE "Polish"
  !insertmacro MUI_LANGUAGE "Ukrainian"
  !insertmacro MUI_LANGUAGE "Czech"
  !insertmacro MUI_LANGUAGE "Slovak"
  !insertmacro MUI_LANGUAGE "Croatian"
  !insertmacro MUI_LANGUAGE "Bulgarian"
  !insertmacro MUI_LANGUAGE "Hungarian"
  !insertmacro MUI_LANGUAGE "Thai"
  !insertmacro MUI_LANGUAGE "Romanian"
  !insertmacro MUI_LANGUAGE "Latvian"
  !insertmacro MUI_LANGUAGE "Macedonian"
  !insertmacro MUI_LANGUAGE "Estonian"
  !insertmacro MUI_LANGUAGE "Turkish"
  !insertmacro MUI_LANGUAGE "Lithuanian"
  !insertmacro MUI_LANGUAGE "Slovenian"
  !insertmacro MUI_LANGUAGE "Serbian"
  !insertmacro MUI_LANGUAGE "SerbianLatin"
  !insertmacro MUI_LANGUAGE "Arabic"
  !insertmacro MUI_LANGUAGE "Farsi"
  !insertmacro MUI_LANGUAGE "Hebrew"
  !insertmacro MUI_LANGUAGE "Indonesian"
  !insertmacro MUI_LANGUAGE "Mongolian"
  !insertmacro MUI_LANGUAGE "Luxembourgish"
  !insertmacro MUI_LANGUAGE "Albanian"
  !insertmacro MUI_LANGUAGE "Breton"
  !insertmacro MUI_LANGUAGE "Belarusian"
  !insertmacro MUI_LANGUAGE "Icelandic"
  !insertmacro MUI_LANGUAGE "Malay"
  !insertmacro MUI_LANGUAGE "Bosnian"
  !insertmacro MUI_LANGUAGE "Kurdish"
  !insertmacro MUI_LANGUAGE "Irish"
  !insertmacro MUI_LANGUAGE "Uzbek"
  !insertmacro MUI_LANGUAGE "Galician"
  !insertmacro MUI_LANGUAGE "Afrikaans"
  !insertmacro MUI_LANGUAGE "Catalan"
  !insertmacro MUI_LANGUAGE "Esperanto"
  !insertmacro MUI_LANGUAGE "Asturian"
  !insertmacro MUI_LANGUAGE "Basque"
  !insertmacro MUI_LANGUAGE "Pashto"
  !insertmacro MUI_LANGUAGE "Georgian"
  !insertmacro MUI_LANGUAGE "Vietnamese"
  !insertmacro MUI_LANGUAGE "Welsh"
  !insertmacro MUI_LANGUAGE "Armenian"
  !insertmacro MUI_LANGUAGE "Corsican"

;--------------------------------
;Before Installer Section

Function .onInit
ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "UninstallString"
${If} $0 != ""
${AndIf} ${Cmd} `MessageBox MB_YESNO|MB_ICONQUESTION "Uninstall previous version?" /SD IDYES IDYES`
	!insertmacro UninstallExisting $0 $0
	${If} $0 <> 0
		MessageBox MB_YESNO|MB_ICONSTOP "Failed to uninstall, continue anyway?" /SD IDYES IDYES +2
			Abort
	${EndIf}
${EndIf}
FunctionEnd

;--------------------------------
;Installer Section

Section "${PRODUCT} (Required)"
  SectionIn RO # Just means if in component mode this is locked

  ;Set output path to the installation directory and list the files that should be put into it
  SetOutPath "$INSTDIR"
  File "..\bin\${PRODUCT_LOWERCASE}.exe"
  File ".\${PRODUCT_LOWERCASE}.bat"
  File "..\res\icons\${PRODUCT_LOWERCASE}.ico"

  ;Store installation folder in registry
  WriteRegStr HKLM "Software\${PRODUCT}" "" "$INSTDIR"

  ;Registry information for add/remove programs (https://nsis.sourceforge.io/Add_uninstall_information_to_Add/Remove_Programs)
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "DisplayName" "${PRODUCT} ${PRODUCT_VERSION}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "UninstallString" "$\"$INSTDIR\${PRODUCT_LOWERCASE}_uninstaller.exe$\""
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "QuietUninstallString" "$\"$INSTDIR\${PRODUCT_LOWERCASE}_uninstaller.exe$\" /S"

  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "URLInfoAbout" "$\"${ABOUTURL}$\""
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}" "NoRepair" 1

  ;Create default config directory
  CreateDirectory "$AppData\${PRODUCT}"

  ;Create start menu shortcut for program, config directory and uninstaller
  CreateDirectory "$SMPROGRAMS\${PRODUCT}"
  CreateShortCut "$SMPROGRAMS\${PRODUCT}\${PRODUCT_SHORTCUT} ${PRODUCT_VERSION}.lnk" "$INSTDIR\${PRODUCT_LOWERCASE}.bat" "" "$INSTDIR\${PRODUCT_LOWERCASE}.ico" 0
  CreateShortCut "$SMPROGRAMS\${PRODUCT}\${PRODUCT_SHORTCUT} Configuration.lnk" "$AppData\${PRODUCT}"
  CreateShortCut "$SMPROGRAMS\${PRODUCT}\Uninstall ${PRODUCT_SHORTCUT} ${PRODUCT_VERSION}.lnk" "$INSTDIR\${PRODUCT_LOWERCASE}_uninstaller.exe" "" "$INSTDIR\${PRODUCT_LOWERCASE}_uninstaller.exe" 0

  ;Create desktop shortcut
  CreateShortCut "$DESKTOP\${PRODUCT_SHORTCUT} ${PRODUCT_VERSION}.lnk" "$INSTDIR\${PRODUCT_LOWERCASE}.bat" "" "$INSTDIR\${PRODUCT_LOWERCASE}.ico" 0

  ;Create uninstaller
  WriteUninstaller "${PRODUCT_LOWERCASE}_uninstaller.exe"

  ;Set output path to the config directory and list the files that should be put into it
  SetOutPath "$AppData\${PRODUCT}"
  File "..\.env.example"
  File "..\customCommands.example.json"
  File "..\customTimers.example.json"
  File "..\customCommands.schema.json"
  File "..\customTimers.schema.json"

SectionEnd

;--------------------------------
;Uninstaller Section

Section "Uninstall"

  ;Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT}"
  DeleteRegKey HKLM "Software\${PRODUCT}"

  ;Delete the installation directory + files
  RMDir /r "$INSTDIR\*.*"
  RMDir "$INSTDIR"

  ;Delete Start Menu Shortcuts
  Delete "$SMPROGRAMS\${PRODUCT}\*.*"
  RmDir  "$SMPROGRAMS\${PRODUCT}"

SectionEnd

;--------------------------------
;After Installation Function

Function .onInstSuccess

  ;Open configuration directory after the installation
  ExecShell "open" "$AppData\${PRODUCT}"

FunctionEnd
