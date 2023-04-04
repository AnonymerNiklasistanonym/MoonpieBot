/* eslint-disable no-magic-numbers */

// Package imports
import { describe } from "mocha";
import { expect } from "chai";
// Relative imports
import {
  messageParser,
  ParseTreeNodeError,
} from "../../../src/messageParser.mjs";
import { createMessageParserMessage } from "../../../src/messageParser/createMessageParserMessage.mjs";
import { defaultPlugins } from "../../../src/info/plugins.mjs";
import { getTestLogger } from "../logger.mjs";
import { pluginRandomNumber } from "../../../src/info/plugins/general.mjs";
// Type imports
import type {
  DeepReadonly,
  DeepReadonlyArray,
  OrUndef,
} from "../../../src/other/types.mjs";
import type {
  MessageParserPlugin,
  MessageParserPluginExample,
} from "../../../src/messageParser.mjs";
import type { Logger } from "winston";
import type { Suite } from "mocha";

const testPlugin = async (
  plugin: DeepReadonly<MessageParserPlugin>,
  logger: Readonly<Logger>,
  additionalTests: DeepReadonlyArray<MessageParserPluginExample> = [],
) => {
  if (plugin.examples === undefined) {
    return;
  }
  for (const example of [...plugin.examples, ...additionalTests]) {
    const message = createMessageParserMessage([
      example.before !== undefined ? example.before : "",
      {
        args: example.argument,
        name: plugin.id,
        scope: example.scope,
        type: "plugin",
      },
      example.after !== undefined ? example.after : "",
    ]);
    try {
      const output = await messageParser(
        message,
        undefined,
        new Map([[plugin.id, plugin.func]]),
        undefined,
        logger,
      );
      if (example.hideOutput) {
        expect(output).to.be.a("string");
      } else if (example.expectedOutput === undefined) {
        logger.warn(
          `Missing expected string for ${JSON.stringify({
            example,
            message,
            output,
            plugin: plugin.id,
          })}`,
        );
      } else {
        expect(output).to.be.equal(
          example.expectedOutput,
          JSON.stringify({ example, message, output, plugin: plugin.id }),
        );
      }
    } catch (err) {
      if (example.expectedError !== undefined) {
        expect((err as OrUndef<ParseTreeNodeError>)?.pluginError).to.be.equal(
          example.expectedError,
          JSON.stringify({ err, example, message, plugin: plugin.id }),
        );
      } else if (example.expectedErrorCode !== undefined) {
        expect((err as OrUndef<ParseTreeNodeError>)?.code).to.be.equal(
          example.expectedErrorCode,
          JSON.stringify({ err, example, message, plugin: plugin.id }),
        );
      } else {
        throw err;
      }
    }
  }
};

export default (): Suite => {
  return describe("plugins", () => {
    const logger = getTestLogger("messageParser_plugins");
    it("default plugins", async () => {
      for (const plugin of defaultPlugins) {
        await testPlugin(plugin, logger);
      }
      await testPlugin(pluginRandomNumber, logger, [
        {
          argument: "0<->0",
          expectedOutput: "0",
        },
      ]);
    });
  });
};
