import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BulkInput from '../components/common/BulkInput';

describe('BulkInput Component', () => {
  test('applies values on click', () => {
    const handleApply = jest.fn();
    render(<BulkInput count={3} onApply={handleApply} title="test" />);

    // раскрываем textarea
    const button = screen.getByText('test');
    fireEvent.click(button);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '1 2 3' } });

    const applyButton = screen.getByText('Применить');
    fireEvent.click(applyButton);

    expect(handleApply).toHaveBeenCalledWith([1, 2, 3]);
  });
});
