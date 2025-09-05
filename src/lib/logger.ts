/**
 * Frontend Logger Service
 * Captures and sends all frontend errors to backend for persistent logging
 */

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  type: 'console' | 'network' | 'exception' | 'promise';
  message: string;
  details?: any;
  url?: string;
  userAgent?: string;
  stack?: string;
  networkDetails?: {
    method?: string;
    url?: string;
    status?: number;
    statusText?: string;
    requestBody?: any;
    responseBody?: any;
    headers?: Record<string, string>;
  };
}

class FrontendLogger {
  private queue: LogEntry[] = [];
  private isInitialized = false;
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  private originalFetch: typeof fetch;
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266';
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds

  constructor() {
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
    // Don't access window.fetch in constructor - it might not be available (SSR)
    this.originalFetch = typeof window !== 'undefined' ? window.fetch.bind(window) : fetch;
  }

  /**
   * Initialize the logger and set up all interceptors
   */
  init(): void {
    if (this.isInitialized) return;
    const silent = typeof window !== 'undefined' && (localStorage.getItem('WB_SILENT_CONSOLE') === '1' || (window as any).__WB_SILENT_CONSOLE__ === true || process.env.NEXT_PUBLIC_SILENT_LOGS === 'true');
    if (silent) {
      // In silent mode, don't intercept console or network; just mark initialized
      this.isInitialized = true;
      return;
    }
    
    // Save the original fetch if we haven't already (in case init is called multiple times)
    if (typeof window !== 'undefined' && window.fetch !== this.originalFetch) {
      // Check if fetch has already been intercepted (has _url property from XMLHttpRequest intercept)
      const currentFetch = window.fetch;
      if (!currentFetch.toString().includes('originalFetch')) {
        this.originalFetch = currentFetch.bind(window);
      }
    }
    
    this.interceptConsole();
    this.interceptNetworkRequests();
    this.interceptGlobalErrors();
    this.interceptPromiseRejections();
    this.startFlushInterval();
    
    this.isInitialized = true;
    this.logInfo('Frontend logger initialized');
  }

  /**
   * Intercept console.error and console.warn
   */
  private interceptConsole(): void {
    // Intercept console.error (including React warnings in development)
    console.error = (...args: any[]) => {
      this.originalConsoleError.apply(console, args);
      
      // Check if it's a React warning (they use console.error in development)
      const message = this.formatConsoleMessage(args);
      const isReactWarning = message.includes('Warning:') || 
                            message.includes('React.') ||
                            message.includes('ReactDOM.') ||
                            message.includes('Invalid prop') ||
                            message.includes('Failed prop type') ||
                            message.includes('type is invalid');
      
      // Always log React warnings, even in batches
      if (isReactWarning) {
        this.log('warn', 'console' as any, message, {
          args,
          stack: new Error().stack,
          isReactWarning: true
        });
        // Flush React warnings immediately for debugging
        this.flush();
      } else {
        this.log('error', 'console', message, {
          args,
          stack: new Error().stack
        });
      }
    };

    // Intercept console.warn
    console.warn = (...args: any[]) => {
      this.originalConsoleWarn.apply(console, args);
      this.log('warn', 'console', this.formatConsoleMessage(args), {
        args,
        stack: new Error().stack
      });
    };
  }

  /**
   * Intercept all network requests (fetch and XMLHttpRequest)
   */
  private interceptNetworkRequests(): void {
    // Extend XMLHttpRequest type to include our custom properties
    interface ExtendedXMLHttpRequest extends XMLHttpRequest {
      _method?: string;
      _url?: string;
    }
    // Intercept fetch
    window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
      const [input, init] = args;
      const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : (input as URL).toString());
      const method = init?.method || 'GET';
      
      const startTime = Date.now();
      
