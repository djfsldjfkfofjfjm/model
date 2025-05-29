import { TaxMode, FOTMode } from '../types/FinancialTypes';

/**
 * Базовые параметры модели
 */
export const DEFAULT_BASE_PARAMS = {
  taxMode: 'optimistic' as TaxMode, // optimistic = 9% (ПВТ), pessimistic = 35%
  fotMode: 'optimistic' as FOTMode, // optimistic = базовые расходы, pessimistic = повышенные расходы
  apiCost: 30, // % от выручки подписки
  churnRate: 2, // % оттока клиентов в месяц
  maxImplementationCost: 200,
};

/**
 * Налоговые ставки
 */
export const DEFAULT_TAX_RATES = {
  optimistic: 9, // ПВТ
  pessimistic: 35, // ООО общая
};

/**
 * Начальные данные по новым клиентам (помесячно)
 */
export const DEFAULT_NEW_CLIENTS = {
  clients75: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  clients150: [0, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3],
  clients250: [3, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  clients500: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  clients1000: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // Распределение по каналам (прямые продажи)
  clients75Direct: [0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0],
  clients150Direct: [0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2],
  clients250Direct: [2, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  clients500Direct: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  clients1000Direct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // Распределение по каналам (партнёры)
  clients75Partner: [0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1],
  clients150Partner: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  clients250Partner: [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  clients500Partner: [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  clients1000Partner: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

/**
 * Цены подписок
 */
export const DEFAULT_SUBSCRIPTION_PRICES = {
  price75: 75, // Новый тариф API-only
  price150: 150,
  price250: 250,
  price500: 500,
  price1000: 1000,
};

/**
 * Параметры пакетов сообщений
 */
export const DEFAULT_MESSAGE_PACKAGES = {
  messages75: 105, // Количество сообщений для тарифа $75
  messages150: 210, // Количество сообщений для тарифа $150
  messages250: 350, // Количество сообщений для тарифа $250
  messages500: 700, // Количество сообщений для тарифа $500
  messages1000: 1400, // Количество сообщений для тарифа $1000
  usageRate: 80, // % использования сообщений
  carryOverPercentage: 100, // % переноса неиспользованных сообщений
  additionalPrice: 0.30, // Цена за дополнительное сообщение
};

/**
 * Стоимость интеграции и связанные расходы
 */
export const DEFAULT_INTEGRATION_PARAMS = {
  price: 500, // Базовая стоимость интеграции
  cacPercentage: 50, // % от внедрения на CAC
  implementationPercentage: 20, // % от внедрения на имплементацию
  apiCostPercentage: 30, // % от выручки на API
};

/**
 * Декомпозиция CAC (затраты на привлечение клиентов)
 */
export const DEFAULT_CAC_PARAMS = {
  partnerCommissionRate: 40, // % от внедрения на комиссии партнерам
  salesTeamPercentage: 10, // % от выручки на зарплату продаж
  marketingPercentage: 5, // % от внедрения на маркетинг и рекламу
  leadGenerationPerClient: 20, // $ на лид для каждого нового клиента
};

/**
 * Параметры для Upsell (дополнительные продажи)
 */
export const DEFAULT_UPSELL_PARAMS = {
  // 1. Дополнительные боты
  additionalBotsRate: 2, // % клиентов в месяц
  additionalBotsPrice: 100, // Средний чек
  
  // 2. Новые функции
  newFeaturesRate: 1.5, // % клиентов в месяц
  newFeaturesPrice: 75, // Средний чек
  
  // 3. Расширение объема сообщений
  messageExpansionRate: 3, // % клиентов в месяц
  messageExpansionPrice: 50, // Средний чек
  
  // 4. Дополнительные интеграции
  additionalIntegrationsRate: 0.8, // % клиентов в месяц
  additionalIntegrationsPrice: 150, // Средний чек
  
  // Общие параметры (для обратной совместимости)
  monthlyRate: 5, // % клиентов с upsell в месяц (суммарно)
  averageIncrease: 50, // % увеличения подписки при upsell
};

/**
 * Затраты на ФОТ (фонд оплаты труда) по месяцам
 */
export const DEFAULT_FOT_VALUES = {
  optimistic: [500, 1000, 1000, 1700, 1700, 1700, 2700, 2700, 2700, 4000, 4000, 4000],
  pessimistic: [500, 1000, 1000, 2700, 2700, 2700, 4000, 4000, 4000, 6000, 6000, 6000],
  // Декомпозированный ФОТ
  developmentOptimistic: [300, 600, 600, 1000, 1000, 1000, 1600, 1600, 1600, 2400, 2400, 2400],
  developmentPessimistic: [300, 600, 600, 1600, 1600, 1600, 2400, 2400, 2400, 3600, 3600, 3600],
  salesOptimistic: [200, 400, 400, 700, 700, 700, 1100, 1100, 1100, 1600, 1600, 1600],
  salesPessimistic: [200, 400, 400, 1100, 1100, 1100, 1600, 1600, 1600, 2400, 2400, 2400],
};

/**
 * Настройки каналов привлечения клиентов
 */
export const DEFAULT_ACQUISITION_CHANNELS = {
  // Прямые продажи
  directSalesPercentage: 10, // % от выручки на зарплату продаж
  directMarketingPercentage: 5, // % от выручки на маркетинг
  directLeadCost: 30, // $ за лид при прямом привлечении
  
  // Партнёрский канал
  partnerCommissionRate: 40, // % от внедрения партнёрам
  partnerLeadCost: 10, // $ за лид от партнёров
};