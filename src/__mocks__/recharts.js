import React from 'react';

// Мокаем только те компоненты, которые реально используются в проекте
// и могут вызывать проблемы в Jest/jsdom.
// На основе анализа кода, это в основном контейнеры и базовые элементы.

const mockRecharts = {
  ...jest.requireActual('recharts'), // Сохраняем оригинальную функциональность для немокаемых частей
  ResponsiveContainer: ({ children }) => <div data-testid="recharts-responsive-container">{children}</div>,
  AreaChart: ({ children }) => <div data-testid="recharts-areachart">{children}</div>,
  RadarChart: ({ children }) => <div data-testid="recharts-radarchart">{children}</div>,
  LineChart: ({ children }) => <div data-testid="recharts-linechart">{children}</div>, // На всякий случай, если где-то используется
  PieChart: ({ children }) => <div data-testid="recharts-piechart">{children}</div>, // На всякий случай
  BarChart: ({ children }) => <div data-testid="recharts-barchart">{children}</div>, // На всякий случай
  ComposedChart: ({ children }) => <div data-testid="recharts-composedchart">{children}</div>, // На всякий случай

  // Простые элементы можно мокать как простые div или React.Fragment,
  // если их внутренняя логика не важна для теста взаимодействия.
  Area: (props) => <div data-testid={`recharts-area-${props.name || props.dataKey}`} />,
  Line: (props) => <div data-testid={`recharts-line-${props.name || props.dataKey}`} />,
  Bar: (props) => <div data-testid={`recharts-bar-${props.name || props.dataKey}`} />,
  Radar: (props) => <div data-testid={`recharts-radar-${props.name || props.dataKey}`} />,
  Pie: (props) => <div data-testid={`recharts-pie-${props.name || props.dataKey}`} />,
  XAxis: (props) => <div data-testid={`recharts-xaxis-${props.dataKey || 'default'}`} />,
  YAxis: (props) => <div data-testid={`recharts-yaxis-${props.dataKey || 'default'}`} />,
  CartesianGrid: () => <div data-testid="recharts-cartesiangrid" />,
  PolarGrid: () => <div data-testid="recharts-polargrid" />,
  PolarAngleAxis: (props) => <div data-testid={`recharts-polarangleaxis-${props.dataKey || 'default'}`} />,
  PolarRadiusAxis: () => <div data-testid="recharts-polarradiusaxis" />,
  Tooltip: () => <div data-testid="recharts-tooltip" />,
  Legend: () => <div data-testid="recharts-legend" />,
  Cell: () => <div data-testid="recharts-cell" />,
  LabelList: () => <div data-testid="recharts-labellist" />,
};

module.exports = mockRecharts;
