'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, RefreshCw, ChevronDown, ChevronRight, DollarSign, Calendar, Package, X, FileText, Upload, Download, Edit2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Publicity {
  id: string;
  month: string;
  name: string;
  contentType: string;
  editor?: string;
  negotiationUSD: number;
  negotiationBRL: number;
  status: string;
  priority: string;
  paymentStatus: string;
  scriptDeliveryDate?: string;
  videoDeliveryDate?: string;
  publicationDate?: string;
  pdfFile?: string;
  script?: string;
  observation?: string;
}

interface MonthGroup {
  month: string;
  label: string;
  publicities: Publicity[];
  expanded: boolean;
}

const STATUS_OPTIONS = [
  { value: 'PENDENTE_BRIEF', label: 'Pendente Brief', color: 'bg-gray-500' },
  { value: 'CRIAR_ROTEIRO', label: 'Criar Roteiro', color: 'bg-blue-500' },
  { value: 'GRAVAR', label: 'Gravar', color: 'bg-purple-500' },
  { value: 'EDITAR', label: 'Editar', color: 'bg-yellow-500' },
  { value: 'ENVIAR_EDITOR', label: 'Enviar para Editor', color: 'bg-orange-500' },
  { value: 'APROVAR_EDICAO', label: 'Aprovar Edição', color: 'bg-teal-500' },
  { value: 'CORRIGIR_EDICAO', label: 'Corrigir Edição', color: 'bg-red-500' },
  { value: 'CONCLUIDO', label: 'Concluído', color: 'bg-green-500' },
  { value: 'CANCELADO', label: 'Cancelado', color: 'bg-gray-700' }
];

const PRIORITY_OPTIONS = [
  { value: 'BAIXA', label: 'Baixa', color: 'bg-blue-400' },
  { value: 'MEDIA', label: 'Média', color: 'bg-yellow-400' },
  { value: 'ALTA', label: 'Alta', color: 'bg-orange-500' },
  { value: 'URGENTE', label: 'Urgente !!!', color: 'bg-red-600' }
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'DEVIDO', label: 'Devido', color: 'bg-red-500' },
  { value: 'PAGO_METADE', label: 'Pago Metade', color: 'bg-orange-500' },
  { value: 'PAGO', label: 'Pago', color: 'bg-green-500' }
];

