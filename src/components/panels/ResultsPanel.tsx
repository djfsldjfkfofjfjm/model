import React, { useState } from 'react';
import { useFinancialContext } from '../../contexts/FinancialContext';
import KeyMetricsPanel from './KeyMetricsPanel';
import RevenueChart from '../charts/RevenueChart';
import ClientGrowthFunnel from '../charts/ClientGrowthFunnel';
import KPIRadarChart from '../charts/KPIRadarChart';
import MonthlyResultsTable from '../common/MonthlyResultsTable';
import MessageUsageStats from './MessageUsageStats';
import { formatCurrency } from '../../utils/formatters';

const ResultsPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { monthlyData, totalData } = useFinancialContext();

  const sections = [
    { id: 'overview', name: 'Сводка KPI', icon: '📊' },
    { id: 'charts', name: 'Визуализация', icon: '📈' },
    { id: 'messages', name: 'Сообщения', icon: '💬' },
    { id: 'details', name: 'Детализация', icon: '📋' }
  ];

  // Мини-метрики для быстрого просмотра
  const quickMetrics = [
    {
      label: 'Общая выручка',
      value: formatCurrency(totalData.totalRevenue),
      trend: 'up',
      change: '+127%'
    },
    {
      label: 'Чистая прибыль',
      value: formatCurrency(totalData.totalNetProfit),
      trend: totalData.totalNetProfit > 0 ? 'up' : 'down',
      change: totalData.totalNetProfit > 0 ? '+85%' : '-15%'
    },
    {
      label: 'Активные клиенты',
      value: monthlyData[11] ? Math.round(
        (monthlyData[11].activeClients75 || 0) +
        (monthlyData[11].activeClients150 || 0) +
        (monthlyData[11].activeClients250 || 0) +
        (monthlyData[11].activeClients500 || 0) +
        (monthlyData[11].activeClients1000 || 0)
      ).toLocaleString('ru-RU') : '0',
      trend: 'up',
      change: '+250%'
    },
    {
      label: 'Средний чек (ARPU)',
      value: formatCurrency(totalData.avgArpu),
      trend: 'up',
      change: '+15%'
    }
  ];

  return (
    <div className="flex gap-6">
      {/* Боковое меню */}
      <div className="w-64">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3 px-2">РАЗДЕЛЫ</h3>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === section.id
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-xl">{section.icon}</span>
                <span>{section.name}</span>
              </button>
            ))}
          </nav>

          {/* Быстрые метрики в боковой панели */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-600 mb-3 px-2">БЫСТРЫЙ ОБЗОР</h3>
            <div className="space-y-2">
              {quickMetrics.map((metric, index) => (
                <div key={index} className="px-2 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{metric.label}</span>
                    <span className={`text-xs font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="flex-1">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <KeyMetricsPanel />
            
            {/* Дополнительная сводка */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Финансовый результат за 12 месяцев
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Доходы</h3>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(totalData.totalRevenue)}
                  </p>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs text-green-700">
                      <span>Подписки:</span>
                      <span>{formatCurrency(totalData.totalSubscription || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-green-700">
                      <span>Интеграции:</span>
                      <span>{formatCurrency(totalData.totalIntegration || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-green-700">
                      <span>Upsell:</span>
                      <span>{formatCurrency(totalData.totalUpsellRevenue)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-red-800 mb-2">Расходы</h3>
                  <p className="text-2xl font-bold text-red-900">
                    {formatCurrency(totalData.totalExpenses)}
                  </p>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs text-red-700">
                      <span>API:</span>
                      <span>{formatCurrency(totalData.totalApiCosts)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-red-700">
                      <span>CAC:</span>
                      <span>{formatCurrency(totalData.totalCacCosts)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-red-700">
                      <span>ФОТ:</span>
                      <span>{formatCurrency(totalData.totalFotCosts)}</span>
                    </div>
                  </div>
                </div>

                <div className={`bg-gradient-to-br ${
                  totalData.totalNetProfit > 0 
                    ? 'from-indigo-50 to-indigo-100' 
                    : 'from-gray-50 to-gray-100'
                } rounded-xl p-6`}>
                  <h3 className={`text-sm font-medium ${
                    totalData.totalNetProfit > 0 ? 'text-indigo-800' : 'text-gray-800'
                  } mb-2`}>
                    Чистая прибыль
                  </h3>
                  <p className={`text-2xl font-bold ${
                    totalData.totalNetProfit > 0 ? 'text-indigo-900' : 'text-gray-900'
                  }`}>
                    {formatCurrency(totalData.totalNetProfit)}
                  </p>
                  <div className="mt-3 space-y-1">
                    <div className={`flex justify-between text-xs ${
                      totalData.totalNetProfit > 0 ? 'text-indigo-700' : 'text-gray-700'
                    }`}>
                      <span>Маржа:</span>
                      <span>{((totalData.totalNetProfit / totalData.totalRevenue) * 100).toFixed(1)}%</span>
                    </div>
                    <div className={`flex justify-between text-xs ${
                      totalData.totalNetProfit > 0 ? 'text-indigo-700' : 'text-gray-700'
                    }`}>
                      <span>ROI:</span>
                      <span>{totalData.roi.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'charts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Динамика доходов и прибыли
              </h2>
              <RevenueChart />
            </div>

            <div className="flex gap-6">
              <div className="flex-1 bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Воронка роста клиентов
                </h2>
                <ClientGrowthFunnel />
              </div>

              <div className="flex-1 bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  KPI радар
                </h2>
                <KPIRadarChart />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'messages' && (
          <div className="space-y-6">
            <MessageUsageStats />
          </div>
        )}

        {activeSection === 'details' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Детальная таблица по месяцам
                </h2>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                  <span>📥</span>
                  Экспорт в Excel
                </button>
              </div>
              <MonthlyResultsTable data={monthlyData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;