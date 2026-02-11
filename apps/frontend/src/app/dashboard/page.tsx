'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Eye,
  MousePointer,
  Calendar,
  TrendingUpIcon
} from 'lucide-react';
import { api } from '@/lib/api';


export const revalidate = 0;

interface Metrics {
  investimento: number;
  faturamento: number;
  lucro: number;
  roi: number;
  roas: number;
  vendas: number;
  ticketMedio: number;
}

interface Creative {
  id: string;
  nome: string;
  campanha: string;
  investido: number;
  vendas: number;
  faturamento: number;
  roi: number;
  roas: number;
  impressoes: number;
  cliques: number;
  ctr: number;
  cpc: number;
  status: 'excelente' | 'bom' | 'ruim' | 'pessimo';
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [metrics, setMetrics] = useState<Metrics>({
    investimento: 0,
    faturamento: 0,
    lucro: 0,
    roi: 0,
    roas: 0,
    vendas: 0,
    ticketMedio: 0
  });

  const [criativos, setCriativos] = useState<Creative[]>([]);

  useEffect(() => {
    loadDashboard();
    // Definir período padrão (últimos 30 dias)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [metricsRes, creativesRes] = await Promise.all([
        api.get('/dashboard/metrics', { params: { startDate, endDate } }).catch(() => null),
        api.get('/dashboard/creatives', { params: { startDate, endDate } }).catch(() => null)
      ]);
      if (metricsRes?.data) setMetrics(metricsRes.data);
      if (creativesRes?.data) setCriativos(creativesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excelente': return { text: 'Excelente', bg: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-400' };
      case 'bom': return { text: 'Bom', bg: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-700 dark:text-blue-400' };
      case 'ruim': return { text: 'Ruim', bg: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-700 dark:text-yellow-400' };
      case 'pessimo': return { text: 'Péssimo', bg: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-400' };
      default: return { text: 'N/A', bg: 'bg-gray-100 dark:bg-gray-900/30', textColor: 'text-gray-700 dark:text-gray-400' };
    }
  };

  const melhoresCreativos = [...criativos].sort((a, b) => b.roi - a.roi).slice(0, 10);
  const pioresCreativos = [...criativos].sort((a, b) => a.roi - b.roi).slice(0, 10);
  const maisCaros = [...criativos].sort((a, b) => b.cpc - a.cpc).slice(0, 10);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header com Filtro de Data */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard de Performance</h2>
            <p className="text-gray-600 dark:text-gray-400">Análise de ROI: Tráfego Pago vs Vendas</p>
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
              onClick={loadDashboard}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Investimento */}
          <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl">
                <TrendingDown size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Investimento Total</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              R$ {metrics.investimento.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Período selecionado</p>
          </div>

          {/* Faturamento */}
          <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <DollarSign size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Faturamento</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              R$ {metrics.faturamento.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
              <ArrowUpRight size={14} />
              +{metrics.vendas} vendas
            </p>
          </div>

          {/* Lucro */}
          <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <TrendingUp size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Lucro Líquido</h3>
            <p className="text-3xl font-bold text-green-600">
              R$ {metrics.lucro.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Faturamento - Investimento</p>
          </div>

          {/* ROI */}
          <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Target size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">ROI</h3>
            <p className="text-3xl font-bold text-purple-600">
              {metrics.roi}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">ROAS: {metrics.roas.toFixed(2)}x</p>
          </div>
        </div>

        {criativos.length === 0 ? (
          <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl p-12 border border-gray-200 dark:border-dark-700 text-center">
            <Target size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum dado de performance ainda</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Conecte suas contas de Facebook Ads ou Google Ads na aba de Integracoes para ver os dados de performance dos seus criativos aqui.
            </p>
          </div>
        ) : (
        <>
        {/* Melhores Criativos - LISTA */}
        <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp size={24} className="text-green-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top 10 Melhores Criativos (Maior ROI)</h3>
          </div>
          
          <div className="space-y-2">
            {melhoresCreativos.map((criativo, index) => {
              const badge = getStatusBadge(criativo.status);
              return (
                <div key={criativo.id} className="flex items-center gap-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg border border-green-200 dark:border-green-800/30 hover:shadow-md transition-all">
                  {/* Ranking */}
                  <div className="flex items-center gap-3 min-w-[80px]">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.textColor}`}>
                      {badge.text}
                    </span>
                  </div>

                  {/* Nome e Campanha */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{criativo.nome}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{criativo.campanha}</p>
                  </div>

                  {/* Métricas */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400">ROI</p>
                      <p className="text-sm font-bold text-green-600">{criativo.roi}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400">ROAS</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{criativo.roas.toFixed(2)}x</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Investido</p>
                      <p className="text-sm font-semibold text-red-600">R$ {criativo.investido.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Faturamento</p>
                      <p className="text-sm font-semibold text-blue-600">R$ {criativo.faturamento.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-right min-w-[60px]">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Vendas</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{criativo.vendas}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Piores Criativos - LISTA */}
        <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsDown size={24} className="text-red-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top 10 Piores Criativos (Menor ROI)</h3>
          </div>
          
          <div className="space-y-2">
            {pioresCreativos.map((criativo, index) => {
              const badge = getStatusBadge(criativo.status);
              return (
                <div key={criativo.id} className="flex items-center gap-4 p-3 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10 rounded-lg border border-red-200 dark:border-red-800/30 hover:shadow-md transition-all">
                  {/* Ranking */}
                  <div className="flex items-center gap-3 min-w-[80px]">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.textColor}`}>
                      {badge.text}
                    </span>
                  </div>

                  {/* Nome e Campanha */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{criativo.nome}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{criativo.campanha}</p>
                  </div>

                  {/* Métricas */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400">ROI</p>
                      <p className="text-sm font-bold text-red-600">{criativo.roi}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400">ROAS</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{criativo.roas.toFixed(2)}x</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400">CPC</p>
                      <p className="text-sm font-semibold text-orange-600">R$ {criativo.cpc.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400">CTR</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{criativo.ctr.toFixed(1)}%</p>
                    </div>
                    <div className="text-right min-w-[60px]">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Vendas</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{criativo.vendas}</p>
                    </div>
                  </div>

                  {/* Alerta */}
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-lg">
                    <AlertTriangle size={14} />
                    <span>Pausar</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Criativos Mais Caros - LISTA */}
        <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={24} className="text-orange-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top 10 Criativos Mais Caros (Maior CPC)</h3>
          </div>
          
          <div className="space-y-2">
            {maisCaros.map((criativo, index) => (
              <div key={criativo.id} className="flex items-center gap-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-lg border border-orange-200 dark:border-orange-800/30 hover:shadow-md transition-all">
                {/* Ranking */}
                <div className="flex items-center gap-3 min-w-[80px]">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-600 dark:text-gray-400">CPC</p>
                    <p className="text-sm font-bold text-orange-600">R$ {criativo.cpc.toFixed(2)}</p>
                  </div>
                </div>

                {/* Nome e Campanha */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{criativo.nome}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{criativo.campanha}</p>
                </div>

                {/* Métricas */}
                <div className="flex items-center gap-6">
                  <div className="text-right flex items-center gap-2">
                    <Eye size={14} className="text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Impressões</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{criativo.impressoes.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <MousePointer size={14} className="text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Cliques</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{criativo.cliques.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 dark:text-gray-400">CTR</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{criativo.ctr}%</p>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Investido</p>
                    <p className="text-sm font-bold text-red-600">R$ {criativo.investido.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela Completa */}
        <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Todos os Criativos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Campanha</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Investido</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Faturamento</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Vendas</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">ROI</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">ROAS</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">CPC</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {criativos.map((criativo) => {
                  const badge = getStatusBadge(criativo.status);
                  return (
                    <tr key={criativo.id} className="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900 dark:text-white">{criativo.nome}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{criativo.campanha}</td>
                      <td className="py-3 px-4 text-right font-semibold text-red-600">R$ {criativo.investido.toLocaleString('pt-BR')}</td>
                      <td className="py-3 px-4 text-right font-semibold text-blue-600">R$ {criativo.faturamento.toLocaleString('pt-BR')}</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">{criativo.vendas}</td>
                      <td className="py-3 px-4 text-right font-bold text-green-600">{criativo.roi}%</td>
                      <td className="py-3 px-4 text-right font-semibold text-purple-600">{criativo.roas.toFixed(2)}x</td>
                      <td className="py-3 px-4 text-right font-semibold text-orange-600">R$ {criativo.cpc.toFixed(2)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-3 py-1 rounded-full ${badge.bg} ${badge.textColor} font-semibold`}>
                          {badge.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </div>
    </DashboardLayout>
  );
}
