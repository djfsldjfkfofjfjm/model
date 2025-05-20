# Анализ проекта Financial Dashboard (Новый)

Дата анализа: 20.05.2025

## 1. Обзор проекта

Проект представляет собой веб-приложение для финансового моделирования SaaS-бизнеса. Пользователь может настраивать различные параметры (цены, затраты, привлечение клиентов, отток и т.д.) и видеть рассчитанные финансовые показатели, представленные в виде таблиц и графиков.

**Технологический стек (предварительно):**
*   React
*   TypeScript
*   Tailwind CSS
*   Вероятно, Recharts для графиков (судя по импортам в `FinancialDashboard.tsx`)

## 2. Структура проекта (на основе прочитанных файлов)

*   **`src/App.tsx`**: Корневой компонент. Оборачивает `FinancialDashboard` в `FinancialProvider`.
*   **`src/components/FinancialDashboard.tsx`**: Основной UI-компонент дашборда.
    *   Отвечает за рендеринг вкладок (`dashboard`, `settings`, `clients`, `fot`, `upsell`).
    *   Отображает различные панели и графики в зависимости от активной вкладки.
    *   Использует `useFinancialContext` для доступа к данным (`monthlyData`, `totalData`, `activeTab`) и функции `setActiveTab`.
    *   Импортирует:
        *   Панели: `SettingsPanel`, `ClientsEditor`, `FOTEditor`, `KeyMetricsPanel`, `UpsellSettingsPanel`.
        *   Графики: `RevenueChart`, `ClientsChart`, `KPIRadarChart`.
        *   Хук: `useFormatting`.
        *   Константы: `theme`.
*   **`src/contexts/FinancialContext.tsx`**: Центральное хранилище состояния и логики обновления.
    *   Предоставляет `FinancialContext` с помощью `createContext`.
    *   `FinancialProvider` содержит:
        *   Состояние для всех параметров модели (налоги, ФОТ, API, отток, клиенты, цены, сообщения, интеграция, CAC, Upsell) с использованием `useState` и инициализацией из `DEFAULT_VALUES`.
        *   Функции-сеттеры для каждого параметра. **Каждый сеттер вызывает `calculateFinancialModel()` с `setTimeout(..., 0)` после обновления состояния.**
        *   Состояние для активной вкладки `activeTab`.
        *   Экземпляр `useFinancialModel` для получения `monthlyData`, `totalData` и `calculateFinancialModel`.
        *   `useEffect` с пустым массивом зависимостей и комментарием `eslint-disable-next-line react-hooks/exhaustive-deps` для первоначального вызова `calculateFinancialModel()`.
*   **`src/hooks/useFinancialModel.ts`**: Кастомный хук, инкапсулирующий логику расчетов.
    *   Принимает `params: FinancialModelParams`, `clients: ClientsData`, `upsellSettings: UpsellSettings`.
    *   Содержит функцию `calculateFinancialModel`, обернутую в `useCallback` с зависимостями `[clients, params, upsellSettings]`.
    *   Внутри `calculateFinancialModel`:
        *   Цикл по 12 месяцам.
        *   Расчет активных клиентов, оттока.
        *   Расчет доходов: интеграция, подписка (по тарифам), дополнительные сообщения (с учетом переноса), Upsell (декомпозирован на 4 типа).
        *   Расчет расходов: API (от `subscriptionRevenue + additionalMessagesRevenue`), CAC (партнеры, продажи, маркетинг, лидогенерация), имплементация (с `maxImplementationCost`), ФОТ (из `DEFAULT_FOT_VALUES` в зависимости от `fotMode`).
        *   Расчет прибыли: валовая, налоги (от `grossProfit`, если он `> 0`), чистая.
        *   Расчет NRR (для `month > 0` и `previousMonthMRR > 0`).
        *   Расчет ARPU.
        *   Накопление итоговых показателей.
    *   Возвращает `monthlyData`, `totalData`, `calculateFinancialModel`.
*   **`src/types/FinancialTypes.ts`**: Определения TypeScript типов для данных модели, параметров, клиентов, настроек Upsell.
    *   `MonthlyData`: содержит множество полей, часть из них опциональные (`?`).
    *   `TotalData`: также содержит опциональные поля.
*   **`src/constants/DefaultValues.ts`**: Значения по умолчанию для всех параметров модели, налоговых ставок, ФОТ.

## 3. Управление состоянием и поток данных (предварительно)

