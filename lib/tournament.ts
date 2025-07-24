import { DateUtils } from "./date-utils"

/**
 * Tournament management class
 * Handles tournament logic, match progression, and player management
 */
export class Tournament {
  private players: string[] // Все 3 игрока
  private scores: [number, number] // Текущие очки в матче
  private currentMatch: number // Индекс текущего матча (0, 1, 2, 3)

  // Состояние для отслеживания игроков и результатов по ходу турнира
  private match1Players: [number, number] | null // Индексы игроков в Матче 1
  private match1Winner: number | null
  private match1Loser: number | null
  private match1Unplayed: number | null // Игрок, который не играл в Матче 1

  private match2Winner: number | null
  private match2Loser: number | null

  private match3Winner: number | null
  private match3Loser: number | null // Проигравший 3-го матча (может быть тем же, что и match1Loser)

  private match4Winner: number | null // Победитель матча за 2-е место (т.е. 2-е место в турнире)
  private match4Loser: number | null // Проигравший матча за 2-е место (т.е. 3-е место в турнире)

  private finalChampion: number | null // Чемпион турнира
  private secondPlacePlayer: number | null // Игрок, занявший 2-е место
  private thirdPlacePlayer: number | null // Игрок, занявший 3-е место

  // Новые свойства для логики "2 победы подряд"
  private playerWins: Map<number, number> // Отслеживание побед для каждого игрока по их индексу
  private championEarlyDeclared: boolean // Флаг, указывающий на досрочное определение чемпиона
  private playoffPlayersFor2nd3rd: [number, number] | null // Игроки для матча за 2-е/3-е место, если чемпион определен досрочно

  // Максимальное количество очков для победы в матче
  private readonly MAX_SCORE = 8

  constructor() {
    this.reset()
  }

  /**
   * Reset tournament to initial state
   */
  reset(): void {
    this.players = ["", "", ""]
    this.scores = [0, 0]
    this.currentMatch = 0

    this.match1Players = null
    this.match1Winner = null
    this.match1Loser = null
    this.match1Unplayed = null

    this.match2Winner = null
    this.match2Loser = null

    this.match3Winner = null
    this.match3Loser = null

    this.match4Winner = null
    this.match4Loser = null

    this.finalChampion = null
    this.secondPlacePlayer = null
    this.thirdPlacePlayer = null

    // Сброс новых свойств
    this.playerWins = new Map()
    this.championEarlyDeclared = false
    this.playoffPlayersFor2nd3rd = null
  }

  /**
   * Start tournament with given player names
   * @param {string[]} playerNames - Array of 3 player names
   * @returns {Object} Match setup information for the first match
   */
  startTournament(playerNames: string[]): {
    title: string
    player1: string
    player2: string
    scores: [number, number]
  } {
    // Validate player names
    if (!this.validatePlayerNames(playerNames)) {
      throw new Error("Все имена игроков должны быть уникальными и не пустыми")
    }

    this.players = [...playerNames]
    this.currentMatch = 0
    this.scores = [0, 0]
    this.playerWins = new Map() // Инициализация для нового турнира
    this.championEarlyDeclared = false // Сброс
    this.playoffPlayersFor2nd3rd = null // Сброс

    // Randomly select two players for Match 1
    const indices = [0, 1, 2]
    const p1Index = indices.splice(Math.floor(Math.random() * indices.length), 1)[0]
    const p2Index = indices.splice(Math.floor(Math.random() * indices.length), 1)[0]
    this.match1Players = [p1Index, p2Index]
    this.match1Unplayed = indices[0] // Игрок, который не играл в Матче 1

    return this.getCurrentMatchInfo()
  }

  /**
   * Validate player names are unique and not empty
   * @param {string[]} names - Player names to validate
   * @returns {boolean} True if valid
   */
  private validatePlayerNames(names: string[]): boolean {
    if (names.length !== 3) return false

    // Check for empty names
    if (names.some((name) => !name.trim())) return false

    // Check for unique names
    const uniqueNames = new Set(names.map((name) => name.trim().toLowerCase()))
    return uniqueNames.size === 3
  }

