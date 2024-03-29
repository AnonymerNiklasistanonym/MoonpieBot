/* eslint-disable no-console */

// Package imports
import path from "path";
// Local imports
import {
  createPkgbuild,
  PkgbuildCmdsSection,
  referencePCV,
  referencePV,
} from "./lib/pkgbuild";
import { description, name, sourceCodeUrl } from "../src/info/general";
import { convertUndefValueToArray } from "../src/other/arrayOperations";
import { createJob } from "../src/createJob";
import { getVersionString } from "../src/version";
import { version } from "../src/info/version";
// Type imports
import type { PkgbuildCustomVariable, PkgbuildInfo } from "./lib/pkgbuild";
import type { DeepReadonly } from "../src/other/types";

const defaultPCVApplicationName: DeepReadonly<PkgbuildCustomVariable> = {
  name: "applicationname",
  note: "The name of the application that is built by this package",
  value: name.toLowerCase(),
};
const defaultPCVGitName: DeepReadonly<PkgbuildCustomVariable> = {
  name: "gitname",
  note: "The name of the cloned git directory of the application",
  value: `${referencePCV(defaultPCVApplicationName)}.git`,
};
const defaultPCVInstallDir: DeepReadonly<PkgbuildCustomVariable> = {
  name: "installdir",
  note: "The install directory of the application",
  value: `/opt/${referencePCV(defaultPCVApplicationName)}`,
};
const defaultPCVInstallDirBin: DeepReadonly<PkgbuildCustomVariable> = {
  name: "installdirbin",
  note: "The install directory for the global binaries",
  value: "/usr/bin",
};
const defaultPCVInstallDirDesktop: DeepReadonly<PkgbuildCustomVariable> = {
  name: "installdirdesktop",
  note: "The install directory for the .desktop files",
  value: "/usr/share/applications",
};
const defaultPCVInstallDirMan: DeepReadonly<PkgbuildCustomVariable> = {
  name: "installdirman",
  note: "The install directory for the man pages",
  value: "/usr/share/man/man1",
};
const defaultPCVConfigDir: DeepReadonly<PkgbuildCustomVariable> = {
  name: "defaultconfigdir",
  note: "The install directory for the man pages",
  value: `$HOME/.local/share/${referencePCV(defaultPCVApplicationName)}`,
};

