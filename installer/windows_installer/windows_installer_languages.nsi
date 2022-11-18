;At start will be searched if the current system language is in this list,
;if not the first language in this list will be chosen as language
!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "German"
!insertmacro MUI_LANGUAGE "Spanish"
!insertmacro MUI_LANGUAGE "Finnish"

;Language strings

LangString LangStringCreateDesktopShortcut ${LANG_ENGLISH} "Create Desktop Shortcut"
LangString LangStringCreateDesktopShortcut ${LANG_GERMAN}  "Erstelle Desktop Verknüpfung"
LangString LangStringCreateDesktopShortcut ${LANG_FINNISH} "Luo työpöydän pikakuvake"
LangString LangStringCreateDesktopShortcut ${LANG_SPANISH} "Crear un acceso directo al escritorio"

LangString LangStrUninstall ${LANG_ENGLISH} "Uninstall"
LangString LangStrUninstall ${LANG_GERMAN}  "Deinstalliere"
LangString LangStrUninstall ${LANG_FINNISH} "Poista"
LangString LangStrUninstall ${LANG_SPANISH} "Desinstalar"

LangString LangStrBackup ${LANG_ENGLISH} "Backup"
LangString LangStrBackup ${LANG_GERMAN}  "Backup"
LangString LangStrBackup ${LANG_FINNISH} "Varmuuskopiointi"
LangString LangStrBackup ${LANG_SPANISH} "Copia de seguridad de"

LangString LangStrCustomConfig ${LANG_ENGLISH} "Custom config directory"
LangString LangStrCustomConfig ${LANG_GERMAN}  "Benutzerdefiniertes Konfigurationsverzeichnis"
LangString LangStrCustomConfig ${LANG_FINNISH} "Mukautettu konfiguraatiohakemisto"
LangString LangStrCustomConfig ${LANG_SPANISH} "Directorio de configuración personalizado"

LangString LangStrConfiguration1 ${LANG_ENGLISH} ""
LangString LangStrConfiguration2 ${LANG_ENGLISH} " Configuration"
LangString LangStrConfiguration1 ${LANG_GERMAN}  ""
LangString LangStrConfiguration2 ${LANG_GERMAN}  " Konfiguration"
LangString LangStrConfiguration1 ${LANG_FINNISH} ""
LangString LangStrConfiguration2 ${LANG_FINNISH} "-konfiguraatio"
LangString LangStrConfiguration1 ${LANG_SPANISH} "Configuración "
LangString LangStrConfiguration2 ${LANG_SPANISH} ""

LangString LangStrRequired ${LANG_ENGLISH} "Required"
LangString LangStrRequired ${LANG_GERMAN}  "Notwendig"
LangString LangStrRequired ${LANG_FINNISH} "Vaadittu"
LangString LangStrRequired ${LANG_SPANISH} "Requerido"

LangString LangStrFailedToUninstallContinue ${LANG_ENGLISH} "Failed to uninstall, continue anyway?"
LangString LangStrFailedToUninstallContinue ${LANG_GERMAN}  "Deinstallation fehlgeschlagen, trotzdem fortfahren?"
LangString LangStrFailedToUninstallContinue ${LANG_FINNISH} "Epäonnistui asennuksen poistaminen, jatka kuitenkin?"
LangString LangStrFailedToUninstallContinue ${LANG_SPANISH} "Falló la desinstalación, ¿continúa de todos modos?"

LangString LangStrUninstallTheCurrentlyInstalled1 ${LANG_ENGLISH} "Uninstall the installed version "
LangString LangStrUninstallTheCurrentlyInstalled2 ${LANG_ENGLISH} " before installing "
LangString LangStrUninstallTheCurrentlyInstalled3 ${LANG_ENGLISH} "?"
LangString LangStrUninstallTheCurrentlyInstalled1 ${LANG_GERMAN}  "Möchten sie die installierte Version "
LangString LangStrUninstallTheCurrentlyInstalled2 ${LANG_GERMAN}  " vor der Installation von "
LangString LangStrUninstallTheCurrentlyInstalled3 ${LANG_GERMAN}  " deinstallieren?"
LangString LangStrUninstallTheCurrentlyInstalled1 ${LANG_FINNISH} "Poista asennettu versio "
LangString LangStrUninstallTheCurrentlyInstalled2 ${LANG_FINNISH} " ennen "
LangString LangStrUninstallTheCurrentlyInstalled3 ${LANG_FINNISH} ":n asentamista?"
LangString LangStrUninstallTheCurrentlyInstalled1 ${LANG_SPANISH} "¿Desinstalar la versión "
LangString LangStrUninstallTheCurrentlyInstalled2 ${LANG_SPANISH} " instalada antes de instalar la "
LangString LangStrUninstallTheCurrentlyInstalled3 ${LANG_SPANISH} "?"

