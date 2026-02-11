'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { TrendingUp, DollarSign, MousePointer, Eye, Users, Plus, RefreshCw, Settings, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'ended';
  platform: string;
  spend: number;
  leads: number;
  sales: number;
  revenue: number;
  roas: number;
  cpl: number;
  ctr: number;
}

export default function TrafegoPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns');
      console.log('Response campaigns:', response.data);
      
      // Lidar com diferentes formatos de resposta
      let campaignsData = [];
      if (Array.isArray(response.data)) {
        campaignsData = response.data;
      } else if (response.data?.campaigns && Array.isArray(response.data.campaigns)) {
        campaignsData = response.data.campaigns;
      } else if (typeof response.data === 'object' && response.data !== null) {
        campaignsData = [response.data];
      }
      
      setCampaigns(campaignsData);
    } catch (error: any) {
      console.error('Erro ao carregar campanhas:', error?.response?.data || error?.message || error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
    // Definir período padrão (últimos 30 dias)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const totalSpend = Array.isArray(campaigns) ? campaigns.reduce((sum, c) => sum + c.spend, 0) : 0;
  const totalLeads = Array.isArray(campaigns) ? campaigns.reduce((sum, c) => sum + c.leads, 0) : 0;
  const totalSales = Array.isArray(campaigns) ? campaigns.reduce((sum, c) => sum + c.sales, 0) : 0;
  const totalRevenue = Array.isArray(campaigns) ? campaigns.reduce((sum, c) => sum + c.revenue, 0) : 0;
  const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tráfego Pago</h2>
            <p className="text-gray-600 dark:text-gray-400">Acompanhe suas campanhas e métricas em tempo real</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filtro de Data */}
            <div className="flex items-center gap-2 bg-white dark:bg-dark-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-700">
              <Calendar size={18} className="text-gray-600 dark:text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
              />
              <span className="text-gray-400">até</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <button
              onClick={loadCampaigns}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>
            <Link
              href="/dashboard/integracoes"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
            >
              <Plus size={20} />
              Conectar Facebook Ads
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={24} className="text-red-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Investimento</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              R$ {totalSpend.toLocaleString('pt-BR')}
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center justify-between mb-2">
              <Users size={24} className="text-blue-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Leads</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLeads}</p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={24} className="text-green-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Vendas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSales}</p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={24} className="text-green-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Receita</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={24} />
            </div>
            <p className="text-blue-100 text-sm mb-1">ROAS Médio</p>
            <p className="text-3xl font-bold">{avgRoas.toFixed(2)}x</p>
            <p className="text-xs text-blue-100 mt-1">Retorno sobre Investimento</p>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-dark-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Campanhas Ativas</h3>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw size={32} className="mx-auto mb-4 text-blue-500 animate-spin" />
                <p className="text-gray-600 dark:text-gray-400">Carregando campanhas...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="p-12 text-center">
                <MousePointer size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhuma campanha encontrada
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Conecte o Facebook Ads para começar a monitorar suas campanhas automaticamente
                </p>
                <Link
                  href="/dashboard/integracoes"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <Plus size={20} />
                  Conectar Facebook Ads
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Campanha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Investido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Leads</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CPL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vendas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Receita</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ROAS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CTR</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{campaign.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{campaign.platform}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          campaign.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : campaign.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {campaign.status === 'active' ? 'Ativa' : campaign.status === 'paused' ? 'Pausada' : 'Finalizada'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                        R$ {campaign.spend.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-semibold">
                        {campaign.leads}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        R$ {campaign.cpl.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400 font-semibold">
                        {campaign.sales}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400 font-semibold">
                        R$ {campaign.revenue.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                          campaign.roas >= 3 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : campaign.roas >= 2
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {campaign.roas.toFixed(2)}x
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {campaign.ctr.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                          <Settings size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
