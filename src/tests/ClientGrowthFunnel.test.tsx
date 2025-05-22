import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientGrowthFunnel from '../components/charts/ClientGrowthFunnel';
import { FinancialProvider } from '../contexts/FinancialContext';

// Мок для Recharts
jest.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />
}));

// Компонент-обертка с контекстом
const ComponentWithProvider = ({ children }: { children: React.ReactNode }) => (
  <FinancialProvider>{children}</FinancialProvider>
);

describe('ClientGrowthFunnel', () => {
  it('отображается корректно', () => {
    render(
      <ComponentWithProvider>
        <ClientGrowthFunnel />
      </ComponentWithProvider>
    );

    // Проверяем наличие заголовка
    expect(screen.getByText(/воронка роста клиентской базы/i)).toBeInTheDocument();
  });

  it('отображает секцию интенсивности по тарифам', () => {
    render(
      <ComponentWithProvider>
        <ClientGrowthFunnel />
      </ComponentWithProvider>
    );

    // Проверяем наличие секции тепловой карты
    expect(screen.getByText(/интенсивность по тарифам/i)).toBeInTheDocument();
  });

  it('отображает график динамики роста', () => {
    render(
      <ComponentWithProvider>
        <ClientGrowthFunnel />
      </ComponentWithProvider>
    );

    // Проверяем наличие секции графика
    expect(screen.getByText(/динамика роста по месяцам/i)).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('отображает итоговые метрики', () => {
    render(
      <ComponentWithProvider>
        <ClientGrowthFunnel />
      </ComponentWithProvider>
    );

    // Проверяем наличие метрик
    expect(screen.getByText(/всего привлечено/i)).toBeInTheDocument();
    expect(screen.getByText(/активных сейчас/i)).toBeInTheDocument();
    expect(screen.getByText(/потеряно клиентов/i)).toBeInTheDocument();
    expect(screen.getByText(/общее удержание/i)).toBeInTheDocument();
  });

  it('поддерживает интерактивность тарифов', () => {
    render(
      <ComponentWithProvider>
        <ClientGrowthFunnel />
      </ComponentWithProvider>
    );

    // Ищем тарифные планы
    const tariffElements = screen.getAllByText(/\$\d+/);
    expect(tariffElements.length).toBeGreaterThan(0);

    // Можно добавить тест клика, если элементы кликабельны
    if (tariffElements[0]) {
      fireEvent.click(tariffElements[0]);
      // Дополнительные проверки после клика
    }
  });

  it('поддерживает кастомные пропсы', () => {
    const customTitle = 'Кастомная воронка';
    render(
      <ComponentWithProvider>
        <ClientGrowthFunnel title={customTitle} height={300} />
      </ComponentWithProvider>
    );

    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });
});