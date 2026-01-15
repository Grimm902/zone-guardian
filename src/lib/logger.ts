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
 * Logs to remote error tracking service (Sentry)
 */
private logRemote(level: LogLevel, message: string, ...args: unknown[]): void {
  // Only log errors to Sentry
  if (level >= LogLevel.ERROR && typeof window !== 'undefined' && (window as unknown as { Sentry?: typeof import('@sentry/react') }).Sentry) {
    const Sentry = (window as unknown as { Sentry: typeof import('@sentry/react') }).Sentry;
    const error = args[0] instanceof Error ? args[0] : new Error(message);
    
    Sentry.captureException(error, {
      level: this.getSentryLevel(level),
      extra: {
        message,
        args: args.length > 1 ? args.slice(1) : undefined,
      },
    });
  }
}

/**
 * Gets the Sentry severity level
 */
private getSentryLevel(level: LogLevel): 'debug' | 'info' | 'warning' | 'error' {
  switch (level) {
    case LogLevel.DEBUG:
      return 'debug';
    case LogLevel.INFO:
      return 'info';
    case LogLevel.WARN:
      return 'warning';
    case LogLevel.ERROR:
      return 'error';
    default:
      return 'error';
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
 * Initialize error tracking service (Sentry)
 * Call this in your main.tsx or App.tsx
 */
export const initializeErrorTracking = async (): Promise<void> => {
  // Only initialize Sentry if DSN is provided
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (sentryDsn && typeof window !== 'undefined') {
    try {
      const Sentry = await import('@sentry/react');
      
      Sentry.init({
        dsn: sentryDsn,
        environment: import.meta.env.MODE || 'development',
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        replaysOnErrorSampleRate: 1.0,
      });

      // Make Sentry available globally for logger
      (window as unknown as { Sentry: typeof Sentry }).Sentry = Sentry;
    } catch (error) {
      // Silently fail if Sentry initialization fails
      logger.warn('Failed to initialize Sentry', error);
    }
  }

  // Set up global error handlers
  if (typeof window !== 'undefined') {
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
  }
};
