import pc from "picocolors";

export const log = {
  info: (message: string) => console.log(pc.cyan(message)),
  ok: (message: string) => console.log(pc.green(message)),
  warn: (message: string) => console.warn(pc.yellow(message)),
  error: (message: string) => console.error(pc.red(message)),
};
