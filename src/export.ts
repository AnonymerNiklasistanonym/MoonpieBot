export type ExportData = (
  configDir: string,
  json?: boolean
) => string | Promise<string>;
