"use server"

import { createClient, type SupabaseClient } from "@supabase/supabase-js" // Импортируем SupabaseClient для типизации
import { DateUtils } from "@/lib/date-utils" // Импортируем DateUtils для получения текущей даты

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

interface TournamentRecord {
  id?: string // ID может быть опциональным при вставке
  date: string
  winner: string
  secondPlace: string
  thirdPlace: string
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

/**
 * Добавляет новый завершенный турнир в историю Supabase.
 * @param tournament Запись турнира для добавления.
 */
export async function addSupabaseTournament(tournament: {
  winner: string
  second: string
  third: string
}): Promise<void> {
  if (!supabaseServer) {
    console.warn("Supabase client not initialized. Cannot add tournament to history.")
    return
  }
  const { error } = await supabaseServer.from("tournaments").insert({
    date: DateUtils.getCurrentDateString(), // Используем текущую дату для записи турнира
    winner: tournament.winner,
    secondPlace: tournament.second,
    thirdPlace: tournament.third,
  })

  if (error) {
    console.error("Error adding tournament:", error)
    throw new Error("Failed to add tournament to history.")
  }
}

/**
 * Получает историю турниров из Supabase.
 */
export async function getSupabaseTournamentHistory(): Promise<TournamentRecord[]> {
  if (!supabaseServer) {
    console.warn("Supabase client not initialized. Cannot fetch tournament history.")
    return []
  }
  const { data, error } = await supabaseServer
    .from("tournaments")
    .select("id, date, winner, secondPlace, thirdPlace")
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching tournament history:", error)
    return []
  }
  return data as TournamentRecord[]
}

/**
 * Очищает всю историю турниров в Supabase.
 */
export async function clearSupabaseTournamentHistory(): Promise<void> {
  if (!supabaseServer) {
    console.warn("Supabase client not initialized. Cannot clear tournament history.")
    return
  }
  const { error } = await supabaseServer.from("tournaments").delete().neq("id", 0) // Удаляем все записи

  if (error) {
    console.error("Error clearing tournament history:", error)
    throw new Error("Failed to clear tournament history.")
  }
}