*   Состояние модели централизовано в `FinancialContext.tsx`.
*   Изменение любого параметра модели через сеттеры в контексте приводит к асинхронному (через `setTimeout`) вызову `calculateFinancialModel` из хука `useFinancialModel.ts`.
*   `useFinancialModel.ts` пересчитывает всю модель и обновляет `monthlyData` и `totalData` в своем состоянии.
*   Компоненты, использующие `useFinancialContext`, получают обновленные `monthlyData` и `totalData` и перерисовываются.

## 4. Ключевые расчеты (сосредоточены в `useFinancialModel.ts`)

*   **Клиентская база**: Приток по тарифам, отток (`churnRate`), активные клиенты.
*   **Доходы**:
    *   Интеграция: `totalNewClients * integrationPrice`.
    *   Подписка: Сумма по тарифам (`activeClients_N * subscriptionPrice_N`).
    *   Доп. сообщения: Учитывают `messageUsageRate`, `carryOverPercentage`, `additionalMessagePrice`.
    *   Upsell: 4 типа, каждый со своей ставкой и средним чеком, от `totalActiveClients`.
*   **Расходы**:
    *   API: `% от (subscriptionRevenue + additionalMessagesRevenue)`.
    *   CAC:
        *   Партнеры: `% от integrationRevenue`.
        *   Продажи: `% от totalRevenue`.
        *   Маркетинг: `% от integrationRevenue`.
        *   Лидогенерация: `сумма_на_клиента * totalNewClients`.
    *   Имплементация: `% от integrationPrice`, но не более `maxImplementationCost`.
    *   ФОТ: Из констант, зависит от `fotMode`.
*   **Прибыль**:
    *   Валовая: `totalRevenue - totalExpenses`.
    *   Налоги: `grossProfit * taxRate` (если `grossProfit > 0`). Ставка зависит от `taxMode`.
    *   Чистая: `grossProfit - tax`.
*   **KPI**: ARPU, NRR, LTV (`avgArpu * 36`), CAC на клиента, LTV/CAC, период окупаемости CAC, маржа прибыли.

## 5. Потенциальные проблемные места и вопросы для исследования (на основе прочитанных файлов)

1.  **Асинхронный пересчет модели**:
    *   Использование `setTimeout(calculateFinancialModel, 0)` в каждом сеттере параметров в `FinancialContext.tsx`. Это может привести к:
        *   Нескольким последовательным пересчетам, если несколько параметров обновляются быстро (хотя React может батчить обновления состояния).
        *   Возможным гонкам состояний или использованию неактуальных данных, если `calculateFinancialModel` не является чистой функцией или имеет побочные эффекты, зависящие от внешнего состояния, которое может измениться между вызовом `setTimeout` и фактическим выполнением функции.
    *   Рекомендация: Заменить на `useEffect` в `FinancialContext.tsx`, который бы зависел от всех параметров модели и вызывал `calculateFinancialModel` синхронно при их изменении.
2.  **Зависимости `useEffect` и `useCallback`**:
    *   В `FinancialContext.tsx`: `useEffect` для первоначального расчета имеет `eslint-disable-next-line react-hooks/exhaustive-deps`. Хотя `calculateFinancialModel` передается из хука `useFinancialModel` и там обернута в `useCallback`, стоит проверить, все ли зависимости `calculateFinancialModel` (т.е. `clients`, `params`, `upsellSettings`) стабильны и не пересоздаются без необходимости при каждом рендере `FinancialProvider`. Если они пересоздаются, то и `calculateFinancialModel` будет новой функцией при каждом рендере, что может привести к лишним вызовам `useEffect`.
    *   В `useFinancialModel.ts`: `calculateFinancialModel` зависит от `clients`, `params`, `upsellSettings`. Если эти объекты мутируются или пересоздаются неаккуратно в `FinancialContext.tsx` (например, при обновлении одного поля пересоздается весь объект), это приведет к пересозданию `calculateFinancialModel` и потенциально лишним пересчетам.
