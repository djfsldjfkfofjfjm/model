/**
 * Типы данных для финансовой модели
 */

/**
 * Модель налогообложения
 */
export type TaxMode = 'optimistic' | 'pessimistic' | 'custom';

/**
 * Модель ФОТ
 */
export type FOTMode = 'optimistic' | 'pessimistic';

/**
 * Канал привлечения клиентов
 */
export type AcquisitionChannel = 'direct' | 'partner';

/**
 * Тренд изменения метрик
 */
export type TrendType = 'up' | 'down' | 'neutral' | null;

/**
 * Данные по месяцу
 */
export interface MonthlyData {
  /** Номер месяца (1-12) */
  month: number;
  
  // Данные по клиентам
  /** Новые клиенты тарифа $75 */
  newClients75: number;
  /** Новые клиенты тарифа $150 */
  newClients150: number;
  /** Новые клиенты тарифа $250 */
  newClients250: number;
  /** Новые клиенты тарифа $500 */
  newClients500: number;
  /** Новые клиенты тарифа $1000 */
  newClients1000: number;
  
  // Новые клиенты по каналам привлечения
  /** Новые клиенты $75 - прямые продажи */
  newClients75Direct: number;
  /** Новые клиенты $75 - партнёры */
  newClients75Partner: number;
  /** Новые клиенты $150 - прямые продажи */
  newClients150Direct: number;
  /** Новые клиенты $150 - партнёры */
  newClients150Partner: number;
  /** Новые клиенты $250 - прямые продажи */
  newClients250Direct: number;
  /** Новые клиенты $250 - партнёры */
  newClients250Partner: number;
  /** Новые клиенты $500 - прямые продажи */
  newClients500Direct: number;
  /** Новые клиенты $500 - партнёры */
  newClients500Partner: number;
  /** Новые клиенты $1000 - прямые продажи */
  newClients1000Direct: number;
  /** Новые клиенты $1000 - партнёры */
  newClients1000Partner: number;
  /** Общее количество потерянных клиентов за месяц */
  churnedClients: number;
  /** Потерянные клиенты тарифа $75 */
  churnClients75: number;
  /** Потерянные клиенты тарифа $150 */
  churnClients150: number;
  /** Потерянные клиенты тарифа $250 */
  churnClients250: number;
  /** Потерянные клиенты тарифа $500 */
  churnClients500: number;
  /** Потерянные клиенты тарифа $1000 */
  churnClients1000: number;
  /** Активные клиенты тарифа $75 */
  activeClients75: number;
  /** Активные клиенты тарифа $150 */
  activeClients150: number;
  /** Активные клиенты тарифа $250 */
  activeClients250: number;
  /** Активные клиенты тарифа $500 */
  activeClients500: number;
  /** Активные клиенты тарифа $1000 */
  activeClients1000: number;
  /** Общее количество новых клиентов */
  totalNewClients: number;
  /** Общее количество активных клиентов */
  totalActiveClients: number;
  
  // Данные по доходам
  /** Доход от интеграции */
  integrationRevenue: number;
  /** Доход от подписок */
  subscriptionRevenue: number;
  /** Доход от подписок тарифа $75 */
  subscriptionRevenue75: number;
  /** Доход от подписок тарифа $150 */
  subscriptionRevenue150: number;
  /** Доход от подписок тарифа $250 */
  subscriptionRevenue250: number;
  /** Доход от подписок тарифа $500 */
  subscriptionRevenue500: number;
  /** Доход от подписок тарифа $1000 */
  subscriptionRevenue1000: number;
  /** Доход от дополнительных сообщений */
  additionalMessagesRevenue: number;
  /** Общий доход */
  totalRevenue: number;
  /** Средний доход на клиента */
  arpu: number;
  /** NRR (Net Revenue Retention) */
  nrr: number;
  
  // Данные по расходам
  /** Расходы на API */
  apiCosts: number;
  /** Расходы на привлечение клиентов (CAC) */
  cacCosts: number;
  /** Комиссии партнерам */
  partnerCommissions: number;
  /** Расходы на продажи */
  salesTeamCosts: number;
  /** Расходы на маркетинг */
  marketingCosts: number;
  /** Расходы на генерацию лидов */
  leadGenerationCosts: number;
  