  /**
   * Get current match information based on tournament state
   * @returns {Object} Current match details
   */
  getCurrentMatchInfo(): { title: string; player1: string; player2: string; scores: [number, number] } {
    const matchTitles = [
      "Первый матч",
      "Второй матч (Победитель 1-го vs Неигравший)",
      "Третий матч (Победитель 2-го vs Проигравший 1-го)",
      "Матч за 2-е и 3-е место", // Унифицированный заголовок для последнего матча
    ]

    let player1Index: number | null = null
    let player2Index: number | null = null
    const titleToUse = this.currentMatch // Индекс заголовка по умолчанию

    // Специальная обработка для матча за 2-е/3-е место
    if (this.currentMatch === 3) {
      // Если чемпион был определен досрочно, игроки для этого матча определяются динамически
      if (this.championEarlyDeclared) {
        if (!this.playoffPlayersFor2nd3rd || this.playoffPlayersFor2nd3rd.length !== 2) {
          throw new Error("Internal error: Playoff players for 2nd/3rd not set.")
        }
        player1Index = this.playoffPlayersFor2nd3rd[0]
        player2Index = this.playoffPlayersFor2nd3rd[1]
      } else {
        // Стандартный путь для Матча 4 (определение 2-го/3-го после того, как чемпион стал M3W)
        if (this.match1Loser === null || this.match2Loser === null) {
          throw new Error("Internal error: Match 1 loser or Match 2 loser not set for Match 4.")
        }
        player1Index = this.match1Loser
        player2Index = this.match2Loser
      }
    } else {
      // Обычная последовательность матчей (Матч 0, 1, 2)
      switch (this.currentMatch) {
        case 0:
          if (!this.match1Players) throw new Error("Internal error: Match 1 players not set.")
          player1Index = this.match1Players[0]
          player2Index = this.match1Players[1]
          break
        case 1:
          if (this.match1Winner === null || this.match1Unplayed === null) {
            throw new Error("Internal error: Match 1 winner or unplayed player not set for Match 2.")
          }
          player1Index = this.match1Winner
          player2Index = this.match1Unplayed
          break
        case 2:
          if (this.match2Winner === null || this.match1Loser === null) {
            throw new Error("Internal error: Match 2 winner or Match 1 loser not set for Match 3.")
          }
          player1Index = this.match2Winner
          player2Index = this.match1Loser
          break
        default:
          throw new Error("Invalid match state.")
      }
    }

    if (player1Index === null || player2Index === null) {
      throw new Error("Internal error: Player indices not determined for current match.")
    }

    return {
      title: matchTitles[titleToUse],
      player1: this.players[player1Index],
      player2: this.players[player2Index],
      scores: [...this.scores],
    }
  }

  /**
   * Add point to a player
   * @param {number} playerNumber - Player number (1 or 2)
   */
  addPoint(playerNumber: 1 | 2): void {
    if (playerNumber === 1) {
      if (this.scores[0] < this.MAX_SCORE) {
        // Проверка на максимальный счет
        this.scores[0]++
      }
    } else if (playerNumber === 2) {
      if (this.scores[1] < this.MAX_SCORE) {
        // Проверка на максимальный счет
        this.scores[1]++
      }
    }
  }

  /**
   * Subtract point from a player
   * @param {number} playerNumber - Player number (1 or 2)
   */
  subtractPoint(playerNumber: 1 | 2): void {
    if (playerNumber === 1 && this.scores[0] > 0) {
      this.scores[0]--
    } else if (playerNumber === 2 && this.scores[1] > 0) {
      this.scores[1]--
    }
  }

  /**
   * Get current scores
   * @returns {Array<number>} Current scores [player1, player2]
   */
  getScores(): [number, number] {
    return [...this.scores]
  }

