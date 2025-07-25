import { createClient } from "@supabase/supabase-js"

// Создаем клиент Supabase для использования на стороне клиента (браузера)
// Используем NEXT_PUBLIC_ для доступа к переменным окружения на клиенте
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is not set in environment variables.")
  // В продакшене можно выбросить ошибку или использовать заглушку
  // Для v0 preview мы просто выведем ошибку в консоль.
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)