3.  **Логика расчетов (требует сверки с бизнес-требованиями)**:
    *   **Налоги**: Расчет от `grossProfit` (если `>0`) выглядит корректным для налога на прибыль.
    *   **API Costs**: База (`subscriptionRevenue + additionalMessagesRevenue`) выглядит логичной.
    *   **Sales Team Costs**: База (`totalRevenue`) – нужно проверить, соответствует ли это бизнес-логике (обычно от выручки с продаж или подписок).
    *   **Округления**: `Math.round` используется для оттока клиентов и клиентов Upsell. Убедиться, что это не приводит к значительным искажениям.
    *   **Деление на ноль**: Проверки на деление на ноль есть для ARPU, LTV/CAC, CAC Payback. Нужно проверить все места деления.
    *   **LTV**: Период 36 месяцев для LTV (`avgArpu * 36`) является допущением.
    *   **NRR**: Формула `((previousMonthMRR + expansionRevenue - churnedRevenue) / previousMonthMRR) * 100` выглядит стандартной. `expansionRevenue` здесь это `upsellRevenue`. `churnedRevenue` рассчитывается на основе оттока клиентов и их цен.
4.  **Типизация**:
    *   Наличие опциональных полей (`?`) в `MonthlyData` и `TotalData` (например, `churnedClients`, `arpu`, `nrr`). Это означает, что в коде, использующем эти данные (например, в компонентах графиков или панелей), должны быть проверки на `undefined` перед использованием этих значений. Отсутствие таких проверок может привести к ошибкам времени выполнения.
5.  **Производительность**:
    *   Частые пересчеты всей модели при изменении любого параметра могут быть неэффективны, особенно если модель сложная или данных много (хотя здесь всего 12 месяцев). Если панели редактирования (например, `ClientsEditor`, `FOTEditor`) содержат много ячеек, каждое изменение в ячейке будет триггерить полный пересчет.
6.  **Структура объектов параметров**:
    *   В `FinancialContext.tsx` параметры `modelParams`, `clientsData`, `upsellSettings` собираются из множества отдельных `useState` переменных перед передачей в `useFinancialModel`. Это может приводить к частому пересозданию этих объектов, даже если изменилось только одно поле, что, в свою очередь, вызовет пересоздание функции `calculateFinancialModel` в хуке `useFinancialModel` (из-за изменения зависимостей `useCallback`).
    *   Рекомендация: Рассмотреть возможность хранения `modelParams`, `clientsData`, `upsellSettings` как единых объектов состояния в `FinancialContext.tsx` и обновлять их поля более аккуратно (например, с использованием `useReducer` или создавая новый объект только при реальном изменении данных).

## 6. Дальнейшие шаги для поиска багов

