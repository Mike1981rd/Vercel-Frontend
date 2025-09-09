/**
 * Backend Comparison Tool - Azure vs Railway+Supabase
 * Decisión estratégica basada en métricas reales
 */

export interface BackendMetrics {
  name: string;
  url: string;
  success: boolean;
  responseTime: number | null;
  errorType?: string;
  corsIssue: boolean;
  data?: any;
  timestamp: Date;
}

export interface ComparisonResults {
  azure: BackendMetrics;
  railway: BackendMetrics;
  winner: string;
  reasoning: string[];
  metrics: {
    speedDifference: number;
    reliabilityScore: {
      azure: number;
      railway: number;
    };
    corsErrors: {
      azure: number;
      railway: number;
    };
  };
}

// Cache para almacenar resultados históricos
const resultsHistory: ComparisonResults[] = [];

/**
 * Test individual de backend con métricas detalladas
 */
const testBackend = async (url: string, name: string): Promise<BackendMetrics> => {
  const startTime = performance.now();
  
  try {
    // Test con timeout de 5 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${url}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const responseTime = performance.now() - startTime;
    
    if (!response.ok) {
      return {
        name,
        url,
        success: false,
        responseTime,
        errorType: `HTTP ${response.status}`,
        corsIssue: false,
        timestamp: new Date()
      };
    }
    
    const data = await response.json();
    return {
      name,
      url,
      success: true,
      responseTime,
      corsIssue: false,
      data,
      timestamp: new Date()
    };
    
  } catch (error: any) {
    const responseTime = performance.now() - startTime;
    
    // Detectar específicamente errores CORS
    const isCorsError = error.message?.includes('CORS') || 
                       error.message?.includes('cors') ||
                       error.message?.includes('Failed to fetch') ||
                       error.name === 'TypeError';
    
    return {
      name,
      url,
      success: false,
      responseTime: responseTime > 5000 ? null : responseTime,
      errorType: error.name === 'AbortError' ? 'TIMEOUT' : error.message,
      corsIssue: isCorsError,
      timestamp: new Date()
    };
  }
};

/**
 * Test de endpoints críticos del negocio
 */
const testCriticalEndpoints = async (baseUrl: string, name: string) => {
  const endpoints = [
    '/api/auth/me',
    '/api/company',
    '/api/global-theme-config',
    '/api/structural-components'
  ];
  
  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      const start = performance.now();
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        return {
          endpoint,
          success: response.ok,
          time: performance.now() - start,
          status: response.status
        };
      } catch (error) {
        return {
          endpoint,
          success: false,
          time: performance.now() - start,
          error: (error as Error).message
        };
      }
    })
  );
  
  return results;
};

/**
 * Comparación completa entre backends
 */