LangString LangStrErrorEnVarCheck ${LANG_ENGLISH} "There was an error accessing the user PATH environment variable"
LangString LangStrErrorEnVarCheck ${LANG_GERMAN}  "Es gab einen Fehler beim Zugriff auf die Umgebungsvariable PATH des Benutzers"
LangString LangStrErrorEnVarCheck ${LANG_FINNISH} "Käyttäjän PATH-ympäristömuuttujaa käytettäessä tapahtui virhe"
LangString LangStrErrorEnVarCheck ${LANG_SPANISH} "Se ha producido un error al acceder a la variable de entorno PATH del usuario"

LangString LangStrErrorEnVarAdd ${LANG_ENGLISH} "There was an error adding the install directory to the user PATH environment variable"
LangString LangStrErrorEnVarAdd ${LANG_GERMAN}  "Es gab einen Fehler beim Hinzufügen des Installationsverzeichnisses zur Umgebungsvariable PATH des Benutzers"
LangString LangStrErrorEnVarAdd ${LANG_FINNISH} "Asennushakemiston lisääminen käyttäjän PATH-ympäristömuuttujaan oli virhe"
LangString LangStrErrorEnVarAdd ${LANG_SPANISH} "Se ha producido un error al añadir el directorio de instalación a la variable de entorno PATH del usuario"

LangString LangStrErrorEnVarDelete ${LANG_ENGLISH} "There was an error removing the install directory from the user PATH environment variable"
LangString LangStrErrorEnVarDelete ${LANG_GERMAN}  "Es gab einen Fehler beim Entfernen des Installationsverzeichnisses aus der Umgebungsvariable PATH des Benutzers"
LangString LangStrErrorEnVarDelete ${LANG_FINNISH} "Asennushakemiston poistaminen käyttäjän PATH-ympäristömuuttujasta oli virhe"
LangString LangStrErrorEnVarDelete ${LANG_SPANISH} "Se ha producido un error al eliminar el directorio de instalación de la variable de entorno PATH del usuario"

LangString LangStringCustomPageOtherOptionsTitle ${LANG_ENGLISH} "Other Options"
LangString LangStringCustomPageOtherOptionsTitle ${LANG_GERMAN}  "Andere Optionen"
LangString LangStringCustomPageOtherOptionsTitle ${LANG_FINNISH} "Muut vaihtoehdot"
LangString LangStringCustomPageOtherOptionsTitle ${LANG_SPANISH} "Otras opciones"

LangString LangStringCustomPageOtherOptionsSubTitle ${LANG_ENGLISH} ""
LangString LangStringCustomPageOtherOptionsSubTitle ${LANG_GERMAN}  ""
LangString LangStringCustomPageOtherOptionsSubTitle ${LANG_FINNISH} ""
LangString LangStringCustomPageOtherOptionsSubTitle ${LANG_SPANISH} ""

LangString LangStringCustomPageOtherOptionsCheckboxOpenConfigDir ${LANG_ENGLISH} "Open the configuration directory"
LangString LangStringCustomPageOtherOptionsCheckboxOpenConfigDir ${LANG_GERMAN}  "Öffne das Konfigurations Verzeichnis"
LangString LangStringCustomPageOtherOptionsCheckboxOpenConfigDir ${LANG_FINNISH} "Avaa konfiguraatiohakemisto"
LangString LangStringCustomPageOtherOptionsCheckboxOpenConfigDir ${LANG_SPANISH} "Abrir el directorio de configuración"

LangString LangStringCustomPageOtherOptionsCheckboxOpenWebsite ${LANG_ENGLISH} "Open the website"
LangString LangStringCustomPageOtherOptionsCheckboxOpenWebsite ${LANG_GERMAN}  "Öffne die Website"
LangString LangStringCustomPageOtherOptionsCheckboxOpenWebsite ${LANG_FINNISH} "Avaa verkkosivusto"
LangString LangStringCustomPageOtherOptionsCheckboxOpenWebsite ${LANG_SPANISH} "Abrir el sitio web"
