// Package imports
import { expect, use } from "chai";
import { describe } from "mocha";
import { fileURLToPath } from "node:url";
import path from "path";
import sinon from "sinon";
import sinonChai from "sinon-chai";
// Relative imports
import {
  getEnvVariableName,
  getEnvVariableValue,
  getEnvVariableValueOrCustomDefault,
  printEnvVariablesToConsole,
} from "../../src/env.mjs";
import { cliHelpGenerator } from "../../src/cli.mjs";
import { EnvVariable } from "../../src/info/env.mjs";

use(sinonChai);

export interface ConsoleLogRestore {
  restore: () => void;
}

const dirname = path.dirname(fileURLToPath(import.meta.url));

describe("cli", () => {
  const sandbox = sinon.createSandbox();
  beforeEach(() => {
    sinon.stub(console, "log");
    sandbox.stub(process, "env").value({
      MOONPIE_CONFIG_LOGGING_CONSOLE_LOG_LEVEL: "info",
      MOONPIE_CONFIG_LOGGING_DIRECTORY_PATH: "logs_expected",
      MOONPIE_CONFIG_LOGGING_FILE_LOG_LEVEL: "error",
      MOONPIE_CONFIG_MOONPIE_DATABASE_PATH: "dbFilepath_expected",
      MOONPIE_CONFIG_TWITCH_CHANNELS: "twitchChannels_expected",
      MOONPIE_CONFIG_TWITCH_NAME: "twitchName_expected",
      MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN: "twitchOAuthToken_expected",
    });
  });

  afterEach(() => {
    sandbox.restore();
    // eslint-disable-next-line no-console
    (console.log as unknown as ConsoleLogRestore).restore();
  });

  it("printCliVariablesToConsole", () => {
    printEnvVariablesToConsole(process.cwd());
    // eslint-disable-next-line no-console
    expect(console.log).to.be.called;
  });

  it("getCliVariableName", () => {
    expect(getEnvVariableName(EnvVariable.LOGGING_DIRECTORY_PATH)).to.be.equal(
      "MOONPIE_CONFIG_LOGGING_DIRECTORY_PATH"
    );
    expect(
      getEnvVariableName(EnvVariable.LOGGING_CONSOLE_LOG_LEVEL)
    ).to.be.equal("MOONPIE_CONFIG_LOGGING_CONSOLE_LOG_LEVEL");
    expect(getEnvVariableName(EnvVariable.TWITCH_CHANNELS)).to.be.equal(
      "MOONPIE_CONFIG_TWITCH_CHANNELS"
    );
    expect(getEnvVariableName(EnvVariable.TWITCH_NAME)).to.be.equal(
      "MOONPIE_CONFIG_TWITCH_NAME"
    );
    expect(getEnvVariableName(EnvVariable.TWITCH_OAUTH_TOKEN)).to.be.equal(
      "MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN"
    );
    expect(getEnvVariableName(EnvVariable.MOONPIE_DATABASE_PATH)).to.be.equal(
      "MOONPIE_CONFIG_MOONPIE_DATABASE_PATH"
    );
  });

  it("getCliVariableValue", () => {
    expect(
      getEnvVariableValue(EnvVariable.LOGGING_DIRECTORY_PATH).value
    ).to.be.equal("logs_expected");
    expect(
      getEnvVariableValue(EnvVariable.LOGGING_CONSOLE_LOG_LEVEL).value
    ).to.be.equal("info");
    expect(
      getEnvVariableValue(EnvVariable.LOGGING_FILE_LOG_LEVEL).value
    ).to.be.equal("error");
    expect(getEnvVariableValue(EnvVariable.TWITCH_NAME).value).to.be.equal(
      "twitchName_expected"
    );
    expect(
      getEnvVariableValue(EnvVariable.TWITCH_OAUTH_TOKEN).value
    ).to.be.equal("twitchOAuthToken_expected");
    expect(getEnvVariableValue(EnvVariable.TWITCH_CHANNELS).value).to.be.equal(
      "twitchChannels_expected"
    );
    expect(
      getEnvVariableValue(EnvVariable.MOONPIE_DATABASE_PATH).value
    ).to.be.equal("dbFilepath_expected");

    sandbox.stub(process, "env").value({
      MOONPIE_CONFIG_TWITCH_CHANNELS: "logs_expected",
    });

    expect(getEnvVariableValue(EnvVariable.TWITCH_CHANNELS).value).to.be.equal(
      "logs_expected"
    );
  });

  it("getCliVariableValueOrCustomDefault", () => {
    sandbox.stub(process, "env").value({
      MOONPIE_CONFIG_LOGGING_DIRECTORY_PATH: "logs_expected",
    });

    expect(
      getEnvVariableValueOrCustomDefault(
        EnvVariable.LOGGING_FILE_LOG_LEVEL,
        "default_value"
      )
    ).to.be.equal("default_value");

    expect(
      getEnvVariableValueOrCustomDefault(
        EnvVariable.LOGGING_DIRECTORY_PATH,
        "default_value"
      )
    ).to.be.equal("logs_expected");
  });

  it("cliHelpGenerator", () => {
    expect(cliHelpGenerator("a", [], [], [], dirname)).to.be.equal(
      "Usage:\n  a"
    );
  });
});
