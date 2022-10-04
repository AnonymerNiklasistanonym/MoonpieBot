// Local imports
import {
  generateMacroMap,
  generatePluginMap,
  messageParser,
} from "../messageParser";
import { FileDocumentationPartType } from "../other/splitTextAtLength";
import { genericStringSorter } from "../other/genericStringSorter";
// Type imports
import type {
  FileDocumentationParts,
  FileDocumentationPartValue,
} from "../other/splitTextAtLength";
import type {
  MessageParserMacro,
  MessageParserMacroDocumentation,
  MessageParserMacroGenerator,
} from "../messageParser/macros";
import type {
  MessageParserPlugin,
  MessageParserPluginInfo,
  PluginFunc,
  PluginSignature,
} from "../messageParser/plugins";
import type { Logger } from "winston";
import type { StringMap } from "../strings";

export const createPluginSignatureString = async (
  logger: Logger,
  pluginName: string,
  pluginFunc?: PluginFunc,
  pluginSignatureObject?: PluginSignature
): Promise<string> => {
  // Check for plugin signature
  const argumentSignatures: string[] = [];
  let scopeSignature: string | undefined;
  try {
    let pluginSignature;
    if (pluginFunc !== undefined) {
      pluginSignature = await pluginFunc(logger, undefined, true);
    }
    if (pluginSignatureObject !== undefined) {
      pluginSignature = pluginSignatureObject;
    }
    if (
      typeof pluginSignature === "object" &&
      !(pluginSignature instanceof Map) &&
      pluginSignature?.type === "signature"
    ) {
      if (pluginSignature.argument) {
        if (Array.isArray(pluginSignature.argument)) {
          argumentSignatures.push(...pluginSignature.argument);
        } else {
          argumentSignatures.push(pluginSignature.argument);
        }
      }
      if (pluginSignature.scope) {
        scopeSignature = pluginSignature.scope;
      }
      if (
        pluginSignature.exportedMacros &&
        pluginSignature.exportedMacros.length > 0
      ) {
        if (scopeSignature === undefined) {
          scopeSignature = "";
        }
        if (scopeSignature.length > 0) {
          scopeSignature += ";";
        }
        for (const exportedMacro of pluginSignature.exportedMacros) {
          scopeSignature += `%${exportedMacro.id}:[${exportedMacro.keys
            .sort(genericStringSorter)
            .join(",")}]%`;
        }
      }
    }
  } catch (err) {
    // ignore
  }
  if (argumentSignatures.length === 0) {
    return `$(${pluginName}${scopeSignature ? "|" + scopeSignature : ""})`;
  }
  return argumentSignatures
    .map(
      (argumentSignature) =>
        `$(${pluginName}${
          argumentSignature && argumentSignature.length > 0
            ? "=" + argumentSignature
            : ""
        }${scopeSignature ? "|" + scopeSignature : ""})`
    )
    .join(",");
};

