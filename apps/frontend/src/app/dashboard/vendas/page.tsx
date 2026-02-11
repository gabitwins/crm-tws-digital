'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { DollarSign, TrendingUp, ShoppingCart, CreditCard, ArrowUpRight, ArrowDownRight, RefreshCw, Filter, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface Sale {
  id: string;
  customer: string;
  product: string;
  value: number;
  platform: string;
  date: string;
  status: 'approved' | 'pending' | 'refunded';
}

export default function VendasPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales');
      setSales(response.data);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
    // Definir período padrão (últimos 30 dias)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const filteredSales = !Array.isArray(sales) ? [] : (filter === 'all' 
    ? sales 
    : sales.filter(s => s.status === filter));

  const totalSales = Array.isArray(sales) ? sales.reduce((sum, s) => sum + (s.status === 'approved' ? s.value : 0), 0) : 0;
  const totalCount = Array.isArray(sales) ? sales.filter(s => s.status === 'approved').length : 0;
  const avgTicket = totalCount > 0 ? totalSales / totalCount : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vendas & Financeiro</h2>
            <p className="text-gray-600 dark:text-gray-400">Acompanhe todas as vendas e métricas financeiras</p>
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
              onClick={loadSales}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={24} className="text-green-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Receita Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              R$ {totalSales.toLocaleString('pt-BR')}
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart size={24} className="text-blue-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Vendas Aprovadas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center justify-between mb-2">
              <CreditCard size={24} className="text-purple-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Ticket Médio</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              R$ {avgTicket > 0 ? avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={24} className="text-accent-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total de Vendas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{sales.length}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Vendas Recentes</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                Todas ({Array.isArray(sales) ? sales.length : 0})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'approved' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                Aprovadas ({Array.isArray(sales) ? sales.filter(s => s.status === 'approved').length : 0})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'pending' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                Pendentes ({Array.isArray(sales) ? sales.filter(s => s.status === 'pending').length : 0})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw size={32} className="mx-auto mb-4 text-blue-500 animate-spin" />
                <p className="text-gray-600 dark:text-gray-400">Carregando vendas...</p>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingCart size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {filter === 'all' ? 'Nenhuma venda encontrada' : `Nenhuma venda ${filter === 'approved' ? 'aprovada' : 'pendente'}`}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Conecte Hotmart ou Kiwify para começar a receber vendas automaticamente
                </p>
                <Link
                  href="/dashboard/integracoes"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Conectar Integrações
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Plataforma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{sale.customer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{sale.product}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          sale.platform === 'Hotmart' 
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {sale.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                          R$ {sale.value.toLocaleString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(sale.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          sale.status === 'approved' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : sale.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {sale.status === 'approved' ? 'Aprovado' : sale.status === 'pending' ? 'Pendente' : 'Reembolsado'}
                        </span>
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
