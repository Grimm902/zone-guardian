/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  level: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableRemote: !import.meta.env.DEV,
  remoteEndpoint: undefined, // Can be configured for error tracking services like Sentry
};

/**
 * Logger class for structured logging
 */
class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Logs a debug message
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.config.level <= LogLevel.DEBUG) {
      this.log(LogLevel.DEBUG, message, ...args);
    }
  }

  /**
   * Logs an info message
   */
  info(message: string, ...args: unknown[]): void {
    if (this.config.level <= LogLevel.INFO) {
      this.log(LogLevel.INFO, message, ...args);
    }
  }

  /**
   * Logs a warning message
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.config.level <= LogLevel.WARN) {
      this.log(LogLevel.WARN, message, ...args);
    }
  }

  /**
   * Logs an error message
   */
  error(message: string, error?: Error | unknown, ...args: unknown[]): void {
    if (this.config.level <= LogLevel.ERROR) {
      this.log(LogLevel.ERROR, message, error, ...args);
    }
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];

    // Console logging
    if (this.config.enableConsole) {
      const consoleMethod = this.getConsoleMethod(level);
      const prefix = `[${timestamp}] [${levelName}]`;
      consoleMethod(prefix, message, ...args);
    }

    // Remote logging (for error tracking services)
    if (this.config.enableRemote && level >= LogLevel.ERROR) {
      this.logRemote(level, message, ...args);
    }
  }

  /**
   * Gets the appropriate console method for the log level
   */
  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Logs to remote error tracking service
   * This is a placeholder for integration with services like Sentry
   */
  private logRemote(level: LogLevel, message: string, ...args: unknown[]): void {
    // TODO: Integrate with error tracking service (e.g., Sentry)
    // Example:
    // if (window.Sentry) {
    //   window.Sentry.captureException(new Error(message), {
    //     level: this.getSentryLevel(level),
    //     extra: { args },
    //   });
    // }

    // For now, just log that remote logging would happen
    if (this.config.remoteEndpoint) {
      // In a real implementation, you would send this to your error tracking service
      fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          message,
          args,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {
        // Silently fail if remote logging fails
      });
    }
  }

  /**
   * Sets the log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Updates the logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Default logger instance
 * Import and use this throughout the application
 */
export const logger = new Logger();

/**
 * Initialize error tracking service (e.g., Sentry)
 * Call this in your main.tsx or App.tsx
 */
export const initializeErrorTracking = (): void => {
  // TODO: Initialize error tracking service
  // Example for Sentry:
  // import * as Sentry from '@sentry/react';
  // Sentry.init({
  //   dsn: import.meta.env.VITE_SENTRY_DSN,
  //   environment: import.meta.env.MODE,
  //   integrations: [new Sentry.BrowserTracing()],
  //   tracesSampleRate: 1.0,
  // });

  // Set up global error handlers
  window.addEventListener('error', (event) => {
    logger.error('Unhandled error', event.error, {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', event.reason);
  });
};
