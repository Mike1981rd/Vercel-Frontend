'use client';

import { useState } from 'react';

export function QuickBackendTest() {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    
    const AZURE = 'https://api.test1hotelwebsite.online';
    const RAILWAY = 'https://websitebuilderapi-production-production.up.railway.app';
    
    const testBackend = async (url: string, name: string) => {
      const start = Date.now();
      try {
        const response = await fetch(`${url}/api/health`);
        const time = Date.now() - start;
        
        return {
          name,
          success: response.ok,
          time,
          status: response.status,
          cors: false
        };
      } catch (error: any) {
        return {
          name,
          success: false,
          time: Date.now() - start,
          error: error.message,
          cors: error.message.includes('CORS') || error.message.includes('Failed to fetch')
        };
      }
    };
    
    const [azure, railway] = await Promise.all([
      testBackend(AZURE, 'Azure'),
      testBackend(RAILWAY, 'Railway')
    ]);
    
    setResults({ azure, railway });
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 z-50"
      >
        🔬 Test Backends
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl z-50 w-96 max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Backend Test</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <button
        onClick={runTest}
        disabled={loading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Run Test'}
      </button>
      
      {results && (
        <div className="space-y-3">
          {/* Azure */}
          <div className={`p-3 rounded border ${results.azure.cors ? 'bg-red-50 border-red-300' : results.azure.success ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`}>
            <div className="font-semibold">☁️ Azure</div>
            <div className="text-sm">
              Status: {results.azure.success ? '✅' : '❌'} {results.azure.status || 'Error'}<br/>
              CORS: {results.azure.cors ? '🔴 YES' : '✅ NO'}<br/>
              Time: {results.azure.time}ms
            </div>
          </div>
          
          {/* Railway */}
          <div className={`p-3 rounded border ${results.railway.cors ? 'bg-red-50 border-red-300' : results.railway.success ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`}>
            <div className="font-semibold">🚂 Railway</div>
            <div className="text-sm">
              Status: {results.railway.success ? '✅' : '❌'} {results.railway.status || 'Error'}<br/>
              CORS: {results.railway.cors ? '🔴 YES' : '✅ NO'}<br/>
              Time: {results.railway.time}ms
            </div>
          </div>
          
          {/* Recomendación */}
          <div className="p-3 bg-blue-50 rounded">
            <div className="font-semibold text-sm">
              {results.azure.cors && !results.railway.cors ? 
                '✅ Migrar a Railway - Sin CORS!' : 
                results.railway.success && !results.azure.success ?
                '✅ Railway funcionando mejor' :
                '🤔 Revisar ambas opciones'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}