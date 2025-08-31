/**
 * Language Logger - Sistema de logging específico para debugging de idiomas
 */

class LanguageLogger {
  private logs: string[] = [];
  private readonly MAX_LOGS = 100;
  
  constructor() {
    if (typeof window !== 'undefined') {
      // Exponer globalmente para debugging
      (window as any).languageLogger = this;
    }
  }
  
  log(event: string, details: any = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      details,
      localStorage: typeof window !== 'undefined' ? localStorage.getItem('language') : null,
      url: typeof window !== 'undefined' ? window.location.href : null
    };
    
    // Silent mode - no console output
    // Store in memory for debugging if needed
    this.logs.push(JSON.stringify(logEntry));
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }
    
    // Disabled backend logging for production
    // this.sendToBackend(logEntry);
  }
  
  private async sendToBackend(logEntry: any) {
    try {
      await fetch('http://localhost:5266/api/logs/frontend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: [{
            timestamp: logEntry.timestamp,
            level: 'info',
            message: `[LANGUAGE] ${logEntry.event} | localStorage: ${logEntry.localStorage}`,
            type: 'language-debug',
            url: logEntry.url,
            details: JSON.stringify(logEntry.details)
          }]
        })
      });
    } catch (error) {
      // Silent mode - error sending log to backend
    }
  }
  
  getLogs() {
    return this.logs.map(log => JSON.parse(log));
  }
  
  clearLogs() {
    this.logs = [];
    // Silent mode - no console output
  }
}

// Create singleton instance
const languageLogger = new LanguageLogger();

export default languageLogger;