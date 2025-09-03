// API Performance Tracking
interface PerformanceMetrics {
  totalRequests: number;
  failedRequests: number;
  responseTimes: number[];
  averageResponseTime: number;
  lastUpdated: Date;
  byEndpoint: Map<string, {
    count: number;
    avgTime: number;
    errors: number;
  }>;
}

class APIPerformanceTracker {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private currentBackend: string = 'azure';

  constructor() {
    this.initializeBackend();
  }

  private initializeBackend() {
    if (typeof window !== 'undefined') {
      this.currentBackend = localStorage.getItem('backend_provider') || 'azure';
      
      // Initialize metrics for each backend
      ['azure', 'railway', 'local'].forEach(backend => {
        this.metrics.set(backend, {
          totalRequests: 0,
          failedRequests: 0,
          responseTimes: [],
          averageResponseTime: 0,
          lastUpdated: new Date(),
          byEndpoint: new Map()
        });
      });
    }
  }

  trackRequest(url: string, startTime: number, success: boolean, backend?: string) {
    const responseTime = Date.now() - startTime;
    const currentBackend = backend || this.currentBackend;
    const metrics = this.metrics.get(currentBackend);
    
    if (!metrics) return;

    // Update general metrics
    metrics.totalRequests++;
    if (!success) metrics.failedRequests++;
    
    // Keep only last 100 response times
    metrics.responseTimes.push(responseTime);
    if (metrics.responseTimes.length > 100) {
      metrics.responseTimes.shift();
    }
    
    // Calculate average
    metrics.averageResponseTime = 
      metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
    
    // Update endpoint-specific metrics
    const endpoint = this.extractEndpoint(url);
    const endpointMetrics = metrics.byEndpoint.get(endpoint) || {
      count: 0,
      avgTime: 0,
      errors: 0
    };
    
    endpointMetrics.count++;
    if (!success) endpointMetrics.errors++;
    endpointMetrics.avgTime = 
      (endpointMetrics.avgTime * (endpointMetrics.count - 1) + responseTime) / endpointMetrics.count;
    
    metrics.byEndpoint.set(endpoint, endpointMetrics);
    metrics.lastUpdated = new Date();

    // Update UI if performance panel is visible
    this.updateUI(currentBackend);
    
    // Log if enabled
    if (process.env.NEXT_PUBLIC_LOG_API_TIMES === 'true') {
      console.log(`📊 [${currentBackend.toUpperCase()}] ${endpoint}: ${responseTime}ms ${success ? '✅' : '❌'}`);
    }
  }

  private extractEndpoint(url: string): string {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      // Remove /api prefix and any IDs
      return path.replace(/\/api/, '').replace(/\/\d+/g, '/:id');
    } catch {
      return url;
    }
  }

  private updateUI(backend: string) {
    if (typeof window === 'undefined') return;
    
    const metrics = this.metrics.get(backend);
    if (!metrics) return;

    // Update performance metrics in UI
    const avgTimeEl = document.getElementById('avg-response-time');
    const totalReqEl = document.getElementById('total-requests');
    const failedReqEl = document.getElementById('failed-requests');
    
    if (avgTimeEl) avgTimeEl.textContent = `${Math.round(metrics.averageResponseTime)}ms`;
    if (totalReqEl) totalReqEl.textContent = metrics.totalRequests.toString();
    if (failedReqEl) failedReqEl.textContent = metrics.failedRequests.toString();
  }

  getMetrics(backend?: string): PerformanceMetrics | undefined {
    return this.metrics.get(backend || this.currentBackend);
  }

  compareBackends(): {
    azure: PerformanceMetrics | undefined;
    railway: PerformanceMetrics | undefined;
    comparison: string;
  } {
    const azure = this.metrics.get('azure');
    const railway = this.metrics.get('railway');
    
    let comparison = 'Not enough data';
    
    if (azure && railway && azure.totalRequests > 5 && railway.totalRequests > 5) {
      const diff = railway.averageResponseTime - azure.averageResponseTime;
      const percent = Math.abs((diff / azure.averageResponseTime) * 100);
      
      if (diff < 0) {
        comparison = `Railway is ${percent.toFixed(1)}% faster`;
      } else if (diff > 0) {
        comparison = `Azure is ${percent.toFixed(1)}% faster`;
      } else {
        comparison = 'Both perform equally';
      }
    }
    
    return { azure, railway, comparison };
  }

  reset(backend?: string) {
    if (backend) {
      const metrics = this.metrics.get(backend);
      if (metrics) {
        metrics.totalRequests = 0;
        metrics.failedRequests = 0;
        metrics.responseTimes = [];
        metrics.averageResponseTime = 0;
        metrics.byEndpoint.clear();
        metrics.lastUpdated = new Date();
      }
    } else {
      this.initializeBackend();
    }
  }
}

// Create singleton instance
const performanceTracker = new APIPerformanceTracker();

// Intercept fetch to track performance
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    const url = args[0] as string;
    const startTime = Date.now();
    const backend = localStorage.getItem('backend_provider') || 'azure';
    
    try {
      const response = await originalFetch.apply(this, args);
      performanceTracker.trackRequest(url, startTime, response.ok, backend);
      return response;
    } catch (error) {
      performanceTracker.trackRequest(url, startTime, false, backend);
      throw error;
    }
  };
}

export default performanceTracker;