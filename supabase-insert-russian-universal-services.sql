-- SQL Script to insert Russian Universal Subscription Services
-- This script adds major Russian universal subscription services including telecom bundles and fintech subscriptions
-- These services must be inserted by an owner account (max.sokolvp@gmail.com or belovodvadim@gmail.com)

-- Note: user_id should be set to one of the owner's UUID
-- You need to replace 'OWNER_USER_ID_HERE' with actual UUID from auth.users table

-- Megafon - МегаФон Плюс
INSERT INTO public.services (user_id, name, category, description, icon, is_popular, pricing_plans, created_at, updated_at)
VALUES (
    (SELECT id FROM auth.users WHERE LOWER(email) = 'max.sokolvp@gmail.com' LIMIT 1),
    'МегаФон Плюс',
    'Развлечения',
    'Единая подписка на четыре сервиса: онлайн-кинотеатры IVI и START, книжный сервис MyBook и аудиосервис СберЗвук.',
    '📱',
    true,
    '[
        {
            "name": "Базовый",
            "price": 399,
            "currency": "RUB",
            "billingCycle": "monthly",
            "features": ["IVI", "START", "MyBook", "СберЗвук"]
        }
    ]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- MTS - МТС Premium
INSERT INTO public.services (user_id, name, category, description, icon, is_popular, pricing_plans, created_at, updated_at)
VALUES (
    (SELECT id FROM auth.users WHERE LOWER(email) = 'max.sokolvp@gmail.com' LIMIT 1),
    'МТС Premium',
    'Развлечения',
    'Информация о точной стоимости не найдена. Пожалуйста, проверьте официальный сайт.',
    '📱',
    true,
    '[]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Сбербанк - СберПрайм
INSERT INTO public.services (user_id, name, category, description, icon, is_popular, pricing_plans, created_at, updated_at)
VALUES (
    (SELECT id FROM auth.users WHERE LOWER(email) = 'max.sokolvp@gmail.com' LIMIT 1),
    'СберПрайм',
    'Финансы',
    'Подписка с расширенными привилегиями, кэшбэком бонусами Спасибо и доступом к сервисам экосистемы Сбера.',
    '💳',
    true,
    '[
        {
            "name": "Стандарт",
            "price": 399,
            "currency": "RUB",
            "billingCycle": "monthly",
            "features": ["Кэшбэк баллами Спасибо", "Доступ к сервисам Сбера", "Специальные предложения"]
        }
    ]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Сбербанк - СберПрайм+
INSERT INTO public.services (user_id, name, category, description, icon, is_popular, pricing_plans, created_at, updated_at)
VALUES (
    (SELECT id FROM auth.users WHERE LOWER(email) = 'max.sokolvp@gmail.com' LIMIT 1),
    'СберПрайм+',
    'Финансы',
    'Расширенная версия подписки с максимальным кэшбэком и повышенными надбавками по накопительным счетам.',
    '💎',
    true,
    '[
        {
            "name": "Премиум",
            "price": 599,
            "currency": "RUB",
            "billingCycle": "monthly",
            "features": ["Максимальный кэшбэк", "Повышенные % по накопительным счетам", "Все возможности СберПрайм"]
        }
    ]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Газпром Бонус
INSERT INTO public.services (user_id, name, category, description, icon, is_popular, pricing_plans, created_at, updated_at)
VALUES (
    (SELECT id FROM auth.users WHERE LOWER(email) = 'max.sokolvp@gmail.com' LIMIT 1),
    'Газпром Бонус',
    'Шопинг',
    'Подписка-конструктор: базовая часть дает скидки в Ozon, «Ленте» и АЗС, а к ней можно добавлять множество опций (доставка еды, такси, фитнес и др.) на выбор.',
    '⛽',
    true,
    '[
        {
            "name": "Базовый",
            "price": 399,
            "currency": "RUB",
            "billingCycle": "monthly",
            "features": ["Скидки в Ozon", "Скидки в Ленте", "Скидки на АЗС", "Первый месяц бесплатно"]
        }
    ]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Совкомбанк - Халва.Десятка
INSERT INTO public.services (user_id, name, category, description, icon, is_popular, pricing_plans, created_at, updated_at)
VALUES (
    (SELECT id FROM auth.users WHERE LOWER(email) = 'max.sokolvp@gmail.com' LIMIT 1),
    'Халва.Десятка',
    'Финансы',
    'Подписка для держателей карты «Халва», увеличивающая кэшбэк и рассрочку.',
    '💳',
    true,
    '[
        {
            "name": "Месяц",
            "price": 399,
            "currency": "RUB",
            "billingCycle": "monthly",
            "features": ["Увеличенный кэшбэк", "Расширенная рассрочка", "Первый месяц бесплатно"]
        },
        {
            "name": "Год",
            "price": 3799,
            "currency": "RUB",
            "billingCycle": "yearly",
            "features": ["Увеличенный кэшбэк", "Расширенная рассрочка", "Выгоднее на 991 ₽"]
        }
    ]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Тинькофф Pro
INSERT INTO public.services (user_id, name, category, description, icon, is_popular, pricing_plans, created_at, updated_at)
VALUES (
    (SELECT id FROM auth.users WHERE LOWER(email) = 'max.sokolvp@gmail.com' LIMIT 1),
    'Tinkoff Pro',
    'Финансы',
    'Подписка для клиентов Т-Банка, которая увеличивает ставки по накопительным счетам, кэшбэк и лимиты на бесплатные переводы.',
    '💳',
    true,
    '[
        {
            "name": "Месяц",
            "price": 299,
            "currency": "RUB",
            "billingCycle": "monthly",
            "features": ["Повышенные ставки", "Увеличенный кэшбэк", "Бесплатные переводы"]
        },
        {
            "name": "Год",
            "price": 1990,
            "currency": "RUB",
            "billingCycle": "yearly",
            "features": ["Повышенные ставки", "Увеличенный кэшбэк", "Бесплатные переводы", "Выгоднее на 1598 ₽"]
        }
    ]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Яндекс Плюс
INSERT INTO public.services (user_id, name, category, description, icon, is_popular, pricing_plans, created_at, updated_at)
VALUES (
    (SELECT id FROM auth.users WHERE LOWER(email) = 'max.sokolvp@gmail.com' LIMIT 1),
    'Яндекс Плюс',
    'Развлечения',
    'Базовая подписка на музыку (Яндекс Музыка), фильмы (Кинопоиск) и другие сервисы с кэшбэком баллами.',
    '🟡',
    true,
    '[
        {
            "name": "Месяц",
            "price": 449,
            "currency": "RUB",
            "billingCycle": "monthly",
            "features": ["Яндекс Музыка", "Кинопоиск", "Кэшбэк баллами", "Первые 60 дней бесплатно"]
        },
        {
            "name": "Год",
            "price": 3490,
            "currency": "RUB",
            "billingCycle": "yearly",
            "features": ["Яндекс Музыка", "Кинопоиск", "Кэшбэк баллами", "Выгоднее на 898 ₽"]
        }
    ]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Яндекс Плюс с Амедиатекой
INSERT INTO public.services (user_id, name, category, description, icon, is_popular, pricing_plans, created_at, updated_at)
VALUES (
    (SELECT id FROM auth.users WHERE LOWER(email) = 'max.sokolvp@gmail.com' LIMIT 1),
    'Плюс с Амедиатекой',
    'Развлечения',
    'Подписка, включающая все возможности Яндекс Плюса и доступ к библиотеке сериалов Амедиатеки (HBO, Showtime и др.).',
    '🟡',
    true,
    '[
        {
            "name": "Месяц",
            "price": 599,
            "currency": "RUB",
            "billingCycle": "monthly",
            "features": ["Яндекс Музыка", "Кинопоиск", "Амедиатека (HBO, Showtime)", "Кэшбэк баллами"]
        },
        {
            "name": "Год",
            "price": 4490,
            "currency": "RUB",
            "billingCycle": "yearly",
            "features": ["Яндекс Музыка", "Кинопоиск", "Амедиатека", "Выгоднее на 2698 ₽"]
        }
    ]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- VK Combo / VK Музыка
INSERT INTO public.services (user_id, name, category, description, icon, is_popular, pricing_plans, created_at, updated_at)
VALUES (
    (SELECT id FROM auth.users WHERE LOWER(email) = 'max.sokolvp@gmail.com' LIMIT 1),
    'VK Combo',
    'Развлечения',
    'Комбинированная подписка от VK, объединяющая музыку, облако, книги и игры.',
    '🎵',
    true,
    '[
        {
            "name": "VK Music Unlimited",
            "price": 899,
            "currency": "RUB",
            "billingCycle": "monthly",
            "features": ["VK Музыка", "VK Облако", "Книги", "Игры"]
        }
    ]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- OZON Premium
INSERT INTO public.services (user_id, name, category, description, icon, is_popular, pricing_plans, created_at, updated_at)
VALUES (
    (SELECT id FROM auth.users WHERE LOWER(email) = 'max.sokolvp@gmail.com' LIMIT 1),
    'OZON Premium',
    'Шопинг',
    'Подписка, которая дает повышенный кэшбэк, доступ к фильмам и сериалам, а также скидки на Ozon.',
    '🛒',
    true,
    '[
        {
            "name": "Месяц",
            "price": 199,
            "currency": "RUB",
            "billingCycle": "monthly",
            "features": ["Повышенный кэшбэк", "Фильмы и сериалы", "Скидки на Ozon"]
        },
        {
            "name": "Год",
            "price": 1790,
            "currency": "RUB",
            "billingCycle": "yearly",
            "features": ["Повышенный кэшбэк", "Фильмы и сериалы", "Скидки на Ozon", "Выгоднее на 598 ₽"]
        }
    ]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- X5 Group - Пакет
INSERT INTO public.services (user_id, name, category, description, icon, is_popular, pricing_plans, created_at, updated_at)
VALUES (
    (SELECT id FROM auth.users WHERE LOWER(email) = 'max.sokolvp@gmail.com' LIMIT 1),
    'Х5 Клуб Пакет',
    'Шопинг',
    'Подписка для программы лояльности «Х5 Клуб», позволяющая получать повышенный кэшбэк баллами в «Пятёрочке» и «Перекрёстке».',
    '🛒',
    true,
    '[
        {
            "name": "Год",
            "price": 900,
            "currency": "RUB",
            "billingCycle": "yearly",
            "features": ["Повышенный кэшбэк в Пятёрочке", "Повышенный кэшбэк в Перекрёстке", "Специальные предложения"]
        }
    ]'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Successfully inserted Russian universal subscription services!';
    RAISE NOTICE 'Total services added: 12';
    RAISE NOTICE 'Categories: Развлечения, Финансы, Шопинг';
END $$;
