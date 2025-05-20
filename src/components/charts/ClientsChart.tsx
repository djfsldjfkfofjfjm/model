import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';
import { InfoTooltip } from '../common';
import { theme } from '../../constants/Theme';
import { useFinancialContext } from '../../contexts/FinancialContext';

/**
 * Интерфейс свойств компонента ClientsChart
 */
export interface ClientsChartProps {
  /** Заголовок графика */
  title?: string;
  /** Высота графика */
  height?: number;
  /** Показать все группы клиентов или сгруппировать */
  showAllGroups?: boolean;
  /** Дополнительные CSS классы */
  className?: string;
  /** Данные по месяцам (опционально, если не указаны - берутся из контекста) */
  data?: any[];
}

/**
 * Компонент для отображения графика клиентов по месяцам
 */
const ClientsChart: React.FC<ClientsChartProps> = ({ 
  data: propData, 
  title = "Динамика клиентской базы",
  height = 350,
  showAllGroups = true,
  className = ""
}) => {
  const { monthlyData } = useFinancialContext();
  
  // Используем данные из пропсов, если они есть, иначе из контекста
  const data = propData || monthlyData;
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ${className}`}>
      <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
        {title}
        <InfoTooltip 
          text="График показывает количество активных клиентов по месяцам в разбивке по тарифам" 
          className="ml-2"
        />
      </h2>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <defs>
            <linearGradient id="clients75Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="clients150Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="clients250Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="clients500Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="clients1000Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#F97316" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="totalClientsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.clients.primary} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={theme.clients.primary} stopOpacity={0.1}/>
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
          />
          <Tooltip 
            formatter={(value) => `${value} клиентов`}
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

          {showAllGroups ? (
            // Показать все группы клиентов
            <>
              <Area 
                type="monotone" 
                dataKey="activeClients75" 
                stackId="1" 
                fill="url(#clients75Gradient)" 
                stroke="#6366F1" 
                name="Клиенты $75" 
                fillOpacity={1}
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="activeClients150" 
                stackId="1" 
                fill="url(#clients150Gradient)" 
                stroke="#8B5CF6" 
                name="Клиенты $150" 
                fillOpacity={1}
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="activeClients250" 
                stackId="1" 
                fill="url(#clients250Gradient)" 
                stroke="#EC4899" 
                name="Клиенты $250" 
                fillOpacity={1}
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="activeClients500" 
                stackId="1" 
                fill="url(#clients500Gradient)" 
                stroke="#14B8A6" 
                name="Клиенты $500" 
                fillOpacity={1}
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="activeClients1000" 
                stackId="1" 
                fill="url(#clients1000Gradient)" 
                stroke="#F97316" 
                name="Клиенты $1000" 
                fillOpacity={1}
                strokeWidth={2}
              />
            </>
          ) : (
            // Показать только общее количество клиентов
            <Area 
              type="monotone" 
              dataKey="totalActiveClients" 
              fill="url(#totalClientsGradient)" 
              stroke={theme.clients.primary} 
              name="Всего клиентов" 
              fillOpacity={0.8}
              strokeWidth={2}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClientsChart;