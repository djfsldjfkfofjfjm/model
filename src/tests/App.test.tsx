import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Мок для контекста финансов
jest.mock('../contexts/FinancialContext', () => ({
  FinancialProvider: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="financial-provider">{children}</div>,
  useFinancialContext: () => ({
    totalData: {},
    monthlyData: [],
    activeTab: 'dashboard',
    setActiveTab: jest.fn()
  })
}));

// Мок для компонента FinancialDashboard
jest.mock('../components/FinancialDashboard', () => {
  return function MockFinancialDashboard() {
    return <div data-testid="financial-dashboard">Финансовый дашборд</div>;
  };
});

describe('App Component', () => {
  test('renders App with FinancialProvider', () => {
    render(<App />);
    
    const providerElement = screen.getByTestId('financial-provider');
    expect(providerElement).toBeInTheDocument();
    
    const dashboardElement = screen.getByTestId('financial-dashboard');
    expect(dashboardElement).toBeInTheDocument();
    expect(dashboardElement).toHaveTextContent('Финансовый дашборд');
  });
});