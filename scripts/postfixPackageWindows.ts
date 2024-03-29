/* eslint-disable no-console, no-magic-numbers, security/detect-non-literal-fs-filename */

// Package imports
import * as ResEdit from "resedit";
import { promises as fs } from "fs";
import path from "path";
// Local imports
import { author, description, license, name } from "../src/info/general";
import { createJobUpdate } from "../src/createJob";
import { version } from "../src/info/version";

const filePathRootDir = path.join(__dirname, "..");
const filePathExeIcon = path.join(
  filePathRootDir,
  "res",
  "icons",
  "moonpiebot.ico"
);

const updateWindowsExeMetadata = async (windowsExeFile: Buffer) => {
  const exe = ResEdit.NtExecutable.from(windowsExeFile);
  const res = ResEdit.NtExecutableResource.from(exe);
  const iconFile = ResEdit.Data.IconFile.from(
    await fs.readFile(filePathExeIcon)
  );

  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
    res.entries,
    1,
    1033,
    iconFile.icons.map((item) => item.data)
  );

  const vi = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0];

  vi.setStringValues(
    { codepage: 1200, lang: 1033 },
    {
      CompanyName: author,
      FileDescription: description,
      LegalCopyright: `${name}: Copyright ${author} (${license} license), Node.js runtime: Copyright Node.js contributors (MIT license)`,
      OriginalFilename: `${name.toLowerCase()}.exe`,
      ProductName: name,
    }
  );
  vi.removeStringValue({ codepage: 1200, lang: 1033 }, "InternalName");
  vi.setFileVersion(
    version.major,
    version.minor,
    version.patch,
    version.beta === true ? 0 : 1
  );
  vi.setProductVersion(
    version.major,
    version.minor,
    version.patch,
    version.beta === true ? 0 : 1
  );
  vi.outputToResourceEntries(res.entries);
  res.outputResource(exe);
  return Buffer.from(exe.generate());
};

// -----------------------------------------------------------------------------

const filePathExe = path.join(filePathRootDir, "bin", "moonpiebot.exe");

// -----------------------------------------------------------------------------

Promise.all([
  createJobUpdate(
    "Windows binary",
    ["metadata", "icon"],
    filePathExe,
    updateWindowsExeMetadata
  ),
]).catch(console.error);
