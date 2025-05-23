import React, { useState } from 'react';
import { MonthlyData } from '../../types/FinancialTypes';
import { useFormatting } from '../../hooks';

/**
 * Интерфейс свойств компонента MonthlyResultsTable
 */
export interface MonthlyResultsTableProps {
  /** Данные по месяцам */
  data: MonthlyData[];
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Современная результирующая таблица по месяцам в зумерском стиле
 * Показывает все ключевые показатели с визуальными индикаторами
 */
const MonthlyResultsTable: React.FC<MonthlyResultsTableProps> = ({ 
  data, 
  className = "" 
}) => {
  const { currency, percent, number } = useFormatting();
  const [activeFilter, setActiveFilter] = useState<'all' | 'revenue' | 'clients' | 'profit' | 'kpi'>('all');
  const [sortBy, setSortBy] = useState<'month' | 'revenue' | 'profit' | 'clients'>('month');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Защита от пустых данных
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium mb-2">Нет данных для отображения</h3>
          <p className="text-sm">Настройте параметры модели для генерации отчетов</p>
        </div>
      </div>
    );
  }

  // Фильтрация данных
  const filteredData = data.filter(month => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'revenue') return month.totalRevenue > 0;
    if (activeFilter === 'clients') return month.totalActiveClients > 0;
    if (activeFilter === 'profit') return month.netProfit !== 0;
    if (activeFilter === 'kpi') return month.arpu > 0;
    return true;
  });

  // Сортировка данных
  const sortedData = [...filteredData].sort((a, b) => {
    let aVal = 0, bVal = 0;
    switch (sortBy) {
      case 'month': aVal = a.month; bVal = b.month; break;
      case 'revenue': aVal = a.totalRevenue; bVal = b.totalRevenue; break;
      case 'profit': aVal = a.netProfit; bVal = b.netProfit; break;
      case 'clients': aVal = a.totalActiveClients; bVal = b.totalActiveClients; break;
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  // Получение трендов
  const getTrend = (current: number, previous: number): 'up' | 'down' | 'neutral' => {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
  };

  // Цветовые схемы для трендов
  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  const trendIcons = {
    up: '📈',
    down: '📉',
    neutral: '➡️'
  };

  // Компонент метрики с трендом
  const MetricCell: React.FC<{
    value: number;
    prevValue?: number;
    formatter: (val: number) => string;
    highlight?: boolean;
  }> = ({ value, prevValue = 0, formatter, highlight = false }) => {
    const trend = getTrend(value, prevValue);
    return (
      <div className={`text-right ${highlight ? 'font-bold' : ''}`}>
        <div className={`${highlight ? 'text-lg' : 'text-sm'} font-medium`}>
          {formatter(value)}
        </div>
        {prevValue !== 0 && (
          <div className={`text-xs px-1 py-0.5 rounded-full inline-flex items-center ${trendColors[trend]}`}>
            <span className="mr-1">{trendIcons[trend]}</span>
            {Math.abs(((value - prevValue) / prevValue) * 100).toFixed(0)}%
          </div>
        )}
      </div>
    );
  };

  // Компонент фильтра
  const FilterButton: React.FC<{
    filter: typeof activeFilter;
    label: string;
    icon: string;
    count: number;
  }> = ({ filter, label, icon, count }) => (
    <button
      onClick={() => setActiveFilter(filter)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
        activeFilter === filter 
          ? 'bg-indigo-600 text-white shadow-lg' 
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
      <span className={`text-xs px-2 py-1 rounded-full ${
        activeFilter === filter ? 'bg-indigo-500' : 'bg-gray-100'
      }`}>
        {count}
      </span>
    </button>
  );

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Заголовок секции */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">📊 Детальные результаты по месяцам</h3>
            <p className="text-indigo-100 text-sm mt-1">
              Полная аналитика финансовых показателей с трендами и КПИ
            </p>
          </div>
          <div className="text-right">
            <div className="text-indigo-100 text-sm">Всего периодов</div>
            <div className="text-2xl font-bold text-white">{data.length}</div>
          </div>
        </div>
      </div>

      {/* Панель фильтров */}
      <div className="p-6 bg-gray-50 border-b">
        <div className="flex flex-wrap gap-3 mb-4">
          <FilterButton filter="all" label="Все показатели" icon="🔍" count={data.length} />
          <FilterButton filter="revenue" label="Доходы" icon="💰" count={data.filter(d => d.totalRevenue > 0).length} />
          <FilterButton filter="clients" label="Клиенты" icon="👥" count={data.filter(d => d.totalActiveClients > 0).length} />
          <FilterButton filter="profit" label="Прибыль" icon="📈" count={data.filter(d => d.netProfit > 0).length} />
          <FilterButton filter="kpi" label="KPI" icon="🎯" count={data.filter(d => d.arpu > 0).length} />
        </div>

        {/* Сортировка */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Сортировать по:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="month">Месяц</option>
            <option value="revenue">Выручка</option>
            <option value="profit">Прибыль</option>
            <option value="clients">Клиенты</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            {sortOrder === 'asc' ? '⬆️ По возрастанию' : '⬇️ По убыванию'}
          </button>
        </div>
      </div>

      {/* Таблица результатов */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-100 z-10">
                📅 Месяц
              </th>
              
              {/* Клиенты */}
              {(activeFilter === 'all' || activeFilter === 'clients') && (
                <>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    👥 Новые
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    🏃 Отток
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ⚡ Активные
                  </th>
                </>
              )}

              {/* Доходы */}
              {(activeFilter === 'all' || activeFilter === 'revenue') && (
                <>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    🔧 Интеграция
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    📱 Подписки
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    💬 Доп.сообщения
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    🚀 Upsell
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">
                    💰 Общая выручка
                  </th>
                </>
              )}

              {/* Расходы и прибыль */}
              {(activeFilter === 'all' || activeFilter === 'profit') && (
                <>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    🔌 API
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    📊 CAC
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    👨‍💻 ФОТ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    📉 Расходы
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-red-50">
                    🧮 Налоги
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                    🎯 Чистая прибыль
                  </th>
                </>
              )}

              {/* KPI */}
              {(activeFilter === 'all' || activeFilter === 'kpi') && (
                <>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    💵 ARPU
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    🔄 NRR
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    📈 Накопленная прибыль
                  </th>
                </>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((month, index) => {
              const prevMonth = index > 0 ? sortedData[index - 1] : null;
              const isProfit = month.netProfit > 0;
              const isLoss = month.netProfit < 0;
              
              return (
                <tr 
                  key={month.month} 
                  className={`hover:bg-gray-50 transition-colors ${
                    isProfit ? 'bg-green-25' : isLoss ? 'bg-red-25' : ''
                  }`}
                >
                  {/* Месяц */}
                  <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-white z-10 border-r">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        isProfit ? 'bg-green-400' : isLoss ? 'bg-red-400' : 'bg-gray-400'
                      }`}></div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          Месяц {month.month}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(2024, month.month - 1).toLocaleDateString('ru-RU', { month: 'long' })}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Клиенты */}
                  {(activeFilter === 'all' || activeFilter === 'clients') && (
                    <>
                      <td className="px-4 py-4 text-right">
                        <MetricCell 
                          value={month.totalNewClients} 
                          prevValue={prevMonth?.totalNewClients} 
                          formatter={number}
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <MetricCell 
                          value={month.churnedClients} 
                          prevValue={prevMonth?.churnedClients} 
                          formatter={number}
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <MetricCell 
                          value={month.totalActiveClients} 
                          prevValue={prevMonth?.totalActiveClients} 
                          formatter={number}
                          highlight={true}
                        />
                      </td>
                    </>
                  )}

                  {/* Доходы */}
                  {(activeFilter === 'all' || activeFilter === 'revenue') && (
                    <>
                      <td className="px-4 py-4 text-right">
                        <MetricCell 
                          value={month.integrationRevenue} 
                          prevValue={prevMonth?.integrationRevenue} 
                          formatter={currency}
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <MetricCell 
                          value={month.subscriptionRevenue} 
                          prevValue={prevMonth?.subscriptionRevenue} 
                          formatter={currency}
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <MetricCell 
                          value={month.additionalMessagesRevenue} 
                          prevValue={prevMonth?.additionalMessagesRevenue} 
                          formatter={currency}
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <MetricCell 
                          value={month.upsellRevenue} 
                          prevValue={prevMonth?.upsellRevenue} 
                          formatter={currency}
                        />
                      </td>
                      <td className="px-4 py-4 text-right bg-green-25">
                        <MetricCell 
                          value={month.totalRevenue} 
                          prevValue={prevMonth?.totalRevenue} 
                          formatter={currency}
                          highlight={true}
                        />
                      </td>
                    </>
                  )}

                  {/* Расходы и прибыль */}
                  {(activeFilter === 'all' || activeFilter === 'profit') && (
                    <>
                      <td className="px-4 py-4 text-right">
                        <MetricCell 
                          value={month.apiCosts} 
                          prevValue={prevMonth?.apiCosts} 
                          formatter={currency}
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <MetricCell 
                          value={month.cacCosts} 
                          prevValue={prevMonth?.cacCosts} 
                          formatter={currency}
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <MetricCell 
                          value={month.fotCosts} 
                          prevValue={prevMonth?.fotCosts} 
                          formatter={currency}
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <MetricCell 
                          value={month.totalExpenses} 
                          prevValue={prevMonth?.totalExpenses} 
                          formatter={currency}
                        />
                      </td>
                      <td className="px-4 py-4 text-right bg-red-25">
                        <MetricCell 
                          value={month.tax} 
                          prevValue={prevMonth?.tax} 
                          formatter={currency}
                        />
                      </td>
                      <td className={`px-4 py-4 text-right ${isProfit ? 'bg-green-50' : isLoss ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <MetricCell 
                          value={month.netProfit} 
                          prevValue={prevMonth?.netProfit} 
                          formatter={currency}
                          highlight={true}
                        />
                      </td>
                    </>
                  )}

                  {/* KPI */}
                  {(activeFilter === 'all' || activeFilter === 'kpi') && (
                    <>
                      <td className="px-4 py-4 text-right">
                        <MetricCell 
                          value={month.arpu} 
                          prevValue={prevMonth?.arpu} 
                          formatter={currency}
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <MetricCell 
                          value={month.nrr} 
                          prevValue={prevMonth?.nrr} 
                          formatter={percent}
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <MetricCell 
                          value={month.cumulativeProfit} 
                          prevValue={prevMonth?.cumulativeProfit} 
                          formatter={currency}
                          highlight={true}
                        />
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Итоговая панель */}
      <div className="bg-gradient-to-r from-gray-50 to-indigo-50 px-6 py-4 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {currency(sortedData.reduce((sum, m) => sum + m.totalRevenue, 0))}
            </div>
            <div className="text-xs text-gray-600">Общая выручка</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {currency(sortedData.reduce((sum, m) => sum + Math.max(0, m.netProfit), 0))}
            </div>
            <div className="text-xs text-gray-600">Общая прибыль</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {number(sortedData.reduce((sum, m) => sum + m.totalActiveClients, 0) / sortedData.length)}
            </div>
            <div className="text-xs text-gray-600">Средние клиенты</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {currency(sortedData.reduce((sum, m) => sum + m.arpu, 0) / sortedData.length)}
            </div>
            <div className="text-xs text-gray-600">Средний ARPU</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyResultsTable;