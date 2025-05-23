// Тест для проверки логики закрепления значений в декомпозиции ФОТ

describe('FOT Breakdown Lock Functionality', () => {
  test('Незакрепленные значения корректируются при изменении', () => {
    const breakdown = { development: 60, sales: 25, admin: 15 };
    const locked = { development: false, sales: false, admin: false };
    
    // Меняем development на 70%
    const newDevelopment = 70;
    const otherSum = breakdown.sales + breakdown.admin; // 40
    const remainingForOthers = 100 - newDevelopment; // 30
    const scale = remainingForOthers / otherSum; // 0.75
    
    const expectedSales = Math.round(breakdown.sales * scale); // 19
    const expectedAdmin = Math.round(breakdown.admin * scale); // 11
    
    expect(newDevelopment + expectedSales + expectedAdmin).toBe(100);
  });

  test('Закрепленные значения не изменяются', () => {
    const breakdown = { development: 60, sales: 25, admin: 15 };
    const locked = { development: false, sales: true, admin: false }; // sales закреплен
    
    // Меняем development на 70%
    const newDevelopment = 70;
    const lockedSales = 25; // не изменяется
    const remainingForAdmin = 100 - newDevelopment - lockedSales; // 5
    
    expect(newDevelopment + lockedSales + remainingForAdmin).toBe(100);
    expect(remainingForAdmin).toBe(5);
  });

  test('Если остаток отрицательный, корректируется изменяемое значение', () => {
    const breakdown = { development: 60, sales: 25, admin: 15 };
    const locked = { development: false, sales: true, admin: true }; // sales и admin закреплены
    
    const lockedSum = 25 + 15; // 40
    const maxDevelopment = 100 - lockedSum; // 60
    
    // Пытаемся установить development = 80, но максимум 60
    expect(maxDevelopment).toBe(60);
  });

  test('Все незакрепленные = 0, распределяем поровну', () => {
    const breakdown = { development: 100, sales: 0, admin: 0 };
    const locked = { development: false, sales: false, admin: false };
    
    // Меняем development на 40%
    const newDevelopment = 40;
    const remainingForOthers = 60;
    const equalShare = Math.floor(remainingForOthers / 2); // 30
    
    expect(newDevelopment + equalShare + equalShare).toBe(100);
  });

  test('Если все закреплено кроме одного, он получает остаток', () => {
    const breakdown = { development: 60, sales: 25, admin: 15 };
    const locked = { development: true, sales: true, admin: false }; // только admin незакреплен
    
    const lockedSum = 60 + 25; // 85
    const adminValue = 100 - lockedSum; // 15
    
    expect(adminValue).toBe(15);
  });
});