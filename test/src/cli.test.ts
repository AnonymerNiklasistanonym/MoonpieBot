import {
  CliVariable,
  getCliVariableName,
  getCliVariableValue,
  getCliVariableValueOrCustomDefault,
  printCliVariablesToConsole,
} from "../../src/cli";
import { describe } from "mocha";
import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

export interface ConsoleLogRestore {
  restore: () => void;
}

describe("cli", () => {
  const sandbox = sinon.createSandbox();
  beforeEach(() => {
    sinon.stub(console, "log");
    sandbox.stub(process, "env").value({
      MOONPIE_CONFIG_LOGGING_DIR_LOGS_PATH: "logs_expected",
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
    printCliVariablesToConsole();
    chai.expect(console.log).to.be.called;
  });

  it("getCliVariableName", () => {
    chai
      .expect(getCliVariableName(CliVariable.LOGGING_DIR_LOGS_PATH))
      .to.be.equal("MOONPIE_CONFIG_LOGGING_DIR_LOGS_PATH");
    chai
      .expect(getCliVariableName(CliVariable.LOGGING_CONSOLE_LOG_LEVEL))
      .to.be.equal("MOONPIE_CONFIG_LOGGING_CONSOLE_LOG_LEVEL");
    chai
      .expect(getCliVariableName(CliVariable.TWITCH_CHANNELS))
      .to.be.equal("MOONPIE_CONFIG_TWITCH_CHANNELS");
    chai
      .expect(getCliVariableName(CliVariable.TWITCH_NAME))
      .to.be.equal("MOONPIE_CONFIG_TWITCH_NAME");
    chai
      .expect(getCliVariableName(CliVariable.TWITCH_OAUTH_TOKEN))
      .to.be.equal("MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN");
    chai
      .expect(getCliVariableName(CliVariable.TWITCH_CHANNELS))
      .to.be.equal("MOONPIE_CONFIG_TWITCH_CHANNELS");
    chai
      .expect(getCliVariableName(CliVariable.MOONPIE_DATABASE_PATH))
      .to.be.equal("MOONPIE_CONFIG_MOONPIE_DATABASE_PATH");
  });

  it("getCliVariableValue", () => {
    chai
      .expect(getCliVariableValue(CliVariable.LOGGING_DIR_LOGS_PATH))
      .to.be.equal("logs_expected");
    chai
      .expect(getCliVariableValue(CliVariable.LOGGING_CONSOLE_LOG_LEVEL))
      .to.be.equal("console_info_expected");
    chai
      .expect(getCliVariableValue(CliVariable.LOGGING_FILE_LOG_LEVEL))
      .to.be.equal("file_info_expected");
    chai
      .expect(getCliVariableValue(CliVariable.TWITCH_NAME))
      .to.be.equal("twitchName_expected");
    chai
      .expect(getCliVariableValue(CliVariable.TWITCH_OAUTH_TOKEN))
      .to.be.equal("twitchOAuthToken_expected");
    chai
      .expect(getCliVariableValue(CliVariable.TWITCH_CHANNELS))
      .to.be.equal("twitchChannels_expected");
    chai
      .expect(getCliVariableValue(CliVariable.MOONPIE_DATABASE_PATH))
      .to.be.equal("dbFilepath_expected");

    sandbox.stub(process, "env").value({
      MOONPIE_CONFIG_LOGGING_DIR_LOGS_PATH: "logs_expected",
    });

    chai
      .expect(getCliVariableValue(CliVariable.TWITCH_CHANNELS))
      .to.be.equal(undefined);
  });

  it("getCliVariableValueOrCustomDefault", () => {
    sandbox.stub(process, "env").value({
      MOONPIE_CONFIG_LOGGING_DIR_LOGS_PATH: "logs_expected",
    });

    chai
      .expect(
        getCliVariableValueOrCustomDefault(
          CliVariable.TWITCH_CHANNELS,
          "default_value"
        )
      )
      .to.be.equal("default_value");

    chai
      .expect(
        getCliVariableValueOrCustomDefault(
          CliVariable.LOGGING_DIR_LOGS_PATH,
          "default_value"
        )
      )
      .to.be.equal("logs_expected");
  });
});