      try {
        const response = await this.originalFetch.apply(window, args);
        const duration = Date.now() - startTime;
        
        // Log errors (4xx and 5xx)
        if (!response.ok) {
          const responseBody = await this.safeCloneResponse(response);
          
          this.log('error', 'network', `${method} ${url} failed with ${response.status}`, {
            networkDetails: {
              method,
              url,
              status: response.status,
              statusText: response.statusText,
              requestBody: init?.body,
              responseBody,
              headers: Object.fromEntries(response.headers.entries())
            },
            duration
          });
        }
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        this.log('error', 'network', `${method} ${url} failed with network error`, {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          networkDetails: {
            method,
            url,
            requestBody: init?.body
          },
          duration
        });
        
        throw error;
      }
    };

    // Intercept XMLHttpRequest (for libraries that might use it)
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method: string, url: string, ...rest: any[]) {
      (this as ExtendedXMLHttpRequest)._method = method;
      (this as ExtendedXMLHttpRequest)._url = url;
      return originalXHROpen.apply(this, [method, url, ...rest] as any);
    };

    XMLHttpRequest.prototype.send = function(body?: any) {
      const xhr = this as ExtendedXMLHttpRequest;
      const startTime = Date.now();

      xhr.addEventListener('error', () => {
        const duration = Date.now() - startTime;
        logger.log('error', 'network', `XMLHttpRequest ${xhr._method} ${xhr._url} failed`, {
          networkDetails: {
            method: xhr._method,
            url: xhr._url,
            requestBody: body
          },
          duration
        });
      });

      xhr.addEventListener('load', () => {
        const duration = Date.now() - startTime;
        if (xhr.status >= 400) {
          logger.log('error', 'network', `XMLHttpRequest ${xhr._method} ${xhr._url} failed with ${xhr.status}`, {
            networkDetails: {
              method: xhr._method,
              url: xhr._url,
              status: xhr.status,
              statusText: xhr.statusText,
              requestBody: body,
              responseBody: xhr.responseText
            },
            duration
          });
        }
      });

      return originalXHRSend.apply(this, [body] as any);
    };
  }

  /**
   * Intercept global JavaScript errors
   */
  private interceptGlobalErrors(): void {
    window.addEventListener('error', (event: ErrorEvent) => {
      this.log('error', 'exception', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        error: event.error
      });
    });
  }

  /**
   * Intercept unhandled promise rejections
   */
  private interceptPromiseRejections(): void {
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      const error = event.reason;
      this.log('error', 'promise', 
        error instanceof Error ? error.message : String(error), {
        reason: event.reason,
        stack: error instanceof Error ? error.stack : undefined,
        promise: event.promise
      });
    });
  }

  /**
   * Log a message
   */
  private log(
    level: LogEntry['level'], 
    type: LogEntry['type'], 
    message: string, 
    details?: any
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      type,
      message,
      details,
      url: window.location.href,
      userAgent: navigator.userAgent,
      stack: details?.stack
    };

    if (details?.networkDetails) {
      entry.networkDetails = details.networkDetails;
    }

    this.queue.push(entry);

    // Flush immediately for errors
    if (level === 'error' && this.queue.length >= this.BATCH_SIZE) {
      this.flush();
    }
  }

  /**
   * Public methods for manual logging
   */
  logError(message: string, details?: any): void {
    this.log('error', 'console', message, details);
  }

  logWarn(message: string, details?: any): void {
    this.log('warn', 'console', message, details);
  }

  logInfo(message: string, details?: any): void {
    this.log('info', 'console', message, details);
  }

  /**
   * Start the interval to flush logs periodically
   */
  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Flush logs to the backend
   */
  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const logsToSend = [...this.queue];
    this.queue = [];

    try {
      // Use original fetch to avoid recursive logging
      await this.originalFetch(`${this.API_URL}/logs/frontend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend })
      });
    } catch (error) {
      // If logging fails, put logs back in queue (with a limit to prevent infinite growth)
      if (this.queue.length < 100) {
        this.queue.unshift(...logsToSend.slice(0, 100 - this.queue.length));
      }
    }
  }

  /**
   * Helper to format console messages
   */
  private formatConsoleMessage(args: any[]): string {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  }

  /**
   * Safely clone a response to read the body
   */
  private async safeCloneResponse(response: Response): Promise<any> {
    try {
      const cloned = response.clone();
      const contentType = cloned.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        return await cloned.json();
      } else if (contentType?.includes('text')) {
        return await cloned.text();
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Clean up and restore original functions
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    // Flush remaining logs
    this.flush();
    
    // Restore original functions
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
    window.fetch = this.originalFetch;
    
    this.isInitialized = false;
  }
}

// Create singleton instance
const logger = new FrontendLogger();

// Auto-initialize if in browser
// Commented out - initialization is handled by LoggerInitializer component
// if (typeof window !== 'undefined') {
//   logger.init();
// }

export default logger;
