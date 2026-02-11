'use client';
export const dynamic = 'force-dynamic';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart3, Download, Calendar } from 'lucide-react';

export default function RelatoriosPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios & Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">Análises detalhadas e exportação de dados</p>
          </div>
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl flex items-center gap-2">
            <Download size={20} />
            Exportar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Relatório de Leads', description: 'Análise completa de todos os leads' },
            { title: 'Relatório de Vendas', description: 'Desempenho de vendas e receita' },
            { title: 'Relatório de Tráfego', description: 'Métricas de campanhas e ROAS' },
            { title: 'Relatório de Agentes', description: 'Performance dos agentes de IA' },
            { title: 'Relatório Financeiro', description: 'Faturamento e lucro detalhado' },
            { title: 'Relatório de Conversão', description: 'Funil e taxas de conversão' },
          ].map((report, index) => (
            <div key={index} className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700 hover:shadow-xl transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                  <BarChart3 size={24} className="text-primary-600" />
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg">
                  <Download size={18} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{report.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{report.description}</p>
              <button className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2">
                <Calendar size={16} />
                Gerar Relatório
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