export const generatePluginAndMacroDocumentation = async (
  strings: StringMap,
  plugins: MessageParserPlugin[],
  macros: MessageParserMacro[],
  optionalPlugins: undefined | MessageParserPluginInfo[],
  optionalMacros: undefined | MessageParserMacroDocumentation[],
  logger: Logger
): Promise<FileDocumentationParts[]> => {
  const pluginsMap = generatePluginMap(plugins);
  const macrosMap = generateMacroMap(macros);
  const output: FileDocumentationParts[] = [];
  output.push({
    title: "Supported Plugins",
    type: FileDocumentationPartType.HEADING,
  });
  if (plugins.length === 0) {
    output.push({
      content: "None",
      type: FileDocumentationPartType.TEXT,
    });
  }
  const pluginEntries: FileDocumentationPartValue[] = [];
  for (const plugin of plugins) {
    const pluginEntry: FileDocumentationPartValue = {
      description: plugin.description,
      prefix: ">",
      title: await createPluginSignatureString(logger, plugin.id, plugin.func),
      type: FileDocumentationPartType.VALUE,
    };
    if (plugin.examples && plugin.examples.length > 0) {
      pluginEntry.lists = [];
      const pluginListExamples = [];
      for (const example of plugin.examples) {
        let exampleString = "";
        if (example.before) {
          exampleString += example.before;
        }
        exampleString += `$(${plugin.id}`;
        if (example.argument) {
          exampleString += `=${example.argument}`;
        }
        if (example.scope) {
          exampleString += `|${example.scope}`;
        }
        exampleString += ")";
        if (example.after) {
          exampleString += example.after;
        }
        // Don't render random number output because there is no seed
        if (example.hideOutput) {
          pluginListExamples.push(`"${exampleString}"`);
        } else {
          const exampleStringOutput = await messageParser(
            exampleString,
            strings,
            pluginsMap,
            macrosMap,
            logger
          );
          pluginListExamples.push(
            `"${exampleString}" => "${exampleStringOutput}"`
          );
        }
      }
      pluginEntry.lists.push(["Examples", pluginListExamples]);
    }
    pluginEntries.push(pluginEntry);
  }
  output.push(
    ...pluginEntries.sort((a, b) => genericStringSorter(a.title, b.title))
  );
  output.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
  output.push({
    title: "Supported Macros",
    type: FileDocumentationPartType.HEADING,
  });
  if (macros.length === 0) {
    output.push({
      content: "None",
      type: FileDocumentationPartType.TEXT,
    });
  }
  const macroEntries: FileDocumentationPartValue[] = [];
  for (const macro of macros) {
    const macroEntry: FileDocumentationPartValue = {
      description: macro.description,
      prefix: ">",
      title: `%${macro.id}:KEY%`,
      type: FileDocumentationPartType.VALUE,
    };
    macroEntry.lists = [];
    const macroListKeys = [];
    for (const [key] of macro.values.entries()) {
      const macroString = `%${macro.id}:${key}%`;
      const macroStringOutput = await messageParser(
        macroString,
        strings,
        pluginsMap,
        macrosMap,
        logger
      );
      macroListKeys.push(`"${macroString}" => "${macroStringOutput}"`);
    }
    macroEntry.lists.push(["Keys", macroListKeys]);
    macroEntries.push(macroEntry);
  }
  output.push(
    ...macroEntries.sort((a, b) => genericStringSorter(a.title, b.title))
  );

  if (optionalPlugins !== undefined && optionalPlugins.length > 0) {
    output.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
    output.push({
      title: "Other Plugins (not generally available in all strings)",
      type: FileDocumentationPartType.HEADING,
    });
    const optionalPluginEntries: FileDocumentationPartValue[] = [];
    for (const plugin of optionalPlugins) {
      const pluginEntry: FileDocumentationPartValue = {
        description: plugin.description,
        prefix: ">",
        title: await createPluginSignatureString(
          logger,
          plugin.id,
          undefined,
          plugin.signature
        ),
        type: FileDocumentationPartType.VALUE,
      };
      if (plugin.examples && plugin.examples.length > 0) {
        pluginEntry.lists = [];
        const pluginListExamples = [];
        for (const example of plugin.examples) {
          let exampleString = "";
          if (example.before) {
            exampleString += example.before;
          }
          exampleString += `$(${plugin.id}`;
          if (example.argument) {
            exampleString += `=${example.argument}`;
          }
          if (example.scope) {
            exampleString += `|${example.scope}`;
          }
          exampleString += ")";
          if (example.after) {
            exampleString += example.after;
          }
          const exampleStringOutput = await messageParser(
            exampleString,
            strings,
            pluginsMap,
            macrosMap,
            logger
          );
          pluginListExamples.push(
            `"${exampleString}" => "${exampleStringOutput}"`
          );
        }
        pluginEntry.lists.push(["Examples", pluginListExamples]);
      }
      optionalPluginEntries.push(pluginEntry);
    }
    output.push(
      ...optionalPluginEntries.sort((a, b) =>
        genericStringSorter(a.title, b.title)
      )
    );
  }

  if (optionalMacros !== undefined && optionalMacros.length > 0) {
    output.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
    output.push({
      title: "Other Macros (not generally available in all strings)",
      type: FileDocumentationPartType.HEADING,
    });
    const optionalMacroEntries: FileDocumentationPartValue[] = [];
    for (const optionalMacro of optionalMacros) {
      const macroEntry: FileDocumentationPartValue = {
        description: optionalMacro.description,
        prefix: ">",
        title: `%${optionalMacro.id}:KEY%`,
        type: FileDocumentationPartType.VALUE,
      };
      macroEntry.lists = [];
      const macroListKeys = [];
      const macroGenerator = optionalMacro as
        | MessageParserMacro
        | MessageParserMacroGenerator;
      if (
        "generate" in macroGenerator &&
        macroGenerator.exampleData !== undefined
      ) {
        const macroValues = macroGenerator.generate(macroGenerator.exampleData);
        macroEntry.lists.push([
          "Example data",
          [
            JSON.stringify(macroGenerator.exampleData, (_key, val) => {
              // Include functions in stringify output
              if (typeof val === "function") {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                return val
                  ?.toString()
                  ?.replace(/[\n\r]/g, "")
                  ?.replace(/\s{4}/g, "");
              }
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return val;
            }),
          ],
        ]);
        for (const key of macroValues
          .map((a) => a[0])
          .sort(genericStringSorter)) {
          const macroString = `%${optionalMacro.id}:${key}%`;
          const extendedMacroMap = new Map([
            ...macrosMap,
            [optionalMacro.id, new Map(macroValues)],
          ]);
          const macroStringOutput = await messageParser(
            macroString,
            strings,
            pluginsMap,
            extendedMacroMap,
            logger
          );
          macroListKeys.push(`"${macroString}" => "${macroStringOutput}"`);
        }
        macroEntry.lists.push([
          "Keys generated by example data",
          macroListKeys,
        ]);
      } else {
        for (const key of optionalMacro.keys.sort(genericStringSorter)) {
          const macroString = `%${optionalMacro.id}:${key}%`;
          macroListKeys.push(`"${macroString}"`);
        }
        macroEntry.lists.push(["Keys", macroListKeys]);
      }
      optionalMacroEntries.push(macroEntry);
    }
    output.push(
      ...optionalMacroEntries.sort((a, b) =>
        genericStringSorter(a.title, b.title)
      )
    );
  }

  return output;
};

