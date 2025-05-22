import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { InfoTooltip } from '../common';
import { useFinancialContext } from '../../contexts/FinancialContext';
import { useFormatting } from '../../hooks';

/**
 * Интерфейс свойств компонента ClientGrowthFunnel
 */
export interface ClientGrowthFunnelProps {
  /** Заголовок компонента */
  title?: string;
  /** Высота компонента */
  height?: number;
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Интерактивная воронка роста клиентской базы
 * Показывает динамику привлечения, удержания и роста по тарифам
 */
const ClientGrowthFunnel: React.FC<ClientGrowthFunnelProps> = ({ 
  title = "🚀 Воронка роста клиентской базы",
  height = 400,
  className = ""
}) => {
  const { monthlyData, totalData } = useFinancialContext();
  const { number: formatNumber } = useFormatting();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Анимация прогрессивного появления
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Обработка данных для воронки
  const funnelData = useMemo(() => {
    if (!monthlyData?.length) return [];

    const tiers = [
      { key: '75', name: '$75', color: '#6366F1', lightColor: '#818CF8' },
      { key: '150', name: '$150', color: '#8B5CF6', lightColor: '#A78BFA' },
      { key: '250', name: '$250', color: '#EC4899', lightColor: '#F472B6' },
      { key: '500', name: '$500', color: '#14B8A6', lightColor: '#2DD4BF' },
      { key: '1000', name: '$1000', color: '#F97316', lightColor: '#FB923C' }
    ];

    return tiers.map(tier => {
      // Суммарные данные по тарифу
      const totalNew = monthlyData.reduce((sum, month) => 
        sum + (month[`newClients${tier.key}` as keyof typeof month] as number || 0), 0);
      const finalActive = monthlyData[11]?.[`activeClients${tier.key}` as keyof typeof monthlyData[11]] as number || 0;
      const totalChurn = monthlyData.reduce((sum, month) => 
        sum + (month[`churnClients${tier.key}` as keyof typeof month] as number || 0), 0);
      
      // Показатели воронки
      const retention = totalNew > 0 ? ((finalActive / totalNew) * 100) : 0;
      const growth = finalActive - totalNew + totalChurn; // Рост с учетом оттока
      const intensity = Math.min(100, (finalActive / 10) * 100); // Интенсивность для тепловой карты

      return {
        tier: tier.name,
        tierKey: tier.key,
        newClients: totalNew,
        activeClients: finalActive,
        churnedClients: totalChurn,
        netGrowth: growth,
        retentionRate: retention,
        intensity: intensity,
        color: tier.color,
        lightColor: tier.lightColor,
        // Данные для воронки
        step1_attracted: totalNew,
        step2_activated: Math.round(totalNew * 0.85), // 85% активируются
        step3_retained: finalActive,
        step4_advocates: Math.round(finalActive * 0.2) // 20% становятся адвокатами
      };
    });
  }, [monthlyData]);

  // Данные для барной диаграммы роста
  const growthChartData = useMemo(() => {
    return monthlyData?.slice(0, 12).map((month, index) => ({
      month: `М${index + 1}`,
      total: (month.activeClients75 || 0) + (month.activeClients150 || 0) + 
             (month.activeClients250 || 0) + (month.activeClients500 || 0) + 
             (month.activeClients1000 || 0),
      new: (month.newClients75 || 0) + (month.newClients150 || 0) + 
           (month.newClients250 || 0) + (month.newClients500 || 0) + 
           (month.newClients1000 || 0)
    })) || [];
  }, [monthlyData]);

  // Кастомный Tooltip для графика
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg border-none">
          <p className="font-semibold">{label}</p>
          <p className="text-blue-300">
            Активных: <span className="font-bold">{payload[0]?.value || 0}</span>
          </p>
          <p className="text-green-300">
            Новых: <span className="font-bold">{payload[1]?.value || 0}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!funnelData.length) {
    return (
      <div className={className}>
        <div className="bg-white shadow-lg rounded-xl p-8">
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <InfoTooltip 
              text="Интерактивная воронка показывает динамику роста клиентской базы по этапам: привлечение → активация → удержание → адвокаты" 
              className="ml-2"
            />
          </div>
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Загрузка данных воронки...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <InfoTooltip 
            text="Интерактивная воронка показывает динамику роста клиентской базы по этапам и тарифным планам" 
            className="ml-2"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Тепловая карта тарифов */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              🔥 Интенсивность по тарифам
            </h4>
            <div className="space-y-2">
              {funnelData.map((tier, index) => (
                <div 
                  key={tier.tierKey}
                  className={`relative p-3 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    selectedTier === tier.tierKey ? 'ring-2 ring-blue-500 shadow-md' : ''
                  } ${animationPhase === index ? 'animate-pulse' : ''}`}
                  style={{ 
                    backgroundColor: `${tier.color}${Math.round(tier.intensity * 0.1 + 10).toString(16).padStart(2, '0')}`,
                    borderLeft: `4px solid ${tier.color}`
                  }}
                  onClick={() => setSelectedTier(selectedTier === tier.tierKey ? null : tier.tierKey)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">{tier.tier}</span>
                    <span className="text-sm font-semibold" style={{ color: tier.color }}>
                      {tier.activeClients} клиентов
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-600">
                    <span>Привлечено: {tier.newClients}</span>
                    <span>Удержание: {tier.retentionRate.toFixed(1)}%</span>
                  </div>
                  
                  {/* Воронка для выбранного тарифа */}
                  {selectedTier === tier.tierKey && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">1. Привлечено</span>
                          <div className="flex items-center">
                            <div 
                              className="h-2 rounded-full mr-2" 
                              style={{ 
                                width: '60px', 
                                backgroundColor: tier.lightColor 
                              }}
                            />
                            <span className="text-xs font-semibold">{tier.step1_attracted}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">2. Активировано</span>
                          <div className="flex items-center">
                            <div 
                              className="h-2 rounded-full mr-2" 
                              style={{ 
                                width: '48px', 
                                backgroundColor: tier.color 
                              }}
                            />
                            <span className="text-xs font-semibold">{tier.step2_activated}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">3. Удержано</span>
                          <div className="flex items-center">
                            <div 
                              className="h-2 rounded-full mr-2" 
                              style={{ 
                                width: `${Math.max(20, (tier.activeClients / tier.step1_attracted) * 60)}px`, 
                                backgroundColor: tier.color 
                              }}
                            />
                            <span className="text-xs font-semibold">{tier.activeClients}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">4. Адвокаты</span>
                          <div className="flex items-center">
                            <div 
                              className="h-2 rounded-full mr-2" 
                              style={{ 
                                width: '12px', 
                                backgroundColor: '#10B981' 
                              }}
                            />
                            <span className="text-xs font-semibold">{tier.step4_advocates}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* График роста по месяцам */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              📈 Динамика роста по месяцам
            </h4>
            <ResponsiveContainer width="100%" height={height - 100}>
              <BarChart data={growthChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Активных клиентов" radius={[4, 4, 0, 0]}>
                  {growthChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(${220 + index * 15}, 70%, ${60 + Math.sin(index) * 10}%)`}
                    />
                  ))}
                </Bar>
                <Bar dataKey="new" name="Новых клиентов" radius={[2, 2, 0, 0]}>
                  {growthChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-new-${index}`} 
                      fill={`hsl(${140 + index * 10}, 60%, ${70 + Math.cos(index) * 10}%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Итоговые метрики воронки */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(totalData.totalNewClients || 0)}
              </div>
              <div className="text-xs text-blue-500 uppercase tracking-wide">
                Всего привлечено
              </div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(totalData.finalActiveClients || 0)}
              </div>
              <div className="text-xs text-green-500 uppercase tracking-wide">
                Активных сейчас
              </div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-red-50 to-rose-100 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {formatNumber(totalData.totalChurnedClients || 0)}
              </div>
              <div className="text-xs text-red-500 uppercase tracking-wide">
                Потеряно клиентов
              </div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {totalData.totalNewClients > 0 
                  ? ((totalData.finalActiveClients / totalData.totalNewClients) * 100).toFixed(1)
                  : '0'}%
              </div>
              <div className="text-xs text-purple-500 uppercase tracking-wide">
                Общее удержание
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientGrowthFunnel;