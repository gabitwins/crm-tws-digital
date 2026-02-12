'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Send, Bot, User, Clock, CheckCheck, RefreshCw, Search, Filter,
  MessageCircle, Instagram, Facebook, Tag, Clock as ClockIcon, UserCheck,
  Users, Zap, Mail, FileText, MoreVertical, ChevronDown, X, Check, AlertCircle,
  PlayCircle, PauseCircle, Settings, Download
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSocket } from '@/hooks/useSocket';


export const revalidate = 0;

interface Message {
  id: string;
  content: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
  sentAt: string;
  aiGenerated?: boolean;
  agentType?: string;
  lead: {
    id: string;
    name: string;
    phone: string;
  };
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source?: string;
  currentQueue?: string;
  assignedAgentId?: string;
  tags?: string[];
  status?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

type Channel = 'all' | 'whatsapp' | 'instagram' | 'messenger';
type LeadStatus = 'active' | 'waiting' | 'bot' | 'finished';

export default function MensagensPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Filtros
  const [selectedChannel, setSelectedChannel] = useState<Channel>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Ferramentas laterais
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarTool, setSidebarTool] = useState<string | null>(null);
  
  // Envio em massa
  const [massMessageContent, setMassMessageContent] = useState('');
  const [selectedLeadsForMass, setSelectedLeadsForMass] = useState<string[]>([]);
  
  // Tags
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [availableTags] = useState(['VIP', 'Interesse Alto', 'Follow-up', 'Urgente', 'Promoção']);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (newItem: any) => {
      if (selectedLead && newItem.leadId === selectedLead.id) {
        setMessages((prev) => {
            if (prev.find(m => m.id === newItem.id)) return prev;
            return [...prev, newItem];
        });
        scrollToBottom();
      }
      loadLeads();
    });

    socket.on('new_lead', () => {
      loadLeads();
    });

    return () => {
      socket.off('new_message');
      socket.off('new_lead');
    };
  }, [socket, selectedLead]);

  useEffect(() => {
    loadLeads();
    const interval = setInterval(loadLeads, 30000); // Polling reduzido para 30s como fallback
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedLead) {
      loadMessages(selectedLead.id);
      const interval = setInterval(() => loadMessages(selectedLead.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedLead]);

  useEffect(() => {
    filterLeads();
  }, [leads, selectedChannel, searchTerm, selectedStatus]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filterLeads = () => {
    let filtered = [...leads];

    // Filtro por canal
    if (selectedChannel !== 'all') {
      filtered = filtered.filter(lead => lead.source?.toLowerCase() === selectedChannel);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(lead => lead.status === selectedStatus);
    }

    setFilteredLeads(filtered);
  };

  const loadLeads = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await api.get('/leads');
      const leadsData = response.data || [];
      
      const enrichedLeads = leadsData.map((lead: Lead) => ({
        ...lead,
        source: lead.source || 'whatsapp',
        status: lead.status || 'waiting',
        tags: lead.tags || [],
        unreadCount: lead.unreadCount || 0,
        lastMessageAt: lead.lastMessageAt || new Date().toISOString()
      }));

      setLeads(enrichedLeads);
      if (enrichedLeads.length > 0 && !selectedLead) {
        setSelectedLead(enrichedLeads[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (leadId: string) => {
    try {
      const response = await api.get(`/messages?leadId=${leadId}`);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      setMessages([]);
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedLead) return;

    setSending(true);
    try {
      await api.post('/messages', {
        leadId: selectedLead.id,
        content: newMessage,
        direction: 'OUTBOUND'
      });
      
      setNewMessage('');
      loadMessages(selectedLead.id);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const sendMassMessage = async () => {
    if (!massMessageContent.trim() || selectedLeadsForMass.length === 0) {
      alert('Selecione pelo menos um lead e escreva a mensagem');
      return;
    }

    if (!confirm(`Enviar mensagem para ${selectedLeadsForMass.length} lead(s)?`)) {
      return;
    }

    try {
      // Implementar envio em massa no backend
      await Promise.all(
        selectedLeadsForMass.map(leadId =>
          api.post('/messages', {
            leadId,
            content: massMessageContent,
            direction: 'OUTBOUND'
          })
        )
      );

      alert(`Mensagem enviada para ${selectedLeadsForMass.length} lead(s)!`);
      setMassMessageContent('');
      setSelectedLeadsForMass([]);
      setSidebarTool(null);
    } catch (error) {
      alert('Erro ao enviar mensagens em massa');
    }
  };

  const toggleLeadForMass = (leadId: string) => {
    if (selectedLeadsForMass.includes(leadId)) {
      setSelectedLeadsForMass(selectedLeadsForMass.filter(id => id !== leadId));
    } else {
      setSelectedLeadsForMass([...selectedLeadsForMass, leadId]);
    }
  };

  const addTagToLead = async (tag: string) => {
    if (!selectedLead) return;

    try {
      const updatedTags = [...(selectedLead.tags || []), tag];
      await api.patch(`/leads/${selectedLead.id}`, { tags: updatedTags });
      
      setSelectedLead({ ...selectedLead, tags: updatedTags });
      loadLeads();
    } catch (error) {
      alert('Erro ao adicionar tag');
    }
  };

  const removeTagFromLead = async (tag: string) => {
    if (!selectedLead) return;

    try {
      const updatedTags = (selectedLead.tags || []).filter(t => t !== tag);
      await api.patch(`/leads/${selectedLead.id}`, { tags: updatedTags });
      
      setSelectedLead({ ...selectedLead, tags: updatedTags });
      loadLeads();
    } catch (error) {
      alert('Erro ao remover tag');
    }
  };

  const getChannelIcon = (source: string) => {
    switch (source) {
      case 'whatsapp': return <MessageCircle size={16} className="text-green-600" />;
      case 'instagram': return <Instagram size={16} className="text-pink-600" />;
      case 'messenger': return <Facebook size={16} className="text-blue-600" />;
      default: return <MessageCircle size={16} className="text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Ativo' },
      waiting: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Aguardando' },
      bot: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Bot' },
      finished: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-400', label: 'Finalizado' }
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] flex gap-4">
        {/* Barra Lateral de Ferramentas */}
        <div className="w-16 bg-gradient-to-b from-blue-600 to-indigo-600 dark:from-dark-900 dark:to-dark-950 rounded-2xl p-2 flex flex-col gap-2">
          <button
            onClick={() => { setSidebarTool('filters'); setShowSidebar(!showSidebar); }}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white"
            title="Filtros"
          >
            <Filter size={20} />
          </button>
          
          <button
            onClick={() => { setSidebarTool('mass'); setShowSidebar(!showSidebar); }}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white"
            title="Envio em Massa"
          >
            <Users size={20} />
          </button>
          
          <button
            onClick={() => { setSidebarTool('automation'); setShowSidebar(!showSidebar); }}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white"
            title="Auto Atendimento"
          >
            <Zap size={20} />
          </button>
          
          <button
            onClick={() => { setSidebarTool('export'); setShowSidebar(!showSidebar); }}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white"
            title="Exportar Conversas"
          >
            <Download size={20} />
          </button>
          
          <div className="flex-1" />
          
          <button
            onClick={loadLeads}
            disabled={loading}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white"
            title="Atualizar"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Painel de Ferramentas Expandido */}
        {showSidebar && (
          <div className="w-80 bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {sidebarTool === 'filters' && 'Filtros Avançados'}
                {sidebarTool === 'mass' && 'Envio em Massa'}
                {sidebarTool === 'automation' && 'Auto Atendimento'}
                {sidebarTool === 'export' && 'Exportar Dados'}
              </h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filtros */}
            {sidebarTool === 'filters' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Ativo</option>
                    <option value="waiting">Aguardando</option>
                    <option value="bot">Bot</option>
                    <option value="finished">Finalizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Fila
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white">
                    <option>Todas</option>
                    <option>Pré-Venda</option>
                    <option>Pós-Venda</option>
                    <option>Suporte</option>
                    <option>Humana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-800/40"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Envio em Massa */}
            {sidebarTool === 'mass' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selecione os leads na lista e escreva a mensagem
                </p>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    {selectedLeadsForMass.length} lead(s) selecionado(s)
                  </p>
                </div>

                <textarea
                  value={massMessageContent}
                  onChange={(e) => setMassMessageContent(e.target.value)}
                  placeholder="Digite a mensagem que será enviada para todos..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white h-32 resize-none"
                />

                <button
                  onClick={sendMassMessage}
                  disabled={selectedLeadsForMass.length === 0 || !massMessageContent.trim()}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Enviar para {selectedLeadsForMass.length} Lead(s)
                </button>
              </div>
            )}

            {/* Auto Atendimento */}
            {sidebarTool === 'automation' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400">Auto Atendimento</p>
                    <p className="text-xs text-green-600 dark:text-green-500">Ativo</p>
                  </div>
                  <button className="p-2 bg-green-600 text-white rounded-lg">
                    <PauseCircle size={20} />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Agente de IA Ativo
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white">
                    <option>Agente Pré-Venda</option>
                    <option>Agente Pós-Venda</option>
                    <option>Agente Suporte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Horário de Atendimento
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      defaultValue="08:00"
                      className="px-3 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white"
                    />
                    <input
                      type="time"
                      defaultValue="18:00"
                      className="px-3 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Exportar */}
            {sidebarTool === 'export' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Exporte conversas e relatórios
                </p>
                
                <button className="w-full px-4 py-3 bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 flex items-center justify-center gap-2">
                  <Download size={18} />
                  Exportar como CSV
                </button>
                
                <button className="w-full px-4 py-3 bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 flex items-center justify-center gap-2">
                  <Download size={18} />
                  Exportar como PDF
                </button>
              </div>
            )}
          </div>
        )}

        {/* Lista de Conversas */}
        <div className="w-96 bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 flex flex-col">
          {/* Header com Filtros de Canal */}
          <div className="p-4 border-b border-gray-200 dark:border-dark-700 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Conversas</h2>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold">
                {filteredLeads.length}
              </span>
            </div>

            {/* Filtro por Canal */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedChannel('all')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                  selectedChannel === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedChannel('whatsapp')}
                className={`p-2 rounded-lg transition-colors ${
                  selectedChannel === 'whatsapp'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                <MessageCircle size={18} />
              </button>
              <button
                onClick={() => setSelectedChannel('instagram')}
                className={`p-2 rounded-lg transition-colors ${
                  selectedChannel === 'instagram'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                <Instagram size={18} />
              </button>
              <button
                onClick={() => setSelectedChannel('messenger')}
                className={`p-2 rounded-lg transition-colors ${
                  selectedChannel === 'messenger'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                <Facebook size={18} />
              </button>
            </div>

            {/* Busca */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageCircle size={48} className="text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  {leads.length === 0 ? 'Nenhuma conversa' : 'Nenhum resultado encontrado'}
                </p>
                {leads.length === 0 && (
                  <button
                    onClick={() => window.location.href = '/dashboard/integracoes'}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Conectar Integrações
                  </button>
                )}
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const statusBadge = getStatusBadge(lead.status || 'active');
                return (
                  <button
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`w-full p-3 rounded-xl mb-2 text-left transition-all relative ${
                      selectedLead?.id === lead.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                        : 'hover:bg-gray-50 dark:hover:bg-dark-700 border-2 border-transparent'
                    }`}
                  >
                    {/* Checkbox para envio em massa */}
                    {sidebarTool === 'mass' && (
                      <input
                        type="checkbox"
                        checked={selectedLeadsForMass.includes(lead.id)}
                        onChange={() => toggleLeadForMass(lead.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-3 right-3 w-4 h-4"
                      />
                    )}

                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {lead.name.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getChannelIcon(lead.source || 'whatsapp')}
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1">
                            {lead.name}
                          </h3>
                          {(lead.unreadCount ?? 0) > 0 && (
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                              {lead.unreadCount}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                            {statusBadge.label}
                          </span>
                          {lead.currentQueue && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {lead.currentQueue}
                            </span>
                          )}
                        </div>

                        {lead.tags && lead.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {lead.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {lead.tags.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                +{lead.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Área de Chat */}
        {selectedLead ? (
          <div className="flex-1 bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-dark-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {selectedLead.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{selectedLead.name}</h3>
                    <div className="flex items-center gap-2">
                      {getChannelIcon(selectedLead.source || 'whatsapp')}
                      <span className="text-sm text-gray-600 dark:text-gray-400">{selectedLead.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Tags */}
                  <button
                    onClick={() => setShowTagModal(!showTagModal)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors relative"
                  >
                    <Tag size={18} className="text-gray-600 dark:text-gray-400" />
                    {selectedLead.tags && selectedLead.tags.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        {selectedLead.tags.length}
                      </span>
                    )}
                  </button>

                  {/* Info do Agente IA */}
                  {selectedLead.status === 'bot' && (
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg flex items-center gap-2">
                      <Bot size={16} />
                      <span className="text-sm font-semibold">Agente Ativo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags Expandidas */}
              {showTagModal && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tags</p>
                    <button onClick={() => setShowTagModal(false)}>
                      <X size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedLead.tags?.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm flex items-center gap-2">
                        {tag}
                        <button onClick={() => removeTagFromLead(tag)}>
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Nova tag..."
                      className="flex-1 px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newTag.trim()) {
                          addTagToLead(newTag.trim());
                          setNewTag('');
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newTag.trim()) {
                          addTagToLead(newTag.trim());
                          setNewTag('');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Check size={16} />
                    </button>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Sugestões:</p>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.filter(t => !selectedLead.tags?.includes(t)).map(tag => (
                        <button
                          key={tag}
                          onClick={() => addTagToLead(tag)}
                          className="px-2 py-1 bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 dark:hover:bg-dark-500"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-900/50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle size={48} className="text-gray-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">Nenhuma mensagem ainda</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.direction === 'OUTBOUND';
                  
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isMine ? 'order-2' : 'order-1'}`}>
                        {msg.aiGenerated && (
                          <div className="flex items-center gap-1 mb-1 text-xs text-blue-600 dark:text-blue-400">
                            <Bot size={12} />
                            <span>Enviado por IA - {msg.agentType}</span>
                          </div>
                        )}
                        <div className={`rounded-2xl px-4 py-2 ${
                          isMine
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                            : 'bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-200 dark:border-dark-700'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-2 mt-1 px-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(msg.sentAt), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                          {isMine && msg.status === 'SENT' && (
                            <CheckCheck size={14} className="text-blue-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-dark-700">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={64} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Escolha um lead para ver as mensagens
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