  // Расходы по каналам привлечения
  /** Расходы на прямые продажи */
  directSalesCosts: number;
  /** Расходы на прямой маркетинг */
  directMarketingCosts: number;
  /** Расходы на лиды прямого канала */
  directLeadGenerationCosts: number;
  /** Комиссии партнёрам */
  partnerCommissionCosts: number;
  /** Расходы на лиды партнёрского канала */
  partnerLeadGenerationCosts: number;
  /** Расходы на внедрение */
  implementationCosts: number;
  /** Расходы на ФОТ */
  fotCosts: number;
  /** Расходы на ФОТ разработки */
  fotDevelopmentCosts: number;
  /** Расходы на ФОТ продаж */
  fotSalesCosts: number;
  /** Общие расходы */
  totalExpenses: number;
  
  // Данные по прибыли
  /** Валовая прибыль */
  grossProfit: number;
  /** Налоги */
  tax: number;
  /** Чистая прибыль */
  netProfit: number;
  
  // Данные по сообщениям
  /** Использованные сообщения тарифа $75 */
  usedMessages75: number;
  /** Использованные сообщения тарифа $150 */
  usedMessages150: number;
  /** Использованные сообщения тарифа $250 */
  usedMessages250: number;
  /** Использованные сообщения тарифа $500 */
  usedMessages500: number;
  /** Использованные сообщения тарифа $1000 */
  usedMessages1000: number;
  /** Доступные сообщения тарифа $75 */
  availableMessages75: number;
  /** Доступные сообщения тарифа $150 */
  availableMessages150: number;
  /** Доступные сообщения тарифа $250 */
  availableMessages250: number;
  /** Доступные сообщения тарифа $500 */
  availableMessages500: number;
  /** Доступные сообщения тарифа $1000 */
  availableMessages1000: number;
  /** Дополнительные сообщения тарифа $75 */
  additionalMessages75: number;
  /** Дополнительные сообщения тарифа $150 */
  additionalMessages150: number;
  /** Дополнительные сообщения тарифа $250 */
  additionalMessages250: number;
  /** Дополнительные сообщения тарифа $500 */
  additionalMessages500: number;
  /** Дополнительные сообщения тарифа $1000 */
  additionalMessages1000: number;
  /** Неиспользованные сообщения тарифа $75 */
  unusedMessages75: number;
  /** Неиспользованные сообщения тарифа $150 */
  unusedMessages150: number;
  /** Неиспользованные сообщения тарифа $250 */
  unusedMessages250: number;
  /** Неиспользованные сообщения тарифа $500 */
  unusedMessages500: number;
  /** Неиспользованные сообщения тарифа $1000 */
  unusedMessages1000: number;
  /** Общее количество дополнительных сообщений */
  totalAdditionalMessages: number;
  /** Общее количество сообщений в пакетах (опционально, если не рассчитывается) */
  totalMessagesInPackages?: number;
  /** Использованные сообщения (опционально, если не рассчитывается) */
  usedMessages?: number;
  /** Неиспользованные сообщения (опционально, если не рассчитывается) */
  unusedMessages?: number;
  /** Перенесенные сообщения (опционально, если не рассчитывается) */
  carriedOverMessages?: number;
  /** Необходимое количество дополнительных сообщений (опционально, если не рассчитывается) */
  additionalMessagesNeeded?: number;
  
  // Накопительные итоги
  /** Накопительный итог по доходам */
  cumulativeRevenue: number;
  /** Накопительный итог по расходам */
  cumulativeExpenses: number;
  /** Накопительный итог по прибыли */
  cumulativeProfit: number;
  
  // Декомпозиция Upsell
  /** Клиенты, покупающие дополнительные боты */
  additionalBotsClients: number;
  /** Доход от дополнительных ботов */
  additionalBotsRevenue: number;
  /** Клиенты, покупающие новые функции */
  newFeaturesClients: number;
  /** Доход от новых функций */
  newFeaturesRevenue: number;
  /** Клиенты, расширяющие объем сообщений */
  messageExpansionClients: number;
  /** Доход от расширения объема сообщений */
  messageExpansionRevenue: number;
  /** Клиенты, покупающие дополнительные интеграции */
  additionalIntegrationsClients: number;
  /** Доход от дополнительных интеграций */
  additionalIntegrationsRevenue: number;
  /** Общий доход от Upsell */
  upsellRevenue: number;
}

/**
 * Итоговые данные финансовой модели
 */
export interface TotalData {
  totalNewClients: number;
  totalRevenue: number;
  totalExpenses: number;
  totalNetProfit: number;
  totalGrossProfit: number;
  
