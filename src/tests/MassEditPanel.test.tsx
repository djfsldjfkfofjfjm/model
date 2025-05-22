import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MassEditPanel from '../components/common/MassEditPanel';

// Мокируем InfoTooltip
jest.mock('../components/common/InfoTooltip', () => (props: { text: string }) => 
  <div data-testid="mock-tooltip">{props.text}</div>
);

describe('MassEditPanel Component', () => {
  const mockOnApply = jest.fn();
  const defaultProps = {
    count: 12,
    onApply: mockOnApply,
    currentValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    title: 'Test Panel',
    min: 0,
    max: 100
  };

  beforeEach(() => {
    mockOnApply.mockClear();
  });

  test('renders with title and current values preview', () => {
    render(<MassEditPanel {...defaultProps} />);
    
    expect(screen.getByText('Test Panel')).toBeInTheDocument();
    expect(screen.getByText(/Текущие: \[1, 2, 3, 4, 5, 6, 7, 8\.\.\.\]/)).toBeInTheDocument();
  });

  test('toggles edit panel when button is clicked', () => {
    render(<MassEditPanel {...defaultProps} />);
    
    const toggleButton = screen.getByText('🔧 Редактировать');
    expect(toggleButton).toBeInTheDocument();
    
    // Панель закрыта изначально
    expect(screen.queryByText('🎯 Пресеты')).not.toBeInTheDocument();
    
    // Открываем панель
    fireEvent.click(toggleButton);
    expect(screen.getByText('🎯 Пресеты')).toBeInTheDocument();
    
    // Закрываем панель
    const closeButton = screen.getByText('🔽 Свернуть');
    fireEvent.click(closeButton);
    expect(screen.queryByText('🎯 Пресеты')).not.toBeInTheDocument();
  });

  test('switches between different modes', () => {
    render(<MassEditPanel {...defaultProps} />);
    
    // Открываем панель
    fireEvent.click(screen.getByText('🔧 Редактировать'));
    
    // По умолчанию режим "Пресеты"
    expect(screen.getByText('Быстрые шаблоны:')).toBeInTheDocument();
    
    // Переключаемся на "Текст"
    fireEvent.click(screen.getByText('✏️ Текст'));
    expect(screen.getByText(/Введите 12 чисел/)).toBeInTheDocument();
    
    // Переключаемся на "Шаблон"
    fireEvent.click(screen.getByText('📈 Шаблон'));
    expect(screen.getByText('Начальное значение')).toBeInTheDocument();
  });

  test('applies preset values', () => {
    render(<MassEditPanel {...defaultProps} />);
    
    // Открываем панель
    fireEvent.click(screen.getByText('🔧 Редактировать'));
    
    // Применяем пресет "Все нули"
    const zeroPreset = screen.getByText('Все нули');
    fireEvent.click(zeroPreset);
    
    expect(mockOnApply).toHaveBeenCalledWith(Array(12).fill(0));
  });

  test('applies text input values', () => {
    render(<MassEditPanel {...defaultProps} />);
    
    // Открываем панель и переключаемся на текстовый режим
    fireEvent.click(screen.getByText('🔧 Редактировать'));
    fireEvent.click(screen.getByText('✏️ Текст'));
    
    // Вводим значения
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '1 2 3 4 5 6 7 8 9 10 11 12' } });
    
    // Применяем
    fireEvent.click(screen.getByText('Применить'));
    
    expect(mockOnApply).toHaveBeenCalledWith([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('validates input count', () => {
    render(<MassEditPanel {...defaultProps} />);
    
    // Мокируем alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Открываем панель и переключаемся на текстовый режим
    fireEvent.click(screen.getByText('🔧 Редактировать'));
    fireEvent.click(screen.getByText('✏️ Текст'));
    
    // Вводим неправильное количество значений
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '1 2 3' } });
    
    // Применяем
    fireEvent.click(screen.getByText('Применить'));
    
    expect(window.alert).toHaveBeenCalledWith('Необходимо 12 значений. Получено: 3');
    expect(mockOnApply).not.toHaveBeenCalled();
    
    // Восстанавливаем alert
    (window.alert as jest.Mock).mockRestore();
  });

  test('generates pattern values', () => {
    render(<MassEditPanel {...defaultProps} />);
    
    // Открываем панель и переключаемся на режим шаблона
    fireEvent.click(screen.getByText('🔧 Редактировать'));
    fireEvent.click(screen.getByText('📈 Шаблон'));
    
    // Устанавливаем параметры: начальное значение 5, шаг 2
    const startInput = screen.getByDisplayValue('0');
    const stepInput = screen.getByDisplayValue('0');
    
    fireEvent.change(startInput, { target: { value: '5' } });
    fireEvent.change(stepInput, { target: { value: '2' } });
    
    // Применяем
    fireEvent.click(screen.getByText('Применить'));
    
    // Ожидаем линейную прогрессию: 5, 7, 9, 11, ...
    const expected = Array.from({length: 12}, (_, i) => 5 + i * 2);
    expect(mockOnApply).toHaveBeenCalledWith(expected);
  });

  test('shows tooltip when provided', () => {
    render(<MassEditPanel {...defaultProps} tooltip="Test tooltip" />);
    
    expect(screen.getByTestId('mock-tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('mock-tooltip')).toHaveTextContent('Test tooltip');
  });

  test('handles JSON input format', () => {
    render(<MassEditPanel {...defaultProps} />);
    
    // Открываем панель и переключаемся на текстовый режим
    fireEvent.click(screen.getByText('🔧 Редактировать'));
    fireEvent.click(screen.getByText('✏️ Текст'));
    
    // Вводим JSON формат
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { 
      target: { value: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]' } 
    });
    
    // Применяем
    fireEvent.click(screen.getByText('Применить'));
    
    expect(mockOnApply).toHaveBeenCalledWith([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('copies current values to clipboard', async () => {
    // Мокируем clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });
    
    // Мокируем alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<MassEditPanel {...defaultProps} />);
    
    // Нажимаем кнопку копирования
    fireEvent.click(screen.getByText('📋 Копировать'));
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12');
      expect(window.alert).toHaveBeenCalledWith('Значения скопированы в буфер обмена');
    });
    
    // Восстанавливаем alert
    (window.alert as jest.Mock).mockRestore();
  });

  test('validates min/max values', () => {
    render(<MassEditPanel {...defaultProps} min={10} max={20} />);
    
    // Открываем панель и переключаемся на текстовый режим
    fireEvent.click(screen.getByText('🔧 Редактировать'));
    fireEvent.click(screen.getByText('✏️ Текст'));
    
    // Вводим значения вне диапазона
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { 
      target: { value: '5 15 25 15 15 15 15 15 15 15 15 15' } 
    });
    
    // Применяем
    fireEvent.click(screen.getByText('Применить'));
    
    // Ожидаем, что значения будут ограничены диапазоном [10, 20]
    expect(mockOnApply).toHaveBeenCalledWith([10, 15, 20, 15, 15, 15, 15, 15, 15, 15, 15, 15]);
  });
});