'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { MessagesSquare, Send, Search, User, Circle, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const revalidate = 0;

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  user?: {
    name: string;
    avatar?: string;
    lastLoginAt?: string;
  };
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    user?: {
      name: string;
      avatar?: string;
    };
  };
}

interface Conversation {
  collaborator: Collaborator;
  lastMessage?: Message;
  unreadCount: number;
}

export default function ChatInternoPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedCollab, setSelectedCollab] = useState<Collaborator | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 10000); // Atualizar a cada 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedCollab) {
      loadMessages(selectedCollab.id);
      const interval = setInterval(() => loadMessages(selectedCollab.id), 5000); // Atualizar mensagens a cada 5s
      return () => clearInterval(interval);
    }
  }, [selectedCollab]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    }
  };

  const loadMessages = async (collaboratorId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/chat/messages/${collaboratorId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedCollab) return;

    try {
      const response = await api.post('/chat/messages', {
        receiverId: selectedCollab.id,
        message: newMessage.trim()
      });

      setMessages([...messages, response.data]);
      setNewMessage('');
      loadConversations(); // Atualizar lista de conversas
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.collaborator.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400';
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] flex gap-4">
        {/* Lista de Conversas */}
        <div className="w-80 bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-3 mb-4">
              <MessagesSquare size={24} className="text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chat Interno</h2>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar colaborador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessagesSquare size={48} className="text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  Nenhum colaborador encontrado
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Convide colaboradores em Configurações
                </p>
              </div>
            ) : (
              <div className="p-2">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.collaborator.id}
                    onClick={() => setSelectedCollab(conv.collaborator)}
                    className={`w-full p-3 rounded-xl mb-2 text-left transition-colors ${
                      selectedCollab?.id === conv.collaborator.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                        : 'hover:bg-gray-50 dark:hover:bg-dark-700 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        {conv.collaborator.user?.avatar ? (
                          <img
                            src={conv.collaborator.user.avatar}
                            alt={conv.collaborator.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                            <User size={24} className="text-white" />
                          </div>
                        )}
                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-dark-800 ${getStatusColor(conv.collaborator.status)}`}></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {conv.collaborator.name}
                          </h3>
                          {conv.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {conv.lastMessage?.message || 'Iniciar conversa'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Área de Chat */}
        {selectedCollab ? (
          <div className="flex-1 bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-dark-700">
              <div className="flex items-center gap-3">
                {selectedCollab.user?.avatar ? (
                  <img
                    src={selectedCollab.user.avatar}
                    alt={selectedCollab.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">{selectedCollab.name}</h3>
                  <div className="flex items-center gap-2">
                    <Circle size={8} className={`${getStatusColor(selectedCollab.status)} fill-current`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedCollab.status === 'ACTIVE' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => loadMessages(selectedCollab.id)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <RefreshCw size={18} className={`text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-900/50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessagesSquare size={48} className="text-gray-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Nenhuma mensagem ainda
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Envie a primeira mensagem para {selectedCollab.name}
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId !== selectedCollab.id;
                  
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isMine ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-2xl px-4 py-2 ${
                          isMine
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                            : 'bg-white dark:bg-dark-800 text-gray-900 dark:text-white border border-gray-200 dark:border-dark-700'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        </div>
                        <div className={`flex items-center gap-2 mt-1 px-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(msg.createdAt), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                          {isMine && msg.isRead && (
                            <span className="text-xs text-blue-600">✓✓</span>
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
                  disabled={!newMessage.trim()}
                  className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 flex items-center justify-center">
            <div className="text-center">
              <MessagesSquare size={64} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Escolha um colaborador para iniciar o chat
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
