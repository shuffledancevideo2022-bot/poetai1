-- Включаем UUID расширение если нет
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создаём таблицу профилей пользователей с балансом кредитов
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT,
    display_name TEXT,
    credits INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Политики для профилей
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Таблица продуктов (пакеты кредитов и подписки)
CREATE TABLE public.credit_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    price_rub DECIMAL(10, 2) NOT NULL,
    price_usd DECIMAL(10, 2),
    price_eur DECIMAL(10, 2),
    product_type TEXT NOT NULL CHECK (product_type IN ('package', 'subscription')),
    periodicity TEXT, -- monthly, yearly (для подписок)
    lava_offer_id TEXT, -- ID продукта в Lava.top
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS для продуктов (публичное чтение)
ALTER TABLE public.credit_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
ON public.credit_products FOR SELECT
USING (is_active = true);

-- Таблица транзакций/платежей
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.credit_products(id),
    lava_invoice_id TEXT UNIQUE,
    lava_contract_id TEXT,
    email TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'RUB',
    credits_amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS для платежей
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

-- Таблица подписок
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.credit_products(id) NOT NULL,
    lava_subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    credits_per_period INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- RLS для подписок
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Таблица истории использования кредитов
CREATE TABLE public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL, -- положительное = начисление, отрицательное = списание
    balance_after INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'subscription', 'usage', 'refund', 'bonus')),
    description TEXT,
    reference_id UUID, -- ссылка на payment_id или другую сущность
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS для истории кредитов
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credit history"
ON public.credit_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Триггер для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, credits)
    VALUES (NEW.id, NEW.email, 5); -- 5 бесплатных кредитов при регистрации
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Функция для начисления кредитов (используется webhook'ом)
CREATE OR REPLACE FUNCTION public.add_credits(
    _user_id UUID,
    _amount INTEGER,
    _transaction_type TEXT,
    _description TEXT,
    _reference_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _new_balance INTEGER;
BEGIN
    -- Обновляем баланс
    UPDATE public.profiles
    SET credits = credits + _amount
    WHERE user_id = _user_id
    RETURNING credits INTO _new_balance;
    
    -- Записываем транзакцию
    INSERT INTO public.credit_transactions (user_id, amount, balance_after, transaction_type, description, reference_id)
    VALUES (_user_id, _amount, _new_balance, _transaction_type, _description, _reference_id);
    
    RETURN _new_balance;
END;
$$;

-- Функция для списания кредитов (используется при генерации)
CREATE OR REPLACE FUNCTION public.use_credits(
    _user_id UUID,
    _amount INTEGER,
    _description TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _current_balance INTEGER;
    _new_balance INTEGER;
BEGIN
    -- Проверяем текущий баланс
    SELECT credits INTO _current_balance
    FROM public.profiles
    WHERE user_id = _user_id;
    
    IF _current_balance IS NULL OR _current_balance < _amount THEN
        RETURN FALSE;
    END IF;
    
    -- Списываем кредиты
    UPDATE public.profiles
    SET credits = credits - _amount
    WHERE user_id = _user_id
    RETURNING credits INTO _new_balance;
    
    -- Записываем транзакцию
    INSERT INTO public.credit_transactions (user_id, amount, balance_after, transaction_type, description)
    VALUES (_user_id, -_amount, _new_balance, 'usage', _description);
    
    RETURN TRUE;
END;
$$;