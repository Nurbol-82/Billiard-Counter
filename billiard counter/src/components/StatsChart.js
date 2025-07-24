import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Statistics chart management class
 * Handles creation and updating of win statistics charts
 */
export class StatsChart {
    constructor(matchHistory) {
        this.matchHistory = matchHistory;
        this.chartElement = document.getElementById('win-chart');
        this.chartInstance = null;
        
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Listen for history cleared events
        document.addEventListener('historyCleared', () => {
            this.updateChart([]);
        });
    }

    /**
     * Update chart with current player statistics
     * @param {Array<string>} currentPlayers - Current tournament players
     * @param {string} customTitle - Optional custom title for the chart
     */
    updateChart(currentPlayers, customTitle = null) {
        if (!currentPlayers || currentPlayers.length === 0) {
            this.destroyChart();
            return;
        }

        const stats = this.matchHistory.getPlayerStats(currentPlayers);
        const chartData = this.prepareChartData(currentPlayers, stats, customTitle);
        
        this.createChart(chartData);
    }

    /**
     * Prepare data for chart visualization
     * @param {Array<string>} players - Player names
     * @param {Object} stats - Player statistics
     * @param {string} customTitle - Optional custom title
     * @returns {Object} Chart data configuration
     */
    prepareChartData(players, stats, customTitle = null) {
        const validPlayers = players.filter(player => player);
        const winCounts = validPlayers.map(player => stats[player]?.wins || 0);
        const winDates = validPlayers.map(player => 
            stats[player]?.winDates.join('\n') || 'Нет побед'
        );

        // Calculate date ranges and additional stats
        const playerStats = validPlayers.map(player => {
            const playerData = stats[player];
            if (!playerData || !playerData.winDates.length) {
                return null;
            }
            
            const sortedDates = [...playerData.winDates].sort();
            return {
                firstWin: sortedDates[0],
                lastWin: sortedDates[sortedDates.length - 1],
                totalDays: this.calculateDaysBetween(sortedDates[0], sortedDates[sortedDates.length - 1]),
                winFrequency: playerData.wins > 1 ? 
                    Math.round(this.calculateDaysBetween(sortedDates[0], sortedDates[sortedDates.length - 1]) / (playerData.wins - 1)) : 0
            };
        });

        // Calculate overall date range for legend
        const allDates = validPlayers.flatMap(player => stats[player]?.winDates || []);
        let dateRange = '';
        if (allDates.length > 0) {
            const sortedAllDates = [...allDates].sort();
            const firstDate = sortedAllDates[0];
            const lastDate = sortedAllDates[sortedAllDates.length - 1];
            dateRange = firstDate === lastDate ? firstDate : `${firstDate} - ${lastDate}`;
        }

        // Color scheme for players
        const colors = [
            {
                background: 'rgba(54, 162, 235, 0.6)',
                border: 'rgba(54, 162, 235, 1)',
                hover: 'rgba(54, 162, 235, 0.8)'
            },
            {
                background: 'rgba(255, 99, 132, 0.6)',
                border: 'rgba(255, 99, 132, 1)',
                hover: 'rgba(255, 99, 132, 0.8)'
            },
            {
                background: 'rgba(75, 192, 192, 0.6)',
                border: 'rgba(75, 192, 192, 1)',
                hover: 'rgba(75, 192, 192, 0.8)'
            }
        ];

        return {
            labels: validPlayers,
            datasets: [{
                label: 'Победы',
                data: winCounts,
                backgroundColor: validPlayers.map((_, index) => colors[index % colors.length].background),
                borderColor: validPlayers.map((_, index) => colors[index % colors.length].border),
                hoverBackgroundColor: validPlayers.map((_, index) => colors[index % colors.length].hover),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }],
            winDates: winDates,
            playerStats: playerStats,
            dateRange: dateRange,
            customTitle: customTitle
        };
    }

    /**
     * Create or update the chart
     * @param {Object} chartData - Prepared chart data
     */
    createChart(chartData) {
        // Destroy existing chart
        this.destroyChart();

        const ctx = this.chartElement.getContext('2d');
        
        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: chartData.datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeOutBounce'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: '#ffffff',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            lineWidth: 1
                        },
                        border: {
                            color: 'rgba(255, 255, 255, 0.3)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#ffffff',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            lineWidth: 1
                        },
                        border: {
                            color: 'rgba(255, 255, 255, 0.3)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#ffffff',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            generateLabels: (chart) => {
                                const original = Chart.defaults.plugins.legend.labels.generateLabels;
                                const labels = original.call(this, chart);
                                
                                // Add date range information to legend
                                if (chartData.dateRange) {
                                    labels[0].text = `${labels[0].text} (${chartData.dateRange})`;
                                }
                                
                                return labels;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: chartData.customTitle || 'Статистика побед по датам',
                        color: '#ffffff',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 12
                        },
                        callbacks: {
                            title: (context) => {
                                const playerName = context[0].label;
                                const wins = context[0].parsed.y;
                                return `${playerName} - ${wins} ${wins === 1 ? 'победа' : wins < 5 ? 'победы' : 'побед'}`;
                            },
                            beforeBody: (context) => {
                                const index = context[0].dataIndex;
                                const playerStats = chartData.playerStats[index];
                                if (playerStats && playerStats.firstWin && playerStats.lastWin) {
                                    return `⏰ Период: ${playerStats.firstWin} - ${playerStats.lastWin}`;
                                }
                                return '';
                            },
                            afterBody: (context) => {
                                const index = context[0].dataIndex;
                                const dates = chartData.winDates[index];
                                if (dates === 'Нет побед') {
                                    return '\n📅 Побед пока нет';
                                }
                                const dateList = dates.split('\n');
                                const recentDates = dateList.slice(-5); // Show last 5 wins
                                const moreCount = dateList.length - recentDates.length;
                                
                                let result = '\n📅 Последние победы:';
                                recentDates.forEach(date => {
                                    result += `\n• ${date}`;
                                });
                                
                                if (moreCount > 0) {
                                    result += `\n... и еще ${moreCount} ${moreCount === 1 ? 'победа' : moreCount < 5 ? 'победы' : 'побед'}`;
                                }
                                
                                return result;
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    /**
     * Destroy existing chart instance
     */
    destroyChart() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
    }

    /**
     * Refresh chart with current data
     * @param {Array<string>} currentPlayers - Current tournament players
     */
    refresh(currentPlayers) {
        this.updateChart(currentPlayers);
    }

    /**
     * Calculate days between two date strings
     * @param {string} date1 - First date string
     * @param {string} date2 - Second date string
     * @returns {number} Number of days between dates
     */
    calculateDaysBetween(date1, date2) {
        const d1 = new Date(date1.split(' ')[0]); // Extract date part only
        const d2 = new Date(date2.split(' ')[0]);
        const timeDiff = Math.abs(d2.getTime() - d1.getTime());
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
}
