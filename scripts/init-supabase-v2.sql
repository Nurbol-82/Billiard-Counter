-- Миграция для обновления таблицы public.matches
-- Добавляем новые столбцы для победителя, проигравшего и их счетов
ALTER TABLE public.matches
ADD COLUMN winner TEXT,
ADD COLUMN loser TEXT,
ADD COLUMN "winnerScore" INTEGER,
ADD COLUMN "loserScore" INTEGER;

-- Обновляем существующие записи, если это необходимо (например, если вы хотите перенести старые данные)
-- В данном случае, поскольку старые поля удаляются, мы просто добавляем новые.
-- Если бы старые данные были важны, здесь была бы логика их переноса.

-- Удаляем старые столбцы player1, score1, player2, score2
ALTER TABLE public.matches
DROP COLUMN player1,
DROP COLUMN score1,
DROP COLUMN player2,
DROP COLUMN score2;

-- Опционально: Добавляем NOT NULL ограничения, если эти поля всегда должны быть заполнены
-- ALTER TABLE public.matches ALTER COLUMN winner SET NOT NULL;
-- ALTER TABLE public.matches ALTER COLUMN loser SET NOT NULL;
-- ALTER TABLE public.matches ALTER COLUMN "winnerScore" SET NOT NULL;
-- ALTER TABLE public.matches ALTER COLUMN "loserScore" SET NOT NULL;

-- Создаем индекс для поля date для более быстрого фильтрации по дате
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches (date);

-- Создаем индексы для полей winner и loser для более быстрого получения статистики
CREATE INDEX IF NOT EXISTS idx_matches_winner ON public.matches (winner);
CREATE INDEX IF NOT EXISTS idx_matches_loser ON public.matches (loser);
