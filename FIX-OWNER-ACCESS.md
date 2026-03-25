# Исправление доступа для владельца belovodvadim@gmail.com

## Проблема
Аккаунт `belovodvadim@gmail.com` не может добавлять новые сервисы из-за ограничений RLS политик в Supabase.

## Решение

### Шаг 1: Обновите RLS политики в Supabase

1. Откройте **Supabase Dashboard** → выберите ваш проект
2. Перейдите в **SQL Editor** (боковая панель слева)
3. Скопируйте и выполните содержимое файла `fix-owner-policies.sql`

Этот скрипт:
- Удалит старые политики
- Создаст новые политики с проверкой email без учета регистра (`LOWER()`)
- Проверит, что политики созданы правильно

### Шаг 2: Проверьте email в Supabase Auth

1. В Supabase Dashboard перейдите в **Authentication** → **Users**
2. Найдите пользователя с email `belovodvadim@gmail.com`
3. Убедитесь, что email записан именно как `belovodvadim@gmail.com` (в нижнем регистре)
4. Если email записан в другом регистре (например, `BelovodVadim@gmail.com`), обновите его на `belovodvadim@gmail.com`

### Шаг 3: Проверьте работу

1. Выйдите из аккаунта `belovodvadim@gmail.com` в приложении
2. Войдите заново
3. Попробуйте добавить новый сервис через кнопку "Добавить подписку"
4. Проверьте консоль браузера (F12) на наличие ошибок

## Что было исправлено в коде

### 1. SQL политики (`fix-owner-policies.sql`)
Добавлена функция `LOWER()` для сравнения email без учета регистра:
```sql
LOWER(auth.jwt() ->> 'email') IN ('max.sokolvp@gmail.com', 'belovodvadim@gmail.com')
```

### 2. Функция проверки владельца (`src/app/utils/roles.ts`)
Обновлена для работы с любым регистром email:
```typescript
const userEmail = user.email.toLowerCase().trim();
const isOwnerUser = OWNER_EMAILS.includes(userEmail);
```

### 3. Обработка ошибок (`src/app/components/AddServiceModal.tsx`)
Добавлена детальная диагностика ошибок с выводом в консоль:
- Email пользователя
- Детали ошибки от Supabase
- Специальное сообщение для ошибок прав доступа

## Диагностика проблем

Если проблема сохраняется, проверьте консоль браузера (F12) при попытке добавить сервис. Вы увидите:

1. **Email пользователя:**
   ```
   Creating service with user: belovodvadim@gmail.com
   ```

2. **Проверка прав:**
   ```
   isOwner check: { email: "belovodvadim@gmail.com", isOwner: true }
   ```

3. **Детали ошибки Supabase** (если есть):
   ```
   Supabase error: { code: "42501", message: "..." }
   ```

Если `isOwner: false`, значит email в базе данных отличается от `belovodvadim@gmail.com`.

Если код ошибки `42501`, значит RLS политики не обновлены в Supabase.

## Контакты владельцев
- max.sokolvp@gmail.com
- belovodvadim@gmail.com

Оба email должны иметь полные права на создание, редактирование и удаление сервисов.
