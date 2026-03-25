-- Добавление колонки ai_permission в таблицу user_settings
-- Выполните этот SQL скрипт в Supabase SQL Editor

-- Добавляем колонку с проверкой допустимых значений
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS ai_permission TEXT CHECK (ai_permission IN ('yes', 'later', 'never'));

-- Добавляем комментарий к колонке
COMMENT ON COLUMN user_settings.ai_permission IS 'AI features permission: yes (approved), later (ask again), never (declined), or NULL (not asked yet)';

-- NULL означает, что пользователь ещё не был спрошен о разрешении
-- Это специально, чтобы модальное окно показалось при первом входе