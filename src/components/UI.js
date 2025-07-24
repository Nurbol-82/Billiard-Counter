/**
 * User Interface management class
 * Handles all UI interactions and state management
 */
export class UI {
    constructor(tournament, matchHistory, statsChart) {
        this.tournament = tournament;
        this.matchHistory = matchHistory;
        this.statsChart = statsChart;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.showSetupScreen();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        // Screens
        this.setupScreen = document.getElementById('setup');
        this.matchScreen = document.getElementById('match');
        this.resultsScreen = document.getElementById('results');

        // Setup elements
        this.player1Input = document.getElementById('player1');
        this.player2Input = document.getElementById('player2');
        this.player3Input = document.getElementById('player3');
        this.startButton = document.getElementById('start-tournament');

        // Match elements
        this.matchTitle = document.getElementById('match-title');
        this.player1Name = document.getElementById('player1-name');
        this.player2Name = document.getElementById('player2-name');
        this.score1 = document.getElementById('score1');
        this.score2 = document.getElementById('score2');
        this.endMatchButton = document.getElementById('end-match');

        // Results elements
        this.winnerElement = document.getElementById('winner');
        this.secondPlaceElement = document.getElementById('second-place');
        this.thirdPlaceElement = document.getElementById('third-place');
        this.resetButton = document.getElementById('reset-tournament');

        // Score buttons
        this.scoreButtons = document.querySelectorAll('.score-btn');
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Start tournament
        this.startButton.addEventListener('click', () => {
            this.startTournament();
        });

        // Enter key to start tournament
        [this.player1Input, this.player2Input, this.player3Input].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.startTournament();
                }
            });
        });

        // Score buttons
        this.scoreButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const player = parseInt(e.target.dataset.player);
                const action = e.target.dataset.action;
                
                if (action === 'add') {
                    this.tournament.addPoint(player);
                } else if (action === 'subtract') {
                    this.tournament.subtractPoint(player);
                }
                
                this.updateScoreDisplay();
            });
        });

        // End match
        this.endMatchButton.addEventListener('click', () => {
            this.endMatch();
        });

        // Reset tournament
        this.resetButton.addEventListener('click', () => {
            this.resetTournament();
        });
    }

    /**
     * Start tournament with validation
     */
    startTournament() {
        const playerNames = [
            this.player1Input.value.trim() || 'Игрок 1',
            this.player2Input.value.trim() || 'Игрок 2',
            this.player3Input.value.trim() || 'Игрок 3'
        ];

        try {
            const matchInfo = this.tournament.startTournament(playerNames);
            this.showMatchScreen(matchInfo);
            this.matchHistory.refresh();
            this.statsChart.updateChart(this.tournament.getPlayers());
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * End current match and handle progression
     */
    endMatch() {
        try {
            const result = this.tournament.endMatch();
            
            if (result.completed) {
                this.showResults(result.results);
            } else {
                this.showMatchScreen(result.nextMatch);
            }
            
            // Update history and stats
            this.matchHistory.refresh();
            this.statsChart.updateChart(this.tournament.getPlayers());
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Reset tournament to initial state
     */
    resetTournament() {
        this.tournament.reset();
        this.showSetupScreen();
        this.matchHistory.refresh();
        this.statsChart.updateChart([]);
        
        // Reset input values
        this.player1Input.value = 'Игрок 1';
        this.player2Input.value = 'Игрок 2';
        this.player3Input.value = 'Игрок 3';
    }

    /**
     * Show setup screen
     */
    showSetupScreen() {
        this.hideAllScreens();
        this.setupScreen.classList.remove('hidden');
        this.player1Input.focus();
    }

    /**
     * Show match screen with match information
     * @param {Object} matchInfo - Current match information
     */
    showMatchScreen(matchInfo) {
        this.hideAllScreens();
        this.matchScreen.classList.remove('hidden');
        
        this.matchTitle.textContent = matchInfo.title;
        this.player1Name.textContent = matchInfo.player1;
        this.player2Name.textContent = matchInfo.player2;
        
        this.updateScoreDisplay();
    }

    /**
     * Show results screen with tournament results
     * @param {Object} results - Tournament results
     */
    showResults(results) {
        this.hideAllScreens();
        this.resultsScreen.classList.remove('hidden');
        
        this.winnerElement.textContent = results.winner;
        this.secondPlaceElement.textContent = results.second;
        this.thirdPlaceElement.textContent = results.third;
    }

    /**
     * Hide all screens
     */
    hideAllScreens() {
        this.setupScreen.classList.add('hidden');
        this.matchScreen.classList.add('hidden');
        this.resultsScreen.classList.add('hidden');
    }

    /**
     * Update score display
     */
    updateScoreDisplay() {
        const scores = this.tournament.getScores();
        this.score1.textContent = scores[0];
        this.score2.textContent = scores[1];
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        alert(message);
    }

    /**
     * Initialize the application
     */
    initialize() {
        // Migrate any existing history
        this.tournament.storageManager.migrateHistory();
        
        // Display initial history and stats
        this.matchHistory.display();
        this.statsChart.updateChart([]);
    }
}
