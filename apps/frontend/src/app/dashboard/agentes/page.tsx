'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Upload, Save, FileText, Plus, Trash2, RefreshCw, Bot, 
  Mic, BookOpen, CheckCircle, XCircle, AlertCircle, Download,
  MessageCircle, ArrowLeft, Send
} from 'lucide-react';
import { api } from '@/lib/api';

type AgentType = 'PRE_VENDA' | 'POS_VENDA' | 'SUPORTE';

interface AgentConfig {
  id?: string;
  agentType: AgentType;
  agentFunction?: string;
  name: string;
  systemPrompt: string;
  personality: string;
  tone: string;
  language: string;
  temperature: number;
  maxTokens: number;
  dosList: string[];
  dontsList: string[];
  exampleConversations: any;
  knowledgeBase: string;
  trainingFiles?: any[];
}

export default function AgentesPage() {
  const [view, setView] = useState<'list' | 'choice' | 'selection' | 'templates' | 'form' | 'chat'>('list');
  const [savedAgents, setSavedAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('PRE_VENDA');
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'personality' | 'training' | 'examples'>('prompt');
  const [newDo, setNewDo] = useState('');
  const [newDont, setNewDont] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatAgentId, setChatAgentId] = useState<string>('');

  const agents = [
    { type: 'PRE_VENDA' as AgentType, name: 'Pré-Venda', icon: '💼', color: 'from-blue-500 to-blue-600', description: 'Qualifica leads e realiza vendas consultivas' },
    { type: 'POS_VENDA' as AgentType, name: 'Pós-Venda', icon: '🎯', color: 'from-green-500 to-green-600', description: 'Onboarding, retenção e upsell' },
    { type: 'SUPORTE' as AgentType, name: 'Suporte', icon: '🛟', color: 'from-purple-500 to-purple-600', description: 'Dúvidas técnicas e operacionais' }
  ];

  // Lista expandida de funções para o select do formulário (salva em agentFunction)
  // agentType continua sendo uma das 3 categorias do sistema (enum do Prisma)
  const agentFunctions: Array<{ value: string; label: string; mapToType: AgentType }> = [
    { value: 'PRE_VENDA', label: 'Pré-Venda / Qualificação de Leads', mapToType: 'PRE_VENDA' },
    { value: 'VENDAS', label: 'Vendas Consultivas', mapToType: 'PRE_VENDA' },
    { value: 'POS_VENDA', label: 'Pós-Venda / Onboarding', mapToType: 'POS_VENDA' },
    { value: 'REMARKETING', label: 'Remarketing / Reativação', mapToType: 'POS_VENDA' },
    { value: 'RETENCAO', label: 'Retenção de Clientes', mapToType: 'POS_VENDA' },
    { value: 'UPSELL', label: 'Upsell / Cross-sell', mapToType: 'POS_VENDA' },
    { value: 'COBRANCA', label: 'Cobrança / Financeiro', mapToType: 'POS_VENDA' },
    { value: 'SUPORTE', label: 'Suporte Técnico', mapToType: 'SUPORTE' },
    { value: 'ATENDIMENTO', label: 'Atendimento ao Cliente', mapToType: 'SUPORTE' },
    { value: 'AGENDAMENTO', label: 'Agendamento / Marcação', mapToType: 'SUPORTE' },
    { value: 'PESQUISA', label: 'Pesquisa / Feedback', mapToType: 'SUPORTE' },
    { value: 'EDUCACAO', label: 'Educação / Treinamento', mapToType: 'SUPORTE' }
  ];

  const agentTemplates = [
    {
      name: 'Vendas Consultivas',
      type: 'PRE_VENDA',
      icon: '💼',
      description: 'Agente especializado em qualificar leads e realizar vendas consultivas',
      prompt: 'Você é um consultor de vendas especializado em identificar necessidades, qualificar leads e conduzir conversas consultivas que agregam valor.',
      personality: 'Profissional, consultivo e persuasivo',
      tone: 'Profissional e amigável'
    },
    {
      name: 'Pré-Vendas',
      type: 'PRE_VENDA',
      icon: '🔥',
      description: 'Qualifica leads, identifica dores e conduz para o checkout',
      prompt: 'Você é especialista em pré-vendas. Seu objetivo é qualificar o lead, entender suas dores e necessidades, e conduzi-lo naturalmente para a compra.',
      personality: 'Estratégico, empático e orientado a resultados',
      tone: 'Profissional e amigável'
    },
    {
      name: 'Remarketing',
      type: 'POS_VENDA',
      icon: '🔄',
      description: 'Reativa clientes inativos e oferece promoções personalizadas',
      prompt: 'Você é especialista em reativar clientes inativos através de ofertas personalizadas e comunicação empática.',
      personality: 'Empático, persuasivo e oferece valor',
      tone: 'Casual e descontraído'
    },
    {
      name: 'Suporte Técnico',
      type: 'SUPORTE',
      icon: '🛟',
      description: 'Resolve dúvidas técnicas com base na base de conhecimento',
      prompt: 'Você é um especialista em suporte técnico. Responde dúvidas com clareza, paciência e sempre baseado na base de conhecimento.',
      personality: 'Paciente, claro e objetivo',
      tone: 'Técnico e objetivo'
    },
    {
      name: 'Onboarding',
      type: 'POS_VENDA',
      icon: '👋',
      description: 'Guia novos clientes pelos primeiros passos',
      prompt: 'Você é especialista em onboarding de clientes. Seu papel é dar as boas-vindas, orientar os primeiros passos e garantir uma experiência positiva.',
      personality: 'Acolhedor, educativo e motivador',
      tone: 'Empático e acolhedor'
    },
    {
      name: 'Upsell e Cross-sell',
      type: 'POS_VENDA',
      icon: '💎',
      description: 'Identifica oportunidades de upgrade e produtos complementares',
      prompt: 'Você é especialista em identificar oportunidades de upsell e cross-sell de forma natural, sempre agregando valor ao cliente.',
      personality: 'Consultivo, atento e focado em valor',
      tone: 'Consultivo e educativo'
    },
    {
      name: 'Educação e Treinamento',
      type: 'SUPORTE',
      icon: '🎓',
      description: 'Ensina clientes a usar o produto de forma eficiente',
      prompt: 'Você é um educador especializado em treinar clientes sobre o produto. Explica de forma clara, com exemplos práticos.',
      personality: 'Didático, paciente e encorajador',
      tone: 'Educativo e acessível'
    },
    {
      name: 'Retenção',
      type: 'POS_VENDA',
      icon: '🚀',
      description: 'Previne churn e mantém clientes engajados',
      prompt: 'Você é especialista em retenção de clientes. Identifica sinais de desengajamento e age proativamente para manter o cliente satisfeito.',
      personality: 'Proativo, empático e orientado a resultados',
      tone: 'Empático e acolhedor'
    }
  ];

  const toneOptions = [
    'Profissional e formal',
    'Profissional e amigável',
    'Casual e descontraído',
    'Técnico e objetivo',
    'Empático e acolhedor',
    'Consultivo e educativo'
  ];

  useEffect(() => {
    loadSavedAgents();
  }, []);

  useEffect(() => {
    if (view === 'form' && !config) {
      loadAgentConfig();
    }
  }, [selectedAgent, view]);

  const loadSavedAgents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/training/agents');
      setSavedAgents(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar agentes:', error);
      setSavedAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAgentConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/training/agents/config/${selectedAgent}`);
      setConfig({
        ...response.data,
        agentFunction: response.data?.agentFunction || response.data?.agentType
      });
      setView('form');
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      // Criar configuração padrão em caso de erro
      setConfig({
        agentType: selectedAgent,
        agentFunction: selectedAgent,
        name: agents.find(a => a.type === selectedAgent)?.name || 'Agente',
        systemPrompt: '',
        personality: '',
        tone: 'Profissional e amigável',
        language: 'pt-BR',
        temperature: 0.7,
        maxTokens: 500,
        dosList: [],
        dontsList: [],
        exampleConversations: [],
        knowledgeBase: ''
      });
      setView('form');
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = (template: any) => {
    setConfig({
      agentType: template.type,
      agentFunction: template.type,
      name: template.name,
      systemPrompt: template.prompt,
      personality: template.personality,
      tone: template.tone,
      language: 'pt-BR',
      temperature: 0.7,
      maxTokens: 500,
      dosList: [],
      dontsList: [],
      exampleConversations: [],
      knowledgeBase: ''
    });
    setSelectedAgent(template.type);
    setView('form');
  };

  const goToCreateFromScratch = () => {
    // Vai direto para o formulário, sem passar pela tela de seleção
    setConfig({
      agentType: 'PRE_VENDA', // Valor padrão
      agentFunction: 'PRE_VENDA',
      name: '',
      systemPrompt: '',
      personality: '',
      tone: 'Profissional e amigável',
      language: 'pt-BR',
      temperature: 0.7,
      maxTokens: 500,
      dosList: [],
      dontsList: [],
      exampleConversations: [],
      knowledgeBase: ''
    });
    setView('form');
  };

  const goToTemplates = () => {
    setView('templates');
  };

  const startFromScratch = () => {
    setView('form');
  };

  const backToList = () => {
    setView('list');
    setConfig(null);
  };

  const backToChoice = () => {
    setView('choice');
  };

  const saveConfig = async () => {
    if (!config) {
      alert('❌ Configuração não encontrada');
      return;
    }

    // Validação básica
    if (!config.name || !config.systemPrompt) {
      alert('❌ Por favor, preencha o nome do agente e o prompt do sistema');
      return;
    }

    try {
      setSaving(true);
      
      console.log('📤 Salvando agente:', config);
      
      // Se tem ID, é edição; senão é criação
      let response;
      if (config.id) {
        response = await api.put(`/training/agents/${config.id}`, config);
      } else {
        response = await api.post('/training/agents', config);
      }
      
      console.log('✅ Resposta do servidor:', response.data);
      
      if (response.data?.id) {
        setConfig({ ...config, id: response.data.id });
      }
      
      // Recarrega a lista de agentes
      await loadSavedAgents();
      
      // Volta para a lista
      setView('list');
      setConfig(null);
      
      alert('✅ Agente salvo com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao salvar agente:', error);
      console.error('Detalhes:', error.response?.data);
      alert(`❌ Erro ao salvar agente: ${error.response?.data?.error || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleAgentStatus = async (agentId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/training/agents/${agentId}/toggle`, { active: !currentStatus });
      await loadSavedAgents();
    } catch (error) {
      console.error('Erro ao ativar/desativar agente:', error);
      alert('Erro ao alterar status do agente');
    }
  };

  const deleteAgent = async (agentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este agente? Esta acao nao pode ser desfeita.')) {
      return;
    }

    try {
      await api.delete(`/training/agents/${agentId}`);
      setSavedAgents(savedAgents.filter(a => a.id !== agentId));
      alert('Agente excluido com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir agente');
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    try {
      const history = chatMessages.map(m => ({ role: m.role, content: m.content }));
      const response = await api.post(`/training/agents/${chatAgentId}/chat`, {
        message: userMsg,
        conversationHistory: history
      });
      setChatMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
    } catch (error: any) {
      console.error('Erro no chat:', error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao processar mensagem. Verifique se a API key da OpenAI esta configurada.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const openChat = (agentId: string) => {
    setChatAgentId(agentId);
    setChatMessages([]);
    setChatInput('');
    setView('chat');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const agentTypeToUpload = config?.agentType || selectedAgent;
      await api.post(`/training/agents/upload/${agentTypeToUpload}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Arquivo enviado e processado com sucesso!');
      loadAgentConfig();
    } catch (error: any) {
      console.error('Erro upload:', error);
      alert(`Erro ao fazer upload do arquivo: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const addDo = () => {
    if (newDo.trim() && config) {
      setConfig({
        ...config,
        dosList: [...(config.dosList || []), newDo.trim()]
      });
      setNewDo('');
    }
  };

  const addDont = () => {
    if (newDont.trim() && config) {
      setConfig({
        ...config,
        dontsList: [...(config.dontsList || []), newDont.trim()]
      });
      setNewDont('');
    }
  };

  const removeDo = (index: number) => {
    if (config) {
      setConfig({
        ...config,
        dosList: config.dosList.filter((_, i) => i !== index)
      });
    }
  };

  const removeDont = (index: number) => {
    if (config) {
      setConfig({
        ...config,
        dontsList: config.dontsList.filter((_, i) => i !== index)
      });
    }
  };

  if (view === 'form' && loading && !config) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <RefreshCw size={48} className="animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {view === 'list' ? (
        // TELA PRINCIPAL: Lista de Agentes Salvos
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agentes de IA</h2>
              <p className="text-gray-600 dark:text-gray-400">Gerencie seus agentes inteligentes</p>
            </div>
            <button
              onClick={() => setView('choice')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Novo Agente
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="animate-spin text-blue-500" size={32} />
            </div>
          ) : savedAgents.length === 0 ? (
            // Estado vazio - nenhum agente criado ainda
            <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl p-12 text-center border border-gray-200 dark:border-dark-700">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Nenhum agente criado</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Crie seu primeiro agente de IA para automatizar conversas e melhorar seu atendimento
              </p>
              <button
                onClick={() => setView('choice')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                <Plus size={20} />
                Criar Primeiro Agente
              </button>
            </div>
          ) : (
            // Lista de agentes criados
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={`bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-xl p-6 border-2 transition-all hover:shadow-xl group relative ${
                    agent.isActive 
                      ? 'border-green-500 dark:border-green-500' 
                      : 'border-gray-200 dark:border-dark-700 opacity-75'
                  }`}
                >
                  {/* Badge de Status */}
                  <div className="absolute top-4 right-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 ${
                      agent.isActive 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                        : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${agent.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      {agent.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      agent.isActive 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}>
                      <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 mt-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{agent.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {agent.id?.substring(0, 8)}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 min-h-[60px]">
                    {agent.systemPrompt || 'Sem descrição configurada'}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                      {agentFunctions.find(f => f.value === agent.agentType)?.label || agent.agentType}
                    </span>
                    {agent.tone && (
                      <span className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-medium">
                        {agent.tone}
                      </span>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-dark-700">
                    <button
                      onClick={() => {
                        setSelectedAgent(agent.agentType);
                        setConfig(agent);
                        setView('form');
                      }}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                      title="Editar Agente"
                    >
                      <FileText size={16} />
                      Editar
                    </button>
                    
                    <button
                      onClick={() => toggleAgentStatus(agent.id, agent.isActive)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                        agent.isActive
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                      title={agent.isActive ? 'Desativar' : 'Ativar'}
                    >
                      {agent.isActive ? (
                        <>
                          <XCircle size={16} />
                          Pausar
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Ativar
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => openChat(agent.id)}
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1"
                      title="Testar Chat"
                    >
                      <MessageCircle size={16} />
                      Chat
                    </button>

                    <button
                      onClick={() => deleteAgent(agent.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors"
                      title="Excluir Agente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : view === 'chat' ? (
        <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('list')}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Testar Agente - {savedAgents.find(a => a.id === chatAgentId)?.name || 'Agente'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Converse com seu agente para testar as respostas</p>
            </div>
          </div>

          <div className="flex-1 bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-dark-700 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                  <div className="text-center">
                    <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Envie uma mensagem para testar o agente</p>
                    <p className="text-sm mt-1">O agente usara o prompt e configuracoes definidas</p>
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-dark-700 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-dark-700">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={chatLoading}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                >
                  <Send size={18} />
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : view === 'choice' ? (
        // PÁGINA INICIAL: Escolher entre Criar do Zero ou Modelos Prontos
        <div className="min-h-[600px] flex items-center justify-center">
          <div className="max-w-4xl w-full space-y-12">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Agentes de IA</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">Como você deseja criar seu agente?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Opção 1: Criar do Zero */}
              <button
                onClick={goToCreateFromScratch}
                className="group bg-white dark:bg-dark-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-dark-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all text-left"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Criar do Zero
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Configure cada detalhe do seu agente: prompt, personalidade, tom de voz e base de conhecimento completa
                  </p>
                  <div className="pt-2">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                      Começar configuração →
                    </span>
                  </div>
                </div>
              </button>

              {/* Opção 2: Modelos Prontos */}
              <button
                onClick={goToTemplates}
                className="group bg-white dark:bg-dark-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-dark-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl transition-all text-left"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Modelos Prontos
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Escolha entre 8 templates profissionais prontos para vendas, suporte, remarketing e muito mais
                  </p>
                  <div className="pt-2">
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:underline">
                      Ver templates disponíveis →
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : view === 'templates' ? (
        // Tela de Templates
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={backToChoice}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors flex items-center gap-2"
            >
              ← Voltar
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Modelos Prontos de Agentes</h2>
              <p className="text-gray-600 dark:text-gray-400">Escolha um template e personalize como desejar</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {agentTemplates.map((template, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-200 dark:border-dark-700 hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all group cursor-pointer" 
                onClick={() => useTemplate(template)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                        {agents.find(a => a.type === template.type)?.name}
                      </span>
                      <span className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-medium">
                        {template.tone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
                  <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium text-sm opacity-0 group-hover:opacity-100 transition-all hover:shadow-lg">
                    Usar este Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !config ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw size={48} className="animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={backToList}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              title="Voltar para lista"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Treinamento de Agentes IA</h2>
              <p className="text-gray-600 dark:text-gray-400">Configure personalidade, tom de voz e conhecimento dos agentes</p>
            </div>
          </div>
          <button
            onClick={saveConfig}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
            {saving ? 'Salvando...' : 'Salvar Configuração'}
          </button>
        </div>

        {/* Título e Seleção de Função */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Crie o seu Agente de IA
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Função do Agente *
              </label>
              <select
                value={config.agentFunction || config.agentType}
                onChange={(e) => {
                  const selectedFunc = agentFunctions.find(f => f.value === e.target.value);
                  if (selectedFunc) {
                    setConfig({ 
                      ...config, 
                      agentFunction: selectedFunc.value,
                      agentType: selectedFunc.mapToType 
                    });
                  }
                }}
                className="w-full px-4 py-3 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {agentFunctions.map((func) => (
                  <option key={func.value} value={func.value}>{func.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nome do Agente *
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="Ex: Assistente de Vendas, Bot de Suporte..."
                className="w-full px-4 py-3 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-dark-700">
            {[
              { id: 'prompt', label: 'Prompt Sistema', icon: Bot },
              { id: 'personality', label: 'Personalidade & Tom', icon: Mic },
              { id: 'training', label: 'Material de Treinamento', icon: BookOpen },
              { id: 'examples', label: 'Exemplos de Conversa', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Tab: Prompt Sistema */}
            {activeTab === 'prompt' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Nome do Agente
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Prompt do Sistema
                  </label>
                  <textarea
                    value={config.systemPrompt}
                    onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                    placeholder="Você é um..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Temperatura (Criatividade)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span>Preciso (0)</span>
                      <span className="font-bold text-blue-600">{config.temperature}</span>
                      <span>Criativo (1)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Max Tokens (Tamanho da Resposta)
                    </label>
                    <input
                      type="number"
                      value={config.maxTokens}
                      onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Personalidade & Tom */}
            {activeTab === 'personality' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Personalidade
                  </label>
                  <textarea
                    value={config.personality}
                    onChange={(e) => setConfig({ ...config, personality: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: Empático, consultivo, focado em entender necessidades..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Tom de Voz
                  </label>
                  <select
                    value={config.tone}
                    onChange={(e) => setConfig({ ...config, tone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {toneOptions.map((tone) => (
                      <option key={tone} value={tone}>{tone}</option>
                    ))}
                  </select>
                </div>

                {/* O QUE FAZER */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-500" />
                    O que o agente DEVE FAZER
                  </label>
                  <div className="space-y-2 mb-3">
                    {config.dosList?.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="flex-1 text-sm text-gray-900 dark:text-white">{item}</span>
                        <button
                          onClick={() => removeDo(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDo}
                      onChange={(e) => setNewDo(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addDo()}
                      placeholder="Ex: Fazer perguntas para entender a necessidade"
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={addDo}
                      className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {/* O QUE NÃO FAZER */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <XCircle size={18} className="text-red-500" />
                    O que o agente NÃO DEVE FAZER
                  </label>
                  <div className="space-y-2 mb-3">
                    {config.dontsList?.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <XCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0" />
                        <span className="flex-1 text-sm text-gray-900 dark:text-white">{item}</span>
                        <button
                          onClick={() => removeDont(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDont}
                      onChange={(e) => setNewDont(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addDont()}
                      placeholder="Ex: Ser insistente ou agressivo"
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={addDont}
                      className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Material de Treinamento */}
            {activeTab === 'training' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Base de Conhecimento (Texto)
                  </label>
                  <textarea
                    value={config.knowledgeBase || ''}
                    onChange={(e) => setConfig({ ...config, knowledgeBase: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                    placeholder="Cole aqui informações sobre seu produto, políticas, procedimentos..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    Upload de Arquivos PDF
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-xl p-8 text-center">
                    <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Arraste um arquivo PDF ou clique para selecionar
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors cursor-pointer ${
                        uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploading ? <RefreshCw size={20} className="animate-spin" /> : <Upload size={20} />}
                      {uploading ? 'Processando...' : 'Selecionar Arquivo'}
                    </label>
                  </div>
                </div>

                {/* Lista de arquivos enviados */}
                {config.trainingFiles && config.trainingFiles.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Arquivos Enviados</h4>
                    <div className="space-y-2">
                      {config.trainingFiles.map((file: any) => (
                        <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-xl">
                          <div className="flex items-center gap-3">
                            <FileText size={24} className="text-blue-500" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{file.originalName}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(file.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <button className="text-red-500 hover:text-red-700">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Exemplos */}
            {activeTab === 'examples' && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                        Exemplos de Conversas
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Adicione exemplos de conversas bem-sucedidas para o agente aprender o estilo de atendimento ideal.
                        Isso ajuda a IA a entender melhor como responder em situações similares.
                      </p>
                    </div>
                  </div>
                </div>

                <textarea
                  value={JSON.stringify(config.exampleConversations || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      setConfig({ ...config, exampleConversations: JSON.parse(e.target.value) });
                    } catch {}
                  }}
                  rows={15}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  placeholder='{\n  "exemplo1": {\n    "usuario": "Quanto custa?",\n    "agente": "O valor é R$ 497..."\n  }\n}'
                />
              </div>
            )}
          </div>
        </div>
        </div>
      )}
    </DashboardLayout>
  );
}
