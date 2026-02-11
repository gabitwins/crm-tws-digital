'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CheckCircle, XCircle, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  businessAccountId: string;
  webhookVerifyToken: string;
}

export default function WhatsAppCloudConfig() {
  const [config, setConfig] = useState<WhatsAppConfig>({
    phoneNumberId: '',
    accessToken: '',
    businessAccountId: '',
    webhookVerifyToken: ''
  });
  const [status, setStatus] = useState<'disconnected' | 'connected'>('disconnected');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Olá! Esta é uma mensagem de teste do CRM.');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadStatus();
    generateWebhookUrl();
  }, []);

  const generateWebhookUrl = () => {
    const baseUrl = window.location.origin.replace('3000', '4000'); // Ajustar porta do backend
    setWebhookUrl(`${baseUrl}/api/whatsapp/webhook`);
  };

  const loadStatus = async () => {
    try {
      const response = await api.get('/whatsapp/status');
      if (response.data.configured) {
        setStatus('connected');
        setConfig({
          phoneNumberId: response.data.config?.phoneNumberId || '',
          accessToken: '', // Não retorna tokens
          businessAccountId: response.data.config?.businessAccountId || '',
          webhookVerifyToken: ''
        });
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      console.error('Erro ao carregar status:', error);
      setStatus('disconnected');
    }
  };

  const handleSaveConfig = async () => {
    if (!config.phoneNumberId || !config.accessToken || !config.businessAccountId || !config.webhookVerifyToken) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      await api.post('/whatsapp/configure', config);
      alert('✅ WhatsApp Cloud API configurado com sucesso!');
      setStatus('connected');
      await loadStatus();
    } catch (error: any) {
      alert(`Erro ao configurar: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Deseja realmente desconectar o WhatsApp Cloud API?')) {
      return;
    }

    setLoading(true);
    try {
      await api.post('/whatsapp/disconnect');
      alert('WhatsApp Cloud API desconectado');
      setStatus('disconnected');
      setConfig({
        phoneNumberId: '',
        accessToken: '',
        businessAccountId: '',
        webhookVerifyToken: ''
      });
    } catch (error) {
      alert('Erro ao desconectar');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSend = async () => {
    if (!testPhone || !testMessage) {
      alert('Preencha o número e a mensagem');
      return;
    }

    setTesting(true);
    try {
      await api.post('/whatsapp/send', {
        to: testPhone,
        message: testMessage
      });
      alert('✅ Mensagem enviada com sucesso! Verifique o WhatsApp.');
    } catch (error: any) {
      alert(`Erro ao enviar: ${error.response?.data?.error || error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">WhatsApp Cloud API (Meta)</h2>
            <p className="text-green-100">API oficial da Meta - mais estável e confiável</p>
          </div>
          {status === 'connected' ? (
            <CheckCircle className="w-12 h-12 text-green-200" />
          ) : (
            <XCircle className="w-12 h-12 text-red-300" />
          )}
        </div>
      </div>

      {/* Guia rápido */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📚 Como configurar</h3>
        <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-decimal">
          <li>Acesse <a href="https://developers.facebook.com/" target="_blank" className="underline">Meta for Developers</a></li>
          <li>Crie um app tipo &quot;Business&quot; e adicione o produto &quot;WhatsApp&quot;</li>
          <li>Copie as credenciais abaixo e cole aqui</li>
          <li>Configure o webhook no painel do Meta</li>
          <li>Teste o envio de mensagem</li>
        </ol>
        <a 
          href="/WHATSAPP_CLOUD_SETUP.md" 
          target="_blank"
          className="inline-flex items-center gap-2 mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Ver guia completo <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Webhook URL */}
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Webhook URL</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Configure esta URL no painel do Meta (Configuration → Webhook):
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={webhookUrl}
            readOnly
            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-sm font-mono"
          />
          <button
            onClick={copyWebhookUrl}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Formulário de configuração */}
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Credenciais da Meta</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number ID *
            </label>
            <input
              type="text"
              value={config.phoneNumberId}
              onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
              placeholder="123456789012345"
              className="w-full px-4 py-3 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">Encontrado em: WhatsApp → API Setup</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Access Token (Permanent) *
            </label>
            <input
              type="password"
              value={config.accessToken}
              onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
              placeholder="EAA..."
              className="w-full px-4 py-3 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">Gere em: Tools → Graph API Explorer</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              WhatsApp Business Account ID *
            </label>
            <input
              type="text"
              value={config.businessAccountId}
              onChange={(e) => setConfig({ ...config, businessAccountId: e.target.value })}
              placeholder="987654321098765"
              className="w-full px-4 py-3 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">Encontrado em: WhatsApp → API Setup</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Webhook Verify Token *
            </label>
            <input
              type="text"
              value={config.webhookVerifyToken}
              onChange={(e) => setConfig({ ...config, webhookVerifyToken: e.target.value })}
              placeholder="meu_token_secreto_12345"
              className="w-full px-4 py-3 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Crie uma senha forte (use o mesmo ao configurar webhook no Meta)
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSaveConfig}
              disabled={loading || status === 'connected'}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="w-5 h-5 animate-spin" />}
              {status === 'connected' ? 'Configurado ✓' : 'Salvar Configuração'}
            </button>

            {status === 'connected' && (
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
              >
                Desconectar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Testar envio */}
      {status === 'connected' && (
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">🧪 Testar Envio</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número de teste (com DDI)
              </label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="5511999999999"
                className="w-full px-4 py-3 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Formato: código do país + DDD + número (sem + e espaços)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mensagem
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white resize-none"
              />
            </div>

            <button
              onClick={handleTestSend}
              disabled={testing}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {testing && <RefreshCw className="w-5 h-5 animate-spin" />}
              Enviar Mensagem de Teste
            </button>
          </div>
        </div>
      )}

      {/* Status */}
      <div className={`border rounded-xl p-4 ${
        status === 'connected' 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
          : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
      }`}>
        <div className="flex items-center gap-3">
          {status === 'connected' ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900 dark:text-green-100">
                WhatsApp Cloud API Conectado
              </span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                WhatsApp Cloud API Desconectado
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
