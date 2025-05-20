import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InfoTooltip from '../components/common/InfoTooltip'; // Импортируем оригинальный компонент

describe('InfoTooltip Component', () => {
  test('renders tooltip trigger', () => {
    render(<InfoTooltip text="Test tooltip" />);
    
    const tooltipTrigger = screen.getByTestId('tooltip-trigger');
    expect(tooltipTrigger).toBeInTheDocument();
  });

  test('tooltip is not visible by default', () => {
    render(<InfoTooltip text="Test tooltip" />);
    
    const tooltipContent = screen.queryByTestId('tooltip-content');
    expect(tooltipContent).not.toBeInTheDocument();
  });

  test('shows tooltip on mouse enter', () => {
    render(<InfoTooltip text="Test tooltip" />);
    
    const tooltipTrigger = screen.getByTestId('tooltip-trigger');
    fireEvent.mouseEnter(tooltipTrigger);
    
    const tooltipContent = screen.getByTestId('tooltip-content');
    expect(tooltipContent).toBeInTheDocument();
    expect(tooltipContent).toHaveTextContent('Test tooltip');
  });

  test('hides tooltip on mouse leave', () => {
    render(<InfoTooltip text="Test tooltip" />);
    
    const tooltipTrigger = screen.getByTestId('tooltip-trigger');
    
    // Show tooltip
    fireEvent.mouseEnter(tooltipTrigger);
    const tooltipContentVisible = screen.getByTestId('tooltip-content');
    expect(tooltipContentVisible).toBeInTheDocument();
    
    // Hide tooltip
    fireEvent.mouseLeave(tooltipTrigger);
    const tooltipContentHidden = screen.queryByTestId('tooltip-content');
    expect(tooltipContentHidden).not.toBeInTheDocument();
  });

  test('applies custom class name', () => {
    render(<InfoTooltip text="Test tooltip" className="custom-class" />);
    
    const tooltipContainer = screen.getByTestId('tooltip-container');
    expect(tooltipContainer).toHaveClass('custom-class');
  });
});
