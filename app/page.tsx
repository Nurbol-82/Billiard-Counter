"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { StorageManager } from "@/lib/storage"
import { Tournament } from "@/lib/tournament"
import { DateUtils } from "@/lib/date-utils"
import { SoundManager } from "@/lib/sound-manager"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

import { StatsChartSection } from "@/components/stats-chart-section"
import { PodiumIllustration } from "@/components/podium-illustration"
import {
  getSupabaseMatchHistory,
  addSupabaseMatch,
  clearSupabaseHistory,
  // addSupabaseTournament, // Импортируем новую функцию
  // getSupabaseTournamentHistory, // Импортируем новую функцию
  // clearSupabaseTournamentHistory, // Импортируем новую функцию
} from "@/app/actions"
import { TutorialModal } from "@/components/tutorial-modal" // Import the new component

type Screen = "setup" | "match" | "results"

// Обновленный интерфейс MatchRecord для клиента
interface MatchRecord {
  id: string // Добавляем id, так как он возвращается из Supabase
  date: string
  title: string
  winner: string
  loser: string
  winnerScore: number
  loserScore: number
}

// Новый интерфейс TournamentRecord для клиента
interface TournamentRecord {
  id: string
  date: string
  winner: string
  secondPlace: string
  thirdPlace: string
}

