// Package imports
import csv from "csv-parser";
import { exec } from "child_process";
import { Readable } from "stream";

interface WindowsTasklistVOutputElement {
  cpuTime: string;
  imageName: string;
  memUsage: string;
  pid: string;
  sessionName: string;
  sessionNumber: string;
  status: string;
  userName: string;
  windowTitle: string;
}

interface ProcessInformationBase {
  platform: string;
}

interface ProcessInformationWindows extends ProcessInformationBase {
  platform: "win32";
  processInformation?: WindowsTasklistVOutputElement;
}

/**
 * Get the information of a process.
 *
 * @param processName The name of the process.
 * @returns The information of that process.
 */
export const getProcessInformationByName = async (
  processName: string
): Promise<ProcessInformationWindows> => {
  let cmd = "";
  switch (process.platform) {
    case "win32":
      cmd = `tasklist /fi "imagename eq ${processName}*"`;
      break;
    case "darwin":
      cmd = `ps -ax | grep ${processName}`;
      break;
    case "linux":
      cmd = "ps -A";
      break;
    default:
      // Throw errors on other platforms
      throw Error(
        `Unsupported platform to check if process "${processName}" is running: "${process.platform}"`
      );
  }

  return new Promise((resolve, reject) => {
    exec(cmd, (err, processInformationStdout /*, _stderr*/) => {
      if (err) {
        reject(err);
      }
      switch (process.platform) {
        case "win32":
          // eslint-disable-next-line no-case-declarations
          const resultsWin32: WindowsTasklistVOutputElement[] = [];
          // eslint-disable-next-line no-case-declarations
          const s = new Readable();
          s.push(processInformationStdout);
          s.push(null);
          s.pipe(
            csv([
              "imageName",
              "pid",
              "sessionName",
              "sessionNumber",
              "memUsage",
              "status",
              "userName",
              "cpuTime",
              "windowTitle",
            ])
          )
            .on("data", (data: WindowsTasklistVOutputElement) =>
              resultsWin32.push(data)
            )
            .on("end", () => {
              const processInformation = resultsWin32.find(
                (a) =>
                  a.imageName.toLowerCase().indexOf(processName.toLowerCase()) >
                  -1
              );
              resolve({
                platform: "win32",
                processInformation,
              });
            })
            .on("error", (pipeErr: Error) => {
              return reject(pipeErr);
            });
          break;
        default:
          // Throw errors on other platforms
          throw Error(
            `Unsupported platform to check if process "${processName}" is running: "${process.platform}"`
          );
      }
    });
  });
};
