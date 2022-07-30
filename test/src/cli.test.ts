// Package imports
import { describe } from "mocha";
import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
// Local imports
import {
  EnvVariable,
  getEnvVariableName,
  getEnvVariableValue,
  getEnvVariableValueOrCustomDefault,
  printEnvVariablesToConsole,
} from "../../src/env";

chai.use(sinonChai);

export interface ConsoleLogRestore {
  restore: () => void;
}

describe("cli", () => {
  const sandbox = sinon.createSandbox();
  beforeEach(() => {
    sinon.stub(console, "log");
    sandbox.stub(process, "env").value({
      MOONPIE_CONFIG_LOGGING_DIRECTORY_PATH: "logs_expected",
      MOONPIE_CONFIG_LOGGING_CONSOLE_LOG_LEVEL: "console_info_expected",
      MOONPIE_CONFIG_LOGGING_FILE_LOG_LEVEL: "file_info_expected",
      MOONPIE_CONFIG_TWITCH_NAME: "twitchName_expected",
      MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN: "twitchOAuthToken_expected",
      MOONPIE_CONFIG_TWITCH_CHANNELS: "twitchChannels_expected",
      MOONPIE_CONFIG_MOONPIE_DATABASE_PATH: "dbFilepath_expected",
    });
  });

  afterEach(() => {
    sandbox.restore();
    (console.log as unknown as ConsoleLogRestore).restore();
  });

  it("printCliVariablesToConsole", () => {
    printEnvVariablesToConsole();
    chai.expect(console.log).to.be.called;
  });

  it("getCliVariableName", () => {
    chai
      .expect(getEnvVariableName(EnvVariable.LOGGING_DIRECTORY_PATH))
      .to.be.equal("MOONPIE_CONFIG_LOGGING_DIRECTORY_PATH");
    chai
      .expect(getEnvVariableName(EnvVariable.LOGGING_CONSOLE_LOG_LEVEL))
      .to.be.equal("MOONPIE_CONFIG_LOGGING_CONSOLE_LOG_LEVEL");
    chai
      .expect(getEnvVariableName(EnvVariable.TWITCH_CHANNELS))
      .to.be.equal("MOONPIE_CONFIG_TWITCH_CHANNELS");
    chai
      .expect(getEnvVariableName(EnvVariable.TWITCH_NAME))
      .to.be.equal("MOONPIE_CONFIG_TWITCH_NAME");
    chai
      .expect(getEnvVariableName(EnvVariable.TWITCH_OAUTH_TOKEN))
      .to.be.equal("MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN");
    chai
      .expect(getEnvVariableName(EnvVariable.TWITCH_CHANNELS))
      .to.be.equal("MOONPIE_CONFIG_TWITCH_CHANNELS");
    chai
      .expect(getEnvVariableName(EnvVariable.MOONPIE_DATABASE_PATH))
      .to.be.equal("MOONPIE_CONFIG_MOONPIE_DATABASE_PATH");
  });

  it("getCliVariableValue", () => {
    chai
      .expect(getEnvVariableValue(EnvVariable.LOGGING_DIRECTORY_PATH).value)
      .to.be.equal("logs_expected");
    chai
      .expect(getEnvVariableValue(EnvVariable.LOGGING_CONSOLE_LOG_LEVEL).value)
      .to.be.equal("console_info_expected");
    chai
      .expect(getEnvVariableValue(EnvVariable.LOGGING_FILE_LOG_LEVEL).value)
      .to.be.equal("file_info_expected");
    chai
      .expect(getEnvVariableValue(EnvVariable.TWITCH_NAME).value)
      .to.be.equal("twitchName_expected");
    chai
      .expect(getEnvVariableValue(EnvVariable.TWITCH_OAUTH_TOKEN).value)
      .to.be.equal("twitchOAuthToken_expected");
    chai
      .expect(getEnvVariableValue(EnvVariable.TWITCH_CHANNELS).value)
      .to.be.equal("twitchChannels_expected");
    chai
      .expect(getEnvVariableValue(EnvVariable.MOONPIE_DATABASE_PATH).value)
      .to.be.equal("dbFilepath_expected");

    sandbox.stub(process, "env").value({
      MOONPIE_CONFIG_LOGGING_DIRECTORY_PATH: "logs_expected",
    });

    chai
      .expect(getEnvVariableValue(EnvVariable.TWITCH_CHANNELS).value)
      .to.be.equal(undefined);
  });

  it("getCliVariableValueOrCustomDefault", () => {
    sandbox.stub(process, "env").value({
      MOONPIE_CONFIG_LOGGING_DIRECTORY_PATH: "logs_expected",
    });

    chai
      .expect(
        getEnvVariableValueOrCustomDefault(
          EnvVariable.TWITCH_CHANNELS,
          "default_value"
        )
      )
      .to.be.equal("default_value");

    chai
      .expect(
        getEnvVariableValueOrCustomDefault(
          EnvVariable.LOGGING_DIRECTORY_PATH,
          "default_value"
        )
      )
      .to.be.equal("logs_expected");
  });
});
