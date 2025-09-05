'use client';

import { useState, useEffect } from 'react';
import { compareBackends, continuousTest, getHistory, clearHistory, type ComparisonResults } from '@/lib/backend-comparison';

export function BackendComparison() {
  const [results, setResults] = useState<ComparisonResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [testRunning, setTestRunning] = useState(false);
  const [history, setHistory] = useState<ComparisonResults[]>([]);

  const runSingleTest = async () => {
    setLoading(true);
    try {
      const result = await compareBackends();
      setResults(result);
      setHistory(getHistory());
    } catch (error) {
      console.error('Error en comparación:', error);
    } finally {
      setLoading(false);
    }
  };

  const runContinuousTest = async () => {
    if (testRunning) return;
    
    setTestRunning(true);
    clearHistory();
    setHistory([]);
    
    // Test por 5 minutos
    await continuousTest(5);
    
    setTestRunning(false);
    setHistory(getHistory());
  };

  const getStatusEmoji = (success: boolean, corsIssue: boolean) => {
    if (corsIssue) return '🔴';
    if (!success) return '❌';
    return '✅';
  };

  const getRecommendation = () => {
    if (!results) return null;

    if (results.winner === 'Railway+Supabase') {
      return (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
            ✅ Recomendación: Continuar con Railway+Supabase
          </h3>
          <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
            <li>• Sin problemas de CORS detectados</li>
            <li>• Mejor relación costo-beneficio</li>
            <li>• Configuración ya establecida según tu documentación</li>
            <li>• Integración nativa con Supabase para base de datos</li>
          </ul>
        </div>
      );
    }

    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
          ⚠️ Azure está funcionando mejor actualmente
        </h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          Aunque Azure muestra mejor rendimiento ahora, considera los problemas históricos de CORS.
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">🔬 Comparación de Backends: Azure vs Railway+Supabase</h1>
        
        {/* Botones de Control */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={runSingleTest}
            disabled={loading || testRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Probando...' : 'Ejecutar Test'}
          </button>
          
          <button
            onClick={runContinuousTest}
            disabled={testRunning || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {testRunning ? 'Test en progreso...' : 'Test Continuo (5 min)'}
          </button>
          
          <button
            onClick={() => {
              clearHistory();
              setHistory([]);
              setResults(null);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Limpiar Resultados
          </button>
        </div>

        {/* Resultados Actuales */}
        {results && (
          <div className="space-y-6">
            {/* Tabla de Comparación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Azure */}
              <div className={`p-4 rounded-lg border-2 ${
                results.azure.success && !results.azure.corsIssue 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
              }`}>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span className="text-2xl">{getStatusEmoji(results.azure.success, results.azure.corsIssue)}</span>
                  Azure
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>URL:</strong> <code className="text-xs">{results.azure.url}</code></p>
                  <p><strong>Estado:</strong> {results.azure.success ? 'Operativo' : 'Error'}</p>
                  <p><strong>Tiempo:</strong> {results.azure.responseTime ? `${results.azure.responseTime.toFixed(0)}ms` : 'N/A'}</p>
                  <p><strong>CORS:</strong> {results.azure.corsIssue ? '❌ Problemas detectados' : '✅ Sin problemas'}</p>
                  {results.azure.errorType && (
                    <p className="text-red-600 dark:text-red-400">
                      <strong>Error:</strong> {results.azure.errorType}
                    </p>
                  )}
                  <p><strong>Confiabilidad:</strong> {results.metrics.reliabilityScore.azure}%</p>
                </div>
              </div>

              {/* Railway */}
              <div className={`p-4 rounded-lg border-2 ${
                results.railway.success && !results.railway.corsIssue 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
              }`}>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span className="text-2xl">{getStatusEmoji(results.railway.success, results.railway.corsIssue)}</span>
                  Railway+Supabase
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>URL:</strong> <code className="text-xs">{results.railway.url}</code></p>
                  <p><strong>Estado:</strong> {results.railway.success ? 'Operativo' : 'Error'}</p>
                  <p><strong>Tiempo:</strong> {results.railway.responseTime ? `${results.railway.responseTime.toFixed(0)}ms` : 'N/A'}</p>
                  <p><strong>CORS:</strong> {results.railway.corsIssue ? '❌ Problemas detectados' : '✅ Sin problemas'}</p>
                  {results.railway.errorType && (
                    <p className="text-red-600 dark:text-red-400">
                      <strong>Error:</strong> {results.railway.errorType}
                    </p>
                  )}
                  <p><strong>Confiabilidad:</strong> {results.metrics.reliabilityScore.railway}%</p>
                </div>
              </div>
            </div>

            {/* Ganador y Razones */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">
                🏆 Ganador: <span className="text-blue-600 dark:text-blue-400">{results.winner}</span>
              </h3>
              <ul className="space-y-1">
                {results.reasoning.map((reason, idx) => (
                  <li key={idx} className="text-sm">{reason}</li>
                ))}
              </ul>
            </div>

            {/* Recomendación */}
            {getRecommendation()}
          </div>
        )}

        {/* Histórico de Tests */}
        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">📊 Histórico de Tests ({history.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiempo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Railway
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ganador
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {history.map((test, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(test.azure.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusEmoji(test.azure.success, test.azure.corsIssue)} {' '}
                        {test.azure.responseTime ? `${test.azure.responseTime.toFixed(0)}ms` : 'Error'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusEmoji(test.railway.success, test.railway.corsIssue)} {' '}
                        {test.railway.responseTime ? `${test.railway.responseTime.toFixed(0)}ms` : 'Error'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {test.winner === 'Railway+Supabase' ? '🚂' : '☁️'} {test.winner}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}