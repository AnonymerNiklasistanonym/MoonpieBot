/* eslint-disable no-magic-numbers */

// Package imports
import { expect } from "chai";
// Local imports
import { createMessageParserMessage } from "../../../src/messageParser/createMessageParserMessage";
import { defaultPlugins } from "../../../src/info/plugins";
import { getTestLogger } from "../logger";
import { messageParser } from "../../../src/messageParser";
import { ParseTreeNodeError } from "../../../src/messageParser/errors";
import { pluginRandomNumber } from "../../../src/info/plugins/general";
// Type imports
import type {
  MessageParserPlugin,
  MessageParserPluginExample,
} from "../../../src/messageParser/plugins";
import type { Logger } from "winston";

const testPlugin = async (
  plugin: MessageParserPlugin,
  logger: Logger,
  additionalTests: MessageParserPluginExample[] = []
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
        logger
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
          })}`
        );
      } else {
        expect(output).to.be.equal(
          example.expectedOutput,
          JSON.stringify({ example, message, output, plugin: plugin.id })
        );
      }
    } catch (err) {
      if (example.expectedError !== undefined) {
        expect((err as ParseTreeNodeError)?.pluginError).to.be.equal(
          example.expectedError,
          JSON.stringify({ err, example, message, plugin: plugin.id })
        );
      } else if (example.expectedErrorCode !== undefined) {
        expect((err as ParseTreeNodeError).code).to.be.equal(
          example.expectedErrorCode,
          JSON.stringify({ err, example, message, plugin: plugin.id })
        );
      } else {
        throw err;
      }
    }
  }
};

export default (): Mocha.Suite => {
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
