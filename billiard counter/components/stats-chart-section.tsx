"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

// Обновленный интерфейс MatchRecord для компонента
interface MatchRecord {
  id: string
  date: string
  title: string
  winner: string
  loser: string
  winnerScore: number
  loserScore: number
}

interface StatsChartSectionProps {
  players: string[]
  playerStats: {
    [key: string]: { wins: number; losses: number; totalMatches: number; winDates: string[] }
  }
  matchHistory: MatchRecord[] // Используем обновленный тип
}

export const StatsChartSection: React.FC<StatsChartSectionProps> = ({ players, playerStats, matchHistory }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstanceRef = useRef<Chart | null>(null)

  const calculateDaysBetween = (date1: string, date2: string) => {
    const d1 = new Date(date1.split(" ")[0])
    const d2 = new Date(date2.split(" ")[0])
    const timeDiff = Math.abs(d2.getTime() - d1.getTime())
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }

  useEffect(() => {
    if (!chartRef.current) return

    const validPlayers = players.filter((player) => player.trim() !== "")
    if (validPlayers.length === 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
        chartInstanceRef.current = null
      }
      return
    }

    const winCounts = validPlayers.map((player) => playerStats[player]?.wins || 0)
    const winDates = validPlayers.map((player) => playerStats[player]?.winDates.join("\n") || "Нет побед")

    const playerDetailedStats = validPlayers.map((player) => {
      const playerData = playerStats[player]
      if (!playerData || !playerData.winDates.length) {
        return null
      }

      const sortedDates = [...playerData.winDates].sort()
      return {
        firstWin: sortedDates[0],
        lastWin: sortedDates[sortedDates.length - 1],
        totalDays: calculateDaysBetween(sortedDates[0], sortedDates[sortedDates.length - 1]),
        winFrequency:
          playerData.wins > 1
            ? Math.round(
                calculateDaysBetween(sortedDates[0], sortedDates[sortedDates.length - 1]) / (playerData.wins - 1),
              )
            : 0,
      }
    })

    // Используем matchHistory для получения всех дат
    const allDates = matchHistory.flatMap((match) => match.date || [])
    let dateRange = ""
    if (allDates.length > 0) {
      const sortedAllDates = [...allDates].sort()
      const firstDate = sortedAllDates[0]
      const lastDate = sortedAllDates[sortedAllDates.length - 1]
      dateRange = firstDate === lastDate ? firstDate : `${firstDate} - ${lastDate}`
    }

    const colors = [
      {
        background: "rgba(54, 162, 235, 0.6)",
        border: "rgba(54, 162, 235, 1)",
        hover: "rgba(54, 162, 235, 0.8)",
      },
      {
        background: "rgba(255, 99, 132, 0.6)",
        border: "rgba(255, 99, 132, 1)",
        hover: "rgba(255, 99, 132, 0.8)",
      },
      {
        background: "rgba(75, 192, 192, 0.6)",
        border: "rgba(75, 192, 192, 1)",
        hover: "rgba(75, 192, 192, 0.8)",
      },
    ]

    const chartData = {
      labels: validPlayers,
      datasets: [
        {
          label: "Победы",
          data: winCounts,
          backgroundColor: validPlayers.map((_, index) => colors[index % colors.length].background),
          borderColor: validPlayers.map((_, index) => colors[index % colors.length].border),
          hoverBackgroundColor: validPlayers.map((_, index) => colors[index % colors.length].hover),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
      winDates: winDates,
      playerDetailedStats: playerDetailedStats,
      dateRange: dateRange,
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: "easeOutBounce",
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: "#ffffff",
              font: {
                size: 12,
                weight: "bold",
              },
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
              lineWidth: 1,
            },
            border: {
              color: "rgba(255, 255, 255, 0.3)",
            },
          },
          x: {
            ticks: {
              color: "#ffffff",
              font: {
                size: 12,
                weight: "bold",
              },
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
              lineWidth: 1,
            },
            border: {
              color: "rgba(255, 255, 255, 0.3)",
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "#ffffff",
              font: {
                size: 14,
                weight: "bold",
              },
              generateLabels: (chart) => {
                const original = Chart.defaults.plugins.legend.labels.generateLabels
                const labels = original.call(this, chart)

                if (chartData.dateRange) {
                  labels[0].text = `${labels[0].text} (${chartData.dateRange})`
                }

                return labels
              },
            },
          },
          title: {
            display: true,
            text: "Статистика побед по датам",
            color: "#ffffff",
            font: {
              size: 16,
              weight: "bold",
            },
            padding: {
              top: 10,
              bottom: 20,
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            borderColor: "rgba(255, 255, 255, 0.3)",
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            titleFont: {
              size: 14,
              weight: "bold",
            },
            bodyFont: {
              size: 12,
            },
            callbacks: {
              title: (context) => {
                const playerName = context[0].label
                const wins = context[0].parsed.y
                return `${playerName} - ${wins} ${wins === 1 ? "победа" : wins < 5 ? "победы" : "побед"}`
              },
              beforeBody: (context) => {
                const index = context[0].dataIndex
                const playerStats = chartData.playerDetailedStats[index]
                if (playerStats && playerStats.firstWin && playerStats.lastWin) {
                  return `⏰ Период: ${playerStats.firstWin} - ${playerStats.lastWin}`
                }
                return ""
              },
              afterBody: (context) => {
                const index = context[0].dataIndex
                const dates = chartData.winDates[index]
                if (dates === "Нет побед") {
                  return "\n📅 Побед пока нет"
                }
                const dateList = dates.split("\n")
                const recentDates = dateList.slice(-5) // Show last 5 wins
                const moreCount = dateList.length - recentDates.length

                let result = "\n📅 Последние победы:"
                recentDates.forEach((date) => {
                  result += `\n• ${date}`
                })

                if (moreCount > 0) {
                  result += `\n... и еще ${moreCount} ${moreCount === 1 ? "победа" : moreCount < 5 ? "победы" : "побед"}`
                }

                return result
              },
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    })

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
        chartInstanceRef.current = null
      }
    }
  }, [players, playerStats, matchHistory])

  return (
    <div className="relative w-full h-[250px]">
      <canvas ref={chartRef} className="w-full h-full rounded-lg bg-white/5 p-2"></canvas>
    </div>
  )
}