const packageCmdsGenerator = (
  packageType: "source" | "bin" = "source"
): PkgbuildCmdsSection[] => {
  const packageCmds: PkgbuildCmdsSection[] = [];
  packageCmds.push({
    cmds: [`cd "${referencePV("srcdir")}/${referencePCV(defaultPCVGitName)}"`],
    note: "Go to the GIT directory in the source directory",
  });
  switch (packageType) {
    case "source":
      packageCmds.push({
        cmds: [
          `install -Dd "${referencePV("pkgdir")}${referencePCV(
            defaultPCVInstallDir
          )}"`,
          `find node_modules -not -path "*/__pycache__/*" -exec install -D {} "${referencePV(
            "pkgdir"
          )}${referencePCV(defaultPCVInstallDir)}/"{} \\;`,
          `find dist -exec install -D {} "${referencePV(
            "pkgdir"
          )}${referencePCV(defaultPCVInstallDir)}/"{} \\;`,
          `install -D package.json "${referencePV("pkgdir")}${referencePCV(
            defaultPCVInstallDir
          )}"`,
        ],
        note: "Create a directory in /opt and copy the files necessary for the runtime there",
      });
      break;
    case "bin":
      packageCmds.push({
        cmds: [
          `install -Dd "${referencePV("pkgdir")}${referencePCV(
            defaultPCVInstallDir
          )}"`,
          `install -Dm 755 "${referencePCV(
            defaultPCVApplicationName
          )}.bin" "${referencePV("pkgdir")}${referencePCV(
            defaultPCVInstallDir
          )}"`,
        ],
        note: "Create a directory in /opt and copy the binary file there",
      });
      break;
  }
  packageCmds.push({
    cmds: [
      `install -Dm 644 "${referencePV("srcdir")}/${referencePCV(
        defaultPCVApplicationName
      )}.svg" "${referencePV("pkgdir")}${referencePCV(defaultPCVInstallDir)}"`,
    ],
    note: "Install the application icon",
  });
  packageCmds.push({
    cmds: [
      `echo -e "${[
        "#!/usr/bin/env bash",
        (packageType === "source"
          ? `node "${referencePCV(defaultPCVInstallDir)}"`
          : `"${referencePCV(defaultPCVInstallDir)}/${referencePCV(
              defaultPCVApplicationName
            )}.bin"`) +
          ` --config-dir "${referencePCV(defaultPCVConfigDir)}" \\$@`,
      ]
        .map((a) => `\\\n${a}\\n`)
        .join("")
        // eslint-disable-next-line @typescript-eslint/quotes
        .replace(/"/g, '\\"')}" > "${referencePCV(defaultPCVApplicationName)}"`,
      `install -Dd "${referencePV("pkgdir")}${referencePCV(
        defaultPCVInstallDirBin
      )}"`,
      `install -Dm 755 "${referencePCV(
        defaultPCVApplicationName
      )}" "${referencePV("pkgdir")}${referencePCV(defaultPCVInstallDirBin)}"`,
    ],
    note: "Create and install a global script to start the application",
  });
  packageCmds.push();
  packageCmds.push({
    cmds: [
      `echo -e "${[
        "[Desktop Entry]",
        "Version=1.0",
        "Type=Application",
        "Terminal=true",
        `Exec=${referencePCV(
          defaultPCVApplicationName
        )}; read -n1 -p "Press any key to exit."`,
        `Name=${referencePCV(defaultPCVApplicationName)}`,
        `Comment=${referencePV("pkgdesc")}`,
        `Icon=${referencePCV(defaultPCVInstallDir)}/${referencePCV(
          defaultPCVApplicationName
        )}.svg`,
      ]
        .map((a) => `\\\n${a}\\n`)
        .join("")
        // eslint-disable-next-line @typescript-eslint/quotes
        .replace(/"/g, '\\"')}" > "${referencePCV(
        defaultPCVApplicationName
      )}.desktop"`,
      `install -Dd "${referencePV("pkgdir")}${referencePCV(
        defaultPCVInstallDirDesktop
      )}"`,
      `install -Dm 644 "${referencePCV(
        defaultPCVApplicationName
      )}.desktop" "${referencePV("pkgdir")}${referencePCV(
        defaultPCVInstallDirDesktop
      )}"`,
    ],
    note: "Create and install .desktop entry",
  });
  packageCmds.push({
    cmds: [
      `install -Dm 644 "${referencePV("srcdir")}/${referencePCV(
        defaultPCVApplicationName
      )}.1" "${referencePV("pkgdir")}${referencePCV(
        defaultPCVInstallDirMan
      )}/${referencePCV(defaultPCVApplicationName)}.1"`,
    ],
    note: "Install manpage",
  });
  return packageCmds;
};

const pkgbuildInfo: DeepReadonly<PkgbuildInfo> = {
  arch: "x86_64",
  buildCmds: [
    {
      cmds: [
        `cd "${referencePV("srcdir")}/${referencePCV(defaultPCVGitName)}"`,
      ],
      note: "Go to the GIT directory in the source directory",
    },
    {
      cmds: ["npm install"],
      note: "Install build and runtime dependencies",
    },
    {
      cmds: ["npm install uuid"],
      note: "Install uuid dependency because it throws errors on some systems",
    },
    {
      cmds: ["npm run build"],
      note: "Compile TypeScript application to JavaScript",
    },
    {
      cmds: ["npm prune --production"],
      note: "Remove build dependencies",
    },
    {
      cmds: [
        `pandoc "installer/man.md" -s -t man -o "${referencePV(
          "srcdir"
        )}/${referencePCV(defaultPCVApplicationName)}.1"`,
      ],
      note: "Create manpage",
    },
    {
      cmds: [
        `cp "res/icons/${referencePCV(
          defaultPCVApplicationName
        )}.svg" "${referencePV("srcdir")}/${referencePCV(
          defaultPCVApplicationName
        )}.svg"`,
      ],
      note: "Create application icon",
    },
  ],
  buildCmdsNote: "Create all files necessary for installation",
  conflicts: [
    referencePCV(defaultPCVApplicationName),
    `${referencePCV(defaultPCVApplicationName)}-bin`,
    `${referencePCV(defaultPCVApplicationName)}-git`,
  ],
  customVariables: [
    defaultPCVApplicationName,
    defaultPCVGitName,
    defaultPCVInstallDir,
    defaultPCVInstallDirBin,
    defaultPCVInstallDirDesktop,
    defaultPCVInstallDirMan,
    defaultPCVConfigDir,
  ],
  depends: "nodejs",
  dependsNote: "Node.js runtime is required",
  license: "MIT",
  maintainer: {
    email: "niklas.mikeler@gmail.com",
    name: "AnonymerNiklasistanonym",
  },
  makedepends: ["nodejs", "npm", "pandoc"],
  makedependsNote: [
    "Node.js and npm is required to build the program",
    "Pandoc is required to create the man page",
  ],
  packageCmds: packageCmdsGenerator("source"),
  packageCmdsNote: "Define where files should be installed",
  pkgdesc: description,
  pkgname: referencePCV(defaultPCVApplicationName),
  pkgver: getVersionString(version, ""),
  provides: referencePV("pkgname"),
  source: [
    {
      name: `${referencePCV(defaultPCVGitName)}::git+${referencePV(
        "url"
      )}#tag=v${referencePV("pkgver")}`,
    },
  ],
  url: sourceCodeUrl,
};

