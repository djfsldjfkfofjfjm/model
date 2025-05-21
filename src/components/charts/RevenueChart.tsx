import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';
import { InfoTooltip } from '../common';
import { theme } from '../../constants/Theme';
import { useFinancialContext } from '../../contexts/FinancialContext';
import { useFormatting } from '../../hooks';

/**
 * Интерфейс свойств компонента RevenueChart
 */
export interface RevenueChartProps {
  /** Заголовок графика */
  title?: string;
  /** Высота графика */
  height?: number;
  /** Дополнительные CSS классы */
  className?: string;
  /** Данные по месяцам (опционально, если не указаны - берутся из контекста) */
  data?: any[];
}

/**
 * Компонент для отображения графика доходов по месяцам
 */
const RevenueChart: React.FC<RevenueChartProps> = ({ 
  data: propData,
  title = "Динамика доходов",
  height = 400,
  className = ""
}) => {
  const { monthlyData } = useFinancialContext();
  const { currency } = useFormatting();
  
  // Используем данные из пропсов, если они есть, иначе из контекста
  const data = propData || monthlyData;
  return (
    <div className={`bg-white p-6 rounded-2xl shadow border border-gray-100 ${className}`}>
      <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
        {title}
        <InfoTooltip 
          text="График показывает разбивку доходов по трем источникам: внедрение (единоразовое), подписка (ежемесячное) и дополнительные сообщения." 
          className="ml-2"
        />
      </h2>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <defs>
            <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.income.primary} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={theme.income.primary} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="subscriptionAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.income.secondary} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={theme.income.secondary} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="integrationAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.accent} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={theme.accent} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="profitAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.profit.primary} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={theme.profit.primary} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis 
            dataKey="month" 
            tick={{ fill: theme.darkGray }} 
            tickLine={{ stroke: theme.lightGray }}
            axisLine={{ stroke: theme.lightGray }}
          />
          <YAxis 
            tick={{ fill: theme.darkGray }}
            axisLine={{ stroke: theme.lightGray }}
            tickLine={{ stroke: theme.lightGray }}
            tickFormatter={value => value >= 1000 ? `$${value / 1000}k` : `$${value}`}
          />
          <Tooltip 
            formatter={(value: any) => currency(Number(value))}
            contentStyle={{ 
              backgroundColor: theme.tooltipBackground,
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              color: theme.light
            }}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
          />
          <Area 
            type="monotone" 
            dataKey="integrationRevenue" 
            stackId="1" 
            fill="url(#integrationAreaGradient)" 
            stroke={theme.accent} 
            name="Интеграция" 
            fillOpacity={1}
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="subscriptionRevenue" 
            stackId="1" 
            fill="url(#subscriptionAreaGradient)" 
            stroke={theme.income.secondary} 
            name="Подписка" 
            fillOpacity={1}
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="additionalMessagesRevenue" 
            stackId="1" 
            fill="url(#revenueAreaGradient)" 
            stroke={theme.income.primary} 
            name="Доп. сообщения" 
            fillOpacity={1}
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="cumulativeProfit" 
            name="Накопит. прибыль" 
            fill="url(#profitAreaGradient)" 
            stroke={theme.profit.primary} 
            fillOpacity={1}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;