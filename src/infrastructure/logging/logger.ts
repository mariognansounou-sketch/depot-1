type LogLevel = "debug" | "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

/**
 * Minimal structured logger. Emits JSON lines so logs are easy to ship to
 * any aggregator (Datadog, Axiom, CloudWatch...) without extra dependencies.
 * Swap the `write` implementation when a real logging backend is wired up.
 */
class Logger {
  private write(level: LogLevel, message: string, fields?: LogFields) {
    const entry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...fields,
    };
    const line = JSON.stringify(entry);
    if (level === "error") {
      console.error(line);
    } else if (level === "warn") {
      console.warn(line);
    } else {
      console.log(line);
    }
  }

  debug(message: string, fields?: LogFields) {
    if (process.env.NODE_ENV !== "production") this.write("debug", message, fields);
  }
  info(message: string, fields?: LogFields) {
    this.write("info", message, fields);
  }
  warn(message: string, fields?: LogFields) {
    this.write("warn", message, fields);
  }
  error(message: string, fields?: LogFields) {
    this.write("error", message, fields);
  }
}

export const logger = new Logger();