interface MessageForMessageElement {
  type: string;
}
export type MessageForMessageElements =
  | string
  | MessageForMessageElementMacro
  | MessageForMessageElementPlugin
  | MessageForMessageElementReference;

export interface MessageForMessageElementPlugin
  extends MessageForMessageElement {
  args?: MessageForMessageElements[] | MessageForMessageElements;
  name: string;
  scope?: MessageForMessageElements[] | MessageForMessageElements;
  type: "plugin";
}

export interface MessageForMessageElementMacro
  extends MessageForMessageElement {
  key: string;
  name: string;
  type: "macro";
}

export interface MessageForMessageElementReference
  extends MessageForMessageElement {
  name: string;
  type: "reference";
}

export const createMessageForMessageParser = (
  message: MessageForMessageElements[],
  insidePlugin = false
): string =>
  message
    .map((a) => {
      if (typeof a === "string") {
        if (insidePlugin) {
          return a.replace(/\(/g, "\\(").replace(/\)/g, "\\)");
        }
        return a;
      }
      switch (a.type) {
        case "macro":
          return `%${a.name}:${a.key}%`;
        case "reference":
          return `$[${a.name}]`;
        case "plugin":
          // eslint-disable-next-line no-case-declarations
          let pluginText = `$(${a.name}`;
          if (a.args) {
            pluginText += `=${createMessageForMessageParser(
              Array.isArray(a.args) ? a.args : [a.args],
              true
            )}`;
          }
          if (a.scope) {
            pluginText += `|${createMessageForMessageParser(
              Array.isArray(a.scope) ? a.scope : [a.scope],
              true
            )}`;
          }
          pluginText += ")";
          return pluginText;
        default:
          return "ERROR";
      }
    })
    .join("");
