'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ListTree, Users, Clock, TrendingUp, Play, Pause, Settings, RefreshCw, Activity, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentInteraction {
  id: string;
  leadName: string;
  leadPhone: string;
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  sentAt: string;
  aiGenerated?: boolean;
}

interface Queue {
  id: string;
  name: string;
  description: string;
  leads: number;
  avgWaitTime: string;
  conversion: number;
  agent: string;
  agentId: string;
  status: 'active' | 'paused';
  color: string;
  recentInteractions?: RecentInteraction[];
}

export default function FilasPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [expandedQueue, setExpandedQueue] = useState<string | null>(null);

  const loadQueues = async () => {
    try {
      setLoading(true);
      const response = await api.get('/queues');
      
      if (response.data && response.data.length > 0) {
        setQueues(response.data);
      } else {
        setQueues([]);
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar filas:', error);
      setQueues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueues();
    
    // POLLING: Atualizar a cada 5 segundos para mostrar em tempo real
    const interval = setInterval(() => {
      loadQueues();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const totalLeads = Array.isArray(queues) ? queues.reduce((sum, q) => sum + q.leads, 0) : 0;
  const avgConversion = queues.length > 0 
    ? queues.reduce((sum, q) => sum + q.conversion, 0) / queues.length 
    : 0;

  const toggleQueueStatus = async (queueId: string) => {
    const queue = queues.find(q => q.id === queueId);
    if (!queue) return;

    const newStatus = queue.status === 'active' ? 'paused' : 'active';
    
    setQueues(queues.map(q => 
      q.id === queueId ? { ...q, status: newStatus } : q
    ));

    try {
      await api.patch(`/queues/${queueId}/status`, { status: newStatus });
    } catch (error) {
      console.error('Erro ao alterar status da fila:', error);
      setQueues(queues.map(q => 
        q.id === queueId ? { ...q, status: queue.status } : q
      ));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Filas</h2>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              Acompanhe e gerencie todas as filas operacionais
              <span className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                <Activity size={12} className="animate-pulse" />
                Tempo real
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Atualizado: {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: ptBR })}
            </div>
            <button
              onClick={loadQueues}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <ListTree size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Filas Ativas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Array.isArray(queues) ? queues.filter(q => q.status === 'active').length : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Users size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLeads}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conversão Média</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {avgConversion > 0 ? `${avgConversion.toFixed(0)}%` : '0%'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Clock size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tempo Médio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalLeads > 0 ? (queues[0]?.avgWaitTime || '0s') : '0s'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Queues Grid */}
        {loading && queues.length === 0 ? (
          <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl p-12 text-center border border-gray-200 dark:border-dark-700">
            <RefreshCw size={32} className="mx-auto mb-4 text-blue-500 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Carregando filas...</p>
          </div>
        ) : queues.length === 0 ? (
          <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl p-12 text-center border border-gray-200 dark:border-dark-700">
            <div className="max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ListTree size={40} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Nenhuma fila ativa no momento
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                As filas operacionais serão criadas automaticamente quando você ativar seus agentes de IA.
              </p>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 text-left">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  📋 Como funcionam as Filas
                </h4>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-lg">1.</span>
                    <div>
                      <strong>Crie seus agentes de IA</strong> na seção "Agentes de IA"
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-lg">2.</span>
                    <div>
                      <strong>Ative os agentes</strong> para começarem a atender
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-lg">3.</span>
                    <div>
                      <strong>As filas são criadas automaticamente</strong> baseadas na função de cada agente (Pré-Venda, Suporte, Pós-Venda, etc.)
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-lg">4.</span>
                    <div>
                      <strong>Leads são distribuídos automaticamente</strong> para as filas corretas baseado em regras de negócio
                    </div>
                  </li>
                </ul>
              </div>

              <a 
                href="/dashboard/agentes"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <ListTree size={20} />
                Criar Agentes de IA
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {queues.map((queue) => (
              <div 
                key={queue.id} 
                className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-dark-700 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-${queue.color}-100 dark:bg-${queue.color}-900/30 rounded-xl`}>
                    <ListTree size={28} className={`text-${queue.color}-600`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${queue.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {queue.status === 'active' ? 'Ativa' : 'Pausada'}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{queue.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{queue.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Leads na fila</span>
                    <span className="text-lg font-bold text-blue-600">{queue.leads}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tempo médio de resposta</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{queue.avgWaitTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Taxa de conversão</span>
                    <span className={`text-sm font-bold ${
                      queue.conversion >= 50 ? 'text-green-600' : 
                      queue.conversion > 0 ? 'text-yellow-600' : 
                      'text-gray-400'
                    }`}>
                      {queue.conversion > 0 ? `${queue.conversion}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Agente ativo</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{queue.agent}</span>
                  </div>
                </div>

                {totalLeads > 0 && (
                  <div className="h-2 bg-gray-200 dark:bg-dark-700 rounded-full mb-4 overflow-hidden">
                    <div 
                      className={`h-full bg-${queue.color}-500 transition-all`}
                      style={{ width: `${queue.leads > 0 ? (queue.leads / totalLeads) * 100 : 0}%` }}
                    ></div>
                  </div>
                )}

                {/* Interações Recentes */}
                {queue.recentInteractions && queue.recentInteractions.length > 0 && (
                  <div className="mt-4 border-t border-gray-200 dark:border-dark-700 pt-4">
                    <button
                      onClick={() => setExpandedQueue(expandedQueue === queue.id ? null : queue.id)}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <MessageCircle size={16} />
                      Interações Recentes ({queue.recentInteractions.length})
                    </button>
                    
                    {expandedQueue === queue.id && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {queue.recentInteractions.map((interaction) => (
                          <div 
                            key={interaction.id}
                            className={`text-xs p-2 rounded-lg ${
                              interaction.direction === 'OUTBOUND' 
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' 
                                : 'bg-gray-50 dark:bg-gray-900/20 border-l-2 border-gray-400'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {interaction.leadName}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                {formatDistanceToNow(new Date(interaction.sentAt), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                              {interaction.direction === 'OUTBOUND' && interaction.aiGenerated && '🤖 '}
                              {interaction.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-4 py-2 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 transition-colors">
                    <Settings size={16} />
                    Configurar
                  </button>
                  <button 
                    onClick={() => toggleQueueStatus(queue.id)}
                    className={`px-4 py-2 ${
                      queue.status === 'active' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50' 
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                    } rounded-xl font-medium flex items-center justify-center gap-2 transition-colors`}
                  >
                    {queue.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
