/**
 * Цветовая схема приложения
 */
export const theme = {
  dark: '#0F172A',
  primary: '#6366F1',
  secondary: '#EC4899',
  accent: '#F59E0B',
  success: '#10B981',
  warning: '#FBBF24',
  danger: '#EF4444',
  light: '#F8FAFC',
  darkGray: '#334155',
  mediumGray: '#64748B',
  lightGray: '#E2E8F0',
  background: '#F1F5F9',
  clients: {
    primary: '#6366F1',
    secondary: '#818CF8'
  },
  income: {
    primary: '#10B981',
    secondary: '#34D399'
  },
  profit: {
    primary: '#F59E0B',
    secondary: '#FBBF24'
  },
  tooltipBackground: 'rgba(255, 255, 255, 0.9)'
};

/**
 * Цвета для графиков
 */
export const chartColors = {
  clients: '#6366F1',
  income: '#10B981',
  profit: '#F59E0B',
  expenses: '#EC4899',
  features: '#4F46E5',
  subscription: '#8B5CF6',
  integration: '#14B8A6',
  upsell: '#F97316'
};

/**
 * Градиенты для заполнения областей графика
 */
export const chartGradients = {
  clients: [
    { offset: '5%', stopColor: '#6366F1', stopOpacity: 0.8 },
    { offset: '95%', stopColor: '#6366F1', stopOpacity: 0.1 }
  ],
  features: [
    { offset: '5%', stopColor: '#4F46E5', stopOpacity: 0.8 },
    { offset: '95%', stopColor: '#4F46E5', stopOpacity: 0.1 }
  ],
  income: [
    { offset: '5%', stopColor: '#10B981', stopOpacity: 0.8 },
    { offset: '95%', stopColor: '#10B981', stopOpacity: 0.1 }
  ],
  profit: [
    { offset: '5%', stopColor: '#F59E0B', stopOpacity: 0.8 },
    { offset: '95%', stopColor: '#F59E0B', stopOpacity: 0.1 }
  ],
  expenses: [
    { offset: '5%', stopColor: '#EC4899', stopOpacity: 0.8 },
    { offset: '95%', stopColor: '#EC4899', stopOpacity: 0.1 }
  ],
  subscription: [
    { offset: '5%', stopColor: '#8B5CF6', stopOpacity: 0.8 },
    { offset: '95%', stopColor: '#8B5CF6', stopOpacity: 0.1 }
  ],
  integration: [
    { offset: '5%', stopColor: '#14B8A6', stopOpacity: 0.8 },
    { offset: '95%', stopColor: '#14B8A6', stopOpacity: 0.1 }
  ],
  upsell: [
    { offset: '5%', stopColor: '#F97316', stopOpacity: 0.8 },
    { offset: '95%', stopColor: '#F97316', stopOpacity: 0.1 }
  ]
};