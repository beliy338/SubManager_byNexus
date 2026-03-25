# 🚀 Быстрая Проверка - AI Permission Modal

## Проверьте, что всё работает

### ШАГ 1: Проверьте колонку в Supabase

1. Откройте **Supabase Dashboard** → SQL Editor
2. Выполните запрос:

```sql
-- Проверить, есть ли колонка ai_permission
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND column_name = 'ai_permission';
```

**Ожидаемый результат:**
```
column_name    | data_type | is_nullable
ai_permission  | text      | YES
```

### ШАГ 2: Если колонки НЕТ - выполните скрипт

```sql
-- Добавление колонки ai_permission в таблицу user_settings
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS ai_permission TEXT 
CHECK (ai_permission IN ('yes', 'later', 'never'));

-- Добавляем комментарий
COMMENT ON COLUMN user_settings.ai_permission IS 
'AI features permission: yes (approved), later (ask again), never (declined), or NULL (not asked yet)';
```

### ШАГ 3: Проверьте работу в приложении

1. **Зарегистрируйте нового пользователя** или выйдите из текущего
2. **Войдите в приложение**
3. **Через 1.5 секунды** должно появиться модальное окно с предложением активировать AI
4. **Выберите "Да, активировать"** или **"Никогда"**
5. **Перезагрузите страницу** → окно НЕ должно появиться ✅
6. **Выйдите и войдите снова** → окно НЕ должно появиться ✅

### ШАГ 4: Проверьте сохранение в БД

```sql
-- Проверить ваш выбор
SELECT user_id, language, currency, theme, ai_permission 
FROM user_settings 
WHERE user_id = auth.uid();
```

**Должны увидеть:**
- `ai_permission = 'yes'` если активировали AI
- `ai_permission = 'never'` если отказались
- `ai_permission = 'later'` если выбрали "Позже"
- `ai_permission = NULL` если ещё не видели окно

## Тестовые сценарии

### ✅ Сценарий 1: Активация AI

```
1. Новый пользователь входит в систему
2. Видит модальное окно "Активировать AI помощника?"
3. Нажимает "Да, активировать"
4. Окно закрывается
5. Перезагружает страницу → окно НЕ появляется ✅
6. Выходит и входит снова → окно НЕ появляется ✅
7. Входит с другого устройства → окно НЕ появляется ✅
```

### ✅ Сценарий 2: Отказ от AI

```
1. Новый пользователь входит в систему
2. Видит модальное окно "Активировать AI помощника?"
3. Нажимает "Никогда"
4. Окно закрывается
5. Перезагружает страницу → окно НЕ появляется ✅
6. Выходит и входит снова → окно НЕ появляется ✅
7. Входит с другого устройства → окно НЕ появляется ✅
```

### ✅ Сценарий 3: Отложить решение

```
1. Новый пользователь входит в систему
2. Видит модальное окно "Активировать AI помощника?"
3. Нажимает "Позже"
4. Окно закрывается
5. Перезагружает страницу → окно НЕ появляется (в текущей сессии)
6. Выходит и входит снова → окно ПОЯВЛЯЕТСЯ снова ✅
7. На этот раз выбирает "Да, активировать"
8. Окно больше не появляется никогда ✅
```

## Проблемы и решения

### ❌ Окно не появляется для нового пользователя

**Проблема:** Окно не показывается при первом входе

**Решение:**
```sql
-- Сбросить ai_permission для тестового пользователя
UPDATE user_settings 
SET ai_permission = NULL 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'ваш-тестовый-email@example.com'
);
```

### ❌ Окно появляется каждый раз даже после выбора "Да"

**Проблема:** Выбор не сохраняется в БД

**Решение:**
1. Проверьте, есть ли колонка ai_permission:
```sql
SELECT * FROM user_settings LIMIT 1;
```

2. Проверьте Row Level Security политики:
```sql
-- Проверить политики для user_settings
SELECT * FROM pg_policies 
WHERE tablename = 'user_settings';
```

3. Убедитесь, что политика UPDATE разрешена:
```sql
-- Если политики нет, создайте её
CREATE POLICY "Users can update their own settings"
ON user_settings FOR UPDATE
USING (auth.uid() = user_id);
```

### ❌ Окно появляется сразу, без задержки

**Проблема:** UX - окно мешает загрузке

**Исправлено:** В AIPermissionManager.tsx есть задержка 1.5 секунды:
```typescript
setTimeout(() => {
  setShowModal(true);
  setHasCheckedOnLogin(true);
}, 1500); // ← 1.5 секунды
```

Можно изменить на другое значение, например 3 секунды (3000).

## Что делать, если нужно изменить решение

Пользователь уже выбрал "Никогда", но передумал и хочет активировать AI:

**Вариант 1: Через SQL (для админов)**
```sql
UPDATE user_settings 
SET ai_permission = 'yes' 
WHERE user_id = 'user-id-здесь';
```

**Вариант 2: Добавить переключатель в Settings**

В будущем можно добавить в `/src/app/pages/Settings.tsx`:

```tsx
<div className="setting-item">
  <label>AI Помощник</label>
  <Switch 
    checked={settings.ai_permission === 'yes'}
    onCheckedChange={(checked) => 
      updateSettings({ 
        ai_permission: checked ? 'yes' : 'never' 
      })
    }
  />
  <p>Включить умный анализ подписок и прогноз трат с помощью TensorFlow.js</p>
</div>
```

## TensorFlow.js Features

После активации AI доступны функции:

1. **📧 Парсинг писем** - `/src/app/utils/tensorflow.ts` → `parseEmailForSubscription()`
2. **📊 Прогноз трат** - `/src/app/utils/tensorflow.ts` → `predictSpending()`
3. **💡 Альтернативы** - `/src/app/utils/tensorflow.ts` → `getServiceAlternatives()`

---

**Дата:** 25 марта 2026  
**Статус:** ✅ ГОТОВО  
**Версия TensorFlow.js:** Последняя стабильная
