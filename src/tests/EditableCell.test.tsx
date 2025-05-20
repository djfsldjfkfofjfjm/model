import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditableCell from '../components/common/EditableCell'; // Импортируем оригинальный компонент

describe('EditableCell Component', () => {
  test('renders with initial value', () => {
    render(<EditableCell value={50} onChange={jest.fn()} data-testid="editable-cell" />);
    
    const input = screen.getByTestId('editable-cell') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('50');
  });

  test('calls onChange with valid value', () => {
    const handleChange = jest.fn();
    render(<EditableCell value={50} onChange={handleChange} min={0} max={100} data-testid="editable-cell" />);
    
    const input = screen.getByTestId('editable-cell');
    fireEvent.change(input, { target: { value: '75' } });
    
    expect(handleChange).toHaveBeenCalledWith(75);
  });

  test('does not call onChange with value below min', () => {
    const handleChange = jest.fn();
    render(<EditableCell value={50} onChange={handleChange} min={10} max={100} data-testid="editable-cell" />);
    
    const input = screen.getByTestId('editable-cell');
    fireEvent.change(input, { target: { value: '5' } });
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  test('does not call onChange with value above max', () => {
    const handleChange = jest.fn();
    render(<EditableCell value={50} onChange={handleChange} min={0} max={100} data-testid="editable-cell" />);
    
    const input = screen.getByTestId('editable-cell');
    fireEvent.change(input, { target: { value: '150' } });
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  test('uses custom step value', () => {
    render(<EditableCell value={50} onChange={jest.fn()} min={0} max={100} step={0.5} data-testid="editable-cell" />);
    
    const input = screen.getByTestId('editable-cell') as HTMLInputElement;
    expect(input.step).toBe('0.5');
  });

  test('applies data-testid to the input element', () => {
    const testId = "my-custom-editable-cell";
    render(<EditableCell value={10} onChange={jest.fn()} data-testid={testId} />);
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });
});
