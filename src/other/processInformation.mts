// Package imports
import csv from "csv-parser";
import { exec } from "child_process";
import { Readable } from "stream";

export interface WindowsTasklistVOutputElement {
  "CPU Time": string;
  "Image Name": string;
  "Mem Usage": string;
  PID: string;
  "Session Name": string;
  "Session#": string;
  Status: string;
  "User Name": string;
  "Window Title": string;
}

interface ProcessInformationBase {
  platform: string;
}

export interface ProcessInformationWindows extends ProcessInformationBase {
  platform: "win32";
  processInformation?: WindowsTasklistVOutputElement;
}

/**
 * Get the information of a process.
 * @param processName The name of the process.
 * @returns The information of that process.
 */
export const getProcessInformationByName = async (
  processName: string,
): Promise<ProcessInformationWindows> => {
  let cmd = "";
  switch (process.platform) {
    case "win32":
      cmd = `tasklist /fi "imagename eq ${processName}*" /fo csv /v`;
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
        `Unsupported platform to check if process "${processName}" is running: "${process.platform}"`,
      );
  }

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line security/detect-child-process
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
          s.pipe(csv())
            .on("data", (data: WindowsTasklistVOutputElement) =>
              resultsWin32.push(data),
            )
            .on("end", () => {
              const processInformation = resultsWin32.find((a) =>
                a["Image Name"]
                  .toLowerCase()
                  .includes(processName.toLowerCase()),
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
            `Unsupported platform to check if process "${processName}" is running: "${process.platform}"`,
          );
      }
    });
  });
};
