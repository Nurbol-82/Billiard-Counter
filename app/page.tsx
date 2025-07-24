"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Tournament } from "@/lib/tournament"
import { DateUtils } from "@/lib/date-utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

import { StatsChart } from "@/components/stats-chart"
import { PodiumIllustration } from "@/components/podium-illustration"
import { TutorialModal } from "@/components/tutorial-modal"

type Screen = "setup" | "match" | "results"

interface MatchRecord {
  id: string
  date: string
  title: string
  winner: string
  loser: string
  winnerScore: number
  loserScore: number
}

export default function Home() {
  const tournamentRef = useRef(new Tournament())

  const [playerNames, setPlayerNames] = useState<string[]>(["Игрок 1", "Игрок 2", "Игрок 3"])
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
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([])
  const [dateFilter, setDateFilter] = useState<string>("")
  const [showTutorialModal, setShowTutorialModal] = useState(false)

  // Load match history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('billiards_match_history')
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory)
        setMatchHistory(parsedHistory.map((match: any, index: number) => ({
          ...match,
          id: match.id || `match-${index}-${Date.now()}`
        })))
      } catch (error) {
        console.error('Error loading match history:', error)
      }
    }
  }, [])

  // Save match history to localStorage whenever it changes
  const saveMatchHistory = useCallback((history: MatchRecord[]) => {
    try {
      localStorage.setItem('billiards_match_history', JSON.stringify(history))
    } catch (error) {
      console.error('Error saving match history:', error)
    }
  }, [])

  const addMatchToHistory = useCallback((matchRecord: any) => {
    const newMatch: MatchRecord = {
      id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...matchRecord
    }
    const updatedHistory = [newMatch, ...matchHistory]
    setMatchHistory(updatedHistory)
    saveMatchHistory(updatedHistory)
  }, [matchHistory, saveMatchHistory])

  const getPlayersForChart = useCallback(() => {
    if (currentScreen === "setup" || currentScreen === "results") {
      return playerNames.filter((name) => name.trim() !== "")
    }
    if (currentMatchInfo) {
      return [currentMatchInfo.player1, currentMatchInfo.player2].filter((name) => name.trim() !== "")
    }
    return []
  }, [currentScreen, playerNames, currentMatchInfo])

  const handleStartTournament = useCallback(() => {
    try {
      const trimmedPlayerNames = playerNames.map((name) => name.trim())
      const matchInfo = tournamentRef.current.startTournament(trimmedPlayerNames)
      setCurrentMatchInfo(matchInfo)
      setScores(matchInfo.scores)
      setCurrentScreen("match")
    } catch (error: any) {
      alert(error.message)
    }
  }, [playerNames])

  const handleAddPoint = useCallback((playerNumber: 1 | 2) => {
    tournamentRef.current.addPoint(playerNumber)
    setScores(tournamentRef.current.getScores())
  }, [])

  const handleSubtractPoint = useCallback((playerNumber: 1 | 2) => {
    tournamentRef.current.subtractPoint(playerNumber)
    setScores(tournamentRef.current.getScores())
  }, [])

  const handleEndMatch = useCallback(() => {
    try {
      const result = tournamentRef.current.endMatch()
      addMatchToHistory(result.matchRecord)

      if (result.completed) {
        setTournamentResults(result.results)
        setCurrentScreen("results")
      } else {
        setCurrentMatchInfo(result.nextMatch)
        setScores(result.nextMatch.scores)
        setCurrentScreen("match")
      }
    } catch (error: any) {
      alert(error.message)
    }
  }, [addMatchToHistory])

  const handleResetTournament = useCallback(() => {
    tournamentRef.current.reset()
    setScores([0, 0])
    setCurrentMatchInfo(null)
    setTournamentResults(null)
    setCurrentScreen("setup")
    setDateFilter("")
  }, [])

  const handleClearMatchHistory = useCallback(() => {
    if (confirm("Вы уверены, что хотите очистить историю матчей?")) {
      setMatchHistory([])
      saveMatchHistory([])
      setDateFilter("")
    }
  }, [saveMatchHistory])

  const filteredMatchHistory = matchHistory.filter((match) =>
    dateFilter ? DateUtils.matchesDateFilter(match.date, dateFilter) : true
  )

  const formatMatchEntry = (match: MatchRecord) => {
    const winnerClass = "text-yellow-400 font-semibold"
    
    return (
      <div className="flex flex-col gap-1">
        <div className="text-xs text-white/80 font-medium opacity-80">{match.date}</div>
        <div className="font-semibold text-green-500 text-sm">{match.title}</div>
        <div className="flex items-center gap-2 text-sm">
          <span className={winnerClass}>
            {match.winner} ({match.winnerScore})
          </span>
          <span className="text-white/70 text-xs opacity-70">vs</span>
          <span>
            {match.loser} ({match.loserScore})
          </span>
        </div>
      </div>
    )
  }

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
              onClick={() => setShowTutorialModal(true)}
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
            Очистить историю
          </Button>
        </div>
        <ul id="match-history" className="list-none max-h-[200px] overflow-y-auto pr-2">
          {filteredMatchHistory.length === 0 ? (
            <li className="text-white/60 italic text-sm">История матчей пуста</li>
          ) : (
            filteredMatchHistory.map((match) => (
              <li
                key={match.id}
                className="bg-white/15 p-3 my-1 rounded-md border-l-4 border-green-500 text-sm transition-all duration-300 ease-in-out hover:bg-white/20 hover:translate-x-1 hover:border-yellow-400 hover:shadow-md cursor-pointer"
              >
                {formatMatchEntry(match)}
              </li>
            ))
          )}
        </ul>
      </div>

      <div id="stats" className="bg-white/10 p-6 rounded-xl my-5 relative transition-all duration-300 ease-in-out">
        <h3 className="text-xl font-semibold mb-4 text-yellow-400 text-center">Статистика побед</h3>
        <StatsChart
          players={getPlayersForChart()}
          matchHistory={matchHistory}
        />
      </div>

      <TutorialModal isOpen={showTutorialModal} onClose={() => setShowTutorialModal(false)} />
    </div>
  )
}
