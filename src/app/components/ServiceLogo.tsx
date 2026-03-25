import React, { useState } from 'react';

interface ServiceLogoProps {
  logo?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'square' | 'rounded';
  className?: string;
  customLogo?: string; // Base64 logo for custom subscriptions
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl'
};

const roundedClasses = {
  square: 'rounded',
  rounded: 'rounded-lg'
};

/**
 * Единый компонент для отображения логотипов сервисов
 * 
 * Использование:
 * <ServiceLogo logo={service.icon} name={service.name} size="md" customLogo={service.customLogo} />
 * 
 * Если есть customLogo - отображает его
 * Если есть logo и загружается успешно - отображает картинку
 * Если логотипа нет или ошибка загрузки - отображает первую букву названия на градиентном фоне
 */
export function ServiceLogo({ 
  logo, 
  name, 
  size = 'md', 
  variant = 'rounded',
  className = '',
  customLogo
}: ServiceLogoProps) {
  const [customLogoError, setCustomLogoError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const sizeClass = sizeClasses[size];
  const roundedClass = roundedClasses[variant];
  
  // Priority 1: Show custom logo if available
  if (customLogo && !customLogoError) {
    return (
      <div className={`${sizeClass} ${roundedClass} overflow-hidden border border-border flex-shrink-0 bg-muted ${className}`}>
        <img 
          src={customLogo} 
          alt={name} 
          className="w-full h-full object-cover" 
          loading="lazy"
          onError={() => setCustomLogoError(true)}
        />
      </div>
    );
  }
  
  // Priority 2: Show logo image if URL exists and hasn't errored
  if (logo && !logoError) {
    return (
      <div className={`${sizeClass} ${roundedClass} overflow-hidden border border-border flex-shrink-0 bg-muted ${className}`}>
        <img 
          src={logo} 
          alt={name} 
          className="w-full h-full object-cover" 
          loading="lazy"
          onError={() => setLogoError(true)}
        />
      </div>
    );
  }

  // Fallback: показываем первую букву на градиентном фоне
  return (
    <div 
      className={`${sizeClass} ${roundedClass} bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold flex-shrink-0 ${className}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}