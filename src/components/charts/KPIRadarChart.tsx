import React, { useState, useEffect } from 'react';
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer 
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
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  // Правильная структура данных для RadarChart - каждая метрика как отдельный объект
  const radarData = [
    {
      subject: 'ROI',
      value: Math.min(100, Math.max(0, totalData.roi || 0)),
      fullMark: 100
    },
    {
      subject: 'NRR',
      value: Math.min(100, Math.max(0, totalData.nrr || 100)),
      fullMark: 100
    },
    {
      subject: 'Маржа внедрения',
      value: Math.min(100, Math.max(0, totalData.implementationMargin || 0)),
      fullMark: 100
    },
    {
      subject: 'CAC Payback',
      value: Math.min(100, Math.max(0, totalData.cacPaybackPeriod ? (12 - Math.min(12, totalData.cacPaybackPeriod)) / 12 * 100 : 0)),
      fullMark: 100
    },
    {
      subject: 'Удержание',
      value: Math.min(100, Math.max(0, (20 - Math.min(20, churnRate || 0)) / 20 * 100)),
      fullMark: 100
    }
  ];

  return (
    <div className={className}>
      <h3 className="text-lg font-medium text-gray-800 mb-6">
        {title}
      </h3>
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-2/3">
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart 
              cx="50%" 
              cy="50%" 
              outerRadius={isMobile ? "60%" : "80%"} 
              data={radarData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <PolarGrid stroke={theme.lightGray} />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: theme.darkGray, fontSize: isMobile ? 10 : 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={false} 
                axisLine={false} 
              />
              <Radar 
                name="KPI" 
                dataKey="value" 
                stroke={theme.primary} 
                fill={theme.primary} 
                fillOpacity={0.3}
                strokeWidth={3}
                dot={{ fill: theme.primary, strokeWidth: 2, r: 4 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:w-1/3 flex flex-col justify-center space-y-4 mt-6 lg:mt-0">
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