export default function PublicidadesPage() {
  const [months, setMonths] = useState<MonthGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPublicity, setEditingPublicity] = useState<Publicity | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    month: '',
    contentType: 'video',
    editor: '',
    negotiationUSD: '',
    negotiationBRL: '',
    status: 'PENDENTE_BRIEF',
    priority: 'MEDIA',
    paymentStatus: 'DEVIDO',
    scriptDeliveryDate: '',
    videoDeliveryDate: '',
    publicationDate: '',
    script: '',
    observation: ''
  });
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    loadPublicities();
  }, []);

  const loadPublicities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/publicities');
      
      // Agrupar por mês
      const grouped: { [key: string]: Publicity[] } = {};
      
      if (Array.isArray(response.data)) {
        response.data.forEach((pub: Publicity) => {
          if (!grouped[pub.month]) {
            grouped[pub.month] = [];
          }
          grouped[pub.month].push(pub);
        });
      }

      // Converter para array de MonthGroup
      const monthsArray = Object.keys(grouped).sort().reverse().map(month => {
        const [year, monthNum] = month.split('-');
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const label = `${monthNames[parseInt(monthNum) - 1]} ${year}`;
        
        return {
          month,
          label,
          publicities: grouped[month],
          expanded: month === Object.keys(grouped).sort().reverse()[0]
        };
      });

      setMonths(monthsArray);
    } catch (error) {
      console.error('Erro ao carregar publicidades:', error);
      setMonths([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (editingPublicity) {
        // Atualizar
        await api.put(`/publicities/${editingPublicity.id}`, {
          ...formData,
          negotiationUSD: parseFloat(formData.negotiationUSD) || 0,
          negotiationBRL: parseFloat(formData.negotiationBRL) || 0
        });
      } else {
        // Criar
        await api.post('/publicities', {
          ...formData,
          negotiationUSD: parseFloat(formData.negotiationUSD) || 0,
          negotiationBRL: parseFloat(formData.negotiationBRL) || 0
        });
      }
      
      setShowModal(false);
      setEditingPublicity(null);
      resetForm();
      await loadPublicities();
    } catch (error: any) {
      console.error('Erro ao salvar publicidade:', error);
      alert(error.response?.data?.error || 'Erro ao salvar publicidade. Verifique se o backend está rodando.');
    }
  };

  const handleEdit = (pub: Publicity) => {
    setEditingPublicity(pub);
    setFormData({
      name: pub.name,
      month: pub.month,
      contentType: pub.contentType,
      editor: pub.editor || '',
      negotiationUSD: pub.negotiationUSD.toString(),
      negotiationBRL: pub.negotiationBRL.toString(),
      status: pub.status,
      priority: pub.priority,
      paymentStatus: pub.paymentStatus,
      scriptDeliveryDate: pub.scriptDeliveryDate ? pub.scriptDeliveryDate.substring(0, 10) : '',
      videoDeliveryDate: pub.videoDeliveryDate ? pub.videoDeliveryDate.substring(0, 10) : '',
      publicationDate: pub.publicationDate ? pub.publicationDate.substring(0, 10) : '',
      script: pub.script || '',
      observation: pub.observation || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta publicidade?')) return;

    try {
      await api.delete(`/publicities/${id}`);
      await loadPublicities();
    } catch (error) {
      console.error('Erro ao excluir publicidade:', error);
      alert('Erro ao excluir publicidade');
    }
  };

  const handleFileUpload = async (publicityId: string, file: File) => {
    try {
      setUploadingFile(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      await api.post(`/publicities/${publicityId}/upload`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await loadPublicities();
      alert('Arquivo enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload do arquivo');
    } finally {
      setUploadingFile(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      month: '',
      contentType: 'video',
      editor: '',
      negotiationUSD: '',
      negotiationBRL: '',
      status: 'PENDENTE_BRIEF',
      priority: 'MEDIA',
      paymentStatus: 'DEVIDO',
      scriptDeliveryDate: '',
      videoDeliveryDate: '',
      publicationDate: '',
      script: '',
      observation: ''
    });
  };

  const toggleMonth = (month: string) => {
    setMonths(months.map(m => 
      m.month === month ? { ...m, expanded: !m.expanded } : m
    ));
  };

  const getStatusColor = (status: string) => {
    const found = STATUS_OPTIONS.find(s => s.value === status);
    return found ? found.color : 'bg-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    const found = PRIORITY_OPTIONS.find(p => p.value === priority);
    return found ? found.color : 'bg-gray-400';
  };

  const getPaymentColor = (paymentStatus: string) => {
    const found = PAYMENT_STATUS_OPTIONS.find(p => p.value === paymentStatus);
    return found ? found.color : 'bg-gray-500';
  };

  const totalUSD = months.reduce((sum, m) => 
    sum + m.publicities.reduce((s, p) => s + Number(p.negotiationUSD), 0), 0
  );
  const totalBRL = months.reduce((sum, m) => 
    sum + m.publicities.reduce((s, p) => s + Number(p.negotiationBRL), 0), 0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Publicidades</h2>
            <p className="text-gray-600 dark:text-gray-400">Acompanhe e gerencie todas as suas publicidades e conteúdos</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadPublicities}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>
            <button
              onClick={() => {
                setEditingPublicity(null);
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus size={16} />
              Nova Publicidade
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Package size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Publicidades</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {months.reduce((sum, m) => sum + m.publicities.length, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <DollarSign size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Negociado (USD)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalUSD.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <DollarSign size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Negociado (BRL)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {totalBRL.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Months List */}
        {loading ? (
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-dark-700">
            <RefreshCw size={32} className="mx-auto mb-4 text-blue-500 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Carregando publicidades...</p>
          </div>
        ) : months.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-dark-700">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhuma publicidade cadastrada</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Comece criando sua primeira publicidade</p>
            <button
              onClick={() => {
                setEditingPublicity(null);
                resetForm();
                setShowModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all flex items-center gap-2 mx-auto shadow-lg"
            >
              <Plus size={20} />
              Criar Primeira Publicidade
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {months.map((monthGroup) => (
              <div key={monthGroup.month} className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
                <button
                  onClick={() => toggleMonth(monthGroup.month)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {monthGroup.expanded ? (
                      <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{monthGroup.label}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{monthGroup.publicities.length} publicidade(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total USD</p>
                      <p className="text-lg font-bold text-green-600">
                        ${monthGroup.publicities.reduce((sum, p) => sum + Number(p.negotiationUSD), 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total BRL</p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {monthGroup.publicities.reduce((sum, p) => sum + Number(p.negotiationBRL), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </button>

                {monthGroup.expanded && (
                  <div className="border-t border-gray-200 dark:border-dark-700 p-6 space-y-4">
                    {monthGroup.publicities.map((pub) => (
                      <div key={pub.id} className="bg-gray-50 dark:bg-dark-700 rounded-xl p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{pub.name}</h4>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className={`px-3 py-1 rounded-lg text-white text-xs font-semibold ${getStatusColor(pub.status)}`}>
                                {STATUS_OPTIONS.find(s => s.value === pub.status)?.label || pub.status}
                              </span>
                              <span className={`px-3 py-1 rounded-lg text-white text-xs font-semibold ${getPriorityColor(pub.priority)}`}>
                                {PRIORITY_OPTIONS.find(p => p.value === pub.priority)?.label || pub.priority}
                              </span>
                              <span className={`px-3 py-1 rounded-lg text-white text-xs font-semibold ${getPaymentColor(pub.paymentStatus)}`}>
                                {PAYMENT_STATUS_OPTIONS.find(p => p.value === pub.paymentStatus)?.label || pub.paymentStatus}
                              </span>
                              <span className="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold">
                                {pub.contentType}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              {pub.editor && (
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">Editor</p>
                                  <p className="font-semibold text-gray-900 dark:text-white">{pub.editor}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Negociação (USD)</p>
                                <p className="font-semibold text-gray-900 dark:text-white">${Number(pub.negotiationUSD).toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Negociação (BRL)</p>
                                <p className="font-semibold text-gray-900 dark:text-white">R$ {Number(pub.negotiationBRL).toFixed(2)}</p>
                              </div>
                              {pub.scriptDeliveryDate && (
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">Entrega Roteiro</p>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {new Date(pub.scriptDeliveryDate).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              )}
                              {pub.videoDeliveryDate && (
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">Entrega Vídeo</p>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {new Date(pub.videoDeliveryDate).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              )}
                              {pub.publicationDate && (
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">Data Publicação</p>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {new Date(pub.publicationDate).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              )}
                            </div>

                            {pub.observation && (
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-600">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Observações:</p>
                                <p className="text-sm text-gray-900 dark:text-white mt-1">{pub.observation}</p>
                              </div>
                            )}

                            {pub.script && (
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-600">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Roteiro:</p>
                                <p className="text-sm text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">{pub.script}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleEdit(pub)}
                              className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(pub.id)}
                              className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                            {pub.pdfFile ? (
                              <a
                                href={pub.pdfFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                title="Ver PDF"
                              >
                                <Download size={16} />
                              </a>
                            ) : (
                              <label className="p-2 bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors cursor-pointer" title="Upload PDF">
                                <Upload size={16} />
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(pub.id, file);
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingPublicity ? 'Editar Publicidade' : 'Nova Publicidade'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingPublicity(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Grid de campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome da Publicidade *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      placeholder="Ex: Campanha Black Friday"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mês (YYYY-MM) *
                    </label>
                    <input
                      type="month"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Conteúdo
                    </label>
                    <select
                      value={formData.contentType}
                      onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    >
                      <option value="video">Vídeo</option>
                      <option value="carrossel">Carrossel</option>
                      <option value="imagem">Imagem</option>
                      <option value="reels">Reels</option>
                      <option value="stories">Stories</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Editor
                    </label>
                    <input
                      type="text"
                      value={formData.editor}
                      onChange={(e) => setFormData({ ...formData, editor: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      placeholder="Nome do editor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Urgência
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    >
                      {PRIORITY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status de Pagamento
                    </label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    >
                      {PAYMENT_STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Negociação (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.negotiationUSD}
                      onChange={(e) => setFormData({ ...formData, negotiationUSD: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Negociação (BRL)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.negotiationBRL}
                      onChange={(e) => setFormData({ ...formData, negotiationBRL: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data de Entrega do Roteiro
                    </label>
                    <input
                      type="date"
                      value={formData.scriptDeliveryDate}
                      onChange={(e) => setFormData({ ...formData, scriptDeliveryDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data de Entrega do Vídeo
                    </label>
                    <input
                      type="date"
                      value={formData.videoDeliveryDate}
                      onChange={(e) => setFormData({ ...formData, videoDeliveryDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data de Publicação
                    </label>
                    <input
                      type="date"
                      value={formData.publicationDate}
                      onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Roteiro e Observações (full width) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Roteiro
                  </label>
                  <textarea
                    value={formData.script}
                    onChange={(e) => setFormData({ ...formData, script: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    placeholder="Digite o roteiro completo aqui..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={formData.observation}
                    onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-dark-700 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingPublicity(null);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateOrUpdate}
                  disabled={!formData.name || !formData.month}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingPublicity ? 'Atualizar' : 'Criar'} Publicidade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
