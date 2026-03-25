# 🚀 НАЧНИТЕ ЗДЕСЬ: Установка флагов стран

> **🎯 Цель**: Решить проблему отображения флагов на сайте за 5 минут

---

## ⚡ Быстрый старт (3 шага)

### 1️⃣ Откройте Supabase
```
https://supabase.com/dashboard
→ Выберите проект SubManager
→ SQL Editor → New query
```

### 2️⃣ Выполните SQL
```
Откройте файл: /supabase-country-flags-table.sql
Скопируйте весь код (Ctrl+A → Ctrl+C)
Вставьте в SQL Editor (Ctrl+V)
Нажмите RUN (Ctrl+Enter)
Дождитесь: ✅ Success
```

### 3️⃣ Проверьте результат
```
Откройте: https://body-order-32825369.figma.site
Найдите переключатель языков: 🌐 + 🇷🇺
Убедитесь что флаги отображаются
```

---

## 📚 Документация

| Файл | Описание | Время чтения |
|------|----------|--------------|
| [SUMMARY_COUNTRY_FLAGS.md](/SUMMARY_COUNTRY_FLAGS.md) | **Краткое резюме** всех изменений | 2 мин |
| [CHECKLIST_COUNTRY_FLAGS.md](/CHECKLIST_COUNTRY_FLAGS.md) | **Чеклист** из 6 шагов | 5 мин |
| [COUNTRY_FLAGS_README.md](/COUNTRY_FLAGS_README.md) | **Полная документация** с примерами | 15 мин |
| [COUNTRY_FLAGS_VISUAL_GUIDE.html](/COUNTRY_FLAGS_VISUAL_GUIDE.html) | **Интерактивное руководство** (откройте в браузере) | 10 мин |

---

## 🗄️ SQL файлы

| Файл | Назначение |
|------|-----------|
| [supabase-country-flags-table.sql](/supabase-country-flags-table.sql) | **Основной скрипт** создания таблицы |
| [test-country-flags-table.sql](/test-country-flags-table.sql) | **Проверка** и диагностика |

---

## 🔍 Что внутри?

### Таблица `country_flags`
```
🇷🇺 RU → ru → https://flagcdn.com/w320/ru.png
🇬🇧 GB → en → https://flagcdn.com/w320/gb.png
🇧🇾 BY → be → https://flagcdn.com/w320/by.png
🇨🇳 CN → zh → https://flagcdn.com/w320/cn.png
```

### Обновленный компонент
```typescript
/src/app/components/LanguageSelector.tsx
- Загружает флаги из Supabase Database
- Резервные локальные флаги при ошибках
- Автоматический fallback механизм
```

---

## ✅ Проверка установки

### Выполните в SQL Editor:
```sql
SELECT * FROM country_flags;
```

**Ожидаемый результат**: 4 записи

### Откройте в браузере:
```
https://flagcdn.com/w320/ru.png
```

**Ожидаемый результат**: Изображение флага России 🇷🇺

---

## 🎯 Проблема → Решение

| Проблема | Решение |
|----------|---------|
| Флаги не отображаются на сайте | ✅ Загрузка из Supabase Database |
| `figma:asset` работает только локально | ✅ Использование публичного CDN |
| Нет централизованного хранения | ✅ Единая таблица в БД |
| Сложно добавить новые языки | ✅ Простой INSERT запрос |

---

## 📖 Рекомендуемый порядок чтения

### Для быстрой установки:
1. **Этот файл** (вы здесь) - 1 мин
2. [CHECKLIST_COUNTRY_FLAGS.md](/CHECKLIST_COUNTRY_FLAGS.md) - 5 мин
3. Готово! ✅

### Для полного понимания:
1. **Этот файл** (вы здесь) - 1 мин
2. [SUMMARY_COUNTRY_FLAGS.md](/SUMMARY_COUNTRY_FLAGS.md) - 2 мин
3. [COUNTRY_FLAGS_README.md](/COUNTRY_FLAGS_README.md) - 15 мин
4. [COUNTRY_FLAGS_VISUAL_GUIDE.html](/COUNTRY_FLAGS_VISUAL_GUIDE.html) - 10 мин

---

## 🆘 Нужна помощь?

### Проблемы с установкой
→ Читайте [CHECKLIST_COUNTRY_FLAGS.md](/CHECKLIST_COUNTRY_FLAGS.md)

### Флаги не отображаются
→ Выполните [test-country-flags-table.sql](/test-country-flags-table.sql)

### Хотите понять архитектуру
→ Читайте [COUNTRY_FLAGS_README.md](/COUNTRY_FLAGS_README.md)

### Нужна визуальная инструкция
→ Откройте [COUNTRY_FLAGS_VISUAL_GUIDE.html](/COUNTRY_FLAGS_VISUAL_GUIDE.html) в браузере

---

## 🎉 После установки

### Что изменится:
- ✅ Флаги будут отображаться на всех устройствах
- ✅ Быстрая загрузка через CDN
- ✅ Резервные флаги при ошибках
- ✅ Легко добавлять новые языки

### Что проверить:
1. Переключатель языков показывает текущий флаг
2. Выпадающий список показывает все 4 флага
3. Переключение языка работает корректно
4. Нет ошибок в консоли браузера (F12)

---

## ⏱️ Время выполнения

```
┌─────────────────────────────┐
│  Открыть Supabase    (1 мин)│
│  Выполнить SQL       (2 мин)│
│  Проверить сайт      (2 мин)│
├─────────────────────────────┤
│  ИТОГО:              5 минут │
└─────────────────────────────┘
```

---

## 🎊 Готово!

После выполнения всех шагов флаги стран будут **корректно отображаться** на вашем сайте!

**Следующий шаг**: Откройте [CHECKLIST_COUNTRY_FLAGS.md](/CHECKLIST_COUNTRY_FLAGS.md) и следуйте инструкциям.

---

**Дата**: 25 марта 2026  
**Статус**: ✅ Готово к применению  
**Приоритет**: 🔥 Высокий (исправляет критическую проблему)
