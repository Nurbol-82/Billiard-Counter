import { DateUtils } from '../utils/dateUtils.js';

/**
 * Match history management class
 * Handles display and filtering of match history
 */
export class MatchHistory {
    constructor(storageManager, statsChart) {
        this.storageManager = storageManager;
        this.statsChart = statsChart;
        this.historyElement = document.getElementById('match-history');
        this.dateFilterElement = document.getElementById('date-filter');
        this.clearButtonElement = document.getElementById('clear-history');
        
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for history controls
     */
    initializeEventListeners() {
        this.dateFilterElement.addEventListener('change', () => {
            this.filterByDate();
        });

        this.clearButtonElement.addEventListener('click', () => {
            this.clearHistory();
        });

        // Handle mouse events for chart updates
        this.historyElement.addEventListener('mouseover', (e) => {
            const matchEntry = e.target.closest('.match-entry');
            if (matchEntry) {
                this.updateChartForMatch(matchEntry);
            }
        });

        this.historyElement.addEventListener('mouseout', (e) => {
            if (!e.relatedTarget || !e.relatedTarget.closest('#match-history')) {
                this.resetChartToDefault();
            }
        });
    }

    /**
     * Display match history
     * @param {Array} matches - Optional filtered matches array
     */
    display(matches = null) {
        const matchesToShow = matches || this.storageManager.getMatchHistory();
        
        this.historyElement.innerHTML = '';
        
        if (matchesToShow.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'История матчей пуста';
            emptyMessage.style.fontStyle = 'italic';
            emptyMessage.style.color = 'rgba(255, 255, 255, 0.6)';
            this.historyElement.appendChild(emptyMessage);
            return;
        }

        // Sort matches by date (newest first)
        const sortedMatches = [...matchesToShow].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        sortedMatches.forEach(match => {
            if (match.date) {
                const li = document.createElement('li');
                li.dataset.matchData = JSON.stringify(match);
                li.innerHTML = this.formatMatchEntry(match);
                this.historyElement.appendChild(li);
            }
        });
    }

    /**
     * Format a single match entry for display
     * @param {Object} match - Match object
     * @returns {string} Formatted HTML string
     */
    formatMatchEntry(match) {
        const winnerClass = match.score1 > match.score2 ? 'winner' : '';
        const loserClass = match.score1 < match.score2 ? 'winner' : '';
        
        return `
            <div class="match-entry">
                <div class="match-date">${match.date}</div>
                <div class="match-title">${match.title}</div>
                <div class="match-players">
                    <span class="${winnerClass}">${match.player1} (${match.score1})</span>
                    <span class="vs-small">vs</span>
                    <span class="${loserClass}">${match.player2} (${match.score2})</span>
                </div>
            </div>
        `;
    }

    /**
     * Filter matches by selected date
     */
    filterByDate() {
        const selectedDate = this.dateFilterElement.value;
        
        if (!selectedDate) {
            this.display();
            return;
        }

        const allMatches = this.storageManager.getMatchHistory();
        const filteredMatches = allMatches.filter(match => 
            DateUtils.matchesDateFilter(match.date, selectedDate)
        );
        
        this.display(filteredMatches);
    }

    /**
     * Clear all match history with confirmation
     */
    clearHistory() {
        if (confirm('Вы уверены, что хотите очистить историю матчей?')) {
            this.storageManager.clearHistory();
            this.display();
            this.dateFilterElement.value = '';
            
            // Trigger custom event for other components to update
            document.dispatchEvent(new CustomEvent('historyCleared'));
        }
    }

    /**
     * Refresh the display (useful after new matches are added)
     */
    refresh() {
        // Clear date filter and show all matches
        this.dateFilterElement.value = '';
        this.display();
    }

    /**
     * Update chart to show statistics for specific match players
     * @param {Element} matchEntry - Match entry element
     */
    updateChartForMatch(matchEntry) {
        const matchData = JSON.parse(matchEntry.closest('li').dataset.matchData);
        const matchPlayers = [matchData.player1, matchData.player2];
        
        // Update chart with match players
        this.statsChart.updateChart(matchPlayers, `Статистика для матча: ${matchData.title}`);
    }

    /**
     * Reset chart to show default tournament players
     */
    resetChartToDefault() {
        // Get current tournament players if available
        const currentPlayers = this.getCurrentTournamentPlayers();
        this.statsChart.updateChart(currentPlayers);
    }

    /**
     * Get current tournament players from UI
     * @returns {Array<string>} Current tournament player names
     */
    getCurrentTournamentPlayers() {
        // Try to get players from setup inputs
        const player1Input = document.getElementById('player1');
        const player2Input = document.getElementById('player2');
        const player3Input = document.getElementById('player3');
        
        if (player1Input && player2Input && player3Input) {
            const players = [
                player1Input.value.trim() || 'Игрок 1',
                player2Input.value.trim() || 'Игрок 2',
                player3Input.value.trim() || 'Игрок 3'
            ];
            return players.filter(player => player);
        }
        
        return [];
    }

    /**
     * Get statistics for specified players
     * @param {Array<string>} players - Player names to get stats for
     * @returns {Object} Win statistics for each player
     */
    getPlayerStats(players) {
        const allMatches = this.storageManager.getMatchHistory();
        const stats = {};
        
        // Initialize stats for specified players
        players.forEach(player => {
            if (player) {
                stats[player] = {
                    wins: 0,
                    losses: 0,
                    totalMatches: 0,
                    winDates: []
                };
            }
        });

        // Calculate stats from matches involving specified players
        allMatches.forEach(match => {
            if (match.player1 && match.player2 && 
                match.score1 !== undefined && match.score2 !== undefined) {
                
                const player1InList = players.includes(match.player1);
                const player2InList = players.includes(match.player2);
                
                if (player1InList || player2InList) {
                    const winner = match.score1 > match.score2 ? match.player1 : match.player2;
                    const loser = match.score1 > match.score2 ? match.player2 : match.player1;
                    
                    if (stats[winner]) {
                        stats[winner].wins++;
                        stats[winner].totalMatches++;
                        if (match.date) {
                            stats[winner].winDates.push(match.date);
                        }
                    }
                    
                    if (stats[loser]) {
                        stats[loser].losses++;
                        stats[loser].totalMatches++;
                    }
                }
            }
        });
        return stats;
    }
}
