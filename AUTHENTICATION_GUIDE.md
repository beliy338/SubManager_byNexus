# Руководство по Аутентификации SubManager

## Обзор

SubManager теперь полностью интегрирован с Supabase для безопасной аутентификации и облачного хранения данных пользователей.

## Как это работает

### Регистрация новых пользователей

1. Пользователь заполняет форму регистрации на `/signup`
2. Данные отправляются на сервер Supabase через API endpoint `/make-server-076c1030/signup`
3. Сервер создает нового пользователя в Supabase Auth
4. Автоматически инициализируются настройки по умолчанию
5. Пользователь автоматически входит в систему и перенаправляется на дашборд

### Вход существующих пользователей

1. Пользователь вводит email и пароль на `/login`
2. Система проверяет:
   - Сначала тестовые/демо аккаунты (для быстрого доступа)
   - Затем реальные пользователи через Supabase Auth
3. При успешной авторизации получается access_token
4. Пользователь перенаправляется на дашборд

## Типы аккаунтов

### 1. Реальные пользователи (Supabase)
- Создаются через форму регистрации
- Данные хранятся в облаке Supabase
- Синхронизация между устройствами
- Подписки и настройки в Key-Value хранилище

### 2. Демо аккаунт
- Email: `demo@submanager.app`
- Пароль: `админ0`
- Данные в localStorage (локально)
- Быстрый доступ без регистрации

## Хранение данных

### Supabase KV Store структура:

```
settings:{userId}
  - language: 'ru' | 'en' | 'be' | 'zh'
  - currency: 'RUB' | 'USD' | 'EUR' | 'CNY' | 'BYN'
  - fontSize: 'small' | 'medium' | 'large'
  - theme: 'dark' | 'light'

subscriptions:{userId}:{subscriptionId}
  - id: string
  - userId: string
  - name: string
  - category: string
  - price: number
  - billingCycle: 'monthly' | 'yearly'
  - nextBilling: string (ISO date)
  - status: string
  - createdAt: string (ISO date)
  - updatedAt: string (ISO date)
```

## Отладка

### Логи в консоли браузера

При регистрации и входе вы увидите:
- ✅ `Sending signup request to server...`
- ✅ `Signup response status: 200`
- ✅ `Signup successful`
- ✅ `Auto-login successful, redirecting to dashboard`
- ✅ `Loading user data with token: ...`
- ✅ `Loaded subscriptions: 0`
- ✅ `Loaded settings: { ... }`

### Логи на сервере

В Supabase Edge Function:
- ✅ `Signup request received for email: ...`
- ✅ `User created successfully: ...`
- ✅ `Default settings initialized for user: ...`

## Тестирование

### Создание нового аккаунта:

1. Откройте `/signup`
2. Введите:
   - Имя: `Test User`
   - Email: `test@example.com`
   - Пароль: `test123` (минимум 6 символов)
   - Подтверждение пароля: `test123`
3. Нажмите "Создать аккаунт"
4. Проверьте консоль браузера для логов
5. Вы должны автоматически войти и попасть на дашборд

### Проверка синхронизации:

1. После входа добавьте подписку
2. Обновите страницу (F5)
3. Подписка должна остаться (данные из облака)
4. Измените настройки (язык, валюту, тему)
5. Обновите страницу
6. Настройки должны сохраниться

### Проверка на другом устройстве:

1. Откройте приложение на другом устройстве/браузере
2. Войдите с теми же credentials
3. Все данные должны синхронизироваться

## Решение проблем

### Ошибка "Email already registered"
- Пользователь с таким email уже существует
- Используйте другой email или войдите

### Ошибка "Account created successfully, but auto-login failed"
- Аккаунт создан, но автоматический вход не удался
- Попробуйте войти вручную через `/login`

### Ошибка "Invalid email or password"
- Неверный email или пароль
- Проверьте правильность ввода

### Данные не синхронизируются
- Проверьте консоль браузера на ошибки
- Убедитесь, что вы вошли с реальным аккаунтом (не демо)
- Проверьте соединение с интернетом

## Безопасность

- ✅ Пароли хешируются Supabase Auth
- ✅ Access tokens используются для авторизации
- ✅ CORS настроен правильно
- ✅ SUPABASE_SERVICE_ROLE_KEY защищен на сервере
- ✅ Email автоматически подтверждается (не требуется email-сервер)

## API Endpoints

Все endpoints требуют аутентификацию через `Authorization: Bearer {token}`, кроме signup:

- `POST /make-server-076c1030/signup` - Регистрация
- `GET /make-server-076c1030/subscriptions` - Получить подписки
- `POST /make-server-076c1030/subscriptions` - Добавить подписку
- `PUT /make-server-076c1030/subscriptions/:id` - Обновить подписку
- `DELETE /make-server-076c1030/subscriptions/:id` - Удалить подписку
- `GET /make-server-076c1030/settings` - Получить настройки
- `PUT /make-server-076c1030/settings` - Обновить настройки
