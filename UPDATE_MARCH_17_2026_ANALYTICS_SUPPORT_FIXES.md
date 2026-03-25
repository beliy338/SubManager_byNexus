# Обновление: Исправления аналитики и чата поддержки
**Дата:** 17 марта 2026

## 🎯 Выполненные исправления

### 1. Аналитика - Логотипы в детализации ✅
**Проблема:** В разделе "Детализация по сервисам" не отображались логотипы сервисов (отображались только в "Обзоре")

**Решение:**
- Добавлено поле `logo` в `serviceData` (берется из `sub.icon`)
- Заменен код отображения логотипа на использование компонента `ServiceLogo`
- Теперь в детализации используется `<ServiceLogo logo={service.logo} name={service.name} size="sm" />`

**Файл:** `/src/app/pages/Analytics.tsx`
- Строки 36-43: Добавлено поле `logo` в serviceData
- Строки 340-348: Заменен img на ServiceLogo компонент

---

### 2. Аналитика - Полная цена за год ✅
**Проблема:** В колонке "Полная цена" не отображалась правильная годовая сумма (должно быть месячная цена × 12)

**Решение:**
- Добавлено поле `totalPrice` в `serviceData`
- Формула: `parseFloat((convertPrice(sub.billingCycle === 'monthly' ? sub.price : sub.price / 12) * 12).toFixed(2))`
- Теперь корректно показывается годовая стоимость подписки

**Файл:** `/src/app/pages/Analytics.tsx`
- Строки 36-43: Добавлен расчет totalPrice
- Строка 364: Отображение totalPrice в таблице

---

### 3. Аналитика - Исправление текста ✅
**Проблема:** В топе подписок отображался некорректный текст "#1 по расодам" (проблема кодировки)

**Решение:**
- Исправлен текст с "по расодам" на "по расходам"

**Файл:** `/src/app/pages/Analytics.tsx`
- Строка 246: Изменено `#1 по расодам` → `#1 по расходам`

---

### 4. Чат поддержки - Прокрутка ✅
**Проблема:** В чате поддержки:
- Не отображался скролл бар
- При прокрутке колёсиком мыши прокручивалось всё приложение, а не история чата

**Решение:**
- Заменен компонент `ScrollArea` н обычные `div` с `overflow-y-auto`
- Добавлен inline стиль `overscrollBehavior: 'contain'` для изоляции прокрутки
- Добавлен класс `pr-2` (padding-right) для красивого отступа скролл-бара от края (как в модальном окне выбора сервиса)
- Применено для всех областей прокрутки:
  - История сообщений пользователя
  - Список пользователей (для владельцев)
  - История сообщений в чате с пользователем (для владельцев)

**Файл:** `/src/app/components/SupportModal.tsx`
- Строка 455: Чат пользователя - заменен ScrollArea на div с `overflow-y-auto p-6 pr-2`
- Строка 535: Список пользователей - заменен ScrollArea на div с overflow-y-auto
- Строка 571: Чат владельца - заменен ScrollArea на div с overflow-y-auto
- Добавлен `style={{ overscrollBehavior: 'contain' }}` для предотвращения прокрутки родительских элементов

---

## 📊 Технические детали

### Изменения в serviceData
```typescript
const serviceData = subscriptions.map((sub, index) => ({
  id: sub.id || `service-${index}`,
  name: sub.name,
  logo: sub.icon,  // ✨ НОВОЕ
  category: t(sub.category),
  monthlyPrice: parseFloat(convertPrice(sub.billingCycle === 'monthly' ? sub.price : sub.price / 12).toFixed(2)),
  totalPrice: parseFloat((convertPrice(sub.billingCycle === 'monthly' ? sub.price : sub.price / 12) * 12).toFixed(2)),  // ✨ НОВОЕ
  billingCycle: sub.billingCycle,
})).sort((a, b) => b.monthlyPrice - a.monthlyPrice);
```

### Прокрутка в чате
```tsx
// ДО (не работало корректно):
<ScrollArea className="flex-1 p-6">
  {/* сообщения */}
</ScrollArea>

// ПОСЛЕ (работает правильно - как в SelectServiceModal):
<div className="flex-1 overflow-y-auto p-6 pr-2" style={{ overscrollBehavior: 'contain' }}>
  {/* сообщения */}
</div>
```

**Преимущества:**
- `overflow-y-auto` - автоматическая вертикальная прокрутка
- `pr-2` - отступ справа для красивого отображения скролл-бара
- `overscrollBehavior: 'contain'` - изолирует прокрутку внутри контейнера
- `custom-scrollbar` - кастомный класс для красивого фиолетового скролл-бара

### Кастомный скролл-бар (новый класс в theme.css)
```css
/* Custom scrollbar for overflow-auto elements */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(147, 51, 234, 0.4) transparent; /* Фиолетовый в светлой теме */
}

.dark .custom-scrollbar {
  scrollbar-color: rgba(139, 92, 246, 0.5) transparent; /* Фиолетовый в темной теме */
}

/* Webkit browsers (Chrome, Safari, Edge) */
.custom-scrollbar::-webkit-scrollbar {
  width: 10px; /* Ширина скролл-бара */
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent; /* Прозрачный трек */
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(147, 51, 234, 0.4); /* Фиолетовый бегунок */
  border-radius: 10px; /* Закругленные края */
  border: 2px solid transparent;
  background-clip: padding-box;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(147, 51, 234, 0.6); /* Темнее при наведении */
}
```

**Особенности:**
- 🎨 Фиолетовый цвет в соответствии с темой приложения
- 🌓 Автоматическое переключение цвета для темной темы
- ⭕ Закругленные края для современного вида
- 🖱️ Эффект затемнения при наведении курсора
- 📏 Тонкий скролл-бар (10px) для экономии пространства

---

## ✅ Результат

1. ✨ **Логотипы в детализации:** Теперь отображаются во всех разделах аналитики
2. 💰 **Полная цена:** Корректно показывается годовая стоимость (месячная × 12)
3. 📝 **Текст исправлен:** "по расходам" вместо искаженного текста
4. 📜 **Скролл бар видим:** Теперь пользователи видят красивую фиолетовую полосу прокрутки
5. 🖱️ **Прокрутка изолирована:** Колесико мыши прокручивает только чат, не всё приложение
6. 🎨 **Единый стиль:** Скролл бар в чате поддержки теперь такой же, как при выборе сервиса (фиолетовый с закруглениями)

---

## 🔧 Затронутые файлы
- `/src/app/pages/Analytics.tsx` - Аналитика
- `/src/app/components/SupportModal.tsx` - Чат поддержки
- `/src/styles/theme.css` - Добавлен класс `.custom-scrollbar` для красивого скролл-бара

---

## 🚀 Готово к использованию
Все исправления применены и готовы к использованию. Никаких дополнительных действий не требуется.