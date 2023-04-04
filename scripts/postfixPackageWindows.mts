/* eslint-disable no-console, no-magic-numbers, security/detect-non-literal-fs-filename */

// Package imports
import * as ResEdit from "resedit";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import path from "path";
// Relative imports
import {
  author,
  description,
  displayName,
  license,
  name,
  version,
} from "../src/info/general.mjs";
import { createJobUpdate } from "../src/createJob.mjs";
import { getVersionInfo } from "../src/version.mjs";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const filePathRootDir = path.join(dirname, "..");
const filePathExeIcon = path.join(
  filePathRootDir,
  "res",
  "icons",
  `${name}.ico`,
);

const updateWindowsExeMetadata = async (windowsExeFile: Buffer) => {
  const exe = ResEdit.NtExecutable.from(windowsExeFile);
  const res = ResEdit.NtExecutableResource.from(exe);
  const iconFile = ResEdit.Data.IconFile.from(
    await fs.readFile(filePathExeIcon),
  );

  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
    res.entries,
    1,
    1033,
    iconFile.icons.map((item) => item.data),
  );

  const vi = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0];

  vi.setStringValues(
    { codepage: 1200, lang: 1033 },
    {
      CompanyName: author,
      FileDescription: description,
      LegalCopyright: `${displayName}: Copyright ${author} (${license} license), Node.js runtime: Copyright Node.js contributors (MIT license)`,
      OriginalFilename: `${displayName.toLowerCase()}.exe`,
      ProductName: displayName,
    },
  );
  vi.removeStringValue({ codepage: 1200, lang: 1033 }, "InternalName");
  const versionInfo = getVersionInfo(version);
  vi.setFileVersion(
    versionInfo.major,
    versionInfo.minor,
    versionInfo.patch,
    versionInfo.prerelease.length > 0 ? 0 : 1,
  );
  vi.setProductVersion(
    versionInfo.major,
    versionInfo.minor,
    versionInfo.patch,
    versionInfo.prerelease.length > 0 ? 0 : 1,
  );
  vi.outputToResourceEntries(res.entries);
  res.outputResource(exe);
  return Buffer.from(exe.generate());
};

// -----------------------------------------------------------------------------

const filePathExe = path.join(filePathRootDir, "bin", `${name}.exe`);

// -----------------------------------------------------------------------------

Promise.all([
  createJobUpdate(
    "Windows binary",
    ["metadata", "icon"],
    filePathExe,
    updateWindowsExeMetadata,
  ),
]).catch(console.error);
