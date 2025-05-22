import React from 'react';
import { useFinancialContext } from '../../contexts/FinancialContext';

/**
 * Интерфейс свойств компонента QuickModelPresets
 */
export interface QuickModelPresetsProps {
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Готовые сценарии финансовой модели
 */
interface ModelPreset {
  name: string;
  description: string;
  icon: string;
  details: {
    clients: {
      total: string;
      pattern: string;
    };
    fot: {
      range: string;
      growth: string;
    };
    upsell: {
      rates: string;
      focus: string;
    };
    special: string[];
  };
  apply: (context: ReturnType<typeof useFinancialContext>) => void;
}

/**
 * Компонент быстрых пресетов для финансовой модели
 */
const QuickModelPresets: React.FC<QuickModelPresetsProps> = ({ 
  className = "" 
}) => {
  const context = useFinancialContext();

  const presets: ModelPreset[] = [
    {
      name: "Консервативный старт",
      description: "Медленный рост, минимальные расходы на ФОТ",
      icon: "🐢",
      details: {
        clients: {
          total: "32 клиента за год",
          pattern: "Постепенный рост: 1→4 новых клиентов/мес"
        },
        fot: {
          range: "$300-3000 (опт) / $500-4000 (песс)",
          growth: "Плавное увеличение команды"
        },
        upsell: {
          rates: "Низкие: 0.3-1.5% клиентов",
          focus: "Осторожная монетизация"
        },
        special: ["Минимальные риски", "Стабильная прибыльность", "Долгосрочная устойчивость"]
      },
      apply: (ctx) => {
        // Клиенты: медленный рост
        ctx.setNewClients75([0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4]);
        ctx.setNewClients150([0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4]);
        ctx.setNewClients250([1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3]);
        ctx.setNewClients500([0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2]);
        ctx.setNewClients1000([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]);
        
        // ФОТ: консервативный
        ctx.setFotOptimistic([300, 500, 800, 1000, 1200, 1500, 1800, 2000, 2200, 2500, 2800, 3000]);
        ctx.setFotPessimistic([500, 800, 1200, 1500, 1800, 2200, 2500, 2800, 3200, 3500, 3800, 4000]);
        
        // Upsell: низкие показатели
        ctx.setAdditionalBotsRate(1);
        ctx.setNewFeaturesRate(0.5);
        ctx.setMessageExpansionRate(1.5);
        ctx.setAdditionalIntegrationsRate(0.3);
      }
    },
    {
      name: "Агрессивный рост",
      description: "Быстрый набор клиентов, высокие инвестиции в команду",  
      icon: "🚀",
      details: {
        clients: {
          total: "195 клиентов за год",
          pattern: "Быстрый рост: 2→25 новых клиентов/мес"
        },
        fot: {
          range: "$1000-12000 (опт) / $1500-18000 (песс)",
          growth: "Агрессивное масштабирование команды"
        },
        upsell: {
          rates: "Высокие: 1.5-4% клиентов",
          focus: "Максимальная монетизация"
        },
        special: ["Быстрое масштабирование", "Высокие инвестиции", "Максимальный рост"]
      },
      apply: (ctx) => {
        // Клиенты: быстрый рост
        ctx.setNewClients75([2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 25]);
        ctx.setNewClients150([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]);
        ctx.setNewClients250([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
        ctx.setNewClients500([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
        ctx.setNewClients1000([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
        
        // ФОТ: высокие инвестиции
        ctx.setFotOptimistic([1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000]);
        ctx.setFotPessimistic([1500, 3000, 4500, 6000, 7500, 9000, 10500, 12000, 13500, 15000, 16500, 18000]);
        
        // Upsell: высокие показатели
        ctx.setAdditionalBotsRate(3);
        ctx.setNewFeaturesRate(2.5);
        ctx.setMessageExpansionRate(4);
        ctx.setAdditionalIntegrationsRate(1.5);
      }
    },
    {
      name: "Стабильный бизнес",
      description: "Равномерный рост, стабильные показатели",
      icon: "📈",
      details: {
        clients: {
          total: "70 клиентов за год",
          pattern: "Равномерный рост: 1→7 новых клиентов/мес"
        },
        fot: {
          range: "$500-6000 (опт) / $800-8500 (песс)",
          growth: "Стабильное увеличение команды"
        },
        upsell: {
          rates: "Средние: 0.8-3% клиентов",
          focus: "Сбалансированная монетизация"
        },
        special: ["Предсказуемый рост", "Стабильная прибыль", "Низкие риски"]
      },
      apply: (ctx) => {
        // Клиенты: равномерный рост
        ctx.setNewClients75([1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7]);
        ctx.setNewClients150([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6]);
        ctx.setNewClients250([2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6]);
        ctx.setNewClients500([0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4]);
        ctx.setNewClients1000([0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3]);
        
        // ФОТ: стабильный рост
        ctx.setFotOptimistic([500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000]);
        ctx.setFotPessimistic([800, 1500, 2200, 2900, 3600, 4300, 5000, 5700, 6400, 7100, 7800, 8500]);
        
        // Upsell: средние показатели
        ctx.setAdditionalBotsRate(2);
        ctx.setNewFeaturesRate(1.5);
        ctx.setMessageExpansionRate(3);
        ctx.setAdditionalIntegrationsRate(0.8);
      }
    },
    {
      name: "Enterprise фокус",
      description: "Фокус на крупных клиентах, высокий средний чек",
      icon: "🏢",
      details: {
        clients: {
          total: "63 клиента за год",
          pattern: "Премиум сегмент: акцент на $500-1000 тарифах"
        },
        fot: {
          range: "$800-8500 (опт) / $1200-10000 (песс)",
          growth: "Высококвалифицированные специалисты"
        },
        upsell: {
          rates: "Средне-высокие: 1.2-2.5% + премиум цены",
          focus: "Дорогие доп.услуги для Enterprise"
        },
        special: ["Высокий ARPU", "Крупные сделки", "Премиум позиционирование"]
      },
      apply: (ctx) => {
        // Клиенты: фокус на дорогих тарифах
        ctx.setNewClients75([0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3]);
        ctx.setNewClients150([0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4]);
        ctx.setNewClients250([1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7]);
        ctx.setNewClients500([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6]);
        ctx.setNewClients1000([0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4]);
        
        // ФОТ: высокий уровень специалистов
        ctx.setFotOptimistic([800, 1500, 2200, 2900, 3600, 4300, 5000, 5700, 6400, 7100, 7800, 8500]);
        ctx.setFotPessimistic([1200, 2000, 2800, 3600, 4400, 5200, 6000, 6800, 7600, 8400, 9200, 10000]);
        
        // Upsell: высокие показатели из-за крупных клиентов
        ctx.setAdditionalBotsRate(2.5);
        ctx.setNewFeaturesRate(2);
        ctx.setMessageExpansionRate(2);
        ctx.setAdditionalIntegrationsRate(1.2);
        
        // Повышение цен
        ctx.setAdditionalBotsPrice(150);
        ctx.setNewFeaturesPrice(100);
        ctx.setAdditionalIntegrationsPrice(200);
      }
    },
    {
      name: "Кризисный сценарий",
      description: "Медленный рост, высокий отток, экономия на расходах",
      icon: "⚠️",
      details: {
        clients: {
          total: "27 клиентов за год",
          pattern: "Очень медленный рост: 0→3 новых клиентов/мес"
        },
        fot: {
          range: "$200-2400 (опт) / $300-3600 (песс)",
          growth: "Минимальная команда, экономия"
        },
        upsell: {
          rates: "Низкие: 0.2-1% + сниженные цены",
          focus: "Выживание, удержание клиентов"
        },
        special: ["Высокий churn: 5%", "Снижение цен", "Режим экономии"]
      },
      apply: (ctx) => {
        // Клиенты: очень медленный рост
        ctx.setNewClients75([0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3]);
        ctx.setNewClients150([0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3]);
        ctx.setNewClients250([0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3]);
        ctx.setNewClients500([0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2]);
        ctx.setNewClients1000([0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1]);
        
        // ФОТ: минимальные расходы
        ctx.setFotOptimistic([200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400]);
        ctx.setFotPessimistic([300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700, 3000, 3300, 3600]);
        
        // Высокий отток
        ctx.setChurnRate(5);
        
        // Низкий Upsell
        ctx.setAdditionalBotsRate(0.5);
        ctx.setNewFeaturesRate(0.3);
        ctx.setMessageExpansionRate(1);
        ctx.setAdditionalIntegrationsRate(0.2);
        
        // Снижение цен
        ctx.setAdditionalBotsPrice(75);
        ctx.setNewFeaturesPrice(50);
        ctx.setMessageExpansionPrice(30);
        ctx.setAdditionalIntegrationsPrice(100);
      }
    },
    {
      name: "Оптимистичный буст",
      description: "Все по максимуму - идеальный сценарий развития",
      icon: "🌟",
      details: {
        clients: {
          total: "383 клиента за год",
          pattern: "Экспоненциальный рост: 3→50 новых клиентов/мес"
        },
        fot: {
          range: "$1500-18000 (опт) / $2000-24000 (песс)",
          growth: "Максимальное масштабирование"
        },
        upsell: {
          rates: "Максимальные: 3-6% + премиум цены",
          focus: "Супер-монетизация всех каналов"
        },
        special: ["Минимальный churn: 0.5%", "Премиум цены", "Идеальный сценарий"]
      },
      apply: (ctx) => {
        // Клиенты: максимальный рост
        ctx.setNewClients75([3, 5, 8, 12, 15, 20, 25, 30, 35, 40, 45, 50]);
        ctx.setNewClients150([2, 4, 7, 10, 13, 17, 20, 25, 28, 32, 35, 40]);
        ctx.setNewClients250([3, 4, 6, 8, 10, 12, 15, 18, 20, 23, 25, 28]);
        ctx.setNewClients500([1, 2, 3, 5, 7, 9, 11, 13, 15, 17, 19, 22]);
        ctx.setNewClients1000([0, 1, 2, 3, 4, 5, 7, 8, 10, 11, 13, 15]);
        
        // ФОT: масштабирование команды
        ctx.setFotOptimistic([1500, 3000, 4500, 6000, 7500, 9000, 10500, 12000, 13500, 15000, 16500, 18000]);
        ctx.setFotPessimistic([2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 20000, 22000, 24000]);
        
        // Минимальный отток
        ctx.setChurnRate(0.5);
        
        // Максимальный Upsell
        ctx.setAdditionalBotsRate(5);
        ctx.setNewFeaturesRate(4);
        ctx.setMessageExpansionRate(6);
        ctx.setAdditionalIntegrationsRate(3);
        
        // Премиум цены
        ctx.setAdditionalBotsPrice(200);
        ctx.setNewFeaturesPrice(150);
        ctx.setMessageExpansionPrice(100);
        ctx.setAdditionalIntegrationsPrice(300);
      }
    }
  ];

  const applyPreset = (preset: ModelPreset) => {
    const details = `
🔄 СЦЕНАРИЙ: ${preset.name}
${preset.description}

📊 ЧТО ИЗМЕНИТСЯ:
👥 Клиенты: ${preset.details.clients.total}
   ${preset.details.clients.pattern}

💰 ФОТ: ${preset.details.fot.range}
   ${preset.details.fot.growth}

📈 Upsell: ${preset.details.upsell.rates}
   ${preset.details.upsell.focus}

⭐ Особенности: 
${preset.details.special.map(s => `   • ${s}`).join('\n')}

⚠️ ВНИМАНИЕ: Это изменит ВСЕ текущие настройки модели!
    `;
    
    // eslint-disable-next-line no-restricted-globals
    if (confirm(details)) {
      preset.apply(context);
    }
  };

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 ${className}`}>
      <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
        ⚡ Быстрые сценарии модели
        <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
          Экспериментируйте!
        </span>
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {presets.map((preset, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all group"
          >
            <div className="p-4">
              <div className="flex items-start space-x-3 mb-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {preset.icon}
                </span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                    {preset.name}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              </div>
              
              {/* Детализация параметров сценария */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-medium min-w-[50px]">👥 Клиенты:</span>
                  <div>
                    <div className="text-gray-800 font-medium">{preset.details.clients.total}</div>
                    <div className="text-gray-600">{preset.details.clients.pattern}</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 font-medium min-w-[50px]">💰 ФОТ:</span>
                  <div>
                    <div className="text-gray-800 font-medium">{preset.details.fot.range}</div>
                    <div className="text-gray-600">{preset.details.fot.growth}</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <span className="text-orange-600 font-medium min-w-[50px]">📈 Upsell:</span>
                  <div>
                    <div className="text-gray-800 font-medium">{preset.details.upsell.rates}</div>
                    <div className="text-gray-600">{preset.details.upsell.focus}</div>
                  </div>
                </div>
                
                {preset.details.special.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 font-medium min-w-[50px]">⭐ Особенности:</span>
                    <div className="text-gray-600">
                      {preset.details.special.join(' • ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-4 pb-4">
              <button
                onClick={() => applyPreset(preset)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium text-sm"
              >
                Применить сценарий
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          💡 <strong>Совет:</strong> Примените сценарий как отправную точку, затем настройте детали под свои нужды. 
          Используйте экспорт/импорт для сохранения удачных конфигураций.
        </p>
      </div>
    </div>
  );
};

export default QuickModelPresets;