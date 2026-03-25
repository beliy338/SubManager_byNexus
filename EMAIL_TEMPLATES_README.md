# 📧 Email Templates Documentation

## Обзор

Данный документ содержит спецификацию двух триггерных email-рассылок для менеджера подписок **SubManager**:

- **D-3 Template** - за 3 дня до списания средств
- **D-1 Template** - за 1 день до списания средств

## 🎨 Просмотр макетов

Для просмотра интерактивных макетов всех email-шаблонов:

**URL:** `/email-templates`

Страница включает:
- ✅ Превью обоих шаблонов с плейсхолдерами
- ✅ User Flow диаграмму (Email → Dashboard → Action)
- ✅ Технические рекомендации по интеграции
- ✅ Список всех плейсхолдеров для backend

---

## 📋 Шаблон D-3: "За 3 дня до списания"

### Тема письма
```
Напоминание: скоро списание по подписке {Название_сервиса}
```

### Характеристики
- **Цель:** Информировать пользователя заранее о предстоящем списании
- **Тон:** Дружелюбный, информативный
- **Стиль:** Минималистичный финтех
- **Ширина:** max 600px (стандарт для email-клиентов)

### Структура

1. **Header**
   - Логотип SubManager
   - Название приложения

2. **Приветствие**
   ```
   Привет, {Имя_пользователя}!
   ```

3. **Информационная карточка**
   - Иконка сервиса (можно использовать дефолтную)
   - Название сервиса: `{Название_сервиса}`
   - Сумма списания: `{Сумма} {Валюта}`
   - Дата списания: `{Дата_списания} (через 3 дня)`

4. **CTA (Call to Action)**
   - Кнопка: **"Управлять подпиской"**
   - URL: `https://your-app.com/dashboard/subscriptions?id={Subscription_ID}`

5. **Блок помощи "Не узнаёте сервис?"**
   - Текст: "Если вы не оформляли эту подписку или хотите её отменить..."
   - Ссылка: "Сообщить о проблеме →"
   - URL: `https://your-app.com/support?subscription={Subscription_ID}`

6. **Footer**
   - Автоматическое напоминание
   - Ссылки: Настройки уведомлений, Политика конфиденциальности
   - Copyright © 2026 SubManager

### Плейсхолдеры (D-3)

| Плейсхолдер | Тип данных | Источник (БД) | Пример |
|-------------|-----------|---------------|--------|
| `{Имя_пользователя}` | string | users.name или users.email | "Иван" |
| `{Название_сервиса}` | string | subscriptions.name | "Яндекс Плюс" |
| `{Сумма}` | number | subscriptions.amount | 399 |
| `{Валюта}` | string | subscriptions.currency | "₽" |
| `{Дата_списания}` | date | subscriptions.next_billing_date | "19 марта 2026" |
| `{Subscription_ID}` | uuid | subscriptions.id | "abc123..." |

---

## 📋 Шаблон D-1: "За 1 день до списания"

### Тема письма
```
Завтра спишем оплату за {Название_сервиса}
```

### Характеристики
- **Цель:** Срочное напоминание с возможностью немедленных действий
- **Тон:** Срочный, но не агрессивный
- **Акценты:** Оранжевый цвет для даты списания (подчёркивает срочность)
- **Ширина:** max 600px

### Структура

1. **Header**
   - Логотип SubManager
   - Название приложения

2. **Приветствие (срочное)**
   ```
   {Имя_пользователя}, завтра списание!
   ```

