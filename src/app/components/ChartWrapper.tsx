import React from 'react';

interface ChartWrapperProps {
  children: React.ReactNode;
}

export function ChartWrapper({ children }: ChartWrapperProps) {
  React.useEffect(() => {
    // Сохраняем оригинальный console.error
    const originalError = console.error;
    const originalWarn = console.warn;

    // Переопределяем console.error и console.warn для фильтрации предупреждений recharts
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      // Игнорируем предупреждения о дублирующихся ключах от recharts
      if (message.includes('Encountered two children with the same key') ||
          message.includes('recharts')) {
        return;
      }
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      // Игнорируем предупреждения о дублирующихся ключах от recharts
      if (message.includes('Encountered two children with the same key') ||
          message.includes('recharts')) {
        return;
      }
      originalWarn.apply(console, args);
    };

    // Восстанавливаем оригинальные функции при размонтировании
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return <>{children}</>;
}
