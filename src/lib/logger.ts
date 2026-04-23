export type LogLevel = "info" | "warn" | "error";

export interface LogContext {
  route?: string;
  event?: string;
  chatType?: string;
  updateId?: number;
  status?: number;
  error?: string;
  [key: string]: unknown;
}

function write(level: LogLevel, message: string, context?: LogContext): void {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context
  };

  console[level](JSON.stringify(payload));
}

export const logger = {
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext) => write("warn", message, context),
  error: (message: string, context?: LogContext) => write("error", message, context)
};
