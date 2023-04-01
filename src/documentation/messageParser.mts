// Relative imports
import {
  createPluginSignature,
  generateMacroMap,
  generatePluginMap,
  messageParser,
} from "../messageParser.mjs";
import { createMessageParserMessage } from "../messageParser.mjs";
import { FileDocumentationPartType } from "./fileDocumentationGenerator.mjs";
import { genericStringSorter } from "../other/genericStringSorter.mjs";
// Type imports
import type {
  DeepReadonly,
  DeepReadonlyArray,
  OrArray,
  OrUndef,
} from "../other/types.mjs";
import type {
  FileDocumentationParts,
  FileDocumentationPartValue,
} from "./fileDocumentationGenerator.mjs";
import type {
  MacroMap,
  MessageParserMacro,
  MessageParserMacroDocumentation,
  MessageParserMacroGenerator,
  MessageParserPlugin,
  MessageParserPluginInfo,
  PluginMap,
} from "../messageParser.mjs";
import type { Logger } from "winston";
import type { StringMap } from "../messageParser.mjs";

const documentPlugin = async (
  plugin: DeepReadonly<MessageParserPlugin | MessageParserPluginInfo>,
  strings: DeepReadonly<StringMap>,
  plugins: DeepReadonly<PluginMap>,
  macros: DeepReadonly<MacroMap>,
  logger: Readonly<Logger>
): Promise<FileDocumentationPartValue> => {
  const pluginExampleList: [string, OrArray<string>[]][] = [];
  if (plugin.examples !== undefined) {
    const pluginListExamples: string[][] = [];
    for (const pluginExample of plugin.examples) {
      const exampleString = createMessageParserMessage([
        pluginExample.before || "",
        {
          args: pluginExample.argument,
          name: plugin.id,
          scope: pluginExample.scope,
          type: "plugin",
        },
        pluginExample.after || "",
      ]);
      // Don't render random number or help -output because there is no seed
      if (pluginExample.hideOutput) {
        pluginListExamples.push([`"${exampleString}"`]);
      } else {
        try {
          const exampleStringOutput = await messageParser(
            exampleString,
            strings,
            plugins,
            macros,
            logger
          );
          pluginListExamples.push([
            `"${exampleString}"`,
            `=> "${exampleStringOutput}"`,
          ]);
        } catch (err) {
          if (pluginExample.expectedError !== undefined) {
            pluginListExamples.push([
              `"${exampleString}"`,
              "=> Plugin Error:",
              `"${(err as Error).message}"`,
            ]);
          } else if (pluginExample.expectedErrorCode !== undefined) {
            pluginListExamples.push([
              `"${exampleString}"`,
              "=> Parser Error:",
              `"${(err as Error).message}"`,
            ]);
          } else {
            throw err;
          }
        }
      }
    }
    pluginExampleList.push(["Examples", pluginListExamples]);
  }
  return {
    description: {
      lists: pluginExampleList,
      prefix: ">",
      text: plugin.description || "TODO",
    },
    title: [
      await createPluginSignature(
        logger,
        plugin.id,
        "func" in plugin ? plugin.func : undefined,
        "func" in plugin ? undefined : plugin.signature
      ),
    ],
    type: FileDocumentationPartType.VALUE,
  };
};

const documentMacro = async (
  macro: DeepReadonly<
    MessageParserMacro<string> | MessageParserMacroDocumentation<string>
  >,
  strings: DeepReadonly<StringMap>,
  plugins: DeepReadonly<PluginMap>,
  macros: DeepReadonly<MacroMap>,
  logger: Readonly<Logger>
): Promise<FileDocumentationPartValue> => {
  const macroAdditionalLists: [string, OrArray<string>[]][] = [];
  let macroListKeysTitle = "Keys";
  const macroListKeys: string[][] = [];
  if ("values" in macro) {
    for (const [key] of macro.values.entries()) {
      const macroString = `%${macro.id}:${key}%`;
      const macroStringOutput = await messageParser(
        macroString,
        strings,
        plugins,
        macros,
        logger
      );
      macroListKeys.push([`"${macroString}"`, `=> "${macroStringOutput}"`]);
    }
  } else {
    const macroGenerator = macro as
      | MessageParserMacro
      | MessageParserMacroGenerator;
    if (
      "generate" in macroGenerator &&
      macroGenerator.exampleData !== undefined
    ) {
      const macroValues = macroGenerator.generate(macroGenerator.exampleData);
      macroAdditionalLists.push([
        "Example data",
        [
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
        ],
      ]);
      for (const key of macroValues
        .map((a) => a[0])
        .sort(genericStringSorter)) {
        const macroString = `%${macro.id}:${key}%`;
        const extendedMacroMap = new Map([
          ...macros,
          [macro.id, new Map(macroValues)],
        ]);
        const macroStringOutput = await messageParser(
          macroString,
          strings,
          plugins,
          extendedMacroMap,
          logger
        );
        macroListKeys.push([`"${macroString}"`, `=> "${macroStringOutput}"`]);
      }
      macroListKeysTitle = "Keys generated by example data";
    } else {
      const sortedMacros = macro.keys.slice(0).sort(genericStringSorter);
      for (const key of sortedMacros) {
        const macroString = `%${macro.id}:${key}%`;
        macroListKeys.push([`"${macroString}"`]);
      }
    }
  }

  return {
    description: {
      lists: [...macroAdditionalLists, [macroListKeysTitle, macroListKeys]],
      prefix: ">",
      text: macro.description !== undefined ? macro.description : "TODO",
    },
    title: [`%${macro.id}:KEY%`],
    type: FileDocumentationPartType.VALUE,
  };
};

