export type LogLevel = "debug" | "info" | "warn" | "error" | "success";

export interface LoggerOptions {
  service: string;
  minLevel?: LogLevel;
}

const LEVEL_PRIORITIES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  success: 2,
  warn: 3,
  error: 4,
};

const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

export class Logger {
  private service: string;
  private minLevel: LogLevel;

  constructor(options: LoggerOptions) {
    this.service = options.service;
    this.minLevel = options.minLevel || (process.env.LOG_LEVEL as LogLevel) || "info";
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITIES[level] >= LEVEL_PRIORITIES[this.minLevel];
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private log(level: LogLevel, message: string, meta?: any) {
    if (!this.shouldLog(level)) return;

    const isJson = process.env.LOG_FORMAT === "json";
    const timestamp = this.formatTimestamp();

    if (isJson) {
      const output = JSON.stringify({
        timestamp,
        level,
        service: this.service,
        message,
        ...(meta ? { meta } : {}),
      });
      if (level === "error") {
        console.error(output);
      } else {
        console.log(output);
      }
      return;
    }

    let levelColor = COLORS.cyan;
    let badge = "INFO";

    switch (level) {
      case "debug":
        levelColor = COLORS.dim;
        badge = "DEBUG";
        break;
      case "info":
        levelColor = COLORS.cyan;
        badge = "INFO ";
        break;
      case "success":
        levelColor = COLORS.green;
        badge = "OK   ";
        break;
      case "warn":
        levelColor = COLORS.yellow;
        badge = "WARN ";
        break;
      case "error":
        levelColor = COLORS.red;
        badge = "ERROR";
        break;
    }

    const prefix = `${COLORS.dim}${timestamp}${COLORS.reset} ${levelColor}[${badge}]${COLORS.reset} ${COLORS.magenta}[${this.service}]${COLORS.reset}`;

    if (level === "error") {
      if (meta !== undefined) {
        console.error(`${prefix} ${message}`, meta);
      } else {
        console.error(`${prefix} ${message}`);
      }
    } else {
      if (meta !== undefined) {
        console.log(`${prefix} ${message}`, meta);
      } else {
        console.log(`${prefix} ${message}`);
      }
    }
  }

  debug(message: string, meta?: any) {
    this.log("debug", message, meta);
  }

  info(message: string, meta?: any) {
    this.log("info", message, meta);
  }

  success(message: string, meta?: any) {
    this.log("success", message, meta);
  }

  warn(message: string, meta?: any) {
    this.log("warn", message, meta);
  }

  error(message: string, meta?: any) {
    this.log("error", message, meta);
  }
}

export function createLogger(service: string, minLevel?: LogLevel): Logger {
  return new Logger({ service, minLevel });
}

export default createLogger;
