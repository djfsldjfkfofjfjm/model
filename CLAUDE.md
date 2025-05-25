# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Описание проекта

Финансовая модель для SaaS-платформы создания чат-ботов. React-приложение позволяющее моделировать финансовые показатели на 12 месяцев с учетом различных тарифных планов (от $75 до $1000), каналов привлечения клиентов (прямые продажи и партнеры), операционных расходов и системы сообщений с накоплением.

## Команды разработки

### Основные команды
- `npm start` - Запуск приложения в режиме разработки (http://localhost:3000)
- `npm test` - Запуск тестов в интерактивном режиме  
- `npm test -- --watchAll=false` - Запуск всех тестов однократно
- `npm test -- --coverage` - Запуск тестов с отчетом о покрытии
- `npm run build` - Сборка продакшн версии
- `npm run eject` - Извлечение конфигурации CRA (необратимо)

### Команды для отдельных тестов
```bash
# Запуск конкретного файла тестов
npm test -- MetricCard.test.tsx

# Запуск тестов с паттерном в названии
npm test -- --testNamePattern="форматирование"

# Запуск в режиме отладки
npm test -- --no-coverage --verbose
```

### Запуск конкретного теста
```bash
npm test -- --testNamePattern="should calculate revenue correctly"
```

### Отладка тестов  
```bash
npm test -- --no-coverage --verbose
```

## Архитектура приложения

### Основные компоненты системы

1. **useFinancialModel Hook** (`src/hooks/useFinancialModel.ts`)
   - Центральная логика всех финансовых расчетов
   - Помесячный расчет доходов, расходов, клиентов
   - Система накопления и переноса сообщений
   - Расчет метрик: ARPU, LTV, CAC, ROI, NRR

2. **FinancialContext** (`src/contexts/FinancialContext.tsx`) 
   - Глобальное состояние приложения через React Context API
   - Управление всеми параметрами модели
   - Автоматический пересчет при изменении параметров

3. **FinancialDashboard** (`src/components/FinancialDashboard.tsx`)
   - Главный компонент с 6-табовой навигацией
   - Живое превью метрик
   - Индикаторы прогресса заполнения

### Навигационная структура (6 табов)

1. **Модель** (`ModelSettingsPanel.tsx`) - базовые параметры
2. **Продукт** (`ProductSettingsPanel.tsx`) - тарифы и сообщения  
3. **Привлечение** (`AcquisitionPanel.tsx`) - клиенты и каналы
4. **Операции** (`OperationsPanel.tsx`) - расходы и команда
5. **Рост** (`GrowthPanel.tsx`) - upsell и дополнительные доходы
6. **Результаты** (`ResultsPanel.tsx`) - аналитика и отчеты

## Ключевые алгоритмы расчетов

### Формула расчета выручки от подписок
```typescript
// Клиенты покупают новый пакет только если накопленных сообщений недостаточно
const buyingClients = needNewPackage ? activeClients : 
  Math.max(0, activeClients - Math.floor(unusedMessages / messagesInPackage));
const subscriptionRevenue = buyingClients * subscriptionPrice;
```

### Система накопления сообщений
- Неиспользованные сообщения переносятся на следующий месяц (100% по умолчанию)
- Ограничение накопления: максимум 3 месяца пакетов
- При превышении лимита клиенты покупают дополнительные сообщения

### Расчет CAC с учетом каналов
```typescript
// Распределение по каналам
const directClients = totalNewClients * (channelDistribution.direct / 100);
const partnerClients = totalNewClients * (channelDistribution.partner / 100);

// CAC включает все расходы на привлечение
CAC = partnerCommissions + directSalesCosts + directMarketingCosts + 
      leadGenerationCosts + implementationCosts;
```

### Ключевые метрики
- **ARPU** = Subscription Revenue / Active Clients
- **LTV** = ARPU × min(1/churnRate, 72 месяцев)
- **CAC Payback** = CAC per Client / ARPU
- **NRR** = (Current MRR + Expansion - Churn) / Previous MRR × 100%
- **ROI** = Net Profit / Total Expenses × 100%

## Важные особенности реализации

### Автоматический пересчет модели
- Все изменения параметров триггерят пересчет через `useEffect` в `FinancialContext`
- Функция `calculateFinancialModel` вызывается при любом изменении зависимостей
- Диагностические логи помогают отслеживать корректность расчетов

### Система валидации
```typescript
// Валидация в useFinancialModel
if (params.churnRate < 0 || params.churnRate > 100) {
  console.warn('Churn rate должен быть от 0 до 100');
}
if (params.churnRate >= 90) {
  console.warn('Очень высокий churn rate может привести к потере всех клиентов!');
}
```

### Обработка граничных случаев
- Защита от деления на ноль в расчетах метрик
- Ограничение LTV максимум 72 месяцами
- Налог считается только с положительной прибыли
- Округление количества клиентов до целых чисел

## Тестирование

### Структура тестов
```
src/__tests__/
├── calculations.test.ts         # Основные финансовые расчеты
├── messages-calculations.test.ts # Система сообщений
├── api-costs-implementation.test.ts # API расходы
├── upsell-calculations.test.ts  # Upsell доходы
├── fot-breakdown.test.ts        # Декомпозиция ФОТ
├── integration.test.tsx         # Интеграционные тесты
├── reactivity.test.tsx          # Реактивность изменений
└── edge-cases.test.ts          # Граничные случаи
```

### Запуск тестов с покрытием
```bash
npm test -- --coverage --watchAll=false
```

## Дефолтные значения и константы

### Тарифы по умолчанию (DefaultValues.ts)
- $75 (105 сообщений) - API-only тариф
- $150 (210 сообщений) - Базовый
- $250 (350 сообщений) - Стандарт  
- $500 (700 сообщений) - Премиум
- $1000 (1400 сообщений) - Корпоративный

### Параметры модели
- Churn rate: 2% в месяц
- API costs: 30% от выручки
- Использование сообщений: 80%
- Перенос неиспользованных: 100%
- Цена доп. сообщения: $0.30

### ФОТ по месяцам (оптимистичный)
[500, 1000, 1000, 1700, 1700, 1700, 2700, 2700, 2700, 4000, 4000, 4000]