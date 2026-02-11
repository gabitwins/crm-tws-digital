'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Mail, UserPlus, Trash2, Power, PowerOff, Copy, Clock, RefreshCw, X, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Collaborator {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  inviteToken?: string;
  inviteExpiry?: string;
  joinedAt?: string;
  createdAt: string;
  user?: {
    name: string;
    isActive: boolean;
    lastLoginAt?: string;
  };
}

export function CollaboratorsSection() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('AGENT');
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    loadCollaborators();
  }, []);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const response = await api.get('/collaborators');
      setCollaborators(response.data);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail || !inviteName) return;

    try {
      setLoading(true);
      const response = await api.post('/collaborators/invite', {
        email: inviteEmail,
        name: inviteName,
        role: inviteRole
      });

      setInviteLink(response.data.inviteLink);
      loadCollaborators();
      
      // Resetar form após 10 segundos mostrando o link
      setTimeout(() => {
        setInviteEmail('');
        setInviteName('');
        setInviteRole('AGENT');
        setInviteLink('');
      }, 10000);
    } catch (error: any) {
      console.error('Erro detalhado:', error.response?.data);
      alert(error.response?.data?.error || 'Erro ao enviar convite. Verifique se o e-mail já está cadastrado.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.patch(`/collaborators/${id}/status`, { status: newStatus });
      loadCollaborators();
    } catch (error) {
      alert('Erro ao alterar status do colaborador');
    }
  };

  const deleteCollaborator = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja remover ${name}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await api.delete(`/collaborators/${id}`);
      loadCollaborators();
    } catch (error) {
      alert('Erro ao remover colaborador');
    }
  };

  const copyInviteLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('Link copiado para a área de transferência!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'INACTIVE':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
    }
  };

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      ADMIN: 'Administrador',
      MANAGER: 'Gerente',
      AGENT: 'Atendente',
      VIEWER: 'Visualizador'
    };
    return roles[role] || role;
  };

  return (
    <div className="space-y-6">
      {/* Header com botão de convidar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Equipe e Colaboradores</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie os membros da sua equipe</p>
        </div>
        <button
          onClick={() => setShowInviteModal(!showInviteModal)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <UserPlus size={18} />
          Convidar Colaborador
        </button>
      </div>

      {/* Formulário de Convite */}
      {showInviteModal && (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Convidar Novo Colaborador</h4>
            <button
              onClick={() => setShowInviteModal(false)}
              className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {inviteLink ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-700 dark:text-green-400 font-semibold mb-2">✓ Convite enviado com sucesso!</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">Compartilhe este link com o colaborador:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() => copyInviteLink(inviteLink)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Copy size={16} />
                    Copiar
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">* O link expira em 7 dias</p>
              </div>
            </div>
          ) : (
            <form onSubmit={sendInvite} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="joao@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Função
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AGENT">Atendente</option>
                  <option value="MANAGER">Gerente</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="VIEWER">Visualizador</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw size={18} className="animate-spin" /> : <Mail size={18} />}
                {loading ? 'Enviando...' : 'Enviar Convite'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Lista de Colaboradores */}
      <div className="space-y-3">
        {loading && collaborators.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={32} className="animate-spin text-blue-500" />
          </div>
        ) : collaborators.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Nenhum colaborador cadastrado</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Clique em "Convidar Colaborador" para adicionar</p>
          </div>
        ) : (
          collaborators.map((collab) => (
            <div key={collab.id} className="p-4 bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-gray-900 dark:text-white">{collab.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(collab.status)}`}>
                      {collab.status === 'ACTIVE' ? 'Ativo' : collab.status === 'PENDING' ? 'Pendente' : 'Inativo'}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                      {getRoleName(collab.role)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Mail size={14} />
                      {collab.email}
                    </span>
                    
                    {collab.joinedAt && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Entrou {formatDistanceToNow(new Date(collab.joinedAt), { addSuffix: true, locale: ptBR })}
                      </span>
                    )}
                  </div>

                  {collab.status === 'PENDING' && collab.inviteToken && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => copyInviteLink(`${window.location.origin}/convite/${collab.inviteToken}`)}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Copy size={12} />
                        Copiar link de convite
                      </button>
                      <span className="text-xs text-gray-500">
                        (expira {collab.inviteExpiry ? formatDistanceToNow(new Date(collab.inviteExpiry), { addSuffix: true, locale: ptBR }) : 'em 7 dias'})
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {collab.status !== 'PENDING' && (
                    <button
                      onClick={() => toggleStatus(collab.id, collab.status)}
                      className={`p-2 rounded-lg transition-colors ${
                        collab.status === 'ACTIVE'
                          ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600'
                          : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600'
                      }`}
                      title={collab.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                    >
                      {collab.status === 'ACTIVE' ? <PowerOff size={18} /> : <Power size={18} />}
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteCollaborator(collab.id, collab.name)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