3. **Карточка срочного уведомления**
   - Иконка предупреждения (AlertTriangle)
   - Заголовок: "Списание через 24 часа"
   - Фон: светло-оранжевый (#fff7ed)
   
4. **Информация о подписке**
   - Название сервиса: `{Название_сервиса}`
   - **Сумма к списанию:** `{Сумма} {Валюта}` (крупный шрифт)
   - **Дата списания:** `{Дата_списания}` (в оранжевом блоке с пометкой "Завтра!")
   - Платёжный метод: "Карта: •••• {Последние_4_цифры}"

5. **CTA buttons (две кнопки)**
   
   **Primary CTA:**
   - Кнопка: **"Проверить карту / Пополнить баланс"**
   - URL: `https://your-app.com/dashboard/payment-methods?check=true`
   - Стиль: Фиолетовая (#9333ea)
   
   **Secondary CTA:**
   - Кнопка: **"Отменить подписку"**
   - URL: `https://your-app.com/dashboard/subscriptions/{Subscription_ID}/cancel`
   - Стиль: Обводка, красный текст

6. **Предупреждение**
   - ⚠️ "Важно: Если списание не пройдёт из-за недостатка средств, доступ к сервису может быть приостановлен."

7. **Footer**
   - Срочное уведомление
   - Ссылки: Настройки, Управление подпиской, Политика конфиденциальности
   - Copyright © 2026 SubManager

### Плейсхолдеры (D-1)

| Плейсхолдер | Тип данных | Источник (БД) | Пример |
|-------------|-----------|---------------|--------|
| `{Имя_пользователя}` | string | users.name или users.email | "Иван" |
| `{Название_сервиса}` | string | subscriptions.name | "Яндекс Плюс" |
| `{Сумма}` | number | subscriptions.amount | 399 |
| `{Валюта}` | string | subscriptions.currency | "₽" |
| `{Дата_списания}` | date | subscriptions.next_billing_date | "19 марта 2026" |
| `{Subscription_ID}` | uuid | subscriptions.id | "abc123..." |
| `{Последние_4_цифры}` | string | payment_methods.last4 | "1234" |
| `{User_Email}` | string | users.email | "user@example.com" |

---

## 🔗 URL Structure для CTA кнопок

### D-3 URLs
```
Управление подпиской:
https://your-app.com/dashboard/subscriptions?id={Subscription_ID}

Сообщить о проблеме:
https://your-app.com/support?subscription={Subscription_ID}
```

### D-1 URLs
```
Проверка карты / Пополнение:
https://your-app.com/dashboard/payment-methods?check=true

Отмена подписки:
https://your-app.com/dashboard/subscriptions/{Subscription_ID}/cancel

Личный кабинет:
https://your-app.com/dashboard
```

---

## 🛠 Backend: Техническая реализация

### 1. Триггеры отправки

**Рекомендуемая реализация:** Supabase Edge Function с cron job

```typescript
// Pseudo-code для Edge Function

// Запускать каждый день в 9:00 UTC
export async function sendEmailNotifications() {
  const today = new Date();
  
  // D-3: Найти подписки, у которых списание через 3 дня
  const d3Subscriptions = await supabase
    .from('subscriptions')
    .select('*, users(*), payment_methods(*)')
    .eq('status', 'active')
    .eq('next_billing_date', addDays(today, 3));
  
  // D-1: Найти подписки, у которых списание завтра
  const d1Subscriptions = await supabase
    .from('subscriptions')
    .select('*, users(*), payment_methods(*)')
    .eq('status', 'active')
    .eq('next_billing_date', addDays(today, 1));
  
  // Отправка D-3
  for (const sub of d3Subscriptions) {
    await sendEmail({
      to: sub.users.email,
      template: 'D3_REMINDER',
      data: {
        userName: sub.users.name || sub.users.email.split('@')[0],
        serviceName: sub.name,
        amount: sub.amount,
        currency: sub.currency,
        billingDate: formatDate(sub.next_billing_date),
        subscriptionId: sub.id
      }
    });
    
    // Логирование
    await logEmailSent(sub.id, 'D3_REMINDER');
  }
  
  // Отправка D-1
  for (const sub of d1Subscriptions) {
    await sendEmail({
      to: sub.users.email,
      template: 'D1_URGENT',
      data: {
        userName: sub.users.name || sub.users.email.split('@')[0],
        serviceName: sub.name,
        amount: sub.amount,
        currency: sub.currency,
        billingDate: formatDate(sub.next_billing_date),
        subscriptionId: sub.id,
        last4: sub.payment_methods?.last4 || '••••'
      }
    });
    
    await logEmailSent(sub.id, 'D1_URGENT');
  }
}
```

### 2. Создание таблицы email_logs

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id),
  user_id UUID REFERENCES users(id),
  template_type VARCHAR(50), -- 'D3_REMINDER' или 'D1_URGENT'
  sent_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'failed', 'bounced'
  error_message TEXT
);

CREATE INDEX idx_email_logs_subscription ON email_logs(subscription_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);
```

### 3. Email сервис

**Рекомендуемые провайдеры:**
- ✅ **Resend** (https://resend.com) - современный, хорошая deliverability
- ✅ **SendGrid** - популярный, много функций
- ✅ **Mailgun** - надёжный
- ✅ **Amazon SES** - дешёвый, но сложнее настроить

**Интеграция с Resend (рекомендуется):**

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, template, data }) {
  const emailHTML = renderTemplate(template, data);
  
  const result = await resend.emails.send({
    from: 'SubManager <noreply@submanager.app>',
    to: [to],
    subject: getSubjectForTemplate(template, data),
    html: emailHTML,
  });
  
  return result;
}
```

### 4. Настройка Cron Job в Supabase

```sql
-- В Supabase Dashboard → Database → Cron Jobs

SELECT cron.schedule(
  'send-email-notifications',  -- название
  '0 9 * * *',                  -- каждый день в 9:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-notifications',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR_ANON_KEY')
  );
  $$
);
```

---

## 🎨 Верстка Email (HTML/CSS)

### Ключевые рекомендации

1. **Использовать таблицы для layout**
   - Email-клиенты (особенно Outlook) плохо поддерживают flexbox/grid
   - Все элементы обернуть в `<table>`, `<tr>`, `<td>`

2. **Inline CSS**
   - Все стили должны быть inline: `style="..."`
   - Не использовать внешние CSS файлы или `<style>` теги
   - Некоторые клиенты удаляют `<head>` секцию