  // Среднемесячные показатели
  avgMonthlyRevenue: number;
  avgMonthlyProfit: number;
  profitMargin: number;
  
  // Метрики клиентов
  avgArpu: number;
  ltv: number;
  cacPerClient: number;
  ltvCacRatio: number;
  cacPaybackPeriod: number;
  finalActiveClients: number;
  totalChurnedClients: number;
  churnRate: number; // Это входной параметр, но дублируем для удобства отображения
  roi: number;
  implementationMargin: number;
  breakevenMonth?: number; // Может не быть точки безубыточности в периоде
  nrr: number; // NRR последнего месяца или средний
  expansionRevenue: number;
  churnedRevenue: number;
  
  // Детализация доходов
  totalIntegration: number;
  totalSubscription: number;
  totalAdditionalMessagesRevenue: number;
  totalUpsellRevenue: number;
  
  // Детализация расходов
  totalApiCosts: number;
  totalCacCosts: number;
  totalImplementationCosts: number;
  totalFotCosts: number;
  
  // Компоненты CAC
  totalPartnerCommissions: number;
  totalSalesTeamCosts: number;
  totalMarketingCosts: number;
  totalLeadGenerationCosts: number;
  
  // Детализация Upsell
  totalAdditionalBotsRevenue: number;
  totalNewFeaturesRevenue: number;
  totalMessageExpansionRevenue: number;
  totalAdditionalIntegrationsRevenue: number;
  
  // Налоги
  totalTax: number;
}

/**
 * Параметры финансовой модели
 */
export interface FinancialModelParams {
  taxMode: TaxMode;
  customTaxRate: number;
  fotMode: FOTMode;
  apiCostPercentage: number;
  churnRate: number;
  maxImplementationCost: number;
  integrationPrice: number;
  cacPercentage: number;
  implementationPercentage: number;
  partnerCommissionRate: number;
  salesTeamPercentage?: number; // deprecated
  marketingPercentage?: number; // deprecated
  leadGenerationPerClient?: number; // deprecated
  messageUsageRate: number;
  carryOverPercentage: number;
  additionalMessagePrice: number;
  fotOptimistic: number[]; // Added for editable FOT
  fotPessimistic: number[]; // Added for editable FOT
  // Параметры каналов
  channelDistribution: { direct: number; partner: number };
  directSalesPercentage: number;
  directMarketingPercentage: number;
  directLeadCost: number;
  partnerLeadCost: number;
  // Декомпозированный ФОТ
  fotDevelopmentOptimistic?: number[];
  fotDevelopmentPessimistic?: number[];
  fotSalesOptimistic?: number[];
  fotSalesPessimistic?: number[];
}

/**
 * Настройки каналов привлечения
 */
export interface AcquisitionChannelSettings {
  // Прямые продажи (самостоятельное привлечение)
  directSalesPercentage: number; // % от выручки на зарплату продаж
  directMarketingPercentage: number; // % от выручки на маркетинг
  directLeadCost: number; // Стоимость лида при прямом привлечении
  
  // Партнёрский канал
  partnerCommissionRate: number; // % от выручки клиента партнёрам
  partnerLeadCost: number; // Стоимость лида от партнёров
}

/**
 * Данные о клиентах 
 */
export interface ClientsData {
  newClients75: number[];
  newClients150: number[];
  newClients250: number[];
  newClients500: number[];
  newClients1000: number[];
  // Клиенты по каналам привлечения
  newClients75Direct: number[];
  newClients150Direct: number[];
  newClients250Direct: number[];
  newClients500Direct: number[];
  newClients1000Direct: number[];
  newClients75Partner: number[];
  newClients150Partner: number[];
  newClients250Partner: number[];
  newClients500Partner: number[];
  newClients1000Partner: number[];
  subscriptionPrice75: number;
  subscriptionPrice150: number;
  subscriptionPrice250: number;
  subscriptionPrice500: number;
  subscriptionPrice1000: number;
  messages75: number;
  messages150: number;
  messages250: number;
  messages500: number;
  messages1000: number;
}

/**
 * Настройки Upsell
 */
export interface UpsellSettings {
  additionalBotsRate: number;
  additionalBotsPrice: number;
  newFeaturesRate: number;
  newFeaturesPrice: number;
  messageExpansionRate: number;
  messageExpansionPrice: number;
  additionalIntegrationsRate: number;
  additionalIntegrationsPrice: number;
}
