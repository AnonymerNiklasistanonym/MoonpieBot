// Local imports
import {
  createPluginSignature,
  generateMacroMap,
  generatePluginMap,
  messageParser,
} from "../messageParser";
import { createMessageParserMessage } from "../messageParser";
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
  MessageParserPlugin,
  MessageParserPluginInfo,
} from "../messageParser";
import type { Logger } from "winston";
import type { StringMap } from "../messageParser";

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
      title: await createPluginSignature(logger, plugin.id, plugin.func),
      type: FileDocumentationPartType.VALUE,
    };
    if (plugin.examples && plugin.examples.length > 0) {
      pluginEntry.lists = [];
      const pluginListExamples = [];
      for (const example of plugin.examples) {
        const exampleString = createMessageParserMessage([
          example.before !== undefined ? example.before : "",
          {
            args: example.argument,
            name: plugin.id,
            scope: example.scope,
            type: "plugin",
          },
          example.after !== undefined ? example.after : "",
        ]);
        // Don't render random number output because there is no seed
        if (example.hideOutput) {
          pluginListExamples.push(`"${exampleString}"`);
        } else {
          try {
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
          } catch (err) {
            if (example.expectedError !== undefined) {
              pluginListExamples.push(
                `"${exampleString}" => Plugin Error: "${
                  (err as Error).message
                }"`
              );
            } else if (example.expectedErrorCode !== undefined) {
              pluginListExamples.push(
                `"${exampleString}" => Parser Error: "${
                  (err as Error).message
                }"`
              );
            } else {
              throw err;
            }
          }
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
        title: await createPluginSignature(
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