  /**
   * End current match and progress tournament
   * @returns {Object} Match result and next state, including the match record to be saved
   */
  endMatch(): { completed: boolean; nextMatch?: any; results?: any; matchRecord: any } {
    // Проверка на ничью
    if (this.scores[0] === this.scores[1]) {
      throw new Error("Матч не может закончиться вничью! Продолжайте играть.")
    }

    // Проверка на достижение максимального счета
    const player1ReachedMax = this.scores[0] >= this.MAX_SCORE
    const player2ReachedMax = this.scores[1] >= this.MAX_SCORE

    if (!player1ReachedMax && !player2ReachedMax) {
      throw new Error(`Для завершения матча один из игроков должен набрать ${this.MAX_SCORE} очков.`)
    }

    // Если оба игрока набрали 8 или больше, побеждает тот, у кого больше очков
    if (player1ReachedMax && player2ReachedMax && this.scores[0] === this.scores[1]) {
      throw new Error("Матч не может закончиться вничью! Продолжайте играть.")
    }

    const matchInfo = this.getCurrentMatchInfo()
    const winnerInMatchName = this.scores[0] > this.scores[1] ? matchInfo.player1 : matchInfo.player2
    const loserInMatchName = this.scores[0] > this.scores[1] ? matchInfo.player2 : matchInfo.player1
    const winnerScore = Math.max(this.scores[0], this.scores[1])
    const loserScore = Math.min(this.scores[0], this.scores[1])

    const actualWinnerPlayerIndex = this.players.indexOf(winnerInMatchName)
    const actualLoserPlayerIndex = this.players.indexOf(loserInMatchName)

    // Создаем запись матча для сохранения
    const matchRecord = {
      date: DateUtils.getCurrentDateString(),
      title: matchInfo.title,
      winner: winnerInMatchName,
      loser: loserInMatchName,
      winnerScore: winnerScore,
      loserScore: loserScore,
    }

    // Обновляем счетчик побед для текущего победителя
    this.playerWins.set(actualWinnerPlayerIndex, (this.playerWins.get(actualWinnerPlayerIndex) || 0) + 1)

    // Проверяем на досрочное определение чемпиона (2 победы)
    if (this.playerWins.get(actualWinnerPlayerIndex) === 2) {
      this.finalChampion = actualWinnerPlayerIndex
      this.championEarlyDeclared = true // Устанавливаем флаг

      // Определяем двух игроков, которые будут играть за 2-е и 3-е место.
      // Это те два игрока, которые НЕ являются чемпионом.
      const remainingPlayersIndices = this.players
        .map((_, index) => index)
        .filter((index) => index !== this.finalChampion)

      if (remainingPlayersIndices.length !== 2) {
        throw new Error("Internal error: Could not determine 2nd/3rd place players for early champion.")
      }

      this.playoffPlayersFor2nd3rd = [remainingPlayersIndices[0], remainingPlayersIndices[1]]
      this.currentMatch = 3 // Переходим к состоянию "Матч за 2-е и 3-е место"
      this.scores = [0, 0] // Сброс очков для нового матча

      return {
        completed: false, // Турнир еще не завершен, предстоит еще один матч
        nextMatch: this.getCurrentMatchInfo(),
        matchRecord: matchRecord,
      }
    }

    // Обычная последовательность, если чемпиона не определили досрочно
    switch (this.currentMatch) {
      case 0: // Конец Первого матча
        this.match1Winner = actualWinnerPlayerIndex
        this.match1Loser = actualLoserPlayerIndex
        this.currentMatch = 1 // Переход ко Второму матчу
        break
      case 1: // Конец Второго матча
        this.match2Winner = actualWinnerPlayerIndex
        this.match2Loser = actualLoserPlayerIndex // Проигравший Матча 2
        this.currentMatch = 2 // Переход к Третьему матчу
        break
      case 2: // Конец Третьего матча (Чемпион определяется здесь, если нет досрочного чемпиона)
        this.match3Winner = actualWinnerPlayerIndex // Это чемпион
        this.match3Loser = actualLoserPlayerIndex // Этот игрок проиграл чемпиону

        this.finalChampion = this.match3Winner // Чемпион теперь установлен

        // Теперь переходим к финальному матчу за 2-е и 3-е место (Матч 4)
        this.currentMatch = 3 // Переход к Матчу 4
        break
      case 3: // Конец финального матча (определение 2-го и 3-го места)
        this.match4Winner = actualWinnerPlayerIndex // Это 2-е место
        this.match4Loser = actualLoserPlayerIndex // Это 3-е место

        this.secondPlacePlayer = this.match4Winner
        this.thirdPlacePlayer = this.match4Loser

        return {
          completed: true, // Турнир полностью завершен
          results: this.getTournamentResults(),
          matchRecord: matchRecord,
        }
      default:
        throw new Error("Invalid match progression.")
    }

    this.scores = [0, 0] // Сброс очков для следующего матча
    return {
      completed: false, // Турнир еще не завершен
      nextMatch: this.getCurrentMatchInfo(),
      matchRecord: matchRecord,
    }
  }

  /**
   * Get final tournament results
   * @returns {Object} Tournament results
   */
  getTournamentResults(): { winner: string; second: string; third: string } {
    if (this.finalChampion === null || this.secondPlacePlayer === null || this.thirdPlacePlayer === null) {
      throw new Error("Tournament results not fully determined yet.")
    }

    return {
      winner: this.players[this.finalChampion],
      second: this.players[this.secondPlacePlayer],
      third: this.players[this.thirdPlacePlayer],
    }
  }

  /**
   * Check if tournament is in progress
   * @returns {boolean} True if tournament is active
   */
  isActive(): boolean {
    // Турнир активен, если игроки заданы и не все матчи сыграны (или championEarlyDeclared = true и currentMatch < 3)
    return (
      this.players.some((player) => player !== "") &&
      (this.currentMatch < 3 || (this.championEarlyDeclared && this.currentMatch === 3))
    )
  }

  /**
   * Get all player names
   * @returns {string[]} Player names
   */
  getPlayers(): string[] {
    return [...this.players]
  }
}
