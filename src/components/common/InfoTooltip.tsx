import React, { useState } from 'react';

/**
 * Интерфейс свойств компонента InfoTooltip
 */
export interface InfoTooltipProps {
  /** Текст подсказки */
  text: string;
  /** Дополнительные CSS классы */
  className?: string;
  /** Позиция подсказки (по умолчанию 'top') */
  position?: 'top' | 'right' | 'bottom' | 'left';
  /** Цвет иконки */
  iconColor?: string;
  /** Цвет фона подсказки */
  backgroundColor?: string;
  /** Цвет текста подсказки */
  textColor?: string;
}

/**
 * Компонент информационной подсказки, отображаемой при наведении
 */
const InfoTooltip: React.FC<InfoTooltipProps> = ({ 
  text, 
  className = "",
  position = 'top',
  iconColor = "text-gray-400 hover:text-gray-600",
  backgroundColor = "bg-gray-800",
  textColor = "text-white"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Определяем классы позиционирования в зависимости от position
  const getPositionClasses = () => {
    switch (position) {
      case 'right':
        return '-top-2 left-6';
      case 'bottom':
        return 'top-6 left-0';
      case 'left':
        return '-top-2 right-6';
      case 'top':
      default:
        return '-top-2 left-6 transform -translate-y-full';
    }
  };

  // Определяем классы для указателя (треугольника) в зависимости от position
  const getArrowClasses = () => {
    switch (position) {
      case 'right':
        return 'absolute w-3 h-3 transform rotate-45 -left-1.5 top-3';
      case 'bottom':
        return 'absolute w-3 h-3 transform rotate-45 top-1.5 left-3';
      case 'left':
        return 'absolute w-3 h-3 transform rotate-45 -right-1.5 top-3';
      case 'top':
      default:
        return 'absolute w-3 h-3 transform rotate-45 -bottom-1.5 left-3';
    }
  };
  
  return (
    <div className={`relative inline-block ${className}`} data-testid="tooltip-container">
      <div
        className="cursor-help ml-1"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        data-testid="tooltip-trigger"
      >
        <svg className={`w-4 h-4 ${iconColor} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      {isVisible && (
        <div 
          className={`absolute z-50 w-64 p-3 ${backgroundColor} ${textColor} text-sm rounded-lg shadow-lg ${getPositionClasses()}`}
          data-testid="tooltip-content"
        >
          <div className={`${backgroundColor} ${getArrowClasses()}`}></div>
          {text}
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;