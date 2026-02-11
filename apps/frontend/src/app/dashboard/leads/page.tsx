'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Search, Filter, Mail, Phone, Tag, Clock, MessageSquare, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone: string;
  status: string;
  currentQueue?: string;
  source?: string;
  isActive: boolean;
  createdAt: string;
  lastInteraction?: string;
  tags: Array<{
    id: string;
    tag: {
      id: string;
      name: string;
      color?: string;
    };
  }>;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterQueue, setFilterQueue] = useState<string | null>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const response = await api.get('/leads');
      setLeads(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = Array.isArray(leads) ? leads.filter(lead => {
    const matchSearch = lead.name?.toLowerCase().includes(search.toLowerCase()) ||
                       lead.phone?.includes(search);
    const matchQueue = !filterQueue || lead.currentQueue === filterQueue;
    return matchSearch && matchQueue;
  }) : [];

  const getQueueColor = (queue?: string) => {
    const colors: Record<string, string> = {
      'PRE_VENDA': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'CHECKOUT': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      'POS_VENDA': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'SUPORTE': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'RETENCAO': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'HUMANA': 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
    };
    return colors[queue || ''] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
  };

  const getSourceIcon = (source?: string) => {
    if (source?.includes('whatsapp')) return '📱';
    if (source?.includes('instagram')) return '📷';
    if (source?.includes('facebook')) return '📘';
    return '🌐';
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Nunca';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours < 1) return 'Agora';
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Leads</h2>
            <p className="text-slate-600 dark:text-gray-400">Gerencie todos os seus leads em um só lugar</p>
          </div>
          <button 
            onClick={loadLeads}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-dark-700/50">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-dark-700/50 border border-slate-200 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={filterQueue || ''}
              onChange={(e) => setFilterQueue(e.target.value || null)}
              className="px-4 py-2 bg-white/50 dark:bg-dark-700/50 border border-slate-200 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as filas</option>
              <option value="PRE_VENDA">Pré-Venda</option>
              <option value="CHECKOUT">Checkout</option>
              <option value="POS_VENDA">Pós-Venda</option>
              <option value="SUPORTE">Suporte</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-dark-700/50">
            <div className="text-sm text-slate-600 dark:text-gray-400 mb-1">Total de Leads</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{leads.length}</div>
          </div>
          <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-dark-700/50">
            <div className="text-sm text-slate-600 dark:text-gray-400 mb-1">Ativos</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{leads.filter(l => l.isActive).length}</div>
          </div>
          <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-dark-700/50">
            <div className="text-sm text-slate-600 dark:text-gray-400 mb-1">Hoje</div>
            <div className="text-3xl font-bold text-blue-600">
              {leads.filter(l => {
                const today = new Date().toDateString();
                return new Date(l.createdAt).toDateString() === today;
              }).length}
            </div>
          </div>
          <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 dark:border-dark-700/50">
            <div className="text-sm text-slate-600 dark:text-gray-400 mb-1">Pré-Venda</div>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {leads.filter(l => l.currentQueue === 'PRE_VENDA').length}
            </div>
          </div>
        </div>

        {/* Leads List */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="animate-spin mx-auto mb-4 text-blue-500" size={32} />
            <p className="text-slate-600 dark:text-gray-400">Carregando leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl p-12 border border-slate-200/50 dark:border-dark-700/50 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum lead encontrado</h3>
            <p className="text-slate-600 dark:text-gray-400 mb-4">
              {search ? 'Tente outra busca' : 'Conecte suas integrações para começar a receber leads'}
            </p>
            <Link
              href="/dashboard/integracoes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Conectar Integrações
            </Link>
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-dark-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50 dark:bg-dark-900/50 border-b border-slate-200 dark:border-dark-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider">Lead</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider">Contato</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider">Fila</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider">Último contato</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-dark-700">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{lead.name}</div>
                            <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1">
                              {getSourceIcon(lead.source)}
                              {lead.source || 'Desconhecido'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
                              <Mail size={14} />
                              {lead.email}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
                            <Phone size={14} />
                            {lead.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getQueueColor(lead.currentQueue)}`}>
                          {lead.currentQueue?.replace('_', ' ') || 'Sem fila'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {lead.tags.slice(0, 2).map((tagObj) => (
                            <span
                              key={tagObj.id}
                              className="px-2 py-1 bg-slate-100 dark:bg-dark-700 text-slate-700 dark:text-gray-300 rounded-md text-xs"
                              style={{ backgroundColor: tagObj.tag.color + '20', color: tagObj.tag.color }}
                            >
                              {tagObj.tag.name}
                            </span>
                          ))}
                          {lead.tags.length > 2 && (
                            <span className="px-2 py-1 bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-gray-400 rounded-md text-xs">
                              +{lead.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
                          <Clock size={14} />
                          {formatDate(lead.lastInteraction || lead.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/mensagens?lead=${lead.id}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                        >
                          <MessageSquare size={14} />
                          Ver conversa
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
