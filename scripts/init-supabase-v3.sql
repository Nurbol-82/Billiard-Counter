-- Создаем новую таблицу для истории турниров
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT NOT NULL,
    winner TEXT NOT NULL,
    "secondPlace" TEXT NOT NULL,
    "thirdPlace" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Опционально: Включаем Row Level Security (RLS) для лучшей безопасности
-- ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Опционально: Создаем политику для анонимных пользователей для вставки/чтения (настройте по мере необходимости)
-- CREATE POLICY "Allow public read access to tournaments" ON public.tournaments FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert access to tournaments" ON public.tournaments FOR INSERT WITH CHECK (true);

-- Создаем индекс для поля date для более быстрого фильтрации по дате
CREATE INDEX IF NOT EXISTS idx_tournaments_date ON public.tournaments (date);

-- Создаем индексы для полей winner, secondPlace, thirdPlace для более быстрого получения статистики
CREATE INDEX IF NOT EXISTS idx_tournaments_winner ON public.tournaments (winner);
CREATE INDEX IF NOT EXISTS idx_tournaments_second_place ON public.tournaments ("secondPlace");
CREATE INDEX IF NOT EXISTS idx_tournaments_third_place ON public.tournaments ("thirdPlace");
