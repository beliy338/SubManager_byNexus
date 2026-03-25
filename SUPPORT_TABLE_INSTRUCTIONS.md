# Инструкции для создания таблицы поддержки

## Важно!
Эту таблицу необходимо создать вручную через интерфейс Supabase, так как система Make не поддерживает автоматические миграции.

## SQL для создания таблицы support_messages

Выполните следующий SQL-запрос в вашем проекте Supabase:

```sql
-- Create support_messages table
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_admin_reply BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES public.support_messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own messages
CREATE POLICY "Users can read their own messages"
  ON public.support_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own messages
CREATE POLICY "Users can insert their own messages"
  ON public.support_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for owners to read all messages
CREATE POLICY "Owners can read all messages"
  ON public.support_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    )
  );

-- Create policy for owners to insert messages (replies)
CREATE POLICY "Owners can insert messages"
  ON public.support_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS support_messages_user_id_idx ON public.support_messages(user_id);
CREATE INDEX IF NOT EXISTS support_messages_created_at_idx ON public.support_messages(created_at);
CREATE INDEX IF NOT EXISTS support_messages_parent_message_id_idx ON public.support_messages(parent_message_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
```

## Шаги для создания

1. Откройте ваш проект в Supabase Dashboard
2. Перейдите в SQL Editor
3. Создайте новый запрос
4. Скопируйте и вставьте SQL-код выше
5. Выполните запрос (нажмите "Run")

## Проверка

После создания таблицы проверьте:
- ✅ Таблица `support_messages` создана
- ✅ RLS (Row Level Security) включен
- ✅ Политики доступа созданы
- ✅ Индексы созданы
- ✅ Realtime включен

## Структура таблицы

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Уникальный идентификатор сообщения |
| user_id | UUID | ID пользователя |
| user_email | TEXT | Email пользователя |
| user_name | TEXT | Имя пользователя |
| message | TEXT | Текст сообщения |
| is_admin_reply | BOOLEAN | Ответ от админа или сообщение пользователя |
| parent_message_id | UUID | ID родительского сообщения (для ответов) |
| created_at | TIMESTAMP | Дата и время создания |

## Безопасность

Row Level Security настроен таким образом, что:
- Обычные пользователи видят только свои сообщения
- Владельцы (max.sokolvp@gmail.com, belovodvadim@gmail.com) видят все сообщения
- Пользователи могут создавать только свои сообщения
- Владельцы могут отвечать на любые сообщения
