'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, RefreshCw, DollarSign, Calendar, Package, X, FileText, Upload, Download, Edit2, Trash2, List, LayoutGrid, CalendarDays } from 'lucide-react';
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

type ViewMode = 'list' | 'kanban' | 'calendar';

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
  { value: 'URGENTE', label: 'Urgente', color: 'bg-red-600' }
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'DEVIDO', label: 'Devido', color: 'bg-red-500' },
  { value: 'PAGO_METADE', label: 'Pago Metade', color: 'bg-orange-500' },
  { value: 'PAGO', label: 'Pago', color: 'bg-green-500' }
];

export default function PublicidadesPage() {
  const [publicities, setPublicities] = useState<Publicity[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
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

  useEffect(() => {
    loadPublicities();
  }, []);

  const loadPublicities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/publicities');
      setPublicities(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar publicidades:', error);
      setPublicities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (editingPublicity) {
        await api.put(`/publicities/${editingPublicity.id}`, {
          ...formData,
          negotiationUSD: parseFloat(formData.negotiationUSD) || 0,
          negotiationBRL: parseFloat(formData.negotiationBRL) || 0
        });
      } else {
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
      alert(error.response?.data?.error || 'Erro ao salvar publicidade.');
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
    if (!confirm('Deseja realmente excluir?')) return;

    try {
      await api.delete(`/publicities/${id}`);
      await loadPublicities();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir');
    }
  };

  const handleFileUpload = async (publicityId: string, file: File) => {
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      await api.post(`/publicities/${publicityId}/upload`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await loadPublicities();
      alert('Arquivo enviado!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload');
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

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority)?.color || 'bg-gray-400';
  };

  const getPaymentColor = (paymentStatus: string) => {
    return PAYMENT_STATUS_OPTIONS.find(p => p.value === paymentStatus)?.color || 'bg-gray-500';
  };

  const totalUSD = publicities.reduce((sum, p) => sum + Number(p.negotiationUSD), 0);
  const totalBRL = publicities.reduce((sum, p) => sum + Number(p.negotiationBRL), 0);

  const renderListView = () => (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-dark-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Nome</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Prioridade</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Pagamento</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Editor</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">USD</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">BRL</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Publicação</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
          {publicities.map((pub) => (
            <tr key={pub.id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{pub.name}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${getStatusColor(pub.status)}`}>
                  {STATUS_OPTIONS.find(s => s.value === pub.status)?.label || pub.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${getPriorityColor(pub.priority)}`}>
                  {PRIORITY_OPTIONS.find(p => p.value === pub.priority)?.label || pub.priority}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${getPaymentColor(pub.paymentStatus)}`}>
                  {PAYMENT_STATUS_OPTIONS.find(p => p.value === pub.paymentStatus)?.label || pub.paymentStatus}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{pub.editor || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">${Number(pub.negotiationUSD).toFixed(2)}</td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">R$ {Number(pub.negotiationBRL).toFixed(2)}</td>
              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                {pub.publicationDate ? new Date(pub.publicationDate).toLocaleDateString('pt-BR') : '-'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => handleEdit(pub)} className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50" title="Editar">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(pub.id)} className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded hover:bg-red-200 dark:hover:bg-red-900/50" title="Excluir">
                    <Trash2 size={14} />
                  </button>
                  {pub.pdfFile ? (
                    <a href={pub.pdfFile} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded hover:bg-green-200 dark:hover:bg-green-900/50" title="Ver PDF">
                      <Download size={14} />
                    </a>
                  ) : (
                    <label className="p-1.5 bg-gray-100 dark:bg-dark-600 text-gray-600 rounded hover:bg-gray-200 cursor-pointer" title="Upload PDF">
                      <Upload size={14} />
                      <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(pub.id, file);
                      }} />
                    </label>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderKanbanView = () => {
    const columns = STATUS_OPTIONS.map(status => ({
      ...status,
      publicities: publicities.filter(p => p.status === status.value)
    }));

    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.value} className="flex-shrink-0 w-80 bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">{column.label}</h3>
              <span className="px-2 py-1 rounded-full bg-gray-200 dark:bg-dark-700 text-xs font-semibold text-gray-700 dark:text-gray-300">
                {column.publicities.length}
              </span>
            </div>
            <div className="space-y-3">
              {column.publicities.map((pub) => (
                <div key={pub.id} className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3 space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{pub.name}</h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded text-white ${getPriorityColor(pub.priority)}`}>
                      {PRIORITY_OPTIONS.find(p => p.value === pub.priority)?.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-white ${getPaymentColor(pub.paymentStatus)}`}>
                      {PAYMENT_STATUS_OPTIONS.find(p => p.value === pub.paymentStatus)?.label}
                    </span>
                  </div>
                  {pub.editor && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">Editor: {pub.editor}</p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-dark-600">
                    <div className="text-xs text-gray-900 dark:text-white font-semibold">
                      ${pub.negotiationUSD} / R$ {pub.negotiationBRL}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(pub)} className="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded" title="Editar">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDelete(pub.id)} className="p-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded" title="Excluir">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCalendarView = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    const getPublicitiesForDate = (day: number) => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return publicities.filter(p => 
        p.publicationDate?.startsWith(dateStr) ||
        p.scriptDeliveryDate?.startsWith(dateStr) ||
        p.videoDeliveryDate?.startsWith(dateStr)
      );
    };

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    return (
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{monthNames[currentMonth]} {currentYear}</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            const pubs = day ? getPublicitiesForDate(day) : [];
            return (
              <div key={index} className={`min-h-24 border border-gray-200 dark:border-dark-700 rounded-lg p-2 ${day ? 'bg-gray-50 dark:bg-dark-700' : 'bg-transparent'}`}>
                {day && (
                  <>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white mb-1">{day}</div>
                    <div className="space-y-1">
                      {pubs.map((pub) => (
                        <div key={pub.id} className={`text-xs px-1.5 py-0.5 rounded text-white ${getStatusColor(pub.status)} truncate cursor-pointer`} title={pub.name} onClick={() => handleEdit(pub)}>
                          {pub.name}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Publicidades</h2>
            <p className="text-gray-600 dark:text-gray-400">Gerencie suas publicidades e conteúdos</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadPublicities} disabled={loading} className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 flex items-center gap-2">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>
            <button onClick={() => { setEditingPublicity(null); resetForm(); setShowModal(true); }} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg flex items-center gap-2 shadow-lg">
              <Plus size={16} />
              Nova Publicidade
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Package size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{publicities.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <DollarSign size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total (USD)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalUSD.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <DollarSign size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total (BRL)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {totalBRL.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-dark-800 rounded-lg p-1 border border-gray-200 dark:border-dark-700 w-fit">
          <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'}`}>
            <List size={16} />
            Lista
          </button>
          <button onClick={() => setViewMode('kanban')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'}`}>
            <LayoutGrid size={16} />
            Kanban
          </button>
          <button onClick={() => setViewMode('calendar')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'}`}>
            <CalendarDays size={16} />
            Calendário
          </button>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-dark-700">
            <RefreshCw size={32} className="mx-auto mb-4 text-blue-500 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        ) : publicities.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-dark-700">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhuma publicidade cadastrada</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Comece criando sua primeira publicidade</p>
            <button onClick={() => { setEditingPublicity(null); resetForm(); setShowModal(true); }} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg flex items-center gap-2 mx-auto shadow-lg">
              <Plus size={20} />
              Criar Primeira Publicidade
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'list' && renderListView()}
            {viewMode === 'kanban' && renderKanbanView()}
            {viewMode === 'calendar' && renderCalendarView()}
          </>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingPublicity ? 'Editar Publicidade' : 'Nova Publicidade'}
                </h3>
                <button onClick={() => { setShowModal(false); setEditingPublicity(null); resetForm(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" placeholder="Nome da publicidade" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mês (YYYY-MM) *</label>
                    <input type="month" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo</label>
                    <select value={formData.contentType} onChange={(e) => setFormData({ ...formData, contentType: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white">
                      <option value="video">Vídeo</option>
                      <option value="carrossel">Carrossel</option>
                      <option value="imagem">Imagem</option>
                      <option value="reels">Reels</option>
                      <option value="stories">Stories</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Editor</label>
                    <input type="text" value={formData.editor} onChange={(e) => setFormData({ ...formData, editor: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" placeholder="Nome do editor" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white">
                      {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Urgência</label>
                    <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white">
                      {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pagamento</label>
                    <select value={formData.paymentStatus} onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white">
                      {PAYMENT_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">USD</label>
                    <input type="number" step="0.01" value={formData.negotiationUSD} onChange={(e) => setFormData({ ...formData, negotiationUSD: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" placeholder="0.00" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">BRL</label>
                    <input type="number" step="0.01" value={formData.negotiationBRL} onChange={(e) => setFormData({ ...formData, negotiationBRL: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" placeholder="0.00" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entrega Roteiro</label>
                    <input type="date" value={formData.scriptDeliveryDate} onChange={(e) => setFormData({ ...formData, scriptDeliveryDate: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entrega Vídeo</label>
                    <input type="date" value={formData.videoDeliveryDate} onChange={(e) => setFormData({ ...formData, videoDeliveryDate: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Publicação</label>
                    <input type="date" value={formData.publicationDate} onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Roteiro</label>
                  <textarea value={formData.script} onChange={(e) => setFormData({ ...formData, script: e.target.value })} rows={6} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" placeholder="Roteiro completo..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Observações</label>
                  <textarea value={formData.observation} onChange={(e) => setFormData({ ...formData, observation: e.target.value })} rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white" placeholder="Observações..." />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-dark-700 flex justify-end gap-3">
                <button onClick={() => { setShowModal(false); setEditingPublicity(null); resetForm(); }} className="px-6 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600">
                  Cancelar
                </button>
                <button onClick={handleCreateOrUpdate} disabled={!formData.name || !formData.month} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg disabled:opacity-50">
                  {editingPublicity ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