3. **Максимальная ширина 600px**
   ```html
   <table style="max-width: 600px; margin: 0 auto;">
   ```

4. **Web-safe шрифты с fallback**
   ```css
   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                Roboto, 'Helvetica Neue', Arial, sans-serif;
   ```

5. **Абсолютные URLs для изображений**
   ```html
   <img src="https://your-cdn.com/logo.png" alt="Logo" />
   ```

6. **Media Queries для мобильных**
   ```html
   <style>
     @media only screen and (max-width: 600px) {
       .mobile-full { width: 100% !important; }
     }
   </style>
   ```

### Базовая структура HTML

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Напоминание о подписке</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <table role="presentation" cellpadding="0" cellspacing="0" 
         style="width: 100%; max-width: 600px; margin: 0 auto; 
                background-color: #ffffff; font-family: Arial, sans-serif;">
    <tr>
      <td style="padding: 32px 24px;">
        <!-- Содержимое письма -->
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 🧪 Тестирование

### Email-клиенты для тестирования

- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Desktop, Web)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yandex Mail (важно для российской аудитории!)
- ✅ Mail.ru

### Инструменты

- **Litmus** (https://litmus.com) - платформа для тестирования писем
- **Email on Acid** - альтернатива Litmus
- **Mailtrap** (https://mailtrap.io) - для тестирования в dev среде

### Проверка перед отправкой

- [ ] HTML валидация
- [ ] Все ссылки работают
- [ ] Плейсхолдеры корректно заме��яются
- [ ] Отображение на desktop (600px)
- [ ] Отображение на mobile (375px)
- [ ] Проверка в Gmail, Outlook, Yandex
- [ ] Проверка темы письма (не более 60 символов)
- [ ] Alt-текст для всех изображений

---

## 📊 User Flow: Email → Dashboard

### Полный путь пользователя

```
1. Email получен
   ↓
2. Пользователь читает письмо
   ↓
3. Клик по CTA кнопке
   ↓
4. Переход на сайт (https://your-app.com/dashboard/subscriptions?id=...)
   ↓
5. Проверка аторизации (Supabase Auth)
   ├─ НЕ авторизован → Redirect на /login с return_url
   └─ Авторизован → Переход на дашборд
   ↓
6. Frontend обрабатывает URL параметры
   ↓
7. Автоматическое открытие модалки с подпиской (по ID)
   ↓
8. Пользователь выполняет действие:
   ├─ Проверяет/обновляет карту
   ├─ Управляет подпиской
   └─ Отменяет подписку
   ↓
9. Подтверждение действия (toast notification)
   ↓
10. Email-подтверждение изменений
```

### Обработка на Frontend (React)

```typescript
// В компоненте Dashboard.tsx
import { useSearchParams } from 'react-router';

function Dashboard() {
  const [searchParams] = useSearchParams();
  const subscriptionId = searchParams.get('id');
  
  useEffect(() => {
    if (subscriptionId) {
      // Открыть модалку с подпиской
      openSubscriptionModal(subscriptionId);
    }
  }, [subscriptionId]);
}
```

---

## 🌍 Локализация

Шаблоны поддерживают мультиязычность (русский, английский).

### Переключение языка

```typescript
function getSubjectForTemplate(template: string, lang: string, data: any) {
  if (template === 'D3_REMINDER') {
    return lang === 'ru' 
      ? `Напоминание: скоро списание по подписке ${data.serviceName}`
      : `Reminder: upcoming charge for ${data.serviceName}`;
  }
  
  if (template === 'D1_URGENT') {
    return lang === 'ru'
      ? `Завтра спишем оплату за ${data.serviceName}`
      : `Tomorrow we'll charge for ${data.serviceName}`;
  }
}
```

---

## 📞 Контакты и поддержка

Если у вас возникли вопросы по интеграции email-шаблонов:

- 📄 Просмотр макетов: `/email-templates`
- 🎨 Дизайн: Соответствует фирменному стилю SubManager (оранжево-фиолетовая палитра)
- 💬 Поддержка: Через чат поддержки в приложении

---

## ✅ Чеклист интеграции

- [ ] Создать Supabase Edge Function для отправки писем
- [ ] Настроить cron job (каждый день в 9:00 UTC)
- [ ] Создать таблицу `email_logs` в БД
- [ ] Зарегистрироваться в email-сервисе (Resend/SendGrid)
- [ ] Сверстать HTML-шаблоны на основе макетов
- [ ] Реализовать функцию замены плейсхолдеров
- [ ] Протестировать отправку в dev среде (Mailtrap)
- [ ] Протестировать в основных email-клиентах
- [ ] Проверить правильность URL в CTA кнопках
- [ ] Настроить обработку URL параметров на frontend
- [ ] Добавить логирование отправок
- [ ] Настроить monitoring (успешные/неуспешные отправки)
- [ ] Deploy на production
- [ ] Мониторинг deliverability первые 7 дней

---

**Дата создания:** 16 марта 2026  
**Версия:** 1.0  
**Статус:** ✅ Готово к интеграции