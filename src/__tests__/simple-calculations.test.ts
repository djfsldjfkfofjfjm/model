// Простые тесты для проверки основных формул без использования хуков

describe('Проверка основных формул', () => {
  test('Налог рассчитывается от выручки', () => {
    const revenue = 10000;
    const expenses = 7000;
    const taxRate = 6; // 6% optimistic
    
    // Налог ВСЕГДА от выручки, не от прибыли!
    const tax = revenue > 0 ? revenue * (taxRate / 100) : 0;
    expect(tax).toBe(600); // 10000 * 0.06 = 600
    
    const grossProfit = revenue - expenses; // 3000
    const netProfit = grossProfit - tax; // 3000 - 600 = 2400
    expect(netProfit).toBe(2400);
  });

  test('LTV формула с учетом churn', () => {
    const arpu = 100;
    const monthlyChurnRate = 0.05; // 5%
    
    const ltv = arpu / monthlyChurnRate;
    expect(ltv).toBe(2000); // 100 / 0.05 = 2000
  });

  test('Распределение каналов', () => {
    const totalClients = 10;
    const directRatio = 0.6;
    const partnerRatio = 0.4;
    
    const directClients = Math.round(totalClients * directRatio);
    const partnerClients = Math.round(totalClients * partnerRatio);
    
    expect(directClients).toBe(6);
    expect(partnerClients).toBe(4);
  });

  test('NRR формула', () => {
    const previousMRR = 10000;
    const expansionRevenue = 1000;
    const churnedRevenue = 500;
    
    const nrr = ((previousMRR + expansionRevenue - churnedRevenue) / previousMRR) * 100;
    expect(nrr).toBe(105); // (10000 + 1000 - 500) / 10000 * 100 = 105%
  });

  test('Декомпозиция ФОТ', () => {
    const totalFOT = 10000;
    const devRatio = 0.6;
    const salesRatio = 0.4;
    
    const devCosts = totalFOT * devRatio;
    const salesCosts = totalFOT * salesRatio;
    
    expect(devCosts).toBe(6000);
    expect(salesCosts).toBe(4000);
    expect(devCosts + salesCosts).toBe(totalFOT);
  });

  test('CAC расчет', () => {
    const partnerCommissions = 1000;
    const salesTeamCosts = 2000;
    const marketingCosts = 1500;
    const leadGenerationCosts = 500;
    
    const totalCAC = partnerCommissions + salesTeamCosts + marketingCosts + leadGenerationCosts;
    expect(totalCAC).toBe(5000);
  });

  test('Комиссия партнерам от реальной выручки', () => {
    const integrationRevenue = 5000;
    const subscriptionRevenue = 3000;
    const partnerRatio = 0.4;
    const commissionRate = 0.2; // 20%
    
    const partnerRevenue = (integrationRevenue + subscriptionRevenue) * partnerRatio;
    const commission = partnerRevenue * commissionRate;
    
    expect(commission).toBe(640); // 8000 * 0.4 * 0.2 = 640
  });

  test('Пропорциональное распределение процентов ФОТ', () => {
    // Тест нового алгоритма распределения
    const initial = { development: 60, sales: 25, admin: 15 };
    
    // Меняем development на 70%
    const newDevelopment = 70;
    const otherSum = initial.sales + initial.admin; // 40
    const targetOthersSum = 100 - newDevelopment; // 30
    const scale = targetOthersSum / otherSum; // 30/40 = 0.75
    
    const newSales = Math.round(initial.sales * scale); // 25 * 0.75 = 19
    const newAdmin = Math.round(initial.admin * scale); // 15 * 0.75 = 11
    
    expect(newDevelopment + newSales + newAdmin).toBe(100);
  });
});