export const generatePluginAndMacroDocumentation = async (
  strings: DeepReadonly<StringMap>,
  plugins: DeepReadonlyArray<MessageParserPlugin>,
  macros: DeepReadonlyArray<MessageParserMacro>,
  optionalPlugins: OrUndef<DeepReadonlyArray<MessageParserPluginInfo>>,
  optionalMacros: OrUndef<DeepReadonlyArray<MessageParserMacroDocumentation>>,
  logger: Readonly<Logger>
): Promise<FileDocumentationParts[]> => {
  const pluginMap = generatePluginMap(plugins);
  const macroMap = generateMacroMap(macros);
  const output: FileDocumentationParts[] = [];
  output.push({
    title: "Supported Plugins",
    type: FileDocumentationPartType.HEADING,
  });
  if (plugins.length === 0) {
    output.push({
      text: "None",
      type: FileDocumentationPartType.TEXT,
    });
  }
  const pluginEntries: FileDocumentationPartValue[] = [];
  const pluginsSorted = plugins
    .slice()
    .sort((a, b) => genericStringSorter(a.id, b.id));
  for (const plugin of pluginsSorted) {
    pluginEntries.push(
      await documentPlugin(plugin, strings, pluginMap, macroMap, logger)
    );
  }
  output.push(...pluginEntries);
  output.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
  output.push({
    title: "Supported Macros",
    type: FileDocumentationPartType.HEADING,
  });
  if (macros.length === 0) {
    output.push({
      text: "None",
      type: FileDocumentationPartType.TEXT,
    });
  }
  const macroEntries: FileDocumentationPartValue[] = [];
  const macrosSorted = macros
    .slice()
    .sort((a, b) => genericStringSorter(a.id, b.id));
  for (const macro of macrosSorted) {
    macroEntries.push(
      await documentMacro(macro, strings, pluginMap, macroMap, logger)
    );
  }
  output.push(...macroEntries);

  if (optionalPlugins !== undefined && optionalPlugins.length > 0) {
    output.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
    output.push({
      title: "Other Plugins (not generally available in all strings)",
      type: FileDocumentationPartType.HEADING,
    });
    const optionalPluginEntries: FileDocumentationPartValue[] = [];
    const optionalPluginsSorted = optionalPlugins
      .slice()
      .sort((a, b) => genericStringSorter(a.id, b.id));
    for (const plugin of optionalPluginsSorted) {
      optionalPluginEntries.push(
        await documentPlugin(plugin, strings, pluginMap, macroMap, logger)
      );
    }
    output.push(...optionalPluginEntries);
  }

  if (optionalMacros !== undefined && optionalMacros.length > 0) {
    output.push({ count: 1, type: FileDocumentationPartType.NEWLINE });
    output.push({
      title: "Other Macros (not generally available in all strings)",
      type: FileDocumentationPartType.HEADING,
    });
    const optionalMacroEntries: FileDocumentationPartValue[] = [];
    const optionalMacrosSorted = optionalMacros
      .slice()
      .sort((a, b) => genericStringSorter(a.id, b.id));
    for (const macro of optionalMacrosSorted) {
      optionalMacroEntries.push(
        await documentMacro(macro, strings, pluginMap, macroMap, logger)
      );
    }
    output.push(...optionalMacroEntries);
  }

  return output;
};
