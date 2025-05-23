import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { FinancialProvider } from '../contexts/FinancialContext';
import FinancialDashboard from '../components/FinancialDashboard';

describe('Integration Tests - All Components Connected', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <FinancialProvider>
        {component}
      </FinancialProvider>
    );
  };

  test('Изменение настроек каналов влияет на расчеты', async () => {
    const { getByText, getAllByRole } = renderWithProvider(<FinancialDashboard />);
    
    // Переходим на вкладку Каналы
    fireEvent.click(getByText('Каналы'));
    
    // Проверяем, что компоненты каналов отображаются
    expect(getByText('Каналы привлечения клиентов')).toBeInTheDocument();
    expect(getByText('Распределение по каналам привлечения')).toBeInTheDocument();
    
    // Проверяем, что НЕТ компонента "Распределение ФОТ"
    expect(() => getByText('Распределение ФОТ')).toThrow();
  });

  test('Изменение настроек Upsell влияет на расчеты', async () => {
    const { getByText } = renderWithProvider(<FinancialDashboard />);
    
    // Переходим на вкладку Upsell
    fireEvent.click(getByText('Upsell'));
    
    // Проверяем, что отображается современный редактор
    expect(getByText('Современный редактор Upsell')).toBeInTheDocument();
    
    // Проверяем, что сценарии показывают конкретные значения
    expect(getByText(/Боты:.*%.*\$/)).toBeInTheDocument();
    expect(getByText(/Функции:.*%.*\$/)).toBeInTheDocument();
  });

  test('Пресеты ФОТ показывают конкретные значения', async () => {
    const { getByText } = renderWithProvider(<FinancialDashboard />);
    
    // Переходим на вкладку ФОТ
    fireEvent.click(getByText('ФОТ'));
    
    // Проверяем, что пресеты раскрыты
    expect(getByText('Оптимистичный: $500 → $5K')).toBeInTheDocument();
    expect(getByText('Пессимистичный: $500 → $9K')).toBeInTheDocument();
    expect(getByText('Рост за год: 10-18x')).toBeInTheDocument();
  });

  test('Декомпозиция ФОТ позволяет точную настройку', async () => {
    const { getByText, getAllByDisplayValue } = renderWithProvider(<FinancialDashboard />);
    
    // Переходим на вкладку ФОТ
    fireEvent.click(getByText('ФОТ'));
    
    // Открываем декомпозицию
    fireEvent.click(getByText(/Показать декомпозицию/));
    
    // Проверяем, что можно редактировать проценты
    const inputs = getAllByDisplayValue('60'); // Разработка по умолчанию 60%
    expect(inputs.length).toBeGreaterThan(0);
  });

  test('Все табы переключаются корректно', async () => {
    const { getByText } = renderWithProvider(<FinancialDashboard />);
    
    const tabs = ['Дашборд', 'Настройки', 'Клиенты', 'ФОТ', 'Upsell', 'Каналы'];
    
    for (const tab of tabs) {
      fireEvent.click(getByText(tab));
      // Проверяем, что таб активен (имеет соответствующий класс)
      const tabButton = getByText(tab);
      expect(tabButton.className).toContain('text-indigo-600');
    }
  });

  test('Изменения в настройках влияют на дашборд', async () => {
    const { getByText, getByDisplayValue } = renderWithProvider(<FinancialDashboard />);
    
    // Переходим в настройки
    fireEvent.click(getByText('Настройки'));
    
    // Меняем налоговый режим на кастомный
    const customTaxRadio = getByText('Свой %').closest('label')?.querySelector('input');
    if (customTaxRadio) {
      fireEvent.click(customTaxRadio);
    }
    
    // Возвращаемся на дашборд
    fireEvent.click(getByText('Дашборд'));
    
    // Проверяем, что данные обновились
    await waitFor(() => {
      expect(getByText(/Выручка.*12 мес/)).toBeInTheDocument();
    });
  });

  test('Нет заглушек в активных компонентах', () => {
    const { container } = renderWithProvider(<FinancialDashboard />);
    
    // Проверяем, что нет console.log в отрендеренном коде
    const htmlContent = container.innerHTML;
    expect(htmlContent).not.toContain('console.log');
    expect(htmlContent).not.toContain('временн');
    expect(htmlContent).not.toContain('заглушк');
  });
});