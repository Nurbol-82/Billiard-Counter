interface MatchRecord {
  date: string
  title: string
  player1: string
  score1: number
  player2: string
  score2: number
}

export class StorageManager {
  // Удалены MATCH_HISTORY_KEY и связанные с ним методы
  private PLAYER_NAMES_KEY = "billiards_player_names"

  constructor() {
    // Миграция истории больше не нужна здесь, так как история матчей будет в Supabase
  }

  /**
   * Save player names to localStorage
   * @param {string[]} names - Array of player names
   */
  savePlayerNames(names: string[]): void {
    try {
      localStorage.setItem(this.PLAYER_NAMES_KEY, JSON.stringify(names))
    } catch (error) {
      console.error("Error saving player names:", error)
    }
  }

  /**
   * Get player names from localStorage
   * @returns {string[] | null} Array of player names or null if not found
   */
  getPlayerNames(): string[] | null {
    try {
      const names = localStorage.getItem(this.PLAYER_NAMES_KEY)
      return names ? JSON.parse(names) : null
    } catch (error) {
      console.error("Error reading player names:", error)
      return null
    }
  }
}
