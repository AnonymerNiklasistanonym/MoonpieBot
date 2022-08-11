# Plugins

## Type of plugins

1. Standalone plugins: These plugins can just be added because they don't require any input data like API keys, run time information or passwords.
2. Plugin generators: These plugins need extra data to be able to run.

## Standalone Plugin

```ts
import type { MessageParserPlugin } from "../plugins";

// Should always start with "plugin"
export const pluginStandalone: MessageParserPlugin = {
  id: "PLUGIN_ID_STRING",
  description: "...",
  examples: [
    { argument: "argument", scope: "text" },
  ],
  func: (logger, argument, signature) => {
    if (signature === true) {
      return { type: "signature", argument: "example", scope: "text" };
    }
    // Return [] if the scope text should be parsed
    // Return any string if the scope should be ignored and the string used instead
    return argument === "show" ? [] : "";
  },
};
```

The code in the caller function:

```ts
pluginsMap.set(pluginStandalone.id, pluginStandalone.func);
```

## Plugin Generator

```ts
import type { MessageParserPluginGenerator } from "../plugins";

// Enum that lists all exported plugins with string IDs
// Should always be named "Plugin" Name
export enum PluginName {
  NAME1_ID = "NAME1_ID",
  NAME2_ID = "NAME2_ID",
}

// Should always be named "Plugin" Name "Data"
interface PluginNameData {
  someData: string;
}

// The Plugin generator data structure can be converted to MessageParserPlugin's
// Should always be named "plugins" Name "Generator"
export const pluginsNameGenerator: MessageParserPluginGenerator<PluginNameData>[] =
  [
    {
      id: PluginName.NAME1_ID,
      signature: {
        type: "signature",
        argument: "argument",
      },
      generate: (data) => async (logger, argument) => {
        // No signature handling in here, it will be added when generated from the object

        // Return [] if the scope text should be parsed
        // Return any string if the scope should be ignored and the string used instead
        return argument === "show" ? [] : "";
      },
    }
  ];
```

The code in the caller function:

```ts
pluginsNameGenerator.forEach((a) => {
  const plugin = generatePlugin<PluginNameData>(a, { ...data });
  pluginsMap.set(plugin.id, plugin.func);
});
```
