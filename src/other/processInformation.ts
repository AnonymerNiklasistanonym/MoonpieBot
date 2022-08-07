// Package imports
import csv from "csv-parser";
import { exec } from "child_process";
import { Readable } from "stream";

interface WindowsTasklistVOutputElement {
  imageName: string;
  pid: string;
  sessionName: string;
  sessionNumber: string;
  memUsage: string;
  status: string;
  userName: string;
  cpuTime: string;
  windowTitle: string;
}

export const getProcessWindowTitle = async (
  processName: string
): Promise<undefined | string> => {
  let cmd = "";
  switch (process.platform) {
    case "win32":
      cmd = `tasklist /fi "imagename eq ${processName}*" /v /FO:CSV`;
      break;
    case "darwin":
      // TODO
      return undefined;
    case "linux":
      // TODO
      return undefined;
  }

  if (cmd === "") {
    return undefined;
  }

  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout /*, _stderr*/) => {
      if (err) {
        return reject(err);
      }

      const s = new Readable();
      s.push(stdout);
      s.push(null);

      const results: WindowsTasklistVOutputElement[] = [];
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
        .on("data", (data) =>
          results.push(data as WindowsTasklistVOutputElement)
        )
        .on("end", () => {
          resolve(
            results.find(
              (a) =>
                a.imageName.toLowerCase().indexOf(processName.toLowerCase()) >
                -1
            )?.windowTitle
          );
        })
        .on("error", (err) => {
          return reject(err);
        });
    });
  });
};

export const isProcessRunning = async (
  processName: string
): Promise<boolean> => {
  let cmd = "";
  switch (process.platform) {
    case "win32":
      cmd = `tasklist /fi "imagename eq ${processName}*"`;
      break;
    case "darwin":
      cmd = `ps -ax | grep ${processName}`;
      break;
    case "linux":
      cmd = `ps -A`;
      break;
  }

  if (cmd === "") {
    return false;
  }

  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout /*, _stderr*/) => {
      if (err) {
        reject(err);
      }

      resolve(stdout.toLowerCase().indexOf(processName.toLowerCase()) > -1);
    });
  });
};
