import React from 'react';
import { MetricCard } from '../common';
import { theme } from '../../constants/Theme';
import { useFinancialContext } from '../../contexts/FinancialContext';
import { useFormatting } from '../../hooks';

/**
 * Интерфейс свойств компонента KeyMetricsPanel
 */
export interface KeyMetricsPanelProps {
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Компонент панели ключевых метрик
 */
const KeyMetricsPanel: React.FC<KeyMetricsPanelProps> = ({ 
  className = ""
}) => {
  const { totalData } = useFinancialContext();
  const { currency } = useFormatting();
  
  // Если данные еще не загружены, показываем пустые значения
  if (!totalData || Object.keys(totalData).length === 0) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${className}`}>
        <p>Загрузка данных...</p>
      </div>
    );
  }
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${className}`}>
      <MetricCard 
        title="Общий доход" 
        value={totalData.totalRevenue || 0} 
        color={theme.income.primary} 
        tooltip="Общая выручка за весь период, включая доходы от внедрения, подписки и доп. услуг"
        formatValue={currency}
        data-testid="metric-totalRevenue" 
      />
      <MetricCard 
        title="Общие расходы" 
        value={totalData.totalExpenses || 0} 
        color={theme.danger} 
        tooltip="Совокупные расходы за весь период"
        formatValue={currency}
        data-testid="metric-totalExpenses"
      />
      <MetricCard 
        title="Чистая прибыль" 
        value={totalData.totalNetProfit || 0} 
        color={totalData.totalNetProfit >= 0 ? theme.profit.primary : theme.danger}
        tooltip="Чистая прибыль после вычета всех расходов и налогов"
        formatValue={currency}
      />
      <MetricCard 
        title="ROI" 
        value={totalData.roi ? `${Math.round(totalData.roi)}%` : '0%'} 
        color={theme.profit.primary} 
        tooltip="Возврат инвестиций - отношение чистой прибыли к вложенным средствам"
        data-testid="metric-roi"
      />
      
      <MetricCard 
        title="Клиентов всего" 
        value={totalData.finalActiveClients || 0} 
        color={theme.clients.primary} 
        subValue={`Привлечено: ${totalData.totalNewClients || 0}`}
        tooltip="Общее количество активных клиентов на конец периода"
        data-testid="metric-finalActiveClients"
      />
      <MetricCard 
        title="Отток клиентов" 
        value={totalData.totalChurnedClients || 0} 
        color={theme.danger} 
        subValue={`Ставка: ${totalData.churnRate || 0}% в месяц`}
        tooltip="Общее количество потерянных клиентов за период"
        data-testid="metric-totalChurnedClients"
      />
      <MetricCard 
        title="Маржа внедрения" 
        value={totalData.implementationMargin ? `${Math.round(totalData.implementationMargin)}%` : '0%'} 
        color={theme.accent} 
        subValue="% прибыли от внедрения"
        tooltip="Доля прибыли от услуг внедрения"
        data-testid="metric-implementationMargin"
      />
      <MetricCard 
        title="Точка безубыточности" 
        value={(totalData.breakevenMonth && totalData.breakevenMonth > 0 && totalData.breakevenMonth <= 12) ? 
        `Месяц ${totalData.breakevenMonth}` : 'Более 12 мес.'} 
        color={theme.success} 
        tooltip="Месяц, когда накопленная прибыль становится положительной"
        data-testid="metric-breakevenMonth"
      />
    </div>
  );
};

export default KeyMetricsPanel;
