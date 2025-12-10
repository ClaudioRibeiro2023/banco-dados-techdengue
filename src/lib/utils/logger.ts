import { APP_CONFIG, FEATURE_FLAGS } from '@/lib/config';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;
  private isDebugMode: boolean;

  constructor() {
    this.isDevelopment = APP_CONFIG.isDevelopment;
    this.isDebugMode = FEATURE_FLAGS.debugMode;
  }

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context } = entry;
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} ${level} ${contextStr} ${message}`;
  }

  private log(entry: LogEntry): void {
    if (!this.isDebugMode && entry.level === LogLevel.DEBUG) {
      return;
    }

    const formattedMessage = this.formatMessage(entry);

    switch (entry.level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedMessage, entry.data);
        }
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, entry.data, entry.error);
        break;
    }

    if (typeof window !== 'undefined' && entry.level === LogLevel.ERROR) {
      this.sendToMonitoring(entry);
    }
  }

  private sendToMonitoring(entry: LogEntry): void {
    // TODO: Integrate with Sentry or other monitoring service
    // For now, just store in sessionStorage for debugging
    try {
      const logs = JSON.parse(sessionStorage.getItem('error_logs') || '[]');
      logs.push({
        ...entry,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
      // Keep only last 50 errors
      if (logs.length > 50) {
        logs.shift();
      }
      sessionStorage.setItem('error_logs', JSON.stringify(logs));
    } catch {
      // Ignore storage errors
    }
  }

  debug(message: string, data?: unknown, context?: string): void {
    this.log({
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
    });
  }

  info(message: string, data?: unknown, context?: string): void {
    this.log({
      level: LogLevel.INFO,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
    });
  }

  warn(message: string, data?: unknown, context?: string): void {
    this.log({
      level: LogLevel.WARN,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
    });
  }

  error(message: string, error?: Error, data?: unknown, context?: string): void {
    this.log({
      level: LogLevel.ERROR,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
      error,
    });
  }

  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  table(data: unknown): void {
    if (this.isDevelopment) {
      console.table(data);
    }
  }

  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }
}

export const logger = new Logger();

export default logger;
