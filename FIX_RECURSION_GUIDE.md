# Исправление бесконечной рекурсии в RLS политиках support_messages

## Проблема
При загрузке сообщений поддержки возникает ошибка:
```
Error: infinite recursion detected in policy for relation "support_messages"
```

## Причина
Политика RLS делала подзапрос к той же таблице `support_messages` внутри себя:
```sql
parent_message_id IN (
    SELECT id FROM public.support_messages WHERE user_id = auth.uid()
)
```

Это создавало бесконечную рекурсию, так как Postgres пытался применить ту же политику к подзапросу.

## Решение
Создана функция-помощник `is_user_parent_message()` с атрибутом `SECURITY DEFINER`, которая обходит RLS и безопасно проверяет принадлежность родительского сообщения пользователю.

## Инструкция по применению

### Шаг 1: Откройте Supabase Dashboard
1. Перейдите на https://supabase.com
2. Войдите в свой проект SubManager
3. В левом меню выберите **SQL Editor**

### Шаг 2: Выполните SQL скрипт
1. Нажмите **New query**
2. Скопируйте содержимое файла `/fix-support-messages-recursion.sql`
3. Вставьте в редактор SQL
4. Нажмите **Run** или Ctrl+Enter

### Шаг 3: Проверьте результат
Вы должны увидеть сообщения:
```
Support messages RLS policies have been fixed!
Users can now view:
  1. Their own messages
  2. Admin replies to their messages
  3. Owners can see all messages
```

### Шаг 4: Обновите приложение
Обновите страницу приложения - ошибка должна исчезнуть.

## Что было сделано

1. **Создана функция-помощник** `is_user_parent_message()`:
   - Использует `SECURITY DEFINER` для обхода RLS
   - Безопасно проверяет, принадлежит ли родительское сообщение пользователю
   - Запускается с привилегиями владельца функции

2. **Обновлена политика SELECT**:
   - Убран рекурсивный подзапрос
   - Используется функция-помощник вместо подзапроса
   - Сохранена вся функциональность

3. **Предоставлены права**:
   - Authenticated пользователям выдано право на выполнение функции

## Логика работы политики

Пользователи могут видеть сообщения, если:
- ✅ Сообщение создано ими (`user_id = auth.uid()`)
- ✅ Это ответ владельца на их сообщение (`is_admin_reply = true AND принадлежит им`)
- ✅ Они являются владельцами (`email IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')`)

## Безопасность
- ✅ Функция использует `SECURITY DEFINER` безопасно
- ✅ Установлен `search_path = public` для защиты от атак
- ✅ RLS остается активным для всех операций
- ✅ Владельцы видят все сообщения
- ✅ Обычные пользователи видят только свои сообщения и ответы

## Поддержка
Если возникнут проблемы:
1. Проверьте, что скрипт выполнился без ошибок
2. Убедитесь, что RLS включен: `ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;`
3. Проверьте созданные политики в Supabase Dashboard → Authentication → Policies
