'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';

export default function DebugPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken || 'Nenhum token encontrado');
    testAllEndpoints();
  }, []);

  const testAllEndpoints = async () => {
    const testResults: any = {};

    try {
      // Test /leads
      try {
        const leadsResponse = await api.get('/leads');
        testResults.leads = {
          status: 'OK',
          data: leadsResponse.data,
          type: Array.isArray(leadsResponse.data) ? 'array' : typeof leadsResponse.data
        };
      } catch (e: any) {
        testResults.leads = {
          status: 'ERROR',
          error: e.response?.data || e.message
        };
      }

      // Test /campaigns
      try {
        const campaignsResponse = await api.get('/campaigns');
        testResults.campaigns = {
          status: 'OK',
          data: campaignsResponse.data,
          type: Array.isArray(campaignsResponse.data) ? 'array' : typeof campaignsResponse.data
        };
      } catch (e: any) {
        testResults.campaigns = {
          status: 'ERROR',
          error: e.response?.data || e.message
        };
      }

      // Test /sales
      try {
        const salesResponse = await api.get('/sales');
        testResults.sales = {
          status: 'OK',
          data: salesResponse.data,
          type: Array.isArray(salesResponse.data) ? 'array' : typeof salesResponse.data
        };
      } catch (e: any) {
        testResults.sales = {
          status: 'ERROR',
          error: e.response?.data || e.message
        };
      }

      // Test /dashboard
      try {
        const dashboardResponse = await api.get('/dashboard');
        testResults.dashboard = {
          status: 'OK',
          data: dashboardResponse.data
        };
      } catch (e: any) {
        testResults.dashboard = {
          status: 'ERROR',
          error: e.response?.data || e.message
        };
      }

      setResults(testResults);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DEBUG - Diagnóstico de API</h1>

        <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-200 dark:border-dark-700">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Token JWT</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
            {token}
          </p>
        </div>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Testando endpoints...</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(results).map(([endpoint, result]: [string, any]) => (
              <div
                key={endpoint}
                className={`rounded-xl p-6 border-2 ${
                  result.status === 'OK'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                }`}
              >
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <span className={result.status === 'OK' ? 'text-green-600' : 'text-red-600'}>
                    {result.status === 'OK' ? '✅' : '❌'}
                  </span>
                  /api/{endpoint}
                </h3>

                {result.status === 'OK' ? (
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Tipo:</strong> {result.type}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Tamanho:</strong> {JSON.stringify(result.data).length} bytes
                    </p>
                    <details className="cursor-pointer">
                      <summary className="font-semibold text-gray-700 dark:text-gray-300">
                        Ver dados completos
                      </summary>
                      <pre className="mt-2 bg-gray-100 dark:bg-dark-900 p-4 rounded text-xs overflow-auto max-h-48">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p className="text-red-700 dark:text-red-300 font-bold">
                      {result.error?.message || result.error || 'Erro desconhecido'}
                    </p>
                    {typeof result.error === 'object' && (
                      <pre className="bg-red-100 dark:bg-red-900/30 p-4 rounded text-xs overflow-auto max-h-48">
                        {JSON.stringify(result.error, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={testAllEndpoints}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Testar novamente
        </button>
      </div>
    </DashboardLayout>
  );
}