1.  **Чтение кода компонентов**:
    *   **Прочитаны панели**:
        *   `SettingsPanel.tsx`: Позволяет изменять основные параметры модели (налоговый режим, режим ФОТ, цены подписок, стоимость интеграции, CAC, Churn Rate). Использует `EditableCell` и ползунки. Налоговые ставки фиксированы, меняется только режим.
        *   `ClientsEditor.tsx`: Таблица для редактирования новых клиентов по тарифам и месяцам. Использует `EditableCell`. При изменении значения в ячейке пересоздается массив клиентов и запускается полный пересчет модели.
        *   `FOTEditor.tsx`: Таблица для редактирования ФОТ (оптимистичный/пессимистичный сценарии). **Обнаружена проблема**: функции для сохранения изменений (`setFotOptimistic`, `setFotPessimistic`) являются заглушками. Редактирование ФОТ не работает, значения всегда берутся из `DEFAULT_FOT_VALUES`.
        *   `KeyMetricsPanel.tsx`: Отображает ключевые метрики из `totalData` с использованием `MetricCard`. **Обнаружена проблема**: Используются поля `totalData.roi`, `totalData.finalActiveClients`, `totalData.totalChurnedClients`, `totalData.churnRate`, `totalData.implementationMargin`, `totalData.breakevenMonth`, которые не рассчитываются в `useFinancialModel.ts` и отсутствуют в типе `TotalData`. Это приведет к некорректному отображению этих метрик.
        *   `UpsellSettingsPanel.tsx`: Позволяет настраивать параметры для 4 типов Upsell. Использует `EditableCell`. Отображает итоговые доходы по каждому типу Upsell. **Обнаружена проблема**: Используются поля `totalData.totalAdditionalBotsRevenue`, `totalData.totalNewFeaturesRevenue`, `totalData.totalMessageExpansionRevenue`, `totalData.totalAdditionalIntegrationsRevenue`, которые не рассчитываются в `useFinancialModel.ts` и отсутствуют в типе `TotalData`. Это приведет к некорректному отображению этих доходов.
    *   **Прочитаны общие компоненты**:
        *   `EditableCell.tsx`: Компонент `input type="number"` для редактируемых ячеек с валидацией `min`/`max`.
        *   `InfoTooltip.tsx`: Компонент для отображения информационных подсказок при наведении.
        *   `MetricCard.tsx`: Компонент для отображения метрик в виде карточек. Использует `InfoTooltip`. Принимает функцию форматирования `formatValue`, по умолчанию форматирует числа как USD.
    *   **Прочитаны хуки**:
        *   `useFormatting.ts`: Предоставляет функции `currency`, `percent`, `number` для форматирования значений. Использует `FormatOptions.ts`.
    *   **Прочитаны константы**:
        *   `FormatOptions.ts`: Содержит опции и функции для форматирования валюты (USD, `ru-RU`, без дробной части), процентов (`ru-RU`, 1 знак после запятой), чисел (`ru-RU`, без дробной части). Возвращает дефолтные значения, если входные данные не являются числами.
    *   **Прочитаны компоненты графиков**:
        *   `RevenueChart.tsx`: Отображает график доходов (интеграция, подписка, доп. сообщения) и накопленной прибыли с использованием `AreaChart` из `recharts`. **Обнаружена проблема**: Используется поле `monthlyData[].cumulativeProfit`, которое не рассчитывается в `useFinancialModel.ts` и отсутствует в типе `MonthlyData` (там есть опциональное `cumulativeProfit`, но оно не заполняется).
        *   `ClientsChart.tsx`: Отображает график активных клиентов по тарифам (или общее количество) с использованием `AreaChart` из `recharts`. Данные `activeClients*` и `totalActiveClients` корректно рассчитываются и присутствуют в `monthlyData`.
        *   `KPIRadarChart.tsx`: Отображает радарную диаграмму KPI (ROI, NRR, Маржа внедрения, CAC Payback, Удержание клиентов). **Обнаружена проблема**: Используются поля `totalData.roi`, `totalData.nrr`, `totalData.implementationMargin`, `totalData.cacPaybackPeriod`, которые не рассчитываются в `useFinancialModel.ts` и отсутствуют в типе `TotalData`. Это приведет к некорректному отображению этих KPI.
    *   **Все основные компоненты UI и логики прочитаны.**
2.  **Статический анализ**:
    *   **ESLint (`npx eslint src --ext .ts,.tsx`)**:
        *   Выявлено 45 проблем: 2 ошибки и 43 предупреждения.
        *   **Ошибки в тестах**: 2 ошибки `testing-library/no-wait-for-multiple-assertions` в `src/tests/SettingsGraphsInteraction.test.tsx`.
        *   **Предупреждения**: В основном связаны с неиспользуемыми импортами и переменными, особенно в устаревшем файле `src/FinancialDashboard.tsx`. Есть также несколько неиспользуемых импортов/переменных в актуальных файлах (`src/components/FinancialDashboard.tsx`, `src/hooks/useFinancialModel.ts`). Одно предупреждение `react-hooks/exhaustive-deps` в `src/FinancialDashboard.tsx` (устаревший файл).
    *   **TypeScript (`npx tsc --noEmit`)**:
        *   Команда выполнилась без ошибок. Это указывает на отсутствие явных ошибок типизации с точки зрения компилятора. Однако это не исключает логических ошибок, связанных с использованием опциональных или неинициализированных полей.
3.  **Детальный анализ логики расчетов**: Внимательно пройти по формулам в `useFinancialModel.ts`, сравнивая их с ожидаемой бизнес-логикой и проверяя на граничные условия. Особое внимание уделить тому, что ФОТ всегда берется из констант, и что **многие ключевые метрики, отображаемые в UI (`KeyMetricsPanel`, `RevenueChart`, `KPIRadarChart`, `UpsellSettingsPanel`), не рассчитываются или отсутствуют в данных.**
4.  **Проверка использования опциональных типов и отсутствующих полей**: Искать в коде компонентов места, где используются опциональные поля из `MonthlyData` и `TotalData`, и убедиться в наличии проверок на `undefined`. **Критически важно проверить все использования полей `totalData` и `monthlyData`, которые были отмечены как отсутствующие или не рассчитываемые.**
5.  **Анализ производительности**: Оценить, как часто происходят пересчеты модели при взаимодействии с UI, особенно в панелях с множеством редактируемых полей.

Этот документ будет обновляться по мере получения новой информации.
