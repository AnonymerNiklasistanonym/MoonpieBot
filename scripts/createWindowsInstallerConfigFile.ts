// Package imports
import fs from "fs";
import path from "path";
// Local imports
import { name, sourceCodeUrl } from "../src/info/general";
import { getVersion } from "../src/version";

const rootPath = path.join(__dirname, "..");

const windowsInstallerConfigOutputPath = path.join(
  rootPath,
  "installer",
  "windows_installer_config.nsi"
);

const createWindowsInstallerConfigFile = (outputPath: string) => {
  console.log(`Create Windows installer config file '${outputPath}'...`);

  let outputString = "";
  outputString += ";Define name and lowercase name of the product\n";
  outputString += `!define PRODUCT "${name}"\n`;
  outputString += `!define PRODUCT_LOWERCASE "${name.toLowerCase()}"\n`;
  outputString += ";Define version of the product\n";
  outputString += `!define PRODUCT_VERSION "${getVersion().slice(1)}"\n`;
  outputString += ";Define URL of the product\n";
  outputString += `!define PRODUCT_URL "${sourceCodeUrl}"\n`;

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFile(outputPath, outputString, (err) => {
    if (err) throw err;
  });
};

createWindowsInstallerConfigFile(windowsInstallerConfigOutputPath);
