import React from 'react';
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend 
} from 'recharts';
import { theme } from '../../constants/Theme';
import { useFinancialContext } from '../../contexts/FinancialContext';

/**
 * Интерфейс свойств компонента KPIRadarChart
 */
export interface KPIRadarChartProps {
  /** Заголовок графика */
  title?: string;
  /** Высота графика */
  height?: number;
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Компонент для отображения основных KPI на радарном графике
 */
const KPIRadarChart: React.FC<KPIRadarChartProps> = ({ 
  title = "Ключевые показатели эффективности (KPI)",
  height = 400,
  className = ""
}) => {
  const { totalData, churnRate } = useFinancialContext();
  // Нормализуем данные для радарной диаграммы, все значения в диапазоне 0-100
  const normalizedData = [
    {
      name: 'KPI',
      // ROI: totalData.roi уже в процентах. Нормализуем к [0, 100] для радара.
      "ROI": Math.min(100, Math.max(0, totalData.roi || 0)), 
      // NRR: totalData.nrr уже в процентах. Нормализуем к [0, 100].
      "NRR": Math.min(100, Math.max(0, totalData.nrr || 0)), 
      // Маржа внедрения: totalData.implementationMargin уже в процентах. Нормализуем к [0, 100].
      "Маржа внедрения": Math.min(100, Math.max(0, totalData.implementationMargin || 0)),
      "CAC Payback": Math.min(100, Math.max(0, totalData.cacPaybackPeriod ? (12 - Math.min(12, totalData.cacPaybackPeriod)) / 12 * 100 : 0)), // Чем меньше месяцев, тем лучше (ближе к 100)
      "Удержание клиентов": Math.min(100, Math.max(0, (20 - Math.min(20, churnRate || 0)) / 20 * 100)), // Чем меньше churn, тем лучше (ближе к 100)
    }
  ];

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 ${className}`}>
      <h2 className="text-xl font-bold mb-6 text-indigo-600">
        {title}
      </h2>
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-2/3">
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={normalizedData}>
              <PolarGrid stroke={theme.lightGray} />
              <PolarAngleAxis dataKey="name" tick={false} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar 
                name="ROI" 
                dataKey="ROI" 
                stroke={theme.primary} 
                fill={theme.primary} 
                fillOpacity={0.5} 
              />
              <Radar 
                name="NRR" 
                dataKey="NRR" 
                stroke={theme.secondary} 
                fill={theme.secondary} 
                fillOpacity={0.5} 
              />
              <Radar 
                name="Маржа внедрения" 
                dataKey="Маржа внедрения" 
                stroke={theme.accent} 
                fill={theme.accent} 
                fillOpacity={0.5} 
              />
              <Radar 
                name="CAC Payback" 
                dataKey="CAC Payback" 
                stroke={theme.success} 
                fill={theme.success} 
                fillOpacity={0.5} 
              />
              <Radar 
                name="Удержание клиентов" 
                dataKey="Удержание клиентов" 
                stroke={theme.warning} 
                fill={theme.warning} 
                fillOpacity={0.5} 
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:w-1/3 flex flex-col justify-center space-y-6">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h3 className="text-sm font-medium text-indigo-700 mb-1">ROI</h3>
            <p className="text-2xl font-bold text-indigo-800">{totalData.roi ? Math.round(totalData.roi) : 0}%</p>
            <p className="text-xs text-indigo-600">Возврат инвестиций</p>
          </div>
          
          <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
            <h3 className="text-sm font-medium text-pink-700 mb-1">NRR</h3>
            <p className="text-2xl font-bold text-pink-800">{totalData.nrr ? Math.round(totalData.nrr) : 100}%</p>
            <p className="text-xs text-pink-600">Удержание выручки</p>
          </div>
          
          <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-100">
            <h3 className="text-sm font-medium text-cyan-700 mb-1">Маржа внедрения</h3>
            <p className="text-2xl font-bold text-cyan-800">{totalData.implementationMargin ? Math.round(totalData.implementationMargin) : 0}%</p>
            <p className="text-xs text-cyan-600">Прибыль от интеграций</p>
          </div>
          
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
            <h3 className="text-sm font-medium text-emerald-700 mb-1">CAC Payback</h3>
            <p className="text-2xl font-bold text-emerald-800">{totalData.cacPaybackPeriod ? Math.round(totalData.cacPaybackPeriod) : 0} мес.</p>
            <p className="text-xs text-emerald-600">Окупаемость привлечения клиента</p>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <h3 className="text-sm font-medium text-amber-700 mb-1">Churn Rate</h3>
            <p className="text-2xl font-bold text-amber-800">{churnRate || 0}%</p>
            <p className="text-xs text-amber-600">Отток клиентов</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPIRadarChart;
