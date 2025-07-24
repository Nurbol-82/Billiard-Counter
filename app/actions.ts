"use server"

import { createClient, type SupabaseClient } from "@supabase/supabase-js" // Импортируем SupabaseClient для типизации

// Убедитесь, что эти переменные окружения установлены в вашем проекте Vercel.
// NEXT_PUBLIC_SUPABASE_URL должен быть общедоступным (public),
// а SUPABASE_SERVICE_ROLE_KEY - секретным (secret).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseServer: SupabaseClient | null = null // Объявляем клиент как nullable

// Инициализируем клиент Supabase только если обе переменные установлены
if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false, // Не сохраняем сессию на сервере
    },
  })
} else {
  console.warn("Supabase credentials are not fully set. Supabase features will be disabled.")
  console.warn("Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured.")
}

interface MatchRecord {
  date: string
  title: string
  winner: string // Имя победителя
  loser: string // Имя проигравшего
  winnerScore: number // Счет победителя
  loserScore: number // Счет проигравшего
}

/**
 * Получает историю матчей из Supabase.
 */
export async function getSupabaseMatchHistory(): Promise<MatchRecord[]> {
  if (!supabaseServer) {
    // Проверяем, инициализирован ли клиент
    console.warn("Supabase client not initialized. Cannot fetch match history.")
    return []
  }
  // Выбираем новые поля
  const { data, error } = await supabaseServer
    .from("matches")
    .select("id, date, title, winner, loser, winnerScore, loserScore")
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching match history:", error)
    return []
  }
  return data as MatchRecord[]
}

/**
 * Добавляет новый матч в историю Supabase.
 * @param match Запись матча для добавления.
 */
export async function addSupabaseMatch(match: MatchRecord): Promise<void> {
  if (!supabaseServer) {
    // Проверяем, инициализирован ли клиент
    console.warn("Supabase client not initialized. Cannot add match to history.")
    return
  }
  // Вставляем новые поля
  const { error } = await supabaseServer.from("matches").insert({
    date: match.date,
    title: match.title,
    winner: match.winner,
    loser: match.loser,
    winnerScore: match.winnerScore,
    loserScore: match.loserScore,
  })

  if (error) {
    console.error("Error adding match:", error)
    throw new Error("Failed to add match to history.")
  }
}

/**
 * Очищает всю историю матчей в Supabase.
 */
export async function clearSupabaseHistory(): Promise<void> {
  if (!supabaseServer) {
    // Проверяем, инициализирован ли клиент
    console.warn("Supabase client not initialized. Cannot clear match history.")
    return
  }
  const { error } = await supabaseServer.from("matches").delete().neq("id", 0) // Удаляем все записи

  if (error) {
    console.error("Error clearing match history:", error)
    throw new Error("Failed to clear match history.")
  }
}
