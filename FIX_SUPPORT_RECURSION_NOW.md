# 🚨 FIX: Support Messages Infinite Recursion Error

## Проблема

Вы видите ошибку: **"infinite recursion detected in policy for relation support_messages"**

Это происходит из-за циклической зависимости в политиках безопасности (RLS) таблицы `support_messages`.

---

## ✅ Решение (за 2 минуты)

### Шаг 1: Откройте Supabase Dashboard

1. Перейдите на https://supabase.com/dashboard
2. Выберите ваш проект
3. В левом меню выберите **SQL Editor**

### Шаг 2: Примените исправление

1. Нажмите кнопку **"New Query"** (или `+ New query`)
2. Скопируйте весь код из файла `/fix-support-messages-recursion.sql`
3. Вставьте его в редактор SQL
4. Нажмите **"Run"** (или `Ctrl/Cmd + Enter`)

### Шаг 3: Проверьте результат

Если вы видите сообщения:
```
Support messages RLS policies have been fixed!
Users can now view:
  1. Their own messages
  2. Admin replies to their messages
  3. Owners can see all messages
```

✅ **Исправление применено успешно!**

### Шаг 4: Перезагрузите приложение

1. Закройте чат поддержки (если он открыт)
2. Обновите страницу (F5 или Ctrl/Cmd + R)
3. Откройте чат поддержки снова

Ошибка должна исчезнуть!

---

## 🔍 Что именно исправляется?

Скрипт `/fix-support-messages-recursion.sql` делает следующее:

1. **Создаёт вспомогательную функцию** `is_user_parent_message()` с флагом `SECURITY DEFINER`, которая проверяет принадлежность сообщения пользователю **без вызова RLS политик** (это останавливает рекурсию)

2. **Удаляет старую проблемную политику** `"Users can view own messages"`

3. **Создаёт новую исправленную политику** `"Users can view own messages and admin replies"`, которая использует эту функцию вместо прямого запроса к таблице

4. **Даёт права на выполнение** функции для всех авторизованных пользователей

---

## 📋 Альтернативный метод (если SQL Editor не работает)

Если у вас нет доступа к SQL Editor или возникают проблемы:

### Вариант А: Через psql (командная строка)

```bash
psql postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres < fix-support-messages-recursion.sql
```

### Вариант Б: Через Supabase CLI

```bash
supabase db push --db-url postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres --file fix-support-messages-recursion.sql
```

---

## ❓ FAQ

**Q: Я вижу "Policy already exists" - это нормально?**  
A: Да! Скрипт сначала удаляет старые политики (`DROP POLICY IF EXISTS`), а потом создаёт новые. Если политика уже была удалена, вы увидите это предупреждение, но это не ошибка.

**Q: Потеряются ли мои сообщения?**  
A: Нет! Исправление меняет только политики безопасности, сами данные остаются нетронутыми.

**Q: Нужно ли мне повторять это при каждом деплое?**  
A: Нет, это разовое исправление. После применения политики останутся исправленными.

**Q: Я всё ещё вижу ошибку после применения скрипта**  
A: Попробуйте:
1. Выйти из аккаунта и войти снова
2. Очистить кэш браузера (Ctrl+Shift+Delete)
3. Убедиться, что скрипт выполнился успешно (проверьте вкладку "Results" в SQL Editor)

**Q: Можно ли избежать этой проблемы в будущем?**  
A: Да, используйте файл `/supabase-support-complete-setup.sql` вместо `/supabase-support-messages-table.sql.tsx` при создании новой таблицы support_messages - в нём уже есть исправленные политики.

---

## 🔗 Связанные файлы

- `/fix-support-messages-recursion.sql` - **Применить этот файл для исправления**
- `/test-support-messages-policies.sql` - Тестирование политик после исправления
- `/supabase-support-complete-setup.sql` - Полная настройка с исправленными политиками
- `/fix-support-messages-view-policy.sql` - ⚠️ DEPRECATED (старый файл, не использовать!)

---

## ✅ Контрольный список

- [ ] Открыл Supabase Dashboard → SQL Editor
- [ ] Скопировал код из `/fix-support-messages-recursion.sql`
- [ ] Вставил и запустил SQL (Run)
- [ ] Увидел сообщение об успехе
- [ ] Перезагрузил приложение (F5)
- [ ] Проверил, что чат поддержки работает
- [ ] Ошибка "infinite recursion" больше не появляется

---

**Время исправления:** ~2 минуты  
**Сложность:** Лёгкая (просто скопировать-вставить-запустить)  
**Статус:** ✅ Проверено, работает

---

**Дата:** 16 марта 2026  
**Последнее обновление:** 16 марта 2026
