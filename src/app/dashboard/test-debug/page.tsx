'use client';

import React, { useState, useEffect } from 'react';
import { getApiEndpoint } from '@/lib/api-url';

export default function TestDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEverything();
  }, []);

  const checkEverything = async () => {
    const token = localStorage.getItem('token');
    
    // Parse token
    let tokenPayload = null;
    let extractedRole = null;
    if (token) {
      try {
        tokenPayload = JSON.parse(atob(token.split('.')[1]));
        
        // Extract role
        if (Array.isArray(tokenPayload.role)) {
          extractedRole = tokenPayload.role.includes('SuperAdmin') ? 'SuperAdmin' : tokenPayload.role[0];
        } else {
          extractedRole = tokenPayload.role;
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }

    // Check debug endpoint
    let debugData = null;
    try {
      const response = await fetch(getApiEndpoint('/setup/debug-roles'));
      if (response.ok) {
        debugData = await response.json();
      }
    } catch (error) {
      console.error('Error fetching debug data:', error);
    }

    setDebugInfo({
      token: tokenPayload,
      extractedRole,
      debugData,
      localStorage: {
        token: !!token,
        uiSettings: localStorage.getItem('ui-settings')
      }
    });
    setLoading(false);
  };

  const fixRoles = async () => {
    try {
      const response = await fetch(getApiEndpoint('/setup/fix-system-roles'), {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        alert('Roles fixed! ' + JSON.stringify(data));
        checkEverything();
      }
    } catch (error) {
      console.error('Error fixing roles:', error);
    }
  };

  if (loading) {
    return <div>Loading debug info...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">Token Payload:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo.token, null, 2)}
          </pre>
          <p className="mt-2 text-sm">
            <strong>Extracted Role:</strong> {debugInfo.extractedRole || 'None'}
          </p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">Database Debug:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo.debugData, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">LocalStorage:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo.localStorage, null, 2)}
          </pre>
        </div>

        <button
          onClick={fixRoles}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Fix System Roles in Database
        </button>
      </div>
    </div>
  );
}