export default function Home() {
  const storageManagerRef = useRef(new StorageManager())
  const tournamentRef = useRef(new Tournament())
  const soundManagerRef = useRef(new SoundManager())

  const [playerNames, setPlayerNamesState] = useState<string[]>(["Игрок 1", "Игрок 2", "Игрок 3"])
  const [currentScreen, setCurrentScreen] = useState<Screen>("setup")
  const [currentMatchInfo, setCurrentMatchInfo] = useState<{
    title: string
    player1: string
    player2: string
    scores: [number, number]
  } | null>(null)
  const [tournamentResults, setTournamentResults] = useState<{
    winner: string
    second: string
    third: string
  } | null>(null)
  const [scores, setScores] = useState<[number, number]>([0, 0])
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]) // Используем обновленный тип
  // const [tournamentHistory, setTournamentHistory] = useState<TournamentRecord[]>([]) // Новое состояние для истории турниров
  const [dateFilter, setDateFilter] = useState<string>("")
  const [isLoadingMatchHistory, setIsLoadingMatchHistory] = useState(true) // Переименовано для ясности
  // const [isLoadingTournamentHistory, setIsLoadingTournamentHistory] = useState(true) // Новое состояние загрузки
  const [showTutorialModal, setShowTutorialModal] = useState(false) // New state for tutorial modal

  const setPlayerNames = useCallback((newNames: string[]) => {
    setPlayerNamesState(newNames)
    storageManagerRef.current.savePlayerNames(newNames)
  }, [])

  const loadMatchHistory = useCallback(async () => {
    setIsLoadingMatchHistory(true)
    try {
      const history = await getSupabaseMatchHistory()
      setMatchHistory(history)
    } catch (error) {
      console.error("Failed to load match history:", error)
      setMatchHistory([])
    } finally {
      setIsLoadingMatchHistory(false)
    }
  }, [])

  // const loadTournamentHistory = useCallback(async () => {
  //   setIsLoadingTournamentHistory(true)
  //   try {
  //     const history = await getSupabaseTournamentHistory()
  //     setTournamentHistory(history)
  //   } catch (error) {
  //     console.error("Failed to load tournament history:", error)
  //     setTournamentHistory([])
  //   } finally {
  //     setIsLoadingTournamentHistory(false)
  //   }
  // }, [])

  useEffect(() => {
    loadMatchHistory()
    // loadTournamentHistory() // Загружаем историю турниров при монтировании
  }, [loadMatchHistory])

  useEffect(() => {
    const savedNames = storageManagerRef.current.getPlayerNames()
    if (savedNames) {
      setPlayerNamesState(savedNames)
    }
  }, [])

  const getPlayersForChart = useCallback(() => {
    if (currentScreen === "setup" || currentScreen === "results") {
      return playerNames.filter((name) => name.trim() !== "")
    }
    if (currentMatchInfo) {
      return [currentMatchInfo.player1, currentMatchInfo.player2].filter((name) => name.trim() !== "")
    }
    return []
  }, [currentScreen, playerNames, currentMatchInfo])

  const getPlayerStats = useCallback(
    (players: string[]) => {
      const allMatches = matchHistory
      const stats: { [key: string]: { wins: number; losses: number; totalMatches: number; winDates: string[] } } = {}

      players.forEach((player) => {
        if (player) {
          stats[player] = {
            wins: 0,
            losses: 0,
            totalMatches: 0,
            winDates: [],
          }
        }
      })

      allMatches.forEach((match) => {
        // Используем новые поля winner и loser
        if (match.winner && match.loser && match.winnerScore !== undefined && match.loserScore !== undefined) {
          const winnerInList = players.includes(match.winner)
          const loserInList = players.includes(match.loser)

          if (winnerInList || loserInList) {
            if (stats[match.winner]) {
              stats[match.winner].wins++
              stats[match.winner].totalMatches++
              if (match.date) {
                stats[match.winner].winDates.push(match.date)
              }
            }

            if (stats[match.loser]) {
              stats[match.loser].losses++
              stats[match.loser].totalMatches++
            }
          }
        }
      })
      return stats
    },
    [matchHistory],
  )

  const handleStartTournament = useCallback(async () => {
    try {
      soundManagerRef.current.playButtonClickSound()
      const trimmedPlayerNames = playerNames.map((name) => name.trim())
      const matchInfo = tournamentRef.current.startTournament(trimmedPlayerNames)
      setCurrentMatchInfo(matchInfo)
      setScores(matchInfo.scores)
      setCurrentScreen("match")
      soundManagerRef.current.playStartSound()
      await loadMatchHistory()
      // await loadTournamentHistory() // Обновляем историю турниров
    } catch (error: any) {
      alert(error.message)
    }
  }, [playerNames, loadMatchHistory])

  const handleAddPoint = useCallback((playerNumber: 1 | 2) => {
    soundManagerRef.current.playPointSound()
    tournamentRef.current.addPoint(playerNumber)
    setScores(tournamentRef.current.getScores())
  }, [])

  const handleSubtractPoint = useCallback((playerNumber: 1 | 2) => {
    soundManagerRef.current.playPointSound()
    tournamentRef.current.subtractPoint(playerNumber)
    setScores(tournamentRef.current.getScores())
  }, [])

  const handleEndMatch = useCallback(async () => {
    try {
      soundManagerRef.current.playButtonClickSound()
      const result = tournamentRef.current.endMatch()
      await addSupabaseMatch(result.matchRecord) // Сохраняем запись матча

      if (result.completed) {
        setTournamentResults(result.results)
        setCurrentScreen("results")
        soundManagerRef.current.playWinSound()
        // Сохраняем результаты турнира в новую таблицу
        // if (result.results) {
        //   await addSupabaseTournament(result.results)
        // }
      } else {
        setCurrentMatchInfo(result.nextMatch)
        setScores(result.nextMatch.scores)
        setCurrentScreen("match")
      }
      await loadMatchHistory()
      // await loadTournamentHistory() // Обновляем историю турниров
    } catch (error: any) {
      alert(error.message)
      soundManagerRef.current.playLoseSound()
    }
  }, [loadMatchHistory])

  const handleResetTournament = useCallback(async () => {
    soundManagerRef.current.playButtonClickSound()
    tournamentRef.current.reset()
    setScores([0, 0])
    setCurrentMatchInfo(null)
    setTournamentResults(null)
    setCurrentScreen("setup")
    soundManagerRef.current.playResetSound()
    await loadMatchHistory()
    // await loadTournamentHistory() // Обновляем историю турниров
    setDateFilter("")
  }, [loadMatchHistory])

  const handleClearMatchHistory = useCallback(async () => {
    soundManagerRef.current.playButtonClickSound()
    if (confirm("Вы уверены, что хотите очистить историю матчей?")) {
      await clearSupabaseHistory()
      await loadMatchHistory()
      setDateFilter("")
      soundManagerRef.current.playResetSound()
    }
  }, [loadMatchHistory])

  // const handleClearTournamentHistory = useCallback(async () => {
  //   soundManagerRef.current.playButtonClickSound()
  //   if (confirm("Вы уверены, что хотите очистить историю турниров?")) {
  //     await clearSupabaseTournamentHistory()
  //     await loadTournamentHistory()
  //     soundManagerRef.current.playResetSound()
  //   }
  // }, [loadTournamentHistory])

  const filteredMatchHistory = matchHistory.filter((match) =>
    dateFilter ? DateUtils.matchesDateFilter(match.date, dateFilter) : true,
  )

  const formatMatchEntry = (match: MatchRecord) => {
    // Используем новые поля winner и loser
    const winnerClass = "text-yellow-400 font-semibold"
    const loserClass = "" // Проигравший не получает специальный класс

    return (
      <div className="flex flex-col gap-1">
        <div className="text-xs text-white/80 font-medium opacity-80">{match.date}</div>
        <div className="font-semibold text-green-500 text-sm">{match.title}</div>
        <div className="flex items-center gap-2 text-sm">
          <span className={winnerClass}>
            {match.winner} ({match.winnerScore})
          </span>
          <span className="text-white/70 text-xs opacity-70">vs</span>
          <span className={loserClass}>
            {match.loser} ({match.loserScore})
          </span>
        </div>
      </div>
    )
  }

  // const formatTournamentEntry = (tournament: TournamentRecord) => {
  //   return (
  //     <div className="flex flex-col gap-1">
  //       <div className="text-xs text-white/80 font-medium opacity-80">{tournament.date}</div>
  //       <div className="font-semibold text-yellow-400 text-base">🏆 Победитель: {tournament.winner}</div>
  //       <div className="text-sm text-white/90">🥈 2 место: {tournament.secondPlace}</div>
  //       <div className="text-sm text-white/90">🥉 3 место: {tournament.thirdPlace}</div>
  //     </div>
  //   )
  // }

  return (
    <div className="container">
      <h1 className="relative text-4xl font-bold mb-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-md">
        Турнир по бильярду (Пул 8)
        <span className="absolute right-[-50px] top-1/2 -translate-y-1/2 text-4xl animate-spin-slow">🎱</span>
      </h1>

      {currentScreen === "setup" && (
        <div id="setup" className="my-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Введите имена игроков</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mb-4">
            <Input
              type="text"
              placeholder="Игрок 1"
              value={playerNames[0]}
              onChange={(e) => setPlayerNames([e.target.value, playerNames[1], playerNames[2]])}
              className="bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 min-w-[150px]"
            />
            <Input
              type="text"
              placeholder="Игрок 2"
              value={playerNames[1]}
              onChange={(e) => setPlayerNames([playerNames[0], e.target.value, playerNames[2]])}
              className="bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 min-w-[150px]"
            />
            <Input
              type="text"
              placeholder="Игрок 3"
              value={playerNames[2]}
              onChange={(e) => setPlayerNames([playerNames[0], playerNames[1], e.target.value])}
              className="bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white text-base focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 min-w-[150px]"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
            <Button
              onClick={handleStartTournament}
              className="bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:scale-105"
            >
              Начать турнир
            </Button>
            <Button
              onClick={() => setShowTutorialModal(true)} // Button to open tutorial
              className="bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:scale-105"
            >
              Правила игры
            </Button>
          </div>
        </div>
      )}

      {currentScreen === "match" && currentMatchInfo && (
        <div id="match" className="my-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">{currentMatchInfo.title}</h2>
          <div className="flex flex-col sm:flex-row justify-around items-center my-8 gap-5">
            <Card className="bg-white/10 p-6 rounded-xl min-w-[200px] transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-white">{currentMatchInfo.player1}</h3>
              <div className="text-5xl font-bold my-4 text-green-500 drop-shadow-md">{scores[0]}</div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => handleAddPoint(1)}
                  className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-md text-sm"
                >
                  +1
                </Button>
                <Button
                  onClick={() => handleSubtractPoint(1)}
                  className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-md text-sm"
                >
                  -1
                </Button>
              </div>
            </Card>
            <div className="text-4xl font-bold text-yellow-400 drop-shadow-lg">VS</div>
            <Card className="bg-white/10 p-6 rounded-xl min-w-[200px] transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-white">{currentMatchInfo.player2}</h3>
              <div className="text-5xl font-bold my-4 text-green-500 drop-shadow-md">{scores[1]}</div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => handleAddPoint(2)}
                  className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-md text-sm"
                >
                  +1
                </Button>
                <Button
                  onClick={() => handleSubtractPoint(2)}
                  className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-md text-sm"
                >
                  -1
                </Button>
              </div>
            </Card>
          </div>
          <Button
            onClick={handleEndMatch}
            className="bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:scale-105"
          >
            Завершить матч
          </Button>
        </div>
      )}

      {currentScreen === "results" && tournamentResults && (
        <div id="results" className="my-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Результаты турнира</h2>
          <div className="bg-white/5 p-6 rounded-xl shadow-lg">
            <PodiumIllustration
              winnerName={tournamentResults.winner}
              secondPlaceName={tournamentResults.second}
              thirdPlaceName={tournamentResults.third}
            />
          </div>
          <Button
            onClick={handleResetTournament}
            className="bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:scale-105 mt-8"
          >
            Новый турнир
          </Button>
        </div>
      )}

      <div id="history" className="bg-white/10 p-6 rounded-xl my-5 text-left">
        <h3 className="text-xl font-semibold mb-4 text-white">Архив матчей</h3>
        <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white/15 border border-white/30 rounded-md px-3 py-2 text-white"
          />
          <Button
            onClick={handleClearMatchHistory}
            className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-md text-sm"
          >
            Очистить историю матчей
          </Button>
        </div>
        <ul id="match-history" className="list-none max-h-[200px] overflow-y-auto pr-2">
          {isLoadingMatchHistory ? (
            <li className="text-white/60 italic text-sm">Загрузка истории матчей...</li>
          ) : filteredMatchHistory.length === 0 ? (
            <li className="text-white/60 italic text-sm">История матчей пуста</li>
          ) : (
            filteredMatchHistory.map((match, index) => (
              <li
                key={match.id || index} // Используем id матча, если доступен
                className="bg-white/15 p-3 my-1 rounded-md border-l-4 border-green-500 text-sm transition-all duration-300 ease-in-out hover:bg-white/20 hover:translate-x-1 hover:border-yellow-400 hover:shadow-md cursor-pointer"
                onMouseEnter={() => {
                  // This is where you'd update the chart for specific match players
                  // For now, we'll just pass the current tournament players to the chart
                  // The original logic for hover-specific chart updates is more complex
                  // and would require passing a specific `updateChart` function from here.
                }}
                onMouseLeave={() => {
                  // Reset chart to default players
                }}
              >
                {formatMatchEntry(match)}
              </li>
            ))
          )}
        </ul>
      </div>

      {/* New Tournament History Section */}

      <div id="stats" className="bg-white/10 p-6 rounded-xl my-5 relative transition-all duration-300 ease-in-out">
        <h3 className="text-xl font-semibold mb-4 text-yellow-400 text-center">Статистика побед</h3>
        <StatsChartSection
          players={getPlayersForChart()}
          playerStats={getPlayerStats(getPlayersForChart())}
          matchHistory={matchHistory}
        />
      </div>

      {/* Tutorial Modal */}
      <TutorialModal isOpen={showTutorialModal} onClose={() => setShowTutorialModal(false)} />
    </div>
  )
}