const pkgbuildBinInfoDownloadUrl = `${referencePV(
  "url"
)}/releases/download/v${referencePV("pkgver")}/`;

const pkgbuildBinInfo: DeepReadonly<PkgbuildInfo> = {
  ...pkgbuildInfo,
  buildCmds: undefined,
  buildCmdsNote: undefined,
  customVariables: convertUndefValueToArray(
    pkgbuildInfo.customVariables
  ).filter((a) => a.name !== defaultPCVGitName.name),
  depends: undefined,
  dependsNote: undefined,
  makedepends: undefined,
  makedependsNote: undefined,
  options: "!strip",
  optionsNote:
    "Don't strip the symbols from the downloaded binary file since this breaks it",
  packageCmds: packageCmdsGenerator("bin"),
  pkgname: `${referencePCV(defaultPCVApplicationName)}-bin`,
  source: [
    {
      name: `${referencePCV(
        defaultPCVApplicationName
      )}.bin::${pkgbuildBinInfoDownloadUrl}${referencePCV(
        defaultPCVApplicationName
      )}-v${referencePV("pkgver")}-linux64-node-18`,
    },
    {
      name: `${referencePCV(
        defaultPCVApplicationName
      )}.1::${pkgbuildBinInfoDownloadUrl}${referencePCV(
        defaultPCVApplicationName
      )}-v${referencePV("pkgver")}-man.1`,
    },
    {
      name: `${referencePCV(
        defaultPCVApplicationName
      )}.svg::${pkgbuildBinInfoDownloadUrl}${referencePCV(
        defaultPCVApplicationName
      )}.svg`,
    },
  ],
};

const pkgbuildGitInfo: DeepReadonly<PkgbuildInfo> = {
  ...pkgbuildInfo,
  pkgname: `${referencePCV(defaultPCVApplicationName)}-git`,
  pkgverCmds: [
    {
      cmds: [
        `cd "${referencePV("srcdir")}/${referencePCV(defaultPCVGitName)}"`,
      ],
      note: "Go to the GIT directory in the source directory",
    },
    {
      cmds: [
        "git describe --tags | grep '^v' | sed 's/\\([^-]*-g\\)/r\\1/;s/-/./g' | cut -c2-",
      ],
      note: "Run command that creates new version string",
    },
  ],
  pkgverCmdsNote: "Update version based on the current commit",
  source: [
    {
      name: `${referencePCV(defaultPCVGitName)}::git+${referencePV(
        "url"
      )}#branch=main`,
    },
  ],
};

const INSTALLER_DIR = path.join(__dirname, "..", "installer");
const fileNamePkgbuild = "PKGBUILD";

const filePathOutputPkgbuild = path.join(INSTALLER_DIR, fileNamePkgbuild);
/** The output file path of the PKGBUILD for the binary files to create. */
const filePathOutputPkgbuildBin = path.join(
  INSTALLER_DIR,
  `${fileNamePkgbuild}_BIN`
);
/** The output file path of the PKGBUILD for the latest git commit to create. */
const filePathOutputPkgbuildGit = path.join(
  INSTALLER_DIR,
  `${fileNamePkgbuild}_GIT`
);

// -----------------------------------------------------------------------------

Promise.all([
  createJob("PKGBUILD", filePathOutputPkgbuild, createPkgbuild(pkgbuildInfo)),
  createJob(
    "PKGBUILD_BIN",
    filePathOutputPkgbuildBin,
    createPkgbuild(pkgbuildBinInfo)
  ),
  createJob(
    "PKGBUILD_GIT",
    filePathOutputPkgbuildGit,
    createPkgbuild(pkgbuildGitInfo)
  ),
]).catch(console.error);
