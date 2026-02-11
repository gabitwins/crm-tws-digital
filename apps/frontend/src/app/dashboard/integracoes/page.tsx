'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/DashboardLayout';
import { CheckCircle, XCircle, Loader, RefreshCw, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { api } from '@/lib/api';

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  status: 'connected' | 'disconnected';
  requiresAuth?: boolean;
  requiresToken?: boolean;
}

export default function Integracoes() {
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
      description: 'Atenda leads via WhatsApp com agentes de IA',
      color: 'from-green-500 to-green-600',
      status: 'disconnected',
      requiresAuth: false
    },
    {
      id: 'instagram',
      name: 'Instagram Direct',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
      description: 'Responda DMs do Instagram automaticamente',
      color: 'from-pink-500 to-purple-600',
      status: 'disconnected',
      requiresAuth: true
    },
    {
      id: 'facebook',
      name: 'Facebook Messenger',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg',
      description: 'Integre conversas do Facebook Messenger',
      color: 'from-blue-500 to-blue-600',
      status: 'disconnected',
      requiresAuth: true
    },
    {
      id: 'hotmart',
      name: 'Hotmart',
      icon: '/logos/hotmart.png',
      description: 'Sincronize vendas e dados financeiros',
      color: 'from-orange-500 to-red-600',
      status: 'disconnected',
      requiresToken: true
    },
    {
      id: 'kiwify',
      name: 'Kiwify',
      icon: '/logos/kiwify.png',
      description: 'Integre vendas e webhooks da Kiwify',
      color: 'from-blue-400 to-indigo-600',
      status: 'disconnected',
      requiresToken: true
    },
    {
      id: 'google-ads',
      name: 'Google Ads',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Ads_logo.svg',
      description: 'Monitore campanhas e conversões do Google',
      color: 'from-yellow-500 to-orange-500',
      status: 'disconnected',
      requiresAuth: true
    },
    {
      id: 'facebook-ads',
      name: 'Facebook Ads',
      icon: '/logos/meta.png',
      description: 'Acompanhe métricas de anúncios do Facebook',
      color: 'from-blue-600 to-indigo-700',
      status: 'disconnected',
      requiresAuth: true
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg',
      description: 'Sincronize agendamentos e lembretes',
      color: 'from-red-500 to-pink-600',
      status: 'disconnected',
      requiresAuth: true
    },
    {
      id: 'outlook',
      name: 'Outlook Calendar',
      icon: '/logos/outlook.png',
      description: 'Integre calendário do Outlook',
      color: 'from-blue-400 to-cyan-500',
      status: 'disconnected',
      requiresAuth: true
    },
    {
      id: 'stripe',
      name: 'Stripe',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
      description: 'Processe pagamentos e assinaturas',
      color: 'from-indigo-500 to-purple-600',
      status: 'disconnected',
      requiresToken: true
    },
    {
      id: 'mercado-pago',
      name: 'Mercado Pago',
      icon: '/logos/mercado-pago.png',
      description: 'Receba pagamentos via Mercado Pago',
      color: 'from-sky-400 to-blue-600',
      status: 'disconnected',
      requiresToken: true
    },
    {
      id: 'zapier',
      name: 'Zapier',
      icon: 'https://cdn.worldvectorlogo.com/logos/zapier.svg',
      description: 'Conecte com 5000+ aplicativos',
      color: 'from-orange-400 to-red-500',
      status: 'disconnected',
      requiresToken: true
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [token, setToken] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [pollingQr, setPollingQr] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState(0); // Contador de timeout
  const [connectionStartTime, setConnectionStartTime] = useState(0); // Timestamp do início
  const [lastDisconnectInfo, setLastDisconnectInfo] = useState<any>(null);

  useEffect(() => {
    loadIntegrationsStatus();
  }, []);

  // Timeout de segurança para conexão WhatsApp (60 segundos)
  useEffect(() => {
    if (!connecting || !connectionStartTime) return;

    const timeoutDuration = 60000; // 60 segundos
    const interval = setInterval(() => {
      const elapsed = Date.now() - connectionStartTime;
      const remaining = Math.max(0, timeoutDuration - elapsed);
      setConnectionTimeout(Math.ceil(remaining / 1000));

      // Se passou do tempo limite, resetar
      if (remaining === 0) {
        setConnecting(false);
        setPollingQr(false);
        alert('⏱️ Timeout: A conexão demorou muito. Tente novamente ou verifique sua internet.');
        setConnectionStartTime(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [connecting, connectionStartTime]);

  const loadIntegrationsStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/integrations/status');
      
      setIntegrations(prev => prev.map(integration => ({
        ...integration,
        status: response.data[integration.id] || 'disconnected'
      })));
    } catch (error) {
      console.error('Erro ao carregar status das integrações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (integration: Integration) => {
    if (integration.id === 'whatsapp') {
      // WhatsApp tem fluxo especial com QR Code
      try {
        setSelectedIntegration(integration);
        setShowModal(true);
        setConnecting(true);
        setQrCode(null);
        setConnectionStartTime(Date.now()); // Iniciar contador

        // FORÇA LIMPEZA DA SESSÃO ANTERIOR PARA EVITAR ERRO DE DEVICE
        await api.post('/integrations/whatsapp/connect', { forceReset: true });
        setPollingQr(true);
      } catch (error) {
        alert('Erro ao conectar WhatsApp');
        setConnecting(false);
        setConnectionStartTime(0);
      }
    } else if (integration.requiresToken) {
      // Integrações que precisam de token
      setSelectedIntegration(integration);
      setShowModal(true);
    } else if (integration.requiresAuth) {
      // Integrações OAuth (abre janela popup)
      try {
        const response = await api.post(`/integrations/${integration.id}/connect`);
        if (response.data.authUrl) {
          window.open(response.data.authUrl, '_blank', 'width=600,height=700');
        }
      } catch (error) {
        alert(`Erro ao conectar ${integration.name}`);
      }
    }
  };

  useEffect(() => {
    if (!showModal || selectedIntegration?.id !== 'whatsapp' || !pollingQr) return;

    const interval = setInterval(async () => {
      try {
        const status = await api.get('/integrations/whatsapp/status');
        setLastDisconnectInfo(status.data?.lastDisconnect || null);
        if (status.data?.connected) {
          setQrCode(null);
          setPollingQr(false);
          setConnecting(false);
          setConnectionStartTime(0);
          setLastDisconnectInfo(null);
          await loadIntegrationsStatus();
          alert('✅ WhatsApp conectado com sucesso!');
          setShowModal(false);
          return;
        }
        if (status.data?.qrCode) {
          setQrCode(status.data.qrCode);
          setConnecting(false); // Para de mostrar "Gerando..." quando QR estiver pronto
        }
      } catch {}
    }, 1000);

    return () => clearInterval(interval);
  }, [showModal, selectedIntegration, pollingQr]);

  const handleDisconnect = async (integrationId: string) => {
    try {
      await api.post(`/integrations/${integrationId}/disconnect`);
      setIntegrations(prev => prev.map(int => 
        int.id === integrationId ? { ...int, status: 'disconnected' } : int
      ));
    } catch (error) {
      alert('Erro ao desconectar');
    }
  };

  const handleWhatsAppReset = async () => {
    try {
      await api.post('/integrations/whatsapp/reset');
      setQrCode(null);
      setPollingQr(false);
      alert('WhatsApp resetado. Agora clique em Conectar para gerar um novo QR.');
    } catch (error) {
      alert('Erro ao resetar WhatsApp');
    }
  };

  const handleTokenSubmit = async () => {
    if (!selectedIntegration || !token.trim()) {
      alert('Por favor, insira o token');
      return;
    }

    try {
      await api.post(`/integrations/${selectedIntegration.id}/connect`, { token });
      setIntegrations(prev => prev.map(int => 
        int.id === selectedIntegration.id ? { ...int, status: 'connected' } : int
      ));
      setShowModal(false);
      setToken('');
      setSelectedIntegration(null);
    } catch (error) {
      alert('Erro ao conectar. Verifique o token.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Integrações</h2>
            <p className="text-gray-600 dark:text-gray-400">Conecte suas ferramentas e automatize seu negócio</p>
          </div>
          <button
            onClick={loadIntegrationsStatus}
            className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        {/* Grid de Integrações */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className={`bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-xl p-6 border-2 transition-all hover:shadow-xl group relative ${
                integration.status === 'connected'
                  ? 'border-green-500 dark:border-green-500'
                  : 'border-gray-200 dark:border-dark-700'
              }`}
            >
              {/* Badge de Status */}
              <div className="absolute top-4 right-4">
                {integration.status === 'connected' ? (
                  <CheckCircle size={24} className="text-green-500" />
                ) : (
                  <XCircle size={20} className="text-gray-400" />
                )}
              </div>

              {/* Ícone */}
              <div className="w-20 h-20 rounded-xl bg-white dark:bg-dark-700 flex items-center justify-center mb-4 mx-auto p-4 border border-gray-200 dark:border-dark-600">
                <Image
                  src={integration.icon}
                  alt={integration.name}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>

              {/* Nome */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
                {integration.name}
              </h3>

              {/* Descrição */}
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4 min-h-[40px]">
                {integration.description}
              </p>

              {/* Botão de Ação */}
              {integration.status === 'connected' ? (
                <button
                  onClick={() => handleDisconnect(integration.id)}
                  className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  Desconectar
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(integration)}
                  className={`w-full px-4 py-2 bg-gradient-to-r ${integration.color} text-white rounded-lg font-medium text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2`}
                >
                  <LinkIcon size={16} />
                  Conectar
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            💡 Centralize tudo em um só lugar
          </h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Mensagens:</strong> WhatsApp, Instagram, Facebook Messenger integrados com agentes de IA</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Vendas:</strong> Hotmart, Kiwify, Stripe e Mercado Pago sincronizam automaticamente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Tráfego Pago:</strong> Google Ads e Facebook Ads monitoram campanhas em tempo real</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Agendamentos:</strong> Google Calendar e Outlook integrados para gestão de reuniões</span>
            </li>
          </ul>
        </div>

        {/* Modal de Configuração */}
        {showModal && selectedIntegration && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-dark-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Configurar {selectedIntegration.name}
              </h3>

                {qrCode && selectedIntegration.id === 'whatsapp' ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    📱 <strong>Escaneie o QR Code com seu WhatsApp</strong>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                    ✅ Funciona com <strong>WhatsApp normal</strong> e <strong>WhatsApp Business</strong>
                  </p>
                  <div className="inline-block p-4 bg-white dark:bg-dark-700 rounded-lg border-2 border-green-500">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`}
                      alt="QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  {connectionTimeout > 0 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                      ⏱️ Tempo restante: {connectionTimeout}s
                    </p>
                  )}
                  <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-left space-y-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-300">📋 Como escanear:</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-400">
                      <li>Abra o WhatsApp no celular</li>
                      <li>Toque em <strong>⋮</strong> (Android) ou <strong>Ajustes</strong> (iPhone)</li>
                      <li>Toque em <strong>Aparelhos conectados</strong></li>
                      <li>Toque em <strong>Conectar um aparelho</strong></li>
                      <li>Aponte a câmera para este QR Code</li>
                    </ol>
                  </div>
                  {lastDisconnectInfo?.message && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs text-yellow-800 dark:text-yellow-300">
                      <p className="font-semibold">⚠️ Último erro detectado</p>
                      <p className="mt-1">{lastDisconnectInfo.message}</p>
                      {lastDisconnectInfo.statusCode && (
                        <p className="mt-1">Código: {lastDisconnectInfo.statusCode} ({lastDisconnectInfo.reason})</p>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setQrCode(null);
                      setSelectedIntegration(null);
                      setConnectionStartTime(0);
                    }}
                    className="mt-6 w-full px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              ) : selectedIntegration.id === 'whatsapp' ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {connecting ? '⚙️ Gerando QR Code...' : '❌ Não foi possível gerar o QR Code'}
                  </p>
                  {connecting && connectionTimeout > 0 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">
                      ⏱️ Timeout em {connectionTimeout}s
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                    ✅ Funciona com <strong>WhatsApp normal</strong> e <strong>WhatsApp Business</strong>
                  </p>
                  <div className="inline-block p-4 bg-white dark:bg-dark-700 rounded-lg border-2 border-gray-300 dark:border-dark-600">
                    <div className="w-64 h-64 flex items-center justify-center">
                      <Loader className={`text-green-500 ${connecting ? 'animate-spin' : 'opacity-30'}`} size={48} />
                    </div>
                  </div>
                  {lastDisconnectInfo?.message && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs text-yellow-800 dark:text-yellow-300 text-left">
                      <p className="font-semibold">⚠️ Último erro detectado</p>
                      <p className="mt-1">{lastDisconnectInfo.message}</p>
                      {lastDisconnectInfo.statusCode && (
                        <p className="mt-1">Código: {lastDisconnectInfo.statusCode} ({lastDisconnectInfo.reason})</p>
                      )}
                    </div>
                  )}
                  <div className="mt-6 space-y-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowModal(false);
                          setQrCode(null);
                          setSelectedIntegration(null);
                          setConnectionStartTime(0);
                        }}
                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
                      >
                        Fechar
                      </button>
                      <button
                        onClick={() => handleConnect({ ...selectedIntegration })}
                        disabled={connecting}
                        className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        Tentar novamente
                      </button>
                    </div>
                    <button
                      onClick={handleWhatsAppReset}
                      className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                    >
                      🔄 Resetar WhatsApp (limpar sessão)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Token de API / Chave de Acesso
                    </label>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Cole seu token aqui"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setToken('');
                        setSelectedIntegration(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleTokenSubmit}
                      className={`flex-1 px-4 py-2 bg-gradient-to-r ${selectedIntegration.color} text-white rounded-lg hover:shadow-lg transition-all`}
                    >
                      Conectar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
