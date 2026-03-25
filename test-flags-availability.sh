#!/bin/bash

# =====================================================
# ТЕСТ ДОСТУПНОСТИ URL ФЛАГОВ
# =====================================================
# Этот скрипт проверяет доступность URL флагов
# Запуск: bash test-flags-availability.sh
# =====================================================

echo "🔍 Проверка доступности URL флагов..."
echo "======================================"
echo ""

# Массив URL для проверки
declare -a urls=(
  "https://flagcdn.com/w320/ru.png"
  "https://flagcdn.com/w320/gb.png"
  "https://flagcdn.com/w320/by.png"
  "https://flagcdn.com/w320/cn.png"
  "https://flagcdn.com/w320/es.png"
  "https://flagcdn.com/w320/fr.png"
)

declare -a countries=(
  "🇷🇺 RU (Russia)"
  "🇬🇧 GB (UK)"
  "🇧🇾 BY (Belarus)"
  "🇨🇳 CN (China)"
  "🇪🇸 ES (Spain)"
  "🇫🇷 FR (France)"
)

# Счётчики
success=0
failed=0

# Проверка каждого URL
for i in "${!urls[@]}"; do
  url="${urls[$i]}"
  country="${countries[$i]}"
  
  echo -n "Проверка $country... "
  
  # Используем curl для проверки HTTP статуса
  http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 5)
  
  if [ "$http_code" -eq 200 ]; then
    echo "✅ OK (HTTP $http_code)"
    ((success++))
  else
    echo "❌ FAILED (HTTP $http_code)"
    ((failed++))
  fi
done

echo ""
echo "======================================"
echo "📊 Результаты:"
echo "   ✅ Успешно: $success"
echo "   ❌ Ошибок: $failed"
echo "   📦 Всего: ${#urls[@]}"
echo ""

if [ $failed -eq 0 ]; then
  echo "🎉 Все флаги доступны!"
  exit 0
else
  echo "⚠️  Некоторые флаги недоступны."
  echo "   Используйте alternative-flags-urls.sql для смены CDN"
  exit 1
fi
