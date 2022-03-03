import {
  CliVariable,
  getCliVariableName,
  getCliVariableValue,
  getCliVariableValueDefault,
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
      MOONPIE_CONFIG_DIR_LOGS: "logs_expected",
      MOONPIE_CONFIG_CONSOLE_LOG_LEVEL: "console_info_expected",
      MOONPIE_CONFIG_FILE_LOG_LEVEL: "file_info_expected",
      MOONPIE_CONFIG_TWITCH_NAME: "twitchName_expected",
      MOONPIE_CONFIG_TWITCH_OAUTH_TOKEN: "twitchOAuthToken_expected",
      MOONPIE_CONFIG_TWITCH_CHANNELS: "twitchChannels_expected",
      MOONPIE_CONFIG_DB_FILEPATH: "dbFilepath_expected",
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
      .expect(getCliVariableName(CliVariable.DIR_LOGS))
      .to.be.equal("MOONPIE_CONFIG_DIR_LOGS");
    chai
      .expect(getCliVariableName(CliVariable.CONSOLE_LOG_LEVEL))
      .to.be.equal("MOONPIE_CONFIG_CONSOLE_LOG_LEVEL");
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
      .expect(getCliVariableName(CliVariable.DB_FILEPATH))
      .to.be.equal("MOONPIE_CONFIG_DB_FILEPATH");
  });

  it("getCliVariableValue", () => {
    chai
      .expect(getCliVariableValue(CliVariable.DIR_LOGS))
      .to.be.equal("logs_expected");
    chai
      .expect(getCliVariableValue(CliVariable.CONSOLE_LOG_LEVEL))
      .to.be.equal("console_info_expected");
    chai
      .expect(getCliVariableValue(CliVariable.FILE_LOG_LEVEL))
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
      .expect(getCliVariableValue(CliVariable.DB_FILEPATH))
      .to.be.equal("dbFilepath_expected");

    sandbox.stub(process, "env").value({
      MOONPIE_CONFIG_DIR_LOGS: "logs_expected",
    });

    chai
      .expect(getCliVariableValue(CliVariable.TWITCH_CHANNELS))
      .to.be.equal(undefined);
  });

  it("getCliVariableValueDefault", () => {
    sandbox.stub(process, "env").value({
      MOONPIE_CONFIG_DIR_LOGS: "logs_expected",
    });

    chai
      .expect(
        getCliVariableValueDefault(CliVariable.TWITCH_CHANNELS, "default_value")
      )
      .to.be.equal("default_value");

    chai
      .expect(getCliVariableValueDefault(CliVariable.DIR_LOGS, "default_value"))
      .to.be.equal("logs_expected");
  });
});
