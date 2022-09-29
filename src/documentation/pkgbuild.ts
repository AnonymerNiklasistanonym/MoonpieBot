// Package imports
import { promises as fs } from "fs";

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

export const mergeSingleArrayToArray = <TYPE extends object | string>(
  value: TYPE | TYPE[]
): TYPE[] => {
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
};

export const mergeUndefSingleArrayToArray = <TYPE extends object | string>(
  value?: TYPE | TYPE[]
): TYPE[] => {
  if (value === undefined) {
    return [];
  }
  return mergeSingleArrayToArray(value);
};

export const createPkgbuildArray = (
  value?: string | string[],
  split = " ",
  literalValues = false
): string => {
  return `(${mergeUndefSingleArrayToArray(value)
    .map((a) => createPkgValue(a, literalValues))
    .join(split)})`;
};

export const createPkgbuildComment = (value?: string | string[]): string => {
  return `${mergeUndefSingleArrayToArray(value)
    .map((a) => `# ${a}\n`)
    .join("")}`;
};

export const createPkgbuildCmdsSection = (
  value: PkgbuildCmdsSection
): string => {
  let outputString = "";
  for (const note of mergeUndefSingleArrayToArray(value.note)) {
    outputString += `  # ${note}\n`;
  }
  outputString += value.cmds.map((a) => `  ${a}\n`).join("");
  return outputString;
};

export const createPkgValue = (
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
    const maintainers = mergeSingleArrayToArray(info.maintainer);
    if (maintainers.length > 0) {
      outputString += createPkgbuildComment(
        `Maintainer: ${maintainers
          .map((a) => `${a.name} <${a.email}>`)
          .join(", ")}`
      );
    }
  }
  // Custom variables
  const customVariables = mergeUndefSingleArrayToArray(info.customVariables);
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
  for (const source of mergeSingleArrayToArray(info.source)) {
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
    outputString += mergeSingleArrayToArray(info.pkgverCmds)
      .map(createPkgbuildCmdsSection)
      .join("\n");
    outputString += "}\n";
  }
  if (info.buildCmds) {
    outputString += "\n";
    outputString += createPkgbuildComment(info.buildCmdsNote);
    outputString += "build() {\n";
    outputString += mergeSingleArrayToArray(info.buildCmds)
      .map(createPkgbuildCmdsSection)
      .join("\n");
    outputString += "}\n";
  }
  if (info.packageCmds) {
    outputString += "\n";
    outputString += createPkgbuildComment(info.packageCmdsNote);
    outputString += "package() {\n";
    outputString += mergeSingleArrayToArray(info.packageCmds)
      .map(createPkgbuildCmdsSection)
      .join("\n");
    outputString += "}\n";
  }
  return outputString;
};

export const referencePV = (variable: string): string => `$${variable}`;

export const referencePCV = (customVariable: PkgbuildCustomVariable): string =>
  referencePV(`_${customVariable.name}`);

export const createPkgbuildFile = async (
  outputPath: string,
  info: PkgbuildInfo
): Promise<void> => {
  const outputString = createPkgbuild(info);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(outputPath, outputString);
};
