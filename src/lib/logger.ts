/**
 * Production-safe Logger
 * 
 * Axiom: "Nunca exponha logs em produção - use sistemas de observabilidade"
 * 
 * Usage:
 * - Development: Logs to console
 * - Production: Silent or sends to monitoring service
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  /**
   * General logging - only in development
   */
  log(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('log', message, context));
    }
  }

  /**
   * Info logging - only in development
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  /**
   * Warning logging - always log but send to monitoring in production
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message, context));
    } else if (this.isProduction) {
      // TODO: Send to monitoring service (Sentry, LogRocket, etc.)
      // this.sendToMonitoring('warn', message, context);
    }
  }

  /**
   * Error logging - always log and send to monitoring
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };

    if (this.isDevelopment) {
      console.error(this.formatMessage('error', message, errorContext));
      if (error instanceof Error) {
        console.error(error);
      }
    } else if (this.isProduction) {
      // TODO: Send to monitoring service (Sentry, LogRocket, etc.)
      // this.sendToMonitoring('error', message, errorContext);
    }
  }

  /**
   * Debug logging - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  /**
   * Performance logging
   */
  performance(label: string, duration: number, context?: LogContext): void {
    if (this.isDevelopment) {
      const perfContext = { ...context, duration: `${duration.toFixed(2)}ms` };
      console.log(this.formatMessage('log', `⚡ ${label}`, perfContext));
    }
  }

  /**
   * Send to external monitoring service (placeholder)
   */
  private sendToMonitoring(level: LogLevel, message: string, context?: LogContext): void {
    // Implementation for Sentry, LogRocket, DataDog, etc.
    // Example with Sentry:
    // Sentry.captureMessage(message, {
    //   level: level as SeverityLevel,
    //   extra: context,
    // });
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();

/**
 * Performance measurement helper
 */
export const measurePerformance = async <T>(
  label: string,
  fn: () => Promise<T> | T,
  context?: LogContext
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.performance(label, duration, context);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`${label} failed`, error as Error, { ...context, duration });
    throw error;
  }
};
