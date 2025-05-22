import React, { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  // Используем данные из пропсов, если они есть, иначе из контекста
  const rawData = propData || monthlyData;

  // Убеждаемся, что данные представляют собой массив объектов
  const data = Array.isArray(rawData) ? rawData : [];
  
  // Проверяем, есть ли хотя бы одно значение клиентов больше 0
  const hasClientData = data.some(item => 
    (item.activeClients75 || 0) > 0 ||
    (item.activeClients150 || 0) > 0 ||
    (item.activeClients250 || 0) > 0 ||
    (item.activeClients500 || 0) > 0 ||
    (item.activeClients1000 || 0) > 0 ||
    (item.totalActiveClients || 0) > 0
  );

  // Отладка только при отсутствии данных
  if (!hasClientData) {
    console.log('ClientsChart - НЕТ ДАННЫХ КЛИЕНТОВ:', {
      dataLength: data.length,
      hasClientData,
      sampleMonth: data[2] ? {
        month: data[2].month,
        activeClients75: data[2].activeClients75,
        activeClients150: data[2].activeClients150,
        activeClients250: data[2].activeClients250,
        activeClients500: data[2].activeClients500,
        activeClients1000: data[2].activeClients1000,
        totalActiveClients: data[2].totalActiveClients
      } : 'нет 3-го месяца'
    });
  }
  
  
  // Если данных нет ИЛИ все значения клиентов равны 0, показываем заглушку
  if (!data.length || !hasClientData) {
    return (
      <div className={className}>
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            {title}
          </h3>
          <InfoTooltip 
            text="График показывает количество активных клиентов по месяцам в разбивке по тарифам" 
            className="ml-2"
          />
        </div>
        <div className="flex items-center justify-center bg-gray-50 rounded-lg" style={{height: height}}>
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <p className="text-gray-500">Данные клиентов отсутствуют</p>
            <p className="text-xs text-gray-400 mt-2">Добавьте клиентов во вкладке "Клиенты" или проверьте логи в браузере</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={className}>
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          {title}
        </h3>
        <InfoTooltip 
          text="График показывает количество активных клиентов по месяцам в разбивке по тарифам" 
          className="ml-2"
        />
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart 
          data={data} 
          margin={{ 
            top: 20, 
            right: isMobile ? 10 : 30, 
            left: isMobile ? 10 : 20, 
            bottom: isMobile ? 5 : 10 
          }}
        >
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
            height={isMobile ? 60 : 36} 
            iconType="circle"
            wrapperStyle={{
              fontSize: isMobile ? '12px' : '14px',
              paddingBottom: '10px'
            }}
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
