import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App'; // Импортируем главный компонент приложения

// Вспомогательная функция для получения текстового содержимого элемента по testId
const getTextByTestId = (testId: string): string | null => {
  const element = screen.queryByTestId(testId);
  return element ? element.textContent : null;
};

describe('Settings and Graphs Interaction (Real Components)', () => {
  test('changing tax mode in SettingsPanel updates relevant displays', async () => {
    render(<App />);
    // Дождемся появления основного заголовка, чтобы убедиться, что приложение загрузилось
    await screen.findByText('Финансовая модель'); 

    // Переключаемся на вкладку "Настройки"
    const settingsTabButton = screen.getByText('Настройки');
    fireEvent.click(settingsTabButton);

    // Дождемся появления элемента из SettingsPanel, чтобы убедиться, что вкладка загрузилась
    // Например, заголовка "Параметры финансовой модели" или одной из кнопок
    await screen.findByText('Параметры финансовой модели');

    // Начальное состояние (оптимистичный режим по умолчанию)
    // Предположим, что SettingsPanel содержит кнопки с data-testid
    // и какой-то элемент отображает текущий режим (например, в KeyMetricsPanel или заголовке)
    // Для этого теста нам нужно убедиться, что изменение режима влияет на что-то видимое.
    // Поскольку прямого отображения taxMode в MetricCard нет, проверим, что кнопка активна.
    
    const optimisticButton = screen.getByTestId('btn-tax-optimistic'); // Предполагаемый testId
    const pessimisticButton = screen.getByTestId('btn-tax-pessimistic'); // Предполагаемый testId

    // Проверяем, что оптимистичная кнопка активна (или имеет определенный стиль)
    // Это потребует добавления классов или атрибутов в SettingsPanel для отражения активного состояния
    // Например, класс 'active' или aria-pressed='true'
    // Пока что просто кликнем и проверим, что нет ошибок.
    // Более детальные проверки потребуют доработки компонентов для тестируемости.

    expect(optimisticButton).toHaveClass('bg-indigo-500'); // Пример проверки активного класса

    // Изменяем режим на пессимистичный
    fireEvent.click(pessimisticButton);

    await waitFor(() => {
      expect(pessimisticButton).toHaveClass('bg-indigo-500');
    });
    await waitFor(() => {
      expect(optimisticButton).not.toHaveClass('bg-indigo-500');
    });

    // Возвращаем режим обратно на оптимистичный
    fireEvent.click(optimisticButton);

    await waitFor(() => {
      expect(optimisticButton).toHaveClass('bg-indigo-500');
    });
    await waitFor(() => {
      expect(pessimisticButton).not.toHaveClass('bg-indigo-500');
    });
  });

  test('changing churn rate in SettingsPanel updates a relevant metric (e.g., LTV/CAC if calculated)', async () => {
    render(<App />);
    // Дождемся появления основного заголовка
    await screen.findByText('Финансовая модель');

    // Переключаемся на вкладку "Настройки"
    const settingsTabButton = screen.getByText('Настройки');
    fireEvent.click(settingsTabButton);
    await screen.findByText('Параметры финансовой модели');

    // Найдем поле для ввода Churn Rate в SettingsPanel
    // Предположим, у EditableCell для churnRate есть родительский элемент с testId
    // или сам input имеет уникальный идентификатор.
    // Для простоты, предположим, что EditableCell для churnRate имеет input с testId="input-churnRate"
    // Это потребует добавления data-testid в EditableCell или SettingsPanel
    
    // Найдем поле для ввода Churn Rate в SettingsPanel
    const churnInput = screen.getByTestId('input-churnRate') as HTMLInputElement;
    expect(churnInput).toBeInTheDocument();

    // Переключимся на вкладку Дашборд, чтобы видеть KeyMetricsPanel
    const dashboardTabButton = screen.getByText('Дашборд');
    fireEvent.click(dashboardTabButton);
    
    // Дождемся появления нужной MetricCard
    const finalActiveClientsCard = await screen.findByTestId('metric-finalActiveClients'); 
    // Используем within для поиска внутри конкретной карточки
    const { getByTestId: getByTestIdInCard } = within(finalActiveClientsCard);
    const finalActiveClientsValueElement = getByTestIdInCard('value');
    expect(finalActiveClientsValueElement).toBeInTheDocument();
    
    const initialFinalActiveClientsText = finalActiveClientsValueElement!.textContent;

    // Снова переключаемся на вкладку "Настройки" для изменения churnRate
    fireEvent.click(settingsTabButton);
    await screen.findByText('Параметры финансовой модели');
    
    // Изменяем churn rate на другое значение (например, 10%)
    fireEvent.change(churnInput, { target: { value: '10' } });

    // Переключаемся обратно на Дашборд
    fireEvent.click(dashboardTabButton);
    await screen.findByText('Выручка и прибыль');
    
    // Проверяем, что значение метрики "Клиентов всего" изменилось
    // Используем waitFor, так как обновление может быть асинхронным
    await waitFor(async () => { 
      const updatedFinalActiveClientsCard = await screen.findByTestId('metric-finalActiveClients');
      const { getByTestId: getByTestIdInUpdatedCard } = within(updatedFinalActiveClientsCard);
      const updatedFinalActiveClientsValueElement = getByTestIdInUpdatedCard('value');
      expect(updatedFinalActiveClientsValueElement!.textContent).not.toBe(initialFinalActiveClientsText);
    });

    // Вернем churn rate к исходному значению для чистоты (если нужно для других тестов)
    // fireEvent.click(settingsTabButton);
    // await screen.findByText('Параметры финансовой модели');
    // fireEvent.change(churnInput, { target: { value: '2' } }); // Предполагаем, что начальное значение было 2
  });

  // TODO: Добавить тесты для ClientsEditor и других взаимодействий,
  // когда компоненты будут доработаны для лучшей тестируемости (например, добавлены data-testid)
  // и все расчеты будут корректны.

  test('changing FOT value in FOTEditor updates totalExpenses metric', async () => {
    render(<App />);
    await screen.findByText('Финансовая модель');

    // Переключаемся на вкладку "ФОТ"
    const fotTabButton = screen.getByText('ФОТ');
    fireEvent.click(fotTabButton);
    await screen.findByText('Оптимистичный вариант'); // Убедимся, что FOTEditor загрузился

    // Находим EditableCell для первого месяца оптимистичного ФОТ
    const fotOptimisticMonth0Input = screen.getByTestId('fot-optimistic-month-0') as HTMLInputElement;
    const initialFotValue = fotOptimisticMonth0Input.value;

    // Переключаемся на Дашборд, чтобы получить начальное значение totalExpenses
    const dashboardTabButton = screen.getByText('Дашборд');
    fireEvent.click(dashboardTabButton);
    
    // Дождемся появления нужной MetricCard
    const totalExpensesCard = await screen.findByTestId('metric-totalExpenses');
    const { getByTestId: getByTestIdInExpensesCard } = within(totalExpensesCard);
    const initialTotalExpensesText = getByTestIdInExpensesCard('value').textContent;

    // Возвращаемся на вкладку "ФОТ"
    fireEvent.click(fotTabButton);
    await screen.findByText('Оптимистичный вариант');

    // Изменяем значение ФОТ для первого месяца
    const newFotValue = Number(initialFotValue) + 500;
    fireEvent.change(fotOptimisticMonth0Input, { target: { value: newFotValue.toString() } });

    // Переключаемся на Дашборд
    fireEvent.click(dashboardTabButton);
    await screen.findByText('Общий доход');
    
    // Проверяем, что значение totalExpenses изменилось
    await waitFor(async () => {
      const updatedTotalExpensesCard = await screen.findByTestId('metric-totalExpenses');
      const { getByTestId: getByTestIdInUpdatedCard } = within(updatedTotalExpensesCard);
      expect(getByTestIdInUpdatedCard('value').textContent).not.toBe(initialTotalExpensesText);
    });
  });
});