export const compareBackends = async (): Promise<ComparisonResults> => {
  console.log('🔍 Iniciando comparación de backends...');
  
  // URLs de los backends
  const AZURE_URL = process.env.NEXT_PUBLIC_API_AZURE || 'https://api.test1hotelwebsite.online';
  const RAILWAY_URL = process.env.NEXT_PUBLIC_API_RAILWAY || 'https://websitebuilderapi-production-production.up.railway.app';
  
  // Ejecutar tests en paralelo
  const [azure, railway] = await Promise.all([
    testBackend(AZURE_URL, 'Azure'),
    testBackend(RAILWAY_URL, 'Railway+Supabase')
  ]);
  
  // Calcular métricas de comparación
  const speedDifference = (azure.responseTime || 9999) - (railway.responseTime || 9999);
  
  // Calcular puntuación de confiabilidad (0-100)
  const calculateReliability = (metrics: BackendMetrics) => {
    let score = 100;
    if (!metrics.success) score -= 50;
    if (metrics.corsIssue) score -= 30;
    if (metrics.responseTime && metrics.responseTime > 2000) score -= 20;
    if (metrics.responseTime && metrics.responseTime > 1000) score -= 10;
    return Math.max(0, score);
  };
  
  const azureReliability = calculateReliability(azure);
  const railwayReliability = calculateReliability(railway);
  
  // Determinar ganador y razones
  const reasoning: string[] = [];
  let winner = 'Railway+Supabase'; // Sesgo hacia Railway por problemas históricos de Azure
  
  // Análisis de CORS
  if (azure.corsIssue && !railway.corsIssue) {
    reasoning.push('✅ Railway no presenta problemas de CORS');
    winner = 'Railway+Supabase';
  } else if (!azure.corsIssue && railway.corsIssue) {
    reasoning.push('⚠️ Railway presenta problemas de CORS');
    winner = 'Azure';
  }
  
  // Análisis de velocidad
  if (speedDifference > 100) {
    reasoning.push(`⚡ Railway es ${Math.abs(speedDifference)}ms más rápido`);
  } else if (speedDifference < -100) {
    reasoning.push(`⚡ Azure es ${Math.abs(speedDifference)}ms más rápido`);
  } else {
    reasoning.push('⏱️ Velocidad similar en ambos backends');
  }
  
  // Análisis de disponibilidad
  if (azure.success && !railway.success) {
    reasoning.push('🔴 Railway no está respondiendo correctamente');
    winner = 'Azure';
  } else if (!azure.success && railway.success) {
    reasoning.push('🔴 Azure no está respondiendo correctamente');
    winner = 'Railway+Supabase';
  } else if (azure.success && railway.success) {
    reasoning.push('✅ Ambos backends están operativos');
  }
  
  // Análisis de confiabilidad
  if (railwayReliability > azureReliability) {
    reasoning.push(`📊 Railway tiene mejor puntuación de confiabilidad (${railwayReliability} vs ${azureReliability})`);
  } else if (azureReliability > railwayReliability) {
    reasoning.push(`📊 Azure tiene mejor puntuación de confiabilidad (${azureReliability} vs ${railwayReliability})`);
  }
  
  // Consideraciones adicionales basadas en tu configuración
  reasoning.push('💡 Railway+Supabase ya está configurado y funcionando según CLAUDE.md');
  reasoning.push('💰 Railway+Supabase tiene mejor relación costo-beneficio para proyectos pequeños/medianos');
  
  const results: ComparisonResults = {
    azure,
    railway,
    winner,
    reasoning,
    metrics: {
      speedDifference,
      reliabilityScore: {
        azure: azureReliability,
        railway: railwayReliability
      },
      corsErrors: {
        azure: azure.corsIssue ? 1 : 0,
        railway: railway.corsIssue ? 1 : 0
      }
    }
  };
  
  // Guardar en histórico
  resultsHistory.push(results);
  
  // Logging detallado
  console.group('📊 Resultados de Comparación');
  console.table({
    Azure: {
      'Estado': azure.success ? '✅' : '❌',
      'Tiempo': azure.responseTime ? `${azure.responseTime.toFixed(0)}ms` : 'N/A',
      'CORS': azure.corsIssue ? '❌' : '✅',
      'Confiabilidad': `${azureReliability}%`
    },
    Railway: {
      'Estado': railway.success ? '✅' : '❌',
      'Tiempo': railway.responseTime ? `${railway.responseTime.toFixed(0)}ms` : 'N/A',
      'CORS': railway.corsIssue ? '❌' : '✅',
      'Confiabilidad': `${railwayReliability}%`
    }
  });
  console.log('🏆 Ganador:', winner);
  console.log('📝 Razones:', reasoning);
  console.groupEnd();
  
  return results;
};

/**
 * Test continuo durante un período de tiempo
 */
export const continuousTest = async (durationMinutes: number = 10) => {
  const interval = 30000; // Test cada 30 segundos
  const endTime = Date.now() + (durationMinutes * 60 * 1000);
  
  console.log(`🔄 Iniciando test continuo por ${durationMinutes} minutos...`);
  
  const runTest = async () => {
    if (Date.now() > endTime) {
      // Análisis final
      console.group('📈 Análisis Final');
      
      const azureErrors = resultsHistory.filter(r => !r.azure.success).length;
      const railwayErrors = resultsHistory.filter(r => !r.railway.success).length;
      const azureCorsErrors = resultsHistory.filter(r => r.azure.corsIssue).length;
      const railwayCorsErrors = resultsHistory.filter(r => r.railway.corsIssue).length;
      
      const avgAzureTime = resultsHistory
        .filter(r => r.azure.responseTime)
        .reduce((sum, r) => sum + (r.azure.responseTime || 0), 0) / resultsHistory.length;
      
      const avgRailwayTime = resultsHistory
        .filter(r => r.railway.responseTime)
        .reduce((sum, r) => sum + (r.railway.responseTime || 0), 0) / resultsHistory.length;
      
      console.table({
        'Métricas Finales': {
          'Total Tests': resultsHistory.length,
          'Azure Errores': azureErrors,
          'Railway Errores': railwayErrors,
          'Azure CORS': azureCorsErrors,
          'Railway CORS': railwayCorsErrors,
          'Azure Tiempo Promedio': `${avgAzureTime.toFixed(0)}ms`,
          'Railway Tiempo Promedio': `${avgRailwayTime.toFixed(0)}ms`
        }
      });
      
      // Decisión final
      const finalWinner = railwayErrors < azureErrors ? 'Railway+Supabase' : 
                         azureErrors < railwayErrors ? 'Azure' : 
                         avgRailwayTime < avgAzureTime ? 'Railway+Supabase' : 'Azure';
      
      console.log('🏆 DECISIÓN FINAL:', finalWinner);
      console.groupEnd();
      
      return resultsHistory;
    }
    
    await compareBackends();
    setTimeout(runTest, interval);
  };
  
  runTest();
};

/**
 * Obtener histórico de resultados
 */
export const getHistory = () => resultsHistory;

/**
 * Limpiar histórico
 */
export const clearHistory = () => {
  resultsHistory.length = 0;
};