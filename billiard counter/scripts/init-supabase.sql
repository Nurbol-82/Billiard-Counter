CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    player1 TEXT NOT NULL,
    score1 INTEGER NOT NULL,
    player2 TEXT NOT NULL,
    score2 INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Enable Row Level Security (RLS) for better security
-- ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Optional: Create a policy for anonymous users to insert/read (adjust as needed for your app's logic)
-- CREATE POLICY "Allow public read access" ON public.matches FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert access" ON public.matches FOR INSERT WITH CHECK (true);
