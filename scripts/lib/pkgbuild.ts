// Local imports
import {
  convertUndefValueToArray,
  convertValueToArray,
} from "../../src/other/arrayOperations";
// Type imports
import type { OrArray } from "../../src/other/types";

export interface PkgbuildMaintainer {
  email: string;
  name: string;
}

export interface PkgbuildCustomVariable {
  name: string;
  note?: string;
  value: string;
}

export interface PkgbuildSource {
  name: string;
  sha1sum?: string;
}

export type SingleOrArray<TYPE> = TYPE | TYPE[];

export interface PkgbuildCmdsSection {
  cmds: string[];
  note?: SingleOrArray<string>;
}

export interface PkgbuildInfo {
  arch: SingleOrArray<string>;
  buildCmds?: SingleOrArray<PkgbuildCmdsSection>;
  buildCmdsNote?: SingleOrArray<string>;
  conflicts?: SingleOrArray<string>;
  customVariables?: SingleOrArray<PkgbuildCustomVariable>;
  depends?: SingleOrArray<string>;
  dependsNote?: SingleOrArray<string>;
  license: SingleOrArray<string>;
  maintainer?: PkgbuildMaintainer | PkgbuildMaintainer[];
  makedepends?: SingleOrArray<string>;
  makedependsNote?: SingleOrArray<string>;
  options?: SingleOrArray<string>;
  optionsNote?: SingleOrArray<string>;
  packageCmds?: SingleOrArray<PkgbuildCmdsSection>;
  packageCmdsNote?: SingleOrArray<string>;
  pkgdesc: string;
  pkgname: string;
  pkgrel?: number;
  pkgver: string;
  pkgverCmds?: SingleOrArray<PkgbuildCmdsSection>;
  pkgverCmdsNote?: SingleOrArray<string>;
  provides: SingleOrArray<string>;
  source: SingleOrArray<PkgbuildSource>;
  url: string;
}

const createPkgbuildArray = (
  value?: OrArray<string>,
  split = " ",
  literalValues = false
): string => {
  return `(${convertUndefValueToArray(value)
    .map((a) => createPkgValue(a, literalValues))
    .join(split)})`;
};

const createPkgbuildComment = (value?: OrArray<string>): string => {
  return `${convertUndefValueToArray(value)
    .map((a) => `# ${a}\n`)
    .join("")}`;
};

const createPkgbuildCmdsSection = (value: PkgbuildCmdsSection): string => {
  let outputString = "";
  for (const note of convertUndefValueToArray(value.note)) {
    outputString += `  # ${note}\n`;
  }
  outputString += value.cmds.map((a) => `  ${a}\n`).join("");
  return outputString;
};

const createPkgValue = (
  value: string | number,
  literalValue = false
): string => {
  if (literalValue) {
    return `${value}`;
  }
  return `"${value}"`;
};

export const createPkgbuild = (info: PkgbuildInfo): string => {
  let outputString = "";
  // Maintainer
  if (info.maintainer !== undefined) {
    const maintainers = convertValueToArray(info.maintainer);
    if (maintainers.length > 0) {
      outputString += createPkgbuildComment(
        `Maintainer: ${maintainers
          .map((a) => `${a.name} <${a.email}>`)
          .join(", ")}`
      );
    }
  }
  // Custom variables
  const customVariables = convertUndefValueToArray(info.customVariables);
  if (customVariables.length > 0) {
    outputString += outputString.length > 0 ? "\n" : "";
    outputString += createPkgbuildComment("Custom variables:");
    for (const customVariable of customVariables) {
      outputString += createPkgbuildComment(customVariable.note);
      outputString += `_${customVariable.name}="${customVariable.value}"\n`;
    }
    outputString += "\n";
  }
  outputString += `pkgname=${createPkgValue(info.pkgname)}\n`;
  outputString += `pkgver=${createPkgValue(info.pkgver)}\n`;
  outputString += `pkgrel=${createPkgValue(
    info.pkgrel !== undefined ? info.pkgrel : 1
  )}\n`;
  outputString += `pkgdesc=${createPkgValue(info.pkgdesc)}\n`;
  outputString += `arch=${createPkgbuildArray(info.arch)}\n`;
  outputString += `url=${createPkgValue(info.url)}\n`;
  outputString += `license=${createPkgbuildArray(info.license)}\n`;
  outputString += createPkgbuildComment(info.dependsNote);
  outputString += `depends=${createPkgbuildArray(info.depends)}\n`;
  outputString += createPkgbuildComment(info.makedependsNote);
  outputString += `makedepends=${createPkgbuildArray(info.makedepends)}\n`;
  outputString += `provides=${createPkgbuildArray(info.provides)}\n`;
  outputString += `conflicts=${createPkgbuildArray(info.conflicts)}\n`;
  // Sources and their sha1sums
  const sources: string[] = [];
  const sourcesSha1sums: string[] = [];
  for (const source of convertValueToArray(info.source)) {
    sources.push(source.name);
    sourcesSha1sums.push(
      source.sha1sum !== undefined ? source.sha1sum : "SKIP"
    );
  }
  outputString += `source=${createPkgbuildArray(sources, "\n        ")}\n`;
  outputString += `sha1sums=${createPkgbuildArray(
    sourcesSha1sums,
    "\n          "
  )}\n`;
  if (info.options) {
    outputString += createPkgbuildComment(info.optionsNote);
    outputString += `options=${createPkgbuildArray(
      info.options,
      undefined,
      true
    )}\n`;
  }
  if (info.pkgverCmds) {
    outputString += "\n";
    outputString += createPkgbuildComment(info.pkgverCmdsNote);
    outputString += "pkgver() {\n";
    outputString += convertValueToArray(info.pkgverCmds)
      .map(createPkgbuildCmdsSection)
      .join("\n");
    outputString += "}\n";
  }
  if (info.buildCmds) {
    outputString += "\n";
    outputString += createPkgbuildComment(info.buildCmdsNote);
    outputString += "build() {\n";
    outputString += convertValueToArray(info.buildCmds)
      .map(createPkgbuildCmdsSection)
      .join("\n");
    outputString += "}\n";
  }
  if (info.packageCmds) {
    outputString += "\n";
    outputString += createPkgbuildComment(info.packageCmdsNote);
    outputString += "package() {\n";
    outputString += convertValueToArray(info.packageCmds)
      .map(createPkgbuildCmdsSection)
      .join("\n");
    outputString += "}\n";
  }
  return outputString;
};

export const referencePV = (variable: string): string => `$${variable}`;

export const referencePCV = (customVariable: PkgbuildCustomVariable): string =>
  referencePV(`_${customVariable.name}`);
