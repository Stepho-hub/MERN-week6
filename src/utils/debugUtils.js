/**
 * Debug utilities for MERN stack application
 * Provides logging, error tracking, and performance monitoring
 */

// Debug levels
export const DEBUG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Current debug level (can be set via environment variable)
const currentLevel = process.env.NODE_ENV === 'development' ? DEBUG_LEVELS.DEBUG : DEBUG_LEVELS.ERROR;

/**
 * Enhanced console logger with levels and context
 */
export class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  error(message, ...args) {
    if (currentLevel >= DEBUG_LEVELS.ERROR) {
      console.error(`[${new Date().toISOString()}] [ERROR] [${this.context}] ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    if (currentLevel >= DEBUG_LEVELS.WARN) {
      console.warn(`[${new Date().toISOString()}] [WARN] [${this.context}] ${message}`, ...args);
    }
  }

  info(message, ...args) {
    if (currentLevel >= DEBUG_LEVELS.INFO) {
      console.info(`[${new Date().toISOString()}] [INFO] [${this.context}] ${message}`, ...args);
    }
  }

  debug(message, ...args) {
    if (currentLevel >= DEBUG_LEVELS.DEBUG) {
      console.debug(`[${new Date().toISOString()}] [DEBUG] [${this.context}] ${message}`, ...args);
    }
  }
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  static start(label) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${label}-start`);
    }
    console.time(`[PERF] ${label}`);
  }

  static end(label) {
    console.timeEnd(`[PERF] ${label}`);
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${label}-end`);
      try {
        performance.measure(label, `${label}-start`, `${label}-end`);
      } catch (e) {
        // Measure might fail if marks don't exist
      }
    }
  }

  static measure(label, fn) {
    this.start(label);
    try {
      const result = fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
}

/**
 * Error tracking and reporting
 */
export class ErrorTracker {
  static errors = [];

  static track(error, context = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'Server',
    };

    this.errors.push(errorInfo);

    // Log to console
    console.error('[ERROR TRACKED]', errorInfo);

    // In production, this would send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.reportToService(errorInfo);
    }

    return errorInfo;
  }

  static reportToService(errorInfo) {
    // Placeholder for error reporting service integration
    // Could integrate with Sentry, Rollbar, etc.
    console.log('[ERROR REPORT]', 'Would send to error reporting service:', errorInfo);
  }

  static getErrors() {
    return [...this.errors];
  }

  static clearErrors() {
    this.errors = [];
  }
}

/**
 * API call monitoring
 */
export class ApiMonitor {
  static calls = [];

  static track(call) {
    const callInfo = {
      timestamp: new Date().toISOString(),
      ...call,
    };

    this.calls.push(callInfo);

    if (currentLevel >= DEBUG_LEVELS.DEBUG) {
      console.log('[API CALL]', callInfo);
    }
  }

  static getCalls() {
    return [...this.calls];
  }

  static getFailedCalls() {
    return this.calls.filter(call => !call.success);
  }

  static clearCalls() {
    this.calls = [];
  }
}

/**
 * User interaction tracking
 */
export class UserTracker {
  static interactions = [];

  static track(interaction) {
    const interactionInfo = {
      timestamp: new Date().toISOString(),
      ...interaction,
    };

    this.interactions.push(interactionInfo);

    if (currentLevel >= DEBUG_LEVELS.DEBUG) {
      console.log('[USER INTERACTION]', interactionInfo);
    }
  }

  static getInteractions() {
    return [...this.interactions];
  }

  static clearInteractions() {
    this.interactions = [];
  }
}

/**
 * Memory usage monitoring (client-side only)
 */
export class MemoryMonitor {
  static getMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  static logMemoryUsage() {
    const memory = this.getMemoryUsage();
    if (memory) {
      console.log('[MEMORY]', {
        used: `${(memory.used / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.total / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.limit / 1024 / 1024).toFixed(2)} MB`,
        usagePercent: ((memory.used / memory.limit) * 100).toFixed(2) + '%',
      });
    }
  }
}

/**
 * Global error handler setup
 */
export function setupGlobalErrorHandling() {
  if (typeof window !== 'undefined') {
    // Client-side error handling
    window.addEventListener('error', (event) => {
      ErrorTracker.track(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      ErrorTracker.track(new Error(event.reason), {
        type: 'unhandledrejection',
      });
    });
  } else {
    // Server-side error handling
    process.on('uncaughtException', (error) => {
      ErrorTracker.track(error, { type: 'uncaughtException' });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      ErrorTracker.track(new Error(reason), {
        type: 'unhandledRejection',
        promise: promise.toString(),
      });
    });
  }
}

/**
 * Debug panel for development
 */
export class DebugPanel {
  static init() {
    if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') {
      return;
    }

    // Create debug panel
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      max-width: 300px;
    `;

    panel.innerHTML = `
      <div><strong>Debug Panel</strong></div>
      <button id="debug-memory">Memory</button>
      <button id="debug-errors">Errors (${ErrorTracker.errors.length})</button>
      <button id="debug-api">API Calls (${ApiMonitor.calls.length})</button>
      <button id="debug-interactions">Interactions (${UserTracker.interactions.length})</button>
    `;

    document.body.appendChild(panel);

    // Add event listeners
    document.getElementById('debug-memory').addEventListener('click', () => {
      MemoryMonitor.logMemoryUsage();
    });

    document.getElementById('debug-errors').addEventListener('click', () => {
      console.table(ErrorTracker.getErrors());
    });

    document.getElementById('debug-api').addEventListener('click', () => {
      console.table(ApiMonitor.getCalls());
    });

    document.getElementById('debug-interactions').addEventListener('click', () => {
      console.table(UserTracker.getInteractions());
    });
  }
}

// Initialize global error handling
setupGlobalErrorHandling();

// Initialize debug panel in development
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    DebugPanel.init();
  });
}